import { expect, test } from "@playwright/test";

test("comparison preserves a three-model limit, confirmed-facts boundary and crawl policy", async ({
  page,
}) => {
  await page.goto("/comparar");
  await expect(page.locator("main h1")).toHaveText("Comparar anillos");
  for (let count = 1; count <= 3; count++) {
    await page
      .locator('section[aria-labelledby="comparison-add"] a')
      .first()
      .click();
    await expect(
      page.getByRole("link", { name: "Quitar de la comparación" })
    ).toHaveCount(count);
  }
  await expect(
    page.locator('section[aria-labelledby="comparison-add"]')
  ).toHaveCount(0);
  await expect(page.locator("main")).toContainText(
    "La comparación está completa"
  );
  await expect(page.getByRole("table")).toContainText("Por confirmar");
  await expect(page.getByRole("table")).not.toContainText("₲");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://anillos.com.py/comparar"
  );
  await page
    .getByRole("link", { name: "Quitar de la comparación" })
    .first()
    .click();
  await expect(
    page.getByRole("link", { name: "Quitar de la comparación" })
  ).toHaveCount(2);
  await expect(
    page.locator('section[aria-labelledby="comparison-add"]')
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
});
