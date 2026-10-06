import { expect, it } from "vitest";
import { safeNextPath } from "@/lib/safe-redirect";

it.each([
  "/admin/login",
  "/admin/login/",
  "/admin/login?next=/admin",
  "/admin/login#login",
  "/admin/pedidos/../login",
  "/admin/%6cogin",
  "/admin/%2e/login",
  "/admin/%2e%2e/admin/login",
  "/admin/pedidos%2f..%2flogin",
  "/admin/../../outside",
  "/admin/%zz",
])("rejects a normalized self-login or invalid path: %s", (path) => {
  expect(safeNextPath(path)).toBe("/admin");
});
it.each([
  "/admin",
  "/admin/pedidos?estado=pagado",
  "/admin/productos/7",
  "/admin/guia#catalogo",
  "/admin/bienvenida",
])("preserves safe panel destinations: %s", (path) => {
  expect(safeNextPath(path)).toBe(path);
});
