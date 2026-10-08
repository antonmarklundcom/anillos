import type { SalesWorkspace } from "./sales-workspace";
import { priceFloor } from "./sales-workspace";
import { precioAjustado, type RoundTo } from "./admin-bulk";
import { publicSpecifications } from "@/lib/public-product-facts";

type PriceVariant = {
  id: number;
  productId: number;
  slug: string;
  name: string;
  pricePyg: number;
  specifications: unknown;
};
export type PriceFloorPreview = {
  evaluated: number;
  unknown: number;
  below: {
    variantId: number;
    name: string;
    proposedPyg: number;
    floorPyg: number;
  }[];
};

/** A pair cost never assesses a single-ring price. Unknown costs stay unknown. */
export function salesPriceFloorPreview(
  rows: PriceVariant[],
  profiles: SalesWorkspace["productCostProfiles"],
  percent: number,
  roundTo: RoundTo
): PriceFloorPreview {
  const result: PriceFloorPreview = { evaluated: 0, unknown: 0, below: [] };
  for (const row of rows) {
    const unit = publicSpecifications(row.specifications, row.slug)?.unit;
    const normalizedUnit = unit === "individual" ? "single" : unit;
    const candidates = profiles
      .filter(
        (profile) =>
          profile.productId === row.productId &&
          profile.unit === normalizedUnit &&
          (profile.variantId === null || profile.variantId === row.id)
      )
      .sort(
        (a, b) =>
          Number(b.variantId !== null) - Number(a.variantId !== null) ||
          b.confirmedOn.localeCompare(a.confirmedOn) ||
          a.id.localeCompare(b.id)
      );
    const floor = candidates[0] ? priceFloor(candidates[0]) : null;
    if (floor === null || !normalizedUnit) {
      result.unknown++;
      continue;
    }
    result.evaluated++;
    const proposedPyg = precioAjustado(row.pricePyg, percent, roundTo);
    if (proposedPyg < floor)
      result.below.push({
        variantId: row.id,
        name: row.name,
        proposedPyg,
        floorPyg: floor,
      });
  }
  return result;
}
