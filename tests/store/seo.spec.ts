import { expect, test } from "@playwright/test";
import { GUIDES } from "../../src/content/guides";

const origin = "https://anillos.com.py";
const categories = [
  "acero",
  "plata-925",
  "alianzas-plata",
  "alianzas-oro",
  "compromiso",
  "promesa",
  "solitarios",
  "alianzas",
  "oro",
  "hombre",
];
const guides = GUIDES.map((guide) => guide.slug);
const publicRoutes = [
  "/",
  "/colecciones",
  "/guias",
  "/contacto",
  "/como-funciona",
  ...categories.map((slug) => `/categoria/${slug}`),
  ...guides.map((slug) => `/guias/${slug}`),
];

test("public pages render distinct SEO and working internal destinations without JavaScript", async ({
  browser,
  request,
  baseURL,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "The same server HTML is audited once; mobile interactions run separately."
  );
  test.setTimeout(180_000);
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  const titles = new Set<string>();
  const headings = new Set<string>();
  const destinations = new Map<string, Set<string>>();
  const idsByPath = new Map<string, Set<string>>();
  try {
    for (const route of publicRoutes) {
      const response = await page.goto(route);
      expect(response?.status(), route).toBe(200);
      await expect(page.locator("main h1"), route).toHaveCount(1);
      await expect(page.locator("main h1"), route).toBeVisible();
      const title = await page.title();
      const heading = (await page.locator("main h1").innerText())
        .replace(/\s+/g, " ")
        .trim();
      expect(title.trim(), route).not.toBe("");
      expect(titles.has(title), `duplicate title: ${route}`).toBe(false);
      expect(headings.has(heading), `duplicate H1: ${route}`).toBe(false);
      titles.add(title);
      headings.add(heading);
      await expect(page.locator('meta[name="description"]'), route).toHaveCount(
        1
      );
      expect(
        (
          await page.locator('meta[name="description"]').getAttribute("content")
        )?.trim(),
        route
      ).toBeTruthy();
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      const sharedUrl = await page
        .locator('meta[property="og:url"]')
        .getAttribute("content");
      expect(new URL(canonical ?? "").href, route).toBe(`${origin}${route}`);
      expect(new URL(sharedUrl ?? "").href, route).toBe(`${origin}${route}`);
      expect(
        await page
          .locator("head")
          .evaluate(
            (head) =>
              head
                .querySelector('meta[name="robots"]')
                ?.getAttribute("content") ?? ""
          ),
        route
      ).not.toMatch(/noindex/);
      await expect(page.locator("html")).toHaveAttribute("lang", "es-PY");
      const scripts = await page
        .locator('script[type="application/ld+json"]')
        .allTextContents();
      for (const script of scripts) {
        const parsed: unknown = JSON.parse(script);
        const nodes = Array.isArray(parsed) ? parsed : [parsed];
        for (const node of nodes) {
          if (node?.["@type"] === "ItemList") {
            expect(
              node.itemListElement.length,
              `empty ItemList: ${route}`
            ).toBeGreaterThan(0);
            expect(JSON.stringify(node), route).not.toContain("concepto-");
          }
        }
      }
      idsByPath.set(
        route,
        new Set(
          await page
            .locator("[id]")
            .evaluateAll((nodes) => nodes.map((node) => node.id))
        )
      );
      const hrefs = await page
        .locator("a[href]")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href")!)
        );
      for (const href of hrefs) {
        const url = new URL(href, new URL(route, baseURL));
        if (![new URL(baseURL!).origin, origin].includes(url.origin)) continue;
        if (
          url.pathname.startsWith("/api/") ||
          /\.(?:pdf|webp|png|jpg|svg)$/.test(url.pathname)
        )
          continue;
        const target = `${url.pathname}${url.search}`;
        const fragments = destinations.get(target) ?? new Set<string>();
        if (url.hash) fragments.add(decodeURIComponent(url.hash.slice(1)));
        destinations.set(target, fragments);
      }
    }
    for (const [target, fragments] of destinations) {
      const response = await request.get(target);
      expect(response.status(), `broken internal link: ${target}`).toBe(200);
      if (fragments.size === 0) continue;
      const ids =
        idsByPath.get(target) ??
        new Set(
          await page.evaluate(
            (html) =>
              Array.from(
                new DOMParser()
                  .parseFromString(html, "text/html")
                  .querySelectorAll("[id]")
              ).map((node) => node.id),
            await response.text()
          )
        );
      for (const fragment of fragments)
        expect(
          ids.has(fragment),
          `missing fragment: ${target}#${fragment}`
        ).toBe(true);
    }
    const sitemapResponse = await request.get("/sitemap.xml");
    expect(sitemapResponse.status()).toBe(200);
    const sitemap = await sitemapResponse.text();
    expect(sitemap).not.toContain("concepto-");
    const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? "").href
    );
    expect(new Set(locations).size).toBe(locations.length);
    for (const route of publicRoutes)
      expect(locations, `missing sitemap page: ${route}`).toContain(
        `${origin}${route}`
      );
    for (const location of locations) {
      const url = new URL(location);
      expect(url.origin).toBe(origin);
      expect(
        (await request.get(url.pathname)).status(),
        `sitemap destination: ${location}`
      ).toBe(200);
    }
  } finally {
    await context.close();
  }
});

test("mobile hero copy and motion controls remain separate on short screens", async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== "mobile",
    "This checks the constrained mobile hero layout."
  );
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 568 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    const controls = page.locator(".motion-controls");
    const note = page.locator(".hero-note");
    await expect(controls).toBeVisible();
    await expect(note).toBeVisible();
    const controlBox = await controls.boundingBox();
    const noteBox = await note.boundingBox();
    expect(controlBox).not.toBeNull();
    expect(noteBox).not.toBeNull();
    expect(
      controlBox!.y,
      `${viewport.width}px: motion controls overlap the hero note`
    ).toBeGreaterThanOrEqual(noteBox!.y + noteBox!.height);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    ).toBe(true);
  }
});

test("filters, private views and concepts remain outside search indexes", async ({
  page,
  request,
}, info) => {
  test.skip(
    info.project.name === "mobile",
    "Robots and canonical responses are identical across viewports."
  );
  for (const route of [
    "/categoria/plata-925?orden=nuevos",
    "/buscar?q=anillo",
    "/favoritos",
    "/checkout",
    "/producto/concepto-onda-plata",
  ]) {
    await page.goto(route);
    await expect(page.locator('meta[name="robots"]'), route).toHaveAttribute(
      "content",
      /noindex/
    );
    if (route.startsWith("/categoria/"))
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${origin}/categoria/plata-925`
      );
  }
  for (const slug of ["plata-925", "promesa"]) {
    const route = `/categoria/${slug}?page=999`;
    const response = await page.goto(route);
    if (response?.status() === 200) {
      await expect(page.locator('meta[name="robots"]'), route).toHaveAttribute(
        "content",
        /noindex/
      );
      await expect(
        page.locator('link[rel="canonical"]'),
        route
      ).toHaveAttribute("href", `${origin}/categoria/${slug}`);
    } else expect(response?.status(), route).toBe(404);
  }
  const robots = await (await request.get("/robots.txt")).text();
  for (const route of [
    "/admin",
    "/api",
    "/checkout",
    "/pedido",
    "/cuenta",
    "/favoritos",
    "/setup",
  ])
    expect(robots).toContain(`Disallow: ${route}`);
});

test("the placeholder gallery works with keyboard selection and stays out of merchant images", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/producto/concepto-onda-plata");
  const gallery = page.getByRole("figure", { name: "Galería del producto" });
  const buttons = gallery
    .locator(".product-gallery-thumbnails")
    .getByRole("button");
  await expect(buttons).toHaveCount(3);
  await expect(buttons.nth(0)).toHaveAttribute("aria-pressed", "true");
  for (let index = 1; index < 3; index++) {
    await buttons.nth(index).focus();
    await page.keyboard.press("Enter");
    await expect(buttons.nth(index)).toHaveAttribute("aria-pressed", "true");
    await expect(buttons.nth(index - 1)).toHaveAttribute(
      "aria-pressed",
      "false"
    );
  }
  await expect(gallery.locator("figcaption")).toContainText(
    "no es una foto del producto real"
  );
  await expect(gallery.locator("img").first()).toHaveAttribute("alt", /mano/);
  const data = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).join(" ");
  expect(data).not.toMatch(
    /ring-detail-desktop\.webp|silver\.webp|ring-on-hand-mobile\.webp/
  );
  const product = (JSON.parse(data) as Record<string, unknown>[]).find(
    (node) => node["@type"] === "Product"
  );
  expect(product).toBeTruthy();
  expect(product?.offers).toBeUndefined();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
  expect(errors).toEqual([]);
});

test("guide jump links and FAQ disclosure work on desktop and mobile", async ({
  page,
}) => {
  await page.goto("/guias/talles");
  await page
    .getByRole("link", { name: "Calculá tu medida", exact: true })
    .click();
  await expect(page).toHaveURL(/#medida$/);
  await expect(page.locator("#medida")).toBeInViewport();
  await page
    .getByRole("link", { name: "Preguntas frecuentes", exact: true })
    .click();
  await expect(page.locator("#preguntas")).toBeInViewport();
  const question = page.locator("#preguntas details").first();
  await question.locator("summary").click();
  await expect(question).toHaveAttribute("open", "");
  await expect(question.locator("p")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    )
  ).toBe(true);
});
