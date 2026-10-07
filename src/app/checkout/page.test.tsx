import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { waLink } from "@/lib/py";

const checks = vi.hoisted(() => ({
  readyPayments: vi.fn(async () => []),
  zones: vi.fn(),
  customer: vi.fn(),
  coupons: vi.fn(),
  contact: vi.fn(),
}));
vi.mock("@/domain/payment-readiness", () => ({
  readyPaymentMethods: checks.readyPayments,
}));
vi.mock("@/domain/shipping", () => ({ listShippingZones: checks.zones }));
vi.mock("@/lib/customer-session", () => ({ currentCustomer: checks.customer }));
vi.mock("@/domain/coupons", () => ({ hasUsableCoupons: checks.coupons }));
vi.mock("@/lib/comercio", () => ({ waLinkPublico: checks.contact }));
vi.mock("@/components/checkout-form", () => ({ CheckoutForm: () => <form /> }));
import CheckoutPage from "./page";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

it("offers WhatsApp with no cart, buyer fields, payment form or delivery quote when payments are paused", async () => {
  checks.contact.mockImplementation(async (message: string) =>
    waLink("+595992279599", message)
  );
  render(await CheckoutPage());
  const link = screen.getByRole("link", {
    name: /Continuar consulta por WhatsApp/,
  });
  const url = new URL(link.getAttribute("href")!);
  expect(url.hostname).toBe("wa.me");
  expect(url.pathname).toBe("/595992279599");
  expect(url.searchParams.get("text")).toContain("sin pedido, reserva ni pago");
  expect(url.searchParams.get("text")).toContain(
    "precio y entrega por confirmar"
  );
  expect(document.querySelector("form, input")).toBeNull();
  expect(checks.zones).not.toHaveBeenCalled();
  expect(checks.customer).not.toHaveBeenCalled();
  expect(checks.coupons).not.toHaveBeenCalled();
});

it("keeps an honest contact fallback when no WhatsApp link can be resolved", async () => {
  checks.contact.mockResolvedValue(null);
  render(await CheckoutPage());
  expect(
    screen.getByText(/WhatsApp todavía no está habilitado/)
  ).toBeInTheDocument();
  expect(screen.queryByRole("link", { name: /Continuar consulta/ })).toBeNull();
  expect(
    screen.getByRole("link", { name: "Contacto y consultas" })
  ).toHaveAttribute("href", "/contacto");
});
