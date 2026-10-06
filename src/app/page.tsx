import type { Metadata } from "next";
import Link from "next/link";
import { isConceptProduct } from "@/lib/concept-products";
import { CinematicHero } from "@/components/cinematic-hero";
import { EditorialImage } from "@/components/editorial-image";
import { ProductCard } from "@/components/product-card";
import { COLLECTIONS } from "@/config/ring-store";
import { HOME_HERO_VARIANT } from "@/config/home-hero";
import { getCatalog } from "@/db/queries";
import { contactoPublico } from "@/lib/comercio";
import { storeName } from "@/store/identity";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";
import { siteOrigin } from "@/lib/site-url";
import { GUIDES } from "@/content/guides";
import { getStoreCategories } from "@/store/catalog";
import { getStoreSettings } from "@/domain/store-settings";
import { TIENDA } from "@/config/tienda";
import { ringMetadata } from "@/store/seo";

export const revalidate = 300;
type HomePageProps = {
  searchParams: Promise<{ hero?: string }>;
};

export async function generateMetadata({
  searchParams,
}: HomePageProps): Promise<Metadata> {
  const { hero } = await searchParams;
  const { marca } = await getStoreSettings();
  const title = marca.seoTitulo ?? TIENDA.titulo;
  return {
    ...(await ringMetadata(
      { title, description: marca.seoDescripcion ?? TIENDA.descripcion },
      "/"
    )),
    title: { absolute: title },
    ...(hero ? { robots: { index: false, follow: true } } : {}),
  };
}
export default async function HomePage({ searchParams }: HomePageProps) {
  const { hero } = await searchParams;
  const heroVariant =
    hero === "rings" || hero === "portrait" ? hero : HOME_HERO_VARIANT;
  const [products, contact, name, categories] = await Promise.all([
    getCatalog({ limit: 8 }).catch(() => []),
    contactoPublico(),
    storeName(),
    getStoreCategories(),
  ]);
  const available = new Set(categories.map((item) => item.slug));
  const conceptsOnly =
    products.length > 0 &&
    products.every((product) => isConceptProduct(product.slug));
  const organization = organizationJsonLd({
    origin: siteOrigin(),
    name,
    telephone: contact.whatsapp,
    email: contact.email,
    sameAs: contact.redes.map((item) => item.url),
  });
  return (
    <main>
      {organization ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organization) }}
        />
      ) : null}
      <CinematicHero variant={heroVariant} />
      <div className="store-values">
        <span>Acero y plata en primer plano</span>
        <span>Una unidad o un par, siempre claro</span>
        <span>Elegí con información</span>
      </div>
      <section id="colecciones" className="store-section scroll-mt-40">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Un anillo para cada momento</p>
            <h2>
              Anillos por material <em>y significado.</em>
            </h2>
          </div>
          <Link href="/colecciones" className="text-link">
            Todas las colecciones ↗
          </Link>
        </div>
        <p className="section-intro">
          Compará anillos de acero, plata y oro, o empezá por el momento:
          promesa, compromiso y boda. Cada colección reúne información para
          elegir con una medida y un presupuesto claros.
        </p>
        <div className="collection-grid">
          {COLLECTIONS.filter((item) => available.has(item.slug)).map(
            (collection, index) => (
              <Link
                key={collection.slug}
                href={`/categoria/${collection.slug}`}
                className="collection-card"
              >
                <EditorialImage
                  asset={collection.image}
                  alt={`Concepto para ${collection.name.toLowerCase()}`}
                />
                <div className="collection-title">
                  <span className="eyebrow">
                    {String(index + 1).padStart(2, "0")} / {collection.eyebrow}
                  </span>
                  <h3>{collection.name} ↗</h3>
                  <p>
                    {collection.unit === "pair"
                      ? "Ideas para un par de dos anillos"
                      : "Ideas para una pieza individual"}
                  </p>
                </div>
              </Link>
            )
          )}
        </div>
      </section>
      <section className="store-section store-prose">
        <h2>Cómo elegir un anillo en Paraguay</h2>
        <p>
          Empezá por lo que querés simbolizar y por el dedo donde usarás la
          pieza. Un{" "}
          {available.has("promesa") ? (
            <Link href="/categoria/promesa">anillo de promesa</Link>
          ) : (
            "anillo de promesa"
          )}{" "}
          puede expresar un acuerdo personal; un{" "}
          {available.has("compromiso") ? (
            <Link href="/categoria/compromiso">anillo de compromiso</Link>
          ) : (
            "anillo de compromiso"
          )}{" "}
          suele acompañar una propuesta, y las{" "}
          {available.has("alianzas") ? (
            <Link href="/categoria/alianzas">alianzas de boda</Link>
          ) : (
            "alianzas de boda"
          )}{" "}
          representan una elección de pareja.
        </p>
        <p>
          Después, compará{" "}
          <Link href="/guias/materiales">materiales y recubrimientos</Link>,{" "}
          <Link href="/guias/talles">medidas del dedo</Link> y el contenido de
          una propuesta. Si buscás dos anillos, confirmá dos talles y si el
          precio corresponde a una pieza o al par. La fotografía por sí sola no
          acredita composición ni disponibilidad.
        </p>
        <p>
          Las colecciones y guías ayudan a preparar esa elección. Para comprar
          necesitás un modelo real con especificaciones, precio final en
          guaraníes y condiciones de entrega confirmadas.
        </p>
      </section>
      <section className="story-band">
        <div className="store-section story-layout">
          <EditorialImage
            asset="pair"
            alt="Concepto de dos alianzas plateadas sobre lino"
          />
          <div>
            <p className="eyebrow">Para ustedes dos</p>
            <h2>
              La promesa es suya.
              <br />
              <em>El presupuesto también.</em>
            </h2>
            <p>
              Una boda civil puede empezar por lo esencial: dos anillos cómodos,
              dos talles bien medidos y una elección que les haga sentido.
            </p>
            <Link href="/guias/alianzas-boda-civil" className="store-button">
              Cómo elegir sus alianzas ↗
            </Link>
            {available.has("compromiso") ? (
              <Link
                href="/categoria/compromiso"
                className="text-link mt-5 block"
              >
                También: ideas de compromiso →
              </Link>
            ) : null}
          </div>
        </div>
      </section>
      {products.length ? (
        <section className="store-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">
                {conceptsOnly
                  ? "El catálogo en preparación"
                  : "Miralos de cerca"}
              </p>
              <h2>
                {conceptsOnly ? (
                  <>
                    Ideas para <em>imaginar.</em>
                  </>
                ) : (
                  <>
                    Diseños para <em>elegir.</em>
                  </>
                )}
              </h2>
            </div>
          </div>
          <p className="section-intro">
            {conceptsOnly
              ? "Estos diseños son conceptos ilustrativos. Todavía no tienen inventario, precios ni acuerdos de entrega confirmados."
              : "Compará los diseños y revisá la ficha de cada modelo: material, medidas y condiciones. Las referencias identificadas como conceptos son ilustrativas y no están a la venta."}
          </p>
          <Link href="/colecciones#disenos" className="text-link mb-7 block">
            Explorá todos los diseños ↗
          </Link>
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}
      <section className="store-section story-layout">
        <div>
          <p className="eyebrow">Elegí a tu manera</p>
          <h2>
            Un detalle que
            <br />
            <em>se sienta tuyo.</em>
          </h2>
          <p>
            Una pieza sencilla puede acompañarte todos los días. Antes de
            decidir, pensá en tu rutina, en cómo te gusta vestir y en lo que
            querés gastar.
          </p>
          <Link href="/guias/anillos-economicos" className="text-link">
            Encontrá tu punto de partida ↗
          </Link>
        </div>
        <EditorialImage
          asset="ring-on-hand-mobile"
          alt="Una mujer paraguaya adulta con un anillo plateado en el dedo"
        />
      </section>
      <section className="store-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Elegir mejor empieza por entender</p>
            <h2>
              Menos dudas.
              <br />
              <em>Más vos.</em>
            </h2>
          </div>
          <Link href="/guias" className="text-link">
            La biblioteca de guías ↗
          </Link>
        </div>
        <div className="guide-grid">
          {GUIDES.slice(0, 3).map((guide, index) => (
            <Link
              href={`/guias/${guide.slug}`}
              key={guide.slug}
              className="guide-card"
            >
              <span className="eyebrow">GUÍA 0{index + 1}</span>
              <h3>{guide.title}</h3>
              <p>{guide.description}</p>
              <span className="text-link">Leé la guía →</span>
            </Link>
          ))}
        </div>
      </section>
      <section className="store-section launch-note">
        <p className="eyebrow">Estamos preparando el catálogo</p>
        <h2>Primero, información clara.</h2>
        <p>
          Las imágenes son ilustrativas. Publicaremos condiciones de compra
          cuando podamos confirmar cada producto, su proveedor y la entrega.
          Mientras tanto, podés explorar materiales, estilos y talles.
        </p>
        <Link href="/contacto" className="text-link">
          Consultas y próximos pasos →
        </Link>
      </section>
    </main>
  );
}
