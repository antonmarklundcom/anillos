import { eq } from "drizzle-orm";
import { COLLECTIONS, collectionFor } from "@/config/ring-store";
import { getDb } from "@/db";
import { getCategoryBySlug } from "@/db/queries";
import { categories } from "@/db/schema";
import { log } from "@/lib/log";

export type StoreCategory = {
  id: number | null;
  slug: string;
  name: string;
  description: string | null;
  imageCloudinaryId: string | null;
  imageAlt: string | null;
  catalogAvailable: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
};

const summary = {
  id: categories.id,
  slug: categories.slug,
  name: categories.name,
  isActive: categories.isActive,
};

/** Presentation fallback only: never inserts stock, prices or category records. */
export async function getStoreCategory(
  slug: string
): Promise<StoreCategory | null> {
  const collection = collectionFor(slug);
  const fallback = collection
    ? {
        id: null,
        slug,
        name: collection.name,
        description: collection.description,
        imageCloudinaryId: null,
        imageAlt: null,
        catalogAvailable: false,
      }
    : null;
  try {
    // Read the original columns first so an explicitly hidden category stays hidden,
    // even when a later migration has not added its optional image/description fields.
    const [record] = await getDb()
      .select(summary)
      .from(categories)
      .where(eq(categories.slug, slug))
      .limit(1);
    if (!record) return fallback;
    if (!record.isActive) return null;
    try {
      const complete = await getCategoryBySlug(slug);
      return complete ? { ...complete, catalogAvailable: true } : null;
    } catch (error) {
      log.error("store.category.details_unavailable", { slug, error });
      return {
        ...record,
        description: collection?.description ?? null,
        imageCloudinaryId: null,
        imageAlt: null,
        catalogAvailable: false,
      };
    }
  } catch (error) {
    log.error("store.category.unavailable", { slug, error });
    return fallback;
  }
}

export async function getStoreCategories() {
  try {
    const records = await getDb()
      .select(summary)
      .from(categories)
      .orderBy(categories.position);
    const existing = new Set(records.map((record) => record.slug));
    return [
      ...records.filter((record) => record.isActive),
      ...COLLECTIONS.filter((item) => !existing.has(item.slug)).map((item) => ({
        id: null,
        slug: item.slug,
        name: item.name,
      })),
    ];
  } catch (error) {
    log.error("store.categories.unavailable", { error });
    return COLLECTIONS.map((item) => ({
      id: null,
      slug: item.slug,
      name: item.name,
    }));
  }
}
