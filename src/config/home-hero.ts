/** Store presentation only. Both editorials share the accessible motion player. */
export type HomeHeroVariant = "portrait" | "rings";

export const HOME_HERO_VARIANT: HomeHeroVariant = "portrait";

export const HERO_MEDIA = {
  portrait: {
    poster: "/media/portrait-hero.webp",
    frames: "/media/portrait-frames",
    frameCount: 48,
    mobileFrameCount: 28,
    alt: "Una mujer adulta con un anillo sencillo en la mano, en un patio de Asunción",
    label: "Un detalle que se siente tuyo",
  },
  rings: {
    poster: "/media/frames/desktop/001.webp",
    frames: "/media/frames",
    frameCount: 48,
    mobileFrameCount: 48,
    alt: "Tres conceptos de anillos sobre piedra y lino claros",
    label: "Una historia en tres metales",
  },
} as const;
