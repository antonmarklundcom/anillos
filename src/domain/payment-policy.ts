import { CHECKOUT_DEFAULTS } from "@/config/checkout";
import type { PaymentMethod } from "@/db/schema";

const METHODS: readonly PaymentMethod[] = [
  "transferencia",
  "contra_entrega",
  "tarjeta",
];

/** Explicit owner setting > optional deployment policy > store launch profile. */
export function permittedPaymentMethods(
  configured: readonly PaymentMethod[] | null,
  environment: string | undefined = process.env.STORE_PAYMENT_METHODS
): PaymentMethod[] {
  if (configured !== null) return [...new Set(configured)];
  if (environment !== undefined) {
    const values = environment
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    if (values.some((value) => !METHODS.includes(value as PaymentMethod)))
      return [];
    return [...new Set(values)] as PaymentMethod[];
  }
  return [...CHECKOUT_DEFAULTS.paymentMethods];
}
