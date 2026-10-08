"use client";

import { X } from "lucide-react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BrandFacet } from "@/db/queries";
import type { CatalogueFacets } from "@/domain/catalogue-facets";
import { t } from "@/i18n/client";
import { PRICE_RANGES } from "@/lib/price-ranges";

const SORT_LABELS: Record<string, () => string> = {
  relevancia: () => t("filtros.orden.relevancia"),
  "precio-asc": () => t("filtros.orden.precioAsc"),
  "precio-desc": () => t("filtros.orden.precioDesc"),
  nuevos: () => t("filtros.orden.nuevos"),
};

const ALL = "__todas__";

/**
 * Los filtros viven en la URL: así el listado sigue siendo un Server
 * Component cacheable y el comprador puede compartir el link filtrado por
 * WhatsApp, que es como se comparte todo acá.
 */
export function CatalogFilters({
  brands,
  facets,
  resultCount,
  hasPrices = true,
}: {
  brands: BrandFacet[];
  facets?: CatalogueFacets;
  resultCount?: number;
  hasPrices?: boolean;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [expanded, setExpanded] = useState(false);

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params.toString());
    if (value === null || value === ALL) next.delete(key);
    else next.set(key, value);
    next.delete("page"); // cambiar un filtro vuelve a la página 1
    router.push(`?${next.toString()}`, { scroll: false });
  };

  const marca = params.get("marca");
  const precio = params.get("precio");

  /*
    Los chips no son un adorno: los `<Select>` de arriba muestran su valor,
    pero en el celular quedan fuera de pantalla apenas se hace scroll, y la
    pregunta "¿por qué veo tan pocos productos?" se contesta mirando arriba de
    la grilla, no volviendo a subir. Cada chip se saca de a uno — "Limpiar
    todo" obliga a rehacer los que sí servían.
  */
  // `orden` no entra: ordenar no achica el resultado, así que un chip con ✕
  // ahí prometería devolver productos que nunca se fueron.
  const activos: Array<{ key: string; label: string }> = [];
  const attributeFilters = [
    {
      key: "material",
      label: "Material verificado",
      options: facets?.material ?? [],
    },
    { key: "piedra", label: "Piedra verificada", options: facets?.stone ?? [] },
    {
      key: "forma",
      label: "Forma de piedra verificada",
      options: facets?.stoneShape ?? [],
    },
    {
      key: "ancho",
      label: "Ancho verificado (mm)",
      options: facets?.widthMm ?? [],
    },
    { key: "unidad", label: "Unidad incluida", options: facets?.unit ?? [] },
  ];
  const facetLabel = (key: string, value: string) =>
    key === "unidad"
      ? value === "pair"
        ? "Par de dos anillos"
        : value === "individual"
          ? "Un anillo"
          : value
      : value;
  for (const filter of attributeFilters) {
    const value = params.get(filter.key);
    if (value)
      activos.push({
        key: filter.key,
        label: `${filter.label}: ${facetLabel(filter.key, value)}`,
      });
  }
  if (params.get("stock")) activos.push({ key: "stock", label: "Con stock" });
  if (marca) activos.push({ key: "marca", label: marca });
  if (precio) {
    const range = PRICE_RANGES.find((item) => item.id === precio);
    if (range) activos.push({ key: "precio", label: range.label });
  }

  return (
    <div className="grid gap-3">
      <button
        type="button"
        className="rounded border px-4 py-3 text-left text-sm sm:hidden"
        aria-expanded={expanded}
        aria-controls="catalogue-filter-controls"
        onClick={() => setExpanded(!expanded)}
      >
        Filtrar y ordenar{activos.length ? ` (${activos.length})` : ""}
      </button>
      <div
        id="catalogue-filter-controls"
        className={`${expanded ? "flex" : "hidden"} flex-wrap items-center gap-2 sm:flex`}
      >
        {attributeFilters.map((filter) =>
          filter.options.length || params.get(filter.key) ? (
            <Select
              key={filter.key}
              value={params.get(filter.key) ?? ALL}
              onValueChange={(value) => update(filter.key, value)}
            >
              <SelectTrigger className="w-[200px]" aria-label={filter.label}>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>{filter.label}: todas</SelectItem>
                {params.get(filter.key) &&
                !filter.options.some(
                  (option) => option.value === params.get(filter.key)
                ) ? (
                  <SelectItem value={params.get(filter.key)!}>
                    {facetLabel(filter.key, params.get(filter.key)!)} (0)
                  </SelectItem>
                ) : null}
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {facetLabel(filter.key, option.value)} ({option.total})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null
        )}
        {facets && (facets.inStock > 0 || params.get("stock")) ? (
          <label className="flex min-h-10 cursor-pointer items-center gap-2 px-2 text-sm">
            <input
              type="checkbox"
              checked={params.get("stock") === "1"}
              onChange={(event) =>
                update("stock", event.target.checked ? "1" : null)
              }
            />
            Con stock ({facets.inStock})
          </label>
        ) : null}
        {brands.length > 0 ? (
          <Select
            value={marca ?? ALL}
            onValueChange={(value) => update("marca", value)}
          >
            <SelectTrigger
              className="w-[200px]"
              aria-label={t("filtros.marca.label")}
            >
              <SelectValue placeholder="Marca" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>{t("filtros.marca.todas")}</SelectItem>
              {brands.map((facet) => (
                <SelectItem key={facet.brand} value={facet.brand}>
                  {/*
                    El conteo va acá y no sólo en el chip: es antes de elegir
                    cuando sirve saber que esa marca tiene un solo producto.
                  */}
                  {t("filtros.marca.conCuenta", {
                    marca: facet.brand,
                    n: facet.total,
                  })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        {hasPrices || precio ? (
          <Select
            value={precio ?? ALL}
            onValueChange={(value) => update("precio", value)}
          >
            <SelectTrigger
              className="w-[200px]"
              aria-label={t("filtros.precio.label")}
            >
              <SelectValue placeholder="Precio" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>
                {t("filtros.precio.cualquiera")}
              </SelectItem>
              {PRICE_RANGES.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null}

        <Select
          value={params.get("orden") ?? "relevancia"}
          onValueChange={(value) =>
            update("orden", value === "relevancia" ? null : value)
          }
        >
          <SelectTrigger
            className="w-[200px]"
            aria-label={t("filtros.orden.label")}
          >
            <SelectValue placeholder="Ordenar" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(SORT_LABELS)
              .filter(
                ([value]) =>
                  hasPrices ||
                  !value.startsWith("precio-") ||
                  value === params.get("orden")
              )
              .map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label()}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {resultCount !== undefined ? (
        <p
          role="status"
          aria-live="polite"
          className="text-muted-foreground text-sm"
        >
          {resultCount} {resultCount === 1 ? "diseño" : "diseños"}
        </p>
      ) : null}

      {activos.length > 0 ? (
        <ul className="flex flex-wrap items-center gap-2">
          {activos.map((filtro) => (
            <li key={filtro.key}>
              <button
                type="button"
                onClick={() => update(filtro.key, null)}
                className="border-border hover:bg-muted flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm"
              >
                {filtro.label}
                <X className="size-3.5" aria-hidden />
                <span className="sr-only">
                  {t("filtros.quitar", { filtro: filtro.label })}
                </span>
              </button>
            </li>
          ))}
          {activos.length > 1 ? (
            <li>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("?", { scroll: false })}
              >
                {t("filtros.limpiarTodo")}
              </Button>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
