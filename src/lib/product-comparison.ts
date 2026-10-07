import type { CatalogProduct } from "@/db/queries";
import { isConceptProduct } from "@/lib/concept-products";
import { formatGs } from "@/lib/money";

export const COMPARISON_LIMIT = 3;
export function comparisonSlugs(
  value: string | string[] | undefined
): string[] {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return [
    ...new Set(
      values
        .flatMap((entry) => entry.split(","))
        .filter(
          (slug) =>
            /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 191
        )
    ),
  ].slice(0, COMPARISON_LIMIT);
}
export function comparisonUrl(slugs: readonly string[]): string {
  const query = new URLSearchParams();
  comparisonSlugs([...slugs]).forEach((slug) => query.append("producto", slug));
  return `/comparar${query.size ? `?${query}` : ""}`;
}
export function comparisonPrice(product: CatalogProduct): string {
  if (isConceptProduct(product.slug) || product.showPrice === false)
    return "Precio por confirmar";
  const prices = product.variants
    .map((variant) => variant.pricePyg)
    .filter((price) => price > 0);
  if (!prices.length) return "Precio por confirmar";
  const low = Math.min(...prices);
  const high = Math.max(...prices);
  const amount =
    low === high ? formatGs(low) : `${formatGs(low)} – ${formatGs(high)}`;
  return (product.saleMode ?? "stock") === "stock"
    ? amount
    : `${amount} (orientativo)`;
}
export function comparisonAvailability(product: CatalogProduct): string {
  if (isConceptProduct(product.slug))
    return "Concepto ilustrativo · no disponible para compra";
  if (product.saleMode === "showcase")
    return "Muestra · no disponible para compra";
  if (product.saleMode === "enquiry" || product.showPrice === false)
    return "Solo consulta · disponibilidad por confirmar";
  return product.variants.some((variant) => variant.available > 0)
    ? "Con stock en algunas variantes"
    : "Sin stock";
}
