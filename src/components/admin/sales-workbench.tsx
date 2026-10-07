"use client";

import { useState, type FormEvent } from "react";

import {
  ENQUIRY_CATEGORIES,
  ENQUIRY_STYLES,
  ENQUIRY_STAGES,
  STAGE_LABELS,
  MAX_ENQUIRIES,
  MAX_LEDGER_BYTES,
  COST_FIELDS,
  blankContribution,
  calculateContribution,
  enquirySummary,
  validateEnquiry,
  readLedger,
  saveLedger,
  removeLedger,
  serializeEnquiries,
  parseEnquiries,
  type ManualEnquiry,
  type ContributionInputs,
  CAMPAIGN_OBJECTIVES,
  CAMPAIGN_OBJECTIVE_LABELS,
  campaignDestinations,
  campaignDraft,
  type CampaignObjective,
} from "@/store/sales-workbench";
import styles from "./sales-workbench.module.css";

function todayPY() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Asuncion",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (name: string) =>
    parts.find((value) => value.type === name)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")}`;
}
const money = (value: number) =>
  `₲ ${new Intl.NumberFormat("es-PY", { maximumFractionDigits: 0 }).format(value)}`;
const dayLabel = (value: string) =>
  value ? value.split("-").reverse().join("/") : "Sin fecha";
const choiceLabel = (value: string) => value.replaceAll("-", " ");

function newEnquiry(rows: ManualEnquiry[]): ManualEnquiry {
  let aliasNumber = 1;
  while (
    rows.some(
      (row) => row.alias === `consulta-${String(aliasNumber).padStart(3, "0")}`
    )
  )
    aliasNumber++;
  return {
    id: "",
    alias: `consulta-${String(aliasNumber).padStart(3, "0")}`,
    category: "sin-definir",
    style: "sin-definir",
    stage: "nueva",
    date: todayPY(),
    followUp: "",
  };
}

type MarketingContext = {
  storeName: string;
  origin: string | null;
  categories: { slug: string; name: string }[];
};

function MarketingDrafts({ context }: { context: MarketingContext }) {
  const [objective, setObjective] =
    useState<CampaignObjective>("explorar-estilos");
  const [destination, setDestination] = useState("/elegir");
  const [status, setStatus] = useState("");
  const [fallback, setFallback] = useState(false);
  const destinations = campaignDestinations(context.categories);
  const draft = campaignDraft({ ...context, objective, destination });
  async function copyDraft() {
    try {
      await navigator.clipboard.writeText(draft.text);
      setStatus(
        "Borrador copiado. Revisalo antes de publicarlo por tu cuenta."
      );
    } catch {
      setFallback(true);
      setStatus("Seleccioná y copiá el borrador manualmente.");
    }
  }
  return (
    <section className={styles.card} aria-labelledby="marketing-drafts-heading">
      <h2 id="marketing-drafts-heading">Borradores para invitar a explorar</h2>
      <p>
        Elegí un objetivo y una página de destino. Estos textos ayudan a llevar
        visitas a una guía, colección o consulta; no publican nada ni miden
        resultados de anuncios.
      </p>
      <div className={styles.fields}>
        <label>
          Objetivo del borrador
          <select
            value={objective}
            onChange={(event) => {
              setObjective(event.target.value as CampaignObjective);
              setStatus("");
            }}
          >
            {CAMPAIGN_OBJECTIVES.map((value) => (
              <option key={value} value={value}>
                {CAMPAIGN_OBJECTIVE_LABELS[value]}
              </option>
            ))}
          </select>
        </label>
        <label>
          Página de destino
          <select
            value={destination}
            onChange={(event) => {
              setDestination(event.target.value);
              setStatus("");
            }}
          >
            {destinations.map(({ path, label }) => (
              <option key={path} value={path}>
                {label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p>
        Revisá el texto y las imágenes que lo acompañarán antes de publicarlo.
        Las ilustraciones requieren identificación como tales. No se guardan
        borradores en esta herramienta.
      </p>
      {!draft.href && (
        <p role="status">
          Falta un origen público válido: este borrador queda sin enlace. No se
          inventa un dominio.
        </p>
      )}
      <pre
        className={styles.draftPreview}
        aria-label="Vista previa del borrador"
      >
        {draft.text}
      </pre>
      <button type="button" onClick={() => void copyDraft()}>
        Copiar borrador
      </button>
      {fallback && (
        <label className={styles.importLabel}>
          Texto para copiar manualmente
          <textarea
            rows={9}
            readOnly
            value={draft.text}
            onFocus={(event) => event.currentTarget.select()}
          />
        </label>
      )}
      {status && <p role="status">{status}</p>}
    </section>
  );
}

export function SalesWorkbench({
  ownerId,
  marketing,
}: {
  ownerId: number;
  marketing?: MarketingContext;
}) {
  const [rows, setRows] = useState<ManualEnquiry[]>([]);
  const [draft, setDraft] = useState<ManualEnquiry>(() => newEnquiry([]));
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<
    "load" | "save" | "clear" | "delete" | "import" | null
  >(null);
  const [importRows, setImportRows] = useState<ManualEnquiry[] | null>(null);
  const [amounts, setAmounts] = useState<ContributionInputs>(blankContribution);
  const summary = enquirySummary(rows, todayPY());
  const calculation = calculateContribution(amounts);

  function reportError(cause: unknown, storage = false) {
    setMessage("");
    setError(
      storage
        ? "No se pudo acceder al registro local. El navegador puede bloquearlo o el archivo guardado puede ser inválido. Tus cambios en pantalla siguen disponibles; podés exportarlos."
        : cause instanceof Error
          ? cause.message
          : "Revisá la consulta."
    );
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      if (!draft.id && rows.length >= MAX_ENQUIRIES)
        throw new Error(`El registro admite hasta ${MAX_ENQUIRIES} consultas.`);
      const entry = validateEnquiry({
        ...draft,
        id: draft.id || crypto.randomUUID(),
      });
      if (rows.some((row) => row.alias === entry.alias && row.id !== entry.id))
        throw new Error("Ese alias ya está en el registro. Elegí otro número.");
      const next = draft.id
        ? rows.map((row) => (row.id === entry.id ? entry : row))
        : [...rows, entry];
      setRows(next);
      setDraft(newEnquiry(next));
      setError("");
      setMessage(
        "Consulta actualizada en pantalla. Para conservarla, guardá en este navegador o exportá."
      );
    } catch (cause) {
      reportError(cause);
    }
  }
  function perform(action: NonNullable<typeof confirmation>) {
    setConfirmation(null);
    try {
      if (action === "import") {
        if (!importRows)
          throw new Error("Elegí un archivo válido antes de importar.");
        setRows(importRows);
        setDraft(newEnquiry(importRows));
        setImportRows(null);
        setMessage(
          "Registro importado en pantalla. No se guardó en el navegador; revisalo antes de guardar."
        );
      } else if (action === "load") {
        const loaded = readLedger(window.localStorage, ownerId);
        setRows(loaded);
        setDraft(newEnquiry(loaded));
        setMessage(`Registro local abierto: ${loaded.length} consultas.`);
      } else if (action === "save") {
        saveLedger(window.localStorage, ownerId, rows);
        setMessage(
          "Registro guardado sólo en este navegador para este dueño. Los costos de la calculadora no se guardan."
        );
      } else if (action === "delete") {
        removeLedger(window.localStorage, ownerId);
        setMessage(
          "Copia guardada eliminada. Las consultas en pantalla siguen disponibles."
        );
      } else {
        setRows([]);
        setDraft(newEnquiry([]));
        setMessage(
          "Registro en pantalla vaciado. La copia guardada no cambió."
        );
      }
      setError("");
    } catch (cause) {
      reportError(
        cause,
        action === "save" || action === "load" || action === "delete"
      );
    }
  }
  async function prepareImport(file: File | undefined) {
    if (!file) return;
    setImportRows(null);
    setConfirmation(null);
    try {
      if (file.size > MAX_LEDGER_BYTES)
        throw new Error("El archivo supera el tamaño permitido.");
      const parsed = parseEnquiries(await file.text());
      setImportRows(parsed);
      setConfirmation("import");
      setError("");
      setMessage("");
    } catch {
      reportError(
        new Error(
          "No se pudo importar. Elegí un JSON exportado por esta herramienta, con hasta 200 consultas válidas y 100 KB."
        )
      );
    }
  }
  function exportJson() {
    try {
      const url = URL.createObjectURL(
        new Blob([serializeEnquiries(rows)], { type: "application/json" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `consultas-manuales-${todayPY()}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      // Give browsers time to start the download before releasing the URL.
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setError("");
      setMessage(
        "Exportación preparada: sólo consultas manuales, sin costos ni datos personales."
      );
    } catch (cause) {
      reportError(cause);
    }
  }
  const confirmations = {
    load: "Abrir la copia guardada reemplaza las consultas en pantalla. Exportá primero si querés conservar los cambios actuales.",
    save: "Guardar reemplaza la copia anterior de este dueño en este navegador. No se sincroniza ni se respalda en la tienda.",
    clear:
      "Vas a vaciar las consultas en pantalla. La copia guardada seguirá en el navegador.",
    delete:
      "Vas a eliminar la copia guardada de este dueño en este navegador. Conservá una exportación si la necesitás.",
    import: `Vas a reemplazar las consultas en pantalla por ${importRows?.length ?? 0} consultas del archivo. Exportá los cambios actuales si querés conservarlos. La copia guardada no cambia.`,
  };
  return (
    <div className={styles.workbench}>
      {marketing && <MarketingDrafts context={marketing} />}
      <section className={styles.card} aria-labelledby="manual-ledger-heading">
        <h2 id="manual-ledger-heading">Seguimiento manual de consultas</h2>
        <p>
          Anotá cada consulta con un alias anónimo. No ingreses nombres,
          teléfonos, correos ni mensajes de clientes. Los estilos y categorías
          son referencias de interés.
        </p>
        <p className={styles.notice}>
          Este registro no recibe clics ni mensajes de WhatsApp automáticamente.
          “Venta” significa que vos informaste un cierre; no acredita un pedido,
          un cobro ni ingresos. No calcula previsiones.
        </p>
        <p className={styles.notice}>
          Empieza vacío en cada visita. Guardar es opcional y sólo usa este
          navegador; no hay sincronización ni respaldo del servidor. Una persona
          con acceso al navegador puede leer la copia, incluso después de cerrar
          sesión. Usá un dispositivo propio y borrá la copia al dejar de usarlo.
        </p>
        <div className={styles.toolbar}>
          <button type="button" onClick={() => setConfirmation("load")}>
            Abrir copia local
          </button>
          <button type="button" onClick={() => setConfirmation("save")}>
            Guardar en este navegador
          </button>
          <button type="button" onClick={exportJson}>
            Exportar JSON
          </button>
          <button type="button" onClick={() => setConfirmation("clear")}>
            Vaciar pantalla
          </button>
          <button type="button" onClick={() => setConfirmation("delete")}>
            Eliminar copia local
          </button>
        </div>
        <label className={styles.importLabel}>
          Importar JSON exportado (máximo 100 KB)
          <input
            type="file"
            accept="application/json,.json"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = "";
              void prepareImport(file);
            }}
          />
        </label>
        {confirmation && (
          <div className={styles.notice} role="alert">
            <p>{confirmations[confirmation]}</p>
            <div className={styles.toolbar}>
              <button type="button" onClick={() => perform(confirmation)}>
                Confirmar
              </button>
              <button type="button" onClick={() => setConfirmation(null)}>
                Volver
              </button>
            </div>
          </div>
        )}
        {message && <p role="status">{message}</p>}
        {error && (
          <p role="alert" className={styles.error}>
            {error}
          </p>
        )}
        <div
          className={styles.metrics}
          aria-label="Recuentos del registro manual"
        >
          <div>
            <strong>{summary.total}</strong>
            <span>Consultas anotadas</span>
          </div>
          <div>
            <strong>{summary.followUpsDue}</strong>
            <span>Seguimientos para hoy o vencidos</span>
          </div>
          {ENQUIRY_STAGES.map((stage) => (
            <div key={stage}>
              <strong>{summary.stages[stage]}</strong>
              <span>{STAGE_LABELS[stage]}</span>
            </div>
          ))}
        </div>
        {rows.length > 0 && (
          <p>
            Interés por categoría (registro manual):{" "}
            {ENQUIRY_CATEGORIES.filter(
              (category) => summary.categories[category] > 0
            )
              .map(
                (category) =>
                  `${choiceLabel(category)}: ${summary.categories[category]}`
              )
              .join(" · ")}
          </p>
        )}
        <form onSubmit={submit} className={styles.form}>
          <h3>{draft.id ? "Editar consulta" : "Anotar consulta"}</h3>
          <div className={styles.fields}>
            <label>
              Alias anónimo
              <input
                value={draft.alias}
                maxLength={12}
                pattern="consulta-[0-9]{1,4}"
                required
                onChange={(event) =>
                  setDraft({ ...draft, alias: event.target.value })
                }
                aria-describedby="alias-help"
              />
            </label>
            <label>
              Categoría de interés
              <select
                value={draft.category}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    category: event.target.value as ManualEnquiry["category"],
                  })
                }
              >
                {ENQUIRY_CATEGORIES.map((value) => (
                  <option key={value} value={value}>
                    {choiceLabel(value)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estilo de interés
              <select
                value={draft.style}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    style: event.target.value as ManualEnquiry["style"],
                  })
                }
              >
                {ENQUIRY_STYLES.map((value) => (
                  <option key={value} value={value}>
                    {choiceLabel(value)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Estado informado
              <select
                value={draft.stage}
                onChange={(event) =>
                  setDraft({
                    ...draft,
                    stage: event.target.value as ManualEnquiry["stage"],
                  })
                }
              >
                {ENQUIRY_STAGES.map((value) => (
                  <option key={value} value={value}>
                    {STAGE_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Fecha de consulta
              <input
                type="date"
                required
                value={draft.date}
                onChange={(event) =>
                  setDraft({ ...draft, date: event.target.value })
                }
              />
            </label>
            <label>
              Próximo seguimiento (opcional)
              <input
                type="date"
                min={draft.date}
                value={draft.followUp}
                onChange={(event) =>
                  setDraft({ ...draft, followUp: event.target.value })
                }
              />
            </label>
          </div>
          <p id="alias-help">
            Formato: consulta-001. Máximo {MAX_ENQUIRIES} consultas. Las fechas
            se muestran como día/mes/año; “hoy” usa la hora de Asunción.
          </p>
          <div className={styles.toolbar}>
            <button type="submit">
              {draft.id ? "Aplicar edición en pantalla" : "Agregar en pantalla"}
            </button>
            {draft.id && (
              <button type="button" onClick={() => setDraft(newEnquiry(rows))}>
                Cancelar edición
              </button>
            )}
          </div>
        </form>
        {rows.length === 0 ? (
          <p>Todavía no anotaste consultas en esta pantalla.</p>
        ) : (
          <ul className={styles.entries}>
            {rows.map((row) => (
              <li key={row.id}>
                <div>
                  <strong>{row.alias}</strong>
                  <p>
                    {choiceLabel(row.category)} · {choiceLabel(row.style)}
                  </p>
                  <p>{STAGE_LABELS[row.stage]}</p>
                  <p>
                    Consulta: {dayLabel(row.date)} · Seguimiento:{" "}
                    {dayLabel(row.followUp)}
                  </p>
                </div>
                <div className={styles.toolbar}>
                  <button
                    type="button"
                    aria-label={`Editar ${row.alias}`}
                    onClick={() => {
                      setDraft(row);
                      setError("");
                    }}
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    aria-label={`Quitar ${row.alias}`}
                    onClick={() => {
                      const next = rows.filter((entry) => entry.id !== row.id);
                      setRows(next);
                      if (draft.id === row.id) setDraft(newEnquiry(next));
                      setMessage(
                        "Consulta quitada en pantalla. La copia guardada no cambió."
                      );
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <section className={styles.card} aria-labelledby="contribution-heading">
        <h2 id="contribution-heading">
          Calculadora de contribución por unidad
        </h2>
        <p>
          Probá un precio de venta con tus costos estimados. Usá la misma unidad
          en todo: un anillo o un par de dos anillos. Los resultados son
          hipotéticos y no cambian precios ni pedidos.
        </p>
        <p className={styles.notice}>
          Todos los montos son guaraníes enteros, sin separadores. Vacío
          significa desconocido: ingresá 0 sólo si confirmaste que ese costo no
          corresponde. No se presupone una tasa de impuestos. Cargá el importe
          variable que corresponde a tu escenario. Los costos y resultados no se
          guardan ni se exportan.
        </p>
        <div className={styles.fields}>
          <label>
            Precio de venta propuesto (₲)
            <input
              inputMode="numeric"
              value={amounts.price}
              onChange={(event) =>
                setAmounts({ ...amounts, price: event.target.value })
              }
            />
          </label>
          {COST_FIELDS.map((field) => (
            <label key={field.key}>
              {field.label} por unidad (₲)
              <input
                inputMode="numeric"
                value={amounts[field.key]}
                onChange={(event) =>
                  setAmounts({ ...amounts, [field.key]: event.target.value })
                }
              />
            </label>
          ))}
          <label>
            Contribución deseada por unidad (opcional, ₲)
            <input
              inputMode="numeric"
              value={amounts.target}
              onChange={(event) =>
                setAmounts({ ...amounts, target: event.target.value })
              }
            />
          </label>
        </div>
        <p>
          Convertí comisiones porcentuales a un importe por unidad para el
          precio ensayado. Al cambiar el precio, revisá comisiones e impuestos:
          el precio derivado supone los mismos costos ingresados.
        </p>
        <div className={styles.results} aria-live="polite">
          {calculation.ready ? (
            <>
              <dl>
                <div>
                  <dt>Costos variables estimados por unidad</dt>
                  <dd>{money(calculation.costs)}</dd>
                </div>
                <div>
                  <dt>Contribución al precio propuesto</dt>
                  <dd>{money(calculation.contribution)}</dd>
                </div>
                <div>
                  <dt>Precio de equilibrio por unidad (contribución 0)</dt>
                  <dd>{money(calculation.breakEven)}</dd>
                </div>
                {calculation.targetPrice !== null && (
                  <div>
                    <dt>
                      Precio para la contribución deseada con estos costos
                    </dt>
                    <dd>{money(calculation.targetPrice)}</dd>
                  </div>
                )}
              </dl>
              <p>
                {calculation.contribution < 0
                  ? "Este escenario no cubre los costos variables ingresados."
                  : "La contribución queda disponible para cubrir costos fijos y, después, utilidad."}
              </p>
            </>
          ) : (
            <p>
              {calculation.error ||
                `Faltan datos para calcular: ${calculation.missing.join(", ")}.`}
            </p>
          )}
        </div>
        <p>
          Contribución = precio propuesto − suma de los costos variables
          ingresados. No es ganancia neta: faltan costos fijos y cualquier gasto
          no incluido. El equilibrio mostrado es por unidad; no estima cuántas
          unidades venderás.
        </p>
        <button type="button" onClick={() => setAmounts(blankContribution())}>
          Limpiar calculadora
        </button>
      </section>
    </div>
  );
}
