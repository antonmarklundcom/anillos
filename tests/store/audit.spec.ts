import { expect, test } from "@playwright/test";
import { COLLECTIONS } from "../../src/config/ring-store";
import { GUIDES } from "../../src/content/guides";

const routes = [
  "/",
  "/colecciones",
  "/guias",
  "/contacto",
  "/como-funciona",
  "/favoritos",
  "/buscar?q=Banda",
  "/checkout",
  "/pedido/buscar",
  ...COLLECTIONS.map((item) => `/categoria/${item.slug}`),
  ...GUIDES.map((item) => `/guias/${item.slug}`),
];

test("all public pages, their links and images are healthy", async ({
  page,
  request,
}) => {
  test.setTimeout(180_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  const links = new Set<string>();
  const brokenAssets = new Set<string>();
  page.on("response", (response) => {
    if (
      response.status() >= 400 &&
      /\.(webp|png|jpg|ico|css|js)(\?|$)/.test(response.url())
    )
      brokenAssets.add(response.url());
  });
  for (const route of routes) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main h1"), route).toHaveCount(1);
    await expect(page.locator("main h1"), route).toBeVisible();
    expect(await page.title(), route).not.toContain("hostingersite");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      ),
      route
    ).toBe(true);
    const imgs = page.locator("main img");
    for (const img of await imgs.all()) {
      await img.scrollIntoViewIfNeeded();
      await expect(img).toHaveAttribute("alt", /\S/);
      await expect
        .poll(
          () => img.evaluate((node) => (node as HTMLImageElement).naturalWidth),
          { message: route }
        )
        .toBeGreaterThan(0);
    }
    for (const href of await page
      .locator("a[href]")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("href")!)
      )) {
      if (href.startsWith("/") && !href.startsWith("//"))
        links.add(href.split("#")[0]!);
    }
  }
  for (const href of links) {
    const response = await request.get(href);
    expect(response.status(), href).toBeLessThan(400);
  }
  expect(brokenAssets).toEqual(new Set());
  expect(errors).toEqual([]);
});

test("the whole ring stays inside the hero through forward and reverse scroll", async ({
  page,
}) => {
  await page.goto("/");
  const hero = page.locator(".cinematic-track");
  await expect(hero).toHaveAttribute("data-hero-variant", "rings");
  await expect(hero).toHaveAttribute("data-motion-status", "active");
  const metrics = await hero.evaluate((node) => {
    const stage = node.querySelector(".cinematic-stage") as HTMLElement;
    return {
      start: node.getBoundingClientRect().top + scrollY,
      distance: (node as HTMLElement).offsetHeight - stage.offsetHeight,
    };
  });
  for (const progress of [0, 0.4, 0.72, 1, 0.72, 0.4, 0]) {
    await page.evaluate(
      ({ start, distance, progress }) =>
        scrollTo(0, start + distance * progress),
      { ...metrics, progress }
    );
    const expectedStep =
      progress >= 0.67 ? "03" : progress >= 0.34 ? "02" : "01";
    await expect(
      page.locator(".hero-detail-steps [aria-current=step]")
    ).toContainText(expectedStep);
    const bounds = await page
      .locator(".cinematic-media img")
      .evaluate((node) => {
        const img = node as HTMLImageElement;
        const media = img.closest(".cinematic-media")!.getBoundingClientRect();
        const m = new DOMMatrix(getComputedStyle(img).transform);
        const scale = Math.min(
          img.clientWidth / img.naturalWidth,
          img.clientHeight / img.naturalHeight
        );
        const w = img.naturalWidth * scale,
          h = img.naturalHeight * scale;
        const x = (img.clientWidth - w) / 2,
          y = (img.clientHeight - h) / 2;
        // Independently measured generous bounds around the photographic silhouette.
        return {
          left: m.e + m.a * (x + w * 0.18),
          right: m.e + m.a * (x + w * 0.82),
          top: m.f + m.d * (y + h * 0.2),
          bottom: m.f + m.d * (y + h * 0.82),
          width: media.width,
          height: media.height,
        };
      });
    expect(bounds.left).toBeGreaterThan(0);
    expect(bounds.top).toBeGreaterThan(0);
    expect(bounds.right).toBeLessThan(bounds.width);
    expect(bounds.bottom).toBeLessThan(bounds.height);
  }
  await page.getByRole("link", { name: "Ir a las colecciones" }).click();
  await expect(page.locator("#colecciones h2")).toBeInViewport();
});

test("motion preferences change live and unavailable hero assets fall back", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator(".cinematic-track")).toHaveAttribute(
    "data-motion-status",
    "active"
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(page.locator(".cinematic-track")).toHaveAttribute(
    "data-motion-status",
    "static"
  );
  await expect(page.locator(".cinematic-media img")).toHaveCSS(
    "transform",
    "none"
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(page.locator(".cinematic-track")).toHaveAttribute(
    "data-motion-status",
    "active"
  );
  await page.route("**/media/ring-detail-*.webp", (route) => route.abort());
  await page.reload();
  await expect
    .poll(() =>
      page
        .locator(".cinematic-media img")
        .evaluate((node) => (node as HTMLImageElement).naturalWidth)
    )
    .toBeGreaterThan(0);
  await expect(page.locator(".cinematic-media img")).toHaveAttribute(
    "src",
    "/media/silver.webp"
  );
});

test("small and landscape screens keep every hero action reachable", async ({
  page,
}) => {
  for (const size of [
    { width: 320, height: 568 },
    { width: 390, height: 667 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(size);
    await page.goto("/");
    await expect(page.locator(".cinematic-track")).toHaveAttribute(
      "data-motion-status",
      "active"
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
    await page.getByRole("button", { name: "Pausar movimiento" }).click();
    await expect(
      page.getByRole("button", { name: "Activar movimiento" })
    ).toHaveAttribute("aria-pressed", "true");
    await page.getByRole("link", { name: "Ir a las colecciones" }).click();
    await expect(page.locator("#colecciones h2")).toBeInViewport();
  }
});

test("data saving avoids motion and downloads only the selected ring image", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "connection", {
      value: Object.assign(new EventTarget(), { saveData: true }),
      configurable: true,
    })
  );
  const images: string[] = [];
  page.on("request", (request) => {
    if (/\/media\/ring-detail-/.test(request.url())) images.push(request.url());
  });
  await page.goto("/");
  await expect(page.locator(".cinematic-track")).toHaveAttribute(
    "data-motion-status",
    "static"
  );
  await expect(
    page.getByRole("button", { name: "Pausar movimiento" })
  ).toHaveCount(0);
  expect(images).toHaveLength(1);
});
