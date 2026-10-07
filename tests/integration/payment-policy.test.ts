import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { bankDetails, storeSettings } from "@/db/schema";
import { readyPaymentMethods } from "@/domain/payment-readiness";
import { whatsappPublico, comercioWhatsApp } from "@/lib/comercio";
import { TIENDA } from "@/config/tienda";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";

describe.skipIf(!hasTestDb)("store launch payment policy", () => {
  beforeEach(async () => {
    await resetTables();
    vi.stubEnv("PAGOPAR_MODE", "mock");
    for (const name of [
      "BANCO_NOMBRE",
      "BANCO_TITULAR",
      "BANCO_RUC",
      "BANCO_CUENTA",
      "BANCO_TIPO_CUENTA",
      "WHATSAPP_NUMBER",
    ])
      vi.stubEnv(name, "");
    await getTestDb()
      .insert(storeSettings)
      .values({
        id: 1,
        data: { checkout: { metodosPago: ["transferencia"] } },
      });
  });
  afterEach(() => vi.unstubAllEnvs());
  afterAll(closeTestDb);
  it("does not offer card/COD and blocks transfer until actual bank fields are complete", async () => {
    expect(await readyPaymentMethods()).toEqual([]);
    await getTestDb()
      .insert(bankDetails)
      .values({
        id: 1,
        banco: "Disposable Bank",
        titular: "Test Store",
        ruc: "80000000-0",
        cuenta: "12345",
        tipoCuenta: "corriente",
      });
    expect(await readyPaymentMethods()).toEqual(["transferencia"]);
  });
  it("publishes the configured public contact without silently redirecting internal alerts", async () => {
    expect(await whatsappPublico()).toBe(TIENDA.whatsapp);
    expect(comercioWhatsApp()).toBeNull();
  });
});
