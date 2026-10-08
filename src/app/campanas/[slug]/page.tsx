import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { GUIDES } from "@/content/guides";
import { ProductCard } from "@/components/product-card";
import { ProductDescription } from "@/components/product-description";
import { getProductsBySlugs } from "@/db/queries";
import { isConceptProduct } from "@/lib/concept-products";
import { getStoreCategories } from "@/store/catalog";
import { publicCampaign } from "@/store/campaigns";
import { ringMetadata } from "@/store/seo";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const campaign = await publicCampaign(slug);
  return campaign
    ? ringMetadata(campaign, `/campanas/${campaign.slug}`)
    : {
        title: "Selección no disponible",
        robots: { index: false, follow: false },
      };
}

export default async function CampaignPage({ params }: Props) {
  const { slug } = await params;
  const campaign = await publicCampaign(slug);
  if (!campaign) notFound();
  const [products, categories] = await Promise.all([
    getProductsBySlugs(
      campaign.productSlugs.filter((item) => !isConceptProduct(item))
    ),
    getStoreCategories(),
  ]);
  const selectedCategories = categories.filter((category) =>
    campaign.categorySlugs.includes(category.slug)
  );
  const guides = GUIDES.filter((guide) =>
    campaign.guideSlugs.includes(guide.slug)
  );
  return (
    <main className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-20">
      <nav
        aria-label="Ruta de navegación"
        className="text-muted-foreground mb-10 flex flex-wrap gap-2 text-sm"
      >
        <Link href="/">Inicio</Link>
        <span aria-hidden>/</span>
        <Link href="/campanas">Selecciones</Link>
      </nav>
      <header className="border-border mb-12 grid gap-6 border-b pb-10 md:grid-cols-[1.4fr_1fr]">
        <div>
          <p className="text-muted-foreground mb-4 text-xs tracking-[.2em] uppercase">
            Una selección para vos
          </p>
          <h1 className="font-display text-4xl leading-tight sm:text-6xl">
            {campaign.title}
          </h1>
        </div>
        <p className="text-muted-foreground self-end text-lg leading-relaxed">
          {campaign.description}
        </p>
      </header>
      {campaign.body ? (
        <div className="mb-12 max-w-3xl">
          <ProductDescription markdown={campaign.body} />
        </div>
      ) : null}
      {products.length ? (
        <section
          aria-label="Modelos de esta selección"
          className="grid grid-cols-2 gap-x-5 gap-y-10 lg:grid-cols-3"
        >
          {products
            .filter((product) => !isConceptProduct(product.slug))
            .map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
        </section>
      ) : null}
      {selectedCategories.length ? (
        <section className="my-12">
          <h2 className="font-display mb-5 text-2xl">Explorá los estilos</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {selectedCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/categoria/${category.slug}`}
                className="border-border hover:bg-muted rounded-xl border p-6 text-lg"
              >
                {category.name}
                <span aria-hidden className="float-right">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      {guides.length ? (
        <section className="my-12">
          <h2 className="font-display mb-5 text-2xl">Elegí con más claridad</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {guides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guias/${guide.slug}`}
                className="bg-muted rounded-xl p-6"
              >
                <h3 className="mb-2 font-medium">{guide.title}</h3>
                <p className="text-muted-foreground text-sm">
                  {guide.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
      <aside className="border-border bg-muted/40 mt-14 rounded-2xl border p-7 sm:p-10">
        <h2 className="font-display mb-3 text-2xl">
          Encontrá tu próximo anillo
        </h2>
        <p className="text-muted-foreground mb-5 max-w-2xl">
          Contanos tu estilo y tu medida. Consultamos el modelo, precio y
          condiciones antes de cualquier decisión.
        </p>
        <Link
          href="/elegir"
          className="bg-foreground text-background inline-flex rounded-full px-6 py-3 font-medium"
        >
          Preparar mi consulta
        </Link>
      </aside>
    </main>
  );
}
