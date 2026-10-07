import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES } from "@/content/guides";
import { breadcrumbJsonLd, editorialDate, jsonLdScript } from "@/lib/seo";
import { siteOrigin } from "@/lib/site-url";
import { RingMeasurement } from "@/components/ring-measurement";
import { getStoreCategories } from "@/store/catalog";
import {
  RingContents,
  RingSections,
  RingQuestions,
  RingRelated,
} from "@/components/ring-content";
import { ringMetadata } from "@/store/seo";
import { storeName } from "@/store/identity";
type Props = { params: Promise<{ slug: string }> };
// Render per request so Next's script nonces match the template's CSP.
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = GUIDES.find((item) => item.slug === slug);
  return guide
    ? ringMetadata(guide, `/guias/${slug}`, "article")
    : { title: "Guía no encontrada", robots: { index: false } };
}
export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = GUIDES.find((item) => item.slug === slug);
  if (!guide) notFound();
  const [categories, name] = await Promise.all([
    getStoreCategories(),
    storeName(),
  ]);
  const available = new Set(categories.map((category) => category.slug));
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
            headline: guide.heading,
            description: guide.description,
            inLanguage: "es-PY",
            author: { "@type": "Organization", name },
            publisher: { "@type": "Organization", name },
            ...(editorialDate(guide.publishedAt)
              ? {
                  datePublished: editorialDate(
                    guide.publishedAt
                  )!.toISOString(),
                }
              : {}),
            ...(editorialDate(guide.reviewedAt)
              ? { dateModified: editorialDate(guide.reviewedAt)!.toISOString() }
              : {}),
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
      <h1 className="article-heading mt-4 max-w-4xl">{guide.heading}</h1>
      {editorialDate(guide.reviewedAt) ? (
        <p className="text-muted-foreground mt-3 text-sm">
          Revisado el{" "}
          {editorialDate(guide.reviewedAt)!.toLocaleDateString("es-PY", {
            timeZone: "UTC",
          })}
        </p>
      ) : null}
      <p className="section-intro">{guide.description}</p>
      <RingContents sections={guide.sections} measurement={slug === "talles"} />
      <article className="store-prose">
        <RingSections sections={guide.sections} available={available} />
        {slug === "talles" ? (
          <>
            <div id="medida">
              <RingMeasurement />
            </div>
            <h2>Tabla de medidas de anillos: diámetro y contorno</h2>
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
                {[14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24].map(
                  (diameter) => (
                    <tr key={diameter}>
                      <td>{diameter} mm</td>
                      <td>
                        {(diameter * Math.PI).toFixed(1).replace(".", ",")} mm
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
            <p>
              No es una tabla de conversión universal. Confirmá la medida con el
              proveedor y su sistema.
            </p>
          </>
        ) : null}
        <RingQuestions faq={guide.faq} />
        <RingRelated
          related={guide.related}
          sources={guide.sources}
          available={available}
        />
      </article>
    </main>
  );
}
