import type { Metadata } from "next";
import { readSalesWorkspaceAction } from "@/app/actions/sales-workspace";
import { SalesOperations } from "@/components/admin/sales-operations";
import { GUIDES } from "@/content/guides";
import { emptySalesWorkspace } from "@/domain/sales-workspace";
import { requireCapabilityPage } from "@/lib/admin-guard";
import { siteOrigin } from "@/lib/site-url";
import { getStoreCategories } from "@/store/catalog";
import { storeName } from "@/store/identity";

export const metadata: Metadata = { title: "Operación de consultas" };
export const dynamic = "force-dynamic";

export default async function SalesOperationsPage() {
  await requireCapabilityPage("usuarios");
  const [result, name, categories] = await Promise.all([
    readSalesWorkspaceAction(),
    storeName(),
    getStoreCategories(),
  ]);
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Operación de consultas
      </h1>
      <p className="text-muted-foreground mt-1 text-sm">
        De la primera consulta al seguimiento: datos reales, decisiones manuales
        y borradores revisados.
      </p>
      <SalesOperations
        initial={
          result.ok
            ? result.snapshot
            : {
                workspace: emptySalesWorkspace(),
                revision: 0,
                migrationRequired: false,
              }
        }
        initialError={result.ok ? undefined : result.error}
        storeName={name}
        origin={siteOrigin()?.origin ?? null}
        categories={categories.map(({ slug, name }) => ({ slug, name }))}
        guides={GUIDES.map(({ slug, title }) => ({ slug, title }))}
      />
    </div>
  );
}
