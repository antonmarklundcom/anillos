import { afterEach, describe, expect, it, vi } from "vitest";
import { permittedPaymentMethods } from "@/domain/payment-policy";
import { SECTION_INPUT } from "@/domain/store-settings-schema";

afterEach(() => vi.unstubAllEnvs());
describe("store payment policy", () => {
  it("starts transfer-only independently of installed card credentials", () => {
    vi.stubEnv("STORE_PAYMENT_METHODS", undefined);
    expect(permittedPaymentMethods(null)).toEqual(["transferencia"]);
  });
  it("explicit owner choices, including pause, win over deployment policy", () => {
    expect(permittedPaymentMethods([], "tarjeta")).toEqual([]);
    expect(permittedPaymentMethods(["transferencia"], "tarjeta")).toEqual([
      "transferencia",
    ]);
  });
  it("invalid deployment methods fail closed and duplicates collapse", () => {
    expect(permittedPaymentMethods(null, "transferencia,crypto")).toEqual([]);
    expect(
      permittedPaymentMethods(null, "transferencia,transferencia")
    ).toEqual(["transferencia"]);
  });
  it("rejects unknown owner methods before saving", () => {
    expect(
      SECTION_INPUT.checkout.safeParse({ metodosPago: ["crypto"] }).success
    ).toBe(false);
  });
});
