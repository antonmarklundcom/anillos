import type { MetadataRoute } from "next";
import { GUIDES } from "@/content/guides";
import { CATEGORY_PAGES } from "@/content/category-pages";
import { isConceptProduct } from "@/lib/concept-products";

import { getSitemapEntries } from "@/db/queries";
import { getStoreCategories } from "@/store/catalog";
import { paginasActivas } from "@/lib/paginas";
import { buildSitemap } from "@/lib/seo";
import { siteOrigin } from "@/lib/site-url";

/**
 * `/sitemap.xml` — la home, las categorías activas, los productos publicados
 * y las páginas de políticas prendidas.
 *
 * Mismo revalidate que el catálogo: el sitemap no tiene por qué ser más fresco
 * que las páginas que lista.
 */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const origin = siteOrigin();
  // Sin origen público no hay URL absoluta que publicar, y el sitemap las
  // exige. Vacío es honesto; un dominio adivinado le enseña al buscador
  // páginas que no existen.
  if (!origin) return [];

  // Las páginas de políticas prendidas desde `/admin/ajustes`. Sin base,
  // `getStoreSettings` devuelve los defaults (todas prendidas), que es lo que
  // la tienda sirve en ese momento.
  const pages: string[] = [
    ...(await paginasActivas()).map((pagina) => pagina.slug),
    "colecciones",
    "guias",
    "contacto",
    "como-funciona",
    ...GUIDES.map((guide) => `guias/${guide.slug}`),
  ];
  const categories = (await getStoreCategories()).map((category) => ({
    ...category,
    reviewedAt: CATEGORY_PAGES[category.slug]?.reviewedAt,
  }));
  const pageDates = Object.fromEntries(
    GUIDES.map((guide) => [`guias/${guide.slug}`, guide.reviewedAt])
  );

  try {
    const entries = await getSitemapEntries();
    return buildSitemap(origin, {
      ...entries,
      categories,
      products: entries.products.filter(
        (product) => !isConceptProduct(product.slug)
      ),
      pages,
      pageDates,
    });
  } catch {
    // La base caída no puede tumbar el sitio: al menos la home se publica, y
    // el crawler vuelve en el próximo revalidate.
    return buildSitemap(origin, { categories, products: [], pages, pageDates });
  }
}
