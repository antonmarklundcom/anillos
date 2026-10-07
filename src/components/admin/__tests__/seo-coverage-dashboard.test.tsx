import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SeoCoverageDashboard } from "../seo-coverage-dashboard";
import type { KeywordCoverageGroup } from "@/content/keyword-coverage";

const groups: KeywordCoverageGroup[] = [
  { id: "1", label: "anillo de rubí", monthlySearches: 860, status: "content-mapped", destination: "/guias/piedras-de-color", scope: "Volumen del grupo completo, no visitas." },
  { id: "2", label: "porta anillos", monthlySearches: 230, status: "held", scope: "Surtido pendiente." },
  { id: "3", label: "joyería de marca", monthlySearches: 2000, status: "excluded", scope: "Marca excluida." },
];
describe("keyword coverage owner dashboard", () => {
  it("filters accent-insensitively and links only mapped content", () => {
    render(<SeoCoverageDashboard groups={groups} />);
    expect(screen.getAllByTestId("seo-coverage-row")).toHaveLength(3);
    expect(screen.getByRole("link", { name: "/guias/piedras-de-color" })).toHaveAttribute("href", "/guias/piedras-de-color");
    fireEvent.change(screen.getByLabelText("Buscar grupo o destino"), { target: { value: "rubi" } });
    expect(screen.getAllByTestId("seo-coverage-row")).toHaveLength(1);
    fireEvent.change(screen.getByLabelText("Buscar grupo o destino"), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText("Estado editorial"), { target: { value: "held" } });
    expect(screen.getByText("porta anillos")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  }, 15000);
});
