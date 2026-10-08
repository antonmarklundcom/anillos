import { beforeEach, expect, it } from "vitest";
import { normalizeWishlistSlugs, useWishlist } from "@/lib/wishlist-store";
beforeEach(() => {
  useWishlist.setState({ slugs: [] });
});
it("validates and deduplicates before the unique-item limit", () => {
  expect(
    normalizeWishlistSlugs([
      ...Array(60).fill("one"),
      "two",
      "INVALID",
      "bad/path",
      "a".repeat(161),
    ])
  ).toEqual(["one", "two"]);
});
it("bulk save does not duplicate input or reorder already saved favourites", () => {
  useWishlist.setState({ slugs: ["old", "existing"] });
  useWishlist.getState().addMany(["new", "new", "existing"]);
  expect(useWishlist.getState().slugs).toEqual(["new", "old", "existing"]);
});
