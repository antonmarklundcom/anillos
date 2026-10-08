import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { ProductFaqs } from "@/components/product-faqs";
afterEach(cleanup);
it("renders only the public answer and keeps text escaped", () => {
  const faqs = [
    {
      question: "¿Qué incluye?",
      answer: "Una pieza. <script>alert('unsafe')</script>",
      evidenceUrl: "https://private.example.test/PRIVATE-EVIDENCE",
      confirmedAt: "2026-10-06T12:00:00Z",
      id: "PRIVATE-ID",
    },
  ];
  const view = render(<ProductFaqs faqs={faqs} />);
  expect(screen.getByText("¿Qué incluye?")).toBeInTheDocument();
  expect(view.container.querySelector("script")).toBeNull();
  expect(view.container).not.toHaveTextContent("PRIVATE-EVIDENCE");
  expect(view.container).not.toHaveTextContent("PRIVATE-ID");
});
it("omits an empty FAQ block", () => {
  const view = render(<ProductFaqs faqs={[]} />);
  expect(view.container).toBeEmptyDOMElement();
});
