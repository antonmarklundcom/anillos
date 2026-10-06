import type { Metadata } from "next";
import { isConceptProduct } from "@/lib/concept-products";
import Link from "next/link";
import { COLLECTIONS } from "@/config/ring-store";
import { COLLECTION_NAV_LABELS } from "@/config/ring-display";
import { EditorialImage } from "@/components/editorial-image";
import { ProductCard } from "@/components/product-card";
import { CatalogUnavailable } from "@/components/catalog-unavailable";
import { getCatalog } from "@/db/queries";
import { getStoreSettings } from "@/domain/store-settings";
import { getStoreCategories } from "@/store/catalog";
import { ringMetadata } from "@/store/seo";
import { breadcrumbJsonLd, itemListJsonLd, jsonLdScript } from "@/lib/seo";
import { siteOrigin } from "@/lib/site-url";
import { log } from "@/lib/log";

type PageProps = { searchParams: Promise<{ coleccion?: string }> };
const pageSeo = {
  title: "Colecciones de anillos en Paraguay",
  description:
    "Explorá colecciones de anillos en Paraguay: promesa, compromiso, solitarios y alianzas. Compará acero, plata y oro, diseños y medidas antes de elegir.",
};
export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const { coleccion } = await searchParams;
  return {
    ...(await ringMetadata(pageSeo, "/colecciones")),
    ...(coleccion ? { robots: { index: false, follow: true } } : {}),
  };
}

export default async function CollectionsPage({ searchParams }: PageProps) {
  const { coleccion } = await searchParams;
  const [categories, settings] = await Promise.all([
    getStoreCategories(),
    getStoreSettings(),
  ]);
  const available = new Set(categories.map((item) => item.slug));
  const collections = COLLECTIONS.filter((item) => available.has(item.slug));
  const selected = collections.find((item) => item.slug === coleccion);
  const products = await getCatalog({
    categorySlug: selected?.slug,
    limit: 48,
  }).catch((error) => {
    log.error("store.collections.products_unavailable", { error });
    return null;
  });
  const conceptsOnly = Boolean(
    products?.length &&
    products.every((product) => isConceptProduct(product.slug))
  );
  const verified =
    products?.filter((product) => !isConceptProduct(product.slug)) ?? [];
  const structured = [
    breadcrumbJsonLd(siteOrigin(), [
      { name: "Inicio", path: "/" },
      { name: "Colecciones de anillos", path: "/colecciones" },
    ]),
    ...(verified.length
      ? [
          itemListJsonLd(siteOrigin(), verified, {
            name: "Colecciones de anillos",
          }),
        ]
      : []),
  ];
  return (
    <main className="catalogue-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(structured) }}
      />
      <section className="catalogue-intro">
        <div className="catalogue-intro-copy">
          <nav className="catalogue-breadcrumb" aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden> / </span>
            <span>Colecciones</span>
          </nav>
          <p className="eyebrow">Una elección que se siente tuya</p>
          <h1>
            Colecciones de anillos <em>en Paraguay.</em>
          </h1>
          <p className="catalogue-lead">
            Una promesa, un nuevo comienzo o un detalle para todos los días.
            Empezá por el significado; después, encontrá el material y la
            medida.
          </p>
          <div className="catalogue-intro-actions">
            <a href="#disenos" className="store-button">
              Explorá los diseños ↗
            </a>
            <Link href="/guias/talles" className="text-link">
              Encontrá tu medida →
            </Link>
          </div>
          <p className="catalogue-caption">
            Las imágenes son ilustrativas. Los conceptos no están a la venta.
          </p>
        </div>
        <EditorialImage
          asset="ring-on-hand-mobile"
          alt="Imagen ilustrativa de un anillo sobre una mano"
          priority
          className="catalogue-intro-photo"
        />
      </section>
      <section
        className="catalogue-collections"
        aria-labelledby="colecciones-titulo"
      >
        <div className="catalogue-section-heading">
          <div>
            <p className="eyebrow">Elegí tu punto de partida</p>
            <h2 id="colecciones-titulo">
              Por material. <em>Por significado.</em>
            </h2>
          </div>
          <Link href="/guias/compromiso-y-alianzas" className="text-link">
            Promesa, compromiso o boda →
          </Link>
        </div>
        <div className="catalogue-collection-grid">
          {collections.map((item, index) => (
            <Link
              href={`/categoria/${item.slug}`}
              key={item.slug}
              className="catalogue-collection-tile"
            >
              <EditorialImage
                asset={item.image}
                alt={`Referencia ilustrativa para ${item.name.toLowerCase()}`}
              />
              <span className="catalogue-tile-number" aria-hidden>
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{item.name}</h3>
                <span>
                  {item.unit === "pair"
                    ? "Un par de dos anillos"
                    : "Una pieza individual"}{" "}
                  <span aria-hidden>↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
      <section
        id="disenos"
        className="catalogue-designs"
        aria-labelledby="disenos-titulo"
      >
        <div className="catalogue-section-heading">
          <div>
            <p className="eyebrow">Miralos de cerca</p>
            <h2 id="disenos-titulo">
              {selected ? selected.name : "Explorá los diseños"}
            </h2>
          </div>
          <span className="catalogue-count">
            {products?.length
              ? `${products.length} ${conceptsOnly ? "referencias de diseño" : "modelos"}`
              : "Catálogo en preparación"}
          </span>
        </div>
        <nav
          className="catalogue-pills"
          aria-label="Explorar diseños por colección"
        >
          <Link
            href="/colecciones#disenos"
            aria-current={!selected ? "page" : undefined}
          >
            Todas
          </Link>
          {collections.map((item) => (
            <Link
              key={item.slug}
              href={`/colecciones?coleccion=${item.slug}#disenos`}
              aria-current={selected?.slug === item.slug ? "page" : undefined}
            >
              {COLLECTION_NAV_LABELS[item.slug] ?? item.name}
            </Link>
          ))}
        </nav>
        {conceptsOnly ? (
          <p className="catalogue-preview-note">
            Referencias de diseño para preparar tu elección. Usan imágenes
            compartidas: cada pieza real tendrá su ficha, fotografías y
            disponibilidad confirmadas.
          </p>
        ) : null}
        {products === null ? (
          <CatalogUnavailable guide="compromiso-y-alianzas" />
        ) : products.length ? (
          <div
            className="catalogue-products"
            data-testid="catalogue-design-grid"
          >
            {products.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 4}
                showRating={settings.vidriera.estrellasEnTarjetas}
              />
            ))}
          </div>
        ) : (
          <div className="catalogue-empty">
            <p className="eyebrow">La elección empieza por entender</p>
            <h3>Estamos preparando los modelos.</h3>
            <p>
              Explorá las colecciones y las guías mientras confirmamos las
              piezas del catálogo.
            </p>
            <Link
              href={selected ? `/categoria/${selected.slug}` : "/guias"}
              className="text-link"
            >
              {selected
                ? "Cómo elegir en esta colección"
                : "Leé las guías de anillos"}{" "}
              →
            </Link>
          </div>
        )}
      </section>
      <aside className="catalogue-help" aria-labelledby="ayuda-titulo">
        <div>
          <p className="eyebrow">Antes de elegir</p>
          <h2 id="ayuda-titulo">
            Los detalles <em>hacen la diferencia.</em>
          </h2>
        </div>
        <div className="catalogue-help-links">
          <Link href="/guias/talles">
            <span>01</span>
            <div>
              <h3>El talle correcto</h3>
              <p>Medí el dedo o el interior de un anillo.</p>
            </div>
            <span aria-hidden>↗</span>
          </Link>
          <Link href="/guias/materiales">
            <span>02</span>
            <div>
              <h3>El material, claro</h3>
              <p>Plata 925, oro, acero y recubrimientos.</p>
            </div>
            <span aria-hidden>↗</span>
          </Link>
          <Link href="/guias/alianzas-boda-civil">
            <span>03</span>
            <div>
              <h3>Una pieza o un par</h3>
              <p>Dos anillos necesitan dos medidas.</p>
            </div>
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </aside>
    </main>
  );
}
export const dynamic = "force-dynamic";
