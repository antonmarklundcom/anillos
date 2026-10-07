import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProductCard } from "@/components/product-card";
import { formatGs } from "@/lib/money";

vi.mock("@/components/wishlist-button", () => ({
  WishlistButton: ({ pricePyg }: { pricePyg?: number }) => (
    <button type="button" data-price={pricePyg}>
      Guardar favorito
    </button>
  ),
}));
vi.mock("@/components/product-image", () => ({
  ProductImage: () => <span>Vista del producto</span>,
}));
afterEach(cleanup);

it("hides price and stock for a reserved concept even with mistaken selling fields", () => {
  render(
    <ProductCard
      product={{
        id: 1,
        slug: "concepto-prueba",
        name: "Idea de anillo",
        categoryName: "Plata",
        categorySlug: "plata-925",
        brand: null,
        ivaRate: 10,
        image: null,
        saleMode: "stock",
        showPrice: true,
        variants: [
          {
            id: 1,
            sku: "IDEA",
            label: "17",
            pricePyg: 120000,
            compareAtPyg: null,
            available: 10,
          },
        ],
      }}
    />
  );
  expect(screen.queryByText(formatGs(120000))).toBeNull();
  expect(screen.queryByText("Sin stock")).toBeNull();
  expect(
    screen.getByText(/Diseño ilustrativo \/ a pedido sujeto a confirmación/)
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Guardar favorito" })
  ).not.toHaveAttribute("data-price");
});

it("does not display a legacy zero price or count its stock, and selects a valid priced variant", () => {
  const product = {
    id: 1,
    slug: "anillo-prueba",
    name: "Anillo de prueba",
    categoryName: "Plata",
    categorySlug: "plata-925",
    brand: null,
    ivaRate: 10,
    image: null,
    variants: [
      {
        id: 1,
        sku: "ZERO",
        label: "17",
        pricePyg: 0,
        compareAtPyg: null,
        available: 10,
      },
    ],
  };
  const { rerender } = render(<ProductCard product={product} />);
  expect(screen.queryByText(formatGs(0))).toBeNull();
  expect(
    screen.getByRole("button", { name: "Guardar favorito" })
  ).not.toHaveAttribute("data-price");
  expect(screen.getByText("Sin stock")).toBeInTheDocument();
  rerender(
    <ProductCard
      product={{
        ...product,
        variants: [
          ...product.variants,
          {
            id: 2,
            sku: "REAL",
            label: "18",
            pricePyg: 120000,
            compareAtPyg: null,
            available: 1,
          },
        ],
      }}
    />
  );
  expect(screen.getByText(formatGs(120000))).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Guardar favorito" })
  ).toHaveAttribute("data-price", "120000");
  expect(screen.queryByText(formatGs(0))).toBeNull();
});

it("keeps the wishlist control beside the product link rather than nested inside it", () => {
  render(
    <ProductCard
      product={{
        id: 1,
        slug: "anillo-prueba",
        name: "Anillo de prueba",
        categoryName: "Plata",
        categorySlug: "plata-925",
        brand: null,
        ivaRate: 10,
        image: null,
        variants: [],
      }}
    />
  );
  const link = screen.getByRole("link", { name: /Anillo de prueba/ });
  const button = screen.getByRole("button", { name: "Guardar favorito" });
  expect(button.closest("a")).toBeNull();
  expect(button.parentElement).toBe(link.parentElement);
});
