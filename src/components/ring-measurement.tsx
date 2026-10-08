"use client";

import { useId, useState } from "react";

/** Geometric measurement only. Commercial sizes depend on the supplier's scale. */
export function RingMeasurement() {
  const id = useId();
  const [value, setValue] = useState("");
  const [kind, setKind] = useState("diameter");
  const number = /^\d+(?:[.,]\d+)?$/.test(value.trim())
    ? Number(value.replace(",", "."))
    : NaN;
  const valid =
    Number.isFinite(number) &&
    (kind === "diameter"
      ? number >= 10 && number <= 30
      : number >= 30 && number <= 95);
  const converted = valid
    ? kind === "diameter"
      ? number * Math.PI
      : number / Math.PI
    : null;
  return (
    <section className="size-tool" aria-label="Calculadora de medidas">
      <h2>Tu medida, en milímetros</h2>
      <svg
        viewBox="0 0 300 175"
        width="300"
        height="175"
        role="img"
        aria-label="Diagrama sin escala del diámetro interior de un anillo"
      >
        <circle
          cx="150"
          cy="80"
          r="66"
          fill="none"
          stroke="#74766d"
          strokeWidth="15"
        />
        <line
          x1="91.5"
          y1="80"
          x2="208.5"
          y2="80"
          stroke="#343b33"
          strokeWidth="2"
        />
        <path
          d="M99 74L92 80L99 86M201 74L208 80L201 86"
          fill="none"
          stroke="#343b33"
          strokeWidth="2"
        />
        <text x="150" y="170" textAnchor="middle" fill="#343b33" fontSize="13">
          Diámetro interior · diagrama sin escala
        </text>
      </svg>
      <p>
        Medí de borde interior a borde interior, pasando por el centro. No
        incluyas el grosor del metal ni midas este dibujo en la pantalla.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label htmlFor={`${id}-kind`}>
          Tengo la medida de
          <select
            id={`${id}-kind`}
            className="border-border bg-background mt-2 block min-h-11 w-full rounded border px-3"
            value={kind}
            onChange={(event) => setKind(event.target.value)}
          >
            <option value="diameter">Diámetro interior</option>
            <option value="circumference">Circunferencia interior</option>
          </select>
        </label>
        <label htmlFor={`${id}-measure`}>
          Medida en mm
          <input
            id={`${id}-measure`}
            type="text"
            inputMode="decimal"
            className="border-border bg-background mt-2 block min-h-11 w-full rounded border px-3"
            placeholder={kind === "diameter" ? "Ej.: 17,5" : "Ej.: 55"}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            aria-describedby={`${id}-result`}
          />
        </label>
      </div>
      <p id={`${id}-result`} aria-live="polite">
        {converted !== null
          ? `${kind === "diameter" ? "Circunferencia interior aproximada" : "Diámetro interior aproximado"}: ${converted.toLocaleString("es-PY", { maximumFractionDigits: 1 })} mm.`
          : value
            ? "Ingresá una medida válida: diámetro de 10 a 30 mm o circunferencia de 30 a 95 mm."
            : "Ingresá una medida para calcular su relación geométrica."}
      </p>
      <p>
        Esto no determina un talle comercial. Confirmá el ajuste con un anillero
        y la tabla del proveedor. Para un par, medí cada dedo por separado.
      </p>
      <details className="ring-measurement-print mt-6">
        <summary className="cursor-pointer">
          Guía para imprimir y medir un anillo
        </summary>
        <p className="mt-3">
          Imprimí en tamaño real (100 %), sin ajustar a página. Verificá la
          línea de 50 mm con una regla física antes de usar los círculos.
        </p>
        <button
          type="button"
          className="my-3 rounded border px-4 py-2"
          onClick={() => window.print()}
        >
          Imprimir solo la guía
        </button>
        <section
          className="ring-print-guide"
          aria-label="Guía imprimible de medidas"
        >
          <h3>Medición orientativa de un anillo</h3>
          <p>
            Imprimí al 100 %, sin ajustar a página. Esta guía en pantalla no
            tiene escala física.
          </p>
          <h4>1. Comprobá la escala</h4>
          <div
            className="ring-print-calibration"
            aria-label="Línea de calibración de 50 milímetros"
          />
          <p>
            La distancia entre las dos marcas debe medir exactamente 50 mm con
            una regla física. Si no coincide, corregí la impresión y repetí; no
            uses esta hoja.
          </p>
          <h4>2. Compará un anillo que ya te quede bien</h4>
          <p>
            Apoyalo sobre un círculo: el contorno debe coincidir con el borde
            interior, sin incluir el metal. Si queda entre dos, anotá ambas
            medidas y verificá el diámetro con una regla; no elijas un talle
            redondeando.
          </p>
          <div className="ring-print-circles">
            {Array.from({ length: 21 }, (_, index) => 13 + index * 0.5).map(
              (diameter) => (
                <div className="ring-print-circle-cell" key={diameter}>
                  <svg
                    width={`${diameter}mm`}
                    height={`${diameter}mm`}
                    viewBox={`0 0 ${diameter} ${diameter}`}
                    aria-label={`Diámetro interior ${diameter} mm`}
                  >
                    <circle
                      cx={diameter / 2}
                      cy={diameter / 2}
                      r={diameter / 2 - 0.1}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.2"
                    />
                  </svg>
                  <span>{diameter.toLocaleString("es-PY")} mm</span>
                </div>
              )
            )}
          </div>
          <h4>3. Anotá cada medida por separado</h4>
          <p>
            Persona / dedo 1: __________________ Diámetro interior: ______ mm
          </p>
          <p>
            Persona / dedo 2 (para un par): ______________ Diámetro interior:
            ______ mm
          </p>
          <p>
            Repetí cada medición. Es una referencia geométrica: no determina un
            talle comercial ni garantiza el ajuste. El ancho del anillo y las
            variaciones del dedo influyen; confirmá con un anillero y la tabla
            del proveedor antes de elegir.
          </p>
        </section>
      </details>
    </section>
  );
}
