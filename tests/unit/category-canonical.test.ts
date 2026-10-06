import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  products: vi.fn(),
  notFound: vi.fn(),
  error: vi.fn(),
}));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("@/lib/log", () => ({ log: { error: mocks.error } }));
vi.mock("@/domain/store-settings", async () => {
  const { DEFAULT_STORE_SETTINGS } =
    await import("@/domain/store-settings-schema");
  return { getStoreSettings: async () => DEFAULT_STORE_SETTINGS };
});
vi.mock("@/db/queries", () => ({
  getCategoryBySlug: async () => ({
    slug: "rings",
    name: "Rings",
    description: null,
  }),
  getCategories: async () => [],
  getBrands: async () => [],
  getCategoryProducts: mocks.products,
  isCatalogSort: vi.fn(),
}));
vi.mock("@/store/catalog", () => ({
  getStoreCategory: async () => ({
    slug: "rings",
    name: "Rings",
    description: null,
    id: 1,
    catalogAvailable: true,
  }),
  getStoreCategories: async () => [],
}));
import CategoryPage, { generateMetadata } from "@/app/categoria/[slug]/page";
describe("category pagination canonicals", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.products.mockResolvedValue({
      products: [],
      total: 25,
      page: 2,
      perPage: 12,
      totalPages: 3,
    });
    mocks.notFound.mockImplementation(() => {
      throw new Error("NEXT_NOT_FOUND");
    });
  });
  afterEach(() => vi.unstubAllEnvs());
  it.each([
    [{}, "https://store.example.test/categoria/rings", undefined],
    [
      { page: "2" },
      "https://store.example.test/categoria/rings?page=2",
      undefined,
    ],
    [{ page: "2x" }, "https://store.example.test/categoria/rings", undefined],
    [
      { page: "2", precio: "1-100" },
      "https://store.example.test/categoria/rings",
      { index: false, follow: true },
    ],
  ] as const)(
    "canonical and indexing for %j",
    async (query, canonical, robots) => {
      vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://store.example.test");
      const metadata = await generateMetadata({
        params: Promise.resolve({ slug: "rings" }),
        searchParams: Promise.resolve(query),
      });
      expect(metadata.alternates?.canonical).toBe(canonical);
      expect(metadata.robots).toEqual(robots);
    }
  );

  it("deindexes guide-only pagination after a product-query outage while the category record is available", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://store.example.test");
    mocks.products.mockRejectedValue(
      new Error("database temporarily unavailable")
    );
    const props = {
      params: Promise.resolve({ slug: "rings" }),
      searchParams: Promise.resolve({ page: "2" }),
    };
    const metadata = await generateMetadata(props);
    expect(metadata.alternates?.canonical).toBe(
      "https://store.example.test/categoria/rings"
    );
    expect(metadata.robots).toEqual({ index: false, follow: true });
    await expect(CategoryPage(props)).resolves.toMatchObject({ type: "main" });
    expect(mocks.notFound).not.toHaveBeenCalled();
  });

  it("keeps a successfully queried impossible page as a 404 instead of a guide copy", async () => {
    mocks.products.mockResolvedValue({
      products: [],
      total: 1,
      page: 2,
      perPage: 12,
      totalPages: 1,
    });
    await expect(
      CategoryPage({
        params: Promise.resolve({ slug: "rings" }),
        searchParams: Promise.resolve({ page: "2" }),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("passes the same supported filters and sort into pagination metadata queries", async () => {
    await generateMetadata({
      params: Promise.resolve({ slug: "rings" }),
      searchParams: Promise.resolve({
        page: "2",
        marca: ["Marca real", "ignored"],
        precio: "100000-300000",
        orden: "unknown",
      }),
    });
    expect(mocks.products).toHaveBeenCalledWith({
      categorySlug: "rings",
      brand: "Marca real",
      minPricePyg: 100000,
      maxPricePyg: 300000,
      sort: "relevancia",
      page: 2,
    });
  });
});
