import { expect, test } from "@playwright/test";

test("editorial concept detail preserves gallery, unit and safety on each viewport", async ({
  page,
}, testInfo) => {
  await page.goto("/producto/concepto-par-plata");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByTestId("ring-price-unit")).toContainText("2 anillos");
  await expect(page.getByTestId("ring-concept-notice")).toContainText(
    "No es una pieza disponible"
  );
  await expect(page.getByTestId("product-add-to-cart")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Detalles para elegir con calma" })
  ).toBeVisible();
  const gallery = page.getByRole("figure", { name: "Galería del producto" });
  await expect(gallery.getByRole("button")).toHaveCount(3);
  const second = gallery.getByRole("button").nth(1);
  await second.focus();
  await page.keyboard.press("Space");
  await expect(second).toHaveAttribute("aria-pressed", "true");
  await expect(gallery.locator("img").first()).toHaveAttribute("alt", /lino/);
  await page
    .getByText("¿Cómo confirmo el talle de esta pieza?", { exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Consultá la guía de medidas de anillos" })
  ).toBeVisible();
  if (testInfo.project.name === "mobile")
    await page.setViewportSize({ width: 320, height: 568 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth
    )
  ).toBe(true);
  const galleryBox = await page.locator(".product-gallery-stage").boundingBox();
  const summaryBox = await page.locator(".product-summary").boundingBox();
  expect(galleryBox).not.toBeNull();
  expect(summaryBox).not.toBeNull();
  if (page.viewportSize()!.width < 768)
    expect(summaryBox!.y).toBeGreaterThan(galleryBox!.y + galleryBox!.height);
  else expect(summaryBox!.x).toBeGreaterThan(galleryBox!.x + galleryBox!.width);
  // MySQL's case-insensitive lookup must not turn a URL spelling variant
  // into an indexable concept or a separate canonical product.
  await page.goto("/producto/CONCEPTO-PAR-PLATA");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://anillos.com.py/producto/concepto-par-plata"
  );
  await expect(page.getByTestId("ring-concept-notice")).toBeVisible();
});
