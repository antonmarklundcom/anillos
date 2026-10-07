/** Stable SKUs identify shared selections; database IDs stay private to memory/cart. */
export function variantFromSku<T extends { sku: string; available: number }>(
  variants: readonly T[],
  sku: string | string[] | undefined | null,
  purchasable: boolean
): T | undefined {
  if (typeof sku !== "string" || !sku || sku.length > 191) return undefined;
  return variants.find(
    (variant) => variant.sku === sku && (!purchasable || variant.available > 0)
  );
}

export function variantUrl(url: string, sku: string): string {
  const parsed = new URL(url, "https://local.invalid");
  parsed.searchParams.set("variante", sku);
  return url.startsWith("/")
    ? `${parsed.pathname}${parsed.search}${parsed.hash}`
    : parsed.toString();
}
