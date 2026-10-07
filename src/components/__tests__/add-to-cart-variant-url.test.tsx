import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AddToCart } from "@/components/add-to-cart";
import type { CatalogProductDetail } from "@/db/queries";

vi.mock("@/components/stock-alert-form", () => ({
  StockAlertForm: () => null,
}));
vi.mock("@/components/variant-inquiry-link", () => ({
  VariantInquiryLink: () => null,
}));
vi.mock("@/lib/funnel", () => ({ sendFunnelEvent: vi.fn() }));
vi.mock("@/lib/cart-store", () => ({ useCart: () => vi.fn() }));
vi.mock("@/i18n/client", () => ({ t: (key: string) => key }));
const product: CatalogProductDetail = {
  id: 1,
  slug: "anillo-real",
  name: "Anillo",
  categoryName: "Anillos",
  categorySlug: "anillos",
  brand: null,
  ivaRate: 10,
  image: null,
  images: [],
  description: null,
  variants: [
    {
      id: 1,
      sku: "SKU-17",
      label: "17 mm",
      available: 2,
      pricePyg: 120000,
      compareAtPyg: null,
    },
    {
      id: 2,
      sku: "SKU-18",
      label: "18 mm",
      available: 4,
      pricePyg: 130000,
      compareAtPyg: null,
    },
    {
      id: 3,
      sku: "SKU-19",
      label: "19 mm",
      available: 0,
      pricePyg: 140000,
      compareAtPyg: null,
    },
  ],
};
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.history.replaceState(null, "", "/");
});
it("selects a valid shared SKU ahead of local memory and keeps selection shareable", () => {
  window.localStorage.setItem(
    "tienda-py-variante",
    JSON.stringify({ "anillo-real": 1 })
  );
  window.history.replaceState(
    null,
    "",
    "/producto/anillo-real?variante=SKU-18&utm_source=direct"
  );
  render(<AddToCart product={product} initialVariantSku="SKU-18" />);
  expect(screen.getByRole("button", { name: "18 mm" })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
  fireEvent.click(screen.getByRole("button", { name: "17 mm" }));
  expect(new URLSearchParams(window.location.search).get("variante")).toBe(
    "SKU-17"
  );
  expect(new URLSearchParams(window.location.search).get("utm_source")).toBe(
    "direct"
  );
  expect(
    screen.getByRole("link", { name: "Enlace a esta variante" })
  ).toHaveAttribute("href", "/producto/anillo-real?variante=SKU-17");
});
it("selects a sold-out shared SKU while keeping purchase disabled", () => {
  window.history.replaceState(
    null,
    "",
    "/producto/anillo-real?variante=SKU-19"
  );
  render(<AddToCart product={product} initialVariantSku="SKU-19" />);
  expect(
    screen.getByRole("button", { name: "19 mm · Agotado" })
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("button", { name: "19 mm · Agotado" })
  ).not.toBeDisabled();
  expect(screen.getByRole("button", { name: "stock.sin" })).toBeDisabled();
});

it("removes an invalid SKU query without losing other parameters", () => {
  window.history.replaceState(
    null,
    "",
    "/producto/anillo-real?variante=missing&utm_source=direct"
  );
  render(<AddToCart product={product} initialVariantSku="missing" />);
  expect(new URLSearchParams(window.location.search).has("variante")).toBe(
    false
  );
  expect(new URLSearchParams(window.location.search).get("utm_source")).toBe(
    "direct"
  );
});

it("keeps a legacy zero-price variant unpriced and unpurchasable", () => {
  render(
    <AddToCart
      product={{
        ...product,
        variants: [{ ...product.variants[0]!, pricePyg: 0 }],
      }}
    />
  );
  expect(screen.getByRole("button", { name: "stock.sin" })).toBeDisabled();
  expect(screen.queryByText(/Gs\.?\s*0/)).toBeNull();
});
