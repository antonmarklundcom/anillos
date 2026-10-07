import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  FieldError,
  FieldErrorsContext,
  focusInvalidField,
} from "../field-validation";

describe("admin validation navigation", () => {
  it("opens nested details and focuses the failed field", () => {
    const { container } = render(
      <form>
        <details>
          <summary>Ficha</summary>
          <details>
            <summary>Fuente</summary>
            <input name="sourceUrl" aria-label="Fuente" />
          </details>
        </details>
      </form>
    );
    focusInvalidField(container.querySelector("form")!, {
      "supplierDetails.sourceUrl": "URL de la fuente: Usá una URL HTTPS.",
    });
    for (const detail of container.querySelectorAll("details"))
      expect(detail.open).toBe(true);
    expect(screen.getByLabelText("Fuente")).toHaveFocus();
  });
  it("renders nested field messages with an addressable description", () => {
    render(
      <FieldErrorsContext.Provider
        value={{
          "specifications.widthMm": "Ancho: Ingresá una medida válida.",
        }}
      >
        <FieldError name="widthMm" id="widthMm-error" />
      </FieldErrorsContext.Provider>
    );
    expect(
      screen.getByText("Ancho: Ingresá una medida válida.")
    ).toHaveAttribute("id", "widthMm-error");
  });
});
