import "server-only";
import { randomUUID } from "node:crypto";
import { COLLECTIONS } from "@/config/ring-store";
import { GUIDES } from "@/content/guides";
import { and, eq, inArray, desc, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  salesWorkspace,
  salesWorkspaceAudit,
  salesSearchGaps,
  products,
  variants,
  categories,
} from "@/db/schema";
import {
  DeleteEnquiryRecordsSchema,
  deleteLinkedEnquiry,
  workspaceChangeSummary,
  type SalesWorkspace,
  type SalesAuditEntry,
} from "./sales-workspace";
import {
  SearchGapIntentSchema,
  MAX_WORKSPACE_BYTES,
  SalesWorkspaceSchema,
  SaveSalesWorkspaceInputSchema,
  hasFutureActualDates,
  emptySalesWorkspace,
  publicCampaignProjection,
  type SalesWorkspaceSnapshot,
  type SaveSalesWorkspaceResult,
} from "./sales-workspace";

function errorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined;
  const entry = error as { code?: string; cause?: unknown };
  return (
    entry.code ?? (entry.cause === error ? undefined : errorCode(entry.cause))
  );
}
export const workspaceMigrationMissing = (error: unknown): boolean =>
  errorCode(error) === "ER_NO_SUCH_TABLE";

export async function readSalesWorkspace(): Promise<SalesWorkspaceSnapshot> {
  try {
    const [row] = await db
      .select()
      .from(salesWorkspace)
      .where(eq(salesWorkspace.id, 1))
      .limit(1);
    if (!row)
      return {
        workspace: emptySalesWorkspace(),
        revision: 0,
        migrationRequired: false,
      };
    return {
      workspace: SalesWorkspaceSchema.parse(row.payload),
      revision: row.revision,
      migrationRequired: false,
    };
  } catch (error) {
    if (workspaceMigrationMissing(error))
      return {
        workspace: emptySalesWorkspace(),
        revision: 0,
        migrationRequired: true,
      };
    throw error;
  }
}

export async function saveSalesWorkspace(
  input: unknown,
  options: {
    actorUserId?: number;
    kind?: "save" | "undo" | "delete";
    purgeAudit?: boolean;
    allowAcceptedDeletion?: boolean;
  } = {}
): Promise<SaveSalesWorkspaceResult> {
  let encoded: string;
  try {
    encoded = JSON.stringify(input);
  } catch {
    return { ok: false, code: "invalid", error: "Datos inválidos" };
  }
  if (!encoded || Buffer.byteLength(encoded, "utf8") > MAX_WORKSPACE_BYTES)
    return {
      ok: false,
      code: "invalid",
      error: "El espacio excede el tamaño permitido",
    };
  const parsed = SaveSalesWorkspaceInputSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      code: "invalid",
      error: parsed.error.issues[0]?.message ?? "Revisá los datos",
    };
  const { revision, workspace } = parsed.data;
  try {
    const previous = await readSalesWorkspace();
    if (previous.migrationRequired)
      return {
        ok: false,
        code: "migration_required",
        error: "Falta aplicar la migración del espacio de ventas.",
      };
    if (previous.revision !== revision)
      return {
        ok: false,
        code: "conflict",
        error: "Otro dispositivo guardó cambios. Recargá antes de editar.",
      };
    for (const old of previous.workspace.quoteRevisions.filter(
      (r) => r.status === "accepted"
    )) {
      const incoming = workspace.quoteRevisions.find((r) => r.id === old.id);
      if (
        (!incoming && !options.allowAcceptedDeletion) ||
        (incoming && JSON.stringify(incoming) !== JSON.stringify(old))
      )
        return {
          ok: false,
          code: "invalid",
          error: "La evidencia aceptada es inmutable. Creá una nueva revisión.",
        };
    }
    for (const quote of workspace.customerQuotations) {
      // An undo payload is a trusted, previously validated database snapshot.
      // Repricing it from today's services would change the historical quote.
      if (options.kind === "undo" && quote.status === "review_ready") continue;
      if (quote.status !== "review_ready") {
        quote.servicesSnapshot = [];
        continue;
      }
      const old = previous.workspace.customerQuotations.find(
        (r) => r.id === quote.id && r.status === "review_ready"
      );
      if (old) {
        quote.servicesSnapshot = old.servicesSnapshot;
        quote.serviceOptionIds = old.serviceOptionIds;
      } else {
        quote.servicesSnapshot = quote.serviceOptionIds.flatMap((key) => {
          const service = workspace.serviceOptions.find(
            (s) => s.id === key && s.enabled
          );
          return service
            ? [
                {
                  id: service.id,
                  name: service.name,
                  terms: service.terms,
                  pricePyg: service.pricePyg,
                  confirmedOn: service.confirmedOn,
                },
              ]
            : [];
        });
      }
    }
    const autoRevisionIds = new Set<string>();
    const recordedOn = new Intl.DateTimeFormat("sv-SE", {
      timeZone: "America/Asuncion",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    for (const oldQuote of previous.workspace.customerQuotations) {
      const incoming = workspace.customerQuotations.find(
        (r) => r.id === oldQuote.id
      );
      if (!incoming || JSON.stringify(incoming) === JSON.stringify(oldQuote))
        continue;
      if (workspace.quoteRevisions.length >= 100)
        return {
          ok: false,
          code: "invalid",
          error:
            "El historial llegó a cien revisiones. Exportá y revisá su conservación antes de modificar otra cotización.",
        };
      const revisionNumber =
        1 +
        Math.max(
          0,
          ...previous.workspace.quoteRevisions
            .filter((r) => r.quotationId === oldQuote.id)
            .map((r) => r.revisionNumber),
          ...workspace.quoteRevisions
            .filter((r) => r.quotationId === oldQuote.id)
            .map((r) => r.revisionNumber)
        );
      if (revisionNumber > 1000)
        return {
          ok: false,
          code: "invalid",
          error: "La cotización alcanzó su límite de revisiones.",
        };
      const id = `auto_${randomUUID()}`;
      autoRevisionIds.add(id);
      workspace.quoteRevisions.push({
        id,
        quotationId: oldQuote.id,
        revisionNumber,
        createdOn: recordedOn,
        reason:
          "Copia anterior conservada automáticamente al modificar la cotización",
        status: oldQuote.status === "review_ready" ? "review_ready" : "draft",
        snapshot: structuredClone(oldQuote),
        acceptedOn: null,
        acceptanceEvidence: null,
      });
    }
    for (const record of workspace.quoteRevisions) {
      if (autoRevisionIds.has(record.id)) continue;
      const old = previous.workspace.quoteRevisions.find(
        (r) => r.id === record.id
      );
      if (old) {
        if (
          old.quotationId !== record.quotationId ||
          old.revisionNumber !== record.revisionNumber ||
          old.createdOn !== record.createdOn
        )
          return {
            ok: false,
            code: "invalid",
            error: "La identidad de una revisión no puede cambiar.",
          };
        record.snapshot = old.snapshot;
      } else {
        const quote = workspace.customerQuotations.find(
          (r) => r.id === record.quotationId
        );
        if (quote) record.snapshot = structuredClone(quote);
      }
    }
    const validated = SalesWorkspaceSchema.safeParse(workspace);
    if (!validated.success)
      return {
        ok: false,
        code: "invalid",
        error: validated.error.issues[0]?.message ?? "Revisá los datos",
      };
    if (
      Buffer.byteLength(JSON.stringify({ revision, workspace }), "utf8") >
      MAX_WORKSPACE_BYTES
    )
      return {
        ok: false,
        code: "invalid",
        error:
          "El espacio con sus copias de cotización excede el tamaño permitido.",
      };
    await validateReferences(workspace);
    await db.transaction(async (tx) => {
      if (revision === 0)
        await tx.insert(salesWorkspace).values({
          id: 1,
          revision: 1,
          payload: workspace,
          updatedAt: new Date(),
        });
      else {
        const [result] = await tx
          .update(salesWorkspace)
          .set({
            payload: workspace,
            revision: revision + 1,
            updatedAt: new Date(),
          })
          .where(
            and(eq(salesWorkspace.id, 1), eq(salesWorkspace.revision, revision))
          );
        if (result.affectedRows !== 1) throw new Error("workspace_conflict");
      }
      if (options.purgeAudit) await tx.delete(salesWorkspaceAudit);
      else if (options.kind === "delete")
        await tx
          .update(salesWorkspaceAudit)
          .set({ beforePayload: null, afterPayload: null });
      const noRecoveryPayload = options.purgeAudit || options.kind === "delete";
      await tx.insert(salesWorkspaceAudit).values({
        revision: revision + 1,
        actorUserId: options.actorUserId ?? null,
        kind: options.kind ?? "save",
        changes: options.purgeAudit
          ? []
          : workspaceChangeSummary(previous.workspace, workspace),
        beforePayload: noRecoveryPayload ? null : previous.workspace,
        afterPayload: noRecoveryPayload ? null : workspace,
      });
      // Keep thirty recent recovery points; old state does not grow without bound.
      await tx
        .delete(salesWorkspaceAudit)
        .where(lt(salesWorkspaceAudit.revision, revision + 1 - 29));
    });
    return {
      ok: true,
      revision: revision + 1,
      snapshot: { workspace, revision: revision + 1, migrationRequired: false },
    };
  } catch (error) {
    if (
      errorCode(error) === "ER_DUP_ENTRY" ||
      (error instanceof Error && error.message === "workspace_conflict")
    )
      return {
        ok: false,
        code: "conflict",
        error: "Otro dispositivo guardó cambios. Recargá antes de editar.",
      };
    if (error instanceof Error && error.message === "invalid_confirmation_date")
      return {
        ok: false,
        code: "invalid",
        error: "Una confirmación o venta real no puede tener fecha futura.",
      };
    if (error instanceof Error && error.message === "invalid_reference")
      return {
        ok: false,
        code: "invalid",
        error: "Una referencia no existe, no coincide o no puede publicarse.",
      };
    if (workspaceMigrationMissing(error))
      return {
        ok: false,
        code: "migration_required",
        error: "Falta aplicar la migración del espacio de ventas.",
      };
    return {
      ok: false,
      code: "unavailable",
      error: "No se pudo guardar el espacio de ventas.",
    };
  }
}

/** Projection is explicit: no aliases, costs, cases, or private IDs cross this boundary. */
export async function readPublicCampaign(slug: string) {
  const snapshot = await readSalesWorkspace();
  const campaign = snapshot.workspace.campaigns.find(
    (entry) => entry.slug === slug
  );
  return campaign ? publicCampaignProjection(campaign) : null;
}

async function validateReferences(
  workspace: import("./sales-workspace").SalesWorkspace
): Promise<void> {
  const ids = [
    ...new Set(
      [
        ...workspace.supplierQuotations.map((r) => r.productId),
        ...workspace.customerQuotations.flatMap((r) =>
          r.lines.map((l) => l.productId)
        ),
        ...workspace.productCostProfiles.map((r) => r.productId),
        ...workspace.fulfilledSales.map((r) => r.productId),
      ].filter((id): id is number => id !== null)
    ),
  ];
  const lines = workspace.customerQuotations.flatMap((r) => r.lines);
  const slugs = [
    ...new Set([
      ...lines.map((r) => r.productSlug),
      ...workspace.campaigns.flatMap((r) => r.productSlugs),
      ...workspace.productFaqs.map((r) => r.productSlug),
    ]),
  ];
  const byId = ids.length
    ? await db
        .select({
          id: products.id,
          slug: products.slug,
          specifications: products.specifications,
        })
        .from(products)
        .where(inArray(products.id, ids))
    : [];
  const bySlug = slugs.length
    ? await db
        .select({
          id: products.id,
          slug: products.slug,
          specifications: products.specifications,
          isActive: products.isActive,
          categoryActive: categories.isActive,
          publishedAt: products.publishedAt,
        })
        .from(products)
        .innerJoin(categories, eq(categories.id, products.categoryId))
        .where(inArray(products.slug, slugs))
    : [];
  const faqProductIds = bySlug
    .filter((p) =>
      workspace.productFaqs.some((f) => f.productSlug === p.slug && f.published)
    )
    .map((p) => p.id);
  const activeFaqVariants = faqProductIds.length
    ? await db
        .select({ productId: variants.productId })
        .from(variants)
        .where(
          and(
            inArray(variants.productId, faqProductIds),
            eq(variants.isActive, true)
          )
        )
    : [];
  if (
    ids.some(
      (id) => !byId.some((p) => p.id === id && !p.slug.startsWith("concepto-"))
    )
  )
    throw new Error("invalid_reference");
  if (
    lines.some(
      (line) =>
        !bySlug.some(
          (p) =>
            p.slug === line.productSlug &&
            (line.productId === null || p.id === line.productId)
        )
    )
  )
    throw new Error("invalid_reference");
  if (
    workspace.productFaqs.some(
      (faq) =>
        !bySlug.some(
          (p) =>
            p.slug === faq.productSlug &&
            !p.slug.startsWith("concepto-") &&
            (!faq.published ||
              (p.isActive &&
                p.categoryActive &&
                p.publishedAt &&
                p.publishedAt <= new Date() &&
                activeFaqVariants.some((v) => v.productId === p.id)))
        )
    )
  )
    throw new Error("invalid_reference");
  if (
    workspace.productCostProfiles.some((profile) => {
      const spec = byId.find((p) => p.id === profile.productId)?.specifications;
      return (
        spec?.unit !== undefined &&
        (spec.unit === "individual" ? "single" : spec.unit) !== profile.unit
      );
    })
  )
    throw new Error("invalid_reference");
  const mismatchesUnit = (
    productId: number | null,
    unit: "single" | "pair"
  ) => {
    const spec = byId.find((p) => p.id === productId)?.specifications;
    return Boolean(
      spec?.verifiedAt &&
      spec.unit &&
      (spec.unit === "individual" ? "single" : spec.unit) !== unit
    );
  };
  if (
    workspace.supplierQuotations.some((r) =>
      mismatchesUnit(r.productId, r.unit)
    )
  )
    throw new Error("invalid_reference");
  if (
    lines.some((line) => {
      const spec = bySlug.find(
        (p) => p.slug === line.productSlug
      )?.specifications;
      return Boolean(
        spec?.verifiedAt &&
        spec.unit &&
        (spec.unit === "individual" ? "single" : spec.unit) !== line.unit
      );
    })
  )
    throw new Error("invalid_reference");
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  const confirmations = [
    ...workspace.supplierQuotations.flatMap((r) => [
      r.quotedOn,
      r.availabilityConfirmedAt,
    ]),
    ...lines.map((r) => r.confirmedOn),
    ...workspace.customerQuotations.map((r) => r.deliveryConfirmedOn),
    ...workspace.serviceOptions.map((r) => r.confirmedOn),
    ...workspace.productCostProfiles.map((r) => r.confirmedOn),
    ...workspace.occasionReminders.map((r) => r.consentOn),
    ...workspace.fulfilledSales.map((r) => r.fulfilledOn),
  ];
  confirmations.push(
    ...workspace.quoteRevisions.flatMap((r) => [r.createdOn, r.acceptedOn]),
    ...workspace.sampleInspections.map((r) => r.inspectedOn),
    ...workspace.supplierPerformanceRecords.flatMap((r) => [
      r.requestedOn,
      r.respondedOn,
      r.receivedOn,
      r.resolvedOn,
    ]),
    ...workspace.purchasingDrafts.flatMap((r) => [r.createdOn, r.reviewedOn]),
    ...workspace.demandRequests.map((r) => r.notedOn)
  );
  if (
    hasFutureActualDates(workspace, today) ||
    confirmations.some((date) => date !== null && date > today)
  )
    throw new Error("invalid_confirmation_date");
  const variantIds = workspace.productCostProfiles.flatMap((r) =>
    r.variantId === null ? [] : [r.variantId]
  );
  const linkedVariants = variantIds.length
    ? await db
        .select({ id: variants.id, productId: variants.productId })
        .from(variants)
        .where(inArray(variants.id, variantIds))
    : [];
  if (
    workspace.productCostProfiles.some(
      (r) =>
        r.variantId !== null &&
        !linkedVariants.some(
          (v) => v.id === r.variantId && v.productId === r.productId
        )
    )
  )
    throw new Error("invalid_reference");
  for (const campaign of workspace.campaigns) {
    if (
      campaign.categorySlugs.some(
        (slug) => !COLLECTIONS.some((r) => r.slug === slug)
      ) ||
      campaign.guideSlugs.some((slug) => !GUIDES.some((r) => r.slug === slug))
    )
      throw new Error("invalid_reference");
    if (
      campaign.productSlugs.some(
        (slug) =>
          !bySlug.some(
            (p) =>
              p.slug === slug &&
              p.isActive &&
              p.publishedAt &&
              p.publishedAt <= new Date() &&
              !p.slug.startsWith("concepto-")
          )
      )
    )
      throw new Error("invalid_reference");
  }
}

export async function recordSalesSearchGap(intent: string): Promise<void> {
  const parsed = SearchGapIntentSchema.safeParse(intent);
  if (!parsed.success) return;
  const snapshot = await readSalesWorkspace();
  if (
    snapshot.migrationRequired ||
    !snapshot.workspace.searchGapCollectionEnabled
  )
    return;
  const day = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  await db
    .insert(salesSearchGaps)
    .values({ day, intent: parsed.data, count: 1 })
    .onDuplicateKeyUpdate({
      set: { count: sql`LEAST(${salesSearchGaps.count} + 1, 1000000)` },
    });
}
export async function readSalesSearchGaps(): Promise<
  { day: string; intent: string; count: number }[]
> {
  try {
    return await db
      .select({
        day: salesSearchGaps.day,
        intent: salesSearchGaps.intent,
        count: salesSearchGaps.count,
      })
      .from(salesSearchGaps)
      .orderBy(desc(salesSearchGaps.day))
      .limit(400);
  } catch (error) {
    if (workspaceMigrationMissing(error)) return [];
    throw error;
  }
}

export async function readPublicProductFaqs(
  productSlug: string
): Promise<{ question: string; answer: string }[]> {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productSlug) ||
    productSlug.startsWith("concepto-")
  )
    return [];
  const [product] = await db
    .select({
      id: products.id,
      isActive: products.isActive,
      categoryActive: categories.isActive,
      publishedAt: products.publishedAt,
    })
    .from(products)
    .innerJoin(categories, eq(categories.id, products.categoryId))
    .where(eq(products.slug, productSlug))
    .limit(1);
  if (
    !product?.isActive ||
    !product.categoryActive ||
    !product.publishedAt ||
    product.publishedAt > new Date()
  )
    return [];
  const [variant] = await db
    .select({ id: variants.id })
    .from(variants)
    .where(and(eq(variants.productId, product.id), eq(variants.isActive, true)))
    .limit(1);
  if (!variant) return [];
  const { workspace } = await readSalesWorkspace();
  return workspace.productFaqs
    .filter((r) => r.productSlug === productSlug && r.published)
    .map(({ question, answer }) => ({ question, answer }));
}

export async function readSalesWorkspaceAudit(): Promise<SalesAuditEntry[]> {
  const current = await readSalesWorkspace();
  if (current.migrationRequired) return [];
  try {
    const rows = await db
      .select({
        id: salesWorkspaceAudit.id,
        revision: salesWorkspaceAudit.revision,
        actorUserId: salesWorkspaceAudit.actorUserId,
        kind: salesWorkspaceAudit.kind,
        createdAt: salesWorkspaceAudit.createdAt,
        changes: salesWorkspaceAudit.changes,
        hasBefore: sql<number>`(${salesWorkspaceAudit.beforePayload} IS NOT NULL)`,
      })
      .from(salesWorkspaceAudit)
      .orderBy(desc(salesWorkspaceAudit.revision))
      .limit(30);
    const [latest] = await db
      .select({ before: salesWorkspaceAudit.beforePayload })
      .from(salesWorkspaceAudit)
      .where(eq(salesWorkspaceAudit.revision, current.revision))
      .limit(1);
    const accepted = current.workspace.quoteRevisions.filter(
      (r) => r.status === "accepted"
    );
    const preservesEvidence = accepted.every((r) =>
      latest?.before?.quoteRevisions?.some(
        (old) => JSON.stringify(old) === JSON.stringify(r)
      )
    );
    return rows.map((r) => ({
      id: r.id,
      revision: r.revision,
      actorUserId: r.actorUserId,
      kind: r.kind,
      changes: r.changes,
      createdAt: r.createdAt.toISOString(),
      canUndo:
        Boolean(r.hasBefore) &&
        r.revision === current.revision &&
        preservesEvidence,
    }));
  } catch (error) {
    if (workspaceMigrationMissing(error)) return [];
    throw error;
  }
}
export async function undoSalesWorkspace(
  input: { revision: number; auditId: number },
  actorUserId: number
): Promise<SaveSalesWorkspaceResult> {
  const [audit] = await db
    .select()
    .from(salesWorkspaceAudit)
    .where(eq(salesWorkspaceAudit.id, input.auditId))
    .limit(1);
  if (!audit?.beforePayload || audit.revision !== input.revision)
    return {
      ok: false,
      code: "conflict",
      error:
        "Sólo se revierte el último cambio guardado. Recargá el historial.",
    };
  return saveSalesWorkspace(
    { revision: input.revision, workspace: audit.beforePayload },
    { actorUserId, kind: "undo" }
  );
}
export async function deleteEnquiryRecords(
  input: unknown,
  actorUserId: number
): Promise<SaveSalesWorkspaceResult> {
  const parsed = DeleteEnquiryRecordsSchema.safeParse(input);
  if (!parsed.success)
    return {
      ok: false,
      code: "invalid",
      error: "Elegí explícitamente las políticas de retención.",
    };
  const snapshot = await readSalesWorkspace();
  if (snapshot.revision !== parsed.data.revision)
    return {
      ok: false,
      code: "conflict",
      error: "Recargá antes de borrar registros relacionados.",
    };
  let workspace: SalesWorkspace;
  try {
    workspace = deleteLinkedEnquiry(snapshot.workspace, parsed.data);
  } catch {
    return {
      ok: false,
      code: "invalid",
      error: "No se pudo preparar la eliminación vinculada.",
    };
  }
  return saveSalesWorkspace(
    { revision: parsed.data.revision, workspace },
    {
      actorUserId,
      kind: "delete",
      purgeAudit: parsed.data.auditRetention === "purge",
      allowAcceptedDeletion: parsed.data.financialRetention === "delete",
    }
  );
}
