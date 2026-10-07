import { beforeEach, describe, expect, it, vi } from "vitest";
import { can } from "@/lib/permissions";

const mocks = vi.hoisted(() => ({ guard: vi.fn(), name: vi.fn() }));
vi.mock("@/lib/admin-guard", () => ({ requireCapabilityPage: mocks.guard }));
vi.mock("@/lib/marca", () => ({ nombreTienda: mocks.name }));
import AdminSeoPage, { dynamic, metadata } from "../page";

describe("private owner coverage page", () => {
  beforeEach(() => { mocks.guard.mockReset(); mocks.name.mockReset(); mocks.name.mockResolvedValue("Tienda de prueba"); });
  it("stops before reading identity or rendering when access is denied", async () => {
    mocks.guard.mockRejectedValue(new Error("Access denied"));
    await expect(AdminSeoPage()).rejects.toThrow("Access denied");
    expect(mocks.guard).toHaveBeenCalledWith("usuarios");
    expect(mocks.name).not.toHaveBeenCalled();
    expect(can("staff", "usuarios")).toBe(false);
    expect(can("vendedor", "usuarios")).toBe(false);
  });
  it("renders for the owner without becoming an indexable static page", async () => {
    mocks.guard.mockResolvedValue(undefined);
    expect(await AdminSeoPage()).toBeTruthy();
    expect(mocks.guard).toHaveBeenCalledWith("usuarios");
    expect(can("owner", "usuarios")).toBe(true);
    expect(dynamic).toBe("force-dynamic");
    expect(metadata.robots).toEqual({ index: false, follow: false, nocache: true });
  });
});
