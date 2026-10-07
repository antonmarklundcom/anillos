import { describe, expect, it } from "vitest";
import {
  productSeoReadiness,
  type ProductReadinessInput,
} from "@/store/product-seo-readiness";

const confirmed: ProductReadinessInput = {
  slug: "modelo-prueba",
  name: "Banda de prueba",
  categorySlug: "plata-925",
  description: "Descripción del modelo confirmado.",
  saleMode: "stock",
  showPrice: true,
  specifications: {
    material: "Plata",
    purity: "925",
    unit: "individual",
    verifiedAt: "2026-10-06T19:36:00Z",
  },
  supplierDetails: {
    reference: "REF-SINTETICA",
    sourceUrl: "https://supplier.example.test/modelo",
    verifiedAt: "2026-10-06T19:36:00Z",
    imageProvenance: "supplier-authorized",
  },
  images: [
    {
      cloudinaryId: "test/modelo",
      alt: "Vista frontal del modelo de prueba",
      provenance: "supplier-authorized",
      verifiedAt: "2026-10-06T19:36:00Z",
    },
  ],
  variants: [
    {
      pricePyg: 250000,
      stock: 0,
      attributes: { verifiedAt: "2026-10-06T19:36:00Z", interiorMm: 18 },
    },
  ],
};
describe("advisory product publication and SEO checklist", () => {
  it("ignores inactive variants while requiring at least one active variant", () => {
    const inactive = { isActive: false, pricePyg: 0 };
    expect(
      productSeoReadiness({
        ...confirmed,
        variants: [...confirmed.variants!, inactive],
      }).missing
    ).toBe(0);
    expect(
      productSeoReadiness({ ...confirmed, variants: [inactive] }).checks.find(
        (check) => check.id === "inventory"
      )?.status
    ).toBe("missing");
  });
  it("recognizes confirmed facts/photos and explicit out-of-stock inventory", () => {
    const review = productSeoReadiness(confirmed);
    expect(review.missing).toBe(0);
    expect(review.genuinePhotos).toBe(true);
    expect(
      review.checks.find((check) => check.id === "inventory")?.status
    ).toBe("complete");
    expect(JSON.stringify(review)).not.toContain("supplier.example.test");
    expect(JSON.stringify(review)).not.toContain("REF-SINTETICA");
  });
  it("does not treat image uploads or typed attributes as verified supplier facts", () => {
    const review = productSeoReadiness({
      ...confirmed,
      images: [
        { cloudinaryId: "test/unverified", alt: "Foto sin permiso confirmado" },
      ],
      specifications: { material: "Plata", unit: "individual" },
      supplierDetails: {
        reference: "REF",
        imageProvenance: "supplier-authorized",
      },
    });
    expect(review.factsVerified).toBe(false);
    expect(review.genuinePhotos).toBe(false);
    expect(review.checks.find((check) => check.id === "material")?.status).toBe(
      "missing"
    );
  });
  it("allows enquiry/showcase without manufacturing a price or inventory requirement", () => {
    for (const saleMode of ["enquiry", "showcase"] as const) {
      const review = productSeoReadiness({
        ...confirmed,
        saleMode,
        showPrice: false,
        variants: [
          {
            attributes: {
              verifiedAt: "2026-10-06T19:36:00Z",
              sizeSystem: "Proveedor",
              sizeLabel: "M",
            },
          },
        ],
      });
      expect(review.missing).toBe(0);
      expect(review.checks.find((check) => check.id === "price")?.status).toBe(
        "optional"
      );
      expect(review.checks.some((check) => check.id === "inventory")).toBe(
        false
      );
    }
  });
  it("keeps concepts restricted despite apparent verified facts and positive stock", () => {
    const review = productSeoReadiness({
      ...confirmed,
      slug: "CONCEPTO-prueba",
      variants: [
        {
          pricePyg: 250000,
          stock: 12,
          attributes: { verifiedAt: "2026-10-06T19:36:00Z", interiorMm: 18 },
        },
      ],
    });
    expect(review.concept).toBe(true);
    expect(review.factsVerified).toBe(false);
    expect(review.genuinePhotos).toBe(false);
    expect(review.checks.find((check) => check.id === "price")?.status).toBe(
      "restricted"
    );
  });
  it("requires both measures for a pair and real stock/price values for sales", () => {
    const pair = {
      ...confirmed,
      specifications: { ...confirmed.specifications, unit: "pair" as const },
    };
    expect(
      productSeoReadiness(pair).checks.find((check) => check.id === "sizes")
        ?.status
    ).toBe("missing");
    expect(
      productSeoReadiness({
        ...pair,
        variants: [
          {
            pricePyg: 1,
            stock: 0,
            attributes: {
              verifiedAt: "2026-10-06T19:36:00Z",
              interiorMm: 18,
              interiorMmSecond: 16,
            },
          },
        ],
      }).missing
    ).toBe(0);
    const invalid = productSeoReadiness({
      ...confirmed,
      variants: [
        {
          pricePyg: 0,
          attributes: { verifiedAt: "2026-10-06T19:36:00Z", interiorMm: 18 },
        },
      ],
    });
    expect(
      invalid.checks.find((check) => check.id === "inventory")?.status
    ).toBe("missing");
    expect(invalid.checks.find((check) => check.id === "price")?.status).toBe(
      "missing"
    );
  });
  it("does not recognize illustrative provenance as genuine photography", () => {
    expect(
      productSeoReadiness({
        ...confirmed,
        images: [{ ...confirmed.images![0], provenance: "illustrative" }],
      }).genuinePhotos
    ).toBe(false);
  });
  it("separates sample-confirmed facts from a supplier agreement and requires independently verified sizes", () => {
    const ownSample = productSeoReadiness({
      ...confirmed,
      supplierDetails: null,
    });
    expect(ownSample.factsVerified).toBe(true);
    expect(
      ownSample.checks.find((check) => check.id === "material")?.status
    ).toBe("complete");
    expect(
      ownSample.checks.find((check) => check.id === "supplier")?.status
    ).toBe("missing");
    const unverifiedSizes = productSeoReadiness({
      ...confirmed,
      variants: [
        { pricePyg: 250000, stock: 0, attributes: { interiorMm: 18 } },
      ],
    });
    expect(
      unverifiedSizes.checks.find((check) => check.id === "sizes")?.status
    ).toBe("missing");
    expect(
      productSeoReadiness({
        ...confirmed,
        specifications: { material: "Plata", unit: "individual" },
      }).factsVerified
    ).toBe(false);
    expect(
      productSeoReadiness({
        ...confirmed,
        specifications: {
          ...confirmed.specifications,
          verifiedAt: "2099-01-01T00:00:00Z",
        },
      }).factsVerified
    ).toBe(false);
  });
});
