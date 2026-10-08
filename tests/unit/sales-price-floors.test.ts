import { describe, expect, it } from "vitest";
import { salesPriceFloorPreview } from "@/domain/sales-price-floors";
import { emptyCosts, type SalesWorkspace } from "@/domain/sales-workspace";

const row = {
  id: 10,
  productId: 1,
  slug: "banda-real",
  name: "Banda",
  pricePyg: 100_000,
  specifications: {
    unit: "individual",
    verifiedAt: "2026-01-01T12:00:00.000Z",
    verifiedBy: { userId: 1, label: "owner" },
  },
};
const profile: SalesWorkspace["productCostProfiles"][number] = {
  id: "cost",
  productId: 1,
  variantId: null,
  unit: "single",
  costs: {
    productPyg: 80_000,
    freightPyg: 0,
    taxPyg: 0,
    packagingPyg: 0,
    paymentFeePyg: 0,
    deliveryPyg: 0,
    servicePyg: 0,
    otherPyg: 0,
  },
  targetContributionPyg: 20_000,
  confirmedOn: "2026-01-01",
};
describe("cost floor preview", () => {
  it("flags a discounted price below complete same-unit costs using the actual bulk rounding", () => {
    expect(salesPriceFloorPreview([row], [profile], -10, 1000)).toEqual({
      evaluated: 1,
      unknown: 0,
      below: [
        {
          variantId: 10,
          name: "Banda",
          proposedPyg: 90_000,
          floorPyg: 100_000,
        },
      ],
    });
  });
  it("never judges unknown costs, unverified units, concepts or pair costs against single prices", () => {
    for (const [product, costs] of [
      [row, { ...profile, unit: "pair" }],
      [row, { ...profile, costs: emptyCosts() }],
      [{ ...row, specifications: { unit: "individual" } }, profile],
      [{ ...row, slug: "concepto-banda" }, profile],
    ] as const) {
      expect(salesPriceFloorPreview([product], [costs], -10, 100)).toEqual({
        evaluated: 0,
        unknown: 1,
        below: [],
      });
    }
  });
  it("prefers variant evidence and checks every variant rather than a five-example sample", () => {
    const rows = Array.from({ length: 7 }, (_, i) => ({ ...row, id: i + 1 }));
    const specific = {
      ...profile,
      id: "variant",
      variantId: 1,
      targetContributionPyg: 0,
    };
    const result = salesPriceFloorPreview(rows, [profile, specific], -10, 100);
    expect(result.evaluated).toBe(7);
    expect(result.below.map((item) => item.variantId)).toEqual([
      2, 3, 4, 5, 6, 7,
    ]);
  });
});
