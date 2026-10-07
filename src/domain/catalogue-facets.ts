import { and, asc, count, eq, isNotNull, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products, variants, stockReservations } from "@/db/schema";
import type { Executor } from "@/domain/executor";
import { CONCEPT_PRODUCT_PREFIX } from "@/lib/concept-products";

export type CatalogueAttributeFilters = {
  material?: string;
  stone?: string;
  unit?: string;
  inStock?: boolean;
  invalid?: boolean;
};
export type CatalogueFacet = { value: string; total: number };
export type CatalogueFacets = {
  material: CatalogueFacet[];
  stone: CatalogueFacet[];
  unit: CatalogueFacet[];
  inStock: number;
};
export const EMPTY_CATALOGUE_FACETS: CatalogueFacets = {
  material: [],
  stone: [],
  unit: [],
  inStock: 0,
};

export function parseCatalogueFilters(
  query: Record<string, string | string[] | undefined>
): CatalogueAttributeFilters {
  const result: CatalogueAttributeFilters = {};
  for (const [param, field] of [
    ["material", "material"],
    ["piedra", "stone"],
    ["unidad", "unit"],
  ] as const) {
    const value = query[param];
    if (value === undefined || value === "") continue;
    if (
      typeof value !== "string" ||
      value.length > 160 ||
      value !== value.trim()
    )
      result.invalid = true;
    else result[field] = value;
  }
  if (query.stock !== undefined && query.stock !== "") {
    if (query.stock === "1") result.inStock = true;
    else result.invalid = true;
  }
  if (result.unit && !["individual", "pair"].includes(result.unit))
    result.invalid = true;
  return result;
}

function attribute(field: "material" | "stone" | "unit") {
  return sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${products.specifications}, ${`$.${field}`}))`;
}
const verified = () => {
  const stamp = sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${products.specifications}, ${"$.verifiedAt"}))`;
  // Writes normalize to UTC ISO. CASE guards parsing so malformed persisted data
  // cannot fail a catalogue read; LAST_DAY also rejects impossible calendar days.
  const timestamp = sql`CASE WHEN ${stamp} REGEXP ${"^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]([.][0-9]{1,3})?Z$"}
    THEN CASE WHEN CAST(SUBSTRING(${stamp}, 9, 2) AS UNSIGNED) <= DAY(LAST_DAY(CONCAT(SUBSTRING(${stamp}, 1, 7), '-01')))
    THEN CASE WHEN LOCATE('.', ${stamp}) > 0
      THEN STR_TO_DATE(SUBSTRING(${stamp}, 1, CHAR_LENGTH(${stamp}) - 1), '%Y-%m-%dT%H:%i:%s.%f')
      ELSE STR_TO_DATE(SUBSTRING(${stamp}, 1, 19), '%Y-%m-%dT%H:%i:%s') END
    ELSE NULL END ELSE NULL END`;
  return and(
    sql`LOWER(${products.slug}) NOT LIKE ${`${CONCEPT_PRODUCT_PREFIX}%`}`,
    sql`JSON_TYPE(JSON_EXTRACT(${products.specifications}, ${"$.verifiedAt"})) = 'STRING'`,
    sql`${timestamp} <= UTC_TIMESTAMP(3)`
  );
};

/** Same live hold predicate as stock domain; signed casts protect MySQL UNSIGNED subtraction. */
export function catalogueStockPredicate(): SQL {
  return sql`LOWER(${products.slug}) NOT LIKE ${`${CONCEPT_PRODUCT_PREFIX}%`} AND ${products.saleMode} = 'stock' AND ${products.showPrice} = TRUE AND EXISTS (
    SELECT 1 FROM ${variants} WHERE ${variants.productId} = ${products.id} AND ${variants.isActive} = TRUE
    AND CAST(${variants.onHand} AS SIGNED) - CAST(COALESCE((SELECT SUM(${stockReservations.qty}) FROM ${stockReservations}
      WHERE ${stockReservations.variantId} = ${variants.id} AND ${stockReservations.state} = 'held' AND ${stockReservations.expiresAt} > NOW()), 0) AS SIGNED) > 0
  )`;
}
export function catalogueAttributePredicate(
  filters: CatalogueAttributeFilters
): SQL | undefined {
  if (filters.invalid) return sql`FALSE`;
  const parts: (SQL | undefined)[] = [];
  for (const field of ["material", "stone", "unit"] as const) {
    if (filters[field] !== undefined)
      parts.push(and(verified(), eq(attribute(field), filters[field]!)));
  }
  if (filters.inStock) parts.push(catalogueStockPredicate());
  return parts.length ? and(...parts) : undefined;
}

/** Independent category counts, bounded at 100 distinct values; no full catalogue hydration. */
export async function getCatalogueFacets(
  categorySlug: string,
  executor?: Executor
): Promise<CatalogueFacets> {
  const tx = executor ?? getDb();
  const base = and(
    eq(categories.slug, categorySlug),
    eq(categories.isActive, true),
    eq(products.isActive, true),
    isNotNull(products.publishedAt),
    sql`EXISTS (SELECT 1 FROM ${variants} WHERE ${variants.productId} = ${products.id} AND ${variants.isActive} = TRUE)`
  );
  async function facet(
    field: "material" | "stone" | "unit"
  ): Promise<CatalogueFacet[]> {
    const value = attribute(field);
    const rows = await tx
      .select({ value, total: count(products.id) })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          base,
          verified(),
          sql`JSON_TYPE(JSON_EXTRACT(${products.specifications}, ${`$.${field}`})) = 'STRING'`,
          sql`${value} <> ''`,
          field === "unit" ? sql`${value} IN ('individual', 'pair')` : undefined
        )
      )
      .groupBy(value)
      .orderBy(asc(value))
      .limit(100);
    return rows.map((row) => ({ value: row.value, total: Number(row.total) }));
  }
  const [material, stone, unit, stock] = await Promise.all([
    facet("material"),
    facet("stone"),
    facet("unit"),
    tx
      .select({ total: count(products.id) })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(and(base, catalogueStockPredicate())),
  ]);
  return { material, stone, unit, inStock: Number(stock[0]?.total ?? 0) };
}
