"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type {
  ProductSpecifications,
  SupplierDetails,
  VariantAttributes,
  VerifiedIdentifiers,
} from "@/lib/product-attributes";
import type { FormEvent } from "react";
import { FieldError, useFieldError } from "./field-validation";

function VerificationInfo({
  value,
}: {
  value?: { verifiedAt?: string; verifiedBy?: { label: string } } | null;
}) {
  if (!value?.verifiedAt || !Number.isFinite(Date.parse(value.verifiedAt)))
    return null;
  return (
    <p className="text-muted-foreground mt-2 text-sm">
      Verificado el{" "}
      {new Intl.DateTimeFormat("es-PY", {
        dateStyle: "medium",
        timeZone: "America/Asuncion",
      }).format(new Date(value.verifiedAt))}
      {value.verifiedBy
        ? ` por ${value.verifiedBy.label}`
        : " (registro anterior sin autor identificado)"}
      .
    </p>
  );
}

function invalidateVerification(
  event: FormEvent<HTMLElement>,
  checkbox: string,
  fields: readonly string[]
) {
  const target = event.target;
  if (
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement
  ) {
    if (fields.includes(target.name)) {
      const verification = event.currentTarget.querySelector<HTMLInputElement>(
        `input[name="${checkbox}"]`
      );
      if (verification) verification.checked = false;
    }
  }
}

function Field({
  name,
  label,
  value,
  suffix = "",
  numeric = false,
  maxLength = 160,
}: {
  name: string;
  label: string;
  value?: string | number;
  suffix?: string;
  numeric?: boolean;
  maxLength?: number;
}) {
  const id = `${name}${suffix}`;
  const error = useFieldError(name);
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={name}
        defaultValue={value ?? ""}
        maxLength={maxLength}
        inputMode={numeric ? "decimal" : undefined}
        type={name === "sourceUrl" ? "url" : "text"}
        pattern={name === "sourceUrl" ? "https://.*" : undefined}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      <FieldError name={name} id={`${id}-error`} />
    </div>
  );
}

export function ProductAttributeFields({
  specifications,
  supplierDetails,
  seoTitle,
  seoDescription,
}: {
  specifications?: ProductSpecifications | null;
  supplierDetails?: SupplierDetails | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
}) {
  const unitError = useFieldError("unit");
  return (
    <>
      <details
        className="rounded-lg border p-4"
        onChange={(event) => {
          invalidateVerification(event, "specificationsVerified", [
            "material",
            "purity",
            "stone",
            "stoneShape",
            "widthMm",
            "unit",
          ]);
          invalidateVerification(event, "supplierVerified", [
            "reference",
            "sourceUrl",
            "imageProvenance",
          ]);
        }}
      >
        <summary className="cursor-pointer font-medium">
          Ficha técnica y procedencia
        </summary>
        <p className="text-muted-foreground my-3 text-sm">
          Dejá vacíos los datos desconocidos. Confirmá la composición y la
          unidad con la ficha del proveedor antes de mostrarlas como hechos.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field
            name="material"
            label="Material"
            value={specifications?.material}
            maxLength={120}
          />
          <Field
            name="purity"
            label="Pureza o composición"
            value={specifications?.purity}
            maxLength={80}
          />
          <Field
            name="stone"
            label="Piedra y tratamiento confirmado"
            value={specifications?.stone}
          />
          <Field
            name="widthMm"
            label="Ancho en milímetros"
            value={specifications?.widthMm}
            numeric
          />
          <Field
            name="stoneShape"
            label="Forma de piedra confirmada"
            value={specifications?.stoneShape}
            maxLength={80}
          />
          <div className="grid gap-1.5">
            <Label htmlFor="unit">Unidad de venta confirmada</Label>
            <select
              id="unit"
              name="unit"
              defaultValue={specifications?.unit ?? ""}
              className="rounded border p-2"
              aria-invalid={Boolean(unitError) || undefined}
              aria-describedby={unitError ? "unit-error" : undefined}
            >
              <option value="">Sin confirmar</option>
              <option value="individual">Una pieza individual</option>
              <option value="pair">Un par de dos piezas</option>
            </select>
            <FieldError name="unit" id="unit-error" />
          </div>
          <Field
            name="reference"
            label="Referencia del proveedor (privada)"
            value={supplierDetails?.reference}
          />
          <Field
            name="sourceUrl"
            label="URL HTTPS de la fuente (privada)"
            value={supplierDetails?.sourceUrl}
            maxLength={2000}
          />
          <div className="grid gap-1.5">
            <Label htmlFor="imageProvenance">Procedencia de fotografías</Label>
            <select
              id="imageProvenance"
              name="imageProvenance"
              defaultValue={supplierDetails?.imageProvenance ?? ""}
              className="rounded border p-2"
            >
              <option value="">Sin confirmar</option>
              <option value="supplier-authorized">
                Proveedor, con autorización
              </option>
              <option value="owned-photo">Fotografía propia</option>
              <option value="illustrative">Imagen ilustrativa</option>
            </select>
          </div>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="specificationsVerified"
            defaultChecked={Boolean(specifications?.verifiedAt)}
          />
          Verifiqué la ficha técnica y la unidad de venta.
        </label>
        <VerificationInfo value={specifications} />
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="supplierVerified"
            defaultChecked={Boolean(supplierDetails?.verifiedAt)}
          />
          Verifiqué la referencia y la procedencia con el proveedor.
        </label>
        <VerificationInfo value={supplierDetails} />
      </details>
      <details className="rounded-lg border p-4">
        <summary className="cursor-pointer font-medium">
          Título y descripción para buscadores
        </summary>
        <p className="text-muted-foreground my-3 text-sm">
          Son opcionales. Sin estos campos se usa el título y la descripción de
          la ficha.
        </p>
        <div className="grid gap-3">
          <Field
            name="seoTitle"
            label="Título SEO"
            value={seoTitle ?? undefined}
            maxLength={200}
          />
          <Field
            name="seoDescription"
            label="Descripción SEO"
            value={seoDescription ?? undefined}
            maxLength={500}
          />
        </div>
      </details>
    </>
  );
}

export function VariantAttributeFields({
  attributes,
  identifiers,
  suffix,
}: {
  attributes?: VariantAttributes | null;
  identifiers?: VerifiedIdentifiers | null;
  suffix: string;
}) {
  return (
    <details
      className="rounded-lg border p-3"
      onChange={(event) => {
        invalidateVerification(event, "identifiersVerified", ["gtin", "mpn"]);
        invalidateVerification(event, "attributesVerified", [
          "interiorMm",
          "interiorMmSecond",
          "sizeSystem",
          "sizeLabel",
        ]);
      }}
    >
      <summary className="cursor-pointer font-medium">
        Medidas e identificadores verificados
      </summary>
      <p className="text-muted-foreground my-3 text-sm">
        No deduzcas talles de la etiqueta ni inventes GTIN o MPN. La segunda
        medida corresponde a la otra pieza de un par.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field
          name="interiorMm"
          label="Diámetro interior en mm"
          value={attributes?.interiorMm}
          suffix={suffix}
          numeric
        />
        <Field
          name="interiorMmSecond"
          label="Diámetro interior de la segunda pieza en mm"
          value={attributes?.interiorMmSecond}
          suffix={suffix}
          numeric
        />
        <Field
          name="sizeSystem"
          label="Sistema de talles (p. ej. US, EU, diámetro mm)"
          value={attributes?.sizeSystem}
          suffix={suffix}
          maxLength={80}
        />
        <Field
          name="sizeLabel"
          label="Talle según ese sistema"
          value={attributes?.sizeLabel}
          suffix={suffix}
          maxLength={80}
        />
        <Field
          name="gtin"
          label="GTIN asignado por el fabricante"
          value={identifiers?.gtin}
          suffix={suffix}
          maxLength={14}
        />
        <Field
          name="mpn"
          label="MPN del fabricante"
          value={identifiers?.mpn}
          suffix={suffix}
          maxLength={120}
        />
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="attributesVerified"
          defaultChecked={Boolean(attributes?.verifiedAt)}
        />
        Verifiqué las medidas y el sistema de talles de esta variante.
      </label>
      <VerificationInfo value={attributes} />
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="identifiersVerified"
          defaultChecked={Boolean(identifiers?.verifiedAt)}
        />
        Verifiqué estos identificadores con el fabricante o proveedor.
      </label>
      <VerificationInfo value={identifiers} />
    </details>
  );
}
