import { describe, expect, it } from "vitest";
import { ringSearchSuggestions, normalizedRingSearch } from "@/store/search";
import { ImageFocalPointSchema } from "@/domain/image-focal-point";
import { parseCatalogueFilters } from "@/domain/catalogue-facets";

describe("bounded ring search", () => {
  it("corrects only curated spellings and synonyms", () => {
    expect(ringSearchSuggestions("anilos de compromiso")[0]).toBe(
      "anillos de compromiso"
    );
    expect(normalizedRingSearch("argollas talla")).toBe("alianzas talle");
    expect(ringSearchSuggestions("acero quirurgico")).toEqual([]);
    expect(ringSearchSuggestions("x".repeat(161))).toEqual([]);
  });
});
describe("image focal input", () => {
  const input = { productId: 1, imageId: 2, focalPointX: 0, focalPointY: 100 };
  it("allows integer bounds and explicit centering", () => {
    expect(ImageFocalPointSchema.safeParse(input).success).toBe(true);
    expect(
      ImageFocalPointSchema.safeParse({
        ...input,
        focalPointX: null,
        focalPointY: null,
      }).success
    ).toBe(true);
  });
  it("rejects range, fractional, partial and injected data", () => {
    for (const value of [-1, 101, 1.5, "0;DROP TABLE products", null])
      expect(
        ImageFocalPointSchema.safeParse({ ...input, focalPointX: value })
          .success
      ).toBe(false);
    expect(
      ImageFocalPointSchema.safeParse({ ...input, verifiedAt: "fake" }).success
    ).toBe(false);
  });
});
describe("verified catalogue filter inputs", () => {
  it("keeps exact shape and width selections", () => {
    expect(parseCatalogueFilters({ forma: "oval", ancho: "2.5" })).toEqual({
      stoneShape: "oval",
      widthMm: "2.5",
    });
  });
  it("fails closed on invalid width and array input", () => {
    expect(parseCatalogueFilters({ ancho: "-1" }).invalid).toBe(true);
    expect(parseCatalogueFilters({ forma: ["oval"] }).invalid).toBe(true);
  });
});
