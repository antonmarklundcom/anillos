import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { eq } from "drizzle-orm";
vi.mock("server-only", () => ({}));
import { products } from "@/db/schema";
import {
  emptySalesWorkspace,
  MAX_WORKSPACE_BYTES,
  type CustomerQuotation,
} from "@/domain/sales-workspace";
import {
  readSalesWorkspace,
  saveSalesWorkspace,
  readSalesWorkspaceAudit,
  undoSalesWorkspace,
} from "@/domain/sales-workspace-store";
import { createProduct } from "../helpers/factories";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";

async function actualQuote(): Promise<CustomerQuotation> {
  const productId = await createProduct();
  const [product] = await getTestDb()
    .select({ slug: products.slug })
    .from(products)
    .where(eq(products.id, productId));
  if (!product) throw new Error("Actual product fixture was not persisted");
  const today = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
  return {
    id: "q1",
    enquiryId: null,
    alias: "Consulta A",
    createdOn: today,
    expiresOn: null,
    lines: [
      {
        id: "line",
        supplierQuotationId: null,
        productId,
        productSlug: product.slug,
        model: "Modelo real",
        source: "Fuente real",
        confirmedOn: today,
        unit: "single",
        quantity: 1,
        unitPricePyg: 100000,
      },
    ],
    serviceOptionIds: [],
    servicesSnapshot: [],
    deliveryPyg: 0,
    deliveryConditions: "Retiro confirmado",
    deliveryConfirmedOn: today,
    status: "review_ready",
  };
}

describe.skipIf(!hasTestDb)("canonical quotation normalization", () => {
  beforeEach(resetTables);
  afterAll(closeTestDb);
  it.each([true, false])(
    "restores historical ready services after generic removal with current enabled=%s",
    async (enabled) => {
      const quote = await actualQuote();
      const service = {
        id: "service",
        name: "Embalaje confirmado",
        kind: "packaging" as const,
        terms: "Condiciones confirmadas",
        pricePyg: 20000,
        confirmedOn: quote.createdOn,
        enabled: true,
      };
      const first = await saveSalesWorkspace({
        revision: 0,
        workspace: {
          ...emptySalesWorkspace(),
          customerQuotations: [{ ...quote, serviceOptionIds: [service.id] }],
          serviceOptions: [service],
        },
      });
      if (!first.ok) throw new Error("Historical quote fixture save failed");
      const second = await saveSalesWorkspace({
        revision: 1,
        workspace: {
          ...first.snapshot.workspace,
          serviceOptions: [{ ...service, pricePyg: 50000, enabled }],
        },
      });
      if (!second.ok) throw new Error("Service change fixture save failed");
      const third = await saveSalesWorkspace({
        revision: 2,
        workspace: { ...second.snapshot.workspace, customerQuotations: [] },
      });
      if (!third.ok)
        throw new Error("Reversible quote removal fixture save failed");
      const [latest] = await readSalesWorkspaceAudit();
      if (!latest) throw new Error("Removal audit fixture missing");
      const restored = await undoSalesWorkspace(
        { revision: 3, auditId: latest.id },
        1
      );
      if (!restored.ok) throw new Error("Historical quote restore failed");
      expect(
        restored.snapshot.workspace.customerQuotations[0]?.servicesSnapshot[0]
          ?.pricePyg
      ).toBe(20000);
      expect(restored.snapshot.workspace.serviceOptions[0]).toMatchObject({
        pricePyg: 50000,
        enabled,
      });
    }
  );
  it("keeps trusted old terms on each edit and returns the canonical history", async () => {
    const quote = await actualQuote();
    const first = await saveSalesWorkspace({
      revision: 0,
      workspace: { ...emptySalesWorkspace(), customerQuotations: [quote] },
    });
    if (!first.ok) throw new Error("Initial fixture save failed");
    const changed = {
      ...quote,
      lines: [{ ...quote.lines[0]!, unitPricePyg: 120000 }],
    };
    const second = await saveSalesWorkspace({
      revision: 1,
      workspace: { ...first.snapshot.workspace, customerQuotations: [changed] },
    });
    if (!second.ok) throw new Error("Quotation change failed");
    expect(second.snapshot.workspace.quoteRevisions).toHaveLength(1);
    expect(
      second.snapshot.workspace.quoteRevisions[0]?.snapshot.lines[0]
        ?.unitPricePyg
    ).toBe(100000);
    expect(second.snapshot.workspace.quoteRevisions[0]?.revisionNumber).toBe(1);
    const third = await saveSalesWorkspace({
      revision: 2,
      workspace: {
        ...second.snapshot.workspace,
        customerQuotations: [
          {
            ...changed,
            lines: [{ ...changed.lines[0]!, unitPricePyg: 130000 }],
          },
        ],
      },
    });
    if (!third.ok) throw new Error("Second quotation change failed");
    expect(
      third.snapshot.workspace.quoteRevisions.map((r) => r.revisionNumber)
    ).toEqual([1, 2]);
    expect(
      third.snapshot.workspace.quoteRevisions.map(
        (r) => r.snapshot.lines[0]?.unitPricePyg
      )
    ).toEqual([100000, 120000]);
  });
  it("rejects a small input that expands beyond the cap when reviewed services are snapshotted", async () => {
    const quote = await actualQuote();
    const serviceOptions = Array.from({ length: 10 }, (_, n) => ({
      id: `s${n}`,
      name: "Servicio confirmado",
      kind: "packaging" as const,
      terms: "T".repeat(1000),
      pricePyg: 1,
      confirmedOn: quote.createdOn,
      enabled: true,
    }));
    const customerQuotations = Array.from({ length: 100 }, (_, n) => ({
      ...quote,
      id: `q${n}`,
      serviceOptionIds: serviceOptions.map((s) => s.id),
    }));
    const input = {
      revision: 0,
      workspace: {
        ...emptySalesWorkspace(),
        serviceOptions,
        customerQuotations,
      },
    };
    expect(Buffer.byteLength(JSON.stringify(input), "utf8")).toBeLessThan(
      MAX_WORKSPACE_BYTES
    );
    expect(await saveSalesWorkspace(input)).toMatchObject({
      ok: false,
      code: "invalid",
    });
    expect((await readSalesWorkspace()).revision).toBe(0);
  });
  it("rejects future quotation creation even when confirmed line and delivery dates are valid", async () => {
    const quote = await actualQuote();
    const tomorrow = new Date(Date.parse(quote.createdOn) + 86400000)
      .toISOString()
      .slice(0, 10);
    expect(
      await saveSalesWorkspace({
        revision: 0,
        workspace: {
          ...emptySalesWorkspace(),
          customerQuotations: [{ ...quote, createdOn: tomorrow }],
        },
      })
    ).toMatchObject({ ok: false, code: "invalid" });
    expect((await readSalesWorkspace()).revision).toBe(0);
  });
});
