/** Reserved illustrative catalogue entries can never become merchandise. */
export const CONCEPT_PRODUCT_PREFIX = "concepto-";

export function isConceptProduct(slug: string): boolean {
  return slug.toLowerCase().startsWith(CONCEPT_PRODUCT_PREFIX);
}
