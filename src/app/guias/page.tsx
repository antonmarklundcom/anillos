import type { Metadata } from "next";
import Link from "next/link";
import { GUIDES } from "@/content/guides";
export const metadata: Metadata = {
  title: "Guías para elegir anillos en Paraguay",
  description:
    "Aprendé sobre talles, plata 925, acero, alianzas para el civil y cuidados. Información clara para elegir con tu presupuesto.",
  alternates: { canonical: "/guias" },
};
export default function GuidesPage() {
  return (
    <main className="store-section">
      <p className="eyebrow">La biblioteca</p>
      <h1 className="article-heading mt-5">Elegí con información.</h1>
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
