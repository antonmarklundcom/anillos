import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS } from "@/config/ring-store";
import { EditorialImage } from "@/components/editorial-image";
export const metadata: Metadata = {
  title: "Colecciones de acero, plata y alianzas",
  description:
    "Explorá anillos de acero, plata 925, pares de alianzas y compromiso en Paraguay. Diseños conceptuales e información para elegir.",
  alternates: { canonical: "/colecciones" },
};
export default function CollectionsPage() {
  return (
    <main className="store-section">
      <p className="eyebrow">Tu punto de partida</p>
      <h1 className="article-heading mt-5">Cinco maneras de encontrarlo.</h1>
      <p className="section-intro">
        Acero y plata para empezar; alianzas y compromiso para compartir una
        historia. Todas las imágenes actuales son ilustrativas y los conceptos
        no están a la venta.
      </p>
      <div className="collection-grid">
        {COLLECTIONS.map((item) => (
          <Link
            href={`/categoria/${item.slug}`}
            key={item.slug}
            className="collection-card"
          >
            <EditorialImage
              asset={item.image}
              alt={`Imagen conceptual de ${item.name.toLowerCase()}`}
            />
            <div className="collection-title">
              <p className="eyebrow">{item.eyebrow}</p>
              <h2 className="!text-2xl">{item.name}</h2>
              <p>
                {item.unit === "pair"
                  ? "Un par de dos anillos"
                  : "Una pieza individual"}{" "}
                →
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
// This public route uses the template's per-request CSP nonce.
export const dynamic = "force-dynamic";
