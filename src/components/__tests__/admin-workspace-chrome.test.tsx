import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CartSheet } from "@/components/cart-sheet";
import { useCart } from "@/lib/cart-store";

const route = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => route.pathname }));
vi.mock("@/app/actions/cart", () => ({ revalidateCart: vi.fn() }));
vi.mock("@/app/actions/cart-consulta", () => ({ cartWhatsAppLink: vi.fn() }));

beforeEach(() => {
  route.pathname = "/";
  useCart.setState({ lines: [], issues: [], isOpen: true });
});
afterEach(() => {
  cleanup();
  useCart.setState({ isOpen: false });
});

describe("admin workspace storefront separation", () => {
  it("closes an already open shopping cart when navigating into the panel", () => {
    const { rerender } = render(<CartSheet />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    route.pathname = "/admin/pedidos/123";
    rerender(<CartSheet />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(useCart.getState().isOpen).toBe(false);
    route.pathname = "/";
    rerender(<CartSheet />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("keeps shopping available on public routes without matching unrelated prefixes", () => {
    route.pathname = "/administracion-de-joyas";
    render(<CartSheet />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
