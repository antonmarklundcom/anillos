import type { Metadata } from "next";
import Link from "next/link";
import { CinematicHero } from "@/components/cinematic-hero";
import { EditorialImage } from "@/components/editorial-image";
import { ProductCard } from "@/components/product-card";
import { COLLECTIONS } from "@/config/ring-store";
import { getCatalog } from "@/db/queries";
import { contactoPublico } from "@/lib/comercio";
import { nombreTienda } from "@/lib/marca";
import { jsonLdScript, organizationJsonLd } from "@/lib/seo";
import { siteOrigin } from "@/lib/site-url";
import { GUIDES } from "@/content/guides";

export const revalidate = 300;
export function generateMetadata(): Metadata {
  return { alternates: { canonical: "/" } };
}
export default async function HomePage() {
  const [products, contact, name] = await Promise.all([
    getCatalog({ limit: 8 }).catch(() => []),
    contactoPublico(),
    nombreTienda(),
  ]);
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
      <CinematicHero />
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
              Empezá por lo que <em>va con vos.</em>
            </h2>
          </div>
          <Link href="/colecciones" className="text-link">
            Todas las colecciones ↗
          </Link>
        </div>
        <p className="section-intro">
          El estilo no tiene que empezar por el oro. Descubrí ideas en acero y
          plata, y encontrá tu camino hacia una elección cómoda y accesible.
        </p>
        <div className="collection-grid">
          {COLLECTIONS.slice(0, 4).map((collection, index) => (
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
                  0{index + 1} / {collection.eyebrow}
                </span>
                <h3>{collection.name} ↗</h3>
                <p>
                  {collection.unit === "pair"
                    ? "Ideas para un par de dos anillos"
                    : "Ideas para una pieza individual"}
                </p>
              </div>
            </Link>
          ))}
        </div>
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
            <Link href="/categoria/compromiso" className="text-link mt-5 block">
              También: ideas de compromiso →
            </Link>
          </div>
        </div>
      </section>
      {products.length ? (
        <section className="store-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">El catálogo en preparación</p>
              <h2>
                Ideas para <em>imaginar.</em>
              </h2>
            </div>
          </div>
          <p className="section-intro">
            Estos diseños son conceptos ilustrativos. Todavía no tenemos
            inventario, precios ni acuerdos de entrega confirmados.
          </p>
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
          asset="portrait"
          alt="Modelo adulta ficticia en un editorial de joyería, con un anillo sencillo"
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
