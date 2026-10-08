"use server";
import { z } from "zod";
import { eq, inArray } from "drizzle-orm";
import { requireOwnerSession } from "@/lib/admin-guard";
import { getDb } from "@/db";
import { products, variants } from "@/db/schema";
import { BULK_MAX_IDS, PERCENT_MAX, PERCENT_MIN } from "@/domain/admin-bulk";
import { readSalesWorkspace } from "@/domain/sales-workspace-store";
import {
  salesPriceFloorPreview,
  type PriceFloorPreview,
} from "@/domain/sales-price-floors";

export async function previewSalesPriceFloors(
  input: unknown
): Promise<
  { ok: true; result: PriceFloorPreview } | { ok: false; error: string }
> {
  try {
    await requireOwnerSession();
    const parsed = z
      .object({
        productIds: z
          .array(z.number().int().positive())
          .min(1)
          .max(BULK_MAX_IDS),
        percent: z.number().int().min(PERCENT_MIN).max(PERCENT_MAX),
        roundTo: z.union([z.literal(100), z.literal(1000)]),
      })
      .strict()
      .safeParse(input);
    if (!parsed.success)
      return {
        ok: false,
        error: "Revisá la selección y el ajuste de precios.",
      };
    const { workspace, migrationRequired } = await readSalesWorkspace();
    if (migrationRequired)
      return {
        ok: false,
        error:
          "El control de costos necesita la migración del espacio de ventas.",
      };
    const rows = await getDb()
      .select({
        id: variants.id,
        productId: variants.productId,
        pricePyg: variants.pricePyg,
        slug: products.slug,
        name: products.name,
        specifications: products.specifications,
      })
      .from(variants)
      .innerJoin(products, eq(variants.productId, products.id))
      .where(inArray(products.id, [...new Set(parsed.data.productIds)]));
    return {
      ok: true,
      result: salesPriceFloorPreview(
        rows,
        workspace.productCostProfiles,
        parsed.data.percent,
        parsed.data.roundTo
      ),
    };
  } catch {
    return {
      ok: false,
      error:
        "No se pudo comprobar el piso de costos. Requiere sesión de propietario.",
    };
  }
}
