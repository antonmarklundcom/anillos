import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  records: [] as {
    id: number;
    slug: string;
    name: string;
    isActive: boolean;
  }[],
  failure: false,
  complete: vi.fn(),
  error: vi.fn(),
}));
vi.mock("@/db", () => ({
  getDb: () => ({
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            if (mocks.failure) throw Error("unavailable");
            return mocks.records;
          },
        }),
        orderBy: async () => {
          if (mocks.failure) throw Error("unavailable");
          return mocks.records;
        },
      }),
    }),
  }),
}));
vi.mock("@/db/queries", () => ({ getCategoryBySlug: mocks.complete }));
vi.mock("@/lib/log", () => ({ log: { error: mocks.error } }));
import { getStoreCategories, getStoreCategory } from "@/store/catalog";
import { COLLECTIONS } from "@/config/ring-store";

beforeEach(() => {
  mocks.records = [];
  mocks.failure = false;
  vi.resetAllMocks();
});

it("serves known collection information before seed without inventing purchasable data", async () => {
  const category = await getStoreCategory("acero");
  expect(category).toMatchObject({
    id: null,
    name: "Anillos de acero",
    catalogAvailable: false,
  });
  expect(category).not.toHaveProperty("products");
  expect(await getStoreCategory("unknown-collection")).toBeNull();
});

it("keeps collection information available during a database failure and records the failure", async () => {
  mocks.failure = true;
  expect(await getStoreCategory("plata-925")).toMatchObject({
    catalogAvailable: false,
  });
  expect(await getStoreCategories()).toHaveLength(COLLECTIONS.length);
  expect(mocks.error).toHaveBeenCalled();
});

it("does not revive an owner-disabled collection in routes or navigation", async () => {
  mocks.records = [{ id: 7, slug: "acero", name: "Oculta", isActive: false }];
  expect(await getStoreCategory("acero")).toBeNull();
  expect((await getStoreCategories()).map((item) => item.slug)).not.toContain(
    "acero"
  );
  expect(mocks.complete).not.toHaveBeenCalled();
});

it("retains owner names with an older schema and leaves the catalog unavailable", async () => {
  mocks.records = [
    { id: 7, slug: "acero", name: "Acero del atelier", isActive: true },
  ];
  mocks.complete.mockRejectedValue(new Error("missing column"));
  expect(await getStoreCategory("acero")).toMatchObject({
    id: 7,
    name: "Acero del atelier",
    catalogAvailable: false,
  });
});

it("uses the complete active database category when it is healthy", async () => {
  mocks.records = [
    { id: 7, slug: "acero", name: "Acero del atelier", isActive: true },
  ];
  mocks.complete.mockResolvedValue({
    ...mocks.records[0],
    description: "Descripción del dueño",
    imageAlt: "Foto real",
    imageCloudinaryId: "owner/photo",
  });
  expect(await getStoreCategory("acero")).toMatchObject({
    catalogAvailable: true,
    description: "Descripción del dueño",
    imageCloudinaryId: "owner/photo",
  });
});
