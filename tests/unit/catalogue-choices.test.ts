import { describe, expect, it } from "vitest";
import { CATALOGUE_CHOICES } from "@/content/catalogue-choices";
import { COLLECTIONS } from "@/config/ring-store";
import { GUIDES } from "@/content/guides";
import { enquiryBriefText } from "@/store/enquiry-brief";

describe("catalogue decision guidance", () => {
  it("covers each existing collection with valid guide links and keeps private references out", () => {
    const routes = new Set(GUIDES.map((guide) => guide.slug));
    expect(Object.keys(CATALOGUE_CHOICES).sort()).toEqual(
      COLLECTIONS.map((collection) => collection.slug).sort()
    );
    for (const choices of Object.values(CATALOGUE_CHOICES)) {
      expect(choices).toHaveLength(2);
      expect(choices.every((choice) => routes.has(choice.guide))).toBe(true);
    }
    expect(JSON.stringify(CATALOGUE_CHOICES)).not.toMatch(
      /AJ-440|GA5025|CR279|joyeriagya|hubjoias|asuncionjoyas|entrega gratis|grabado incluido/
    );
  });
  it("asks for two independent measures without asserting a pair is for sale", () => {
    const text = enquiryBriefText({
      name: "Banda",
      categorySlug: "alianzas-plata",
      concept: false,
    });
    expect(text).toContain("Cantidad deseada (una pieza o dos)");
    expect(text).toContain("cada persona");
    expect(text).toContain("fotos reales");
    expect(text).toContain(
      "no confirma disponibilidad ni crea pedido, reserva o pago"
    );
    expect(text).not.toMatch(/par incluido|entrega garantizada|₲|925/);
  });
  it("distinguishes concepts and keeps individual enquiries simple", () => {
    const text = enquiryBriefText({
      name: "Idea de solitario",
      categorySlug: "solitarios",
      concept: true,
      url: "https://example.test/producto/concepto-solitario",
    });
    expect(text).toContain("diseño ilustrativo");
    expect(text).toContain("si existe una pieza real similar");
    expect(text).not.toContain("cada persona");
    expect(text).toContain("sin plazo confirmado");
    expect(text).toContain("https://example.test/producto/concepto-solitario");
  });
});
