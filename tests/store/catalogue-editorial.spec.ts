import path from "node:path";
import { expect, test } from "@playwright/test";
import { COLLECTIONS, CONCEPTS } from "../../src/config/ring-store";
import { TESTIDS } from "../../src/lib/testids";

const shotDir =
  process.env.STORE_SCREENSHOT_DIR ?? "test-results/store-preview";

test("catalogue browsing filters by collection without exposing concepts to indexing", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/colecciones");
  await expect(page.locator("main h1")).toHaveCount(1);
  await expect(page.locator("main h1")).toContainText("Colecciones de anillos");
  await expect(page.locator(".catalogue-collection-tile")).toHaveCount(
    COLLECTIONS.length
  );
  await expect(page.getByTestId(TESTIDS.productCard)).toHaveCount(
    CONCEPTS.length
  );
  await expect(
    page.locator('meta[name="robots"][content*="noindex"]')
  ).toHaveCount(0);
  await page.locator(".catalogue-pills a", { hasText: "Promesa" }).click();
  await expect(page).toHaveURL(/coleccion=promesa/);
  await expect(page.getByTestId(TESTIDS.productCard)).toHaveCount(3);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://anillos.com.py/colecciones"
  );
  await expect(page.getByTestId(TESTIDS.productCard).first()).toContainText(
    "Por anillo · 1 unidad"
  );
  await page.getByTestId(TESTIDS.productCard).first().click();
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByTestId(TESTIDS.productAddToCart)).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText("₲");
  await page.goto("/colecciones");
  await page.screenshot({
    path: path.join(shotDir, `${info.project.name}-catalogue-top.png`),
  });
  await page.locator("#disenos").scrollIntoViewIfNeeded();
  await page.screenshot({
    path: path.join(shotDir, `${info.project.name}-catalogue-grid.png`),
  });
  await page.setViewportSize({ width: 320, height: 568 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("each collection has a visual header, models and working reading anchors", async ({
  page,
  request,
}, info) => {
  test.setTimeout(180_000);
  for (const collection of COLLECTIONS) {
    const response = await page.goto(`/categoria/${collection.slug}`);
    expect(response?.status(), collection.slug).toBe(200);
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.locator(".category-hero-photo")).toBeVisible();
    await expect(page.getByTestId(TESTIDS.productCard).first()).toBeVisible();
    await page
      .getByRole("link", { name: "Cómo elegir →", exact: true })
      .click();
    await expect(page).toHaveURL(/#guia-de-eleccion$/);
    await expect(page.locator(".category-reading article")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      ),
      collection.slug
    ).toBe(true);
  }
  await page.goto("/categoria/compromiso");
  await page.screenshot({
    path: path.join(shotDir, `${info.project.name}-category.png`),
  });
  const sitemap = await (await request.get("/sitemap.xml")).text();
  for (const slug of [
    "anillos-personalizados",
    "piedras-de-color",
    "anillos-con-significado",
  ]) {
    const response = await page.goto(`/guias/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    expect(
      (await page.locator("article").innerText()).split(/\s+/).length
    ).toBeGreaterThan(350);
    expect(sitemap).toContain(`/guias/${slug}`);
  }
  expect(sitemap).not.toContain("concepto-");
});
