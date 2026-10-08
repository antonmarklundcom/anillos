"use client";
import {
  costTotal,
  supplierPerformanceMetrics,
  type SalesWorkspace,
} from "@/domain/sales-workspace";
import {
  operationsComparisonSheet,
  operationsDay,
  operationsDemandRows,
  operationsMoney,
  operationsQuoteDifferences,
  operationsQuoteText,
} from "./sales-operations-helpers";
import styles from "./sales-operations.module.css";

export function SalesOperationsEvidence({
  tab,
  workspace,
}: {
  tab: string;
  workspace: SalesWorkspace;
}) {
  if (tab === "quoteRevisions")
    return (
      <section className={styles.section}>
        <h3>Copias preservadas y cambios</h3>
        <p className={styles.muted}>
          La aceptación se informa manualmente con fecha y referencia real. Una
          revisión aceptada no se edita ni deshace desde el registro.
        </p>
        {workspace.quoteRevisions.map((r) => {
          const before = workspace.quoteRevisions
            .filter(
              (p) =>
                p.quotationId === r.quotationId &&
                p.revisionNumber < r.revisionNumber
            )
            .sort((a, b) => b.revisionNumber - a.revisionNumber)[0];
          const differences = before
            ? operationsQuoteDifferences(before.snapshot, r.snapshot, workspace)
            : [];
          return (
            <details key={r.id} className={styles.section}>
              <summary>
                Revisión {r.revisionNumber} · {operationsDay(r.createdOn)} ·{" "}
                {r.status === "accepted"
                  ? "Aceptación informada"
                  : r.status === "review_ready"
                    ? "Revisada"
                    : "Borrador"}
              </summary>
              <p>
                {before
                  ? differences.length
                    ? `Cambió: ${differences.join("; ")}`
                    : "Sin cambios comerciales frente a la revisión anterior."
                  : "Primera copia preservada: no hay una revisión anterior para comparar."}
              </p>
              <pre className={styles.preview}>
                {operationsQuoteText(
                  r.snapshot,
                  workspace,
                  "Propuesta preservada"
                )}
              </pre>
              {r.acceptedOn && (
                <p>
                  Aceptación informada el {operationsDay(r.acceptedOn)}. La
                  referencia de evidencia permanece privada.
                </p>
              )}
            </details>
          );
        })}
      </section>
    );
  if (tab === "sampleInspections")
    return (
      <p className={styles.notice}>
        Registrá sólo observaciones de una muestra realmente inspeccionada. Una
        muestra conforme no prueba disponibilidad, composición química ni toda
        la producción. Dimensiones vacías son desconocidas; se admiten decimales
        medidos.
      </p>
    );
  if (tab === "supplierPerformanceRecords")
    return (
      <section className={styles.section}>
        <h3>Resultados observados por proveedor</h3>
        <p className={styles.muted}>
          Los tiempos y proporciones incluyen sólo registros con evidencia y
          fechas correspondientes. No son una calificación ni una promesa de
          próximas entregas.
        </p>
        {supplierPerformanceMetrics(workspace).map((m) => (
          <div className={styles.row} key={m.supplier}>
            <div>
              <strong>{m.supplier}</strong>
              <p>
                {m.records} registros · Respuesta media:{" "}
                {m.averageResponseDays === null
                  ? "Desconocida"
                  : `${m.averageResponseDays.toFixed(1)} días (${m.responseCount} respuestas)`}
              </p>
              <p>
                Recepciones con plazo acordado: {m.receivedCount} · Tardías:{" "}
                {m.lateCount} · Incidencias evaluadas: {m.assessedIssueCount} ·
                Con incidencia: {m.issueCount}
              </p>
            </div>
          </div>
        ))}
      </section>
    );
  if (tab === "demandRequests")
    return (
      <section className={styles.section}>
        <h3>Solicitudes por modelo y medida</h3>
        <p className={styles.muted}>
          Se conservan sistema y unidad originales; no se convierten talles ni
          se infiere demanda desde clics. Entregadas significa resultado manual
          informado, separado de solicitudes.
        </p>
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Modelo</th>
                <th>Sistema / medida</th>
                <th>Unidad</th>
                <th>Solicitadas</th>
                <th>Entregadas informadas</th>
              </tr>
            </thead>
            <tbody>
              {operationsDemandRows(workspace).map((r, i) => (
                <tr key={i}>
                  <td>{r.model}</td>
                  <td>
                    {
                      (
                        {
                          interior_mm: "Interior mm",
                          diameter_mm: "Diámetro mm",
                          supplier_size: "Talle proveedor",
                          unknown: "Desconocido",
                        } as Record<string, string>
                      )[r.system]
                    }{" "}
                    / {r.size ?? "Sin medida"}
                  </td>
                  <td>
                    {r.unit === "pair" ? "Par de dos anillos" : "Un anillo"}
                  </td>
                  <td>{r.requested}</td>
                  <td>{r.fulfilled}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    );
  if (tab === "purchasingDrafts")
    return (
      <section className={styles.section}>
        <h3>Capital y cantidades en evaluación</h3>
        <p className={styles.muted}>
          Costos por unidad × cantidad del plan. No se coloca una compra ni se
          mueve capital o inventario.
        </p>
        {workspace.purchasingDrafts.map((r) => {
          const unitCost = costTotal(r.estimatedCosts);
          const total = unitCost === null ? null : unitCost * r.quantity;
          const capital =
            "availableCapitalPyg" in r
              ? (r.availableCapitalPyg as number | null)
              : null;
          return (
            <div className={styles.row} key={r.id}>
              <div>
                <strong>
                  {workspace.supplierQuotations.find(
                    (s) => s.id === r.supplierQuotationId
                  )?.reference ?? "Referencia pendiente"}
                </strong>
                <p>
                  {r.quantity} {r.unit === "pair" ? "pares" : "anillos"} · Costo
                  del plan: {operationsMoney(total)} · Capital indicado:{" "}
                  {operationsMoney(capital)}
                </p>
                {capital !== null && total !== null && total > capital && (
                  <p role="alert">
                    El plan supera el capital informado. Revisá cantidades o
                    costos antes de decidir.
                  </p>
                )}
                <p>
                  {r.status === "reviewed"
                    ? `Revisión informada: ${operationsDay(r.reviewedOn)}`
                    : "Borrador pendiente de revisión"}
                </p>
              </div>
            </div>
          );
        })}
      </section>
    );
  return null;
}

export function SalesOperationsComparison({
  comparisonId,
  workspace,
  saved,
  storeName,
  close,
}: {
  comparisonId: string;
  workspace: SalesWorkspace;
  saved: SalesWorkspace;
  storeName: string;
  close: () => void;
}) {
  const comparison = workspace.quoteComparisons.find(
    (c) => c.id === comparisonId
  );
  if (!comparison) return null;
  let sheet: ReturnType<typeof operationsComparisonSheet>;
  try {
    sheet = operationsComparisonSheet(
      comparison.quotationIds,
      workspace,
      storeName
    );
  } catch (e) {
    return (
      <section className={styles.notice} role="alert">
        {e instanceof Error ? e.message : "Comparación inválida"}
        <button onClick={close}>Cerrar comparación</button>
      </section>
    );
  }
  const savedComparison =
    JSON.stringify(
      saved.quoteComparisons.find((c) => c.id === comparisonId)
    ) === JSON.stringify(comparison) &&
    comparison.quotationIds.every(
      (id) =>
        JSON.stringify(saved.customerQuotations.find((q) => q.id === id)) ===
        JSON.stringify(workspace.customerQuotations.find((q) => q.id === id))
    );
  const content = (
    <>
      <h1>{sheet.storeName}</h1>
      <h2>Alternativas para revisar y confirmar</h2>
      <div className={styles.comparisonGrid}>
        {sheet.alternatives.map((alternative, i) => (
          <section className={styles.section} key={i}>
            <h3>Alternativa {i + 1}</h3>
            <p>
              Fecha: {operationsDay(alternative.createdOn)} · Validez:{" "}
              {operationsDay(alternative.expiresOn)}
            </p>
            {alternative.lines.map((l, j) => (
              <p key={j}>
                {l.model}: {l.quantity}{" "}
                {l.unit === "pair" ? "par(es) de dos anillos" : "anillo(s)"} ·{" "}
                {operationsMoney(l.unitPricePyg)} por unidad
              </p>
            ))}
            {alternative.services.map((s, j) => (
              <p key={j}>
                {s.name}: {operationsMoney(s.pricePyg)} · {s.terms}
              </p>
            ))}
            <p>
              Entrega: {operationsMoney(alternative.deliveryPyg)} ·{" "}
              {alternative.deliveryConditions}
            </p>
            <p>
              <strong>Total: {operationsMoney(alternative.totalPyg)}</strong>
            </p>
          </section>
        ))}
      </div>
      <p>{sheet.disclaimer}</p>
    </>
  );
  return (
    <>
      <section className={styles.section}>
        <h2>Revisión de alternativas para cliente</h2>
        {!savedComparison && (
          <p className={styles.notice}>
            La comparación o alguna cotización tiene cambios sin guardar. Guardá
            antes de imprimir.
          </p>
        )}
        {content}
        <div className={styles.actions}>
          <button disabled={!savedComparison} onClick={() => window.print()}>
            Imprimir comparación / guardar PDF
          </button>
          <button onClick={close}>Cerrar comparación</button>
        </div>
      </section>
      <article
        className={styles.print}
        data-testid="customer-comparison-print"
        data-sales-print-sheet="comparison"
      >
        {content}
      </article>
    </>
  );
}
