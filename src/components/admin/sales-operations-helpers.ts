import {
  quotationTotal,
  type CustomerQuotation,
  type SalesWorkspace,
} from "@/domain/sales-workspace";

export const operationsMoney = (value: number | null) =>
  value === null
    ? "Pendiente de confirmar"
    : `₲ ${new Intl.NumberFormat("es-PY").format(value)}`;
export const operationsToday = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
export const operationsNullableNumber = (value: string) =>
  value.trim() === "" ? null : Number(value);
export const operationsDay = (value: string | null) =>
  value ? value.split("-").reverse().join("/") : "Sin fecha";
export const operationsQuoteDisclaimer =
  "Cotización para revisar y confirmar por WhatsApp. No constituye reserva, pedido ni pago. Confirmá modelo, medidas y condiciones antes de avanzar.";

// Deliberate allowlist: aliases, source references and all private records stay out.
export function operationsCustomerSheet(
  quote: CustomerQuotation,
  workspace: SalesWorkspace,
  storeName: string
) {
  const sourceServices =
    quote.status === "review_ready"
      ? quote.servicesSnapshot
      : workspace.serviceOptions.filter(
          (s) => quote.serviceOptionIds.includes(s.id) && s.enabled
        );
  const services = sourceServices.map((s) => ({
    name: s.name,
    terms: s.terms,
    pricePyg: s.pricePyg,
  }));
  return {
    storeName,
    createdOn: quote.createdOn,
    expiresOn: quote.expiresOn,
    lines: quote.lines.map((l) => ({
      model: l.model,
      unit: l.unit,
      quantity: l.quantity,
      unitPricePyg: l.unitPricePyg,
    })),
    services,
    deliveryPyg: quote.deliveryPyg,
    deliveryConditions: quote.deliveryConditions,
    deliveryConfirmedOn: quote.deliveryConfirmedOn,
    totalPyg: quotationTotal(quote, workspace.serviceOptions),
    disclaimer: operationsQuoteDisclaimer,
  };
}
export function operationsQuoteText(
  quote: CustomerQuotation,
  workspace: SalesWorkspace,
  storeName: string
) {
  const s = operationsCustomerSheet(quote, workspace, storeName);
  return [
    `${s.storeName} · Cotización para revisar`,
    `Fecha: ${operationsDay(s.createdOn)}${s.expiresOn ? ` · Validez: ${operationsDay(s.expiresOn)}` : ""}`,
    ...s.lines.map(
      (l) =>
        `${l.model}: ${l.quantity} ${l.unit === "pair" ? "par(es) de dos anillos" : "anillo(s)"} · ${operationsMoney(l.unitPricePyg)} por unidad`
    ),
    ...s.services.map(
      (v) => `${v.name}: ${operationsMoney(v.pricePyg)} · ${v.terms}`
    ),
    `Entrega: ${operationsMoney(s.deliveryPyg)} · ${s.deliveryConditions || "Condiciones pendientes"}`,
    `Total: ${operationsMoney(s.totalPyg)}`,
    s.disclaimer,
  ].join("\n");
}

export function operationsQuoteDifferences(
  before: CustomerQuotation,
  after: CustomerQuotation,
  workspace: SalesWorkspace
) {
  const a = operationsCustomerSheet(before, workspace, "");
  const b = operationsCustomerSheet(after, workspace, "");
  const groups = [
    { key: "lines", label: "Modelos, unidades, cantidades o precios" },
    { key: "services", label: "Servicios y condiciones" },
    { key: "deliveryPyg", label: "Costo de entrega" },
    { key: "deliveryConditions", label: "Condiciones de entrega" },
    { key: "expiresOn", label: "Validez" },
  ] as const;
  return groups
    .filter(({ key }) => JSON.stringify(a[key]) !== JSON.stringify(b[key]))
    .map(({ label }) => label);
}
export function operationsComparisonSheet(
  quotationIds: string[],
  workspace: SalesWorkspace,
  storeName: string
) {
  if (
    quotationIds.length < 2 ||
    quotationIds.length > 3 ||
    new Set(quotationIds).size !== quotationIds.length
  )
    throw new Error("Elegí dos o tres alternativas distintas.");
  const quotes = quotationIds.map((id) =>
    workspace.customerQuotations.find((q) => q.id === id)
  );
  if (quotes.some((q) => !q || q.status !== "review_ready"))
    throw new Error(
      "Todas las alternativas deben estar revisadas y confirmadas."
    );
  const units = quotes.map((q) =>
    [...new Set(q!.lines.map((l) => l.unit))].sort().join(",")
  );
  if (new Set(units).size !== 1)
    throw new Error(
      "Compará alternativas con las mismas unidades; no mezcles un anillo con un par."
    );
  return {
    storeName,
    alternatives: quotes.map((q) =>
      operationsCustomerSheet(q!, workspace, storeName)
    ),
    disclaimer: operationsQuoteDisclaimer,
  };
}
export function operationsDemandRows(workspace: SalesWorkspace) {
  const map = new Map<
    string,
    {
      model: string;
      system: string;
      size: string | null;
      unit: string;
      requested: number;
      fulfilled: number;
    }
  >();
  for (const r of workspace.demandRequests) {
    const key = JSON.stringify([
      r.modelSlug,
      r.sizeSystem,
      r.requestedSize,
      r.unit,
    ]);
    const row = map.get(key) ?? {
      model: r.modelSlug,
      system: r.sizeSystem,
      size: r.requestedSize,
      unit: r.unit,
      requested: 0,
      fulfilled: 0,
    };
    row.requested += r.quantity;
    if (r.status === "fulfilled") row.fulfilled += r.quantity;
    map.set(key, row);
  }
  return [...map.values()];
}
export const operationsElapsedDays = (
  from: string | null,
  to: string | null
) =>
  from && to
    ? Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000)
    : null;
