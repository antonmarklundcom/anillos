import { productSeoReadiness, type ProductReadinessInput } from "@/store/product-seo-readiness";

export function ProductSeoChecklist({ product }: { product: ProductReadinessInput }) {
  const review = productSeoReadiness(product);
  const labels = { complete: "Revisado", missing: "Por completar", optional: "Si corresponde", restricted: "Protegido" } as const;
  return (
    <section className="rounded-lg border p-5" aria-labelledby="product-seo-checklist">
      <h2 id="product-seo-checklist" className="font-semibold">Ficha y SEO antes de publicar</h2>
      <p className="text-muted-foreground mt-2 text-sm">{review.complete} puntos completos · {review.missing} por completar. {review.warning}</p>
      {review.concept ? <p className="mt-3 text-sm">Esta entrada es un concepto ilustrativo. Puede servir como referencia, pero no como una pieza real a la venta.</p> : null}
      <ul className="mt-4 space-y-3">
        {review.checks.map((item) => <li key={item.id} className="border-t pt-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{item.label}</span><span>{labels[item.status]}</span></div><p className="text-muted-foreground mt-1 leading-6">{item.detail}</p></li>)}
      </ul>
    </section>
  );
}
