import type { PaymentMethod } from "@/db/schema";
import { getDatosBancarios } from "@/lib/comercio";
import { isPagoparConfigured } from "./pagopar/config";
import type { Executor } from "./executor";
import { readStoreSettings } from "./store-settings";
import { permittedPaymentMethods } from "./payment-policy";

export async function readyPaymentMethods(
  executor?: Executor
): Promise<PaymentMethod[]> {
  const { settings } = await readStoreSettings(executor);
  const allowed = permittedPaymentMethods(settings.checkout.metodosPago);
  const methods: PaymentMethod[] = [];
  if (allowed.includes("transferencia") && (await getDatosBancarios(executor)))
    methods.push("transferencia");
  if (allowed.includes("contra_entrega")) methods.push("contra_entrega");
  if (allowed.includes("tarjeta") && isPagoparConfigured())
    methods.push("tarjeta");
  return methods;
}
