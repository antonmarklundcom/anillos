import type { Metadata } from "next";
import Link from "next/link";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { getStoreCategories } from "@/store/catalog";
import { CatalogUnavailable } from "@/components/catalog-unavailable";
import { log } from "@/lib/log";
import { getStoreSettings } from "@/domain/store-settings";
import { t, tPlural } from "@/i18n";
import { matchingRingInformation, searchStoreProducts } from "@/store/search";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: t("buscar.meta"),
  robots: { index: false },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const query = await searchParams;
  const raw = Array.isArray(query.q) ? query.q[0] : query.q;
  const term = (raw ?? "").trim();

  let unavailable = false;
  const results =
    term.length >= 2
      ? await searchStoreProducts(term).catch((error) => {
          log.error("store.search.unavailable", { error });
          unavailable = true;
          return [];
        })
      : [];
  const categories = results.length === 0 ? await getStoreCategories() : [];
  const information = matchingRingInformation(term, categories);
  const { vidriera } = await getStoreSettings();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">
        {term
          ? t("buscar.resultadosPara", { termino: term })
          : t("buscar.titulo")}
      </h1>

      {term.length < 2 ? (
        <p className="text-muted-foreground mt-2 text-sm">
          {t("buscar.minimo")}
        </p>
      ) : !unavailable ? (
        <p className="text-muted-foreground mt-1 text-sm">
          {tPlural("catalogo.productos", results.length)}
        </p>
      ) : null}
      {information.categories.length > 0 || information.guides.length > 0 ? (
        <section
          className="mt-10"
          aria-label="Colecciones y guías relacionadas"
        >
          <h2 className="text-lg font-medium">Información para tu elección</h2>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {information.categories.map((category) => (
              <li key={category.slug}>
                <Link
                  className="text-link"
                  href={`/categoria/${category.slug}`}
                >
                  {category.name} →
                </Link>
              </li>
            ))}
            {information.guides.map((guide) => (
              <li key={guide.slug}>
                <Link className="text-link" href={`/guias/${guide.slug}`}>
                  {guide.title} →
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {unavailable ? (
        <CatalogUnavailable />
      ) : results.length > 0 ? (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {results.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              priority={index < 4}
              showRating={vidriera.estrellasEnTarjetas}
            />
          ))}
        </div>
      ) : term.length >= 2 ? (
        <div className="border-border mt-8 rounded-xl border border-dashed p-10 text-center">
          <p className="font-medium">{t("buscar.nada", { termino: term })}</p>
          <p className="text-muted-foreground mt-1 text-sm">
            {t("buscar.nada.ayuda")}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <Button key={category.slug} asChild variant="outline" size="sm">
                <Link href={`/categoria/${category.slug}`}>
                  {category.name}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </main>
  );
}
