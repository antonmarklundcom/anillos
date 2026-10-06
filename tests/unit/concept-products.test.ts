import { describe, expect, it } from "vitest";
import { isConceptProduct } from "@/lib/concept-products";
import { productJsonLd } from "@/lib/seo";

describe("reserved illustrative products", () => {
  it("recognizes the reserved prefix without hiding legitimate similarly named products", () => {
    expect(isConceptProduct("concepto-banda")).toBe(true);
    expect(isConceptProduct("CONCEPTO-banda")).toBe(true);
    expect(isConceptProduct("anillo-concepto-banda")).toBe(false);
    expect(isConceptProduct("conceptual-banda")).toBe(false);
  });

  it("omits concept Offers even when price, stock and selling mode say otherwise", () => {
    const input = {
      origin: new URL("https://anillos.com.py"),
      slug: "concepto-banda",
      name: "Referencia",
      images: [],
      saleMode: "stock" as const,
      showPrice: true,
      variants: [
        { sku: "REFERENCE", label: "17 mm", pricePyg: 123456, available: 50 },
      ],
    };
    expect(JSON.parse(JSON.stringify(productJsonLd(input)))).not.toHaveProperty(
      "offers"
    );
    expect(productJsonLd({ ...input, slug: "banda-real" })).toMatchObject({
      offers: [
        {
          price: 123456,
          priceCurrency: "PYG",
          availability: "https://schema.org/InStock",
        },
      ],
    });
  });
});
