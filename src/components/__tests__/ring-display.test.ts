import { expect, it } from "vitest";
import { displayProductName } from "@/config/ring-display";
import { CONCEPTS, CONCEPT_NOTICE } from "@/config/ring-store";

it("removes only the concept suffix from reserved products, preserving material wording", () => {
  expect(
    displayProductName("Onda de plata · concepto", "concepto-onda-plata")
  ).toBe("Onda de plata");
  expect(displayProductName("Concepto de oro · detalle", "concepto-test")).toBe(
    "Concepto de oro · detalle"
  );
  expect(displayProductName("Onda de plata · concepto", "onda-plata")).toBe(
    "Onda de plata · concepto"
  );
});

it("keeps concept identities and restrictions while simplifying visible names", () => {
  expect(
    CONCEPTS.every((product) => product.slug.startsWith("concepto-"))
  ).toBe(true);
  expect(
    CONCEPTS.every((product) => !product.name.includes("· concepto"))
  ).toBe(true);
  expect(CONCEPT_NOTICE).toContain("Imagen ilustrativa");
  expect(CONCEPT_NOTICE).toContain("sin compra ni reserva");
});
