import { describe, expect, it } from "vitest";
import {
  publicSpecifications,
  publicVariantAttributes,
  publicIdentifiers,
} from "@/lib/public-product-facts";
import { productJsonLd } from "@/lib/seo";

const verifiedAt = "2026-01-01T12:00:00Z";
describe("public confirmed facts and variants", () => {
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
        available: 1,
        attributes: { sizeSystem: "US", sizeLabel: size, verifiedAt },
      })),
    };
    const data = productJsonLd(input);
    expect(data["@type"]).toBe("ProductGroup");
    const variants = data.hasVariant as Array<{
      url: string;
      offers: { url: string };
    }>;
    expect(variants[0]?.url).toBe(
      "https://example.com/producto/ring?variante=R-7"
    );
    expect(variants[0]?.offers.url).toBe(variants[0]?.url);
    expect(
      productJsonLd({ ...input, specifications: undefined })["@type"]
    ).toBe("Product");
    expect(
      productJsonLd({ ...input, slug: "concepto-ring" }).offers
    ).toBeUndefined();
  });
});
