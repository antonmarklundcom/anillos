import { describe, expect, it } from "vitest";
import {
  merchantImages,
  verifiedProductImage,
} from "@/lib/product-image-provenance";

describe("per-image merchant authorization", () => {
  it("does not authorize legacy uploads, illustrations or future confirmations", () => {
    expect(verifiedProductImage({})).toBe(false);
    expect(verifiedProductImage({ provenance: "supplier-authorized" })).toBe(
      false
    );
    expect(
      verifiedProductImage({
        provenance: "illustrative",
        verifiedAt: "2026-01-01T00:00:00Z",
      })
    ).toBe(false);
    expect(
      verifiedProductImage({
        provenance: "owned-photo",
        verifiedAt: "2099-01-01T00:00:00Z",
      })
    ).toBe(false);
  });
  it("filters individual images and supports DB dates and serialized timestamps", () => {
    const images = [
      {
        id: 1,
        provenance: "owned-photo" as const,
        verifiedAt: new Date("2026-01-01T00:00:00Z"),
      },
      {
        id: 2,
        provenance: "supplier-authorized" as const,
        verifiedAt: "2026-01-01T00:00:00Z",
      },
      { id: 3, provenance: null, verifiedAt: null },
    ];
    expect(merchantImages(images).map((image) => image.id)).toEqual([1, 2]);
  });
});
