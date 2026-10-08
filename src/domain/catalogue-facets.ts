import { and, asc, count, eq, isNotNull, sql, type SQL } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products, variants, stockReservations } from "@/db/schema";
import type { Executor } from "@/domain/executor";
import { CONCEPT_PRODUCT_PREFIX } from "@/lib/concept-products";

export type CatalogueAttributeFilters = {
  material?: string;
  stone?: string;
  stoneShape?: string;
  widthMm?: string;
  unit?: string;
  inStock?: boolean;
  invalid?: boolean;
};
export type CatalogueFacet = { value: string; total: number };
export type CatalogueFacets = {
  hasPrices?: boolean;
  material: CatalogueFacet[];
  stone: CatalogueFacet[];
  stoneShape?: CatalogueFacet[];
  widthMm?: CatalogueFacet[];
  unit: CatalogueFacet[];
  inStock: number;
};
export const EMPTY_CATALOGUE_FACETS: CatalogueFacets = {
  hasPrices: false,
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
    ["forma", "stoneShape"],
    ["ancho", "widthMm"],
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
  if (
    result.widthMm &&
    (!/^\d+(?:\.\d+)?$/.test(result.widthMm) ||
      Number(result.widthMm) <= 0 ||
      Number(result.widthMm) > 1000)
  )
    result.invalid = true;
  return result;
}

function attribute(
  field: "material" | "stone" | "stoneShape" | "widthMm" | "unit"
) {
  return sql<string>`JSON_UNQUOTE(JSON_EXTRACT(${products.specifications}, ${`$.${field}`}))`;
}
/** Equivalent spelling only: no inferred alloy, gemstone or purity mapping. */
export function normalizeFacetLabel(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLocaleLowerCase("es-PY");
}
function normalizedAttribute(
  field: "material" | "stone" | "stoneShape" | "widthMm" | "unit"
) {
  return sql<string>`LOWER(REGEXP_REPLACE(TRIM(${attribute(field)}), '[[:space:]]+', ' '))`;
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
    SELECT 1 FROM ${variants} WHERE ${variants.productId} = ${products.id} AND ${variants.isActive} = TRUE AND ${variants.pricePyg} > 0
    AND CAST(${variants.onHand} AS SIGNED) - CAST(COALESCE((SELECT SUM(${stockReservations.qty}) FROM ${stockReservations}
      WHERE ${stockReservations.variantId} = ${variants.id} AND ${stockReservations.state} = 'held' AND ${stockReservations.expiresAt} > NOW()), 0) AS SIGNED) > 0
  )`;
}

/** Price controls apply to the whole category, including out-of-stock prices. */
export function cataloguePricePredicate(): SQL {
  return sql`${products.showPrice} = TRUE AND LOWER(${products.slug}) NOT LIKE ${`${CONCEPT_PRODUCT_PREFIX}%`} AND EXISTS (
    SELECT 1 FROM ${variants} WHERE ${variants.productId} = ${products.id} AND ${variants.isActive} = TRUE AND ${variants.pricePyg} > 0
  )`;
}
export function catalogueAttributePredicate(
  filters: CatalogueAttributeFilters
): SQL | undefined {
  if (filters.invalid) return sql`FALSE`;
  const parts: (SQL | undefined)[] = [];
  for (const field of [
    "material",
    "stone",
    "stoneShape",
    "widthMm",
    "unit",
  ] as const) {
    if (filters[field] !== undefined)
      parts.push(
        and(
          verified(),
          field === "widthMm"
            ? sql`JSON_TYPE(JSON_EXTRACT(${products.specifications}, ${"$.widthMm"})) IN ('INTEGER', 'DOUBLE') AND CAST(${attribute(field)} AS DECIMAL(20,10)) = ${Number(filters[field])}`
            : and(
                sql`JSON_TYPE(JSON_EXTRACT(${products.specifications}, ${`$.${field}`})) = 'STRING'`,
                eq(
                  normalizedAttribute(field),
                  normalizeFacetLabel(filters[field]!)
                )
              )
        )
      );
  }
  if (filters.inStock) parts.push(catalogueStockPredicate());
  return parts.length ? and(...parts) : undefined;
}

/** Independent category counts, bounded at 100 distinct values; no full catalogue hydration. */
export async function getCatalogueFacets(
  categorySlug: string,
  executor?: Executor,
  filters: CatalogueAttributeFilters = {}
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
    field: "material" | "stone" | "stoneShape" | "widthMm" | "unit"
  ): Promise<CatalogueFacet[]> {
    const value = sql<string>`MIN(REGEXP_REPLACE(TRIM(${attribute(field)}), '[[:space:]]+', ' '))`;
    const rows = await tx
      .select({ value, total: count(products.id) })
      .from(products)
      .innerJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          base,
          verified(),
          catalogueAttributePredicate({ ...filters, [field]: undefined }),
          field === "widthMm"
            ? sql`JSON_TYPE(JSON_EXTRACT(${products.specifications}, ${"$.widthMm"})) IN ('INTEGER', 'DOUBLE') AND CAST(${attribute(field)} AS DECIMAL(20,10)) > 0 AND CAST(${attribute(field)} AS DECIMAL(20,10)) <= 1000`
            : sql`JSON_TYPE(JSON_EXTRACT(${products.specifications}, ${`$.${field}`})) = 'STRING'`,
          sql`${attribute(field)} <> ''`,
          field === "unit"
            ? sql`${attribute(field)} IN ('individual', 'pair')`
            : undefined
        )
      )
      .groupBy(normalizedAttribute(field))
      .orderBy(asc(value))
      .limit(100);
    return rows.map((row) => ({ value: row.value, total: Number(row.total) }));
  }
  const [material, stone, stoneShape, widthMm, unit, stock] = await Promise.all(
    [
      facet("material"),
      facet("stone"),
      facet("stoneShape"),
      facet("widthMm"),
      facet("unit"),
      tx
        .select({
          total: sql<number>`COALESCE(SUM(CASE WHEN ${catalogueStockPredicate()} AND ${catalogueAttributePredicate({ ...filters, inStock: undefined }) ?? sql`TRUE`} THEN 1 ELSE 0 END), 0)`,
          hasPrices: sql<number>`COALESCE(MAX(CASE WHEN ${cataloguePricePredicate()} THEN 1 ELSE 0 END), 0)`,
        })
        .from(products)
        .innerJoin(categories, eq(products.categoryId, categories.id))
        .where(base),
    ]
  );
  return {
    material,
    stone,
    stoneShape,
    widthMm,
    unit,
    inStock: Number(stock[0]?.total ?? 0),
    hasPrices: Number(stock[0]?.hasPrices ?? 0) > 0,
  };
}
