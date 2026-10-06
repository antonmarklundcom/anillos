import { expect, test } from "@playwright/test";
import { COLLECTIONS } from "../../src/config/ring-store";

// Optional second preview uses a separate disposable database with no tables.
test.skip(
  !process.env.EMPTY_CATALOG_PREVIEW_URL,
  "Requires an empty local test database preview."
);
test("collections, search and sitemap remain useful without catalog tables", async ({
  page,
  request,
}) => {
  const origin = process.env.EMPTY_CATALOG_PREVIEW_URL!;
  for (const collection of COLLECTIONS) {
    const response = await page.goto(`${origin}/categoria/${collection.slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator("main h1")).toBeVisible();
    await expect(
      page.getByRole("complementary", { name: "Estado de esta colección" })
    ).toContainText("Todavía no hay piezas verificadas para comprar");
    await expect(page.locator("main article")).toBeVisible();
    expect(
      (await page.locator("main article").innerText()).split(/\s+/).length
    ).toBeGreaterThan(300);
    await expect(
      page.locator(`main a[href="/guias/${collection.guide}"]`).first()
    ).toBeVisible();
    await expect(page.locator("button[data-testid=add-to-cart]")).toHaveCount(
      0
    );
  }
  await page.goto(`${origin}/buscar?q=anillo`);
  await expect(page.locator("main h1")).toBeVisible();
  await expect(page.getByRole("status")).toContainText(
    "Estamos preparando el catálogo"
  );
  const sitemap = await request.get(`${origin}/sitemap.xml`);
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const collection of COLLECTIONS)
    expect(xml).toContain(`/categoria/${collection.slug}`);
  expect(
    (await request.get(`${origin}/categoria/unknown-collection`)).status()
  ).toBe(404);
  const checkout = await page.goto(`${origin}/checkout`);
  expect(checkout?.status()).toBe(200);
  await expect(page.locator("main h1")).toHaveText(
    "La compra no está disponible."
  );
  await expect(page.locator("main form")).toHaveCount(0);
  const feed = await request.get(`${origin}/feed.xml`);
  expect(feed.status()).toBe(503);
  expect(feed.headers()["retry-after"]).toBe("300");
  expect(
    (await (await request.get(`${origin}/api/health`)).json()).catalog
  ).toBe(false);
});
