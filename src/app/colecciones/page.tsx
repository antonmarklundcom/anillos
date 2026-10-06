import type { Metadata } from "next";
import Link from "next/link";
import { COLLECTIONS } from "@/config/ring-store";
import { EditorialImage } from "@/components/editorial-image";
import { getStoreCategories } from "@/store/catalog";
import { ringMetadata } from "@/store/seo";
const pageSeo = {
  title: "Colecciones de anillos en Paraguay",
  description:
    "Explorá colecciones de anillos en Paraguay por material y significado: acero, plata, oro, promesa, compromiso y alianzas. Compará antes de elegir.",
};
export async function generateMetadata(): Promise<Metadata> {
  return ringMetadata(pageSeo, "/colecciones");
}
export default async function CollectionsPage() {
  const available = new Set(
    (await getStoreCategories()).map((item) => item.slug)
  );
  return (
    <main className="store-section">
      <p className="eyebrow">Tu punto de partida</p>
      <h1 className="article-heading mt-5">Colecciones de anillos</h1>
      <p className="section-intro">
        Empezá por un material o por el momento que querés celebrar. Encontrá
        información sobre diseño, talle y presupuesto en cada colección. Las
        imágenes son ilustrativas y los conceptos no están a la venta.
      </p>
      <div className="collection-grid">
        {COLLECTIONS.filter((item) => available.has(item.slug)).map((item) => (
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
