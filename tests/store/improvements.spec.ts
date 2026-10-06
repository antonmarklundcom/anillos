import { expect, test } from "@playwright/test";
import { openFirstHeaderCategory } from "../e2e/helpers";
import { COLLECTIONS } from "../../src/config/ring-store";

test("all collections and the main action are discoverable on a phone", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const action = page.getByRole("link", { name: "Explorá las colecciones" });
  await expect(action).toBeInViewport({ ratio: 1 });
  const headerHeight = await page
    .locator("header")
    .evaluate((n) => n.getBoundingClientRect().height);
  expect(headerHeight).toBeLessThan(170);
  await page.locator(".collection-menu summary").click();
  await expect(
    page.locator("header").getByRole("link", { name: "Anillos de compromiso" })
  ).toBeVisible();
  await page
    .locator("header")
    .getByRole("link", { name: "Anillos de compromiso" })
    .click();
  await expect(page.locator("main h1")).toHaveText(
    "Anillos de compromiso en Paraguay"
  );
  await expect(page.locator(".collection-menu")).not.toHaveAttribute(
    "open",
    ""
  );
  await page.goto("/");
  await expect(page.locator("#colecciones h3")).toHaveCount(COLLECTIONS.length);
  await openFirstHeaderCategory(page);
  await expect(page).toHaveURL(/\/categoria\/acero$/);
});

test("size guidance gives a useful answer without pretending to assign a commercial size", async ({
  page,
}) => {
  await page.goto("/guias/talles");
  await page.getByRole("link", { name: "Calculá tu medida" }).click();
  const headingTop = await page
    .locator(".size-tool h2")
    .evaluate((node) => node.getBoundingClientRect().top);
  const headerBottom = await page
    .locator("header")
    .evaluate((node) => node.getBoundingClientRect().bottom);
  expect(headingTop).toBeGreaterThanOrEqual(headerBottom);
  await page.getByLabel("Medida en mm").fill("17,5");
  await expect(page.locator(".size-tool")).toContainText(/55[.,]0? mm|55 mm/);
  await expect(page.locator(".size-tool")).toContainText(
    "no determina un talle comercial"
  );
  await page.goto("/buscar?q=talla");
  await expect(
    page.locator("main").locator('a[href="/guias/talles"]')
  ).toBeVisible();
});
