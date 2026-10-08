import { useState } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ProductFaqEditor } from "./product-faq-editor";
import type { SalesWorkspace } from "@/domain/sales-workspace";

afterEach(cleanup);
const confirmed: SalesWorkspace["productFaqs"][number] = {
  id: "faq-test",
  productSlug: "modelo-real",
  question: "¿Qué incluye la unidad?",
  answer: "Incluye una pieza, según la ficha confirmada.",
  evidenceUrl: "https://private.example.test/modelo-real",
  confirmedAt: "2026-10-06T12:00:00Z",
  published: true,
};
function Editor() {
  const [faqs, setFaqs] = useState([confirmed]);
  return <ProductFaqEditor faqs={faqs} onChange={setFaqs} />;
}
it("withdraws publication when the answer or evidence changes", () => {
  render(<Editor />);
  const published = screen.getByRole("checkbox");
  expect(published).toBeChecked();
  fireEvent.change(screen.getByLabelText("Respuesta confirmada"), {
    target: { value: "Respuesta revisada." },
  });
  expect(published).not.toBeChecked();
  fireEvent.click(published);
  expect(published).toBeChecked();
  fireEvent.change(screen.getByLabelText("Evidencia privada (URL HTTPS)"), {
    target: { value: "https://private.example.test/revised" },
  });
  expect(published).not.toBeChecked();
});
it("prevents publishing model facts on a reserved concept", () => {
  render(<Editor />);
  fireEvent.change(screen.getByLabelText("Slug del producto exacto"), {
    target: { value: "concepto-prueba" },
  });
  expect(screen.getByRole("checkbox")).not.toBeChecked();
  expect(screen.getByRole("checkbox")).toBeDisabled();
});
