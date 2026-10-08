import { describe, expect, it } from "vitest";
import {
  CalendarDateSchema,
  SalesWorkspaceSchema,
  SaveSalesWorkspaceSchema,
  CustomerQuotationSchema,
  SearchGapIntentSchema,
  costTotal,
  emptyCosts,
  emptySalesWorkspace,
  publicCampaignProjection,
  quotationTotal,
  saleContribution,
  priceFloor,
  type CustomerQuotation,
  type FulfilledSale,
} from "@/domain/sales-workspace";

const quote: CustomerQuotation = {
  id: "q1",
  enquiryId: null,
  alias: "Consulta A",
  createdOn: "2026-10-07",
  expiresOn: null,
  lines: [
    {
      id: "l1",
      supplierQuotationId: null,
      productId: null,
      productSlug: "modelo-real",
      model: "Referencia real",
      source: "https://supplier.example/reference",
      confirmedOn: "2026-10-07",
      unit: "pair",
      quantity: 2,
      unitPricePyg: 150000,
    },
  ],
  serviceOptionIds: [],
  servicesSnapshot: [],
  deliveryPyg: null,
  deliveryConditions: "",
  deliveryConfirmedOn: null,
  status: "draft",
};
const zeroCosts = {
  productPyg: 0,
  freightPyg: 0,
  taxPyg: 0,
  packagingPyg: 0,
  paymentFeePyg: 0,
  deliveryPyg: 0,
  servicePyg: 0,
  otherPyg: 0,
};
describe("owner sales workspace contracts", () => {
  it("keeps blank costs and refunds unknown rather than zero", () => {
    expect(costTotal(emptyCosts())).toBeNull();
    expect(costTotal(zeroCosts)).toBe(0);
    const sale: FulfilledSale = {
      id: "s1",
      quotationId: null,
      enquiryId: null,
      productId: null,
      model: "Ref",
      supplier: "Proveedor",
      fulfilledOn: "2026-10-07",
      revenuePyg: 500000,
      refundPyg: null,
      costs: zeroCosts,
      ownerReported: true,
    };
    expect(saleContribution(sale)).toBeNull();
    expect(
      saleContribution({
        ...sale,
        refundPyg: 10000,
        costs: { ...zeroCosts, productPyg: 300000 },
      })
    ).toBe(190000);
  });
  it("rejects impossible dates, prices for concepts and unreviewed delivery", () => {
    expect(CalendarDateSchema.safeParse("2026-02-29").success).toBe(false);
    expect(CalendarDateSchema.safeParse("2024-02-29").success).toBe(true);
    expect(
      CustomerQuotationSchema.safeParse({
        ...quote,
        lines: [{ ...quote.lines[0], productSlug: "concepto-algo" }],
      }).success
    ).toBe(false);
    expect(
      CustomerQuotationSchema.safeParse({ ...quote, status: "review_ready" })
        .success
    ).toBe(false);
    expect(
      CustomerQuotationSchema.safeParse({
        ...quote,
        lines: [{ ...quote.lines[0], unitPricePyg: 1.5 }],
      }).success
    ).toBe(false);
  });
  it("sums pair quantities, confirmed services and explicit delivery", () => {
    const services = [
      {
        id: "service",
        name: "Embalaje",
        kind: "packaging" as const,
        terms: "Confirmado",
        pricePyg: 20000,
        confirmedOn: "2026-10-07",
        enabled: true,
      },
    ];
    expect(quotationTotal(quote, services)).toBeNull();
    expect(
      quotationTotal(
        { ...quote, deliveryPyg: 10000, serviceOptionIds: ["service"] },
        services
      )
    ).toBe(330000);
    expect(
      quotationTotal(
        { ...quote, deliveryPyg: 10000, serviceOptionIds: ["missing"] },
        services
      )
    ).toBeNull();
  });
  it("bounds records, forbids extra payload keys and broken references", () => {
    const workspace = emptySalesWorkspace();
    expect(
      SalesWorkspaceSchema.parse(workspace).searchGapCollectionEnabled
    ).toBe(false);
    expect(
      SalesWorkspaceSchema.safeParse({
        ...workspace,
        customerPhone: "+595981000000",
      }).success
    ).toBe(false);
    expect(
      SalesWorkspaceSchema.safeParse({
        ...workspace,
        customerQuotations: [{ ...quote, enquiryId: "missing" }],
      }).success
    ).toBe(false);
    expect(
      SalesWorkspaceSchema.safeParse({
        ...workspace,
        customerQuotations: [{ ...quote, alias: "example@example.com" }],
      }).success
    ).toBe(false);
    expect(
      SaveSalesWorkspaceSchema.safeParse({ revision: -1, workspace }).success
    ).toBe(false);
    expect(SearchGapIntentSchema.safeParse("raw customer search").success).toBe(
      false
    );
  });
  it("projects only explicitly enabled campaign editorial fields", () => {
    const campaign = {
      id: "c1",
      slug: "ocasiones",
      title: "Ideas",
      description: "Elegí",
      body: "Texto",
      categorySlugs: [],
      guideSlugs: [],
      productSlugs: [],
      publicEnabled: false,
    };
    expect(publicCampaignProjection(campaign)).toBeNull();
    expect(
      publicCampaignProjection({ ...campaign, publicEnabled: true })
    ).toEqual({
      slug: "ocasiones",
      title: "Ideas",
      description: "Elegí",
      body: "Texto",
      categorySlugs: [],
      guideSlugs: [],
      productSlugs: [],
    });
    expect(
      priceFloor({
        id: "p",
        productId: 1,
        variantId: null,
        unit: "single",
        costs: emptyCosts(),
        targetContributionPyg: 1,
        confirmedOn: "2026-10-07",
      })
    ).toBeNull();
  });
});

it("requires unique record identities and keeps unknown period costs incomplete", () => {
  const workspace = emptySalesWorkspace();
  const enquiry = {
    id: "e1",
    alias: "Consulta A",
    designSlugs: [],
    categorySlug: null,
    stage: "new" as const,
    assignedOwner: "",
    createdOn: "2026-10-07",
    nextActionOn: null,
    nextAction: "",
    lossReason: null,
  };
  expect(
    SalesWorkspaceSchema.safeParse({
      ...workspace,
      enquiries: [enquiry, enquiry],
    }).success
  ).toBe(false);
  expect(
    SalesWorkspaceSchema.safeParse({
      ...workspace,
      enquiries: Array.from({ length: 201 }, (_, n) => ({
        ...enquiry,
        id: `e${n}`,
      })),
    }).success
  ).toBe(false);
});

it("keeps reviewed service prices when an option is retired or repriced", () => {
  const ready: CustomerQuotation = {
    ...quote,
    status: "review_ready",
    deliveryPyg: 10000,
    deliveryConditions: "Confirmado",
    deliveryConfirmedOn: "2026-10-07",
    serviceOptionIds: ["service"],
    servicesSnapshot: [
      {
        id: "service",
        name: "Embalaje",
        terms: "Cotizado",
        pricePyg: 20000,
        confirmedOn: "2026-10-07",
      },
    ],
  };
  const workspace = { ...emptySalesWorkspace(), customerQuotations: [ready] };
  expect(SalesWorkspaceSchema.safeParse(workspace).success).toBe(true);
  expect(
    quotationTotal(ready, [
      {
        id: "service",
        name: "Cambio",
        kind: "packaging",
        terms: "Nuevo",
        pricePyg: 50000,
        confirmedOn: "2026-10-07",
        enabled: false,
      },
    ])
  ).toBe(330000);
  expect(
    SalesWorkspaceSchema.safeParse({
      ...workspace,
      customerQuotations: [{ ...ready, servicesSnapshot: [] }],
    }).success
  ).toBe(false);
});
