import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
import { ringMetadata } from "@/store/seo";
const pageSeo = {
  title: "Guías para elegir anillos en Paraguay",
  description:
    "Resolvé dudas sobre medidas, plata 925, oro 18k, promesa, alianzas y cuidados. Guías de anillos en español para elegir con información en Paraguay.",
};
export async function generateMetadata(): Promise<Metadata> {
  return ringMetadata(pageSeo, "/guias");
}
export default function GuidesPage() {
  return (
    <main className="store-section">
      <p className="eyebrow">La biblioteca</p>
      <h1 className="article-heading mt-5">
        Guías para elegir y cuidar tus anillos
      </h1>
      <p className="section-intro">
        Guías para resolver las dudas que una fotografía no responde. Empezá por
        tu talle, compará materiales y definí qué importa para vos.
      </p>
      <div className="guide-grid">
        {GUIDES.map((guide) => (
          <Link
            key={guide.slug}
            href={`/guias/${guide.slug}`}
            className="guide-card"
          >
            <h2 className="!text-2xl">{guide.title}</h2>
            <p>{guide.description}</p>
            <span className="text-link">Leé la guía →</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
// This public route uses the template's per-request CSP nonce.
export const dynamic = "force-dynamic";
