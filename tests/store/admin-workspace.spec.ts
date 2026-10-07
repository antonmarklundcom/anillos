import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";

const password = "Admin-workspace-synthetic-2026!";
const enabled = process.env.STORE_ADMIN_E2E === "1";
type Manifest = {
  accounts: Record<string, number>;
  productId: number;
  orderId: number;
  orderNumber: string;
};
function fixture(): Manifest {
  return JSON.parse(
    readFileSync(
      path.resolve("playwright/.cache/admin-workspace-fixture.json"),
      "utf8"
    )
  );
}
async function login(page: Page, role: string) {
  await page.goto("/admin/login?next=%2Fadmin%2Fpedidos");
  await page
    .getByTestId("admin-login-email")
    .fill(`${role}@admin.example.test`);
  await page.getByTestId("admin-login-password").fill(password);
  await page.getByTestId("admin-login-submit").click();
  await expect(page).toHaveURL(/\/admin\/pedidos$/);
}
async function navigation(page: Page) {
  if (page.viewportSize()!.width < 1024) {
    await page.getByRole("button", { name: "Menú", exact: true }).click();
    return page.getByRole("dialog").getByRole("navigation");
  }
  return page.locator("aside").getByRole("navigation");
}
async function logout(page: Page) {
  if (
    page.viewportSize()!.width < 1024 &&
    !(await page.getByRole("dialog").isVisible())
  )
    await page.getByRole("button", { name: "Menú", exact: true }).click();
  await page.getByRole("button", { name: "Salir", exact: true }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
}

test.describe("isolated admin workspace", () => {
  test.skip(
    !enabled,
    "Requires STORE_ADMIN_E2E=1 and the guarded isolated fixture server."
  );
  test.beforeEach(({ baseURL }) => {
    const target = new URL(baseURL!);
    expect(["localhost", "127.0.0.1"]).toContain(target.hostname);
  });

  test("owner opens every admin page, detail, form and print view", async ({
    page,
  }) => {
    test.setTimeout(180000);
    const data = fixture();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await login(page, "owner");
    const paths = [
      "/admin",
      "/admin/pedidos",
      "/admin/pedidos/por-cobrar",
      "/admin/productos",
      "/admin/productos/nuevo",
      `/admin/productos/${data.productId}`,
      `/admin/pedidos/${data.orderId}`,
      `/admin/pedidos/${data.orderId}/imprimir`,
      ...[
        "categorias",
        "seo",
        "resenas",
        "devoluciones",
        "clientes",
        "cupones",
        "actividad",
        "envios",
        "banco",
        "ajustes",
        "integraciones",
        "usuarios",
        "bienvenida",
        "guia",
      ].map((item) => `/admin/${item}`),
    ];
    for (const href of paths) {
      const response = await page.goto(href);
      expect(response?.status(), href).toBe(200);
      await expect(page.locator("main")).toBeVisible();
      await expect(
        page.getByText("Algo falló en el panel", { exact: true })
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: "Abrir carrito" })
      ).toBeHidden();
      await expect(page.locator(".store-header")).toBeHidden();
      await expect(page.locator(".store-footer")).toBeHidden();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        ),
        href
      ).toBe(true);
    }
    await page.goto(`/admin/pedidos/${data.orderId}/imprimir`);
    await page.emulateMedia({ media: "print" });
    await expect(page.locator(".s9-print-page > header")).toBeVisible();
    await expect(page.locator(".s9-print-page")).toContainText(
      data.orderNumber
    );
    await expect(page.locator("aside")).toBeHidden();
    await page.emulateMedia({ media: "screen" });
    expect(errors).toEqual([]);
    await logout(page);
  });

  test("menu saves, reloads, cancels and restores; mobile closes and returns focus", async ({
    page,
  }) => {
    if (page.viewportSize()!.width < 1024)
      await page.setViewportSize({ width: 320, height: 568 });
    await login(page, "owner");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    let nav = await navigation(page);
    const scope =
      page.viewportSize()!.width < 1024
        ? page.getByRole("dialog")
        : page.locator("aside");
    const original = await nav.getByRole("link").allTextContents();
    await scope
      .getByRole("button", { name: "Editar menú", exact: true })
      .click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
    await scope
      .getByRole("button", { name: "Subir Pedidos", exact: true })
      .click();
    await scope.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.reload();
    nav = await navigation(page);
    await expect(nav.getByRole("link").first()).toHaveText("Pedidos");
    await scope
      .getByRole("button", { name: "Editar menú", exact: true })
      .click();
    await scope
      .getByRole("button", { name: "Restaurar orden original", exact: true })
      .click();
    await scope.getByRole("button", { name: "Cancelar", exact: true }).click();
    await expect(nav.getByRole("link").first()).toHaveText("Pedidos");
    await scope
      .getByRole("button", { name: "Editar menú", exact: true })
      .click();
    await scope
      .getByRole("button", { name: "Restaurar orden original", exact: true })
      .click();
    await scope.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(nav.getByRole("link")).toHaveText(original);
    if (page.viewportSize()!.width >= 1024) {
      await scope
        .getByRole("button", { name: "Editar menú", exact: true })
        .click();
      await nav
        .locator("li")
        .filter({ hasText: "Productos" })
        .dragTo(nav.locator("li").filter({ hasText: "Resumen" }));
      await expect(nav.getByRole("link").first()).toHaveText("Productos");
      await scope.getByRole("button", { name: "Guardar", exact: true }).click();
      await page.reload();
      await expect(
        (await navigation(page)).getByRole("link").first()
      ).toHaveText("Productos");
      await scope
        .getByRole("button", { name: "Editar menú", exact: true })
        .click();
      await scope
        .getByRole("button", { name: "Restaurar orden original", exact: true })
        .click();
      await scope.getByRole("button", { name: "Guardar", exact: true }).click();
    }
    if (page.viewportSize()!.width < 1024) {
      await nav.getByRole("link", { name: "Productos", exact: true }).click();
      await expect(page).toHaveURL(/\/admin\/productos$/);
      await expect(page.getByRole("dialog")).toBeHidden();
      const trigger = page.getByRole("button", { name: "Menú", exact: true });
      await trigger.click();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toBeHidden();
      await expect(trigger).toBeFocused();
    }
    await page.goto("/admin/pedidos");
    if (page.viewportSize()!.width < 1024) await navigation(page);
    await page.screenshot({
      path: test.info().outputPath("admin-sidebar.png"),
      fullPage: true,
    });
  });

  test("staff and vendedor preserve route restrictions and redact seller amounts in print", async ({
    page,
  }) => {
    const data = fixture();
    for (const role of ["staff", "vendedor"]) {
      await login(page, role);
      await page.evaluate(
        ({ id }) =>
          localStorage.setItem(
            `admin-menu:v1:${id}`,
            JSON.stringify(["usuarios", "integraciones", "banco", "pedidos"])
          ),
        { id: data.accounts[role]! }
      );
      await page.reload();
      const nav = await navigation(page);
      await expect(
        nav.getByRole("link", { name: "Usuarios", exact: true })
      ).toHaveCount(0);
      if (role === "vendedor")
        expect(await nav.getByRole("link").count()).toBe(1);
      for (const route of [
        "/admin/usuarios",
        "/admin/ajustes",
        "/admin/guia",
        "/admin/bienvenida",
        "/admin/banco",
        "/admin/integraciones",
        ...(role === "vendedor"
          ? ["/admin", "/admin/productos", "/admin/pedidos/por-cobrar"]
          : []),
      ]) {
        await page.goto(route);
        await expect(page).toHaveURL(/\/admin\/pedidos$/);
      }
      await page.goto(`/admin/pedidos/${data.orderId}`);
      await expect(page.locator("main")).toContainText(data.orderNumber);
      if (role === "vendedor")
        await expect(page.getByTestId("admin-order-total")).toHaveCount(0);
      await page.goto(`/admin/pedidos/${data.orderId}/imprimir`);
      await page.emulateMedia({ media: "print" });
      await expect(page.locator(".s9-print-page > header")).toBeVisible();
      await expect(page.locator("aside")).toBeHidden();
      if (role === "vendedor")
        await expect(page.locator(".s9-print-page")).not.toContainText("₲");
      await page.emulateMedia({ media: "screen" });
      await logout(page);
    }
  });

  test("synthetic product edit, order note and allowed state workflow use existing actions", async ({
    page,
  }) => {
    const data = fixture();
    await login(page, "owner");
    await page.goto(`/admin/productos/${data.productId}`);
    const name = `Synthetic admin product ${test.info().project.name}`;
    await page.getByTestId("admin-product-name-input").fill(name);
    await page.getByTestId("admin-product-save-submit").click();
    await expect(
      page.getByRole("heading", { name, exact: true })
    ).toBeVisible();
    await page.reload();
    await expect(page.getByTestId("admin-product-name-input")).toHaveValue(
      name
    );
    await page.goto(`/admin/pedidos/${data.orderId}`);
    const note = `Synthetic admin note ${test.info().project.name}`;
    await page.getByTestId("order-notes-textarea").fill(note);
    await page.getByTestId("order-notes-submit").click();
    await expect(page.getByTestId("order-notes-list")).toContainText(note);
    await page.reload();
    await expect(page.getByTestId("order-notes-list")).toContainText(note);
    const transition = (status: string) =>
      page.locator(
        `[data-testid="order-transition-button"][data-status="${status}"]`
      );
    // Desktop and mobile share this isolated order; never confirm twice.
    if (await transition("pagado").isVisible()) {
      await transition("pagado").click();
      await expect(transition("preparando")).toBeVisible();
    }
    if (await transition("preparando").isVisible()) {
      await transition("preparando").click();
    }
    await expect(transition("enviado")).toBeVisible();
    await page.reload();
    await expect(transition("enviado")).toBeVisible();
  });
});
