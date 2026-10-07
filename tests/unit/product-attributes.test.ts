import { describe, expect, it } from "vitest";
import {
  ProductSpecificationsSchema,
  SupplierDetailsSchema,
  VariantAttributesSchema,
  VerifiedIdentifiersSchema,
  attributeFormData,
  validGtin,
} from "@/lib/product-attributes";
import { parseCatalogo } from "@/domain/catalog-import";
import { toCsv } from "@/lib/csv";

const verifiedAt = "2026-01-01T12:00:00.000Z";
describe("optional supplier-ready product attributes", () => {
  it("keeps unknown facts empty and requires explicit verification for selling units", () => {
    expect(ProductSpecificationsSchema.parse({})).toEqual({});
    expect(
      ProductSpecificationsSchema.safeParse({ unit: "pair" }).success
    ).toBe(false);
    expect(
      ProductSpecificationsSchema.parse({
        material: " Plata 925 ",
        unit: "pair",
        verifiedAt,
      })
    ).toMatchObject({ material: "Plata 925", unit: "pair" });
    expect(
      ProductSpecificationsSchema.safeParse({ fabricatedCertificate: "yes" })
        .success
    ).toBe(false);
  });
  it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY, 1001])(
    "rejects invalid physical measurement %s",
    (widthMm) => {
      expect(ProductSpecificationsSchema.safeParse({ widthMm }).success).toBe(
        false
      );
      expect(
        VariantAttributesSchema.safeParse({ interiorMm: widthMm }).success
      ).toBe(false);
    }
  );
  it("keeps pair measurements independent without guessing a commercial size system", () => {
    expect(
      VariantAttributesSchema.parse({
        interiorMm: 17.2,
        interiorMmSecond: 18.4,
      })
    ).toEqual({ interiorMm: 17.2, interiorMmSecond: 18.4 });
  });
  it("only accepts HTTPS source evidence and supported photo provenance", () => {
    expect(
      SupplierDetailsSchema.safeParse({
        sourceUrl: "http://supplier.example/item",
      }).success
    ).toBe(false);
    expect(
      SupplierDetailsSchema.parse({
        sourceUrl: "https://supplier.example/item",
        imageProvenance: "supplier-authorized",
        verifiedAt,
      })
    ).toMatchObject({ imageProvenance: "supplier-authorized" });
  });
  it("normalizes checked timestamps to UTC and rejects future verification", () => {
    expect(
      ProductSpecificationsSchema.parse({
        verifiedAt: "2026-01-01T09:00:00-03:00",
      }).verifiedAt
    ).toBe(verifiedAt);
    expect(
      SupplierDetailsSchema.safeParse({ verifiedAt: "2099-01-01T00:00:00Z" })
        .success
    ).toBe(false);
    expect(
      VariantAttributesSchema.safeParse({ verifiedAt: "not-a-date" }).success
    ).toBe(false);
  });
  it("checks actual GTIN length/checksum and never infers verification", () => {
    expect(validGtin("4006381333931")).toBe(true);
    expect(validGtin("4006381333932")).toBe(false);
    expect(validGtin("12345")).toBe(false);
    expect(
      VerifiedIdentifiersSchema.safeParse({ gtin: "4006381333931" }).success
    ).toBe(false);
    expect(VerifiedIdentifiersSchema.safeParse({ verifiedAt }).success).toBe(
      false
    );
    expect(
      VerifiedIdentifiersSchema.parse({ gtin: "4006381333931", verifiedAt })
        .gtin
    ).toBe("4006381333931");
  });
  it("reads comma-decimal millimetres while preserving textual identifiers", () => {
    const data = new FormData();
    data.set("interiorMm", "17,5");
    data.set("gtin", "00012345600012");
    data.set("material", "");
    expect(attributeFormData(data, ["interiorMm", "gtin", "material"])).toEqual(
      { interiorMm: 17.5, gtin: "00012345600012" }
    );
  });
});

describe("attribute CSV extensions", () => {
  const headers = [
    "SKU",
    "Producto",
    "Categoría",
    "Precio",
    "Stock",
    "Ficha técnica JSON",
    "Proveedor JSON",
    "Atributos variante JSON",
    "Identificadores JSON",
    "Título SEO",
    "Descripción SEO",
  ];
  const row = [
    "REAL-1",
    "Pieza real",
    "Anillos",
    "85000",
    "5",
    JSON.stringify({ material: "Plata 925", unit: "individual", verifiedAt }),
    JSON.stringify({
      reference: "SUP-5",
      sourceUrl: "https://supplier.example/item",
    }),
    JSON.stringify({ interiorMm: 17.5, sizeSystem: "diámetro mm", verifiedAt }),
    JSON.stringify({ gtin: "4006381333931", verifiedAt }),
    "Anillo de plata",
    "Composición verificada en la ficha.",
  ];
  it("imports verified optional facts without changing integer money or stock values", () => {
    const result = parseCatalogo(toCsv(headers, [row]));
    expect(result.errores).toEqual([]);
    expect(result.productos[0]).toMatchObject({
      seoTitle: "Anillo de plata",
      specifications: { material: "Plata 925" },
      supplierDetails: { reference: "SUP-5" },
      variants: [
        {
          pricePyg: 85000,
          onHand: 5,
          attributes: { interiorMm: 17.5 },
          identifiers: { gtin: "4006381333931" },
        },
      ],
    });
  });
  it("rejects malformed or unverified identifier data with its line number", () => {
    const invalid = [...row];
    invalid[8] = JSON.stringify({ gtin: "4006381333931" });
    expect(parseCatalogo(toCsv(headers, [invalid])).errores).toEqual([
      expect.stringMatching(/Línea 2.*JSON/),
    ]);
  });
  it("rejects conflicting product facts across variants rather than silently choosing one", () => {
    const second = [...row];
    second[0] = "REAL-2";
    second[5] = JSON.stringify({
      material: "Oro",
      unit: "individual",
      verifiedAt,
    });
    expect(parseCatalogo(toCsv(headers, [row, second])).errores).toEqual([
      expect.stringMatching(/Línea 3.*specifications/),
    ]);
  });
  it("accepts explicit JSON null to clear metadata and leaves absent columns untouched", () => {
    const cleared = [...row];
    cleared[5] = "null";
    expect(
      parseCatalogo(toCsv(headers, [cleared])).productos[0]?.specifications
    ).toBeNull();
    const original = parseCatalogo(
      toCsv(headers.slice(0, 5), [row.slice(0, 5)])
    ).productos[0]!;
    expect(original).not.toHaveProperty("specifications");
    expect(original.variants[0]).not.toHaveProperty("identifiers");
  });
});
