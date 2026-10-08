"use client";
import { useState } from "react";
import {
  deleteEnquiryRecordsAction,
  exportEnquiryRecordsAction,
  readSalesWorkspaceAuditAction,
  undoSalesWorkspaceAction,
} from "@/app/actions/sales-workspace";
import {
  exportLinkedEnquiry,
  type SalesAuditEntry,
  type SalesWorkspace,
  type SalesWorkspaceSnapshot,
} from "@/domain/sales-workspace";
import styles from "./sales-operations.module.css";

export function SalesOperationsHistory({
  workspace,
  revision,
  blocked,
  onDatabaseChange,
}: {
  workspace: SalesWorkspace;
  revision: number;
  blocked: boolean;
  onDatabaseChange: (snapshot: SalesWorkspaceSnapshot) => void;
}) {
  const [entries, setEntries] = useState<SalesAuditEntry[]>([]);
  const [undoId, setUndoId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [enquiryId, setEnquiryId] = useState("");
  const [financial, setFinancial] = useState<"" | "retain" | "delete">("");
  const [audit, setAudit] = useState<"" | "retain" | "purge">("");
  const [reminders, setReminders] = useState<
    "" | "retain" | "delete_matching_alias"
  >("");
  const [reviewDelete, setReviewDelete] = useState(false);
  const [confirmedPolicy, setConfirmedPolicy] = useState(false);
  const locked = blocked || busy;
  const changeLabels: Record<string, string> = {
    enquiries: "Consultas",
    customerQuotations: "Cotizaciones",
    quoteRevisions: "Revisiones",
    fulfilledSales: "Ventas informadas",
    supplierQuotations: "Referencias del proveedor",
    sampleInspections: "Muestras",
    supplierPerformanceRecords: "Desempeño observado",
    demandRequests: "Demanda",
    purchasingDrafts: "Planes de compra",
    quoteComparisons: "Alternativas",
    aftersalesCases: "Posventa",
    occasionReminders: "Recordatorios",
    productCostProfiles: "Costos",
    serviceOptions: "Servicios",
    campaigns: "Campañas",
    productFaqs: "Preguntas por modelo",
  };
  const linked =
    enquiryId && workspace.enquiries.some((r) => r.id === enquiryId)
      ? exportLinkedEnquiry(workspace, enquiryId)
      : null;
  const counts = linked
    ? {
        Consultas: 1,
        Cotizaciones: linked.customerQuotations.length,
        Revisiones: linked.quoteRevisions.length,
        "Ventas informadas": linked.fulfilledSales.length,
        Posventa: linked.aftersalesCases.length,
        "Demanda registrada": linked.demandRequests.length,
        Comparaciones: linked.quoteComparisons.length,
        "Planes vinculados (se desvinculan)": linked.purchasingDrafts.length,
        "Recordatorios del mismo alias": linked.occasionReminders.length,
      }
    : null;
  async function readHistory() {
    setBusy(true);
    try {
      const result = await readSalesWorkspaceAuditAction();
      if (result.ok) {
        setEntries(result.entries);
        setMessage(
          result.entries.length
            ? "Historial guardado leído; revisá antes de recuperar una copia."
            : "Todavía no hay operaciones auditadas guardadas."
        );
      } else setMessage(result.error);
    } catch {
      setMessage("No se pudo leer el historial.");
    } finally {
      setBusy(false);
    }
  }
  async function undo() {
    if (undoId === null || locked) return;
    setBusy(true);
    try {
      const result = await undoSalesWorkspaceAction({
        revision,
        auditId: undoId,
      });
      if (result.ok) {
        setMessage(
          "Recuperación guardada. Revisá y abrí la versión de la base para verla en pantalla."
        );
        setUndoId(null);
        onDatabaseChange(result.snapshot);
      } else setMessage(`${result.error} Tu pantalla no fue reemplazada.`);
    } catch {
      setMessage(
        "No se pudo recuperar la copia. Tu pantalla permanece intacta."
      );
    } finally {
      setBusy(false);
    }
  }
  async function exportConnected() {
    if (!enquiryId || locked) return;
    setBusy(true);
    try {
      const result = await exportEnquiryRecordsAction(enquiryId);
      if (!result.ok) {
        setMessage(result.error);
        return;
      }
      const url = URL.createObjectURL(
        new Blob([JSON.stringify(result.export, null, 2)], {
          type: "application/json",
        })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = "consulta-registros-privados.json";
      a.click();
      URL.revokeObjectURL(url);
      setMessage(
        "Exportación privada de registros guardados preparada. Incluye costos y referencias; nunca la entregues a compradores."
      );
    } catch {
      setMessage("No se pudo exportar. Los registros permanecen intactos.");
    } finally {
      setBusy(false);
    }
  }
  async function removeConnected() {
    if (
      locked ||
      !enquiryId ||
      !financial ||
      !audit ||
      !reminders ||
      !confirmedPolicy
    )
      return;
    setBusy(true);
    try {
      const result = await deleteEnquiryRecordsAction({
        revision,
        enquiryId,
        financialRetention: financial,
        auditRetention: audit,
        reminderRetention: reminders,
      });
      if (result.ok) {
        setMessage(
          "La decisión de eliminación quedó guardada. Revisá y abrí la versión de la base; no se reemplazó tu pantalla automáticamente."
        );
        setReviewDelete(false);
        setConfirmedPolicy(false);
        onDatabaseChange(result.snapshot);
      } else setMessage(`${result.error} No se reemplazó tu pantalla.`);
    } catch {
      setMessage(
        "No se pudo completar la eliminación. Revisá la versión guardada antes de intentar otra vez."
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className={styles.section}>
        <h2>Historial guardado y recuperación</h2>
        <p className={styles.muted}>
          Las acciones operan sobre la revisión {revision} de la base. Si otra
          pantalla guardó después, se rechazan y conservan tu borrador. Las
          revisiones de cotización aceptadas se protegen durante una
          recuperación.
        </p>
        {blocked && (
          <p className={styles.notice}>
            Aplicá o cancelá formularios y guardá el borrador antes de recuperar
            o eliminar datos.
          </p>
        )}
        <button disabled={busy} onClick={readHistory}>
          Leer historial guardado
        </button>
        <div className={styles.list}>
          {entries.map((entry) => (
            <div className={styles.row} key={entry.id}>
              <div>
                <strong>
                  Revisión {entry.revision} ·{" "}
                  {
                    {
                      save: "Guardado",
                      undo: "Recuperación",
                      delete: "Eliminación",
                    }[entry.kind]
                  }
                </strong>
                <p>
                  {new Date(entry.createdAt).toLocaleString("es-PY", {
                    timeZone: "America/Asuncion",
                  })}{" "}
                  ·{" "}
                  {"actorUserId" in entry
                    ? entry.actorUserId === null
                      ? "Actor interno sin usuario asignado"
                      : `Usuario interno ${String(entry.actorUserId)}`
                    : "Actor interno registrado en auditoría"}
                </p>
                {entry.changes.slice(0, 20).map((change, i) => (
                  <p key={i}>
                    {changeLabels[change.collection] ?? "Registro interno"} ·{" "}
                    {change.recordId} ·{" "}
                    {
                      {
                        added: "Agregado",
                        changed: "Modificado",
                        deleted: "Eliminado",
                      }[change.operation]
                    }
                  </p>
                ))}
                {entry.changes.length > 20 && (
                  <p>
                    {entry.changes.length - 20} cambios adicionales en esta
                    revisión.
                  </p>
                )}
              </div>
              <button
                disabled={locked || !entry.canUndo}
                onClick={() => setUndoId(entry.id)}
              >
                Revisar recuperación {entry.revision}
              </button>
            </div>
          ))}
        </div>
        {undoId !== null && (
          <div className={styles.notice}>
            <p>
              Recuperarás la copia auditada seleccionada. La recuperación
              requiere la misma revisión de base que estás viendo y queda
              auditada; una versión más reciente de otra pantalla bloquea la
              recuperación.
            </p>
            <div className={styles.actions}>
              <button disabled={locked} onClick={undo}>
                Confirmar recuperación con revisión actual
              </button>
              <button onClick={() => setUndoId(null)}>
                Cancelar recuperación
              </button>
            </div>
          </div>
        )}
      </section>
      <section className={styles.section}>
        <h2>Exportación y eliminación de registros vinculados</h2>
        <p className={styles.muted}>
          Elegí tu política real para esta consulta. La herramienta no establece
          un plazo legal ni borra por calendario. Los documentos financieros y
          el historial pueden requerir conservación según tu operación.
        </p>
        <label className={styles.field}>
          Consulta guardada
          <select
            value={enquiryId}
            onChange={(e) => {
              setEnquiryId(e.target.value);
              setReviewDelete(false);
              setConfirmedPolicy(false);
            }}
          >
            <option value="">Elegí un alias</option>
            {workspace.enquiries.map((r) => (
              <option value={r.id} key={r.id}>
                {r.alias}
              </option>
            ))}
          </select>
        </label>
        {counts && (
          <div className={styles.summary}>
            {Object.entries(counts).map(([label, count]) => (
              <p key={label}>
                {label}: <strong>{count}</strong>
              </p>
            ))}
          </div>
        )}
        <button disabled={locked || !linked} onClick={exportConnected}>
          Exportar registros vinculados privados
        </button>
        <div className={styles.form}>
          <label className={styles.field}>
            Decisión real sobre registros comerciales
            <select
              value={financial}
              onChange={(e) => {
                setFinancial(e.target.value as typeof financial);
                setReviewDelete(false);
                setConfirmedPolicy(false);
              }}
            >
              <option value="">Elegí expresamente</option>
              <option value="retain">
                Conservar cotizaciones, revisiones, ventas y posventa,
                desvinculadas
              </option>
              <option value="delete">
                Eliminar también cotizaciones, revisiones, ventas y posventa
                vinculadas
              </option>
            </select>
          </label>
          <label className={styles.field}>
            Decisión sobre copias anteriores del historial
            <select
              value={audit}
              onChange={(e) => {
                setAudit(e.target.value as typeof audit);
                setReviewDelete(false);
                setConfirmedPolicy(false);
              }}
            >
              <option value="">Elegí expresamente</option>
              <option value="retain">
                Conservar sólo metadatos del historial; invalidar copias de
                recuperación
              </option>
              <option value="purge">
                Purgar todo el historial anterior del espacio
              </option>
            </select>
          </label>
          <label className={styles.field}>
            Decisión sobre recordatorios del mismo alias
            <select
              value={reminders}
              onChange={(e) => {
                setReminders(e.target.value as typeof reminders);
                setReviewDelete(false);
                setConfirmedPolicy(false);
              }}
            >
              <option value="">Elegí expresamente</option>
              <option value="retain">
                Conservar recordatorios consentidos
              </option>
              <option value="delete_matching_alias">
                Eliminar recordatorios del mismo alias
              </option>
            </select>
          </label>
        </div>
        <button
          disabled={locked || !linked || !financial || !audit || !reminders}
          onClick={() => setReviewDelete(true)}
        >
          Revisar eliminación y conservación
        </button>
        {reviewDelete && (
          <div className={styles.notice}>
            <h3>Decisión que se guardará</h3>
            <p>
              Se elimina la consulta, su demanda y sus comparaciones; los planes
              de compra se desvinculan. Las referencias de proveedores y sus
              inspecciones se conservan.
            </p>
            <p>
              {financial === "retain"
                ? "Se conservan cotizaciones, revisiones, ventas y posventa relacionadas, con sus alias y evidencia existentes."
                : "También se eliminan cotizaciones, revisiones, ventas informadas y posventa vinculadas, incluyendo aceptación preservada."}
            </p>
            <p>
              {reminders === "retain"
                ? "Se conservan los recordatorios del alias."
                : "Se eliminan los recordatorios del mismo alias."}
            </p>
            <p>
              {audit === "purge"
                ? "Se purga el historial anterior de todo el espacio. Esa información ya no estará disponible para deshacer."
                : "Se conservan sólo los metadatos del historial. Las copias anteriores de recuperación se invalidan para impedir que reaparezcan datos eliminados."}
            </p>
            <label>
              <input
                type="checkbox"
                checked={confirmedPolicy}
                onChange={(e) => setConfirmedPolicy(e.target.checked)}
              />{" "}
              Revisé los conteos y mi política actual de conservación; confirmo
              esta decisión concreta.
            </label>
            <div className={styles.actions}>
              <button
                disabled={locked || !confirmedPolicy}
                onClick={removeConnected}
              >
                Confirmar eliminación en la base
              </button>
              <button
                onClick={() => {
                  setReviewDelete(false);
                  setConfirmedPolicy(false);
                }}
              >
                Cancelar eliminación
              </button>
            </div>
          </div>
        )}
      </section>
      {message && (
        <p role="status" className={styles.status}>
          {message}
        </p>
      )}
    </>
  );
}
