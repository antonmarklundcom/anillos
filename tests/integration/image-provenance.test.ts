import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { productImages } from "@/db/schema";
import {
  addProductImage,
  updateProductImageDetails,
} from "@/domain/admin-products";
import { dumpRows } from "@/domain/backup";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";
import { createProduct } from "../helpers/factories";

describe.skipIf(!hasTestDb)("per-image provenance writes", () => {
  beforeEach(resetTables);
  afterAll(closeTestDb);

  it("keeps unknown and illustrative uploads unverified even with a confirmation", async () => {
    const product = await createProduct();
    await addProductImage({
      productId: product,
      cloudinaryId: "test/unknown",
      alt: null,
      verified: true,
    });
    await addProductImage({
      productId: product,
      cloudinaryId: "test/illustrative",
      alt: null,
      provenance: "illustrative",
      verified: true,
    });
    const images = await getTestDb().select().from(productImages);
    expect(images).toHaveLength(2);
    expect(images.every((image) => image.verifiedAt === null)).toBe(true);
  });

  it("stamps genuine confirmation on the server, preserves it for an alt edit and clears it on a provenance change", async () => {
    const product = await createProduct();
    const before = Date.now();
    await addProductImage({
      productId: product,
      cloudinaryId: "test/owned",
      alt: null,
      provenance: "owned-photo",
      verified: true,
    });
    const [image] = await getTestDb().select().from(productImages);
    expect(image!.verifiedAt!.getTime()).toBeGreaterThanOrEqual(before);
    expect(image!.verifiedAt!.getTime()).toBeLessThanOrEqual(Date.now());
    await updateProductImageDetails({
      productId: product,
      imageId: image!.id,
      alt: "Vista lateral",
      provenance: "owned-photo",
      verified: true,
    });
    const [edited] = await getTestDb().select().from(productImages);
    expect(edited!.verifiedAt).toEqual(image!.verifiedAt);
    expect(edited!.alt).toBe("Vista lateral");
    await updateProductImageDetails({
      productId: product,
      imageId: image!.id,
      alt: "Referencia ilustrativa",
      provenance: "illustrative",
      verified: true,
    });
    const [changed] = await getTestDb().select().from(productImages);
    expect(changed!.verifiedAt).toBeNull();
  });

  it("cannot edit another product's image and includes provenance columns in backups", async () => {
    const product = await createProduct();
    const other = await createProduct();
    await addProductImage({
      productId: product,
      cloudinaryId: "test/supplier",
      alt: null,
      provenance: "supplier-authorized",
      verified: true,
    });
    const [image] = await getTestDb().select().from(productImages);
    await expect(
      updateProductImageDetails({
        productId: other,
        imageId: image!.id,
        alt: "Wrong",
        provenance: null,
        verified: false,
      })
    ).rejects.toThrow();
    const [unchanged] = await getTestDb()
      .select()
      .from(productImages)
      .where(eq(productImages.id, image!.id));
    expect(unchanged!.provenance).toBe("supplier-authorized");
    const rows = [];
    for await (const row of dumpRows(getTestDb()))
      if (row.table === "product_images") rows.push(row.row);
    expect(rows).toHaveLength(1);
    expect(rows[0]!.provenance).toBe("supplier-authorized");
    expect(rows[0]!.verified_at).toBeTruthy();
  });
});
