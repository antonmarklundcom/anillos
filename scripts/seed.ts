import "@/lib/load-env";

import { and, eq } from "drizzle-orm";

import { closePool, getDb } from "@/db";
import {
  categories,
  products,
  shippingZones,
  variants,
  stockAdjustments,
  priceAdjustments,
} from "@/db/schema";
import type { z } from "zod";
import type { Executor } from "@/domain/executor";
import { assertGs } from "@/lib/money";
import { safeError } from "@/lib/safe-error";
import {
  stampVerification,
  ProductSpecificationsSchema,
  SupplierDetailsSchema,
  VariantAttributesSchema,
  VerifiedIdentifiersSchema,
  type ProductSpecifications,
  type SupplierDetails,
  type VariantAttributes,
  type VerifiedIdentifiers,
} from "@/lib/product-attributes";
import {
  assertProductSlugAvailable,
  claimProductSlug,
} from "@/domain/product-slugs";

import {
  SEED_CATEGORIES,
  SEED_PRODUCTS,
  SEED_SHIPPING_ZONES,
} from "./seed-data";

/**
 * Seed idempotente: se puede correr N veces.
 *
 * Las claves naturales son `slug` (categorías, productos, zonas) y `sku`
 * (variantes); todo entra con `ON DUPLICATE KEY UPDATE`, así que re-sembrar
 * actualiza precios y textos **sin** duplicar filas ni pisar `on_hand` de
 * variantes ya existentes… salvo que se pida con `--reset-stock`.
 */
const RESET_STOCK = process.argv.includes("--reset-stock");

/** Una zona tal como la escribe el seed o el cuerpo de `/api/setup/init`. */
export type SeedShippingZone = {
  slug: string;
  name: string;
  cities: readonly string[];
  pricePyg: number;
  freeThresholdPyg: number | null;
  position: number;
};

/**
 * Alta o actualización de zonas de envío, por `slug`.
 *
 * Exportada aparte del seed porque la usan dos caminos: `pnpm db:seed`, con
 * las zonas de ejemplo de Gran Asunción, y `POST /api/setup/init`, con las
 * zonas reales de la tienda en el cuerpo (PLAN.md FASE 2, PR U). Un segundo
 * upsert escrito a mano en la ruta sería un segundo lugar donde olvidarse del
 * `assertGs`, que es lo único que separa un flete en guaraníes enteros de un
 * `35000.5` guardado en una columna de plata.
 *
 * Idempotente por `slug`: re-correrlo actualiza precios, ciudades y orden sin
 * duplicar filas. **No borra las zonas que no vengan en la lista** — borrar
 * una zona que la tienda usa es exactamente el tipo de daño que un curl
 * repetido no tiene que poder hacer.
 */
export async function upsertShippingZones(
  zonas: readonly SeedShippingZone[],
  executor?: ReturnType<typeof getDb>
): Promise<number> {
  const db = executor ?? getDb();

  for (const zone of zonas) {
    assertGs(zone.pricePyg, `shipping_zones.${zone.slug}.price_pyg`);
    if (zone.freeThresholdPyg !== null) {
      assertGs(
        zone.freeThresholdPyg,
        `shipping_zones.${zone.slug}.free_threshold_pyg`
      );
    }

    await db
      .insert(shippingZones)
      .values({
        slug: zone.slug,
        name: zone.name,
        cities: [...zone.cities],
        pricePyg: zone.pricePyg,
        freeThresholdPyg: zone.freeThresholdPyg,
        position: zone.position,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: zone.name,
          cities: [...zone.cities],
          pricePyg: zone.pricePyg,
          freeThresholdPyg: zone.freeThresholdPyg,
          position: zone.position,
          isActive: true,
        },
      });
  }

  return zonas.length;
}

/**
 * Un producto listo para escribir: categoría ya resuelta a id, montos en
 * guaraníes enteros. Es lo que comparten los dos caminos que escriben
 * catálogo — `pnpm db:seed` (datos de ejemplo) y `pnpm importar:productos`
 * (la planilla del comercio). Un segundo upsert a mano en el import sería un
 * segundo lugar donde olvidarse del `assertGs` o del "no pisar `on_hand`".
 */
export type CatalogProductUpsert = {
  specifications?: ProductSpecifications | null;
  supplierDetails?: SupplierDetails | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  saleMode?: "stock" | "enquiry" | "showcase";
  showPrice?: boolean;
  slug: string;
  name: string;
  description?: string | null;
  categoryId: number;
  brand?: string | null;
  ivaRate?: number;
  variants: Array<{
    attributes?: VariantAttributes | null;
    identifiers?: VerifiedIdentifiers | null;
    sku: string;
    label?: string;
    pricePyg: number;
    compareAtPyg?: number | null;
    onHand?: number;
  }>;
};

/**
 * Alta o actualización de productos y variantes, por `slug` y `sku`.
 *
 * Idempotente. `publishedAt` se escribe **sólo al insertar**: re-importar la
 * misma planilla no tiene que hacer que todo el catálogo aparezca como
 * "recién publicado". Y `on_hand` de una variante existente no se toca salvo
 * `resetStock` — el stock real lo maneja la operación del negocio, no una
 * planilla que puede tener semanas.
 *
 * Devuelve cuántas variantes escribió.
 */
export async function upsertCatalogProducts(
  items: readonly CatalogProductUpsert[],
  {
    resetStock = false,
    publishedAt = null,
    actor = "catalog-import",
    actorUserId = null,
    executor,
    verifiedImport = false,
  }: {
    resetStock?: boolean;
    publishedAt?: Date | null;
    actor?: string;
    actorUserId?: number | null;
    executor?: Executor;
    verifiedImport?: boolean;
  } = {}
): Promise<number> {
  if (!executor)
    return getDb().transaction((tx) =>
      upsertCatalogProducts(items, {
        resetStock,
        publishedAt,
        actor,
        actorUserId,
        executor: tx,
        verifiedImport,
      })
    );
  const db = executor;
  let variantCount = 0;

  for (const product of items) {
    if (product.slug.toLowerCase().startsWith("concepto-"))
      throw new Error("Los conceptos no se pueden importar.");
    {
      const [current] = await db
        .select({
          id: products.id,
          slug: products.slug,
          saleMode: products.saleMode,
          publishedAt: products.publishedAt,
          isActive: products.isActive,
          specifications: products.specifications,
          supplierDetails: products.supplierDetails,
        })
        .from(products)
        .where(eq(products.slug, product.slug))
        .limit(1)
        .for("update");
      await assertProductSlugAvailable(db, product.slug, current?.id ?? null);
      const checkedMetadata = (
        value: unknown,
        currentValue: unknown
      ): unknown => {
        if (actorUserId === null) return value; // Trusted owner-run CLI: validated imported dates retained.
        const record =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)
            : null;
        return stampVerification(
          record
            ? {
                ...record,
                ...(verifiedImport && typeof record.verifiedAt === "string"
                  ? { verified: true }
                  : {}),
              }
            : value,
          currentValue,
          { userId: actorUserId, label: actor }
        );
      };
      const parseImported = <T>(
        schema: z.ZodType<T>,
        value: unknown
      ): T | null => {
        const parsed = schema.nullable().safeParse(value);
        if (!parsed.success)
          throw new Error(
            "Revisá los datos verificados de la planilla. Confirmá la ficha, unidad e identificadores en el panel de administración antes de importarlos."
          );
        return parsed.data;
      };
      const details = {
        ...(product.specifications === undefined
          ? {}
          : {
              specifications: parseImported(
                ProductSpecificationsSchema,
                checkedMetadata(product.specifications, current?.specifications)
              ),
            }),
        ...(product.supplierDetails === undefined
          ? {}
          : {
              supplierDetails: parseImported(
                SupplierDetailsSchema,
                checkedMetadata(
                  product.supplierDetails,
                  current?.supplierDetails
                )
              ),
            }),
        ...(product.seoTitle === undefined
          ? {}
          : { seoTitle: product.seoTitle }),
        ...(product.seoDescription === undefined
          ? {}
          : { seoDescription: product.seoDescription }),
      };
      await db
        .insert(products)
        .values({
          ...details,
          saleMode: product.saleMode,
          showPrice:
            (product.saleMode ?? current?.saleMode ?? "stock") === "stock"
              ? true
              : product.showPrice,
          slug: product.slug,
          name: product.name,
          description: product.description ?? null,
          categoryId: product.categoryId,
          brand: product.brand ?? null,
          ivaRate: product.ivaRate ?? 10,
          isActive: true,
          publishedAt,
        })
        .onDuplicateKeyUpdate({
          set: {
            ...details,
            saleMode: product.saleMode,
            showPrice:
              (product.saleMode ?? current?.saleMode ?? "stock") === "stock"
                ? true
                : product.showPrice,
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            brand: product.brand,
            ivaRate: product.ivaRate,
          },
        });

      const productRow = (
        await db
          .select({ id: products.id })
          .from(products)
          .where(eq(products.slug, product.slug))
          .limit(1)
      )[0];
      if (!productRow)
        throw new Error(`No pude releer el producto ${product.slug}`);
      await claimProductSlug(db, product.slug, productRow.id);

      for (const [index, variant] of product.variants.entries()) {
        const [existing] = await db
          .select()
          .from(variants)
          .where(eq(variants.sku, variant.sku))
          .limit(1)
          .for("update");
        const variantDetails = {
          ...(variant.attributes === undefined
            ? {}
            : {
                attributes: parseImported(
                  VariantAttributesSchema,
                  checkedMetadata(variant.attributes, existing?.attributes)
                ),
              }),
          ...(variant.identifiers === undefined
            ? {}
            : {
                identifiers: parseImported(
                  VerifiedIdentifiersSchema,
                  checkedMetadata(variant.identifiers, existing?.identifiers)
                ),
              }),
        };
        assertGs(variant.pricePyg, `${variant.sku}.price_pyg`);

        if (
          variant.pricePyg < 0 ||
          ((product.saleMode ?? current?.saleMode ?? "stock") === "stock" &&
            variant.pricePyg <= 0)
        )
          throw new Error("Compra con stock requiere precio positivo.");
        if (variant.compareAtPyg != null) assertGs(variant.compareAtPyg);
        if (
          variant.onHand !== undefined &&
          (!Number.isSafeInteger(variant.onHand) || variant.onHand < 0)
        )
          throw new Error("Stock inválido.");
        if (existing && existing.productId !== productRow.id)
          throw new Error(
            'El SKU "' + variant.sku + '" pertenece a otro producto.'
          );
        if (!existing) {
          await db.insert(variants).values({
            ...variantDetails,
            productId: productRow.id,
            sku: variant.sku,
            label: variant.label ?? "Único",
            pricePyg: variant.pricePyg,
            compareAtPyg: variant.compareAtPyg ?? null,
            onHand: variant.onHand ?? 0,
            position: index,
            isActive: true,
          });
          const [created] = await db
            .select({ id: variants.id })
            .from(variants)
            .where(eq(variants.sku, variant.sku))
            .limit(1);
          if (created && (variant.onHand ?? 0) > 0)
            await db.insert(stockAdjustments).values({
              variantId: created.id,
              delta: variant.onHand!,
              previousOnHand: 0,
              newOnHand: variant.onHand!,
              reason: "Importación: stock inicial",
              actor,
              actorUserId,
            });
        } else {
          await db
            .update(variants)
            .set({
              ...variantDetails,
              label: variant.label,
              pricePyg: variant.pricePyg,
              compareAtPyg: variant.compareAtPyg,
              onHand: resetStock ? variant.onHand : undefined,
            })
            .where(eq(variants.id, existing.id));
          if (existing.pricePyg !== variant.pricePyg)
            await db.insert(priceAdjustments).values({
              variantId: existing.id,
              fromPyg: existing.pricePyg,
              toPyg: variant.pricePyg,
              reason: "Importación de catálogo",
              actor,
              actorUserId,
            });
          if (
            resetStock &&
            variant.onHand !== undefined &&
            variant.onHand !== existing.onHand
          )
            await db.insert(stockAdjustments).values({
              variantId: existing.id,
              delta: variant.onHand - existing.onHand,
              previousOnHand: existing.onHand,
              newOnHand: variant.onHand,
              reason: "Importación: reemplazo de stock",
              actor,
              actorUserId,
            });
        }
        variantCount += 1;
      }
      if (
        current?.isActive &&
        current.publishedAt &&
        (product.saleMode ?? current.saleMode) === "stock"
      ) {
        const active = await db
          .select({ price: variants.pricePyg })
          .from(variants)
          .where(
            and(
              eq(variants.productId, productRow.id),
              eq(variants.isActive, true)
            )
          )
          .for("update");
        if (active.some((v) => v.price <= 0))
          throw new Error(
            "Cada variante activa requiere precio positivo para compra con stock."
          );
      }
    }
  }

  return variantCount;
}

/**
 * Siembra el catálogo (categorías, zonas de envío, productos y variantes).
 *
 * Exportada aparte de `main()` para que `scripts/demo.ts` pueda encadenarla
 * con la creación de pedidos de ejemplo sin levantar un segundo proceso ni
 * una segunda conexión a la base.
 */
export async function seedCatalog(
  resetStock: boolean = RESET_STOCK
): Promise<void> {
  const db = getDb();

  // --- Categorías ---------------------------------------------------------
  for (const category of SEED_CATEGORIES) {
    await db
      .insert(categories)
      .values({
        slug: category.slug,
        name: category.name,
        position: category.position,
      })
      .onDuplicateKeyUpdate({
        set: {
          name: category.name,
          position: category.position,
          isActive: true,
        },
      });
  }
  const categoryRows = await db
    .select({ id: categories.id, slug: categories.slug })
    .from(categories);
  const categoryIdBySlug = new Map(
    categoryRows.map((row) => [row.slug, row.id])
  );
  console.log(`✓ ${SEED_CATEGORIES.length} categorías`);

  // --- Zonas de envío -----------------------------------------------------
  await upsertShippingZones(SEED_SHIPPING_ZONES);
  console.log(`✓ ${SEED_SHIPPING_ZONES.length} zonas de envío`);

  // --- Productos + variantes ---------------------------------------------
  const items: CatalogProductUpsert[] = SEED_PRODUCTS.map((product) => {
    const categoryId = categoryIdBySlug.get(product.categorySlug);
    if (!categoryId) {
      throw new Error(
        `Categoría inexistente: ${product.categorySlug} (producto ${product.slug})`
      );
    }
    return {
      slug: product.slug,
      name: product.name,
      description: product.description,
      categoryId,
      brand: product.brand,
      ivaRate: product.ivaRate,
      variants: product.variants.map((variant) => ({
        sku: variant.sku,
        label: variant.label,
        pricePyg: variant.pricePyg,
        compareAtPyg: variant.compareAtPyg ?? null,
        onHand: variant.onHand,
      })),
    };
  });

  const variantCount = await upsertCatalogProducts(items, {
    resetStock,
    // Fija, para que re-sembrar sea reproducible y no "recién publicado".
    publishedAt: new Date("2026-01-15T12:00:00Z"),
  });

  console.log(
    `✓ ${SEED_PRODUCTS.length} productos · ${variantCount} variantes`
  );
  console.log(
    resetStock
      ? "↺ stock reseteado a los valores del seed"
      : "· stock existente respetado (--reset-stock para pisarlo)"
  );
}

async function main(): Promise<void> {
  await seedCatalog();
  await closePool();
}

// `scripts/demo.ts` importa `seedCatalog` sin querer correr esto de nuevo —
// sólo se ejecuta cuando `seed.ts` es el script invocado directamente.
if (process.argv[1] && /seed\.ts$/.test(process.argv[1])) {
  main().catch(async (error) => {
    console.error(safeError(error).message);
    await closePool();
    process.exit(1);
  });
}
