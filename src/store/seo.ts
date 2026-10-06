import type { Metadata } from "next";
import { TIENDA } from "@/config/tienda";
import { storeName } from "./identity";

/** Presentation metadata; preserves the effective owner's brand and title template. */
export async function ringMetadata(
  content: { title: string; description: string },
  canonical: string,
  type: "website" | "article" = "website"
): Promise<Metadata> {
  return {
    title: content.title,
    description: content.description,
    alternates: { canonical },
    openGraph: {
      title: content.title,
      description: content.description,
      type,
      url: canonical,
      locale: TIENDA.ogLocale,
      siteName: await storeName(),
    },
    twitter: {
      card: "summary_large_image",
      title: content.title,
      description: content.description,
    },
  };
}

/** Avoids cutting a product description in the middle of a word. */
export function descriptionSnippet(text: string, limit = 160) {
  if (text.length <= limit) return text;
  const start = text.slice(0, limit - 1);
  const boundary = start.lastIndexOf(" ");
  return `${start.slice(0, boundary > 0 ? boundary : start.length).trimEnd()}…`;
}
