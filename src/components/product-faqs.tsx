export type PublicProductFaq = { question: string; answer: string };
export function ProductFaqs({ faqs }: { faqs: readonly PublicProductFaq[] }) {
  if (!faqs.length) return null;
  return (
    <section className="mt-12 grid gap-4" aria-labelledby="product-faq-title">
      <h2 id="product-faq-title" className="text-xl font-semibold">
        Preguntas sobre este modelo
      </h2>
      <p className="text-muted-foreground text-sm">
        Respuestas confirmadas para esta pieza. Para consultar tu caso, revisá
        la ficha y escribinos.
      </p>
      <div className="grid gap-3">
        {faqs.map((faq, index) => (
          <details key={index} className="rounded-lg border p-4">
            <summary className="cursor-pointer font-medium">
              {faq.question}
            </summary>
            <p className="mt-3 text-sm whitespace-pre-line">{faq.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
