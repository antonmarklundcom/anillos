import { z } from "zod";

const optionalText = (length: number) =>
  z.string().trim().min(1).max(length).optional();
const millimetres = z
  .number({ error: "Ingresá una medida numérica válida." })
  .finite("Ingresá una medida finita.")
  .positive("La medida debe ser mayor que cero.")
  .max(1000, "La medida no puede superar 1000 mm.")
  .optional();
const verifier = z
  .object({
    userId: z.number().int().positive(),
    label: z.string().trim().min(1).max(200),
  })
  .strict();
const verifiedAt = z.iso
  .datetime({ offset: true })
  .refine(
    (value) => Date.parse(value) <= Date.now(),
    "La verificación no puede tener una fecha futura."
  )
  .transform((value) => new Date(value).toISOString());

export const ProductSpecificationsSchema = z
  .object({
    verifiedAt: verifiedAt.optional(),
    verifiedBy: verifier.optional(),
    material: optionalText(120),
    purity: optionalText(80),
    stone: optionalText(160),
    widthMm: millimetres,
    unit: z.enum(["individual", "pair"]).optional(),
  })
  .strict()
  .refine(
    (value) => !value.unit || Boolean(value.verifiedAt),
    "Confirmá la unidad de venta antes de guardarla."
  );
export const SupplierDetailsSchema = z
  .object({
    reference: optionalText(160),
    sourceUrl: z
      .url()
      .max(2000)
      .refine((value) => {
        try {
          return new URL(value).protocol === "https:";
        } catch {
          return false;
        }
      }, "Usá una URL HTTPS.")
      .optional(),
    verifiedAt: verifiedAt.optional(),
    verifiedBy: verifier.optional(),
    imageProvenance: z
      .enum(["supplier-authorized", "owned-photo", "illustrative"])
      .optional(),
  })
  .strict();
export const VariantAttributesSchema = z
  .object({
    verifiedAt: verifiedAt.optional(),
    verifiedBy: verifier.optional(),
    interiorMm: millimetres,
    /** Optional second measurement when the unit contains a pair. */
    interiorMmSecond: millimetres,
    sizeSystem: optionalText(80),
    sizeLabel: optionalText(80),
  })
  .strict();

export function validGtin(value: string): boolean {
  if (!/^(?:\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return false;
  let sum = 0;
  for (
    let index = value.length - 2, weight = 3;
    index >= 0;
    index--, weight = weight === 3 ? 1 : 3
  )
    sum += Number(value[index]) * weight;
  return (10 - (sum % 10)) % 10 === Number(value.at(-1));
}
export const VerifiedIdentifiersSchema = z
  .object({
    gtin: z
      .string()
      .trim()
      .refine(
        validGtin,
        "El GTIN debe tener longitud y dígito verificador válidos."
      )
      .optional(),
    mpn: optionalText(120),
    verifiedAt,
    verifiedBy: verifier.optional(),
  })
  .strict()
  .refine(
    (value) => Boolean(value.gtin || value.mpn),
    "Completá un GTIN o MPN verificado."
  );

export type ProductSpecifications = z.infer<typeof ProductSpecificationsSchema>;
export type SupplierDetails = z.infer<typeof SupplierDetailsSchema>;
export type VariantAttributes = z.infer<typeof VariantAttributesSchema>;
export type VerifiedIdentifiers = z.infer<typeof VerifiedIdentifiersSchema>;

/** Empty optional form fields stay absent; numerical metadata never changes money. */
export function attributeFormData(data: FormData, fields: readonly string[]) {
  return Object.fromEntries(
    fields.flatMap((field) => {
      const raw = String(data.get(field) ?? "").trim();
      return raw
        ? [
            [
              field,
              field.endsWith("Mm") || field === "interiorMmSecond"
                ? Number(raw.replace(",", "."))
                : raw,
            ],
          ]
        : [];
    })
  );
}

/** The browser expresses intent; only the authenticated server supplies audit data. */
export function verificationIntent(data: FormData, checkbox: string): boolean {
  return data.get(checkbox) === "on";
}

/** Stamp inside the write transaction against the locked current record. */
export function stampVerification(
  input: unknown,
  current: unknown,
  actor: { userId: number; label: string },
  now = new Date()
): unknown {
  if (input === null || input === undefined) return input;
  if (typeof input !== "object" || Array.isArray(input)) return input;
  const record = input as Record<string, unknown>;
  if (record.verified !== undefined && typeof record.verified !== "boolean")
    return input;
  const facts = Object.fromEntries(
    Object.entries(record).filter(
      ([key]) => !["verified", "verifiedAt", "verifiedBy"].includes(key)
    )
  );
  const previous =
    current && typeof current === "object" && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : {};
  const previousFacts = Object.fromEntries(
    Object.entries(previous).filter(
      ([key]) => !["verifiedAt", "verifiedBy"].includes(key)
    )
  );
  const ordered = (value: Record<string, unknown>) =>
    JSON.stringify(
      Object.keys(value)
        .sort()
        .map((key) => [
          key,
          typeof value[key] === "string" ? value[key].trim() : value[key],
        ])
    );
  const unchanged = ordered(facts) === ordered(previousFacts);
  const previouslyVerified =
    typeof previous.verifiedAt === "string" &&
    Number.isFinite(Date.parse(previous.verifiedAt)) &&
    Date.parse(previous.verifiedAt) <= now.getTime();
  if (record.verified === false) return facts;
  if (unchanged && previouslyVerified)
    return {
      ...facts,
      verifiedAt: previous.verifiedAt,
      ...(previous.verifiedBy ? { verifiedBy: previous.verifiedBy } : {}),
    };
  if (record.verified === true)
    return { ...facts, verifiedAt: now.toISOString(), verifiedBy: actor };
  return facts;
}
