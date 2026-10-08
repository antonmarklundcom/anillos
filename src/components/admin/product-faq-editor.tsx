"use client";

import type { SalesWorkspace } from "@/domain/sales-workspace";

type ProductFaq = SalesWorkspace["productFaqs"][number];
export function ProductFaqEditor({
  faqs,
  onChange,
}: {
  faqs: ProductFaq[];
  onChange: (faqs: ProductFaq[]) => void;
}) {
  const update = (id: string, patch: Partial<ProductFaq>) =>
    onChange(
      faqs.map((faq) =>
        faq.id === id
          ? {
              ...faq,
              ...patch,
              ...(Object.keys(patch).some((key) => key !== "published")
                ? { published: false }
                : {}),
            }
          : faq
      )
    );
  return (
    <section
      className="grid gap-4 rounded-xl border p-4"
      aria-labelledby="product-faq-editor-title"
    >
      <h2 id="product-faq-editor-title" className="text-lg font-semibold">
        Preguntas recibidas sobre un modelo
      </h2>
      <p className="text-muted-foreground text-sm">
        Registrá preguntas reales y respuestas respaldadas para ese producto
        exacto. La fuente queda privada. La ficha pública muestra solo pregunta
        y respuesta. Las ilustraciones con slug concepto-* no admiten estas
        respuestas como hechos comerciales.
      </p>
      <p className="text-sm">
        Editar el modelo, texto, evidencia o fecha retira la publicación hasta
        que vuelvas a confirmarla. Guardá el espacio de ventas para aplicar los
        cambios.
      </p>
      {faqs.map((faq, index) => (
        <fieldset key={faq.id} className="grid gap-3 rounded-lg border p-4">
          <legend className="px-1 text-sm">Pregunta {index + 1}</legend>
          <label className="grid gap-1 text-sm">
            Slug del producto exacto
            <input
              className="rounded border p-2"
              value={faq.productSlug}
              maxLength={160}
              onChange={(event) =>
                update(faq.id, { productSlug: event.target.value })
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            Pregunta recibida
            <input
              className="rounded border p-2"
              value={faq.question}
              maxLength={300}
              onChange={(event) =>
                update(faq.id, { question: event.target.value })
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            Respuesta confirmada
            <textarea
              className="min-h-24 rounded border p-2"
              value={faq.answer}
              maxLength={2000}
              onChange={(event) =>
                update(faq.id, { answer: event.target.value })
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            Evidencia privada (URL HTTPS)
            <input
              className="rounded border p-2"
              type="url"
              value={faq.evidenceUrl}
              maxLength={2000}
              placeholder="https://"
              onChange={(event) =>
                update(faq.id, { evidenceUrl: event.target.value })
              }
            />
          </label>
          <label className="grid gap-1 text-sm">
            Fecha de confirmación de la respuesta
            <input
              className="rounded border p-2"
              type="date"
              value={faq.confirmedAt ? faq.confirmedAt.slice(0, 10) : ""}
              onChange={(event) =>
                update(faq.id, {
                  confirmedAt: event.target.value
                    ? `${event.target.value}T00:00:00.000Z`
                    : "",
                })
              }
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={faq.published}
              disabled={faq.productSlug.toLowerCase().startsWith("concepto-")}
              onChange={(event) =>
                update(faq.id, { published: event.target.checked })
              }
            />
            Confirmé que es una pregunta real, que la evidencia corresponde a
            este modelo y que la respuesta sigue vigente. Publicar al guardar.
          </label>
          <p className="text-muted-foreground text-xs">
            No incluyas nombres, teléfonos, conversaciones privadas ni promesas
            de stock, precio o entrega sin respaldo.
          </p>
          <button
            type="button"
            className="justify-self-start rounded border px-3 py-2 text-sm"
            onClick={() => onChange(faqs.filter((item) => item.id !== faq.id))}
          >
            Quitar pregunta {index + 1}
          </button>
        </fieldset>
      ))}
      <button
        type="button"
        className="justify-self-start rounded border px-3 py-2 text-sm"
        disabled={faqs.length >= 200}
        onClick={() =>
          onChange([
            ...faqs,
            {
              id: crypto.randomUUID(),
              productSlug: "",
              question: "",
              answer: "",
              evidenceUrl: "",
              confirmedAt: "",
              published: false,
            },
          ])
        }
      >
        Añadir pregunta recibida
      </button>
    </section>
  );
}
