import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { CartSheet } from "./cart-sheet";

const cart = vi.hoisted(() => ({
  lines: [] as Array<{
    variantId: number;
    productSlug: string;
    name: string;
    variantLabel: string;
    unitPricePyg: number;
    qty: number;
  }>,
  isOpen: true,
  issues: [],
  freeShipping: null,
  isSyncing: false,
  close: vi.fn(),
  setQty: vi.fn(),
  remove: vi.fn(),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/colecciones" }));
vi.mock("@/lib/cart-store", () => ({
  useCart: () => cart,
  cartSubtotal: () => 99999,
}));
vi.mock("@/app/actions/cart-consulta", () => ({ cartWhatsAppLink: vi.fn() }));
vi.mock("@/components/free-shipping-bar", () => ({
  FreeShippingBar: () => <div>Oferta de envío</div>,
}));
afterEach(() => {
  cleanup();
  cart.lines = [];
});

describe("enquiry cart copy", () => {
  it("describes an empty non-binding selection without tax or shopping claims", () => {
    render(<CartSheet enquiryMode />);
    expect(screen.getByText("Modelos para consultar")).toBeInTheDocument();
    expect(screen.getByText("Seguí explorando")).toBeInTheDocument();
    expect(
      screen.getByText(/no crea un pedido, reserva ni pago/)
    ).toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/IVA|Seguí comprando|servidor/);
  });
  it("does not present legacy cart prices or free shipping as enquiry facts", () => {
    cart.lines = [
      {
        variantId: 1,
        productSlug: "modelo-real",
        name: "Modelo real",
        variantLabel: "Variante real",
        unitPricePyg: 99999,
        qty: 1,
      },
    ];
    render(<CartSheet enquiryMode />);
    expect(screen.getByText("Precio por confirmar")).toBeInTheDocument();
    expect(screen.getByText("Revisar cómo consultar")).toBeInTheDocument();
    expect(screen.queryByText("Oferta de envío")).not.toBeInTheDocument();
    expect(document.body).not.toHaveTextContent(/99\.999|IVA|Subtotal/);
  });
});
