import Link from "next/link";
import { getCatalog, getProductsBySlugs } from "@/db/queries";
import { ProductComparison } from "@/components/product-comparison";
import {
  comparisonSlugs,
  comparisonUrl,
  COMPARISON_LIMIT,
} from "@/lib/product-comparison";
import { ringMetadata } from "@/store/seo";
import { log } from "@/lib/log";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return {
    ...(await ringMetadata(
      {
        title: "Comparar anillos",
        description:
          "Compará hasta tres fichas del catálogo y revisá qué datos están confirmados.",
      },
      "/comparar"
    )),
    robots: { index: false, follow: true },
  };
}
export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ producto?: string | string[] }>;
}) {
  const requested = comparisonSlugs((await searchParams).producto);
  const result = await Promise.all([
    getProductsBySlugs(requested),
    getCatalog({ limit: 100 }),
  ]).catch((error) => {
    log.error("store.comparison.unavailable", { error });
    return null;
  });
  if (!result)
    return (
      <main className="store-section">
        <h1 className="article-heading">Comparar anillos</h1>
        <p role="status" className="mt-6">
          No pudimos cargar las fichas para comparar. Volvé a intentarlo más
          tarde.
        </p>
        <Link className="mt-4 inline-block underline" href="/colecciones">
          Volver al catálogo
        </Link>
      </main>
    );
  const [selected, catalogue] = result;
  const selectedSlugs = selected.map((product) => product.slug);
  const candidates = catalogue.filter(
    (product) => !selectedSlugs.includes(product.slug)
  );
  return (
    <main className="mx-auto max-w-6xl space-y-8 px-4 py-12">
      <div className="space-y-3">
        <Link href="/colecciones" className="text-sm underline">
          Volver al catálogo
        </Link>
        <h1 className="font-serif text-4xl">Comparar anillos</h1>
        <p>
          Revisá hasta tres fichas. Un dato por confirmar requiere verificación;
          las imágenes ilustrativas no acreditan materiales ni piedras.
        </p>
      </div>
      {requested.length > selected.length ? (
        <p role="status">
          Algunas fichas ya no están disponibles. Elegí otra opción del
          catálogo.
        </p>
      ) : null}
      <ProductComparison products={selected} />
      {selected.length < COMPARISON_LIMIT ? (
        <section aria-labelledby="comparison-add">
          <h2 id="comparison-add" className="mb-4 text-lg font-semibold">
            Agregar a la comparación ({selected.length}/3)
          </h2>
          {candidates.length ? (
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {candidates.map((product) => (
                <li key={product.slug}>
                  <Link
                    className="block rounded border p-4 hover:underline"
                    href={comparisonUrl([...selectedSlugs, product.slug])}
                  >
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay otras fichas publicadas para agregar.</p>
          )}
        </section>
      ) : (
        <p>La comparación está completa. Quitá una ficha para agregar otra.</p>
      )}
    </main>
  );
}
