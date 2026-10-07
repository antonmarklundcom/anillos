import { expect, it } from "vitest";
import { variantFromSku, variantUrl } from "@/lib/variant-url";
import {
  comparisonAvailability,
  comparisonPrice,
  comparisonSlugs,
  comparisonUrl,
} from "@/lib/product-comparison";
import type { CatalogProduct } from "@/db/queries";
const variants = [
  {
    id: 1,
    sku: "RING-A/17",
    label: "17 mm",
    available: 3,
    pricePyg: 120000,
    compareAtPyg: null,
  },
  {
    id: 2,
    sku: "RING-B",
    label: "18 mm",
    available: 0,
    pricePyg: 140000,
    compareAtPyg: null,
  },
];
const product: CatalogProduct = {
  id: 1,
  slug: "real-ring",
  name: "Anillo",
  brand: null,
  ivaRate: 10,
  categoryName: "Anillos",
  categorySlug: "anillos",
  image: null,
  variants,
};
it("only resolves exact valid share selections and does not select unavailable stock", () => {
  expect(variantFromSku(variants, "RING-A/17")?.id).toBe(1);
  expect(variantFromSku(variants, "RING-B")?.id).toBe(2);
  expect(variantFromSku(variants, ["RING-A/17"])).toBeUndefined();
  expect(variantFromSku(variants, "unknown")).toBeUndefined();
});
it("encodes SKU and preserves existing URL data", () => {
  expect(
    variantUrl("/producto/real-ring?utm_source=direct#comprar", "RING-A/17")
  ).toBe("/producto/real-ring?utm_source=direct&variante=RING-A%2F17#comprar");
});
it("bounds comparison to three unique safe slugs in order", () => {
  expect(comparisonSlugs(["a,b", "a", "../private", "c", "d"])).toEqual([
    "a",
    "b",
    "c",
  ]);
  expect(comparisonUrl(["a", "b"])).toBe("/comparar?producto=a&producto=b");
});
it("never reveals hidden or concept prices/stock and labels enquiry prices", () => {
  expect(comparisonPrice({ ...product, showPrice: false })).toBe(
    "Precio por confirmar"
  );
  expect(comparisonPrice({ ...product, slug: "concepto-prueba" })).toBe(
    "Precio por confirmar"
  );
  expect(
    comparisonAvailability({ ...product, slug: "concepto-prueba" })
  ).toMatch(/no disponible para compra/);
  expect(comparisonAvailability({ ...product, saleMode: "enquiry" })).toMatch(
    /por confirmar/
  );
  expect(comparisonPrice({ ...product, saleMode: "enquiry" })).toContain(
    "orientativo"
  );
});
