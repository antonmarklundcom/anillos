import Link from "next/link";
import {
  sectionId,
  type ContentSection,
  type RingContent,
} from "@/content/ring-content";

function visibleLinks(
  links: RingContent["related"],
  available?: ReadonlySet<string>
) {
  return links.filter((link) => {
    const category = /^\/categoria\/([^/#?]+)/.exec(link.href)?.[1];
    return !category || !available || available.has(category);
  });
}

export function RingContents({
  sections,
  measurement = false,
}: {
  sections: ContentSection[];
  measurement?: boolean;
}) {
  return (
    <nav className="guide-contents" aria-label="Contenido de la página">
      <p className="mb-4 font-medium">Encontrá lo que necesitás</p>
      <ol>
        {sections.map((section, index) => (
          <li key={section.title}>
            <a href={`#${sectionId(section, index)}`}>{section.title}</a>
          </li>
        ))}
        {measurement ? (
          <li>
            <a href="#medida">Calculá tu medida</a>
          </li>
        ) : null}
        <li>
          <a href="#preguntas">Preguntas frecuentes</a>
        </li>
      </ol>
    </nav>
  );
}

export function RingSections({
  sections,
  available,
}: {
  sections: ContentSection[];
  available?: ReadonlySet<string>;
}) {
  return sections.map((section, index) => (
    <section key={section.title} id={sectionId(section, index)}>
      <h2>{section.title}</h2>
      {section.paragraphs.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
      {section.bullets?.length ? (
        <ul>
          {section.bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      ) : null}
      {section.links?.length ? (
        <p className="content-links">
          {visibleLinks(section.links, available).map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label} →
            </Link>
          ))}
        </p>
      ) : null}
    </section>
  ));
}

export function RingQuestions({ faq }: Pick<RingContent, "faq">) {
  return faq.length ? (
    <section id="preguntas" className="ring-faq">
      <h2>Preguntas frecuentes</h2>
      {faq.map((item) => (
        <details key={item.question}>
          <summary>{item.question}</summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </section>
  ) : null;
}

export function RingRelated({
  related,
  sources,
  available,
}: Pick<RingContent, "related" | "sources"> & {
  available?: ReadonlySet<string>;
}) {
  return (
    <>
      {sources?.length ? (
        <aside className="mt-10 border-t pt-6">
          <h2>Fuentes y lecturas recomendadas</h2>
          <ul>
            {sources.map((source) => (
              <li key={source.url}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title} ↗
                </a>
              </li>
            ))}
          </ul>
        </aside>
      ) : null}
      <aside className="mt-10 border-t pt-6">
        <h2>Seguí con tu elección</h2>
        <ul>
          {visibleLinks(related, available).map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label} →</Link>
            </li>
          ))}
        </ul>
        <p>
          <Link href="/contacto">Prepará tu consulta</Link> con el material, la
          medida y el presupuesto que querés comparar.
        </p>
      </aside>
    </>
  );
}
