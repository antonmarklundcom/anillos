import Link from "next/link";
import { publicCampaigns } from "@/store/campaigns";
import { ringMetadata } from "@/store/seo";

export const dynamic = "force-dynamic";
export async function generateMetadata() {
  return ringMetadata(
    {
      title: "Selecciones de anillos",
      description:
        "Explorá selecciones de estilos y guías para preparar tu consulta de anillos.",
    },
    "/campanas"
  );
}
export default async function CampaignIndexPage() {
  const campaigns = await publicCampaigns();
  return (
    <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <p className="text-muted-foreground mb-4 text-xs tracking-[.2em] uppercase">
        Elegí a tu manera
      </p>
      <h1 className="font-display mb-5 text-4xl sm:text-6xl">
        Selecciones de anillos
      </h1>
      <p className="text-muted-foreground mb-10 max-w-2xl text-lg">
        Estilos y guías para encontrar una pieza que tenga sentido para vos.
      </p>
      {campaigns.length ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {campaigns.map((campaign) => (
            <Link
              className="border-border hover:bg-muted rounded-2xl border p-8"
              href={`/campanas/${campaign.slug}`}
              key={campaign.slug}
            >
              <h2 className="font-display mb-3 text-2xl">{campaign.title}</h2>
              <p className="text-muted-foreground">{campaign.description}</p>
              <span aria-hidden className="mt-6 block">
                ↗
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground">
          Explorá nuestras{" "}
          <Link className="underline" href="/colecciones">
            colecciones
          </Link>{" "}
          o{" "}
          <Link className="underline" href="/elegir">
            prepará tu consulta
          </Link>
          .
        </p>
      )}
    </main>
  );
}
