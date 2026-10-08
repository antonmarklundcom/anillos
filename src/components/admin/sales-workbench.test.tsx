import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { SalesWorkbench } from "./sales-workbench";
import { ledgerKey } from "@/store/sales-workbench";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  localStorage.clear();
});

describe("manual owner workbench", () => {
  it("previews the chosen marketing destination and offers manual copy when clipboard is unavailable", async () => {
    render(
      <SalesWorkbench
        ownerId={7}
        marketing={{
          storeName: "Marca vigente",
          origin: "https://tienda.example",
          categories: [{ slug: "compromiso", name: "Compromiso" }],
        }}
      />
    );
    fireEvent.change(screen.getByLabelText("Página de destino"), {
      target: { value: "/categoria/compromiso" },
    });
    expect(
      screen.getByLabelText("Vista previa del borrador")
    ).toHaveTextContent("https://tienda.example/categoria/compromiso");
    const deniedClipboard = {
      writeText: vi.fn().mockRejectedValue(new Error("denied")),
    };
    vi.stubGlobal("navigator", { clipboard: deniedClipboard });
    fireEvent.click(screen.getByRole("button", { name: "Copiar borrador" }));
    const fallback = await screen.findByLabelText(
      "Texto para copiar manualmente"
    );
    expect((fallback as HTMLTextAreaElement).value).toContain("Marca vigente");
    expect(localStorage.getItem(ledgerKey(7))).toBeNull();
  });
  it("validates imported JSON before replacing rows and never auto-saves it", async () => {
    render(<SalesWorkbench ownerId={7} />);
    const file = new File(["{}"], "consultas.json", {
      type: "application/json",
    });
    Object.defineProperty(file, "text", {
      value: async () =>
        JSON.stringify({
          version: 1,
          enquiries: [
            {
              id: "imported-1",
              alias: "consulta-088",
              category: "oro",
              style: "banda-simple",
              stage: "cotizada",
              date: "2026-10-07",
              followUp: "",
            },
          ],
        }),
    });
    fireEvent.change(
      screen.getByLabelText("Importar JSON exportado (máximo 100 KB)"),
      { target: { files: [file] } }
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "Confirmar" })
      ).toBeInTheDocument()
    );
    expect(
      screen.queryByRole("button", { name: "Editar consulta-088" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(
      screen.getByRole("button", { name: "Editar consulta-088" })
    ).toBeInTheDocument();
    expect(localStorage.getItem(ledgerKey(7))).toBeNull();
  });
  it("preserves current rows when an imported file is corrupt", async () => {
    render(<SalesWorkbench ownerId={7} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Agregar en pantalla" })
    );
    const file = new File(["broken"], "consultas.json", {
      type: "application/json",
    });
    Object.defineProperty(file, "text", { value: async () => "broken" });
    fireEvent.change(
      screen.getByLabelText("Importar JSON exportado (máximo 100 KB)"),
      { target: { files: [file] } }
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("No se pudo importar")
    );
    expect(
      screen.getByRole("button", { name: "Editar consulta-001" })
    ).toBeInTheDocument();
  });
  it("only saves on explicit action and excludes calculator secrets", () => {
    render(<SalesWorkbench ownerId={7} />);
    fireEvent.change(
      screen.getByLabelText("Compra al proveedor por unidad (₲)"),
      { target: { value: "654321" } }
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Agregar en pantalla" })
    );
    expect(localStorage.getItem(ledgerKey(7))).toBeNull();
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar en este navegador" })
    );
    expect(localStorage.getItem(ledgerKey(7))).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    const saved = localStorage.getItem(ledgerKey(7));
    expect(saved).toContain("consulta-001");
    expect(saved).not.toContain("654321");
  });
  it("reports a storage failure and retains the editable in-memory enquiry", () => {
    render(<SalesWorkbench ownerId={7} />);
    fireEvent.click(
      screen.getByRole("button", { name: "Agregar en pantalla" })
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Guardar en este navegador" })
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "No se pudo acceder al registro local"
    );
    expect(
      screen.getByRole("button", { name: "Editar consulta-001" })
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Registro guardado sólo/)
    ).not.toBeInTheDocument();
  });
  it("starts empty even with a saved copy until the owner opens it", () => {
    localStorage.setItem(
      ledgerKey(7),
      JSON.stringify({
        version: 1,
        enquiries: [
          {
            id: "saved-1",
            alias: "consulta-099",
            category: "acero",
            style: "banda-simple",
            stage: "cotizada",
            date: "2026-10-07",
            followUp: "",
          },
        ],
      })
    );
    render(<SalesWorkbench ownerId={7} />);
    expect(
      screen.queryByRole("button", { name: "Editar consulta-099" })
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Abrir copia local" }));
    fireEvent.click(screen.getByRole("button", { name: "Confirmar" }));
    expect(
      screen.getByRole("button", { name: "Editar consulta-099" })
    ).toBeInTheDocument();
  });
});
