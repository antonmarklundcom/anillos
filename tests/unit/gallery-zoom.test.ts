import { expect, it } from "vitest";
import { galleryPanBounds } from "@/lib/gallery-zoom";
it("uses actual fitted dimensions without allowing empty letterbox panning", () => {
  expect(
    galleryPanBounds({ width: 390, height: 500 }, 1, {
      width: 780,
      height: 500,
    })
  ).toEqual({ x: 0, y: 0 });
  expect(
    galleryPanBounds({ width: 390, height: 500 }, 3, {
      width: 780,
      height: 500,
    })
  ).toEqual({ x: 390, y: 125 });
  expect(galleryPanBounds({ width: 1440, height: 900 }, 3)).toEqual({
    x: 1440,
    y: 900,
  });
});
