import { GUIDES } from "@/content/guides";
import { searchProducts, suggestProducts } from "@/db/queries";

export async function searchStoreProducts(term: string) {
  if (term.length > 160) return [];
  const results = await searchProducts(term);
  const normalized =
    ringSearchSuggestions(term)[0] ?? normalizedRingSearch(term);
  return results.length > 0 || normalized === term.toLowerCase()
    ? results
    : searchProducts(normalized);
}

export async function suggestStoreProducts(term: string) {
  if (term.length > 160) return [];
  const results = await suggestProducts(term);
  const normalized =
    ringSearchSuggestions(term)[0] ?? normalizedRingSearch(term);
  return results.length > 0 || normalized === term.toLowerCase()
    ? results
    : suggestProducts(normalized);
}

export function normalizedRingSearch(term: string) {
  return term
    .slice(0, 160)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\bargollas?\b/g, "alianzas")
    .replace(/\btallas?\b/g, "talle")
    .replace(/\btalles\b/g, "talle");
}

/** Bounded spelling corrections for ring vocabulary; never infer material facts. */
export function ringSearchSuggestions(term: string): string[] {
  const normalized = normalizedRingSearch(term).trim();
  if (!normalized || term.length > 160) return [];
  const corrections: Record<string, string> = {
    anilo: "anillo",
    anilos: "anillos",
    anilllo: "anillo",
    aliansa: "alianza",
    aliansas: "alianzas",
    comprmiso: "compromiso",
    solitairo: "solitario",
  };
  const corrected = normalized
    .split(/\s+/)
    .slice(0, 12)
    .map((word) => corrections[word] ?? word)
    .join(" ");
  return [...new Set([corrected, normalized])]
    .filter((value) => value !== term.trim().toLowerCase())
    .slice(0, 2);
}

/** Discoverable information stays useful even while product queries are unavailable. */
export function matchingRingInformation(
  term: string,
  categories: { slug: string; name: string }[]
) {
  const words = normalizedRingSearch(term)
    .split(/\W+/)
    .filter(
      (word) =>
        word.length >= 3 &&
        ![
          "anillo",
          "anillos",
          "para",
          "como",
          "con",
          "los",
          "las",
          "una",
        ].includes(word)
    );
  const matches = (text: string) =>
    words.length > 0 &&
    words.some((word) => normalizedRingSearch(text).includes(word));
  return {
    categories: categories.filter((category) => matches(category.name)),
    guides: GUIDES.filter((guide) =>
      matches(`${guide.title} ${guide.description}`)
    ).slice(0, 3),
  };
}
