import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { RingMeasurement } from "../ring-measurement";
afterEach(cleanup);

it("prints the calibrated guide and requires two independent measurements for a pair", () => {
  const print = vi.spyOn(window, "print").mockImplementation(() => {});
  render(<RingMeasurement />);
  fireEvent.click(screen.getByText("Guía para imprimir y medir un anillo"));
  fireEvent.click(
    screen.getByRole("button", { name: "Imprimir solo la guía" })
  );
  expect(print).toHaveBeenCalledOnce();
  const guide = screen.getByRole("region", {
    name: "Guía imprimible de medidas",
  });
  expect(guide).toHaveTextContent("exactamente 50 mm");
  expect(guide).toHaveTextContent("ni garantiza el ajuste");
  expect(guide).toHaveTextContent("Persona / dedo 2 (para un par)");
  const smallest = screen.getByLabelText("Diámetro interior 13 mm");
  expect(smallest).toHaveAttribute("width", "13mm");
  expect(smallest).toHaveAttribute("height", "13mm");
  expect(screen.getByLabelText("Diámetro interior 23 mm")).toHaveAttribute(
    "width",
    "23mm"
  );
  print.mockRestore();
});

it("accepts a comma decimal measurement and explains that it is not a commercial size", () => {
  render(<RingMeasurement />);
  fireEvent.change(screen.getByLabelText("Medida en mm"), {
    target: { value: "17,5" },
  });
  expect(
    screen.getByText(/Circunferencia interior aproximada/)
  ).toHaveTextContent(/55[.,]0? mm|55 mm/);
  expect(
    screen.getByText(/Esto no determina un talle comercial/)
  ).toBeVisible();
});

it("converts circumference back to diameter without assigning a supplier size", () => {
  render(<RingMeasurement />);
  fireEvent.change(screen.getByLabelText("Tengo la medida de"), {
    target: { value: "circumference" },
  });
  fireEvent.change(screen.getByLabelText("Medida en mm"), {
    target: { value: "55" },
  });
  expect(screen.getByText(/Diámetro interior aproximado/)).toHaveTextContent(
    /17[.,]5 mm/
  );
});

it.each(["-17", "0", "Infinity", "17 mm", "1000"])(
  "rejects an invalid measure %s",
  (value) => {
    render(<RingMeasurement />);
    fireEvent.change(screen.getByLabelText("Medida en mm"), {
      target: { value },
    });
    expect(screen.getByText(/Ingresá una medida válida/)).toBeVisible();
  }
);
