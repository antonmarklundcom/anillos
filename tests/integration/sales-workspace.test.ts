import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
import { products } from "@/db/schema";
vi.mock("server-only", () => ({}));
import { emptySalesWorkspace } from "@/domain/sales-workspace";
import {
  readSalesWorkspace,
  saveSalesWorkspace,
  recordSalesSearchGap,
  readSalesSearchGaps,
  readPublicCampaign,
  readSalesWorkspaceAudit,
  undoSalesWorkspace,
  deleteEnquiryRecords,
} from "@/domain/sales-workspace-store";
import { createProduct } from "../helpers/factories";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";

describe.skipIf(!hasTestDb)("shared owner sales workspace persistence", () => {
  beforeEach(resetTables);
  afterAll(closeTestDb);
  it("rejects racing first saves and stale revisions without overwriting", async () => {
    const workspace = emptySalesWorkspace();
    const initial = await readSalesWorkspace();
    expect(initial.revision).toBe(0);
    const results = await Promise.all([
      saveSalesWorkspace({ revision: 0, workspace }),
      saveSalesWorkspace({
        revision: 0,
        workspace: { ...workspace, searchGapCollectionEnabled: true },
      }),
    ]);
    expect(results.filter((r) => r.ok)).toHaveLength(1);
    expect(results.filter((r) => !r.ok && r.code === "conflict")).toHaveLength(
      1
    );
    expect((await readSalesWorkspace()).revision).toBe(1);
    expect(await saveSalesWorkspace({ revision: 0, workspace })).toMatchObject({
      ok: false,
      code: "conflict",
    });
    expect(await saveSalesWorkspace({ revision: 1, workspace })).toMatchObject({
      ok: true,
      revision: 2,
    });
    expect(await saveSalesWorkspace({ revision: 1, workspace })).toMatchObject({
      ok: false,
      code: "conflict",
    });
  });
  it("counts only after explicit opt-in and never publishes drafts", async () => {
    await recordSalesSearchGap("silver");
    expect(await readSalesSearchGaps()).toEqual([]);
    const workspace = {
      ...emptySalesWorkspace(),
      searchGapCollectionEnabled: true,
      campaigns: [
        {
          id: "c1",
          slug: "ideas",
          title: "Ideas",
          description: "Elegí",
          body: "Texto",
          categorySlugs: [],
          guideSlugs: [],
          productSlugs: [],
          publicEnabled: false,
        },
      ],
    };
    expect(await saveSalesWorkspace({ revision: 0, workspace })).toMatchObject({
      ok: true,
    });
    await recordSalesSearchGap("silver");
    await recordSalesSearchGap("silver");
    expect(await readSalesSearchGaps()).toEqual([
      expect.objectContaining({ intent: "silver", count: 2 }),
    ]);
    expect(await readPublicCampaign("ideas")).toBeNull();
  });
  it("never undoes through a newer revision", async () => {
    const workspace = emptySalesWorkspace();
    expect(
      await saveSalesWorkspace({ revision: 0, workspace }, { actorUserId: 1 })
    ).toMatchObject({ ok: true });
    const [first] = await readSalesWorkspaceAudit();
    if (!first) throw new Error("First audit fixture was not persisted");
    expect(first).toMatchObject({ actorUserId: 1, revision: 1, canUndo: true });
    expect(
      await saveSalesWorkspace(
        {
          revision: 1,
          workspace: { ...workspace, searchGapCollectionEnabled: true },
        },
        { actorUserId: 2 }
      )
    ).toMatchObject({ ok: true });
    expect(
      await undoSalesWorkspace({ revision: 1, auditId: first.id }, 1)
    ).toMatchObject({ ok: false, code: "conflict" });
    expect(
      (await readSalesWorkspace()).workspace.searchGapCollectionEnabled
    ).toBe(true);
    const [latest] = await readSalesWorkspaceAudit();
    if (!latest) throw new Error("Latest audit fixture was not persisted");
    expect(
      await undoSalesWorkspace({ revision: 2, auditId: latest.id }, 2)
    ).toMatchObject({ ok: true, revision: 3 });
    expect(
      (await readSalesWorkspace()).workspace.searchGapCollectionEnabled
    ).toBe(false);
  });
  it("locks accepted evidence and prevents undo from resurrecting deleted linked records", async () => {
    const productId = await createProduct();
    const [product] = await getTestDb()
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.id, productId));
    if (!product) throw new Error("Actual product fixture was not persisted");
    const enquiry = {
      id: "e1",
      alias: "Consulta A",
      designSlugs: [],
      categorySlug: null,
      stage: "quoted" as const,
      assignedOwner: "Owner A",
      createdOn: "2026-10-07",
      nextActionOn: null,
      nextAction: "",
      lossReason: null,
    };
    const quote = {
      id: "q1",
      enquiryId: "e1",
      alias: "Consulta A",
      createdOn: "2026-10-07",
      expiresOn: null,
      lines: [
        {
          id: "l1",
          supplierQuotationId: null,
          productId,
          productSlug: product.slug,
          model: "Modelo real",
          source: "Fuente real",
          confirmedOn: "2026-10-07",
          unit: "single" as const,
          quantity: 1,
          unitPricePyg: 100000,
        },
      ],
      serviceOptionIds: [],
      servicesSnapshot: [],
      deliveryPyg: 0,
      deliveryConditions: "Retiro confirmado",
      deliveryConfirmedOn: "2026-10-07",
      status: "review_ready" as const,
    };
    const accepted = {
      id: "r1",
      quotationId: "q1",
      revisionNumber: 1,
      createdOn: "2026-10-07",
      reason: "Propuesta revisada",
      snapshot: quote,
      status: "accepted" as const,
      acceptedOn: "2026-10-07",
      acceptanceEvidence: "Respuesta manual revisada",
    };
    const workspace = {
      ...emptySalesWorkspace(),
      enquiries: [enquiry],
      customerQuotations: [quote],
      quoteRevisions: [accepted],
    };
    expect(
      await saveSalesWorkspace({ revision: 0, workspace }, { actorUserId: 1 })
    ).toMatchObject({ ok: true });
    expect(
      await saveSalesWorkspace({
        revision: 1,
        workspace: {
          ...workspace,
          quoteRevisions: [{ ...accepted, acceptanceEvidence: "Alterada" }],
        },
      })
    ).toMatchObject({ ok: false, code: "invalid" });
    const [acceptedAudit] = await readSalesWorkspaceAudit();
    if (!acceptedAudit)
      throw new Error("Accepted audit fixture was not persisted");
    expect(acceptedAudit.canUndo).toBe(false);
    expect(
      await deleteEnquiryRecords(
        {
          revision: 1,
          enquiryId: "e1",
          financialRetention: "delete",
          auditRetention: "retain",
          reminderRetention: "delete_matching_alias",
        },
        1
      )
    ).toMatchObject({ ok: true, revision: 2 });
    const state = await readSalesWorkspace();
    expect(state.workspace.enquiries).toEqual([]);
    expect(state.workspace.customerQuotations).toEqual([]);
    expect(state.workspace.quoteRevisions).toEqual([]);
    expect((await readSalesWorkspaceAudit()).every((r) => !r.canUndo)).toBe(
      true
    );
    const [history] = await readSalesWorkspaceAudit();
    if (!history) throw new Error("Deletion audit fixture was not persisted");
    expect(
      await undoSalesWorkspace({ revision: 2, auditId: history.id }, 1)
    ).toMatchObject({ ok: false, code: "conflict" });
  });
});
