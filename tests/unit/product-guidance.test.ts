import { describe, expect, it } from "vitest";
import { GUIDES } from "@/content/guides";
import { productGuidance } from "@/store/product-guidance";

describe("product guidance from explicitly verified public attributes", () => {
  const specifications = { material: "Plata", purity: "925", stone: "Rubí de laboratorio", unit: "pair" as const, widthMm: 4.5 };
  it("never interpolates unverified or concept attributes", () => {
    for (const input of [{ factsVerified: false }, { factsVerified: true, concept: true }]) {
      const output = productGuidance({ categorySlug: "alianzas", specifications, ...input });
      expect(JSON.stringify(output.faq)).not.toContain("Rubí de laboratorio");
      expect(JSON.stringify(output.faq)).not.toContain("925");
      expect(output.faq.some((item) => item.question.includes("par"))).toBe(false);
    }
  });
  it("reports actual recorded facts without inferring natural origin or supplier services", () => {
    const output = productGuidance({ categorySlug: "alianzas", specifications, factsVerified: true });
    expect(JSON.stringify(output.faq)).toContain("Rubí de laboratorio");
    expect(JSON.stringify(output.faq)).toContain("4,5");
    expect(JSON.stringify(output.faq)).toContain("par de dos anillos");
    expect(JSON.stringify(output.faq)).not.toMatch(/grabado incluido|entrega gratis|rubí natural/);
    expect(output.related.some((link) => link.href === "/guias/piedras-de-color")).toBe(true);
    const routes = new Set(GUIDES.map((guide) => `/guias/${guide.slug}`));
    expect(output.related.every((link) => routes.has(link.href))).toBe(true);
  });
  it("does not guess a unit or stone identity from the category", () => {
    const output = productGuidance({ categorySlug: "alianzas-oro", specifications: { material: "Acero" }, factsVerified: true });
    expect(output.faq.some((item) => /piedra|\bpar\b/.test(item.question))).toBe(false);
    expect(JSON.stringify(output.faq)).toContain("Acero");
    expect(JSON.stringify(output.faq)).not.toContain("oro");
  });
});
