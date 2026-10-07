import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { EnquiryComposer } from "@/components/enquiry-composer";
import { waLink } from "@/lib/py";

const product = {
  slug: "concepto-par",
  name: "Diseño de bandas",
  categorySlug: "alianzas",
  concept: true,
  unit: "pair" as const,
};
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});

describe("optional enquiry composer", () => {
  it("updates WhatsApp from optional inputs without automatic persistence", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem");
    render(
      <EnquiryComposer
        products={[product]}
        whatsappHref={waLink("0981234567", "old")}
        draftKey="one"
      />
    );
    expect(
      screen.getByText(/vos lo revisás y lo enviás manualmente/)
    ).toBeVisible();
    fireEvent.change(screen.getByLabelText("Ciudad"), {
      target: { value: "Luque & Areguá" },
    });
    fireEvent.change(
      screen.getByLabelText("Diámetro interior persona 1 (mm, si lo sabés)"),
      { target: { value: "17,5" } }
    );
    fireEvent.change(
      screen.getByLabelText("Diámetro interior persona 2 (mm)"),
      { target: { value: "19" } }
    );
    const link = screen.getByTestId("product-enquiry-brief-link");
    const text = new URL(link.getAttribute("href")!).searchParams.get("text");
    expect(text).toContain("Luque & Areguá");
    expect(text).toContain("persona 2: 19 mm");
    expect(spy).not.toHaveBeenCalled();
    fireEvent.click(screen.getByText("Guardar borrador en este navegador"));
    expect(spy).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByText("Eliminar borrador"));
    expect(localStorage.getItem("ring-enquiry:one")).toBeNull();
    expect(screen.getByLabelText("Ciudad")).toHaveValue("");
  });
  it("recovers drafts only on request and leaves invalid inputs out of the sending flow", () => {
    localStorage.setItem(
      "ring-enquiry:one",
      JSON.stringify({ version: 1, details: { city: "Luque" } })
    );
    render(
      <EnquiryComposer
        products={[product]}
        whatsappHref={waLink("0981234567")}
        draftKey="one"
      />
    );
    expect(screen.getByLabelText("Ciudad")).toHaveValue("");
    fireEvent.click(screen.getByText("Recuperar borrador"));
    expect(screen.getByLabelText("Ciudad")).toHaveValue("Luque");
    fireEvent.change(
      screen.getByLabelText("Diámetro interior persona 2 (mm)"),
      { target: { value: "2" } }
    );
    expect(screen.getByRole("alert")).toHaveTextContent("entre 10 y 30 mm");
    expect(screen.queryByTestId("product-enquiry-brief-link")).toBeNull();
    expect(screen.getByText("Copiar consulta")).toBeDisabled();
  });
  it("offers a selectable copy fallback when clipboard is unavailable and no contact is configured", async () => {
    render(
      <EnquiryComposer
        products={[product]}
        whatsappHref={null}
        draftKey="one"
      />
    );
    expect(screen.queryByTestId("product-enquiry-brief-link")).toBeNull();
    fireEvent.click(screen.getByText("Copiar consulta"));
    const fallback = await screen.findByLabelText("Texto para copiar");
    expect((fallback as HTMLTextAreaElement).value).toContain(
      "no confirma disponibilidad"
    );
  });
});
