import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SalesOperations } from "./sales-operations";
import { SalesOperationsComparison } from "./sales-operations-evidence";
import {
  operationsComparisonSheet,
  operationsCustomerSheet,
  operationsNullableNumber,
  operationsQuoteDifferences,
  operationsDemandRows,
} from "./sales-operations-helpers";
import {
  emptyCosts,
  emptySalesWorkspace,
  type CustomerQuotation,
} from "@/domain/sales-workspace";
import {
  readSalesWorkspaceAction,
  saveSalesWorkspaceAction,
} from "@/app/actions/sales-workspace";

vi.mock("@/app/actions/sales-workspace", () => ({
  readSalesWorkspaceAction: vi.fn(),
  saveSalesWorkspaceAction: vi.fn(),
  readSalesSearchGapsAction: vi.fn(),
  readSalesWorkspaceAuditAction: vi.fn(),
  undoSalesWorkspaceAction: vi.fn(),
  exportEnquiryRecordsAction: vi.fn(),
  deleteEnquiryRecordsAction: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
const initial = () => ({
  workspace: emptySalesWorkspace(),
  revision: 0,
  migrationRequired: false,
});
const renderWorkspace = (value = initial()) =>
  render(
    <SalesOperations
      initial={value}
      storeName="Marca vigente"
      origin="https://tienda.example"
      categories={[]}
      guides={[]}
    />
  );
const quote: CustomerQuotation = {
  id: "quote-1",
  alias: "consulta-private",
  enquiryId: null,
  createdOn: "2026-10-07",
  expiresOn: null,
  lines: [
    {
      id: "line-1",
      supplierQuotationId: null,
      productId: 1,
      productSlug: "modelo-real",
      model: "Modelo real",
      source: "private-source",
      confirmedOn: "2026-10-07",
      unit: "single",
      quantity: 1,
      unitPricePyg: 200000,
    },
  ],
  serviceOptionIds: [],
  servicesSnapshot: [],
  deliveryPyg: 20000,
  deliveryConditions: "Condiciones verificadas",
  deliveryConfirmedOn: "2026-10-07",
  status: "review_ready",
};

describe("owner sales operations", () => {
  it("clears captured customer print and manual content only after accepting a database reload", async () => {
    const value = initial();
    value.workspace.customerQuotations.push(quote);
    vi.mocked(readSalesWorkspaceAction).mockResolvedValue({
      ok: true,
      snapshot: { ...initial(), revision: 2 },
    });
    renderWorkspace(value);
    fireEvent.click(screen.getByRole("button", { name: "Cotizaciones" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar hoja para PDF" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Copiar propuesta manual" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar versión guardada" })
    );
    await screen.findByText("Versión de la base: revisión 2");
    expect(screen.getByTestId("customer-quote-print")).toBeInTheDocument();
    expect(
      screen.getByLabelText("Texto para copiar manualmente")
    ).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", {
        name: "Descartar mi borrador y abrir esta versión",
      })
    );
    expect(
      screen.queryByTestId("customer-quote-print")
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText("Texto para copiar manualmente")
    ).not.toBeInTheDocument();
  });
  it("keeps an unsaved reviewed quote preview but never mounts its native printable sheet", () => {
    const value = initial();
    renderWorkspace(value);
    fireEvent.click(
      screen.getByRole("button", { name: "Respaldo e importación" })
    );
    const imported = emptySalesWorkspace();
    imported.customerQuotations.push(quote);
    fireEvent.change(screen.getByLabelText("O pegá JSON para revisar"), {
      target: { value: JSON.stringify(imported) },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Validar y revisar importación" })
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Confirmar reemplazo del borrador" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Cotizaciones" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar hoja para PDF" })
    );
    expect(
      screen.getByText("Revisión de la hoja para comprador")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Imprimir / guardar como PDF" })
    ).toBeDisabled();
    expect(
      screen.queryByTestId("customer-quote-print")
    ).not.toBeInTheDocument();
    expect(screen.getByTestId("sales-operations")).toHaveAttribute(
      "data-sales-workspace"
    );
  });
  it("discloses FAQ removal and search-counter consent changes before importing", () => {
    const value = initial();
    value.workspace.searchGapCollectionEnabled = true;
    value.workspace.productFaqs.push({
      id: "faq",
      productSlug: "modelo-real",
      question: "Pregunta real",
      answer: "Respuesta verificada",
      evidenceUrl: "https://example.com/evidencia",
      confirmedAt: "2026-10-07T00:00:00Z",
      published: true,
    });
    renderWorkspace(value);
    fireEvent.click(
      screen.getByRole("button", { name: "Respaldo e importación" })
    );
    fireEvent.change(screen.getByLabelText("O pegá JSON para revisar"), {
      target: { value: JSON.stringify(emptySalesWorkspace()) },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Validar y revisar importación" })
    );
    expect(
      screen.getByText("Preguntas por modelo: 1 actuales → 0 importadas")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Preguntas publicadas: 1 actuales → 0 importadas")
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Conteos de búsquedas sin resultados: habilitados → apagados"
      )
    ).toBeInTheDocument();
    expect(saveSalesWorkspaceAction).not.toHaveBeenCalled();
  });
  it("keeps unsaved alternative previews outside the native printable customer sheet", () => {
    const workspace = emptySalesWorkspace();
    workspace.customerQuotations.push(quote, { ...quote, id: "quote-2" });
    workspace.quoteComparisons.push({
      id: "comparison",
      enquiryId: "e",
      quotationIds: [quote.id, "quote-2"],
      createdOn: "2026-10-07",
      criteria: "Criterio privado",
      selectedQuotationId: null,
      decisionNotes: "",
    });
    render(
      <SalesOperationsComparison
        comparisonId="comparison"
        workspace={workspace}
        saved={emptySalesWorkspace()}
        storeName="Marca vigente"
        close={vi.fn()}
      />
    );
    expect(
      screen.getByText("Revisión de alternativas para cliente")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Imprimir comparación / guardar PDF" })
    ).toBeDisabled();
    expect(
      screen.queryByTestId("customer-comparison-print")
    ).not.toBeInTheDocument();
  });
  it("shows server-canonical preserved revisions after saving instead of replaying the submitted draft", async () => {
    const value = initial();
    value.workspace.customerQuotations.push(quote);
    const canonical = structuredClone(value);
    canonical.revision = 1;
    canonical.workspace.quoteRevisions.push({
      id: "auto-old-quote",
      quotationId: quote.id,
      revisionNumber: 1,
      createdOn: "2026-10-07",
      reason: "Copia previa a edición manual",
      status: "review_ready",
      snapshot: structuredClone(quote),
      acceptedOn: null,
      acceptanceEvidence: null,
    });
    vi.mocked(saveSalesWorkspaceAction).mockResolvedValue({
      ok: true,
      revision: 1,
      snapshot: canonical,
    });
    renderWorkspace(value);
    fireEvent.click(screen.getByRole("button", { name: "Guardar en la base" }));
    await screen.findByText(/Guardado en la base con sus copias previas/);
    fireEvent.click(
      screen.getByRole("button", { name: "Revisiones de cotización" })
    );
    expect(screen.getByText(/Revisión 1 · Revisada/)).toBeInTheDocument();
  });
  it("preserves new edits made while waiting for a successful save and requires reviewing the canonical version", async () => {
    let resolveSave!: (
      result: Awaited<ReturnType<typeof saveSalesWorkspaceAction>>
    ) => void;
    vi.mocked(saveSalesWorkspaceAction).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        })
    );
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Guardar en la base" }));
    fireEvent.click(screen.getByRole("button", { name: "Nueva consulta" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar al borrador" })
    );
    resolveSave({
      ok: true,
      revision: 1,
      snapshot: { ...initial(), revision: 1 },
    });
    await screen.findByText(/Hiciste cambios nuevos mientras se guardaba/);
    expect(screen.getByText("consulta-001")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Guardar en la base" })
    ).toBeDisabled();
  });
  it("starts with useful empty states and no synthetic supplier data", () => {
    renderWorkspace();
    expect(
      screen.getByText(/No hay seguimientos pendientes/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Proveedores" }));
    expect(
      screen.getByText(/no hay precios, proveedores ni ventas de ejemplo/)
    ).toBeInTheDocument();
  });
  it("preserves stale-save drafts until explicit discard confirmation", async () => {
    vi.mocked(saveSalesWorkspaceAction).mockResolvedValue({
      ok: false,
      code: "conflict",
      error: "Versión más reciente",
    });
    vi.mocked(readSalesWorkspaceAction).mockResolvedValue({
      ok: true,
      snapshot: { ...initial(), revision: 2 },
    });
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Nueva consulta" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar al borrador" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Guardar en la base" }));
    await screen.findByText(/Otra pantalla guardó una versión más reciente/);
    expect(screen.getByText("consulta-001")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar para recargar o descartar" })
    );
    await screen.findByText("Versión de la base: revisión 2");
    expect(screen.getByText("consulta-001")).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("button", { name: "Conservar mi borrador" })
    );
    expect(screen.getByText("consulta-001")).toBeInTheDocument();
    expect(saveSalesWorkspaceAction).toHaveBeenCalledTimes(1);
  });
  it("keeps unknown costs blank instead of silently inserting zero", () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Proveedores" }));
    fireEvent.click(screen.getByRole("button", { name: "Nuevo registro" }));
    expect(screen.getByLabelText("Compra al proveedor (PYG)")).toHaveValue(
      null
    );
    expect(operationsNullableNumber("")).toBeNull();
    expect(operationsNullableNumber("0")).toBe(0);
    expect(emptyCosts().productPyg).toBeNull();
  });
  it("requires explicit consent and its date before applying occasion reminders", async () => {
    renderWorkspace();
    fireEvent.click(screen.getByRole("button", { name: "Recordatorios" }));
    fireEvent.click(screen.getByRole("button", { name: "Nuevo registro" }));
    fireEvent.change(screen.getByLabelText("Ocasión consentida"), {
      target: { value: "Aniversario" },
    });
    fireEvent.change(screen.getByLabelText("Fecha del recordatorio"), {
      target: { value: "2026-12-07" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar al borrador" })
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Confirmá que recibiste consentimiento explícito"
    );
    fireEvent.click(screen.getByLabelText(/Recibí consentimiento explícito/));
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar al borrador" })
    );
    expect(screen.getByRole("alert")).toHaveTextContent("consentOn");
    fireEvent.change(
      screen.getByLabelText("Consentimiento explícito recibido el"),
      { target: { value: "2026-10-07" } }
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar al borrador" })
    );
    await waitFor(() =>
      expect(screen.queryByRole("form")).not.toBeInTheDocument()
    );
    expect(
      screen.getByText(/Consentimiento: 07\/10\/2026/)
    ).toBeInTheDocument();
    expect(saveSalesWorkspaceAction).not.toHaveBeenCalled();
  });
  it("prints an allowlisted customer sheet without private costs, alias or source", () => {
    const value = initial();
    value.workspace.customerQuotations.push(quote);
    const sheet = operationsCustomerSheet(
      quote,
      value.workspace,
      "Marca vigente"
    );
    expect(JSON.stringify(sheet)).not.toMatch(
      /consulta-private|private-source|supplier|costs|productId/
    );
    renderWorkspace(value);
    fireEvent.click(screen.getByRole("button", { name: "Cotizaciones" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar hoja para PDF" })
    );
    const print = screen.getByTestId("customer-quote-print");
    expect(print).toHaveAttribute("data-sales-print-sheet", "quote");
    expect(print).toHaveTextContent("Marca vigente");
    expect(print).toHaveTextContent("No constituye reserva, pedido ni pago");
    expect(print).not.toHaveTextContent("consulta-private");
    expect(print).not.toHaveTextContent("private-source");
  });
  it("marks only the customer alternative print sheet and excludes private comparison notes", () => {
    const value = initial();
    value.workspace.customerQuotations.push(quote, { ...quote, id: "quote-2" });
    value.workspace.quoteComparisons.push({
      id: "comparison-1",
      enquiryId: "enquiry-1",
      quotationIds: [quote.id, "quote-2"],
      createdOn: "2026-10-07",
      criteria: "private-criteria",
      selectedQuotationId: null,
      decisionNotes: "private-decision",
    });
    render(
      <SalesOperationsComparison
        comparisonId="comparison-1"
        workspace={value.workspace}
        saved={value.workspace}
        storeName="Marca vigente"
        close={vi.fn()}
      />
    );
    const print = screen.getByTestId("customer-comparison-print");
    expect(print).toHaveAttribute("data-sales-print-sheet", "comparison");
    expect(print).toHaveTextContent("Marca vigente");
    expect(print).not.toHaveTextContent("consulta-private");
    expect(print).not.toHaveTextContent("private-source");
    expect(print).not.toHaveTextContent("private-criteria");
    expect(print).not.toHaveTextContent("private-decision");
  });
  it("keeps reviewed service prices when the current service changes or is retired", () => {
    const value = initial();
    value.workspace.serviceOptions.push({
      id: "service-1",
      name: "Empaque cambiado",
      kind: "packaging",
      terms: "Nuevas condiciones",
      pricePyg: 90000,
      confirmedOn: "2026-10-08",
      enabled: false,
    });
    const reviewed = {
      ...quote,
      serviceOptionIds: ["service-1"],
      servicesSnapshot: [
        {
          id: "service-1",
          name: "Empaque confirmado",
          terms: "Condiciones originales",
          pricePyg: 10000,
          confirmedOn: "2026-10-07",
        },
      ],
    };
    const sheet = operationsCustomerSheet(
      reviewed,
      value.workspace,
      "Marca vigente"
    );
    expect(sheet.services).toEqual([
      {
        name: "Empaque confirmado",
        terms: "Condiciones originales",
        pricePyg: 10000,
      },
    ]);
    expect(sheet.totalPyg).toBe(230000);
    expect(JSON.stringify(sheet)).not.toContain("Nuevas condiciones");
    const historicalDraft = operationsCustomerSheet(
      { ...reviewed, status: "draft" },
      value.workspace,
      "Propuesta preservada",
      true
    );
    expect(historicalDraft.totalPyg).toBe(230000);
    expect(historicalDraft.services).toEqual(sheet.services);
    expect(
      operationsCustomerSheet(
        { ...reviewed, status: "draft", servicesSnapshot: [] },
        value.workspace,
        "Propuesta antigua",
        true
      ).totalPyg
    ).toBeNull();
  });
  it("requires evidence and explicit human confirmation for a quote revision acceptance", () => {
    const value = initial();
    value.workspace.customerQuotations.push(quote);
    renderWorkspace(value);
    fireEvent.click(
      screen.getByRole("button", { name: "Revisiones de cotización" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Nuevo registro" }));
    fireEvent.change(
      screen.getByLabelText("Cotización actual para preservar"),
      { target: { value: "quote-1" } }
    );
    fireEvent.change(screen.getByLabelText("Motivo de esta revisión"), {
      target: { value: "Confirmación de términos" },
    });
    fireEvent.change(screen.getByLabelText("Estado de la revisión"), {
      target: { value: "accepted" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar al borrador" })
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Confirmá la acción manual"
    );
    fireEvent.click(
      screen.getByLabelText(/Confirmo que recibí aceptación real/)
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Aplicar al borrador" })
    );
    expect(screen.getByRole("alert")).toHaveTextContent("aceptación requiere");
    expect(saveSalesWorkspaceAction).not.toHaveBeenCalled();
  });
  it("compares only supported same-unit alternatives and excludes all private quote fields", () => {
    const value = initial();
    const next = {
      ...quote,
      id: "quote-2",
      deliveryPyg: 30000,
      lines: quote.lines.map((l) => ({
        ...l,
        model: "Modelo alternativo",
        unitPricePyg: 210000,
      })),
    };
    value.workspace.customerQuotations.push(quote, next);
    const sheet = operationsComparisonSheet(
      [quote.id, next.id],
      value.workspace,
      "Marca vigente"
    );
    expect(JSON.stringify(sheet)).not.toMatch(
      /consulta-private|private-source|supplierQuotationId|productId/
    );
    expect(operationsQuoteDifferences(quote, next, value.workspace)).toEqual([
      "Modelos, unidades, cantidades o precios",
      "Costo de entrega",
    ]);
    value.workspace.customerQuotations[1]!.lines[0]!.unit = "pair";
    expect(() =>
      operationsComparisonSheet(
        [quote.id, next.id],
        value.workspace,
        "Marca vigente"
      )
    ).toThrow(/mismas unidades/);
  });
  it("keeps size systems separate and unknown measurements explicit in demand aggregation", () => {
    const value = initial();
    value.workspace.demandRequests.push(
      {
        id: "d-1",
        enquiryId: "e-1",
        modelSlug: "modelo-real",
        sizeSystem: "supplier_size",
        requestedSize: "17",
        quantity: 2,
        unit: "single",
        notedOn: "2026-10-07",
        status: "requested",
      },
      {
        id: "d-2",
        enquiryId: "e-1",
        modelSlug: "modelo-real",
        sizeSystem: "diameter_mm",
        requestedSize: "17",
        quantity: 1,
        unit: "single",
        notedOn: "2026-10-07",
        status: "fulfilled",
      },
      {
        id: "d-3",
        enquiryId: "e-1",
        modelSlug: "modelo-real",
        sizeSystem: "unknown",
        requestedSize: null,
        quantity: 1,
        unit: "single",
        notedOn: "2026-10-07",
        status: "requested",
      }
    );
    const rows = operationsDemandRows(value.workspace);
    expect(rows).toHaveLength(3);
    expect(rows.find((r) => r.system === "unknown")?.size).toBeNull();
    expect(rows.find((r) => r.system === "diameter_mm")?.fulfilled).toBe(1);
  });
});
