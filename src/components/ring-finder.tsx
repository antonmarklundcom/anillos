"use client";

import Link from "next/link";
import { useState } from "react";
import {
  findRingCollections,
  RING_OCCASIONS,
  type RingOccasion,
  type RingPreference,
} from "@/store/ring-finder";

export function RingFinder({
  categories,
  guidePaths,
}: {
  categories: { slug: string; name: string }[];
  guidePaths: readonly string[];
}) {
  const [occasion, setOccasion] = useState<RingOccasion>("promesa");
  const [preference, setPreference] = useState<RingPreference>("sencillo");
  const [showResult, setShowResult] = useState(false);
  const result = findRingCollections({
    occasion,
    preference,
    available: categories,
  });
  const guide = guidePaths.includes(result.guide) ? result.guide : "talles";
  return (
    <section
      className="ring-finder"
      aria-labelledby="ring-finder-heading"
      data-testid="ring-finder"
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setShowResult(true);
        }}
      >
        <fieldset>
          <legend id="ring-finder-heading">¿Para qué momento?</legend>
          <div className="ring-finder-options">
            {RING_OCCASIONS.map((item) => (
              <label key={item.value}>
                <input
                  type="radio"
                  name="occasion"
                  value={item.value}
                  checked={occasion === item.value}
                  onChange={() => {
                    setOccasion(item.value);
                    setShowResult(false);
                  }}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>¿Por dónde querés empezar?</legend>
          <div className="ring-finder-options">
            {(
              [
                ["sencillo", "Líneas sencillas"],
                ["piedra", "Una piedra protagonista"],
                ["dos", "Dos anillos para una pareja"],
              ] as const
            ).map(([value, label]) => (
              <label key={value}>
                <input
                  type="radio"
                  name="preference"
                  value={value}
                  checked={preference === value}
                  onChange={() => {
                    setPreference(value);
                    setShowResult(false);
                  }}
                />
                {label}
              </label>
            ))}
          </div>
        </fieldset>
        <button type="submit" className="store-button">
          Ver por dónde empezar ↗
        </button>
      </form>
      {showResult ? (
        <div className="ring-finder-result" role="status">
          <h2>Tu punto de partida</h2>
          <p>{result.note}</p>
          {result.collections.length ? (
            <ul>
              {result.collections.map((item) => (
                <li key={item.slug}>
                  <Link href={`/categoria/${item.slug}`}>
                    {item.name} <span aria-hidden>↗</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p>
              Las colecciones se están preparando. Podés empezar por la guía de
              medidas.
            </p>
          )}
          <Link href={`/guias/${guide}`} className="text-link">
            Guía para esta elección ↗
          </Link>
          <p className="text-muted-foreground text-sm">
            Estas sugerencias organizan tu búsqueda. Cada modelo debe confirmar
            material, unidad, precio y disponibilidad.
          </p>
        </div>
      ) : null}
      <aside className="ring-finder-next">
        <h2>Guardá lo que te gusta</h2>
        <p>
          Marcá tus favoritos, compará hasta tres fichas y prepará una sola
          consulta con tus medidas, ciudad y presupuesto deseado.
        </p>
        <div>
          <Link href="/favoritos">Mis favoritos ↗</Link>
          <Link href="/comparar">Comparar fichas ↗</Link>
          <Link href="/guias/talles">Cómo medir ↗</Link>
        </div>
      </aside>
    </section>
  );
}
