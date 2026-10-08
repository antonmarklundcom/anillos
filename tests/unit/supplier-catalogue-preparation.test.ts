import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { parseCatalogo } from "@/domain/catalog-import";
import {
  supplierDraftCsv,
  type SupplierModel,
} from "../../scripts/supplier-catalogue-data";

const manifest = JSON.parse(
  readFileSync("docs/supplier-models-2026-10.json", "utf8")
) as { models: SupplierModel[] };

describe("private supplier catalogue preparation", () => {
  it("prepares every exact reference using the existing import contract without offers or media", () => {
    const output = parseCatalogo(supplierDraftCsv(manifest.models));
    expect(output.errores).toEqual([]);
    expect(output.productos).toHaveLength(12);
    for (const [index, product] of output.productos.entries()) {
      const source = manifest.models[index];
      const variant = product.variants[0];
      if (!source || !variant) throw new Error("Missing candidate or variant");
      expect(product.slug).toBe(source.slug);
      expect(product.saleMode).toBe("enquiry");
      expect(product.showPrice).toBe(false);
      expect(product.variants).toHaveLength(1);
      expect(variant.pricePyg).toBe(0);
      expect(variant.onHand).toBe(0);
      expect(product.fotos).toEqual([]);
      expect(product.specifications).toBeUndefined();
      expect(product.supplierDetails).toEqual({
        reference: source.reference,
        sourceUrl: source.sourceUrl,
      });
      expect(product.supplierDetails?.verifiedAt).toBeUndefined();
    }
  });
  it("keeps the committed CSV reproducible", () => {
    expect(readFileSync("docs/supplier-candidates-draft.csv", "utf8").replaceAll("\r\n", "\n")).toBe(
      supplierDraftCsv(manifest.models).replaceAll("\r\n", "\n")
    );
  });
  it("rejects concept destinations, unknown collections and duplicate research identities", () => {
    const model = manifest.models[0];
    if (!model) throw new Error("Missing first candidate");
    expect(() =>
      supplierDraftCsv([{ ...model, slug: "concepto-solitario" }])
    ).toThrow();
    expect(() =>
      supplierDraftCsv([{ ...model, category: "inventada" }])
    ).toThrow();
    expect(() => supplierDraftCsv([model, model])).toThrow();
  });
});
