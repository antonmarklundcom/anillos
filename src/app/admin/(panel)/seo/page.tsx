import type { Metadata } from "next";
import Link from "next/link";
import { SeoCoverageDashboard } from "@/components/admin/seo-coverage-dashboard";
import { CATEGORY_PAGES } from "@/content/category-pages";
import { GUIDES } from "@/content/guides";
import { KEYWORD_COVERAGE_GROUPS, KEYWORD_COVERAGE_SOURCE, coverageSummary } from "@/content/keyword-coverage";
import { requireCapabilityPage } from "@/lib/admin-guard";
import { nombreTienda } from "@/lib/marca";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Cobertura SEO del catálogo",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminSeoPage() {
  await requireCapabilityPage("usuarios");
  const name = await nombreTienda();
  const summary = coverageSummary(KEYWORD_COVERAGE_GROUPS);
  return (
    <div>
      <h1 className="text-xl font-semibold tracking-tight">Cobertura SEO de {name}</h1>
      <p className="text-muted-foreground mt-2 max-w-3xl text-sm leading-6">Mapa editorial del catálogo basado en tu Keyword Planner de Paraguay, en español. Revisá qué intención tiene un destino útil y qué necesita una decisión comercial. Este panel no mide posiciones, indexación ni tráfico en Google.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[[summary.total, "Grupos del export"], [summary.mapped, "Con destino editorial"], [summary.held, "Requieren decisión"], [summary.excluded, "Fuera de alcance"]].map(([count, label]) => <div key={label} className="rounded-lg border p-4"><p className="text-2xl font-semibold tabular-nums">{count}</p><p className="text-muted-foreground mt-1 text-sm">{label}</p></div>)}
      </div>
      <aside className="bg-muted/30 mt-6 rounded-lg border p-5" aria-labelledby="kwp-limites">
        <h2 id="kwp-limites" className="font-semibold">Qué significan estos números</h2>
        <p className="mt-2 text-sm leading-6">{KEYWORD_COVERAGE_SOURCE.selectedKeywordRows.toLocaleString("es-PY")} es la cantidad de filas seleccionadas con al menos 9 búsquedas/mes; no son visitas ni productos. Los {KEYWORD_COVERAGE_SOURCE.exportedMonthlySearches.toLocaleString("es-PY")} de volumen agregado abarcan anillos, otras joyas, relojes, bodas y consultas con marcas.</p>
        <p className="mt-2 text-sm leading-6">{KEYWORD_COVERAGE_SOURCE.warning} Las variantes plegadas se cuentan una sola vez. No se crean páginas para competidores, marcas o personajes.</p>
        <p className="text-muted-foreground mt-2 text-sm">Fuente: Keyword Planner · Paraguay / español · actualizado 06/10/2026, 19:36 UTC. El registro clasifica grupos y subintenciones; no asegura haber depurado cada una de sus frases.</p>
      </aside>
      <section className="mt-6 rounded-lg border p-5" aria-labelledby="seo-proximos-pasos">
        <h2 id="seo-proximos-pasos" className="font-semibold">Del contenido a un catálogo real</h2>
        <p className="mt-2 text-sm leading-6">Hay {Object.keys(CATEGORY_PAGES).length} categorías con contenido y {GUIDES.length} guías. Un destino editorial preparado no acredita stock, servicio de grabado, sucursal, precio ni una pieza disponible. Los conceptos siguen siendo referencias sin compra, fuera del índice y del sitemap.</p>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6">
          <li>Confirmá proveedor, composición, gemas, unidad o par, medidas, condiciones y derechos de las fotos antes de publicar una pieza real.</li>
          <li>Guardá como borrador lo incompleto. Una ficha sólo de consulta puede publicarse cuando su información y canal de consulta sean reales, sin inventar precio o disponibilidad.</li>
          <li>Revisá título, descripción, variantes y fotos de cada modelo. Los datos estructurados y la página deben decir lo mismo.</li>
          <li>Después del lanzamiento, compará rendimiento e indexación en Search Console con este mapa. La cobertura de contenido no garantiza posiciones ni ventas.</li>
        </ol>
        <div className="mt-4 flex flex-wrap gap-4 text-sm"><Link className="underline underline-offset-4" href="/admin/productos">Revisar productos</Link><Link className="underline underline-offset-4" href="/admin/categorias">Revisar categorías</Link><Link className="underline underline-offset-4" href="/guias">Ver guías públicas</Link></div>
      </section>
      <SeoCoverageDashboard groups={KEYWORD_COVERAGE_GROUPS} />
    </div>
  );
}
