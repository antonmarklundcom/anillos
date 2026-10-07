import { describe, expect, it } from "vitest";
import {
  ProductSpecificationsSchema,
  SupplierDetailsSchema,
  stampVerification,
} from "@/lib/product-attributes";
import { validationFailure } from "@/lib/admin-validation";

const actor = { userId: 7, label: "admin:fixture@example.test" };
const now = new Date("2026-10-07T12:00:00Z");
const old = { material: "Plata", verifiedAt: "2026-01-01T12:00:00.000Z" };

describe("authenticated fact verification", () => {
  it("ignores forged client dates and authors and server-stamps explicit confirmation", () => {
    expect(
      stampVerification(
        {
          material: "Plata",
          verified: true,
          verifiedAt: "2099-01-01T00:00:00Z",
          verifiedBy: { userId: 99, label: "forged" },
        },
        null,
        actor,
        now
      )
    ).toEqual({
      material: "Plata",
      verifiedAt: now.toISOString(),
      verifiedBy: actor,
    });
  });
  it("does not invent historic authors or refresh unchanged verification", () => {
    expect(
      stampVerification({ material: "Plata", verified: true }, old, actor, now)
    ).toEqual(old);
    expect(
      stampVerification(
        { verified: true, material: "Plata" },
        { ...old, verifiedBy: actor },
        actor,
        now
      )
    ).toEqual({ ...old, verifiedBy: actor });
  });
  it("clears verification when facts change without confirmation or when unchecked", () => {
    expect(
      stampVerification(
        { material: "Acero", verifiedAt: old.verifiedAt },
        old,
        actor,
        now
      )
    ).toEqual({ material: "Acero" });
    expect(
      stampVerification({ material: "Plata", verified: false }, old, actor, now)
    ).toEqual({ material: "Plata" });
  });
  it("preserves omitted/null semantics and strictly validates stored audit metadata", () => {
    expect(stampVerification(undefined, old, actor, now)).toBeUndefined();
    expect(stampVerification(null, old, actor, now)).toBeNull();
    expect(
      ProductSpecificationsSchema.safeParse({
        material: "Plata",
        verifiedAt: old.verifiedAt,
        verifiedBy: actor,
      }).success
    ).toBe(true);
    expect(
      ProductSpecificationsSchema.safeParse({
        material: "Plata",
        verifiedBy: { userId: -1, label: "invalid" },
      }).success
    ).toBe(false);
  });
});

describe("Spanish field validation", () => {
  it.each([
    "not-a-url",
    "supplier.example/item",
    "https://",
    "http://supplier.example/item",
  ])("returns validation failure without throwing for %s", (sourceUrl) => {
    const result = SupplierDetailsSchema.safeParse({ sourceUrl });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(validationFailure(result.error).fieldErrors.sourceUrl).toMatch(
        /^URL de la fuente:/
      );
  });
  it("replaces internal NaN diagnostics with a Spanish field message", () => {
    const result = ProductSpecificationsSchema.safeParse({
      widthMm: Number.NaN,
    });
    expect(result.success).toBe(false);
    if (!result.success)
      expect(validationFailure(result.error).fieldErrors.widthMm).toMatch(
        /^Ancho: Ingresá/
      );
  });
});
