import { describe, expect, it } from "vitest";
import {
  emptySalesWorkspace,
  emptyCosts,
  SalesWorkspaceSchema,
  QuoteRevisionSchema,
  PurchasingDraftSchema,
  ProductFaqSchema,
  SupplierPerformanceRecordSchema,
  deleteLinkedEnquiry,
  exportLinkedEnquiry,
  demandByModelSize,
  supplierPerformanceMetrics,
  workspaceChangeSummary,
  quoteRevisionDiff,
  hasFutureActualDates,
  DemandRequestSchema,
  quotationTotal,
  type CustomerQuotation,
} from "@/domain/sales-workspace";

const enquiry = {
  id: "e1",
  alias: "Consulta A",
  designSlugs: ["modelo-real"],
  categorySlug: null,
  stage: "quoted" as const,
  assignedOwner: "Owner A",
  createdOn: "2026-10-07",
  nextActionOn: null,
  nextAction: "",
  lossReason: null,
};
const quote: CustomerQuotation = {
  id: "q1",
  enquiryId: "e1",
  alias: "Consulta A",
  createdOn: "2026-10-07",
  expiresOn: null,
  lines: [
    {
      id: "line",
      supplierQuotationId: null,
      productId: null,
      productSlug: "modelo-real",
      model: "Ref",
      source: "Fuente",
      confirmedOn: "2026-10-07",
      unit: "single",
      quantity: 1,
      unitPricePyg: 100000,
    },
  ],
  serviceOptionIds: [],
  servicesSnapshot: [],
  deliveryPyg: 0,
  deliveryConditions: "Retiro confirmado",
  deliveryConfirmedOn: "2026-10-07",
  status: "review_ready",
};
const supplier = {
  id: "s1",
  supplier: "Proveedor A",
  reference: "Ref",
  source: "Fuente",
  productId: null,
  unit: "single" as const,
  size: "16 mm",
  quotedOn: "2026-10-07",
  expiresOn: null,
  availabilityConfirmedAt: null,
  terms: "",
  costs: emptyCosts(),
};

describe("bounded operational evidence", () => {
  it("rejects conflicting enquiry and quotation ownership before linked export or deletion", () => {
    const sale = {
      id: "sale",
      enquiryId: "e2",
      quotationId: "q1",
      productId: null,
      model: "Ref",
      supplier: "Proveedor A",
      fulfilledOn: "2026-10-07",
      revenuePyg: 100000,
      refundPyg: 0,
      costs: emptyCosts(),
      ownerReported: true,
    };
    const workspace = {
      ...emptySalesWorkspace(),
      enquiries: [enquiry, { ...enquiry, id: "e2", alias: "Consulta B" }],
      customerQuotations: [quote],
      fulfilledSales: [sale],
    };
    expect(SalesWorkspaceSchema.safeParse(workspace).success).toBe(false);
    expect(
      SalesWorkspaceSchema.safeParse({
        ...workspace,
        fulfilledSales: [{ ...sale, enquiryId: "e1" }],
      }).success
    ).toBe(true);
    expect(
      SalesWorkspaceSchema.safeParse({
        ...workspace,
        fulfilledSales: [{ ...sale, enquiryId: null }],
      }).success
    ).toBe(true);
  });
  it("treats malformed FAQ evidence as a validation error without throwing", () => {
    const faq = {
      id: "f",
      productSlug: "modelo-real",
      question: "Unidad",
      answer: "Confirmada",
      confirmedAt: "2026-10-07T00:00:00Z",
      published: false,
    };
    for (const evidenceUrl of [
      "",
      "banana",
      "http://example.test",
      "https://[",
    ]) {
      expect(() =>
        ProductFaqSchema.safeParse({ ...faq, evidenceUrl })
      ).not.toThrow();
      expect(ProductFaqSchema.safeParse({ ...faq, evidenceUrl }).success).toBe(
        false
      );
    }
  });
  it("keeps historical draft totals on captured services while live drafts reprice", () => {
    const service = {
      id: "s",
      name: "Embalaje",
      kind: "packaging" as const,
      terms: "Confirmado",
      pricePyg: 20000,
      confirmedOn: "2026-10-07",
      enabled: true,
    };
    const draft = {
      ...quote,
      status: "draft" as const,
      serviceOptionIds: ["s"],
      servicesSnapshot: [
        {
          id: service.id,
          name: service.name,
          terms: service.terms,
          pricePyg: service.pricePyg,
          confirmedOn: service.confirmedOn,
        },
      ],
    };
    const current = [{ ...service, pricePyg: 50000 }];
    expect(quotationTotal(draft, current)).toBe(150000);
    expect(quotationTotal(draft, current, true)).toBe(120000);
    expect(
      quotationTotal({ ...draft, servicesSnapshot: [] }, current, true)
    ).toBeNull();
  });
  it("validates millimetre demand without converting supplier-labelled sizes", () => {
    const request = {
      id: "d",
      enquiryId: "e1",
      modelSlug: "modelo-real",
      sizeSystem: "diameter_mm",
      requestedSize: "16.5",
      quantity: 1,
      unit: "single",
      notedOn: "2026-10-07",
      status: "requested",
    };
    for (const requestedSize of [
      "banana",
      "0",
      "-1",
      "1001",
      "Infinity",
      "1e2",
      null,
    ])
      expect(
        DemandRequestSchema.safeParse({ ...request, requestedSize }).success
      ).toBe(false);
    for (const requestedSize of ["16.5", "16,5", "1000"])
      expect(
        DemandRequestSchema.safeParse({ ...request, requestedSize }).success
      ).toBe(true);
    expect(
      DemandRequestSchema.safeParse({
        ...request,
        sizeSystem: "supplier_size",
        requestedSize: "US 7",
      }).success
    ).toBe(true);
    expect(
      DemandRequestSchema.safeParse({
        ...request,
        sizeSystem: "unknown",
        requestedSize: null,
      }).success
    ).toBe(true);
  });
  it("rejects acceptance after expiry while keeping historical accepted evidence valid", () => {
    const revision = {
      id: "r1",
      quotationId: "q1",
      revisionNumber: 1,
      createdOn: "2026-10-07",
      reason: "Propuesta",
      snapshot: { ...quote, expiresOn: "2026-10-08" },
      status: "accepted",
      acceptedOn: "2026-10-09",
      acceptanceEvidence: "Respuesta revisada",
    };
    expect(QuoteRevisionSchema.safeParse(revision).success).toBe(false);
    expect(
      QuoteRevisionSchema.safeParse({ ...revision, acceptedOn: "2026-10-08" })
        .success
    ).toBe(true);
    expect(
      QuoteRevisionSchema.safeParse({ ...revision, acceptedOn: "2026-10-06" })
        .success
    ).toBe(false);
  });
  it("distinguishes future scheduled dates from impossible future recorded events", () => {
    const workspace = {
      ...emptySalesWorkspace(),
      enquiries: [{ ...enquiry, nextActionOn: "2026-10-20" }],
      customerQuotations: [{ ...quote, expiresOn: "2026-10-20" }],
    };
    expect(hasFutureActualDates(workspace, "2026-10-07")).toBe(false);
    expect(
      hasFutureActualDates(
        { ...workspace, enquiries: [{ ...enquiry, createdOn: "2026-10-08" }] },
        "2026-10-07"
      )
    ).toBe(true);
    expect(
      hasFutureActualDates(
        {
          ...workspace,
          customerQuotations: [{ ...quote, createdOn: "2026-10-08" }],
        },
        "2026-10-07"
      )
    ).toBe(true);
  });
  it("rejects acceptance without actual evidence or reviewed terms", () => {
    const revision = {
      id: "r1",
      quotationId: "q1",
      revisionNumber: 1,
      createdOn: "2026-10-07",
      reason: "Nueva propuesta",
      snapshot: quote,
      status: "accepted",
      acceptedOn: "2026-10-07",
      acceptanceEvidence: null,
    };
    expect(QuoteRevisionSchema.safeParse(revision).success).toBe(false);
    expect(
      QuoteRevisionSchema.safeParse({
        ...revision,
        acceptanceEvidence: "Respuesta manual revisada",
      }).success
    ).toBe(true);
    expect(
      quoteRevisionDiff(quote, { ...quote, deliveryPyg: 20000 }).map(
        (r) => r.field
      )
    ).toEqual(["deliveryPyg"]);
  });
  it("requires review evidence, known capital and complete per-unit purchasing costs", () => {
    const draft = {
      id: "p1",
      supplierQuotationId: "s1",
      enquiryIds: ["e1"],
      quantity: 2,
      unit: "single",
      estimatedCosts: emptyCosts(),
      availableCapitalPyg: null,
      createdOn: "2026-10-07",
      reviewedOn: null,
      reviewEvidence: null,
      status: "draft",
      notes: "",
    };
    expect(PurchasingDraftSchema.safeParse(draft).success).toBe(true);
    expect(
      PurchasingDraftSchema.safeParse({
        ...draft,
        status: "reviewed",
        reviewedOn: "2026-10-07",
        reviewEvidence: "Inspección real",
      }).success
    ).toBe(false);
    expect(
      SupplierPerformanceRecordSchema.safeParse({
        id: "p",
        supplierQuotationId: "s1",
        requestedOn: "2026-10-07",
        respondedOn: null,
        promisedOn: null,
        receivedOn: "2026-10-07",
        fulfilledUnitCount: 1,
        issue: "damage",
        evidenceReference: "Inspección",
        resolvedOn: "2026-10-06",
        resolutionEvidence: "Resolución",
      }).success
    ).toBe(false);
  });
  it("reports only known dated samples and keeps requested size systems separate", () => {
    const workspace = {
      ...emptySalesWorkspace(),
      enquiries: [enquiry],
      supplierQuotations: [supplier],
      supplierPerformanceRecords: [
        {
          id: "p",
          supplierQuotationId: "s1",
          requestedOn: "2026-10-01",
          respondedOn: "2026-10-03",
          promisedOn: "2026-10-05",
          receivedOn: "2026-10-07",
          fulfilledUnitCount: 1,
          issue: null,
          evidenceReference: "Registro real",
          resolvedOn: null,
          resolutionEvidence: null,
        },
      ],
      demandRequests: [
        {
          id: "d1",
          enquiryId: "e1",
          modelSlug: "modelo-real",
          sizeSystem: "supplier_size",
          requestedSize: "16",
          quantity: 1,
          unit: "single",
          notedOn: "2026-10-07",
          status: "requested",
        },
        {
          id: "d2",
          enquiryId: "e1",
          modelSlug: "modelo-real",
          sizeSystem: "diameter_mm",
          requestedSize: "16",
          quantity: 1,
          unit: "single",
          notedOn: "2026-10-07",
          status: "unavailable",
        },
      ],
    };
    const parsed = SalesWorkspaceSchema.parse(workspace);
    expect(supplierPerformanceMetrics(parsed)[0]).toMatchObject({
      averageResponseDays: 2,
      lateRate: 1,
      issueRate: null,
    });
    expect(demandByModelSize(parsed)).toHaveLength(2);
  });
  it("exports linked evidence and requires explicit retained versus removed financial records", () => {
    const workspace = {
      ...emptySalesWorkspace(),
      enquiries: [enquiry],
      customerQuotations: [quote],
    };
    expect(
      exportLinkedEnquiry(workspace, "e1").customerQuotations
    ).toHaveLength(1);
    const policy = {
      revision: 1,
      enquiryId: "e1",
      financialRetention: "retain" as const,
      auditRetention: "retain" as const,
      reminderRetention: "retain" as const,
    };
    const retained = deleteLinkedEnquiry(workspace, policy);
    expect(retained.enquiries).toHaveLength(0);
    expect(retained.customerQuotations).toHaveLength(1);
    expect(retained.customerQuotations[0]?.enquiryId).toBeNull();
    const removed = deleteLinkedEnquiry(workspace, {
      ...policy,
      financialRetention: "delete",
    });
    expect(removed.customerQuotations).toHaveLength(0);
    expect(workspaceChangeSummary(workspace, removed)).toEqual(
      expect.arrayContaining([
        { collection: "enquiries", recordId: "e1", operation: "deleted" },
      ])
    );
  });
  it("rejects unverified public FAQ concepts and insecure evidence URLs", () => {
    const faq = {
      id: "f",
      productSlug: "modelo-real",
      question: "Unidad",
      answer: "Una pieza confirmada",
      evidenceUrl: "https://example.test/ref",
      confirmedAt: "2026-10-07T00:00:00Z",
      published: false,
    };
    expect(
      ProductFaqSchema.safeParse({ ...faq, productSlug: "concepto-ilustrado" })
        .success
    ).toBe(false);
    expect(
      ProductFaqSchema.safeParse({
        ...faq,
        evidenceUrl: "http://example.test/ref",
      }).success
    ).toBe(false);
  });
});
