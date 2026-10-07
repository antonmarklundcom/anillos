"use client";

import Link from "next/link";
import { useState } from "react";
import {
  filterCoverageGroups,
  type KeywordCoverageGroup,
  type KeywordCoverageStatus,
} from "@/content/keyword-coverage";

export const COVERAGE_STATUS_LABELS: Record<KeywordCoverageStatus, string> = {
  "content-mapped": "Contenido asignado",
  held: "Requiere decisión",
  excluded: "Fuera de alcance",
};

export function SeoCoverageDashboard({ groups }: { groups: readonly KeywordCoverageGroup[] }) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<KeywordCoverageStatus | "all">("all");
  const shown = filterCoverageGroups(groups, { search, status }).sort((a, b) => b.monthlySearches - a.monthlySearches);

  return (
    <section className="mt-8" aria-labelledby="kwp-grupos">
      <h2 id="kwp-grupos" className="text-lg font-semibold">Grupos del Keyword Planner</h2>
      <p className="text-muted-foreground mt-2 text-sm">Una intención coherente usa una página o sección. Las variantes comparten destino; no hace falta una URL por cada frase.</p>
      <div className="mt-4 flex flex-wrap gap-4">
        <label className="grid flex-1 gap-1 text-sm">
          Buscar grupo o destino
          <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} className="border-input bg-background min-w-48 rounded-md border px-3 py-2" />
        </label>
        <label className="grid gap-1 text-sm">
          Estado editorial
          <select value={status} onChange={(event) => setStatus(event.target.value as KeywordCoverageStatus | "all")} className="border-input bg-background rounded-md border px-3 py-2">
            <option value="all">Todos los grupos</option>
            {Object.entries(COVERAGE_STATUS_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
      </div>
      <p className="text-muted-foreground my-4 text-sm" role="status">{shown.length} de {groups.length} grupos · ordenados por volumen del grupo completo.</p>
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full min-w-[720px] text-left text-sm">
          <caption className="text-muted-foreground p-4 text-left">Búsquedas/mes del grupo completo, incluidas sus filas mixtas. No sumes la columna para estimar tráfico de anillos.</caption>
          <thead className="bg-muted/50"><tr><th className="p-3">Grupo</th><th className="p-3 text-right">Búsquedas/mes</th><th className="p-3">Estado y destino</th><th className="p-3">Límite de interpretación</th></tr></thead>
          <tbody>
            {shown.map((group) => (
              <tr key={group.id} className="border-t align-top" data-testid="seo-coverage-row">
                <th scope="row" className="max-w-56 p-3 font-medium">{group.label}</th>
                <td className="p-3 text-right tabular-nums">{group.monthlySearches.toLocaleString("es-PY")}</td>
                <td className="p-3"><p>{COVERAGE_STATUS_LABELS[group.status]}</p>{group.destination ? <Link href={group.destination} className="mt-1 block break-all underline underline-offset-4">{group.destination}</Link> : <span className="text-muted-foreground mt-1 block">Sin página específica</span>}</td>
                <td className="text-muted-foreground max-w-sm p-3 leading-6">{group.scope}</td>
              </tr>
            ))}
            {!shown.length ? <tr><td colSpan={4} className="p-6">No hay grupos que coincidan con estos filtros.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}
