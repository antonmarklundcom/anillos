import { expect, it } from "vitest";
import { findRingCollections } from "@/store/ring-finder";

it("recommends only actual available destinations, without duplicate collections", () => {
  const result = findRingCollections({
    occasion: "boda",
    preference: "dos",
    available: [
      { slug: "alianzas", name: "Boda" },
      { slug: "promesa", name: "Promesa" },
    ],
  });
  expect(result.collections.map((item) => item.slug)).toEqual(["alianzas"]);
  expect(result.guide).toBe("alianzas-boda-civil");
  expect(result.note).toContain("dos medidas independientes");
});
it("has a useful informational fallback when there are no categories", () => {
  const result = findRingCollections({
    occasion: "diario",
    preference: "sencillo",
    available: [],
  });
  expect(result.collections).toEqual([]);
  expect(result.guide).toBe("talles");
});
it("organizes stone-style searches without claiming a gemstone or a priced product", () => {
  const result = findRingCollections({
    occasion: "compromiso",
    preference: "piedra",
    available: [
      { slug: "solitarios", name: "Solitarios" },
      { slug: "compromiso", name: "Compromiso" },
    ],
  });
  expect(result.collections.map((item) => item.slug)).toEqual([
    "compromiso",
    "solitarios",
  ]);
  expect(result.note).toContain("debe estar confirmada");
  expect(result).not.toHaveProperty("price");
});
