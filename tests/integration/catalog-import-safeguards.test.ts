import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import {
  products,
  variants,
  stockAdjustments,
  priceAdjustments,
  categories,
  stockAlerts,
} from "@/db/schema";
import { upsertCatalogProducts } from "../../scripts/seed";
import {
  buildCatalogImportPlan,
  applyCatalogImportPlan,
} from "@/domain/catalog-import-plan";
import { claimProductSlug } from "@/domain/product-slugs";
import { priceCart } from "@/domain/cart";
import { saveVariant } from "@/domain/admin-products";
import { notifyBackInStock } from "@/domain/stock-alerts";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";
import {
  createCategory,
  createVariant,
  createProduct,
} from "../helpers/factories";
const csv = (sku: string, slug: string, extra = "") =>
  "SKU;Producto;Categoría;Precio;Slug" +
  extra +
  "\n" +
  sku +
  ";Nombre;Nueva;100;" +
  slug;
describe.skipIf(!hasTestDb)("import transactional safeguards", () => {
  beforeEach(resetTables);
  afterAll(closeTestDb);
  it("stages new products; reimport preserves absent facts, inactive state and audits price/stock", async () => {
    const plan = await buildCatalogImportPlan(csv("SAFE-1", "real-slug"));
    await applyCatalogImportPlan(plan);
    const db = getTestDb();
    const [p] = await db.select().from(products);
    const [v] = await db.select().from(variants);
    expect(p!.publishedAt).toBeNull();
    await db
      .update(products)
      .set({ description: "Keep", brand: "Marca", ivaRate: 5, isActive: false })
      .where(eq(products.id, p!.id));
    await db
      .update(variants)
      .set({ compareAtPyg: 200, label: "Talle 18", isActive: false, onHand: 7 })
      .where(eq(variants.id, v!.id));
    const retry = await buildCatalogImportPlan(
      csv("SAFE-1", "real-slug").replace(";100;", ";120;")
    );
    await applyCatalogImportPlan(retry, { resetStock: true });
    const [after] = await db.select().from(products);
    const [va] = await db.select().from(variants);
    expect(after).toMatchObject({
      description: "Keep",
      brand: "Marca",
      ivaRate: 5,
      isActive: false,
      publishedAt: null,
    });
    expect(va).toMatchObject({
      compareAtPyg: 200,
      label: "Talle 18",
      isActive: false,
      onHand: 7,
    });
    expect(await db.select().from(priceAdjustments)).toHaveLength(1);
    expect(await db.select().from(stockAdjustments)).toHaveLength(0);
  });
  it("database collation rejects an alien SKU and rolls back earlier products", async () => {
    const categoryId = await createCategory();
    const owner = await createProduct(categoryId);
    const id = await createVariant({ productId: owner, onHand: 4 });
    const db = getTestDb();
    const [v] = await db.select().from(variants).where(eq(variants.id, id));
    await expect(
      upsertCatalogProducts([
        {
          slug: "first-import",
          name: "First",
          categoryId,
          variants: [{ sku: "NEW-SAFE", label: "U", pricePyg: 100, onHand: 2 }],
        },
        {
          slug: "second-import",
          name: "Second",
          categoryId,
          variants: [{ sku: v!.sku.toLowerCase(), label: "U", pricePyg: 100 }],
        },
      ])
    ).rejects.toThrow(/otro producto/);
    expect(
      await db.select().from(products).where(eq(products.slug, "first-import"))
    ).toHaveLength(0);
    expect(
      await db.select().from(variants).where(eq(variants.id, id))
    ).toMatchObject([{ productId: owner }]);
    expect(await db.select().from(stockAdjustments)).toHaveLength(0);
  });
  it("rolls back categories on an alias conflict and rejects concepts before writing", async () => {
    const owner = await createProduct();
    await claimProductSlug(getTestDb(), "reserved-old", owner);
    const collision = await buildCatalogImportPlan(
      "SKU;Producto;Categoría;Precio;Slug\nONE;Uno;Nueva;100;first-valid\nTWO;Dos;Nueva;100;reserved-old"
    );
    await expect(applyCatalogImportPlan(collision)).rejects.toThrow();
    expect(
      await getTestDb()
        .select()
        .from(categories)
        .where(eq(categories.slug, "nueva"))
    ).toHaveLength(0);
    expect(
      await getTestDb()
        .select()
        .from(products)
        .where(eq(products.slug, "first-valid"))
    ).toHaveLength(0);
    const plan = await buildCatalogImportPlan(csv("C", "concepto-uno"));
    expect(plan.errores.length).toBeGreaterThan(0);
    expect(
      await getTestDb()
        .select()
        .from(categories)
        .where(eq(categories.slug, "nueva"))
    ).toHaveLength(0);
  });
  it("blocks legacy zero-price cart rows and published stock writes while allowing draft zero prices", async () => {
    const id = await createVariant({ onHand: 2, pricePyg: 0 });
    const db = getTestDb();
    const [v] = await db.select().from(variants).where(eq(variants.id, id));
    const cart = await priceCart([{ variantId: id, qty: 1 }], { executor: db });
    expect(cart.lines).toHaveLength(0);
    expect(cart.issues[0]?.type).toBe("no_disponible");
    await expect(
      saveVariant(
        v!.productId,
        {
          id,
          sku: v!.sku,
          label: "U",
          pricePyg: 0,
          compareAtPyg: null,
          isActive: true,
        },
        db
      )
    ).rejects.toMatchObject({
      fieldErrors: { pricePyg: expect.stringMatching(/positivo/) },
    });
    await db
      .update(products)
      .set({ publishedAt: null })
      .where(eq(products.id, v!.productId));
    await saveVariant(
      v!.productId,
      {
        id,
        sku: v!.sku,
        label: "U",
        pricePyg: 0,
        compareAtPyg: null,
        isActive: true,
      },
      db
    );
  });
  it("does not notify subscriptions for enquiry products or draft products", async () => {
    const id = await createVariant({ onHand: 2 });
    const db = getTestDb();
    const [v] = await db.select().from(variants).where(eq(variants.id, id));
    await db
      .insert(stockAlerts)
      .values({ variantId: id, phone: "+595981123456" });
    const send = vi.fn();
    await db
      .update(products)
      .set({ saleMode: "enquiry" })
      .where(eq(products.id, v!.productId));
    expect(
      await notifyBackInStock(id, {
        executor: db,
        notifier: { sender: { channel: "consola", label: "test", send } },
      })
    ).toEqual({ marcadas: 0, enviadas: 0 });
    expect(send).not.toHaveBeenCalled();
  });
});
