import { and, eq, isNotNull } from "drizzle-orm";
import { getDb } from "@/db";
import { categories, products, productSlugRedirects } from "@/db/schema";
import { isConceptProduct } from "@/lib/concept-products";
import { DomainError } from "./errors";
import type { Executor } from "./executor";

function slugConflict(slug: string): never {
  const error = new DomainError("adminError.producto.slugHistorico", { slug });
  error.name = "AdminInputError";
  throw error;
}

/** Unique namespace shared by current and historical product URLs. */
export async function claimProductSlug(
  tx: Executor,
  slug: string,
  productId: number
) {
  const [record] = await tx
    .select()
    .from(productSlugRedirects)
    .where(eq(productSlugRedirects.slug, slug))
    .limit(1)
    .for("update");
  if (record) {
    if (record.productId !== productId) slugConflict(slug);
    return;
  }
  await tx.insert(productSlugRedirects).values({ slug, productId });
}

export async function assertProductSlugAvailable(
  tx: Executor,
  slug: string,
  productId: number | null
) {
  const [product] = await tx
    .select({ id: products.id })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1)
    .for("update");
  if (product && product.id !== productId) slugConflict(slug);
  const [alias] = await tx
    .select()
    .from(productSlugRedirects)
    .where(eq(productSlugRedirects.slug, slug))
    .limit(1)
    .for("update");
  // A reservation belongs to a product, not to a redirect chain. Reclaiming
  // our own URL retains every reservation and resolves aliases directly to current.
  if (alias && alias.productId !== productId) slugConflict(slug);
}

export function assertConceptSlugBoundary(previous: string, next: string) {
  if (isConceptProduct(previous) !== isConceptProduct(next)) {
    const error = new DomainError("adminError.producto.slugConcepto");
    error.name = "AdminInputError";
    throw error;
  }
}

/** Direct-to-current resolution: no user URL, external redirect, chain or cycle. */
export async function getProductSlugRedirect(
  slug: string,
  executor?: Executor
): Promise<string | null> {
  const tx = executor ?? getDb();
  // Legacy products may not have an alias row for their current URL. Database
  // equality also finds requests differing only in collation (e.g. uppercase).
  const [current] = await tx
    .select({ slug: products.slug })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(products.slug, slug),
        eq(products.isActive, true),
        isNotNull(products.publishedAt),
        eq(categories.isActive, true)
      )
    )
    .limit(1);
  if (current)
    return current.slug === slug ||
      isConceptProduct(current.slug) !== isConceptProduct(slug)
      ? null
      : current.slug;
  const [target] = await tx
    .select({ slug: products.slug })
    .from(productSlugRedirects)
    .innerJoin(products, eq(productSlugRedirects.productId, products.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        eq(productSlugRedirects.slug, slug),
        eq(products.isActive, true),
        isNotNull(products.publishedAt),
        eq(categories.isActive, true)
      )
    )
    .limit(1);
  if (
    !target ||
    target.slug === slug ||
    isConceptProduct(target.slug) !== isConceptProduct(slug)
  )
    return null;
  return target.slug;
}
