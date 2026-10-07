import { expect, it } from "vitest";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import {
  catalogueAttributePredicate,
  catalogueStockPredicate,
  parseCatalogueFilters,
} from "@/domain/catalogue-facets";
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
  expect(query.params).toContain("' OR 1=1 --");
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
