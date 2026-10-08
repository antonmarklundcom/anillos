import { z } from "zod";

export const SEARCH_GAP_INTENTS = [
  "steel",
  "silver",
  "gold",
  "wedding",
  "engagement",
  "promise",
  "solitaire",
  "men",
  "sizing",
  "other",
] as const;
export const SearchGapIntentSchema = z.enum(SEARCH_GAP_INTENTS);

const text = (max = 300) => z.string().trim().max(max);
const required = (max = 120) => text(max).min(1);
const id = required(64).regex(/^[a-zA-Z0-9_-]+$/);
const slug = required(160).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const CalendarDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .refine((value) => {
    const date = new Date(`${value}T12:00:00Z`);
    return (
      Number.isFinite(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }, "Fecha de calendario inválida");
const date = CalendarDateSchema.nullable();
export const MoneySchema = z.number().int().min(0).max(1_000_000_000);
const money = MoneySchema.nullable();
const alias = required(80).refine(
  (value) => !/@|\+?\d[\d\s().-]{6,}\d/.test(value),
  "Usá un alias anónimo, sin teléfono ni email"
);
export const COST_KEYS = [
  "productPyg",
  "freightPyg",
  "taxPyg",
  "packagingPyg",
  "paymentFeePyg",
  "deliveryPyg",
  "servicePyg",
  "otherPyg",
] as const;
export const CostsSchema = z
  .object({
    productPyg: money,
    freightPyg: money,
    taxPyg: money,
    packagingPyg: money,
    paymentFeePyg: money,
    deliveryPyg: money,
    servicePyg: money,
    otherPyg: money,
  })
  .strict();
export type VariableCosts = z.infer<typeof CostsSchema>;
export const emptyCosts = (): VariableCosts =>
  Object.fromEntries(COST_KEYS.map((key) => [key, null])) as VariableCosts;
export const ENQUIRY_STAGES = [
  "new",
  "contacted",
  "quoted",
  "follow_up",
  "fulfilled",
  "lost",
  "closed",
] as const;
export const LOSS_REASONS = [
  "price",
  "size",
  "unavailable",
  "timing",
  "slow_follow_up",
  "no_response",
  "other",
] as const;
export const EnquirySchema = z
  .object({
    id,
    alias,
    designSlugs: z.array(slug).max(10),
    categorySlug: slug.nullable(),
    stage: z.enum(ENQUIRY_STAGES),
    assignedOwner: text(80),
    createdOn: CalendarDateSchema,
    nextActionOn: date,
    nextAction: text(),
    lossReason: z.enum(LOSS_REASONS).nullable(),
  })
  .strict()
  .refine(
    (v) => v.stage !== "lost" || v.lossReason !== null,
    "Indicá el motivo de pérdida"
  );
export const SupplierQuotationSchema = z
  .object({
    id,
    supplier: required(),
    reference: required(),
    source: required(300),
    productId: z.number().int().positive().nullable(),
    unit: z.enum(["single", "pair"]),
    size: text(80),
    quotedOn: CalendarDateSchema,
    expiresOn: date,
    availabilityConfirmedAt: date,
    terms: text(1000),
    costs: CostsSchema,
  })
  .strict()
  .refine(
    (v) => !v.expiresOn || v.expiresOn >= v.quotedOn,
    "La validez debe ser posterior a la cotización"
  );
export const ServiceOptionSchema = z
  .object({
    id,
    name: required(),
    kind: z.enum(["packaging", "engraving", "resizing", "other"]),
    terms: required(1000),
    pricePyg: MoneySchema,
    confirmedOn: CalendarDateSchema,
    enabled: z.boolean(),
  })
  .strict();
export const QuoteLineSchema = z
  .object({
    id,
    supplierQuotationId: id.nullable(),
    productId: z.number().int().positive().nullable(),
    productSlug: slug,
    model: required(),
    source: required(300),
    confirmedOn: CalendarDateSchema,
    unit: z.enum(["single", "pair"]),
    quantity: z.number().int().min(1).max(100),
    unitPricePyg: MoneySchema,
  })
  .strict()
  .refine(
    (v) => !v.productSlug.startsWith("concepto-"),
    "Un concepto no admite precio ni cotización comercial"
  );
export const ServiceSnapshotSchema = z
  .object({
    id,
    name: required(),
    terms: required(1000),
    pricePyg: MoneySchema,
    confirmedOn: CalendarDateSchema,
  })
  .strict();
export const CustomerQuotationSchema = z
  .object({
    id,
    enquiryId: id.nullable(),
    alias,
    createdOn: CalendarDateSchema,
    expiresOn: date,
    lines: z.array(QuoteLineSchema).min(1).max(20),
    serviceOptionIds: z.array(id).max(10),
    servicesSnapshot: z.array(ServiceSnapshotSchema).max(10).default([]),
    deliveryPyg: money,
    deliveryConditions: text(1000),
    deliveryConfirmedOn: date,
    status: z.enum(["draft", "review_ready"]),
  })
  .strict()
  .refine(
    (v) =>
      v.status !== "review_ready" ||
      (v.deliveryPyg !== null &&
        v.deliveryConditions.length > 0 &&
        v.deliveryConfirmedOn !== null),
    "Confirmá costo, fecha y condiciones de entrega antes de imprimir"
  );
export const FulfilledSaleSchema = z
  .object({
    id,
    quotationId: id.nullable(),
    enquiryId: id.nullable(),
    productId: z.number().int().positive().nullable(),
    model: required(),
    supplier: required(),
    fulfilledOn: CalendarDateSchema,
    revenuePyg: MoneySchema,
    refundPyg: money,
    costs: CostsSchema,
    ownerReported: z.literal(true),
  })
  .strict();
export const ProductCostProfileSchema = z
  .object({
    id,
    unit: z.enum(["single", "pair"]),
    productId: z.number().int().positive(),
    variantId: z.number().int().positive().nullable(),
    costs: CostsSchema,
    targetContributionPyg: money,
    confirmedOn: CalendarDateSchema,
  })
  .strict();
export const AftersalesCaseSchema = z
  .object({
    id,
    saleId: id,
    alias,
    kind: z.enum(["fit", "defect", "engraving", "other"]),
    openedOn: CalendarDateSchema,
    assignedOwner: text(80),
    nextActionOn: date,
    evidenceReference: text(300),
    resolution: text(1000),
    status: z.enum(["open", "reviewing", "resolved"]),
  })
  .strict();
export const OccasionReminderSchema = z
  .object({
    id,
    alias,
    occasion: required(),
    reminderOn: CalendarDateSchema,
    consentOn: CalendarDateSchema,
    nextAction: text(),
    assignedOwner: text(80),
  })
  .strict()
  .refine(
    (v) => v.reminderOn >= v.consentOn,
    "El recordatorio debe ser posterior al consentimiento"
  );
export const CampaignSchema = z
  .object({
    id,
    slug,
    title: required(160),
    description: required(500),
    body: required(5000),
    categorySlugs: z.array(slug).max(10),
    guideSlugs: z.array(slug).max(10),
    productSlugs: z.array(slug).max(20),
    publicEnabled: z.boolean(),
  })
  .strict()
  .refine(
    (v) => !v.productSlugs.some((s) => s.startsWith("concepto-")),
    "Las campañas sólo pueden enlazar modelos reales"
  );

export const QuoteRevisionSchema = z
  .object({
    id,
    quotationId: id,
    revisionNumber: z.number().int().min(1).max(1000),
    createdOn: CalendarDateSchema,
    reason: required(500),
    status: z.enum(["draft", "review_ready", "accepted"]),
    snapshot: CustomerQuotationSchema,
    acceptedOn: date,
    acceptanceEvidence: text(500).nullable(),
  })
  .strict()
  .refine(
    (r) =>
      r.snapshot.id === r.quotationId &&
      (r.status !== "accepted" ||
        (r.snapshot.status === "review_ready" &&
          r.acceptedOn !== null &&
          r.acceptedOn >= r.createdOn &&
          r.acceptedOn >= r.snapshot.createdOn &&
          (!r.snapshot.expiresOn || r.acceptedOn <= r.snapshot.expiresOn) &&
          Boolean(r.acceptanceEvidence))),
    "La aceptación requiere cotización revisada, fecha y evidencia real"
  );
const dimension = z.number().finite().positive().max(100).nullable();
export const SampleInspectionSchema = z
  .object({
    id,
    supplierQuotationId: id,
    inspectedOn: CalendarDateSchema,
    widthMm: dimension,
    interiorDiameterMm: dimension,
    weightGrams: dimension,
    finish: text(300),
    evidenceReference: required(500),
    outcome: z.enum(["pass", "review", "reject"]),
    notes: text(1000),
  })
  .strict();
export const SupplierPerformanceRecordSchema = z
  .object({
    id,
    supplierQuotationId: id,
    requestedOn: CalendarDateSchema,
    respondedOn: date,
    promisedOn: date,
    receivedOn: date,
    fulfilledUnitCount: z.number().int().min(0).max(10000).nullable(),
    issue: z
      .enum(["none", "delay", "spec_mismatch", "damage", "other"])
      .nullable(),
    evidenceReference: required(500),
    resolvedOn: date.default(null),
    resolutionEvidence: text(500).nullable().default(null),
  })
  .strict()
  .refine(
    (r) =>
      (!r.respondedOn || r.respondedOn >= r.requestedOn) &&
      (!r.receivedOn || r.receivedOn >= r.requestedOn) &&
      (!r.promisedOn || r.promisedOn >= r.requestedOn) &&
      (!r.resolvedOn ||
        (r.resolvedOn >= (r.receivedOn ?? r.requestedOn) &&
          Boolean(r.resolutionEvidence))),
    "Las fechas deben seguir a la solicitud; resolver requiere evidencia"
  );
export const DemandRequestSchema = z
  .object({
    id,
    enquiryId: id,
    modelSlug: slug,
    sizeSystem: z.enum([
      "interior_mm",
      "diameter_mm",
      "supplier_size",
      "unknown",
    ]),
    requestedSize: text(80).nullable(),
    quantity: z.number().int().min(1).max(100),
    unit: z.enum(["single", "pair"]),
    notedOn: CalendarDateSchema,
    status: z.enum(["requested", "quoted", "unavailable", "fulfilled"]),
  })
  .strict()
  .refine(
    (r) => r.sizeSystem === "unknown" || Boolean(r.requestedSize),
    "Registrá la medida solicitada sin convertir escalas"
  );
export const PurchasingDraftSchema = z
  .object({
    id,
    supplierQuotationId: id,
    enquiryIds: z.array(id).max(50),
    quantity: z.number().int().min(1).max(1000),
    unit: z.enum(["single", "pair"]),
    estimatedCosts: CostsSchema,
    availableCapitalPyg: money.default(null),
    createdOn: CalendarDateSchema,
    reviewedOn: date,
    reviewEvidence: text(500).nullable(),
    status: z.enum(["draft", "reviewed"]),
    notes: text(1000),
  })
  .strict()
  .refine(
    (r) =>
      r.status !== "reviewed" ||
      (r.availableCapitalPyg !== null &&
        r.reviewedOn !== null &&
        r.reviewedOn >= r.createdOn &&
        Boolean(r.reviewEvidence) &&
        COST_KEYS.every((key) => r.estimatedCosts[key] !== null)),
    "Revisar requiere capital, costos completos, fecha y evidencia; no crea un pedido"
  );
export const QuoteComparisonSchema = z
  .object({
    id,
    enquiryId: id,
    quotationIds: z.array(id).min(2).max(3),
    createdOn: CalendarDateSchema,
    criteria: required(500),
    selectedQuotationId: id.nullable(),
    decisionNotes: text(1000),
  })
  .strict()
  .refine(
    (r) =>
      new Set(r.quotationIds).size === r.quotationIds.length &&
      (r.selectedQuotationId === null ||
        r.quotationIds.includes(r.selectedQuotationId)),
    "Compará alternativas distintas y seleccioná una incluida"
  );
export const ProductFaqSchema = z
  .object({
    id,
    productSlug: slug,
    question: required(300),
    answer: required(2000),
    evidenceUrl: z
      .url()
      .max(2000)
      .refine(
        (url) => new URL(url).protocol === "https:",
        "La evidencia debe usar HTTPS"
      ),
    confirmedAt: z.iso
      .datetime({ offset: true })
      .refine(
        (value) => Date.parse(value) <= Date.now(),
        "La confirmación no puede ser futura"
      ),
    published: z.boolean(),
  })
  .strict()
  .refine(
    (r) => !r.productSlug.startsWith("concepto-"),
    "Las respuestas comerciales requieren un modelo real"
  );

export const SalesWorkspaceBaseSchema = z
  .object({
    formatVersion: z.literal(1),
    enquiries: z.array(EnquirySchema).max(200),
    supplierQuotations: z.array(SupplierQuotationSchema).max(100),
    customerQuotations: z.array(CustomerQuotationSchema).max(100),
    fulfilledSales: z.array(FulfilledSaleSchema).max(200),
    productCostProfiles: z.array(ProductCostProfileSchema).max(200),
    serviceOptions: z.array(ServiceOptionSchema).max(50),
    aftersalesCases: z.array(AftersalesCaseSchema).max(100),
    occasionReminders: z.array(OccasionReminderSchema).max(100),
    campaigns: z.array(CampaignSchema).max(30),
    searchGapCollectionEnabled: z.boolean(),
    quoteRevisions: z.array(QuoteRevisionSchema).max(100).default([]),
    sampleInspections: z.array(SampleInspectionSchema).max(100).default([]),
    supplierPerformanceRecords: z
      .array(SupplierPerformanceRecordSchema)
      .max(200)
      .default([]),
    demandRequests: z.array(DemandRequestSchema).max(300).default([]),
    purchasingDrafts: z.array(PurchasingDraftSchema).max(100).default([]),
    quoteComparisons: z.array(QuoteComparisonSchema).max(100).default([]),
    productFaqs: z.array(ProductFaqSchema).max(200).default([]),
  })
  .strict();
export const SalesWorkspaceSchema = SalesWorkspaceBaseSchema.superRefine(
  (v, ctx) => {
    const collections = [
      v.enquiries,
      v.supplierQuotations,
      v.customerQuotations,
      v.fulfilledSales,
      v.productCostProfiles,
      v.serviceOptions,
      v.aftersalesCases,
      v.occasionReminders,
      v.campaigns,
      v.quoteRevisions,
      v.sampleInspections,
      v.supplierPerformanceRecords,
      v.demandRequests,
      v.purchasingDrafts,
      v.quoteComparisons,
      v.productFaqs,
    ];
    for (const records of collections)
      if (new Set(records.map((r) => r.id)).size !== records.length)
        ctx.addIssue({ code: "custom", message: "IDs duplicados" });
    if (new Set(v.campaigns.map((r) => r.slug)).size !== v.campaigns.length)
      ctx.addIssue({ code: "custom", message: "Slugs de campaña duplicados" });
    const references = (value: string | null, records: { id: string }[]) =>
      value === null || records.some((r) => r.id === value);
    const issue = (message: string) =>
      ctx.addIssue({ code: "custom", message });
    for (const revision of v.quoteRevisions) {
      if (!references(revision.quotationId, v.customerQuotations))
        issue("Cotización de revisión inexistente");
      if (
        revision.status !== "draft" &&
        revision.snapshot.status !== "review_ready"
      )
        issue("La revisión requiere una cotización revisada");
      const snapshot = revision.snapshot;
      if (
        snapshot.status === "review_ready" &&
        (snapshot.servicesSnapshot.length !==
          snapshot.serviceOptionIds.length ||
          snapshot.serviceOptionIds.some(
            (key) => !snapshot.servicesSnapshot.some((s) => s.id === key)
          ))
      )
        issue("La revisión debe conservar servicios confirmados");
    }
    if (
      new Set(
        v.quoteRevisions.map((r) => `${r.quotationId}:${r.revisionNumber}`)
      ).size !== v.quoteRevisions.length
    )
      issue("Número de revisión duplicado para una cotización");
    for (const r of [...v.sampleInspections, ...v.supplierPerformanceRecords])
      if (!references(r.supplierQuotationId, v.supplierQuotations))
        issue("Cotización de proveedor inexistente");
    for (const r of v.demandRequests)
      if (!references(r.enquiryId, v.enquiries))
        issue("Consulta de demanda inexistente");
    for (const r of v.purchasingDrafts) {
      const supplier = v.supplierQuotations.find(
        (s) => s.id === r.supplierQuotationId
      );
      if (
        !supplier ||
        supplier.unit !== r.unit ||
        r.enquiryIds.some((key) => !references(key, v.enquiries)) ||
        new Set(r.enquiryIds).size !== r.enquiryIds.length
      )
        issue("Borrador con referencias o unidades incompatibles");
    }
    for (const r of v.quoteComparisons) {
      const quotes = r.quotationIds.map((key) =>
        v.customerQuotations.find((q) => q.id === key)
      );
      if (
        !references(r.enquiryId, v.enquiries) ||
        quotes.some(
          (q) =>
            !q || q.enquiryId !== r.enquiryId || q.status !== "review_ready"
        )
      )
        issue("Compará cotizaciones revisadas de la misma consulta");
      if (
        new Set(
          quotes.map((q) => JSON.stringify(q?.lines.map((l) => l.unit).sort()))
        ).size > 1
      )
        issue("Las alternativas deben usar unidades comparables");
    }
    for (const faq of v.productFaqs)
      if (
        v.productFaqs.filter((r) => r.productSlug === faq.productSlug).length >
        20
      )
        issue("Máximo veinte respuestas por modelo");
    for (const quote of v.customerQuotations) {
      if (quote.expiresOn && quote.expiresOn < quote.createdOn)
        ctx.addIssue({
          code: "custom",
          message: "La validez debe ser posterior a la cotización",
        });
      for (const line of quote.lines) {
        const supplier = v.supplierQuotations.find(
          (s) => s.id === line.supplierQuotationId
        );
        if (
          supplier &&
          (line.model !== supplier.reference ||
            line.source !== supplier.source ||
            line.unit !== supplier.unit ||
            line.productId !== supplier.productId ||
            line.confirmedOn < supplier.quotedOn)
        )
          ctx.addIssue({
            code: "custom",
            message:
              "La línea debe coincidir con el modelo, unidad y fuente del proveedor confirmado",
          });
      }
      if (
        quote.lines.some(
          (line) => !references(line.supplierQuotationId, v.supplierQuotations)
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "Cotización de proveedor inexistente",
        });
      if (!references(quote.enquiryId, v.enquiries))
        ctx.addIssue({
          code: "custom",
          message: "Consulta de cotización inexistente",
        });
      if (
        new Set(quote.lines.map((r) => r.id)).size !== quote.lines.length ||
        new Set(quote.serviceOptionIds).size !== quote.serviceOptionIds.length
      )
        ctx.addIssue({
          code: "custom",
          message: "Líneas o servicios duplicados",
        });
      if (quote.status === "review_ready") {
        if (
          quote.servicesSnapshot.length !== quote.serviceOptionIds.length ||
          new Set(quote.servicesSnapshot.map((s) => s.id)).size !==
            quote.servicesSnapshot.length ||
          quote.serviceOptionIds.some(
            (key) => !quote.servicesSnapshot.some((s) => s.id === key)
          )
        )
          ctx.addIssue({
            code: "custom",
            message:
              "La cotización revisada requiere una copia exacta de los servicios seleccionados",
          });
      } else if (
        quote.serviceOptionIds.some(
          (key) => !v.serviceOptions.some((s) => s.id === key && s.enabled)
        )
      )
        ctx.addIssue({
          code: "custom",
          message: "Servicio no confirmado o deshabilitado",
        });
    }
    for (const sale of v.fulfilledSales)
      if (
        !references(sale.enquiryId, v.enquiries) ||
        !references(sale.quotationId, v.customerQuotations)
      )
        ctx.addIssue({
          code: "custom",
          message: "Referencia de venta inexistente",
        });
    for (const item of v.aftersalesCases)
      if (!references(item.saleId, v.fulfilledSales))
        ctx.addIssue({
          code: "custom",
          message: "Venta de posventa inexistente",
        });
  }
);
export type SalesWorkspace = z.infer<typeof SalesWorkspaceSchema>;
export type Enquiry = z.infer<typeof EnquirySchema>;
export type SupplierQuotation = z.infer<typeof SupplierQuotationSchema>;
export type CustomerQuotation = z.infer<typeof CustomerQuotationSchema>;
export type FulfilledSale = z.infer<typeof FulfilledSaleSchema>;
export type Campaign = z.infer<typeof CampaignSchema>;
export type QuoteRevision = z.infer<typeof QuoteRevisionSchema>;
export type WorkspaceChange = {
  collection: string;
  recordId: string;
  operation: "added" | "changed" | "deleted";
};
export type SalesAuditEntry = {
  id: number;
  revision: number;
  actorUserId: number | null;
  kind: "save" | "undo" | "delete";
  createdAt: string;
  canUndo: boolean;
  changes: WorkspaceChange[];
};
export const DeleteEnquiryRecordsSchema = z
  .object({
    revision: z.number().int().min(0).max(2_000_000_000),
    enquiryId: id,
    financialRetention: z.enum(["retain", "delete"]),
    auditRetention: z.enum(["retain", "purge"]),
    reminderRetention: z.enum(["retain", "delete_matching_alias"]),
  })
  .strict();
export type DeleteEnquiryRecordsInput = z.infer<
  typeof DeleteEnquiryRecordsSchema
>;
export const emptySalesWorkspace = (): SalesWorkspace => ({
  formatVersion: 1,
  enquiries: [],
  supplierQuotations: [],
  customerQuotations: [],
  fulfilledSales: [],
  productCostProfiles: [],
  serviceOptions: [],
  aftersalesCases: [],
  occasionReminders: [],
  campaigns: [],
  quoteRevisions: [],
  sampleInspections: [],
  supplierPerformanceRecords: [],
  demandRequests: [],
  purchasingDrafts: [],
  quoteComparisons: [],
  productFaqs: [],
  searchGapCollectionEnabled: false,
});
export const MAX_WORKSPACE_BYTES = 750_000;
/** Recorded events may be past or today; scheduled actions and expiries may be future. */
export function hasFutureActualDates(
  workspace: SalesWorkspace,
  today: string
): boolean {
  CalendarDateSchema.parse(today);
  const dates = [
    ...workspace.enquiries.map((r) => r.createdOn),
    ...workspace.customerQuotations.flatMap((r) => [
      r.createdOn,
      r.deliveryConfirmedOn,
    ]),
    ...workspace.aftersalesCases.map((r) => r.openedOn),
    ...workspace.quoteComparisons.map((r) => r.createdOn),
    ...workspace.quoteRevisions.flatMap((r) => [
      r.createdOn,
      r.acceptedOn,
      r.snapshot.createdOn,
    ]),
  ];
  return dates.some((date) => date !== null && date > today);
}
export const SaveSalesWorkspaceInputSchema = z
  .object({
    revision: z.number().int().min(0).max(2_000_000_000),
    workspace: SalesWorkspaceBaseSchema,
  })
  .strict();
export const SaveSalesWorkspaceSchema = z
  .object({
    revision: z.number().int().min(0).max(2_000_000_000),
    workspace: SalesWorkspaceSchema,
  })
  .strict();
export type SalesWorkspaceSnapshot = {
  workspace: SalesWorkspace;
  revision: number;
  migrationRequired: boolean;
};
export type SaveSalesWorkspaceResult =
  | { ok: true; revision: number; snapshot: SalesWorkspaceSnapshot }
  | {
      ok: false;
      code:
        | "invalid"
        | "conflict"
        | "migration_required"
        | "unavailable"
        | "forbidden";
      error: string;
    };
export function costTotal(costs: VariableCosts): number | null {
  return COST_KEYS.some((k) => costs[k] === null)
    ? null
    : COST_KEYS.reduce((sum, k) => sum + costs[k]!, 0);
}
export function saleContribution(sale: FulfilledSale): number | null {
  const total = costTotal(sale.costs);
  return total === null || sale.refundPyg === null
    ? null
    : sale.revenuePyg - sale.refundPyg - total;
}
export function quotationTotal(
  quote: CustomerQuotation,
  services: SalesWorkspace["serviceOptions"]
): number | null {
  if (quote.deliveryPyg === null) return null;
  const selected = quote.serviceOptionIds.map((key) =>
    quote.status === "review_ready"
      ? quote.servicesSnapshot.find((s) => s.id === key)
      : services.find((s) => s.id === key && s.enabled)
  );
  if (selected.some((s) => !s)) return null;
  return (
    quote.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPricePyg,
      0
    ) +
    quote.deliveryPyg +
    selected.reduce((sum, s) => sum + s!.pricePyg, 0)
  );
}
export function overdueEnquiries(
  workspace: SalesWorkspace,
  today: string
): Enquiry[] {
  CalendarDateSchema.parse(today);
  return workspace.enquiries.filter(
    (r) =>
      r.nextActionOn &&
      r.nextActionOn <= today &&
      !["lost", "closed", "fulfilled"].includes(r.stage)
  );
}
export function supplierFreshness(
  quote: SupplierQuotation,
  today: string,
  maxAgeDays = 30
): "unknown" | "expired" | "stale" | "current" {
  CalendarDateSchema.parse(today);
  if (quote.expiresOn && quote.expiresOn < today) return "expired";
  if (!quote.availabilityConfirmedAt) return "unknown";
  const age =
    (Date.parse(today) - Date.parse(quote.availabilityConfirmedAt)) /
    86_400_000;
  return age < 0 || age > maxAgeDays ? "stale" : "current";
}
export function lossCounts(workspace: SalesWorkspace): Record<string, number> {
  return workspace.enquiries
    .filter((e) => e.stage === "lost" && e.lossReason)
    .reduce<Record<string, number>>((counts, e) => {
      counts[e.lossReason!] = (counts[e.lossReason!] ?? 0) + 1;
      return counts;
    }, {});
}
export function priceFloor(
  profile: SalesWorkspace["productCostProfiles"][number]
): number | null {
  const costs = costTotal(profile.costs);
  return costs === null || profile.targetContributionPyg === null
    ? null
    : costs + profile.targetContributionPyg;
}
export type PublicCampaign = Pick<
  Campaign,
  | "slug"
  | "title"
  | "description"
  | "body"
  | "categorySlugs"
  | "guideSlugs"
  | "productSlugs"
>;
export function publicCampaignProjection(
  campaign: Campaign
): PublicCampaign | null {
  if (!campaign.publicEnabled) return null;
  const {
    slug,
    title,
    description,
    body,
    categorySlugs,
    guideSlugs,
    productSlugs,
  } = campaign;
  return {
    slug,
    title,
    description,
    body,
    categorySlugs,
    guideSlugs,
    productSlugs,
  };
}

/** Periods are explicit calendar ranges; incompleteness never becomes an assumed cost. */
export function contributionReport(
  workspace: SalesWorkspace,
  from: string,
  to: string
) {
  CalendarDateSchema.parse(from);
  CalendarDateSchema.parse(to);
  if (from > to) throw new Error("El período es inválido");
  const sales = workspace.fulfilledSales.filter(
    (sale) => sale.fulfilledOn >= from && sale.fulfilledOn <= to
  );
  const groups = new Map<
    string,
    {
      model: string;
      supplier: string;
      count: number;
      completeCount: number;
      revenuePyg: number;
      contributionPyg: number | null;
    }
  >();
  for (const sale of sales) {
    const key = JSON.stringify([sale.model, sale.supplier]);
    const group = groups.get(key) ?? {
      model: sale.model,
      supplier: sale.supplier,
      count: 0,
      completeCount: 0,
      revenuePyg: 0,
      contributionPyg: 0,
    };
    group.count++;
    group.revenuePyg += sale.revenuePyg;
    const amount = saleContribution(sale);
    if (amount === null) group.contributionPyg = null;
    else {
      group.completeCount++;
      if (group.contributionPyg !== null) group.contributionPyg += amount;
    }
    groups.set(key, group);
  }
  return {
    from,
    to,
    ownerReported: true as const,
    count: sales.length,
    groups: [...groups.values()],
  };
}

export function quoteRevisionDiff(
  before: CustomerQuotation,
  after: CustomerQuotation
) {
  const fields = [
    "alias",
    "expiresOn",
    "lines",
    "serviceOptionIds",
    "servicesSnapshot",
    "deliveryPyg",
    "deliveryConditions",
    "deliveryConfirmedOn",
  ] as const;
  return fields
    .filter((key) => JSON.stringify(before[key]) !== JSON.stringify(after[key]))
    .map((field) => ({ field, before: before[field], after: after[field] }));
}
export function workspaceChangeSummary(
  before: SalesWorkspace,
  after: SalesWorkspace
): WorkspaceChange[] {
  const changes: WorkspaceChange[] = [];
  for (const [collection, values] of Object.entries(before)) {
    const next = after[collection as keyof SalesWorkspace];
    if (!Array.isArray(values) || !Array.isArray(next)) continue;
    const old = new Map((values as { id: string }[]).map((r) => [r.id, r]));
    const fresh = new Map((next as { id: string }[]).map((r) => [r.id, r]));
    for (const [recordId, record] of fresh)
      if (!old.has(recordId))
        changes.push({ collection, recordId, operation: "added" });
      else if (JSON.stringify(old.get(recordId)) !== JSON.stringify(record))
        changes.push({ collection, recordId, operation: "changed" });
    for (const recordId of old.keys())
      if (!fresh.has(recordId))
        changes.push({ collection, recordId, operation: "deleted" });
  }
  if (before.searchGapCollectionEnabled !== after.searchGapCollectionEnabled)
    changes.push({
      collection: "settings",
      recordId: "searchGapCollectionEnabled",
      operation: "changed",
    });
  return changes;
}
export function purchasingDraftTotals(
  draft: SalesWorkspace["purchasingDrafts"][number]
) {
  const unitCostsPyg = costTotal(draft.estimatedCosts);
  const totalPyg = unitCostsPyg === null ? null : unitCostsPyg * draft.quantity;
  return {
    unit: draft.unit,
    unitCostsPyg,
    totalPyg,
    availableCapitalPyg: draft.availableCapitalPyg,
    capitalRemainingPyg:
      totalPyg === null || draft.availableCapitalPyg === null
        ? null
        : draft.availableCapitalPyg - totalPyg,
    createsOrder: false as const,
  };
}
export function supplierPerformanceMetrics(workspace: SalesWorkspace) {
  const grouped = new Map<
    string,
    {
      supplier: string;
      records: number;
      responseCount: number;
      responseDays: number;
      receivedCount: number;
      lateCount: number;
      assessedIssueCount: number;
      issueCount: number;
    }
  >();
  const days = (from: string, to: string) =>
    Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
  for (const record of workspace.supplierPerformanceRecords) {
    const quote = workspace.supplierQuotations.find(
      (r) => r.id === record.supplierQuotationId
    );
    if (!quote) continue;
    const metric = grouped.get(quote.supplier) ?? {
      supplier: quote.supplier,
      records: 0,
      responseCount: 0,
      responseDays: 0,
      receivedCount: 0,
      lateCount: 0,
      assessedIssueCount: 0,
      issueCount: 0,
    };
    metric.records++;
    if (record.respondedOn) {
      metric.responseCount++;
      metric.responseDays += days(record.requestedOn, record.respondedOn);
    }
    if (record.receivedOn && record.promisedOn) {
      metric.receivedCount++;
      if (record.receivedOn > record.promisedOn) metric.lateCount++;
    }
    if (record.issue !== null) {
      metric.assessedIssueCount++;
      if (record.issue !== "none") metric.issueCount++;
    }
    grouped.set(quote.supplier, metric);
  }
  return [...grouped.values()].map((r) => ({
    ...r,
    averageResponseDays: r.responseCount
      ? r.responseDays / r.responseCount
      : null,
    lateRate: r.receivedCount ? r.lateCount / r.receivedCount : null,
    issueRate: r.assessedIssueCount
      ? r.issueCount / r.assessedIssueCount
      : null,
  }));
}
export function demandByModelSize(workspace: SalesWorkspace) {
  const groups = new Map<
    string,
    {
      modelSlug: string;
      sizeSystem: string;
      requestedSize: string | null;
      unit: "single" | "pair";
      requests: number;
      quantity: number;
      unavailable: number;
    }
  >();
  for (const r of workspace.demandRequests) {
    const key = JSON.stringify([
      r.modelSlug,
      r.sizeSystem,
      r.requestedSize,
      r.unit,
    ]);
    const group = groups.get(key) ?? {
      modelSlug: r.modelSlug,
      sizeSystem: r.sizeSystem,
      requestedSize: r.requestedSize,
      unit: r.unit,
      requests: 0,
      quantity: 0,
      unavailable: 0,
    };
    group.requests++;
    group.quantity += r.quantity;
    if (r.status === "unavailable") group.unavailable++;
    groups.set(key, group);
  }
  return [...groups.values()];
}
export function compareQuotationAlternatives(
  workspace: SalesWorkspace,
  comparison: SalesWorkspace["quoteComparisons"][number]
) {
  return comparison.quotationIds.map((key) => {
    const quote = workspace.customerQuotations.find((r) => r.id === key);
    return {
      quotationId: key,
      totalPyg: quote ? quotationTotal(quote, workspace.serviceOptions) : null,
      expiresOn: quote?.expiresOn ?? null,
      units: quote?.lines.map((l) => l.unit) ?? [],
      deliveryConditions: quote?.deliveryConditions ?? "",
    };
  });
}
export function exportLinkedEnquiry(
  workspace: SalesWorkspace,
  enquiryId: string
) {
  const enquiry = workspace.enquiries.find((r) => r.id === enquiryId);
  if (!enquiry) throw new Error("Consulta inexistente");
  const customerQuotations = workspace.customerQuotations.filter(
    (r) => r.enquiryId === enquiryId
  );
  const quoteIds = new Set(customerQuotations.map((r) => r.id));
  const fulfilledSales = workspace.fulfilledSales.filter(
    (r) =>
      r.enquiryId === enquiryId ||
      (r.quotationId && quoteIds.has(r.quotationId))
  );
  const saleIds = new Set(fulfilledSales.map((r) => r.id));
  const purchasingDrafts = workspace.purchasingDrafts.filter((r) =>
    r.enquiryIds.includes(enquiryId)
  );
  const supplierIds = new Set([
    ...customerQuotations.flatMap((r) =>
      r.lines.flatMap((l) =>
        l.supplierQuotationId ? [l.supplierQuotationId] : []
      )
    ),
    ...purchasingDrafts.map((r) => r.supplierQuotationId),
  ]);
  return {
    formatVersion: 1 as const,
    enquiry,
    customerQuotations,
    fulfilledSales,
    quoteRevisions: workspace.quoteRevisions.filter((r) =>
      quoteIds.has(r.quotationId)
    ),
    aftersalesCases: workspace.aftersalesCases.filter((r) =>
      saleIds.has(r.saleId)
    ),
    demandRequests: workspace.demandRequests.filter(
      (r) => r.enquiryId === enquiryId
    ),
    quoteComparisons: workspace.quoteComparisons.filter(
      (r) => r.enquiryId === enquiryId
    ),
    purchasingDrafts,
    occasionReminders: workspace.occasionReminders.filter(
      (r) => r.alias === enquiry.alias
    ),
    supplierQuotations: workspace.supplierQuotations.filter((r) =>
      supplierIds.has(r.id)
    ),
  };
}
export type LinkedEnquiryExport = ReturnType<typeof exportLinkedEnquiry>;
export function deleteLinkedEnquiry(
  workspace: SalesWorkspace,
  input: DeleteEnquiryRecordsInput
): SalesWorkspace {
  const linked = exportLinkedEnquiry(workspace, input.enquiryId);
  const copy = structuredClone(workspace);
  const quoteIds = new Set(linked.customerQuotations.map((r) => r.id));
  const saleIds = new Set(linked.fulfilledSales.map((r) => r.id));
  copy.enquiries = copy.enquiries.filter((r) => r.id !== input.enquiryId);
  copy.demandRequests = copy.demandRequests.filter(
    (r) => r.enquiryId !== input.enquiryId
  );
  copy.quoteComparisons = copy.quoteComparisons.filter(
    (r) => r.enquiryId !== input.enquiryId
  );
  copy.purchasingDrafts = copy.purchasingDrafts.map((r) => ({
    ...r,
    enquiryIds: r.enquiryIds.filter((key) => key !== input.enquiryId),
  }));
  if (input.financialRetention === "delete") {
    copy.customerQuotations = copy.customerQuotations.filter(
      (r) => !quoteIds.has(r.id)
    );
    copy.quoteRevisions = copy.quoteRevisions.filter(
      (r) => !quoteIds.has(r.quotationId)
    );
    copy.fulfilledSales = copy.fulfilledSales.filter((r) => !saleIds.has(r.id));
    copy.aftersalesCases = copy.aftersalesCases.filter(
      (r) => !saleIds.has(r.saleId)
    );
  } else {
    copy.customerQuotations = copy.customerQuotations.map((r) =>
      r.enquiryId === input.enquiryId ? { ...r, enquiryId: null } : r
    );
    copy.fulfilledSales = copy.fulfilledSales.map((r) =>
      r.enquiryId === input.enquiryId ? { ...r, enquiryId: null } : r
    );
  }
  if (input.reminderRetention === "delete_matching_alias")
    copy.occasionReminders = copy.occasionReminders.filter(
      (r) => r.alias !== linked.enquiry.alias
    );
  return SalesWorkspaceSchema.parse(copy);
}
