/** Editorial planning evidence, not Search Console performance or supplier inventory. */
export type KeywordCoverageStatus = "content-mapped" | "held" | "excluded";
export type KeywordCoverageGroup = {
  id: string;
  label: string;
  monthlySearches: number;
  status: KeywordCoverageStatus;
  destination?: string;
  scope: string;
};

export const KEYWORD_COVERAGE_SOURCE = {
  updatedAt: "2026-10-06T19:36:00Z",
  groupsBuiltAt: "2026-10-06T18:42:00Z",
  country: "Paraguay",
  language: "Español",
  selectedKeywordRows: 12261,
  exportedMonthlySearches: 220440,
  ledgerDocument: "docs/SEO-CONTENT-IMPLEMENTATION.md",
  warning: "Los volúmenes son de grupos completos y mezclan variantes, otras joyas, bodas y marcas. No representan demanda elegible de anillos, visitas previstas ni ventas.",
} as const;

export function coverageSummary(groups: readonly KeywordCoverageGroup[]) {
  return {
    total: groups.length,
    mapped: groups.filter((group) => group.status === "content-mapped").length,
    held: groups.filter((group) => group.status === "held").length,
    excluded: groups.filter((group) => group.status === "excluded").length,
  };
}

export function filterCoverageGroups(
  groups: readonly KeywordCoverageGroup[],
  filters: { search?: string; status?: KeywordCoverageStatus | "all" },
) {
  const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  const search = normalize(filters.search?.trim() ?? "");
  return groups.filter((group) =>
    (!filters.status || filters.status === "all" || group.status === filters.status) &&
    (!search || normalize(`${group.label} ${group.destination ?? ""} ${group.scope}`).includes(search)),
  );
}

export const KEYWORD_COVERAGE_GROUPS: readonly KeywordCoverageGroup[] =
[
  {
    "id": "kwp-001",
    "label": "relojeria",
    "monthlySearches": 19130,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-002",
    "label": "pendientes argollas",
    "monthlySearches": 8990,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-003",
    "label": "pulsera pandora",
    "monthlySearches": 5930,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-004",
    "label": "anillo de la promesa",
    "monthlySearches": 5370,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/promesa"
  },
  {
    "id": "kwp-005",
    "label": "solitarios anillos",
    "monthlySearches": 4140,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/solitarios"
  },
  {
    "id": "kwp-006",
    "label": "pulseras",
    "monthlySearches": 4130,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-007",
    "label": "anillos de compromiso paraguay",
    "monthlySearches": 3670,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/compromiso"
  },
  {
    "id": "kwp-008",
    "label": "añillo de compromiso",
    "monthlySearches": 3600,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/compromiso"
  },
  {
    "id": "kwp-009",
    "label": "en mano va el anillo de compromiso",
    "monthlySearches": 3550,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/compromiso-y-alianzas"
  },
  {
    "id": "kwp-010",
    "label": "argollas plata",
    "monthlySearches": 3220,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-011",
    "label": "argollas de oro",
    "monthlySearches": 3190,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-012",
    "label": "anillos de boda",
    "monthlySearches": 2840,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-013",
    "label": "medidas d anillos",
    "monthlySearches": 2760,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-014",
    "label": "anillos de bod",
    "monthlySearches": 2660,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-015",
    "label": "anillos de oro para mujer",
    "monthlySearches": 2650,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/oro"
  },
  {
    "id": "kwp-016",
    "label": "boda de oro",
    "monthlySearches": 2630,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/bodas-de-oro"
  },
  {
    "id": "kwp-017",
    "label": "anillo de pandora",
    "monthlySearches": 2520,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-018",
    "label": "oro blanco",
    "monthlySearches": 2480,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-019",
    "label": "anillos de plata",
    "monthlySearches": 2460,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/plata-925"
  },
  {
    "id": "kwp-020",
    "label": "anillo antiestres",
    "monthlySearches": 2450,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/estilos-de-anillos"
  },
  {
    "id": "kwp-021",
    "label": "cadenas de oro",
    "monthlySearches": 2440,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-022",
    "label": "vestida de novia",
    "monthlySearches": 2440,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-023",
    "label": "anillos",
    "monthlySearches": 2420,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/colecciones"
  },
  {
    "id": "kwp-024",
    "label": "argollas doradas",
    "monthlySearches": 2400,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-025",
    "label": "como medir el dedo para un anillo",
    "monthlySearches": 2400,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-026",
    "label": "argollas",
    "monthlySearches": 2380,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-027",
    "label": "anillo de oro 18k precio paraguay",
    "monthlySearches": 2350,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/oro"
  },
  {
    "id": "kwp-028",
    "label": "anillo de oro hombre",
    "monthlySearches": 2320,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/hombre"
  },
  {
    "id": "kwp-029",
    "label": "anillas para hombre",
    "monthlySearches": 2280,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/hombre"
  },
  {
    "id": "kwp-030",
    "label": "anillo mason",
    "monthlySearches": 2100,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-031",
    "label": "anillo carreton de oro",
    "monthlySearches": 2070,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/estilos-de-anillos"
  },
  {
    "id": "kwp-032",
    "label": "alianzas",
    "monthlySearches": 1880,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-033",
    "label": "como saber la medida de mi anillo",
    "monthlySearches": 1880,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-034",
    "label": "anillos de oro",
    "monthlySearches": 1820,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/oro"
  },
  {
    "id": "kwp-035",
    "label": "925 en plata",
    "monthlySearches": 1760,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-036",
    "label": "anillos pandora",
    "monthlySearches": 1730,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-037",
    "label": "centros de mesa para boda",
    "monthlySearches": 1690,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-038",
    "label": "joyas",
    "monthlySearches": 1690,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-039",
    "label": "anillo de oro precio paraguay",
    "monthlySearches": 1670,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/oro"
  },
  {
    "id": "kwp-040",
    "label": "joyería asunción",
    "monthlySearches": 1670,
    "status": "held",
    "scope": "Esperar confirmación de un servicio o ubicación real. El volumen local no acredita una sucursal, retiro ni cobertura de entrega."
  },
  {
    "id": "kwp-041",
    "label": "pulseras para hombre",
    "monthlySearches": 1610,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-042",
    "label": "16 mm que talla de anillo es",
    "monthlySearches": 1590,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-043",
    "label": "aros de oro",
    "monthlySearches": 1590,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-044",
    "label": "oro 18 kilates",
    "monthlySearches": 1570,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-045",
    "label": "oro 18k",
    "monthlySearches": 1540,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-046",
    "label": "anillo de hurrem",
    "monthlySearches": 1540,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-047",
    "label": "anillo de boda",
    "monthlySearches": 1460,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-048",
    "label": "como medir talla anillo en casa",
    "monthlySearches": 1430,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-049",
    "label": "joyeria solitario",
    "monthlySearches": 1390,
    "status": "held",
    "scope": "Revisión manual del significado y encaje comercial pendiente; sin página específica propuesta."
  },
  {
    "id": "kwp-050",
    "label": "plata 925 precio paraguay",
    "monthlySearches": 1390,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/plata-925"
  },
  {
    "id": "kwp-051",
    "label": "anillo de oro mujer barato",
    "monthlySearches": 1370,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-economicos"
  },
  {
    "id": "kwp-052",
    "label": "joyas de plata",
    "monthlySearches": 1360,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-053",
    "label": "cadenas de plata",
    "monthlySearches": 1350,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-054",
    "label": "collar para hombre",
    "monthlySearches": 1320,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-055",
    "label": "boda",
    "monthlySearches": 1310,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/alianzas-boda-civil"
  },
  {
    "id": "kwp-056",
    "label": "anillo de diamante",
    "monthlySearches": 1300,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-para-anillos"
  },
  {
    "id": "kwp-057",
    "label": "amatista piedra precio",
    "monthlySearches": 1300,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-para-anillos"
  },
  {
    "id": "kwp-058",
    "label": "anillo de hombre plata",
    "monthlySearches": 1300,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/hombre"
  },
  {
    "id": "kwp-059",
    "label": "talle anillo",
    "monthlySearches": 1280,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-060",
    "label": "anillo de compromiso precio paraguay",
    "monthlySearches": 1260,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/compromiso"
  },
  {
    "id": "kwp-061",
    "label": "cadena de 18 kilates de oro precio",
    "monthlySearches": 1260,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-062",
    "label": "anillos de pareja",
    "monthlySearches": 1250,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-063",
    "label": "anillo de boda barato",
    "monthlySearches": 1240,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-economicos"
  },
  {
    "id": "kwp-064",
    "label": "aretes",
    "monthlySearches": 1210,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-065",
    "label": "cadenas de oro para mujer",
    "monthlySearches": 1210,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-066",
    "label": "anillo oro rosa",
    "monthlySearches": 1190,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/oro"
  },
  {
    "id": "kwp-067",
    "label": "alianza de oro baratas",
    "monthlySearches": 1170,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-economicos"
  },
  {
    "id": "kwp-068",
    "label": "anillo de esmeralda",
    "monthlySearches": 1160,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-069",
    "label": "pendientes",
    "monthlySearches": 1150,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-070",
    "label": "brazaletes",
    "monthlySearches": 1140,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-071",
    "label": "anillo de plata precio paraguay",
    "monthlySearches": 1120,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/plata-925"
  },
  {
    "id": "kwp-072",
    "label": "alianzas de plata",
    "monthlySearches": 1100,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas-plata"
  },
  {
    "id": "kwp-073",
    "label": "anillos de oro para hombre",
    "monthlySearches": 1070,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/hombre"
  },
  {
    "id": "kwp-074",
    "label": "anillos con piedras",
    "monthlySearches": 1070,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-para-anillos"
  },
  {
    "id": "kwp-075",
    "label": "anillos personalizados paraguay",
    "monthlySearches": 1070,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-personalizados"
  },
  {
    "id": "kwp-076",
    "label": "anillo bañado en plata",
    "monthlySearches": 1070,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-077",
    "label": "anillo de plata 925",
    "monthlySearches": 1070,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/plata-925"
  },
  {
    "id": "kwp-078",
    "label": "oro 24 kilates precio",
    "monthlySearches": 1060,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-079",
    "label": "925 es plata",
    "monthlySearches": 1030,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-080",
    "label": "anillo de zafiro",
    "monthlySearches": 1010,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-081",
    "label": "collares para hombres",
    "monthlySearches": 980,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-082",
    "label": "argollas de acero quirurgico",
    "monthlySearches": 950,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/acero"
  },
  {
    "id": "kwp-083",
    "label": "anillo de compromiso para hombre",
    "monthlySearches": 940,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/compromiso"
  },
  {
    "id": "kwp-084",
    "label": "decoración para casamiento",
    "monthlySearches": 910,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-085",
    "label": "alianzas de boda",
    "monthlySearches": 910,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-086",
    "label": "anillo tiffany",
    "monthlySearches": 890,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-087",
    "label": "decoración para boda civil sencilla en casa con globos",
    "monthlySearches": 890,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-088",
    "label": "argollas de bodas",
    "monthlySearches": 880,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-089",
    "label": "basilica de san miguel boda",
    "monthlySearches": 860,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-090",
    "label": "anillo de oro con rubí",
    "monthlySearches": 860,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-091",
    "label": "anillo corte marquesa",
    "monthlySearches": 840,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-para-anillos"
  },
  {
    "id": "kwp-092",
    "label": "anillos con diamante",
    "monthlySearches": 810,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-para-anillos"
  },
  {
    "id": "kwp-093",
    "label": "anillos de tungsteno",
    "monthlySearches": 790,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-094",
    "label": "anillo de compromiso mujer",
    "monthlySearches": 780,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/compromiso"
  },
  {
    "id": "kwp-095",
    "label": "matrimonio",
    "monthlySearches": 780,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/alianzas-boda-civil"
  },
  {
    "id": "kwp-096",
    "label": "anillo de corazon",
    "monthlySearches": 750,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/estilos-de-anillos"
  },
  {
    "id": "kwp-097",
    "label": "aretes para hombre",
    "monthlySearches": 720,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-098",
    "label": "pendientes acero inoxidable",
    "monthlySearches": 720,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-099",
    "label": "joyas pandora",
    "monthlySearches": 700,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-100",
    "label": "churumbela",
    "monthlySearches": 700,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/estilos-de-anillos"
  },
  {
    "id": "kwp-101",
    "label": "anillo bulgari",
    "monthlySearches": 670,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-102",
    "label": "collar de perlas",
    "monthlySearches": 660,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-103",
    "label": "invitaciones de boda",
    "monthlySearches": 640,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-104",
    "label": "anillo circonita negra",
    "monthlySearches": 640,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-105",
    "label": "piedras preciosas verdes",
    "monthlySearches": 630,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-106",
    "label": "anillo de promesa pandora",
    "monthlySearches": 600,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-107",
    "label": "casamiento civil",
    "monthlySearches": 590,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/alianzas-boda-civil"
  },
  {
    "id": "kwp-108",
    "label": "contrato de matrimonio",
    "monthlySearches": 570,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-109",
    "label": "3 anillos de compromiso",
    "monthlySearches": 560,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/estilos-de-anillos"
  },
  {
    "id": "kwp-110",
    "label": "anillo de graduacion abogado",
    "monthlySearches": 560,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-111",
    "label": "colgantes",
    "monthlySearches": 560,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-112",
    "label": "anillo 0.9 quilates",
    "monthlySearches": 560,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-para-anillos"
  },
  {
    "id": "kwp-113",
    "label": "anillos de compromiso cartier",
    "monthlySearches": 550,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-114",
    "label": "joyerias en luque paraguay",
    "monthlySearches": 550,
    "status": "held",
    "scope": "Esperar confirmación de un servicio o ubicación real. El volumen local no acredita una sucursal, retiro ni cobertura de entrega."
  },
  {
    "id": "kwp-115",
    "label": "cómo limpiar anillos de plata",
    "monthlySearches": 540,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/cuidados"
  },
  {
    "id": "kwp-116",
    "label": "relojes de oro para hombre",
    "monthlySearches": 540,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-117",
    "label": "kilates de oro",
    "monthlySearches": 540,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-118",
    "label": "anillo cartier",
    "monthlySearches": 540,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-119",
    "label": "alianzas con grabado",
    "monthlySearches": 530,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-personalizados"
  },
  {
    "id": "kwp-120",
    "label": "alejandrita anillo",
    "monthlySearches": 530,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-121",
    "label": "anillos de compromiso sencillos",
    "monthlySearches": 520,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/compromiso"
  },
  {
    "id": "kwp-122",
    "label": "pulsera ojo turco",
    "monthlySearches": 500,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-123",
    "label": "numeros de anillo para mujer",
    "monthlySearches": 480,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-124",
    "label": "joyeria swarovski",
    "monthlySearches": 470,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-125",
    "label": "anillo de sello",
    "monthlySearches": 470,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/estilos-de-anillos"
  },
  {
    "id": "kwp-126",
    "label": "cadena de plata gruesa",
    "monthlySearches": 440,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-127",
    "label": "anillo de meñique",
    "monthlySearches": 400,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/talles"
  },
  {
    "id": "kwp-128",
    "label": "anillo agata musgosa",
    "monthlySearches": 350,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-129",
    "label": "joyero",
    "monthlySearches": 350,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-130",
    "label": "aguamarina piedra precio",
    "monthlySearches": 350,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-131",
    "label": "dije de oro",
    "monthlySearches": 330,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-132",
    "label": "anillo de san benito",
    "monthlySearches": 330,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-133",
    "label": "solitario oro hombre el corte inglés",
    "monthlySearches": 330,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-134",
    "label": "collar de flores",
    "monthlySearches": 320,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-135",
    "label": "anillo de serpiente",
    "monthlySearches": 300,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-136",
    "label": "alianza 18k",
    "monthlySearches": 290,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas-oro"
  },
  {
    "id": "kwp-137",
    "label": "aros de matrimonio religioso",
    "monthlySearches": 280,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-138",
    "label": "anillo atlante",
    "monthlySearches": 280,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-139",
    "label": "collar de mariposa",
    "monthlySearches": 270,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-140",
    "label": "anillo con piedra topacio",
    "monthlySearches": 260,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-141",
    "label": "anillo con onix mujer",
    "monthlySearches": 250,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-142",
    "label": "anillo calavera",
    "monthlySearches": 240,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-143",
    "label": "porta anillos para boda",
    "monthlySearches": 230,
    "status": "held",
    "scope": "Accesorio porta anillos: confirmar surtido y condiciones antes de crear una página comercial."
  },
  {
    "id": "kwp-144",
    "label": "anillo rosario",
    "monthlySearches": 230,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-145",
    "label": "plata esterlina 925",
    "monthlySearches": 230,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-146",
    "label": "pulsera de trebol",
    "monthlySearches": 220,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-147",
    "label": "arreglos para boda civil",
    "monthlySearches": 220,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-148",
    "label": "argolla versace",
    "monthlySearches": 210,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-149",
    "label": "agatha anillos",
    "monthlySearches": 210,
    "status": "excluded",
    "scope": "Marcas o fandom excluidos como objetivo. Las frases genéricas de anillos se asignan a su familia existente; no se crean páginas para estas marcas."
  },
  {
    "id": "kwp-150",
    "label": "porta alianzas de boda",
    "monthlySearches": 210,
    "status": "held",
    "scope": "Accesorio porta anillos: confirmar surtido y condiciones antes de crear una página comercial."
  },
  {
    "id": "kwp-151",
    "label": "alianza compromiso",
    "monthlySearches": 200,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/compromiso-y-alianzas"
  },
  {
    "id": "kwp-152",
    "label": "anillo con leche materna",
    "monthlySearches": 200,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-153",
    "label": "anillo de salomon",
    "monthlySearches": 200,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/anillos-con-significado"
  },
  {
    "id": "kwp-154",
    "label": "alianza media caña",
    "monthlySearches": 190,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-155",
    "label": "el oro de 18k se oxida",
    "monthlySearches": 180,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/cuidados"
  },
  {
    "id": "kwp-156",
    "label": "anillo de coco",
    "monthlySearches": 160,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-157",
    "label": "alianza boda mujer",
    "monthlySearches": 150,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-158",
    "label": "18k cuanto es",
    "monthlySearches": 140,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-159",
    "label": "anillo compromiso rubi",
    "monthlySearches": 100,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-160",
    "label": "anillo argolla",
    "monthlySearches": 100,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/categoria/alianzas"
  },
  {
    "id": "kwp-161",
    "label": "anillo de eslabones",
    "monthlySearches": 80,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/estilos-de-anillos"
  },
  {
    "id": "kwp-162",
    "label": "anillo de jaspe",
    "monthlySearches": 60,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/piedras-de-color"
  },
  {
    "id": "kwp-163",
    "label": "anillos de mostacilla",
    "monthlySearches": 60,
    "status": "content-mapped",
    "scope": "Sólo subintenciones de anillos sin marcas. El volumen completo del grupo no equivale al volumen elegible; contenido preparado no significa producto disponible ni página indexada.",
    "destination": "/guias/materiales"
  },
  {
    "id": "kwp-164",
    "label": "guardapelo",
    "monthlySearches": 60,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-165",
    "label": "aguamarina collar",
    "monthlySearches": 50,
    "status": "excluded",
    "scope": "No justifica una página propia de anillos. Otras joyas, accesorios o planificación de bodas quedan fuera del catálogo actual; una subintención minoritaria de anillos usa la familia existente."
  },
  {
    "id": "kwp-166",
    "label": "anillo antrax",
    "monthlySearches": 50,
    "status": "held",
    "scope": "Revisión manual del significado y encaje comercial pendiente; sin página específica propuesta."
  }
];
