import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { CATEGORY_PAGES } from "@/content/category-pages";
import { GUIDES } from "@/content/guides";
import { KEYWORD_COVERAGE_GROUPS, KEYWORD_COVERAGE_SOURCE, coverageSummary, filterCoverageGroups } from "@/content/keyword-coverage";

describe("source-grounded keyword coverage ledger", () => {
  it("preserves every source label and whole-group volume, without converting rows into demand", () => {
    const document = readFileSync(new URL("../../docs/SEO-CONTENT-IMPLEMENTATION.md", import.meta.url), "utf8");
    const rows = [...document.matchAll(/^\| ([^|]+) \| (\d+) \| ([^|]+) \|/gm)];
    expect(rows).toHaveLength(166);
    expect(KEYWORD_COVERAGE_GROUPS).toHaveLength(rows.length);
    for (const row of rows) {
      const group = KEYWORD_COVERAGE_GROUPS.find((item) => item.label === row[1]?.trim());
      expect(group?.monthlySearches).toBe(Number(row[2]));
      const disposition = row[3]?.trim() ?? "";
      expect(group?.status).toBe(disposition.startsWith("Excluded") ? "excluded" : disposition.startsWith("Hold") ? "held" : "content-mapped");
    }
    expect(new Set(KEYWORD_COVERAGE_GROUPS.map((group) => group.id)).size).toBe(166);
    expect(KEYWORD_COVERAGE_GROUPS.reduce((sum, group) => sum + group.monthlySearches, 0)).toBe(KEYWORD_COVERAGE_SOURCE.exportedMonthlySearches);
    expect(KEYWORD_COVERAGE_SOURCE.selectedKeywordRows).toBe(12261);
    expect(coverageSummary(KEYWORD_COVERAGE_GROUPS)).toEqual({ total: 166, mapped: 105, held: 6, excluded: 55 });
  });
  it("links mapped groups to implemented content and gives held/excluded groups no public target", () => {
    const routes = new Set(["/colecciones", ...GUIDES.map((guide) => `/guias/${guide.slug}`), ...Object.keys(CATEGORY_PAGES).map((slug) => `/categoria/${slug}`)]);
    for (const group of KEYWORD_COVERAGE_GROUPS) {
      if (group.status === "content-mapped") expect(routes.has(group.destination ?? "")).toBe(true);
      else expect(group.destination).toBeUndefined();
    }
    expect(KEYWORD_COVERAGE_GROUPS.find((group) => group.label === "anillos")?.destination).toBe("/colecciones");
    expect(KEYWORD_COVERAGE_GROUPS.filter((group) => /pandora|tiffany|cartier|swarovski|bulgari|versace|agatha|hurrem|el corte/i.test(group.label)).every((group) => group.status === "excluded")).toBe(true);
  });
  it("searches accent-insensitively and keeps exclusions visible when requested", () => {
    const ruby = filterCoverageGroups(KEYWORD_COVERAGE_GROUPS, { search: "RUBI", status: "content-mapped" });
    expect(ruby.map((group) => group.label)).toContain("anillo de oro con rubí");
    expect(filterCoverageGroups(KEYWORD_COVERAGE_GROUPS, { status: "held" })).toHaveLength(6);
    expect(filterCoverageGroups(KEYWORD_COVERAGE_GROUPS, { search: "pandora", status: "content-mapped" })).toHaveLength(0);
  });
});
