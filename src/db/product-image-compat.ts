import { asc, inArray, sql } from "drizzle-orm";
import type { Executor } from "@/domain/executor";
import { productImages } from "./schema";

export function productImageFocalMigrationMissing(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const entry = error as { code?: string; cause?: unknown };
  return (
    entry.code === "ER_BAD_FIELD_ERROR" ||
    (entry.cause !== error && productImageFocalMigrationMissing(entry.cause))
  );
}

/** Keep the existing catalogue readable until migration 0025 is applied. */
export async function readProductImages(
  executor: Executor,
  productIds: number[]
): Promise<(typeof productImages.$inferSelect)[]> {
  if (!productIds.length) return [];
  const condition = inArray(productImages.productId, productIds);
  try {
    return await executor
      .select()
      .from(productImages)
      .where(condition)
      .orderBy(asc(productImages.position), asc(productImages.id));
  } catch (error) {
    if (!productImageFocalMigrationMissing(error)) throw error;
    const legacy = await executor
      .select({
        id: productImages.id,
        productId: productImages.productId,
        cloudinaryId: productImages.cloudinaryId,
        provenance: productImages.provenance,
        verifiedAt: productImages.verifiedAt,
        blurDataUrl: productImages.blurDataUrl,
        alt: productImages.alt,
        position: productImages.position,
      })
      .from(productImages)
      .where(condition)
      .orderBy(asc(productImages.position), asc(productImages.id));
    return legacy.map((image) => ({
      ...image,
      focalPointX: null,
      focalPointY: null,
    }));
  }
}

/** A focal update requires both new columns; ordinary image CRUD does not. */
export async function assertProductImageFocalColumns(
  executor: Executor
): Promise<void> {
  await executor
    .select({ x: productImages.focalPointX, y: productImages.focalPointY })
    .from(productImages)
    .limit(0);
}

/** Explicit parameterized old-column insert avoids Drizzle emitting new defaults. */
export async function insertProductImageCompatible(
  executor: Executor,
  image: {
    productId: number;
    cloudinaryId: string;
    alt: string | null;
    provenance: (typeof productImages.$inferSelect)["provenance"];
    verifiedAt: Date | null;
    position: number;
  }
): Promise<void> {
  const verifiedAt =
    image.verifiedAt?.toISOString().slice(0, 23).replace("T", " ") ?? null;
  await executor.execute(sql`INSERT INTO product_images
    (product_id, cloudinary_id, alt, provenance, verified_at, position)
    VALUES (${image.productId}, ${image.cloudinaryId}, ${image.alt},
      ${image.provenance}, ${verifiedAt}, ${image.position})`);
}
