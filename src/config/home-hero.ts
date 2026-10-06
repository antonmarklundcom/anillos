/** Store presentation only. Focal points are measured in the source photograph. */
export type HomeHeroVariant = "portrait" | "rings";
export const HOME_HERO_VARIANT: HomeHeroVariant = "rings";

export const HERO_MEDIA = {
  portrait: {
    poster: "/media/ring-on-hand-desktop.webp",
    mobile: "/media/ring-on-hand-mobile.webp",
    fallback: "/media/portrait-hero.webp",
    width: 1086,
    height: 1448,
    focus: [0.53, 0.52],
    zoom: 2.65,
    fit: "cover",
    alt: "Una mujer paraguaya adulta con un anillo plateado en el dedo, en un patio de Asunción",
    label: "Un detalle que se siente tuyo",
  },
  rings: {
    poster: "/media/ring-detail-desktop.webp",
    mobile: "/media/ring-detail-mobile.webp",
    fallback: "/media/silver.webp",
    width: 1254,
    height: 1254,
    focus: [0.5, 0.5],
    zoom: 1.22,
    fit: "contain",
    alt: "Un anillo plateado completo, con su perfil y acabado pulido en detalle",
    label: "La forma, el detalle y tu medida",
  },
} as const;

export const HERO_DETAILS = [
  { label: "La forma", text: "Una línea sencilla. Un detalle que va con vos." },
  {
    label: "El acabado",
    text: "Mirá el perfil y los reflejos. Compará lo que te gusta.",
  },
  { label: "Tu medida", text: "El estilo es tuyo. Encontrá un ajuste cómodo." },
] as const;
