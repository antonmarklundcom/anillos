import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES } from "@/content/guides";
import { breadcrumbJsonLd, jsonLdScript } from "@/lib/seo";
import { siteOrigin } from "@/lib/site-url";
import { RingMeasurement } from "@/components/ring-measurement";
import { getStoreCategories } from "@/store/catalog";
type Props = { params: Promise<{ slug: string }> };
// Render per request so Next's script nonces match the template's CSP.
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((item) => item.slug === slug);
  return guide
    ? {
        title: guide.title,
        description: guide.description,
        alternates: { canonical: `/guias/${slug}` },
        openGraph: {
          title: guide.title,
          description: guide.description,
          type: "article",
        },
      }
    : { title: "Guía no encontrada", robots: { index: false } };
}
export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find((item) => item.slug === slug);
  if (!guide) notFound();
  const available = new Set(
    (await getStoreCategories()).map((category) => category.slug)
  );
  return (
    <main className="store-section">
      <nav
        aria-label="Ruta de navegación"
        className="text-muted-foreground mb-8 text-sm"
      >
        <Link href="/">Inicio</Link> / <Link href="/guias">Guías</Link> /{" "}
        {guide.title}
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd(siteOrigin(), [
              { name: "Inicio", path: "/" },
              { name: "Guías", path: "/guias" },
              { name: guide.title, path: `/guias/${slug}` },
            ])
          ),
        }}
      />
      <p className="eyebrow">Guía de elección</p>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: guide.title,
            description: guide.description,
            inLanguage: "es-PY",
            ...(siteOrigin()
              ? {
                  mainEntityOfPage: new URL(
                    `/guias/${slug}`,
                    siteOrigin()!
                  ).toString(),
                }
              : {}),
          }),
        }}
      />
      <h1 className="article-heading mt-4 max-w-4xl">{guide.title}</h1>
      <p className="section-intro">{guide.description}</p>
      <nav className="guide-contents" aria-label="Contenido de la guía">
        <p className="mb-4 font-medium">En esta guía</p>
        <ol>
          {guide.sections.map((section, index) => (
            <li key={section.title}>
              <a href={`#seccion-${index + 1}`}>{section.title}</a>
            </li>
          ))}
          {slug === "talles" ? (
            <li>
              <a href="#medida">Calculá tu medida</a>
            </li>
          ) : null}
        </ol>
      </nav>
      <article className="store-prose">
        {guide.sections.map((section, index) => (
          <section key={section.title} id={`seccion-${index + 1}`}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </section>
        ))}
        {slug === "talles" ? (
          <>
            <div id="medida">
              <RingMeasurement />
            </div>
            <h2>Ejemplos de diámetro y contorno</h2>
            <table>
              <caption>
                Relación geométrica aproximada, sin talles comerciales
              </caption>
              <thead>
                <tr>
                  <th>Diámetro interior</th>
                  <th>Circunferencia aproximada</th>
                </tr>
              </thead>
              <tbody>
                {[16, 17, 18, 19, 20].map((diameter) => (
                  <tr key={diameter}>
                    <td>{diameter} mm</td>
                    <td>
                      {(diameter * Math.PI).toFixed(1).replace(".", ",")} mm
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              No es una tabla de conversión universal. Confirmá la medida con el
              proveedor y su sistema.
            </p>
          </>
        ) : null}
        {guide.sources?.length ? (
          <aside className="mt-10 border-t pt-6">
            <h2>Para seguir leyendo</h2>
            <ul>
              {guide.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {source.title} ↗
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
        <aside className="mt-10 border-t pt-6">
          <h2>Tu próximo paso</h2>
          <p>
            {available.has(guide.collection) ? (
              <Link href={`/categoria/${guide.collection}`}>
                Explorá la colección relacionada
              </Link>
            ) : (
              <Link href="/colecciones">Explorá las colecciones</Link>
            )}{" "}
            o <Link href="/contacto">conocé cómo preparar una consulta</Link>.
            Las piezas actuales son conceptos ilustrativos y no se venden.
          </p>
          <div className="flex flex-wrap gap-5">
            {GUIDES.filter((item) => item.slug !== slug).map((item) => (
              <Link
                className="text-sm"
                key={item.slug}
                href={`/guias/${item.slug}`}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </aside>
      </article>
    </main>
  );
}
