/** Minimal display values shared with client-rendered cards; no editorial copy. */
const CONCEPT_IMAGES: Record<string, string> = {
  "concepto-banda-acero": "steel",
  "concepto-onda-plata": "silver",
  "concepto-par-plata": "pair",
  "concepto-par-oro": "gold-pair",
  "concepto-solitario": "engagement",
};
export function conceptImageFor(slug: string) {
  return CONCEPT_IMAGES[slug];
}
export function priceUnit(categorySlug: string) {
  return categorySlug === "alianzas-plata" || categorySlug === "alianzas-oro"
    ? "Por par · 2 anillos"
    : "Por anillo · 1 unidad";
}
