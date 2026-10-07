import type { ZodError } from "zod";

const labels: Record<string, string> = {
  name: "Nombre",
  slug: "URL",
  categoryId: "Categoría",
  ivaRate: "IVA",
  sku: "SKU",
  label: "Etiqueta",
  pricePyg: "Precio",
  compareAtPyg: "Precio anterior",
  reorderPoint: "Punto de reposición",
  material: "Material",
  purity: "Pureza",
  stone: "Piedra",
  widthMm: "Ancho",
  unit: "Unidad de venta",
  sourceUrl: "URL de la fuente",
  reference: "Referencia del proveedor",
  interiorMm: "Diámetro interior",
  interiorMmSecond: "Diámetro de la segunda pieza",
  sizeSystem: "Sistema de talles",
  sizeLabel: "Talle",
  gtin: "GTIN",
  mpn: "MPN",
  seoTitle: "Título SEO",
  seoDescription: "Descripción SEO",
};

/** Keep internal Zod/JavaScript diagnostics out of the Spanish admin workflow. */
export function validationFailure(error: ZodError): {
  ok: false;
  error: string;
  fieldErrors: Record<string, string>;
} {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    const name = String(issue.path.at(-1) ?? "");
    const message = /^(Invalid|Too |Unrecognized|Expected|Received)/i.test(
      issue.message
    )
      ? issue.code === "too_big"
        ? "El valor supera el máximo permitido."
        : issue.code === "too_small"
          ? "Completá este campo con un valor válido."
          : issue.code === "invalid_type"
            ? "Ingresá un valor válido para este campo."
            : "Revisá el formato de este campo."
      : issue.message;
    if (!fieldErrors[key])
      fieldErrors[key] = `${labels[name] ?? "Datos"}: ${message}`;
  }
  return {
    ok: false,
    error: Object.values(fieldErrors)[0] ?? "Revisá los datos.",
    fieldErrors,
  };
}
