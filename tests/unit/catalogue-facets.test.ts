import { expect, it, vi } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import {
  catalogueAttributePredicate,
  catalogueStockPredicate,
  parseCatalogueFilters,
  normalizeFacetLabel,
  cataloguePricePredicate,
  getCatalogueFacets,
} from "@/domain/catalogue-facets";
import type { Executor } from "@/domain/executor";

it("counts positive visible category prices independently of stock and pagination using the existing aggregate", async () => {
  const query = new MySqlDialect().sqlToQuery(cataloguePricePredicate());
  expect(query.sql).toContain("price_pyg` > 0");
  expect(query.sql).toContain("show_price` = TRUE");
  expect(query.sql).toContain("is_active` = TRUE");
  expect(query.sql).not.toContain("on_hand");
  expect(query.params).toContain("concepto-%");
  const select = vi.fn(() => {
    const chain: Record<string, unknown> = {
      from: () => chain,
      innerJoin: () => chain,
      where: () => chain,
      groupBy: () => chain,
      orderBy: () => chain,
      limit: async () => [],
      then: (
        resolve: (rows: { total: number; hasPrices: number }[]) => unknown
      ) => resolve([{ total: 0, hasPrices: 1 }]),
    };
    return chain;
  });
  const facets = await getCatalogueFacets("plata-925", {
    select,
  } as unknown as Executor);
  // Five verified attribute facets plus the shared stock/price aggregate.
  expect(select).toHaveBeenCalledTimes(6);
  expect(facets).toMatchObject({ inStock: 0, hasPrices: true });
});
it("groups equivalent case and spacing without inventing material synonyms", () => {
  expect(normalizeFacetLabel(" plata   925 ")).toBe(
    normalizeFacetLabel("Plata 925")
  );
  expect(normalizeFacetLabel("Oro bañado")).not.toBe(
    normalizeFacetLabel("Oro 18k")
  );
});
it("rejects malformed attribute values instead of broadening a filtered result", () => {
  expect(
    parseCatalogueFilters({
      material: "Plata 925",
      piedra: "Circonia",
      unidad: "pair",
      stock: "1",
    })
  ).toEqual({
    material: "Plata 925",
    stone: "Circonia",
    unit: "pair",
    inStock: true,
  });
  expect(parseCatalogueFilters({ unidad: "unknown" }).invalid).toBe(true);
  expect(parseCatalogueFilters({ stock: "yes" }).invalid).toBe(true);
  expect(parseCatalogueFilters({ material: ["Plata", "Oro"] }).invalid).toBe(
    true
  );
});
it("binds untrusted values and gates every attribute on explicit verification and nonconcept slugs", () => {
  const query = new MySqlDialect().sqlToQuery(
    catalogueAttributePredicate({ material: "' OR 1=1 --" })!
  );
  expect(query.sql).not.toContain("' OR 1=1 --");
  expect(query.params).toContain("' or 1=1 --");
  expect(query.params).toContain("$.verifiedAt");
  expect(query.params).toContain("concepto-%");
  expect(query.sql).toContain("UTC_TIMESTAMP(3)");
  expect(query.sql).toContain("STR_TO_DATE");
  expect(query.sql).toContain("LAST_DAY");
  expect(query.sql).toContain("LOWER(");
});
it("uses live unexpired holds with signed casts in SQL stock filtering", () => {
  const query = new MySqlDialect().sqlToQuery(catalogueStockPredicate());
  expect(query.sql).toContain("AS SIGNED");
  expect(query.sql).toContain("expires_at");
  expect(query.sql).toContain("> NOW()");
  expect(query.sql).toContain("'held'");
});
