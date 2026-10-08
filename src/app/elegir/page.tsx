import Link from "next/link";
import { RingFinder } from "@/components/ring-finder";
import { GUIDES } from "@/content/guides";
import { getStoreCategories } from "@/store/catalog";
import { ringMetadata } from "@/store/seo";

// Interactive page follows the existing per-request CSP nonce contract.
export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return ringMetadata(
    {
      title: "Encontrá tu anillo: estilo, ocasión y medidas",
      description:
        "Elegí un punto de partida para buscar anillos, comparar fichas y preparar tu consulta con medidas y presupuesto.",
    },
    "/elegir"
  );
}
export default async function ChooseRingPage() {
  const categories = await getStoreCategories();
  return (
    <main className="store-section">
      <Link href="/colecciones" className="text-link">
        Volver a las colecciones
      </Link>
      <p className="eyebrow mt-8">Una elección más fácil</p>
      <h1 className="article-heading">Encontrá tu punto de partida.</h1>
      <p className="section-intro mt-5">
        Dos preguntas para ordenar tu búsqueda. Después, elegí las fichas que te
        interesan y prepará una consulta concreta.
      </p>
      <RingFinder
        categories={categories.map(({ slug, name }) => ({ slug, name }))}
        guidePaths={GUIDES.map((guide) => guide.slug)}
      />
    </main>
  );
}
