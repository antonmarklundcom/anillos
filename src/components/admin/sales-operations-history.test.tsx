import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { SalesOperationsHistory } from "./sales-operations-history";
import { emptySalesWorkspace } from "@/domain/sales-workspace";
import {
  deleteEnquiryRecordsAction,
  readSalesWorkspaceAuditAction,
  undoSalesWorkspaceAction,
} from "@/app/actions/sales-workspace";
vi.mock("@/app/actions/sales-workspace", () => ({
  deleteEnquiryRecordsAction: vi.fn(),
  exportEnquiryRecordsAction: vi.fn(),
  readSalesWorkspaceAuditAction: vi.fn(),
  undoSalesWorkspaceAction: vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
describe("saved audit and selected retention", () => {
  it("preserves current UI on a stale undo and sends its exact saved revision", async () => {
    vi.mocked(readSalesWorkspaceAuditAction).mockResolvedValue({
      ok: true,
      entries: [
        {
          id: 8,
          revision: 2,
          kind: "save",
          createdAt: "2026-10-07T12:00:00Z",
          canUndo: true,
          actorUserId: 7,
          changes: [],
        },
      ],
    });
    vi.mocked(undoSalesWorkspaceAction).mockResolvedValue({
      ok: false,
      code: "conflict",
      error: "Otra pantalla guardó",
    });
    const changed = vi.fn();
    render(
      <SalesOperationsHistory
        workspace={emptySalesWorkspace()}
        revision={3}
        blocked={false}
        onDatabaseChange={changed}
      />
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Leer historial guardado" })
    );
    await screen.findByText(/Usuario interno 7/);
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar recuperación 2" })
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: "Confirmar recuperación con revisión actual",
      })
    );
    await screen.findByText(/Tu pantalla no fue reemplazada/);
    expect(undoSalesWorkspaceAction).toHaveBeenCalledWith({
      revision: 3,
      auditId: 8,
    });
    expect(changed).not.toHaveBeenCalled();
  });
  it("makes no default retention choice and requires reviewing the concrete deletion", () => {
    const workspace = emptySalesWorkspace();
    workspace.enquiries.push({
      id: "enquiry-1",
      alias: "consulta-001",
      designSlugs: [],
      categorySlug: null,
      stage: "new",
      assignedOwner: "",
      createdOn: "2026-10-07",
      nextActionOn: null,
      nextAction: "",
      lossReason: null,
    });
    render(
      <SalesOperationsHistory
        workspace={workspace}
        revision={1}
        blocked={false}
        onDatabaseChange={vi.fn()}
      />
    );
    fireEvent.change(screen.getByLabelText("Consulta guardada"), {
      target: { value: "enquiry-1" },
    });
    expect(
      screen.getByRole("button", { name: "Revisar eliminación y conservación" })
    ).toBeDisabled();
    fireEvent.change(
      screen.getByLabelText("Decisión real sobre registros comerciales"),
      { target: { value: "retain" } }
    );
    fireEvent.change(
      screen.getByLabelText("Decisión sobre copias anteriores del historial"),
      { target: { value: "purge" } }
    );
    fireEvent.change(
      screen.getByLabelText("Decisión sobre recordatorios del mismo alias"),
      { target: { value: "retain" } }
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Revisar eliminación y conservación" })
    );
    expect(
      screen.getByRole("button", { name: "Confirmar eliminación en la base" })
    ).toBeDisabled();
    expect(
      screen.getByText(/historial anterior de todo el espacio/)
    ).toBeInTheDocument();
    expect(deleteEnquiryRecordsAction).not.toHaveBeenCalled();
  });
});
