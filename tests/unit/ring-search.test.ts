import { beforeEach, expect, it, vi } from "vitest";
const calls = vi.hoisted(() => ({ search: vi.fn(), suggest: vi.fn() }));
vi.mock("@/db/queries", () => ({
  searchProducts: calls.search,
  suggestProducts: calls.suggest,
}));
import {
  matchingRingInformation,
  normalizedRingSearch,
  searchStoreProducts,
  suggestStoreProducts,
} from "@/store/search";
beforeEach(() => vi.resetAllMocks());

it("recognizes local size and wedding vocabulary in information searches", () => {
  expect(normalizedRingSearch("Argollas y tallas")).toBe("alianzas y talle");
  expect(
    matchingRingInformation("talla de anillo", []).guides.map((x) => x.slug)
  ).toContain("talles");
  expect(
    matchingRingInformation("argollas", [
      { slug: "alianzas-plata", name: "Alianzas de plata" },
    ]).categories
  ).toHaveLength(1);
});

it("never returns disabled categories absent from the available input", () => {
  expect(matchingRingInformation("oro", []).categories).toEqual([]);
  expect(matchingRingInformation("zzunknown", []).guides).toEqual([]);
});

it("keeps original product results and retries a synonym only after zero matches", async () => {
  calls.search.mockResolvedValueOnce([{ slug: "owner-argolla" }]);
  expect(await searchStoreProducts("argolla")).toEqual([
    { slug: "owner-argolla" },
  ]);
  expect(calls.search).toHaveBeenCalledTimes(1);
  calls.search
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ slug: "owner-alianza" }]);
  expect(await searchStoreProducts("argollas")).toEqual([
    { slug: "owner-alianza" },
  ]);
  expect(calls.search).toHaveBeenLastCalledWith("alianzas");
});

it("does not hide database errors or retry unavailable product queries", async () => {
  calls.search.mockRejectedValueOnce(new Error("unavailable"));
  await expect(searchStoreProducts("argollas")).rejects.toThrow("unavailable");
  expect(calls.search).toHaveBeenCalledTimes(1);
});

it("applies the same synonym retry to suggestions", async () => {
  calls.suggest
    .mockResolvedValueOnce([])
    .mockResolvedValueOnce([{ slug: "ring" }]);
  expect(await suggestStoreProducts("argollas")).toEqual([{ slug: "ring" }]);
  expect(calls.suggest).toHaveBeenLastCalledWith("alianzas");
});
