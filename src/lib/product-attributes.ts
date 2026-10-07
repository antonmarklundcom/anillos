import { z } from "zod";

const optionalText = (length: number) =>
  z.string().trim().min(1).max(length).optional();
const millimetres = z.number().finite().positive().max(1000).optional();
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
      .refine(
        (value) => new URL(value).protocol === "https:",
        "Usá una URL HTTPS."
      )
      .optional(),
    verifiedAt: verifiedAt.optional(),
    imageProvenance: z
      .enum(["supplier-authorized", "owned-photo", "illustrative"])
      .optional(),
  })
  .strict();
export const VariantAttributesSchema = z
  .object({
    verifiedAt: verifiedAt.optional(),
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

/** Timestamp represents the owner's explicit verification, never an inferred fact. */
export function verificationDate(data: FormData, checkbox: string) {
  return data.get(checkbox) === "on" ? new Date().toISOString() : undefined;
}
