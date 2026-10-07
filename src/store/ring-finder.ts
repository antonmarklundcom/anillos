export const RING_OCCASIONS = [
  {
    value: "promesa",
    label: "Promesa o regalo",
    categories: ["promesa", "solitarios"],
    guide: "materiales",
  },
  {
    value: "compromiso",
    label: "Compromiso",
    categories: ["compromiso", "solitarios"],
    guide: "compromiso-y-alianzas",
  },
  {
    value: "boda",
    label: "Boda",
    categories: ["alianzas", "alianzas-plata", "alianzas-oro"],
    guide: "alianzas-boda-civil",
  },
  {
    value: "diario",
    label: "Uso cotidiano",
    categories: ["hombre", "promesa", "acero", "plata-925"],
    guide: "talles",
  },
] as const;
export type RingOccasion = (typeof RING_OCCASIONS)[number]["value"];
export type RingPreference = "sencillo" | "piedra" | "dos";

/** Editorial navigation only: preferences never become verified product facts. */
export function findRingCollections(input: {
  occasion: RingOccasion;
  preference: RingPreference;
  available: readonly { slug: string; name: string }[];
}) {
  const occasion =
    RING_OCCASIONS.find((item) => item.value === input.occasion) ??
    RING_OCCASIONS[0];
  const priorities =
    input.preference === "dos"
      ? ["alianzas", "alianzas-plata", "alianzas-oro", ...occasion.categories]
      : input.preference === "piedra"
        ? [
            input.occasion === "compromiso" ? "compromiso" : "solitarios",
            "solitarios",
            "promesa",
            ...occasion.categories,
          ]
        : [...occasion.categories];
  const available = new Map(input.available.map((item) => [item.slug, item]));
  return {
    collections: [...new Set(priorities)]
      .flatMap((slug) => (available.has(slug) ? [available.get(slug)!] : []))
      .slice(0, 3),
    guide: input.preference === "dos" ? "alianzas-boda-civil" : occasion.guide,
    note:
      input.preference === "dos"
        ? "Prepará dos medidas independientes. Cada ficha debe confirmar si incluye una pieza o un par."
        : input.preference === "piedra"
          ? "Compará forma y altura del engarce; la identidad de la piedra debe estar confirmada en la ficha."
          : "Compará ancho, perfil y comodidad con una medida del dedo donde lo vas a usar.",
  };
}
