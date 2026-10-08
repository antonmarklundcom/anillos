export type EnquiryProduct = {
  slug: string;
  name: string;
  categorySlug: string;
  concept: boolean;
  url?: string | null;
  unit?: "individual" | "pair" | null;
};

export type EnquiryDetails = {
  quantity: string;
  diameter: string;
  secondDiameter: string;
  city: string;
  desiredDate: string;
  budget: string;
  notes: string;
  giftOccasion: string;
  giftPackaging: string;
  giftSizeConfidence: string;
};

export const EMPTY_ENQUIRY: EnquiryDetails = {
  quantity: "",
  diameter: "",
  secondDiameter: "",
  city: "",
  desiredDate: "",
  budget: "",
  notes: "",
  giftOccasion: "",
  giftPackaging: "",
  giftSizeConfidence: "",
};
export const BUDGET_PREFERENCES = [
  "Priorizar opciones económicas",
  "Comparar distintas opciones",
  "Priorizar el diseño",
];
export const MAX_ENQUIRY_PRODUCTS = 5;
export const GIFT_OCCASIONS = [
  "Cumpleaños",
  "Aniversario",
  "Compromiso",
  "Otra ocasión",
];
export const GIFT_PACKAGING = [
  "Consultar opciones de presentación",
  "Consultar presentación discreta",
];
export const GIFT_SIZE_CONFIDENCE = [
  "Conozco una medida orientativa",
  "No conozco la medida",
];
const LIMITS: Record<keyof EnquiryDetails, number> = {
  quantity: 2,
  diameter: 5,
  secondDiameter: 5,
  city: 80,
  desiredDate: 10,
  budget: 40,
  notes: 300,
  giftOccasion: 40,
  giftPackaging: 60,
  giftSizeConfidence: 40,
};

export function cleanEnquiryDetails(value: unknown): EnquiryDetails {
  const source =
    value && typeof value === "object"
      ? (value as Record<string, unknown>)
      : {};
  const result = { ...EMPTY_ENQUIRY };
  for (const field of Object.keys(result) as (keyof EnquiryDetails)[]) {
    if (typeof source[field] === "string") {
      const cleaned = source[field]
        .replace(/[\u0000-\u001f\u007f]/g, " ")
        .trim();
      result[field] =
        ["quantity", "diameter", "secondDiameter", "desiredDate"].includes(
          field
        ) && cleaned.length > LIMITS[field]
          ? ""
          : cleaned.slice(0, LIMITS[field]);
    }
  }
  if (
    result.quantity &&
    (!/^\d+$/.test(result.quantity) ||
      Number(result.quantity) < 1 ||
      Number(result.quantity) > 20)
  )
    result.quantity = "";
  for (const field of ["diameter", "secondDiameter"] as const) {
    if (
      result[field] &&
      (!/^\d{1,2}([.,]\d{1,2})?$/.test(result[field]) ||
        Number(result[field].replace(",", ".")) < 10 ||
        Number(result[field].replace(",", ".")) > 30)
    )
      result[field] = "";
  }
  if (result.desiredDate) {
    const date = new Date(`${result.desiredDate}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(result.desiredDate) ||
      !Number.isFinite(date.getTime()) ||
      date.toISOString().slice(0, 10) !== result.desiredDate
    )
      result.desiredDate = "";
  }
  if (!BUDGET_PREFERENCES.includes(result.budget)) result.budget = "";
  if (!GIFT_OCCASIONS.includes(result.giftOccasion)) result.giftOccasion = "";
  if (!GIFT_PACKAGING.includes(result.giftPackaging)) result.giftPackaging = "";
  if (!GIFT_SIZE_CONFIDENCE.includes(result.giftSizeConfidence))
    result.giftSizeConfidence = "";
  return result;
}

export function enquiryValidationErrors(details: EnquiryDetails): string[] {
  const cleaned = cleanEnquiryDetails(details);
  const errors: string[] = [];
  if (details.quantity && !cleaned.quantity)
    errors.push("Usá una cantidad entera entre 1 y 20.");
  if (
    (details.diameter && !cleaned.diameter) ||
    (details.secondDiameter && !cleaned.secondDiameter)
  )
    errors.push(
      "Usá un diámetro entre 10 y 30 mm, con hasta dos decimales, o dejalo vacío si no lo sabés."
    );
  if (details.desiredDate && !cleaned.desiredDate)
    errors.push("Revisá la fecha deseada o dejala vacía.");
  return errors;
}

export function enquiryMessage(
  products: EnquiryProduct[],
  value: EnquiryDetails
) {
  const details = cleanEnquiryDetails(value);
  return [
    "Hola, quiero consultar por estos diseños:",
    ...products
      .slice(0, MAX_ENQUIRY_PRODUCTS)
      .map((product) =>
        [
          `• ${product.name.slice(0, 160)}${product.concept ? " (diseño ilustrativo; busco una pieza real similar)" : ""}`,
          product.unit === "pair"
            ? "Unidad informada: par de dos anillos."
            : product.unit === "individual"
              ? "Unidad informada: un anillo."
              : "Unidad de venta por confirmar.",
          product.url || `/producto/${encodeURIComponent(product.slug)}`,
        ].join("\n")
      ),
    details.quantity &&
      (products.length > 0 && products.every((p) => p.unit === "pair")
        ? `Cantidad de pares deseada por diseño: ${details.quantity} (dos anillos por par).`
        : `Cantidad de piezas deseada por diseño: ${details.quantity} anillos; confirmar la unidad de venta correspondiente a cada modelo.`),
    details.diameter &&
      `Diámetro interior persona 1: ${details.diameter} mm (orientativo, a confirmar).`,
    details.secondDiameter &&
      `Diámetro interior persona 2: ${details.secondDiameter} mm (orientativo, a confirmar).`,
    details.city && `Ciudad: ${details.city}.`,
    details.desiredDate &&
      `Fecha deseada: ${details.desiredDate} (sin plazo confirmado).`,
    details.budget &&
      `Preferencia de presupuesto: ${details.budget} (no es un precio).`,
    details.notes && `Detalles que me gustan: ${details.notes}.`,
    details.giftOccasion && `Ocasión del regalo: ${details.giftOccasion}.`,
    details.giftPackaging &&
      `Preferencia para consultar: ${details.giftPackaging} (opciones y costo por confirmar).`,
    details.giftSizeConfidence &&
      `Sobre la medida del regalo: ${details.giftSizeConfidence}.`,
    "Solicito fotos reales y confirmación de modelo, material, piedra si corresponde, medidas, precio y condiciones de entrega.",
    "Es una consulta: no confirma disponibilidad ni crea pedido, reserva o pago.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Only reuses the public recipient supplied by the server. */
export function enquiryWhatsappHref(
  href: string | null,
  message: string
): string | null {
  if (!href || message.length > 6000) return null;
  try {
    const url = new URL(href);
    if (
      url.protocol !== "https:" ||
      url.hostname !== "wa.me" ||
      url.port ||
      url.username ||
      url.password ||
      !/^\/\d{8,15}$/.test(url.pathname)
    )
      return null;
    url.search = "";
    url.hash = "";
    url.searchParams.set("text", message);
    return url.toString();
  } catch {
    return null;
  }
}

type DraftStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function readEnquiryDraft(
  storage: DraftStorage,
  key: string
): EnquiryDetails | null {
  try {
    const raw = storage.getItem(`ring-enquiry:${key}`);
    if (!raw || raw.length > 2000) return null;
    const parsed = JSON.parse(raw);
    return parsed.version === 1 ? cleanEnquiryDetails(parsed.details) : null;
  } catch {
    return null;
  }
}
export function saveEnquiryDraft(
  storage: DraftStorage,
  key: string,
  details: EnquiryDetails
): boolean {
  try {
    storage.setItem(
      `ring-enquiry:${key}`,
      JSON.stringify({ version: 1, details: cleanEnquiryDetails(details) })
    );
    return true;
  } catch {
    return false;
  }
}
export function removeEnquiryDraft(
  storage: DraftStorage,
  key: string
): boolean {
  try {
    storage.removeItem(`ring-enquiry:${key}`);
    return true;
  } catch {
    return false;
  }
}
