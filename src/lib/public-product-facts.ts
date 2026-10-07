import {
  ProductSpecificationsSchema,
  VariantAttributesSchema,
  VerifiedIdentifiersSchema,
} from "@/lib/product-attributes";
import { isConceptProduct } from "@/lib/concept-products";

function decoded(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

/** Staff audit identity belongs to the admin record, never public DTOs or schema. */
function withoutVerifier<T extends { verifiedBy?: unknown }>(
  value: T
): Omit<T, "verifiedBy"> {
  const publicValue = { ...value };
  delete publicValue.verifiedBy;
  return publicValue;
}

/** Supplier sourcing records are deliberately never part of the public projection. */
export function publicSpecifications(value: unknown, slug: string) {
  const parsed = ProductSpecificationsSchema.safeParse(decoded(value));
  if (
    isConceptProduct(slug) ||
    !parsed.success ||
    !parsed.data.verifiedAt ||
    Date.parse(parsed.data.verifiedAt) > Date.now()
  )
    return undefined;
  return withoutVerifier(parsed.data);
}

export function publicVariantAttributes(value: unknown, verified: boolean) {
  const parsed = VariantAttributesSchema.safeParse(decoded(value));
  return verified &&
    parsed.success &&
    parsed.data.verifiedAt &&
    Date.parse(parsed.data.verifiedAt) <= Date.now()
    ? withoutVerifier(parsed.data)
    : undefined;
}

export function publicIdentifiers(value: unknown, slug: string) {
  const parsed = VerifiedIdentifiersSchema.safeParse(decoded(value));
  return !isConceptProduct(slug) &&
    parsed.success &&
    Date.parse(parsed.data.verifiedAt) <= Date.now()
    ? withoutVerifier(parsed.data)
    : undefined;
}
