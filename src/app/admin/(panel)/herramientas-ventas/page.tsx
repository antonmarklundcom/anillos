import type { Metadata } from "next";

import { SalesWorkbench } from "@/components/admin/sales-workbench";
import { requireCapabilityPage } from "@/lib/admin-guard";
import { siteOrigin } from "@/lib/site-url";
import { getStoreCategories } from "@/store/catalog";
import { storeName } from "@/store/identity";

export const metadata: Metadata = { title: "Herramientas de ventas" };
export const dynamic = "force-dynamic";

export default async function SalesWorkbenchPage() {
  // The existing owner-only capability also gives staff a useful redirect.
  const actor = await requireCapabilityPage("usuarios");
  const [name, categories] = await Promise.all([
    storeName(),
    getStoreCategories(),
  ]);
  const origin = siteOrigin()?.origin ?? null;
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Herramientas de ventas
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        Organizá consultas y evaluá cuánto puede aportar una venta, con tus
        propios datos.
      </p>
      <SalesWorkbench
        ownerId={actor.userId}
        marketing={{
          storeName: name,
          origin,
          categories: categories.map(({ slug, name }) => ({ slug, name })),
        }}
      />
    </div>
  );
}
