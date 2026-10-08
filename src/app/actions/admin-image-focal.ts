"use server";
import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDb } from "@/db";
import { productImages } from "@/db/schema";
import { ImageFocalPointSchema } from "@/domain/image-focal-point";
import { z } from "zod";
import {
  requireStaffSession,
  adminActionError,
  type AdminActionResult,
} from "@/lib/admin-guard";

export async function saveProductImageFocalPoint(
  input: unknown
): Promise<AdminActionResult> {
  try {
    await requireStaffSession();
    const parsed = ImageFocalPointSchema.safeParse(input);
    if (!parsed.success)
      return {
        ok: false,
        error: "El punto de enfoque debe estar entre 0 y 100.",
      };
    const { productId, imageId, focalPointX, focalPointY } = parsed.data;
    const saved = await getDb().transaction(async (tx) => {
      const condition = and(
        eq(productImages.id, imageId),
        eq(productImages.productId, productId)
      );
      const [image] = await tx
        .select({ id: productImages.id })
        .from(productImages)
        .where(condition)
        .for("update");
      if (!image) return false;
      await tx
        .update(productImages)
        .set({ focalPointX, focalPointY })
        .where(condition);
      return true;
    });
    if (!saved)
      return { ok: false, error: "La imagen no pertenece a este producto." };
    revalidatePath(`/admin/productos/${productId}`);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return adminActionError("saveProductImageFocalPoint", error);
  }
}

export async function moveProductImage(
  input: unknown
): Promise<AdminActionResult> {
  try {
    await requireStaffSession();
    const parsed = z
      .object({
        productId: z.number().int().positive(),
        imageId: z.number().int().positive(),
        direction: z.enum(["previous", "next"]),
      })
      .strict()
      .safeParse(input);
    if (!parsed.success)
      return { ok: false, error: "Revisá la imagen y la dirección." };
    const { productId, imageId, direction } = parsed.data;
    const moved = await getDb().transaction(async (tx) => {
      const rows = await tx
        .select({ id: productImages.id })
        .from(productImages)
        .where(eq(productImages.productId, productId))
        .orderBy(asc(productImages.position), asc(productImages.id))
        .for("update");
      const index = rows.findIndex((row) => row.id === imageId);
      if (index < 0) return false;
      const next = index + (direction === "previous" ? -1 : 1);
      if (next < 0 || next >= rows.length) return true;
      [rows[index], rows[next]] = [rows[next]!, rows[index]!];
      for (const [position, image] of rows.entries())
        await tx
          .update(productImages)
          .set({ position })
          .where(
            and(
              eq(productImages.id, image.id),
              eq(productImages.productId, productId)
            )
          );
      return true;
    });
    if (!moved)
      return { ok: false, error: "La imagen no pertenece a este producto." };
    revalidatePath(`/admin/productos/${productId}`);
    revalidatePath("/", "layout");
    return { ok: true };
  } catch (error) {
    return adminActionError("moveProductImage", error);
  }
}
