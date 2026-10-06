import Link from "next/link";

export function CatalogUnavailable({ guide }: { guide?: string }) {
  return (
    <div
      className="border-border bg-muted/30 mt-8 rounded-xl border p-8"
      role="status"
    >
      <h2 className="text-lg font-medium">Estamos preparando el catálogo.</h2>
      <p className="text-muted-foreground mt-2 text-sm">
        Las piezas no se pueden consultar en este momento. Mientras tanto, podés
        explorar las colecciones y las guías para elegir tu anillo.
      </p>
      <Link
        className="text-link mt-4 inline-block"
        href={guide ? `/guias/${guide}` : "/colecciones"}
      >
        {guide ? "Leé la guía para elegir →" : "Explorá las colecciones →"}
      </Link>
    </div>
  );
}
