import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { products } from "@/db/schema";
import {
  getCategoryProducts,
  getProductBySlug,
  getProductsBySlugs,
} from "@/db/queries";
import { reserveStock } from "@/domain/stock";
import {
  createCategory,
  createProduct,
  createVariant,
  createOrder,
} from "../helpers/factories";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";

describe.skipIf(!hasTestDb)("catalogue displayed price policy", () => {
  beforeEach(resetTables);
  afterAll(closeTestDb);

  it("sorts and filters by available prices instead of an unavailable cheaper variant", async () => {
    const categoryId = await createCategory("price-policy");
    const a = await createProduct(categoryId),
      b = await createProduct(categoryId);
    await createVariant({ productId: a, onHand: 0, pricePyg: 80000 });
    await createVariant({ productId: a, onHand: 1, pricePyg: 500000 });
    await createVariant({ productId: b, onHand: 1, pricePyg: 120000 });
    expect(
      (
        await getCategoryProducts({
          categorySlug: "price-policy",
          sort: "precio-asc",
        })
      ).products.map((p) => p.id)
    ).toEqual([b, a]);
    expect(
      (
        await getCategoryProducts({
          categorySlug: "price-policy",
          maxPricePyg: 100000,
        })
      ).products
    ).toEqual([]);
  });

  it("discounts live holds, and uses all positive prices when no variant is available", async () => {
    const categoryId = await createCategory("held-price-policy");
    const productId = await createProduct(categoryId);
    const cheap = await createVariant({
      productId,
      onHand: 1,
      pricePyg: 80000,
    });
    const expensive = await createVariant({
      productId,
      onHand: 1,
      pricePyg: 500000,
    });
    const orderId = await createOrder();
    await reserveStock(orderId, [{ variantId: cheap, qty: 1 }], {
      expiresAt: new Date(Date.now() + 3600000),
    });
    expect(
      (
        await getCategoryProducts({
          categorySlug: "held-price-policy",
          maxPricePyg: 100000,
        })
      ).products
    ).toEqual([]);
    await reserveStock(orderId, [{ variantId: expensive, qty: 1 }], {
      expiresAt: new Date(Date.now() + 3600000),
    });
    expect(
      (
        await getCategoryProducts({
          categorySlug: "held-price-policy",
          maxPricePyg: 100000,
        })
      ).products.map((p) => p.id)
    ).toEqual([productId]);
  });

  it("uses the enquiry price policy and deduplicates requested slugs", async () => {
    const categoryId = await createCategory("enquiry-price-policy");
    const productId = await createProduct(categoryId);
    await getTestDb()
      .update(products)
      .set({ saleMode: "enquiry" })
      .where(eq(products.id, productId));
    await createVariant({ productId, onHand: 0, pricePyg: 80000 });
    await createVariant({ productId, onHand: 1, pricePyg: 500000 });
    const [row] = await getTestDb()
      .select({ slug: products.slug })
      .from(products)
      .where(eq(products.id, productId));
    expect(
      (
        await getCategoryProducts({
          categorySlug: "enquiry-price-policy",
          maxPricePyg: 100000,
        })
      ).products.map((p) => p.id)
    ).toEqual([productId]);
    expect(
      (await getProductsBySlugs([row!.slug, row!.slug])).map((p) => p.id)
    ).toEqual([productId]);
    expect(
      (await getProductBySlug(row!.slug))?.variants.every(
        (v) => v.available === 0
      )
    ).toBe(true);
  });
});
