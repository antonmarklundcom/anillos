import { expect, test } from "@playwright/test";

test("admin login masks its password and has a working setup link while enabled", async ({
  page,
}) => {
  await page.goto("/admin/login");
  const password = page.locator('input[name="password"]');
  await password.fill("Only-a-local-browser-test-2026");
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveAttribute("autocomplete", "current-password");
  await page
    .getByRole("button", { name: "Mostrar contraseña", exact: true })
    .click();
  await expect(password).toHaveAttribute("type", "text");
  const hide = page.getByRole("button", {
    name: "Ocultar contraseña",
    exact: true,
  });
  await hide.focus();
  await page.keyboard.press("Space");
  await expect(password).toHaveAttribute("type", "password");
  await expect(password).toHaveValue("Only-a-local-browser-test-2026");
  await page
    .getByRole("link", { name: "Configurar la cuenta del dueño" })
    .click();
  await expect(page).toHaveURL(/\/setup$/);
  await expect(
    page.getByRole("heading", { name: "Configuración inicial de la tienda" })
  ).toBeVisible();
});

test("setup blocks missing and mismatched confirmation and preserves success when sign-in fails", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const posted: { body: unknown; authorization: string | undefined }[] = [];
  // All setup submissions are intercepted: no real account or schema changes.
  await page.route("**/api/setup/init", async (route) => {
    posted.push({
      body: route.request().postDataJSON(),
      authorization: route.request().headers().authorization,
    });
    await route.fulfill({ json: { ok: true, pasos: { duenio: "creado" } } });
  });
  // The fake account does not exist. Exercise a transport failure without
  // submitting invented credentials to an actual account/login endpoint.
  await page.route("**/setup", async (route) => {
    if (route.request().method() === "POST")
      await route.abort("connectionfailed");
    else await route.continue();
  });
  await page.goto("/setup");
  const password = page.getByLabel("Contraseña", { exact: true });
  const confirmation = page.getByLabel("Repetí la contraseña", { exact: true });
  const submit = page.getByRole("button", {
    name: "Crear mi cuenta y entrar al panel",
    exact: true,
  });
  await page
    .getByLabel("SETUP_SECRET", { exact: true })
    .fill("local-browser-test-secret-2026");
  await page.getByLabel("Email", { exact: true }).fill("owner@example.test");
  await password.fill("Only-a-local-browser-test-2026");
  await submit.click();
  await expect(confirmation).toBeFocused();
  expect(posted).toHaveLength(0);
  await confirmation.fill("Mismatched-local-test-2026");
  await submit.click();
  expect(posted).toHaveLength(0);
  expect(
    await confirmation.evaluate(
      (field: HTMLInputElement) => field.validationMessage
    )
  ).toBe("Las contraseñas no coinciden. Volvé a escribirlas.");
  await confirmation.fill("Only-a-local-browser-test-2026");
  await page
    .getByRole("button", { name: "Mostrar contraseña", exact: true })
    .first()
    .click();
  await expect(password).toHaveAttribute("type", "text");
  // Editing the original after confirming must invalidate the confirmation too.
  await password.fill("Edited-local-test-2026");
  await submit.click();
  expect(posted).toHaveLength(0);
  await confirmation.fill("Edited-local-test-2026");
  await submit.click();
  await expect(
    page.getByRole("link", { name: "Entrar al panel" })
  ).toHaveAttribute("href", "/admin/login?next=%2Fadmin%2Fbienvenida");
  await expect(page.getByRole("status")).toContainText(
    "ingreso automático no se completó"
  );
  expect(posted).toEqual([
    {
      body: {
        seed: false,
        force: false,
        owner: {
          email: "owner@example.test",
          password: "Edited-local-test-2026",
        },
      },
      authorization: "Bearer local-browser-test-secret-2026",
    },
  ]);
  await expect(password).toHaveCount(0);
  await expect(confirmation).toHaveCount(0);
  await expect(page.getByLabel("SETUP_SECRET", { exact: true })).toHaveCount(0);
  await expect(
    page.getByText("Ver detalles técnicos").locator("..")
  ).not.toHaveAttribute("open");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("welcome and guide require an authenticated owner", async ({ page }) => {
  for (const path of ["/admin/bienvenida", "/admin/guia"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/admin\/login\?next=/);
    await expect(page.getByLabel("Contraseña", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: "Ya tenés acceso al panel" })
    ).toHaveCount(0);
  }
});
