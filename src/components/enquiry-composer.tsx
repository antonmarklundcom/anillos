"use client";

import { useId, useState } from "react";
import Link from "next/link";
import {
  BUDGET_PREFERENCES,
  EMPTY_ENQUIRY,
  enquiryMessage,
  enquiryWhatsappHref,
  enquiryValidationErrors,
  readEnquiryDraft,
  removeEnquiryDraft,
  saveEnquiryDraft,
  type EnquiryDetails,
  type EnquiryProduct,
} from "@/store/enquiry-draft";

export function EnquiryComposer({
  products,
  whatsappHref,
  draftKey,
}: {
  products: EnquiryProduct[];
  whatsappHref: string | null;
  draftKey: string;
}) {
  const id = useId();
  const [details, setDetails] = useState<EnquiryDetails>({ ...EMPTY_ENQUIRY });
  const [status, setStatus] = useState("");
  const [copyFallback, setCopyFallback] = useState(false);
  const message = enquiryMessage(products, details);
  const errors = enquiryValidationErrors(details);
  const href =
    products.length && !errors.length
      ? enquiryWhatsappHref(whatsappHref, message)
      : null;
  const pair = products.some(
    (p) =>
      p.unit === "pair" ||
      ["alianzas", "alianzas-plata", "alianzas-oro"].includes(p.categorySlug)
  );
  const allConfirmedPairs =
    products.length > 0 && products.every((p) => p.unit === "pair");
  const inputClass =
    "border-border bg-background mt-1 block w-full rounded-md border px-3 py-2 text-base";
  function update(field: keyof EnquiryDetails, value: string) {
    setDetails((current) => ({ ...current, [field]: value }));
    setStatus("");
  }
  function draftAction(action: "save" | "load" | "remove") {
    if (action === "save" && errors.length) {
      setStatus("Revisá los datos señalados antes de guardar.");
      return;
    }
    try {
      const storage = window.localStorage;
      if (action === "save")
        setStatus(
          saveEnquiryDraft(storage, draftKey, details)
            ? "Borrador guardado sólo en este navegador."
            : "No se pudo guardar. Podés copiar la consulta."
        );
      if (action === "load") {
        const saved = readEnquiryDraft(storage, draftKey);
        if (saved) setDetails(saved);
        setStatus(
          saved
            ? "Borrador recuperado. Revisalo antes de enviar."
            : "No hay un borrador disponible."
        );
      }
      if (action === "remove") {
        const removed = removeEnquiryDraft(storage, draftKey);
        if (removed) setDetails({ ...EMPTY_ENQUIRY });
        setStatus(
          removed
            ? "Borrador eliminado."
            : "No se pudo acceder al borrador guardado."
        );
      }
    } catch {
      setStatus(
        "El navegador no permite guardar borradores. Podés copiar la consulta."
      );
    }
  }
  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setStatus("Consulta copiada. Pegala en tu conversación cuando quieras.");
    } catch {
      setCopyFallback(true);
      setStatus("Seleccioná y copiá el texto de la consulta.");
    }
  }
  return (
    <form
      className="mt-5 space-y-4"
      data-testid="enquiry-composer"
      onSubmit={(event) => event.preventDefault()}
    >
      <p className="text-muted-foreground text-sm">
        Todos los datos son opcionales. No pedimos nombre, teléfono ni cuenta.
        Los datos sólo se guardan si elegís guardar el borrador. WhatsApp abre
        un mensaje preparado: vos lo revisás y lo enviás manualmente.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <label htmlFor={`${id}-quantity`} className="text-sm">
          {allConfirmedPairs
            ? "Cantidad de pares deseada por diseño (2 anillos por par)"
            : "Cantidad de piezas deseada por diseño (anillos)"}
          <input
            id={`${id}-quantity`}
            className={inputClass}
            type="number"
            min="1"
            max="20"
            step="1"
            value={details.quantity}
            onChange={(e) => update("quantity", e.target.value)}
          />
        </label>
        <label htmlFor={`${id}-diameter`} className="text-sm">
          Diámetro interior {pair ? "persona 1 " : ""}(mm, si lo sabés)
          <input
            id={`${id}-diameter`}
            className={inputClass}
            inputMode="decimal"
            maxLength={5}
            placeholder="Ej.: 17,5"
            value={details.diameter}
            onChange={(e) => update("diameter", e.target.value)}
          />
        </label>
        {pair && (
          <label htmlFor={`${id}-second`} className="text-sm">
            Diámetro interior persona 2 (mm)
            <input
              id={`${id}-second`}
              className={inputClass}
              inputMode="decimal"
              maxLength={5}
              placeholder="Ej.: 19"
              value={details.secondDiameter}
              onChange={(e) => update("secondDiameter", e.target.value)}
            />
          </label>
        )}
        <label htmlFor={`${id}-city`} className="text-sm">
          Ciudad
          <input
            id={`${id}-city`}
            className={inputClass}
            maxLength={80}
            value={details.city}
            onChange={(e) => update("city", e.target.value)}
          />
        </label>
        <label htmlFor={`${id}-date`} className="text-sm">
          Fecha deseada (sin plazo confirmado)
          <input
            id={`${id}-date`}
            className={inputClass}
            type="date"
            value={details.desiredDate}
            onChange={(e) => update("desiredDate", e.target.value)}
          />
        </label>
        <label htmlFor={`${id}-budget`} className="text-sm">
          Preferencia de presupuesto (no es un precio)
          <select
            id={`${id}-budget`}
            className={inputClass}
            value={details.budget}
            onChange={(e) => update("budget", e.target.value)}
          >
            <option value="">Sin preferencia indicada</option>
            {BUDGET_PREFERENCES.map((preference) => (
              <option key={preference}>{preference}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-muted-foreground text-sm">
        {allConfirmedPairs
          ? "La cantidad indica pares completos de dos anillos por diseño."
          : "La cantidad indica anillos por diseño; su correspondencia con la unidad de venta queda por confirmar en cada modelo."}{" "}
        Si buscás cantidades distintas, indicalas en los detalles del estilo.
      </p>
      {errors.length > 0 && (
        <div role="alert" className="text-sm text-red-700">
          {errors.map((error) => (
            <p key={error}>{error}</p>
          ))}
        </div>
      )}
      <p className="text-muted-foreground text-sm">
        Las medidas son orientativas y deben confirmarse con la escala del
        modelo.{" "}
        <Link className="underline" href="/guias/talles">
          Ver guía de medidas
        </Link>
        .
      </p>
      <label htmlFor={`${id}-notes`} className="block text-sm">
        Qué detalles del estilo te gustan
        <textarea
          id={`${id}-notes`}
          className={inputClass}
          rows={3}
          maxLength={300}
          value={details.notes}
          onChange={(e) => update("notes", e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-3 text-sm">
        <button
          type="button"
          className="underline"
          onClick={() => draftAction("save")}
        >
          Guardar borrador en este navegador
        </button>
        <button
          type="button"
          className="underline"
          onClick={() => draftAction("load")}
        >
          Recuperar borrador
        </button>
        <button
          type="button"
          className="underline"
          onClick={() => draftAction("remove")}
        >
          Eliminar borrador
        </button>
      </div>
      <details>
        <summary className="cursor-pointer text-sm underline">
          Revisar texto de la consulta
        </summary>
        <pre className="bg-muted mt-2 rounded-md p-3 text-sm break-words whitespace-pre-wrap">
          {message}
        </pre>
      </details>
      <div className="flex flex-wrap items-center gap-4">
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="product-enquiry-link"
            data-testid="product-enquiry-brief-link"
          >
            Abrir consulta en WhatsApp <span aria-hidden>↗</span>
          </a>
        )}
        <button
          type="button"
          className="product-enquiry-link"
          disabled={!products.length || errors.length > 0}
          onClick={() => void copy()}
        >
          Copiar consulta
        </button>
      </div>
      {!href && (
        <p className="text-muted-foreground text-sm">
          Podés copiar la consulta y{" "}
          <Link className="underline" href="/como-funciona">
            ver cómo consultar
          </Link>
          .
        </p>
      )}
      {copyFallback && (
        <textarea
          aria-label="Texto para copiar"
          className={inputClass}
          rows={8}
          readOnly
          value={message}
          onFocus={(e) => e.currentTarget.select()}
        />
      )}
      <p role="status" className="text-sm">
        {status}
      </p>
    </form>
  );
}
