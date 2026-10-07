import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { eq } from "drizzle-orm";
import { getCategoryProducts } from "@/db/queries";
import {
  getCatalogueFacets,
  parseCatalogueFilters,
} from "@/domain/catalogue-facets";
import { categories, products, stockReservations } from "@/db/schema";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";
import {
  createCategory,
  createOrder,
  createProduct,
  createVariant,
} from "../helpers/factories";

describe.skipIf(!hasTestDb)("verified catalogue facets", () => {
  let categorySlug: string;
  let verifiedId: number;
  let expiredHoldId: number;
  beforeAll(async () => {
    await resetTables();
    const db = getTestDb();
    const categoryId = await createCategory();
    categorySlug = (
      await db.select().from(categories).where(eq(categories.id, categoryId))
    )[0]!.slug;
    const timestamp = "2026-10-06T12:00:00.000Z";
    async function fixture(
      specifications: {
        material?: string;
        stone?: string;
        unit?: "individual" | "pair";
        verifiedAt?: string;
      },
      concept = false,
      saleMode: "stock" | "enquiry" = "stock"
    ) {
      const id = await createProduct(categoryId);
      await db
        .update(products)
        .set({
          specifications,
          saleMode,
          ...(concept ? { slug: `CONCEPTO-facet-${id}` } : {}),
        })
        .where(eq(products.id, id));
      const variantId = await createVariant({ productId: id, onHand: 2 });
      return { id, variantId };
    }
    const verified = await fixture({
      material: "Plata 925",
      stone: "Circonia",
      unit: "pair",
      verifiedAt: timestamp,
    });
    verifiedId = verified.id;
    await fixture({ material: "Plata 925", stone: "Circonia", unit: "pair" });
    await fixture(
      {
        material: "Plata 925",
        stone: "Circonia",
        unit: "pair",
        verifiedAt: timestamp,
      },
      true
    );
    await fixture(
      { material: "Oro", unit: "individual", verifiedAt: timestamp },
      false,
      "enquiry"
    );
    const expired = await fixture({
      material: "Acero",
      unit: "individual",
      verifiedAt: timestamp,
    });
    expiredHoldId = expired.id;
    await fixture(
      {
        material: "Futuro",
        stone: "Futuro",
        unit: "pair",
        verifiedAt: "2099-10-06T12:00:00.000Z",
      },
      false,
      "enquiry"
    );
    await fixture(
      {
        material: "Inválido",
        stone: "Inválido",
        unit: "pair",
        verifiedAt: "garbage",
      },
      false,
      "enquiry"
    );
    await fixture(
      {
        material: "Fecha imposible",
        stone: "Fecha imposible",
        unit: "pair",
        verifiedAt: "2026-02-30T12:00:00.000Z",
      },
      false,
      "enquiry"
    );
    const orderId = await createOrder();
    await db.insert(stockReservations).values([
      {
        variantId: verified.variantId,
        orderId,
        qty: 3,
        state: "held",
        expiresAt: new Date(Date.now() + 3600000),
      },
      {
        variantId: expired.variantId,
        orderId,
        qty: 3,
        state: "held",
        expiresAt: new Date(Date.now() - 3600000),
      },
    ]);
  });
  afterAll(closeTestDb);
  it("counts only verified facts and excludes concepts without inferring names or categories", async () => {
    const facets = await getCatalogueFacets(categorySlug);
    expect(facets.material).toEqual([
      { value: "Acero", total: 1 },
      { value: "Oro", total: 1 },
      { value: "Plata 925", total: 1 },
    ]);
    expect(facets.stone).toEqual([{ value: "Circonia", total: 1 }]);
    expect(facets.unit).toEqual([
      { value: "individual", total: 2 },
      { value: "pair", total: 1 },
    ]);
  });
  it("combines verified filters, keeps counts/pagination consistent, and safely returns no unknown values", async () => {
    const result = await getCategoryProducts({
      categorySlug,
      material: "Plata 925",
      stone: "Circonia",
      unit: "pair",
      perPage: 1,
    });
    expect(result.total).toBe(1);
    expect(result.products.map((product) => product.id)).toEqual([verifiedId]);
    expect(
      (await getCategoryProducts({ categorySlug, material: "' OR 1=1 --" }))
        .total
    ).toBe(0);
    for (const material of ["Futuro", "Inválido", "Fecha imposible"]) {
      expect(
        (await getCategoryProducts({ categorySlug, material })).total
      ).toBe(0);
    }
    expect(
      (
        await getCategoryProducts({
          categorySlug,
          ...parseCatalogueFilters({ unidad: "unknown" }),
        })
      ).total
    ).toBe(0);
  });
  it("subtracts live holds with signed arithmetic, ignores expired holds and excludes enquiry/concepts", async () => {
    const result = await getCategoryProducts({ categorySlug, inStock: true });
    // Unverified ordinary stock is eligible for stock filtering, but never material facets.
    expect(result.total).toBe(2);
    expect(result.products.map((product) => product.id)).toContain(
      expiredHoldId
    );
    expect(result.products.map((product) => product.id)).not.toContain(
      verifiedId
    );
    expect(
      result.products.every((product) =>
        product.variants.some((variant) => variant.available > 0)
      )
    ).toBe(true);
    expect((await getCatalogueFacets(categorySlug)).inStock).toBe(2);
  });
});
