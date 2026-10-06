import { expect, test } from "@playwright/test";

const enabled = process.env.STORE_SETUP_E2E === "1";
const TEST_SECRET = "anillos-welcome-browser-fixture-secret-2026";
const TEST_PASSWORD = "Anillos-browser-fixture-2026";

// This test may create/update fixture owners, so it runs only against a
// separately started loopback server with a specifically named disposable DB.
test.skip(!enabled, "Requires the isolated setup-handoff fixture server");

test("owner creation signs in and opens the protected welcome and guide", async ({
  page,
  baseURL,
}, testInfo) => {
  expect(baseURL).toBe("http://127.0.0.1:3044");
  expect(process.env.STORE_SETUP_E2E_DATABASE_NAME).toBe(
    "anillos_welcome_browser_test"
  );
  await page.setExtraHTTPHeaders({ "x-forwarded-proto": "https" });
  await page.goto("/setup");
  await page.getByLabel("SETUP_SECRET", { exact: true }).fill(TEST_SECRET);
  await page
    .getByRole("button", { name: "Mostrar secreto", exact: true })
    .click();
  await expect(
    page.getByLabel("SETUP_SECRET", { exact: true })
  ).toHaveAttribute("type", "text");
  await page
    .getByRole("button", { name: "Ocultar secreto", exact: true })
    .click();
  await page
    .getByLabel("Email", { exact: true })
    .fill(`fixture-${testInfo.project.name}@example.test`);
  await page.getByLabel("Contraseña", { exact: true }).fill(TEST_PASSWORD);
  await page
    .getByLabel("Repetí la contraseña", { exact: true })
    .fill(TEST_PASSWORD);
  // Deliberate repeat is needed for the second viewport on this disposable DB.
  await page
    .getByText("Recuperar o actualizar una cuenta existente", { exact: true })
    .click();
  await page.getByRole("checkbox").check();
  await page.screenshot({
    path: testInfo.outputPath("setup.png"),
    fullPage: true,
  });
  await page
    .getByRole("button", {
      name: "Crear mi cuenta y entrar al panel",
      exact: true,
    })
    .click();
  await expect(page).toHaveURL(/\/admin\/bienvenida$/, { timeout: 30_000 });
  await expect(
    page.getByRole("heading", { name: "Ya tenés acceso al panel", exact: true })
  ).toBeVisible();
  const welcomeHeading = page.getByRole("heading", {
    name: "Ya tenés acceso al panel",
    exact: true,
  });
  await expect(welcomeHeading).toBeInViewport();
  expect(
    await welcomeHeading.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return element.contains(
        document.elementFromPoint(rect.left + 5, rect.top + rect.height / 2)
      );
    })
  ).toBe(true);
  await expect(page.locator(".store-header")).toBeHidden();
  await expect(page.locator(".store-footer")).toBeHidden();
  await expect(
    page.getByRole("link", { name: "Panel", exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("Lo esencial antes de vender", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText("Integraciones opcionales", { exact: true })
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("welcome.png"),
    fullPage: true,
  });
  const cookies = await page.context().cookies();
  expect(
    cookies.some(
      (cookie) =>
        cookie.name === "ecom_admin" &&
        cookie.httpOnly &&
        cookie.secure &&
        cookie.sameSite === "Lax"
    )
  ).toBe(true);
  expect(page.url()).not.toContain(TEST_PASSWORD);
  expect(page.url()).not.toContain(TEST_SECRET);
  expect(
    await page.evaluate(() =>
      JSON.stringify({ ...localStorage, ...sessionStorage })
    )
  ).not.toContain(TEST_PASSWORD);
  await page
    .getByRole("link", { name: "Empezar con la guía básica", exact: true })
    .click();
  await expect(page).toHaveURL(/\/admin\/guia$/);
  await expect(
    page.getByRole("heading", { name: /^Guía básica para administrar/ })
  ).toBeVisible();
  await expect(
    page.getByText("Preparar productos y textos con IA", { exact: true })
  ).toBeVisible();
  await expect(
    page.getByText(
      /La recuperación automática por correo todavía no está implementada/
    )
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("guide.png"),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
  await page.goto("/");
  await expect(page.locator(".store-header")).toBeVisible();
  await expect(page.locator(".store-footer")).toBeVisible();
});
