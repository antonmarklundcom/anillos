import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import {
  ProductAttributeFields,
  VariantAttributeFields,
} from "@/components/admin/product-attribute-fields";
afterEach(cleanup);
const verifiedAt = "2026-01-01T12:00:00Z";
it("requires technical facts to be confirmed again after changing them, without clearing unrelated supplier evidence", () => {
  render(
    <ProductAttributeFields
      specifications={{ material: "Plata 925", unit: "individual", verifiedAt }}
      supplierDetails={{ reference: "REF-1", verifiedAt }}
    />
  );
  const facts = screen.getByRole("checkbox", {
    name: "Verifiqué la ficha técnica y la unidad de venta.",
  });
  const source = screen.getByRole("checkbox", {
    name: "Verifiqué la referencia y la procedencia con el proveedor.",
  });
  expect(facts).toBeChecked();
  expect(source).toBeChecked();
  fireEvent.change(screen.getByLabelText("Material"), {
    target: { value: "Otro material" },
  });
  expect(facts).not.toBeChecked();
  expect(source).toBeChecked();
  fireEvent.click(facts);
  expect(facts).toBeChecked();
});
it("revokes identifier confirmation when GTIN changes and measurement confirmation when size changes", () => {
  render(
    <VariantAttributeFields
      suffix="-7"
      attributes={{ interiorMm: 17, verifiedAt }}
      identifiers={{ gtin: "4006381333931", verifiedAt }}
    />
  );
  const identifiers = screen.getByRole("checkbox", {
    name: "Verifiqué estos identificadores con el fabricante o proveedor.",
  });
  const measurements = screen.getByRole("checkbox", {
    name: "Verifiqué las medidas y el sistema de talles de esta variante.",
  });
  fireEvent.change(screen.getByLabelText("GTIN asignado por el fabricante"), {
    target: { value: "4006381333932" },
  });
  expect(identifiers).not.toBeChecked();
  expect(measurements).toBeChecked();
  fireEvent.change(screen.getByLabelText("Diámetro interior en mm"), {
    target: { value: "18" },
  });
  expect(measurements).not.toBeChecked();
});
