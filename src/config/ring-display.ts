/** Minimal display values shared with client-rendered cards; no editorial copy. */
const CONCEPT_IMAGES: Record<string, string> = {
  "concepto-banda-acero": "steel",
  "concepto-onda-plata": "silver",
  "concepto-par-plata": "pair",
  "concepto-par-oro": "gold-pair",
  "concepto-solitario": "engagement",
};
export function isRingCollection(slug: string) {
  return [
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
  ].includes(slug);
}
export const COLLECTION_NAV_LABELS: Record<string, string> = {
  acero: "Acero",
  "plata-925": "Plata 925",
  "alianzas-plata": "Alianzas de plata",
  "alianzas-oro": "Alianzas de oro",
  compromiso: "Compromiso",
  promesa: "Promesa",
  solitarios: "Solitarios",
  alianzas: "Boda",
  oro: "Oro",
  hombre: "Hombre",
};
export function conceptImageFor(slug: string) {
  return CONCEPT_IMAGES[slug];
}
export function priceUnit(categorySlug: string) {
  return categorySlug === "alianzas" ||
    categorySlug === "alianzas-plata" ||
    categorySlug === "alianzas-oro"
    ? "Por par · 2 anillos"
    : "Por anillo · 1 unidad";
}
