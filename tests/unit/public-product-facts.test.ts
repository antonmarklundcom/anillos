import { describe, expect, it } from "vitest";
import {
  publicSpecifications,
  publicVariantAttributes,
  publicIdentifiers,
} from "@/lib/public-product-facts";
import { productJsonLd } from "@/lib/seo";

const verifiedAt = "2026-01-01T12:00:00Z";
describe("public confirmed facts and variants", () => {
  it("keeps verification staff identity out of all public projections and structured data", () => {
    const verifiedBy = { userId: 98765, label: "private-owner@example.test" };
    const specifications = {
      unit: "individual" as const,
      material: "Plata",
      verifiedAt,
      verifiedBy,
    };
    const attributes = {
      sizeSystem: "US",
      sizeLabel: "7",
      verifiedAt,
      verifiedBy,
    };
    const identifiers = { gtin: "4006381333931", verifiedAt, verifiedBy };
    const output = [
      publicSpecifications(specifications, "ring"),
      publicVariantAttributes(attributes, true),
      publicIdentifiers(identifiers, "ring"),
      productJsonLd({
        origin: new URL("https://example.test"),
        slug: "ring",
        name: "Anillo",
        images: [],
        specifications,
        variants: [
          {
            sku: "R-7",
            label: "7",
            pricePyg: 120000,
            available: 0,
            attributes,
            identifiers,
          },
        ],
      }),
    ];
    expect(JSON.stringify(output)).not.toContain("verifiedBy");
    expect(JSON.stringify(output)).not.toContain("98765");
    expect(JSON.stringify(output)).not.toContain("private-owner@example.test");
    expect(output[0]).toHaveProperty("verifiedAt");
  });
  it("does not infer facts from draft text or publish concept facts", () => {
    expect(publicSpecifications({ material: "Plata" }, "ring")).toBeUndefined();
    expect(
      publicSpecifications({ material: "Plata", verifiedAt }, "concepto-ring")
    ).toBeUndefined();
    expect(
      publicSpecifications(
        JSON.stringify({ material: "Plata", verifiedAt }),
        "ring"
      )?.material
    ).toBe("Plata");
    expect(
      publicSpecifications(
        { material: "Plata", verifiedAt: "2099-01-01T00:00:00Z" },
        "ring"
      )
    ).toBeUndefined();
  });
  it("requires independent measurement and identifier confirmation", () => {
    expect(publicVariantAttributes({ interiorMm: 18 }, true)).toBeUndefined();
    expect(
      publicVariantAttributes({ interiorMm: 18, verifiedAt }, true)?.interiorMm
    ).toBe(18);
    expect(
      publicIdentifiers({ gtin: "4006381333931", verifiedAt }, "ring")?.gtin
    ).toBe("4006381333931");
    expect(
      publicIdentifiers({ gtin: "4006381333932", verifiedAt }, "ring")
    ).toBeUndefined();
  });
  it("groups verified size variants with matching SKU offer links", () => {
    const input = {
      origin: new URL("https://example.com"),
      slug: "ring",
      name: "Anillo",
      images: ["https://example.com/ring.jpg"],
      specifications: { unit: "individual" as const, verifiedAt },
      variants: ["7", "8"].map((size) => ({
        sku: `R-${size}`,
        label: size,
        pricePyg: 120000,
        available: size === "7" ? 1 : 0,
        attributes: { sizeSystem: "US", sizeLabel: size, verifiedAt },
      })),
    };
    const data = productJsonLd(input);
    expect(data["@type"]).toBe("ProductGroup");
    const variants = data.hasVariant as Array<{
      url: string;
      offers: { url: string; availability: string };
    }>;
    expect(variants[0]?.url).toBe(
      "https://example.com/producto/ring?variante=R-7"
    );
    expect(variants[0]?.offers.url).toBe(variants[0]?.url);
    expect(variants[1]?.offers.availability).toBe(
      "https://schema.org/OutOfStock"
    );
    expect(variants[1]?.url).toBe(
      "https://example.com/producto/ring?variante=R-8"
    );
    expect(
      productJsonLd({ ...input, specifications: undefined })["@type"]
    ).toBe("Product");
    expect(
      productJsonLd({ ...input, slug: "concepto-ring" }).offers
    ).toBeUndefined();
  });
});
