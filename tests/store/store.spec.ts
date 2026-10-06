import path from "node:path";
import { expect, test } from "@playwright/test";
import { TESTIDS } from "../../src/lib/testids";

const shotDir =
  process.env.STORE_SCREENSHOT_DIR ?? "test-results/store-preview";
test("editorial home, accessible navigation, and paused motion", async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Anillos en Paraguay"
  );
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Saltar al contenido" })
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#contenido")).toBeFocused();
  await expect(
    page.locator('a[href*="wa.me"], a[href^="mailto:"]')
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Pausar movimiento" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Pausar movimiento" }).click();
  const photo = page.locator(".cinematic-media img");
  const frame = await photo.evaluate(
    (node) => (node as HTMLElement).style.transform
  );
  await page.mouse.wheel(0, 350);
  await page.waitForTimeout(150);
  expect(
    await photo.evaluate((node) => (node as HTMLElement).style.transform)
  ).toBe(frame);
  await page.goto("/");
  await page.waitForTimeout(1200);
  // Walk the real page before capture so below-fold lazy photography is visible.
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight
  );
  for (let y = 0; y < height; y += 650) {
    await page.evaluate((position) => window.scrollTo(0, position), y);
    await page.waitForTimeout(60);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await page.screenshot({
    path: path.join(shotDir, `${info.project.name}-hero.png`),
  });
  await page.screenshot({
    path: path.join(shotDir, `${info.project.name}-home.png`),
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("reduced motion keeps the static poster without sequence downloads", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  const frames: string[] = [];
  page.on("request", (request) => {
    if (
      /^\/media\/(?:portrait-)?frames\//.test(new URL(request.url()).pathname)
    )
      frames.push(request.url());
  });
  await page.goto("/");
  await page.waitForTimeout(1000);
  await expect(
    page.getByRole("button", { name: "Pausar movimiento" })
  ).toHaveCount(0);
  // The portrait has a separate poster; reduced motion downloads no sequence.
  expect(frames).toEqual([]);
  await expect(
    page.getByRole("link", { name: "Explorá las colecciones" })
  ).toBeVisible();
});

test("pair variants stay unpurchasable and individual units remain explicit", async ({
  page,
}, info) => {
  await page.goto("/producto/concepto-par-plata");
  await expect(page.getByRole("main")).toContainText("Por par · 2 anillos");
  const variants = page.getByRole("button", { name: /A: .* · B:/ });
  await expect(variants).toHaveCount(3);
  await variants.nth(1).click();
  await expect(variants.nth(1)).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByTestId(TESTIDS.productAddToCart)).toHaveCount(0);
  await expect(page.locator('a[href*="wa.me"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/
  );
  await expect(page.getByRole("main")).not.toContainText("₲");
  await page.screenshot({
    path: path.join(shotDir, `${info.project.name}-pair.png`),
    fullPage: true,
  });
  await page.goto("/producto/concepto-banda-acero");
  await expect(page.getByRole("main")).toContainText("Por anillo · 1 unidad");
  await expect(page.getByTestId(TESTIDS.productAddToCart)).toHaveCount(0);
});

test("crawlable guides, search, sitemap and empty checkout gating", async ({
  page,
  request,
}) => {
  for (const slug of [
    "talles",
    "materiales",
    "anillos-economicos",
    "alianzas-boda-civil",
    "compromiso-y-alianzas",
    "cuidados",
  ]) {
    const response = await page.goto(`/guias/${slug}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://anillos.com.py/guias/${slug}`
    );
    await expect(page.locator("main h1")).toHaveCount(1);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator("article")).toBeVisible();
    expect(
      (await page.locator("article").innerText()).split(/\s+/).length
    ).toBeGreaterThan(300);
  }
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://anillos.com.py/guias/talles");
  expect(sitemap).not.toContain("concepto-");
  expect(await (await request.get("/feed.xml")).text()).not.toContain(
    "concepto-"
  );
  await page.goto("/buscar?q=Banda");
  await expect(
    page
      .getByTestId(TESTIDS.productCard)
      .filter({ hasText: "Banda satinada" })
      .first()
  ).toBeVisible();
  await page.goto("/categoria/alianzas-plata");
  await expect(page.getByRole("main")).toContainText("Por par · 2 anillos");
  await page.goto("/checkout");
  await expect(page.getByTestId(TESTIDS.checkoutSubmit)).toHaveCount(0);
  await page.goto("/contacto");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("main")).toContainText("confirm");
  await expect(
    page.locator('a[href*="wa.me"], a[href^="mailto:"]')
  ).toHaveCount(0);
  for (const route of [
    "/colecciones",
    "/guias",
    "/como-funciona",
    "/favoritos",
  ]) {
    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test.describe("server-rendered storefront", () => {
  test.use({ javaScriptEnabled: false });

  test("home stays visible without JavaScript and missing catalogue routes return 404", async ({
    page,
    request,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Explorá las colecciones" })
    ).toBeVisible();
    await expect(page.locator(".cinematic-media img")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Pausar movimiento" })
    ).toHaveCount(0);
    for (const route of [
      "/producto/does-not-exist-home-review",
      "/categoria/does-not-exist-home-review",
    ]) {
      expect((await request.get(route)).status()).toBe(404);
    }
  });
});
