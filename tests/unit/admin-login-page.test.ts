import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ForbiddenError, UnauthorizedError } from "@/lib/session";

const mocks = vi.hoisted(() => ({ validate: vi.fn(), redirect: vi.fn() }));
vi.mock("@/lib/admin-guard", () => ({ requireAdminSession: mocks.validate }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/components/admin/login-form", () => ({
  LoginForm: ({ next }: { next: string }) =>
    createElement(
      "form",
      { "data-next": next },
      createElement("input", { name: "password", type: "password" })
    ),
}));
vi.mock("@/i18n", () => ({ t: (key: string) => key }));

import AdminLoginPage from "@/app/admin/login/page";
beforeEach(() => {
  vi.clearAllMocks();
  mocks.redirect.mockImplementation((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  });
  mocks.validate.mockRejectedValue(new UnauthorizedError());
});
const page = (next?: string | string[]) =>
  AdminLoginPage({ searchParams: Promise.resolve({ next }) });
const actor = (role: "owner" | "staff" | "vendedor") => ({
  userId: 7,
  email: "fixture@example.test",
  role,
});

describe("admin login validates the current database session", () => {
  it("renders login when the database session guard rejects access", async () => {
    // Missing, inactive and revoked identities share this guard outcome;
    // their real database semantics are exercised by integration tests.
    mocks.validate.mockRejectedValue(new UnauthorizedError());
    const html = renderToStaticMarkup(await page("/admin/productos"));
    expect(html).toContain('name="password"');
    expect(html).toContain('data-next="/admin/productos"');
    expect(mocks.validate).toHaveBeenCalledTimes(1);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
  it("renders login for an invalid signed role", async () => {
    mocks.validate.mockRejectedValue(new ForbiddenError());
    expect(renderToStaticMarkup(await page())).toContain('name="password"');
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
  it.each(["owner", "staff", "vendedor"] as const)(
    "uses the validated %s role for its default destination",
    async (role) => {
      mocks.validate.mockResolvedValue(actor(role));
      const destination = role === "vendedor" ? "/admin/pedidos" : "/admin";
      await expect(page()).rejects.toThrow(`NEXT_REDIRECT:${destination}`);
      expect(mocks.redirect).toHaveBeenCalledWith(destination);
    }
  );
  it("preserves a safe explicit destination and its query", async () => {
    mocks.validate.mockResolvedValue(actor("owner"));
    await expect(page("/admin/pedidos?estado=pagado")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/pedidos?estado=pagado"
    );
  });
  it("uses the first next parameter consistently", async () => {
    mocks.validate.mockResolvedValue(actor("staff"));
    await expect(page(["/admin/productos", "/admin/login"])).rejects.toThrow(
      "NEXT_REDIRECT:/admin/productos"
    );
  });
  it("honors a database role change instead of trusting the old owner cookie", async () => {
    mocks.validate.mockResolvedValue(actor("vendedor"));
    await expect(page("https://external.example.test")).rejects.toThrow(
      "NEXT_REDIRECT:/admin/pedidos"
    );
  });
  it.each([
    "/admin/login",
    "/admin/login?next=/admin/login",
    "/admin/pedidos/../login",
    "/admin/%6cogin",
    "https://external.example.test/",
  ])(
    "does not redirect to unsafe or self-login destination %s",
    async (next) => {
      mocks.validate.mockResolvedValue(actor("owner"));
      await expect(page(next)).rejects.toThrow("NEXT_REDIRECT:/admin");
      expect(mocks.redirect).toHaveBeenCalledWith("/admin");
    }
  );
  it("does not hide infrastructure failures as a signed-out session", async () => {
    const failure = new Error("Synthetic database failure");
    mocks.validate.mockRejectedValue(failure);
    await expect(page()).rejects.toBe(failure);
    expect(mocks.redirect).not.toHaveBeenCalled();
  });
});
