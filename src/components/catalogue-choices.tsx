import Link from "next/link";
import { CATALOGUE_CHOICES } from "@/content/catalogue-choices";

export function CatalogueChoices({ slug }: { slug: string }) {
  const choices = CATALOGUE_CHOICES[slug];
  if (!choices) return null;
  return (
    <section className="catalogue-choices" aria-labelledby="choices-heading">
      <div className="catalogue-choices-heading">
        <p className="eyebrow">Encontrá tu punto de partida</p>
        <h2 id="choices-heading">Dos formas de mirar esta colección</h2>
        <p>
          Compará el diseño. La ficha de una pieza real deberá confirmar sus
          materiales, medidas y condiciones.
        </p>
      </div>
      <div className="catalogue-choice-grid">
        {choices.map((choice, index) => (
          <article className="catalogue-choice" key={choice.title}>
            <span className="catalogue-choice-number" aria-hidden>
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{choice.title}</h3>
            <p>{choice.detail}</p>
            <p className="catalogue-choice-check">
              <span>Antes de elegir</span>
              {choice.check}
            </p>
            <Link href={`/guias/${choice.guide}`}>
              Ver la guía <span aria-hidden>↗</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
