import type { PaymentMethod } from "@/db/schema";
import { getDatosBancarios } from "@/lib/comercio";
import { isPagoparConfigured } from "./pagopar/config";
import type { Executor } from "./executor";
import { readStoreSettings } from "./store-settings";
import { permittedPaymentMethods } from "./payment-policy";
import type { PreflightCheck } from "./preflight";

export function paymentReadinessCheck(configured: readonly PaymentMethod[] | null, ready: readonly PaymentMethod[], environment = process.env.STORE_PAYMENT_METHODS): PreflightCheck {
  const allowed = permittedPaymentMethods(configured, environment);
  const invalid = environment !== undefined && environment.split(",").some((token) => token.trim() &&
    !["transferencia", "contra_entrega", "tarjeta"].includes(token.trim()));
  const missing = allowed.filter((method) => !ready.includes(method));
  return {
    id: "pagos_listos", title: "Medios de pago efectivos",
    severity: ready.length === 0 || missing.length || (invalid && configured === null) ? "bloquea" : "ok",
    detail: invalid && configured === null ? "STORE_PAYMENT_METHODS contiene un medio desconocido; corregí la lista."
      : allowed.length === 0 ? "La compra está pausada: no hay medios habilitados."
      : missing.length ? `No están listos: ${missing.join(", ")}. Transferencia requiere los cinco datos completos de Banco; tarjeta requiere Pagopar.`
      : "Los medios habilitados tienen sus requisitos efectivos configurados; todavía hay que verificar un pago real antes del lanzamiento.",
  };
}

export async function checkEffectivePayments(): Promise<PreflightCheck> {
  const { settings } = await readStoreSettings();
  return paymentReadinessCheck(settings.checkout.metodosPago, await readyPaymentMethods());
}

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
