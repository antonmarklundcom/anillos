import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import {
  adminMenuStorageKey,
  type AdminNavigationItem,
} from "@/lib/admin-navigation";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/productos/4" }));
vi.mock("@/components/admin/logout-button", () => ({
  LogoutButton: () => <button>Salir del panel</button>,
}));
const items: AdminNavigationItem[] = [
  { id: "resumen", href: "/admin", label: "Resumen", icon: "LayoutDashboard" },
  {
    id: "pedidos",
    href: "/admin/pedidos",
    label: "Pedidos",
    icon: "ShoppingBag",
  },
  {
    id: "productos",
    href: "/admin/productos",
    label: "Productos",
    icon: "Package",
  },
];
beforeEach(() => localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function mount(userId = 1) {
  return render(
    <AdminNavigation userId={userId} items={items} homeHref="/admin" />
  );
}
function order() {
  return within(screen.getByRole("navigation"))
    .getAllByRole("link")
    .map((link) => link.textContent);
}

it("highlights the current descendant and retains the orders test contract and logout", () => {
  mount();
  expect(screen.getByRole("link", { name: "Productos" })).toHaveAttribute(
    "aria-current",
    "page"
  );
  expect(screen.getByRole("link", { name: "Resumen" })).not.toHaveAttribute(
    "aria-current"
  );
  expect(screen.getByTestId("admin-nav-orders")).toHaveAttribute(
    "href",
    "/admin/pedidos"
  );
  expect(
    screen.getByRole("button", { name: "Salir del panel" })
  ).toBeInTheDocument();
});
it("cancels edits, persists confirmed keyboard changes and restores defaults only on save", () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Editar menú" }));
  expect(screen.getByRole("button", { name: "Subir Resumen" })).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Subir Productos" }));
  expect(order()).toEqual(["Resumen", "Productos", "Pedidos"]);
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(order()).toEqual(["Resumen", "Pedidos", "Productos"]);
  fireEvent.click(screen.getByRole("button", { name: "Editar menú" }));
  fireEvent.click(screen.getByRole("button", { name: "Subir Productos" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
  expect(JSON.parse(localStorage.getItem(adminMenuStorageKey(1))!)).toEqual([
    "resumen",
    "productos",
    "pedidos",
  ]);
  fireEvent.click(screen.getByRole("button", { name: "Editar menú" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Restaurar orden original" })
  );
  fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));
  expect(order()).toEqual(["Resumen", "Productos", "Pedidos"]);
  fireEvent.click(screen.getByRole("button", { name: "Editar menú" }));
  fireEvent.click(
    screen.getByRole("button", { name: "Restaurar orden original" })
  );
  fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
  expect(order()).toEqual(["Resumen", "Pedidos", "Productos"]);
});
it("loads only allowed stored entries and does not share ordering with another account", () => {
  localStorage.setItem(
    adminMenuStorageKey(1),
    '["usuarios","productos","productos"]'
  );
  const view = mount();
  expect(order()).toEqual(["Productos", "Resumen", "Pedidos"]);
  expect(
    screen.queryByRole("link", { name: "Usuarios" })
  ).not.toBeInTheDocument();
  view.rerender(<AdminNavigation userId={2} items={items} homeHref="/admin" />);
  expect(order()).toEqual(["Resumen", "Pedidos", "Productos"]);
});
it("keeps navigation usable when browser storage throws", () => {
  vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Editar menú" }));
  fireEvent.click(screen.getByRole("button", { name: "Subir Productos" }));
  fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
  expect(screen.getByRole("status")).toHaveTextContent("no permite guardar");
  expect(order()).toEqual(["Resumen", "Productos", "Pedidos"]);
});
it("opens a modal drawer with a Spanish close control and one orders link", () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Menú" }));
  expect(
    screen.getByRole("dialog", { name: "Navegación del panel" })
  ).toBeInTheDocument();
  expect(screen.getAllByTestId("admin-nav-orders")).toHaveLength(1);
  fireEvent.click(screen.getByRole("button", { name: "Cerrar menú" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});

it("reorders native drag targets without trusting external drag payloads", () => {
  mount();
  fireEvent.click(screen.getByRole("button", { name: "Editar menú" }));
  const first = screen.getByRole("link", { name: "Resumen" }).closest("li")!;
  const target = screen.getByRole("link", { name: "Productos" }).closest("li")!;
  const dataTransfer = { setData: vi.fn(), effectAllowed: "" };
  // No internal drag is active: dropping a forged destination does nothing.
  fireEvent.drop(target, { dataTransfer });
  expect(order()).toEqual(["Resumen", "Pedidos", "Productos"]);
  fireEvent.dragStart(first, { dataTransfer });
  expect(dataTransfer.setData).toHaveBeenCalledWith("text/plain", "resumen");
  fireEvent.dragOver(target, { dataTransfer });
  fireEvent.drop(target, { dataTransfer });
  expect(order()).toEqual(["Pedidos", "Productos", "Resumen"]);
  fireEvent.click(screen.getByRole("button", { name: "Guardar" }));
  expect(JSON.parse(localStorage.getItem(adminMenuStorageKey(1))!)).toEqual([
    "pedidos",
    "productos",
    "resumen",
  ]);
});

it("keeps malformed stored values usable and announces the review badge", () => {
  localStorage.setItem(adminMenuStorageKey(1), "not JSON");
  render(
    <AdminNavigation
      userId={1}
      items={[
        ...items,
        {
          id: "resenas",
          href: "/admin/resenas",
          label: "Reseñas",
          icon: "Star",
          count: 4,
        },
      ]}
      homeHref="/admin"
    />
  );
  expect(order()).toEqual(["Resumen", "Pedidos", "Productos", "Reseñas4"]);
  expect(screen.getByLabelText("4 reseñas pendientes")).toHaveTextContent("4");
});
