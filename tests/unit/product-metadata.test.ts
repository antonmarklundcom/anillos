import { describe, expect, it } from "vitest";
import { productMetaDescription } from "@/store/product-metadata";
const product = {
  name: "Anillo de prueba",
  categoryName: "Plata",
  cheapestPrice: 123456,
};
describe("product price visibility in search and share descriptions", () => {
  it.each(["enquiry", "showcase"] as const)(
    "never exposes internal price for %s",
    (saleMode) => {
      const description = productMetaDescription({ ...product, saleMode });
      expect(description).toContain(product.name);
      expect(description).not.toMatch(/123|456|IVA/);
    }
  );
  it("omits prices when the merchant has explicitly hidden them", () => {
    expect(
      productMetaDescription({
        ...product,
        saleMode: "stock",
        showPrice: false,
      })
    ).not.toMatch(/123|456|IVA/);
  });
  it("keeps a visible stock price and tax context", () => {
    expect(productMetaDescription({ ...product, saleMode: "stock" })).toContain(
      "IVA incluido"
    );
    expect(productMetaDescription({ ...product, saleMode: "stock" })).toContain(
      "123"
    );
  });
  it("prefers confirmed descriptive copy and strips markdown", () => {
    expect(
      productMetaDescription({
        ...product,
        description: "**Detalle confirmado** por el proveedor.",
      })
    ).toBe("Detalle confirmado por el proveedor.");
  });
  it("does not advertise an unconfirmed zero price as a free product", () => {
    expect(
      productMetaDescription({ ...product, cheapestPrice: 0 })
    ).not.toContain("IVA incluido");
  });
});
