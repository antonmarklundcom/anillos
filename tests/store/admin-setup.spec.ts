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

test("setup blocks missing and mismatched confirmation and clears credentials after a mocked success", async ({
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
  await page.goto("/setup");
  const password = page.getByLabel("Contraseña", { exact: true });
  const confirmation = page.getByLabel("Repetí la contraseña", { exact: true });
  const submit = page.getByRole("button", { name: "Inicializar", exact: true });
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
  ).toHaveAttribute("href", "/admin/login");
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
  await expect(password).toHaveValue("");
  await expect(password).toHaveAttribute("type", "password");
  await expect(confirmation).toHaveValue("");
  await expect(page.getByLabel("SETUP_SECRET", { exact: true })).toHaveValue(
    ""
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});
