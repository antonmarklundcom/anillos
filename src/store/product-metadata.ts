import { t } from "@/i18n";
import { markdownToText } from "@/lib/markdown";
import { formatGs } from "@/lib/money";
import { descriptionSnippet } from "@/store/seo";

/** Public metadata must follow the same price visibility as the product page. */
export function productMetaDescription(input: {
  name: string;
  categoryName: string;
  description?: string | null;
  cheapestPrice?: number;
  saleMode?: "stock" | "enquiry" | "showcase";
  showPrice?: boolean;
}): string {
  const description = descriptionSnippet(markdownToText(input.description));
  if (description) return description;
  if (
    (input.saleMode ?? "stock") === "stock" &&
    input.showPrice !== false &&
    input.cheapestPrice !== undefined &&
    input.cheapestPrice > 0
  ) {
    return t("producto.metaDescripcion", {
      nombre: input.name,
      precio: formatGs(input.cheapestPrice),
    });
  }
  return descriptionSnippet(
    `${input.name}. Explorá esta pieza de la colección ${input.categoryName} y revisá sus opciones, medidas y condiciones antes de elegir.`
  );
}
