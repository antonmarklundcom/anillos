import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProductQuickView } from "@/components/product-quick-view";
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));
afterEach(cleanup);
it("keeps concept preview illustrative and opens its ficha without money or purchase controls", () => {
  const product = {
    slug: "concepto-prueba",
    name: "Diseño de prueba",
    categorySlug: "anillos-compromiso",
    image: null,
    concept: true,
    unit: "Unidad por confirmar",
    pricePyg: 999999,
    supplierDetails: { reference: "PRIVATE-REFERENCE" },
  };
  render(<ProductQuickView product={product} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Vista rápida: Diseño de prueba" })
  );
  const dialog = screen.getByRole("dialog", { name: "Diseño de prueba" });
  expect(dialog).toHaveAccessibleDescription(/Diseño ilustrativo/);
  expect(
    screen.getByRole("link", { name: "Ver ficha completa →" })
  ).toHaveAttribute("href", "/producto/concepto-prueba");
  expect(dialog).not.toHaveTextContent("999999");
  expect(dialog).not.toHaveTextContent("PRIVATE-REFERENCE");
  expect(
    screen.queryByRole("button", { name: /comprar|agregar al carrito/i })
  ).not.toBeInTheDocument();
});
