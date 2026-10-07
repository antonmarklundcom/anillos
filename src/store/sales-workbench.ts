/** Owner planning only: no order, payment, inventory, attribution or DB writes. */
export const ENQUIRY_STAGES = [
  "nueva",
  "esperando-proveedor",
  "cotizada",
  "cerrada-perdida",
  "cerrada-venta",
] as const;
export type EnquiryStage = (typeof ENQUIRY_STAGES)[number];
export const STAGE_LABELS: Record<EnquiryStage, string> = {
  nueva: "Nueva",
  "esperando-proveedor": "Esperando proveedor",
  cotizada: "Cotizada",
  "cerrada-perdida": "Cerrada · perdida",
  "cerrada-venta": "Cerrada · venta informada manualmente",
};
export const ENQUIRY_CATEGORIES = [
  "sin-definir",
  "acero",
  "plata-925",
  "alianzas-plata",
  "alianzas-oro",
  "compromiso",
  "promesa",
  "solitarios",
  "alianzas",
  "oro",
  "hombre",
] as const;
export const ENQUIRY_STYLES = [
  "sin-definir",
  "banda-simple",
  "solitario",
  "par-de-alianzas",
  "con-piedra",
  "otro",
] as const;
export type ManualEnquiry = {
  id: string;
  alias: string;
  category: (typeof ENQUIRY_CATEGORIES)[number];
  style: (typeof ENQUIRY_STYLES)[number];
  stage: EnquiryStage;
  date: string;
  followUp: string;
};
export const MAX_ENQUIRIES = 200;
export const MAX_LEDGER_BYTES = 100_000;

export function validDay(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return (
    Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
  );
}

/** Whitelist reconstruction also excludes unrecognized fields from exports. */
export function validateEnquiry(value: unknown): ManualEnquiry {
  if (!value || typeof value !== "object")
    throw new Error("Consulta inválida.");
  const row = value as Record<string, unknown>;
  if (typeof row.id !== "string" || !/^[a-z0-9-]{1,60}$/.test(row.id))
    throw new Error("Identificador inválido.");
  if (typeof row.alias !== "string" || !/^consulta-\d{1,4}$/.test(row.alias))
    throw new Error(
      "Usá un alias anónimo como consulta-001, sin datos personales."
    );
  if (
    !ENQUIRY_CATEGORIES.includes(row.category as ManualEnquiry["category"]) ||
    !ENQUIRY_STYLES.includes(row.style as ManualEnquiry["style"]) ||
    !ENQUIRY_STAGES.includes(row.stage as EnquiryStage)
  )
    throw new Error("Elegí categoría, estilo y estado válidos.");
  if (
    typeof row.date !== "string" ||
    !validDay(row.date) ||
    typeof row.followUp !== "string" ||
    (row.followUp !== "" &&
      (!validDay(row.followUp) || row.followUp < row.date))
  )
    throw new Error(
      "Revisá las fechas; el seguimiento no puede ser anterior a la consulta."
    );
  return {
    id: row.id,
    alias: row.alias,
    category: row.category as ManualEnquiry["category"],
    style: row.style as ManualEnquiry["style"],
    stage: row.stage as EnquiryStage,
    date: row.date,
    followUp: row.followUp,
  };
}

function validateRows(rows: unknown): ManualEnquiry[] {
  if (!Array.isArray(rows) || rows.length > MAX_ENQUIRIES)
    throw new Error(`El registro admite hasta ${MAX_ENQUIRIES} consultas.`);
  const validated = rows.map(validateEnquiry);
  if (
    new Set(validated.map((row) => row.id)).size !== validated.length ||
    new Set(validated.map((row) => row.alias)).size !== validated.length
  )
    throw new Error("Hay consultas duplicadas en el registro.");
  return validated;
}

export function serializeEnquiries(rows: unknown): string {
  const result = JSON.stringify(
    {
      version: 1,
      source: "registro-manual-local",
      notice:
        "Estados informados manualmente. No acredita pedidos ni pagos. Sin previsión de ingresos.",
      enquiries: validateRows(rows),
    },
    null,
    2
  );
  if (result.length > MAX_LEDGER_BYTES)
    throw new Error("El registro supera el tamaño permitido.");
  return result;
}
export function parseEnquiries(raw: string): ManualEnquiry[] {
  if (raw.length > MAX_LEDGER_BYTES)
    throw new Error("El registro supera el tamaño permitido.");
  const data: unknown = JSON.parse(raw);
  if (
    !data ||
    typeof data !== "object" ||
    !("version" in data) ||
    data.version !== 1 ||
    !("enquiries" in data)
  )
    throw new Error("El registro guardado tiene un formato incompatible.");
  return validateRows(data.enquiries);
}
export interface LedgerStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export function ledgerKey(ownerId: number): string {
  if (!Number.isSafeInteger(ownerId) || ownerId < 1)
    throw new Error("Dueño inválido.");
  return `store-owner-manual-enquiries-v1:${ownerId}`;
}
export function readLedger(
  storage: LedgerStorage,
  ownerId: number
): ManualEnquiry[] {
  const raw = storage.getItem(ledgerKey(ownerId));
  return raw === null ? [] : parseEnquiries(raw);
}
export function saveLedger(
  storage: LedgerStorage,
  ownerId: number,
  rows: unknown
): void {
  storage.setItem(ledgerKey(ownerId), serializeEnquiries(rows));
}
export function removeLedger(storage: LedgerStorage, ownerId: number): void {
  storage.removeItem(ledgerKey(ownerId));
}
export function enquirySummary(rows: ManualEnquiry[], today: string) {
  const stages = Object.fromEntries(
    ENQUIRY_STAGES.map((stage) => [stage, 0])
  ) as Record<EnquiryStage, number>;
  const categories = Object.fromEntries(
    ENQUIRY_CATEGORIES.map((category) => [category, 0])
  ) as Record<ManualEnquiry["category"], number>;
  let followUpsDue = 0;
  for (const row of rows) {
    stages[row.stage]++;
    categories[row.category]++;
    if (
      !row.stage.startsWith("cerrada-") &&
      row.followUp !== "" &&
      row.followUp <= today
    )
      followUpsDue++;
  }
  return { total: rows.length, stages, categories, followUpsDue };
}

export const COST_FIELDS = [
  { key: "acquisition", label: "Compra al proveedor" },
  { key: "freight", label: "Flete de adquisición asignado" },
  { key: "packaging", label: "Empaque" },
  { key: "fees", label: "Comisiones de cobro / plataforma" },
  { key: "delivery", label: "Envío que absorbe la tienda" },
  { key: "returns", label: "Reserva estimada para ajustes / devoluciones" },
  { key: "marketing", label: "Marketing de adquisición asignado" },
  { key: "tax", label: "Impuestos variables estimados" },
] as const;
export type CostKey = (typeof COST_FIELDS)[number]["key"];
export type ContributionInputs = Record<CostKey | "price" | "target", string>;
export function blankContribution(): ContributionInputs {
  return {
    price: "",
    target: "",
    acquisition: "",
    freight: "",
    packaging: "",
    fees: "",
    delivery: "",
    returns: "",
    marketing: "",
    tax: "",
  };
}
const MAX_MONEY = 1_000_000_000_000;
export function parsePlanningPyg(value: string): number | null {
  if (value === "") return null;
  if (!/^\d{1,13}$/.test(value))
    throw new Error("Ingresá guaraníes enteros, sin puntos, comas ni signos.");
  const amount = Number(value);
  if (!Number.isSafeInteger(amount) || amount > MAX_MONEY)
    throw new Error("El monto supera el límite de la calculadora.");
  return amount;
}
export function calculateContribution(input: ContributionInputs):
  | { ready: false; missing: string[]; error?: string }
  | {
      ready: true;
      price: number;
      costs: number;
      contribution: number;
      breakEven: number;
      targetPrice: number | null;
    } {
  const missing: string[] = [];
  let price: number | null;
  let costs = 0;
  let target: number | null;
  try {
    price = parsePlanningPyg(input.price);
    if (price === null) missing.push("Precio de venta propuesto");
    for (const field of COST_FIELDS) {
      const amount = parsePlanningPyg(input[field.key]);
      if (amount === null) missing.push(field.label);
      else costs += amount;
    }
    target = parsePlanningPyg(input.target);
  } catch (error) {
    return {
      ready: false,
      missing,
      error: error instanceof Error ? error.message : "Revisá los montos.",
    };
  }
  if (missing.length || price === null) return { ready: false, missing };
  return {
    ready: true,
    price,
    costs,
    contribution: price - costs,
    breakEven: costs,
    targetPrice: target === null ? null : costs + target,
  };
}

export const CAMPAIGN_OBJECTIVES = [
  "explorar-estilos",
  "medidas",
  "consulta",
] as const;
export type CampaignObjective = (typeof CAMPAIGN_OBJECTIVES)[number];
export const CAMPAIGN_OBJECTIVE_LABELS: Record<CampaignObjective, string> = {
  "explorar-estilos": "Ayudar a explorar estilos",
  medidas: "Preparar las medidas",
  consulta: "Preparar una consulta",
};
export type CampaignDestination = { path: string; label: string };
function planningLabel(value: string, limit: number) {
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .trim()
    .slice(0, limit);
}
export function campaignDestinations(
  categories: readonly { slug: string; name: string }[]
): CampaignDestination[] {
  return [
    { path: "/elegir", label: "Buscador de estilos" },
    { path: "/guias/talles", label: "Guía de medidas" },
    { path: "/favoritos", label: "Favoritos del navegador" },
    ...categories
      .filter(
        ({ slug }) =>
          /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 191
      )
      .filter(
        (category, index, all) =>
          all.findIndex(({ slug }) => slug === category.slug) === index
      )
      .map(({ slug, name }) => ({
        path: `/categoria/${slug}`,
        label: `Colección: ${planningLabel(name, 120)}`,
      })),
  ];
}
/** Only finite, currently supplied public destinations may appear in a draft. */
export function campaignDraft(input: {
  storeName: string;
  origin: string | null;
  categories: readonly { slug: string; name: string }[];
  destination: string;
  objective: CampaignObjective;
}): { text: string; href: string | null } {
  if (
    !CAMPAIGN_OBJECTIVES.includes(input.objective) ||
    !campaignDestinations(input.categories).some(
      ({ path }) => path === input.destination
    )
  )
    throw new Error("Elegí un objetivo y un destino disponibles.");
  let href: string | null = null;
  if (input.origin) {
    try {
      const origin = new URL(input.origin);
      if (
        ["https:", "http:"].includes(origin.protocol) &&
        !origin.username &&
        !origin.password
      )
        href = new URL(input.destination, origin.origin).toString();
    } catch {
      /* Missing or invalid origin leaves a text-only draft. */
    }
  }
  const intros: Record<CampaignObjective, string> = {
    "explorar-estilos":
      "¿Qué estilo de anillo te gusta? Ordená tus ideas y compará las fichas que te interesan.",
    medidas:
      "Elegir un anillo empieza por conocer tu medida. Revisá cómo medir el diámetro interior y qué confirmar antes de elegir.",
    consulta:
      "Prepará tu consulta: elegí un diseño, anotá tus medidas si las conocés y contanos qué detalles te gustan.",
  };
  const cta =
    input.destination === "/elegir"
      ? "Encontrá tu punto de partida."
      : input.destination === "/guias/talles"
        ? "Consultá la guía de medidas; no reemplaza la escala del proveedor."
        : input.destination === "/favoritos"
          ? "Guardá tus diseños favoritos en tu navegador y elegí cuáles consultar."
          : "Explorá esta colección y prepará tus preguntas.";
  return {
    href,
    text: [
      planningLabel(input.storeName, 100),
      intros[input.objective],
      cta,
      "Precio, disponibilidad y condiciones quedan por confirmar. Una consulta no crea un pedido ni un pago.",
      href,
    ]
      .filter(Boolean)
      .join("\n\n"),
  };
}
