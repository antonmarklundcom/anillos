"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { ZodType } from "zod";
import {
  QuoteRevisionSchema,
  SampleInspectionSchema,
  SupplierPerformanceRecordSchema,
  DemandRequestSchema,
  PurchasingDraftSchema,
  QuoteComparisonSchema,
} from "@/domain/sales-workspace";
import {
  readSalesSearchGapsAction,
  readSalesWorkspaceAction,
  saveSalesWorkspaceAction,
} from "@/app/actions/sales-workspace";
import {
  AftersalesCaseSchema,
  CampaignSchema,
  COST_KEYS,
  CustomerQuotationSchema,
  ENQUIRY_STAGES,
  EnquirySchema,
  FulfilledSaleSchema,
  LOSS_REASONS,
  OccasionReminderSchema,
  ProductCostProfileSchema,
  SalesWorkspaceSchema,
  ServiceOptionSchema,
  SupplierQuotationSchema,
  MAX_WORKSPACE_BYTES,
  costTotal,
  emptyCosts,
  lossCounts,
  overdueEnquiries,
  priceFloor,
  saleContribution,
  supplierFreshness,
  type CustomerQuotation,
  type SalesWorkspace,
  type SalesWorkspaceSnapshot,
} from "@/domain/sales-workspace";
import {
  operationsCustomerSheet,
  operationsDay,
  operationsMoney,
  operationsNullableNumber,
  operationsQuoteText,
  operationsToday,
} from "./sales-operations-helpers";
import styles from "./sales-operations.module.css";
import {
  SalesOperationsEvidence,
  SalesOperationsComparison,
} from "./sales-operations-evidence";
import { SalesOperationsHistory } from "./sales-operations-history";
import { ProductFaqEditor } from "./product-faq-editor";

type Collection =
  | "enquiries"
  | "supplierQuotations"
  | "customerQuotations"
  | "fulfilledSales"
  | "productCostProfiles"
  | "serviceOptions"
  | "aftersalesCases"
  | "occasionReminders"
  | "campaigns"
  | "quoteRevisions"
  | "sampleInspections"
  | "supplierPerformanceRecords"
  | "demandRequests"
  | "purchasingDrafts"
  | "quoteComparisons";
type WorkspaceTab =
  Collection | "inbox" | "transfer" | "history" | "productFaqs";
type RecordData = Record<string, unknown>;
type Choice = { value: string; label: string };
type Field = {
  key: string;
  label: string;
  type?: "date" | "number" | "textarea" | "select" | "multi" | "checkbox";
  choices?: Choice[];
  nullable?: boolean;
  help?: string;
  disabled?: boolean;
  step?: number;
};
type Context = {
  categories: { slug: string; name: string }[];
  guides: { slug: string; title: string }[];
};
type Props = {
  initial: SalesWorkspaceSnapshot;
  initialError?: string;
  storeName: string;
  origin: string | null;
} & Context;
const stageLabels: Record<string, string> = {
  new: "Nueva",
  contacted: "En conversación",
  quoted: "Cotizada",
  follow_up: "Seguimiento",
  fulfilled: "Venta informada",
  lost: "Perdida",
  closed: "Cerrada",
};
const lossLabels: Record<string, string> = {
  price: "Precio",
  size: "Talle",
  unavailable: "No disponible",
  timing: "Plazo",
  slow_follow_up: "Seguimiento tardío",
  no_response: "Sin respuesta",
  other: "Otro",
};
const costLabels: Record<string, string> = {
  productPyg: "Compra al proveedor",
  freightPyg: "Flete asignado",
  taxPyg: "Impuestos variables",
  packagingPyg: "Empaque",
  paymentFeePyg: "Comisiones",
  deliveryPyg: "Envío absorbido",
  servicePyg: "Servicios / ajustes",
  otherPyg: "Otros costos variables",
};
const labels: Record<Collection, string> = {
  enquiries: "Consultas",
  supplierQuotations: "Proveedores",
  customerQuotations: "Cotizaciones",
  fulfilledSales: "Ventas informadas",
  productCostProfiles: "Costos por modelo",
  serviceOptions: "Servicios confirmados",
  aftersalesCases: "Posventa",
  occasionReminders: "Recordatorios",
  campaigns: "Campañas",
  quoteRevisions: "Revisiones de cotización",
  sampleInspections: "Muestras",
  supplierPerformanceRecords: "Desempeño observado",
  demandRequests: "Demanda por medida",
  purchasingDrafts: "Plan de compras",
  quoteComparisons: "Alternativas para cliente",
};
const schemas: Record<Collection, ZodType> = {
  enquiries: EnquirySchema,
  supplierQuotations: SupplierQuotationSchema,
  customerQuotations: CustomerQuotationSchema,
  fulfilledSales: FulfilledSaleSchema,
  productCostProfiles: ProductCostProfileSchema,
  serviceOptions: ServiceOptionSchema,
  aftersalesCases: AftersalesCaseSchema,
  occasionReminders: OccasionReminderSchema,
  campaigns: CampaignSchema,
  quoteRevisions: QuoteRevisionSchema,
  sampleInspections: SampleInspectionSchema,
  supplierPerformanceRecords: SupplierPerformanceRecordSchema,
  demandRequests: DemandRequestSchema,
  purchasingDrafts: PurchasingDraftSchema,
  quoteComparisons: QuoteComparisonSchema,
};
const options = (values: readonly string[], names?: Record<string, string>) =>
  values.map((value) => ({ value, label: names?.[value] ?? value }));
const dateField = (key: string, label: string, nullable = true): Field => ({
  key,
  label,
  type: "date",
  nullable,
});
const numField = (key: string, label: string, nullable = true): Field => ({
  key,
  label,
  type: "number",
  nullable,
});
const costsFields = COST_KEYS.map((key): Field => ({
  key: `costs.${key}`,
  label: `${costLabels[key]} (PYG)`,
  type: "number",
  nullable: true,
}));
const idChoices = (
  rows: { id: string }[],
  describe: (row: RecordData) => string
) => rows.map((r) => ({ value: r.id, label: describe(r as RecordData) }));
function fieldsFor(
  key: Collection,
  workspace: SalesWorkspace,
  context: Context
): Field[] {
  const alias: Field = {
    key: "alias",
    label: "Alias anónimo",
    help: "Ejemplo: consulta-001. Sin nombre, teléfono, email ni conversación.",
  };
  const assigned: Field = {
    key: "assignedOwner",
    label: "Responsable (alias interno)",
  };
  const enquiry: Field = {
    key: "enquiryId",
    label: "Consulta vinculada",
    type: "select",
    nullable: true,
    choices: idChoices(workspace.enquiries, (r) => String(r.alias)),
  };
  const quote: Field = {
    key: "quotationId",
    label: "Cotización vinculada",
    type: "select",
    nullable: true,
    choices: idChoices(
      workspace.customerQuotations,
      (r) => `${r.alias} · ${operationsDay(String(r.createdOn))}`
    ),
  };
  const supplierQuote: Field = {
    key: "supplierQuotationId",
    label: "Referencia real del proveedor",
    type: "select",
    choices: workspace.supplierQuotations.map((q) => ({
      value: q.id,
      label: `${q.supplier} · ${q.reference} · ${q.size || "Sin medida"}`,
    })),
  };
  switch (key) {
    case "quoteRevisions":
      return [
        {
          ...quote,
          nullable: false,
          label: "Cotización actual para preservar",
          choices: workspace.customerQuotations
            .filter((q) => q.status === "review_ready")
            .map((q) => ({
              value: q.id,
              label: `${q.alias} · ${q.lines.map((l) => l.model).join(" / ")}`,
            })),
        },
        dateField("createdOn", "Fecha de revisión", false),
        { key: "reason", label: "Motivo de esta revisión", type: "textarea" },
        {
          key: "status",
          label: "Estado de la revisión",
          type: "select",
          choices: options(["draft", "review_ready", "accepted"], {
            draft: "Borrador preservado",
            review_ready: "Revisada para confirmar",
            accepted: "Aceptación informada manualmente",
          }),
        },
        dateField("acceptedOn", "Aceptación real recibida el"),
        {
          key: "acceptanceEvidence",
          label: "Referencia privada de aceptación",
          nullable: true,
          help: "Referencia interna de la evidencia real. No pegues conversación, nombre ni contacto.",
        },
      ];
    case "sampleInspections":
      return [
        supplierQuote,
        dateField("inspectedOn", "Muestra inspeccionada el", false),
        numField("widthMm", "Ancho medido (mm)"),
        numField("interiorDiameterMm", "Diámetro interior medido (mm)"),
        numField("weightGrams", "Peso medido (g)"),
        { key: "finish", label: "Acabado observado", type: "textarea" },
        {
          key: "evidenceReference",
          label: "Referencia privada de evidencia real",
        },
        {
          key: "outcome",
          label: "Resultado de inspección",
          type: "select",
          choices: options(["pass", "review", "reject"], {
            pass: "Conforme a lo inspeccionado",
            review: "Requiere revisión",
            reject: "No conforme",
          }),
        },
        {
          key: "notes",
          label: "Ajuste, defectos y observaciones reales",
          type: "textarea",
        },
      ];
    case "supplierPerformanceRecords":
      return [
        supplierQuote,
        dateField("requestedOn", "Solicitud real enviada el", false),
        dateField("respondedOn", "Respuesta real recibida el"),
        dateField("promisedOn", "Fecha acordada de recepción"),
        dateField("receivedOn", "Recepción real"),
        numField("fulfilledUnitCount", "Unidades efectivamente recibidas"),
        dateField("resolvedOn", "Incidencia resuelta el"),
        {
          key: "resolutionEvidence",
          label: "Referencia real de resolución",
          nullable: true,
        },
        {
          key: "issue",
          label: "Incidencia observada",
          type: "select",
          nullable: true,
          choices: options(
            ["none", "delay", "spec_mismatch", "damage", "other"],
            {
              none: "Sin incidencia observada",
              delay: "Demora",
              spec_mismatch: "Especificación distinta",
              damage: "Daño",
              other: "Otra",
            }
          ),
        },
        {
          key: "evidenceReference",
          label: "Referencia de evidencia del desempeño",
        },
      ];
    case "demandRequests":
      return [
        { ...enquiry, nullable: false },
        { key: "modelSlug", label: "Slug del modelo solicitado" },
        {
          key: "sizeSystem",
          label: "Sistema de la medida solicitada",
          type: "select",
          choices: options(
            ["interior_mm", "diameter_mm", "supplier_size", "unknown"],
            {
              interior_mm: "Medida interior en mm",
              diameter_mm: "Diámetro en mm",
              supplier_size: "Talle del proveedor",
              unknown: "Sistema desconocido",
            }
          ),
        },
        {
          key: "requestedSize",
          label: "Medida o talle solicitado",
          nullable: true,
          help: "Copiá la medida y su sistema; no conviertas escalas ni la presentes como talle confirmado.",
        },
        numField("quantity", "Unidades solicitadas", false),
        {
          key: "unit",
          label: "Unidad solicitada",
          type: "select",
          choices: options(["single", "pair"], {
            single: "Un anillo",
            pair: "Par de dos anillos",
          }),
        },
        dateField("notedOn", "Solicitud registrada el", false),
        {
          key: "status",
          label: "Resultado informado",
          type: "select",
          choices: options(
            ["requested", "quoted", "unavailable", "fulfilled"],
            {
              requested: "Solicitud",
              quoted: "Cotizada",
              unavailable: "No disponible confirmado",
              fulfilled: "Entregada informada",
            }
          ),
        },
      ];
    case "purchasingDrafts":
      return [
        supplierQuote,
        {
          key: "enquiryIds",
          label: "Consultas que justifican el plan",
          type: "multi",
          choices: workspace.enquiries.map((e) => ({
            value: e.id,
            label: e.alias,
          })),
        },
        numField("quantity", "Unidades a evaluar", false),
        numField(
          "availableCapitalPyg",
          "Capital real disponible para este plan (PYG)"
        ),
        {
          key: "unit",
          label: "Unidad del plan",
          type: "select",
          choices: options(["single", "pair"], {
            single: "Un anillo",
            pair: "Par de dos anillos",
          }),
        },
        dateField("createdOn", "Fecha del borrador", false),
        ...costsFields.map((field) => ({
          ...field,
          key: field.key.replace("costs.", "estimatedCosts."),
          label: `${field.label} por unidad del plan`,
        })),
        {
          key: "notes",
          label: "Capital disponible y decisión interna",
          type: "textarea",
        },
        {
          key: "status",
          label: "Revisión del dueño",
          type: "select",
          choices: options(["draft", "reviewed"], {
            draft: "Borrador de evaluación",
            reviewed: "Revisado manualmente",
          }),
        },
        dateField("reviewedOn", "Revisión real hecha el"),
        {
          key: "reviewEvidence",
          label: "Referencia de revisión de capital y costos",
          nullable: true,
        },
      ];
    case "quoteComparisons":
      return [
        { ...enquiry, nullable: false },
        {
          key: "quotationIds",
          label: "Dos o tres alternativas revisadas",
          type: "multi",
          choices: workspace.customerQuotations
            .filter((q) => q.status === "review_ready")
            .map((q) => ({
              value: q.id,
              label: `${q.alias} · ${q.lines.map((l) => l.model).join(" / ")}`,
            })),
        },
        dateField("createdOn", "Comparación preparada el", false),
        {
          key: "criteria",
          label: "Criterios internos confirmados",
          type: "textarea",
          help: "Los comentarios internos quedan fuera de la hoja para cliente.",
        },
        {
          key: "selectedQuotationId",
          label: "Alternativa elegida informada (opcional)",
          type: "select",
          nullable: true,
          choices: workspace.customerQuotations.map((q) => ({
            value: q.id,
            label: `${q.alias} · ${q.lines.map((l) => l.model).join(" / ")}`,
          })),
        },
        { key: "decisionNotes", label: "Decisión interna", type: "textarea" },
      ];
    case "enquiries":
      return [
        alias,
        {
          key: "stage",
          label: "Estado",
          type: "select",
          choices: options(ENQUIRY_STAGES, stageLabels),
        },
        {
          key: "designSlugs",
          label: "Slugs de diseños consultados",
          type: "multi",
          help: "Separá con comas. Usá diseños existentes; son referencias de interés.",
        },
        {
          key: "categorySlug",
          label: "Colección",
          type: "select",
          nullable: true,
          choices: context.categories.map((c) => ({
            value: c.slug,
            label: c.name,
          })),
        },
        assigned,
        dateField("createdOn", "Fecha de consulta", false),
        dateField("nextActionOn", "Próximo seguimiento"),
        {
          key: "nextAction",
          label: "Próxima acción interna",
          type: "textarea",
        },
        {
          key: "lossReason",
          label: "Motivo si se perdió",
          type: "select",
          nullable: true,
          choices: options(LOSS_REASONS, lossLabels),
        },
      ];
    case "supplierQuotations":
      return [
        { key: "supplier", label: "Proveedor (empresa / referencia interna)" },
        { key: "reference", label: "Referencia exacta del modelo" },
        {
          key: "source",
          label: "Fuente real de la cotización",
          help: "URL o referencia del documento recibido; sin correspondencia ni datos personales.",
        },
        numField("productId", "ID de producto real vinculado"),
        {
          key: "unit",
          label: "Unidad confirmada",
          type: "select",
          choices: [
            { value: "single", label: "Un anillo" },
            { value: "pair", label: "Par de dos anillos" },
          ],
        },
        { key: "size", label: "Talle / medida confirmada" },
        dateField("quotedOn", "Fecha de cotización", false),
        dateField("expiresOn", "Válida hasta"),
        dateField("availabilityConfirmedAt", "Disponibilidad confirmada el"),
        {
          key: "terms",
          label: "Condiciones privadas verificadas",
          type: "textarea",
        },
        ...costsFields,
      ];
    case "customerQuotations":
      return [
        alias,
        enquiry,
        dateField("createdOn", "Fecha del borrador", false),
        dateField("expiresOn", "Validez confirmada"),
        {
          key: "serviceOptionIds",
          label: "Servicios opcionales seleccionados",
          type: "multi",
          choices: workspace.serviceOptions
            .filter((s) => s.enabled)
            .map((s) => ({
              value: s.id,
              label: `${s.name} · ${operationsMoney(s.pricePyg)}`,
            })),
        },
        numField("deliveryPyg", "Costo de entrega cotizado (PYG)"),
        {
          key: "deliveryConditions",
          label: "Condiciones y plazo de entrega confirmados",
          type: "textarea",
          help: "Separá estas condiciones reales de la fecha deseada por el comprador.",
        },
        dateField("deliveryConfirmedOn", "Entrega cotizada / confirmada el"),
        {
          key: "status",
          label: "Revisión",
          type: "select",
          choices: [
            { value: "draft", label: "Borrador, faltan confirmaciones" },
            {
              value: "review_ready",
              label: "Revisada, lista para confirmar con comprador",
            },
          ],
        },
      ];
    case "fulfilledSales":
      return [
        enquiry,
        quote,
        numField("productId", "ID de producto real"),
        { key: "model", label: "Modelo efectivamente entregado" },
        { key: "supplier", label: "Proveedor" },
        dateField("fulfilledOn", "Fecha real de entrega", false),
        numField("revenuePyg", "Ingreso real informado (PYG)", false),
        numField("refundPyg", "Reembolso real (PYG; 0 sólo si confirmado)"),
        ...costsFields,
      ];
    case "productCostProfiles":
      return [
        numField("productId", "ID de producto real", false),
        numField("variantId", "ID de variante (opcional)"),
        {
          key: "unit",
          label: "Unidad de estos costos",
          type: "select",
          choices: [
            { value: "single", label: "Un anillo" },
            { value: "pair", label: "Par de dos anillos" },
          ],
        },
        dateField("confirmedOn", "Costos verificados el", false),
        numField(
          "targetContributionPyg",
          "Contribución objetivo por unidad (PYG)"
        ),
        ...costsFields,
      ];
    case "serviceOptions":
      return [
        { key: "name", label: "Nombre del servicio" },
        {
          key: "kind",
          label: "Tipo",
          type: "select",
          choices: options(["packaging", "engraving", "resizing", "other"], {
            packaging: "Empaque",
            engraving: "Grabado",
            resizing: "Ajuste de talle",
            other: "Otro",
          }),
        },
        numField("pricePyg", "Precio confirmado para comprador (PYG)", false),
        dateField("confirmedOn", "Precio y servicio confirmados el", false),
        {
          key: "terms",
          label: "Condiciones y limitaciones reales",
          type: "textarea",
        },
        {
          key: "enabled",
          label: "Disponible para seleccionar en cotizaciones",
          type: "checkbox",
        },
      ];
    case "aftersalesCases":
      return [
        alias,
        {
          key: "saleId",
          label: "Venta real informada",
          type: "select",
          choices: idChoices(
            workspace.fulfilledSales,
            (r) => `${r.model} · ${operationsDay(String(r.fulfilledOn))}`
          ),
        },
        {
          key: "kind",
          label: "Problema informado",
          type: "select",
          choices: options(["fit", "defect", "engraving", "other"], {
            fit: "Ajuste / talle",
            defect: "Defecto",
            engraving: "Grabado",
            other: "Otro",
          }),
        },
        dateField("openedOn", "Fecha de apertura", false),
        assigned,
        dateField("nextActionOn", "Próxima acción"),
        {
          key: "evidenceReference",
          label: "Referencia privada de evidencia",
          help: "Referencia interna, sin adjuntar fotos, nombres ni conversaciones.",
        },
        {
          key: "resolution",
          label: "Resolución acordada / pendiente",
          type: "textarea",
        },
        {
          key: "status",
          label: "Estado",
          type: "select",
          choices: options(["open", "reviewing", "resolved"], {
            open: "Abierto",
            reviewing: "En revisión",
            resolved: "Resuelto",
          }),
        },
      ];
    case "occasionReminders":
      return [
        alias,
        { key: "occasion", label: "Ocasión consentida" },
        dateField("consentOn", "Consentimiento explícito recibido el", false),
        dateField("reminderOn", "Fecha del recordatorio", false),
        assigned,
        { key: "nextAction", label: "Acción consentida", type: "textarea" },
      ];
    case "campaigns":
      return [
        { key: "slug", label: "Slug de la campaña" },
        { key: "title", label: "Título" },
        { key: "description", label: "Descripción", type: "textarea" },
        {
          key: "body",
          label: "Texto revisado",
          type: "textarea",
          help: "Sin promesas de stock, material, precio o plazo no confirmado.",
        },
        {
          key: "categorySlugs",
          label: "Colecciones existentes",
          type: "multi",
          choices: context.categories.map((c) => ({
            value: c.slug,
            label: c.name,
          })),
        },
        {
          key: "guideSlugs",
          label: "Guías existentes",
          type: "multi",
          choices: context.guides.map((g) => ({
            value: g.slug,
            label: g.title,
          })),
        },
        {
          key: "productSlugs",
          label: "Slugs de modelos reales aprobados",
          type: "multi",
          help: "Separá con comas. Nunca conceptos. Revisá cada ficha antes de compartir.",
        },
        {
          key: "publicEnabled",
          label: "Publicar explícitamente al guardar en la base",
          type: "checkbox",
        },
      ];
  }
}
function blankRecord(key: Collection, workspace: SalesWorkspace): RecordData {
  const id = crypto.randomUUID();
  const today = operationsToday();
  let n = 1;
  while (
    workspace.enquiries.some(
      (e) => e.alias === `consulta-${String(n).padStart(3, "0")}`
    )
  )
    n++;
  const alias = `consulta-${String(n).padStart(3, "0")}`;
  switch (key) {
    case "quoteRevisions":
      return {
        id,
        quotationId: "",
        revisionNumber: 1,
        createdOn: today,
        reason: "",
        status: "draft",
        snapshot: null,
        acceptedOn: null,
        acceptanceEvidence: null,
      };
    case "sampleInspections":
      return {
        id,
        supplierQuotationId: "",
        inspectedOn: "",
        widthMm: null,
        interiorDiameterMm: null,
        weightGrams: null,
        finish: "",
        evidenceReference: "",
        outcome: "review",
        notes: "",
      };
    case "supplierPerformanceRecords":
      return {
        id,
        supplierQuotationId: "",
        requestedOn: "",
        respondedOn: null,
        promisedOn: null,
        receivedOn: null,
        fulfilledUnitCount: null,
        issue: null,
        evidenceReference: "",
        resolvedOn: null,
        resolutionEvidence: null,
      };
    case "demandRequests":
      return {
        id,
        enquiryId: "",
        modelSlug: "",
        sizeSystem: "unknown",
        requestedSize: null,
        quantity: 1,
        unit: "",
        notedOn: today,
        status: "requested",
      };
    case "purchasingDrafts":
      return {
        id,
        supplierQuotationId: "",
        enquiryIds: [],
        quantity: 1,
        unit: "",
        estimatedCosts: emptyCosts(),
        availableCapitalPyg: null,
        createdOn: today,
        reviewedOn: null,
        reviewEvidence: null,
        status: "draft",
        notes: "",
      };
    case "quoteComparisons":
      return {
        id,
        enquiryId: "",
        quotationIds: [],
        createdOn: today,
        criteria: "",
        selectedQuotationId: null,
        decisionNotes: "",
      };
    case "enquiries":
      return {
        id,
        alias,
        designSlugs: [],
        categorySlug: null,
        stage: "new",
        assignedOwner: "",
        createdOn: today,
        nextActionOn: null,
        nextAction: "",
        lossReason: null,
      };
    case "supplierQuotations":
      return {
        id,
        supplier: "",
        reference: "",
        source: "",
        productId: null,
        unit: "",
        size: "",
        quotedOn: "",
        expiresOn: null,
        availabilityConfirmedAt: null,
        terms: "",
        costs: emptyCosts(),
      };
    case "customerQuotations":
      return {
        id,
        alias,
        enquiryId: null,
        createdOn: today,
        expiresOn: null,
        lines: [],
        serviceOptionIds: [],
        servicesSnapshot: [],
        deliveryPyg: null,
        deliveryConditions: "",
        deliveryConfirmedOn: null,
        status: "draft",
      };
    case "fulfilledSales":
      return {
        id,
        quotationId: null,
        enquiryId: null,
        productId: null,
        model: "",
        supplier: "",
        fulfilledOn: "",
        revenuePyg: null,
        refundPyg: null,
        costs: emptyCosts(),
        ownerReported: true,
      };
    case "productCostProfiles":
      return {
        id,
        productId: null,
        variantId: null,
        unit: "",
        costs: emptyCosts(),
        targetContributionPyg: null,
        confirmedOn: "",
      };
    case "serviceOptions":
      return {
        id,
        name: "",
        kind: "packaging",
        terms: "",
        pricePyg: null,
        confirmedOn: "",
        enabled: false,
      };
    case "aftersalesCases":
      return {
        id,
        saleId: "",
        alias,
        kind: "fit",
        openedOn: today,
        assignedOwner: "",
        nextActionOn: null,
        evidenceReference: "",
        resolution: "",
        status: "open",
      };
    case "occasionReminders":
      return {
        id,
        alias,
        occasion: "",
        reminderOn: "",
        consentOn: "",
        nextAction: "",
        assignedOwner: "",
      };
    case "campaigns":
      return {
        id,
        slug: "",
        title: "",
        description: "",
        body: "",
        categorySlugs: [],
        guideSlugs: [],
        productSlugs: [],
        publicEnabled: false,
      };
  }
}
function getValue(record: RecordData, path: string): unknown {
  const [key = "", nested] = path.split(".");
  return nested ? (record[key] as RecordData)?.[nested] : record[key];
}
function setValue(
  record: RecordData,
  path: string,
  value: unknown
): RecordData {
  const [key = "", nested] = path.split(".");
  return nested
    ? { ...record, [key]: { ...(record[key] as RecordData), [nested]: value } }
    : { ...record, [key]: value };
}
function FieldInput({
  field,
  record,
  change,
  prefix,
}: {
  field: Field;
  record: RecordData;
  change: (key: string, value: unknown) => void;
  prefix: string;
}) {
  const value = getValue(record, field.key);
  const inputId = `${prefix}-${field.key}`;
  const choices = field.choices ?? [];
  return (
    <div
      className={`${styles.field} ${field.type === "textarea" || field.type === "multi" ? styles.wide : ""}`}
    >
      <label htmlFor={inputId}>{field.label}</label>
      {field.type === "checkbox" ? (
        <input
          id={inputId}
          type="checkbox"
          checked={value === true}
          onChange={(e) => change(field.key, e.target.checked)}
        />
      ) : field.type === "select" ? (
        <select
          id={inputId}
          value={String(value ?? "")}
          onChange={(e) =>
            change(
              field.key,
              field.nullable && !e.target.value ? null : e.target.value
            )
          }
        >
          <option value="">Sin definir</option>
          {choices.map((c) => (
            <option value={c.value} key={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      ) : field.type === "multi" && field.choices ? (
        <div className={styles.actions}>
          {choices.length === 0 && <span>No hay opciones confirmadas.</span>}
          {choices.map((c) => (
            <label key={c.value}>
              <input
                type="checkbox"
                checked={Array.isArray(value) && value.includes(c.value)}
                onChange={(e) =>
                  change(
                    field.key,
                    e.target.checked
                      ? [...(Array.isArray(value) ? value : []), c.value]
                      : (Array.isArray(value) ? value : []).filter(
                          (s) => s !== c.value
                        )
                  )
                }
              />{" "}
              {c.label}
            </label>
          ))}
        </div>
      ) : field.type === "textarea" ? (
        <textarea
          id={inputId}
          value={String(value ?? "")}
          onChange={(e) => change(field.key, e.target.value)}
        />
      ) : (
        <input
          id={inputId}
          type={
            field.type === "number"
              ? "number"
              : field.type === "date"
                ? "date"
                : "text"
          }
          min={field.type === "number" ? 0 : undefined}
          step={field.type === "number" ? (field.step ?? 1) : undefined}
          value={Array.isArray(value) ? value.join(", ") : String(value ?? "")}
          onChange={(e) =>
            change(
              field.key,
              field.type === "number"
                ? operationsNullableNumber(e.target.value)
                : field.type === "multi"
                  ? e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean)
                  : field.nullable && !e.target.value
                    ? null
                    : e.target.value
            )
          }
        />
      )}
      {field.help && <small className={styles.muted}>{field.help}</small>}
    </div>
  );
}

function RecordEditor({
  collection,
  initial,
  workspace,
  context,
  apply,
  cancel,
  onDraftChange,
}: {
  collection: Collection;
  initial: RecordData;
  workspace: SalesWorkspace;
  context: Context;
  apply: (record: RecordData) => void;
  cancel: () => void;
  onDraftChange: () => void;
}) {
  const [record, setRecord] = useState(initial);
  const [error, setError] = useState("");
  const [consent, setConsent] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const change = (key: string, value: unknown) => {
    onDraftChange();
    setRecord((old) => {
      if (collection === "quoteRevisions" && key === "quotationId") {
        const quote = workspace.customerQuotations.find((q) => q.id === value);
        const versions = workspace.quoteRevisions.filter(
          (r) => r.quotationId === value
        );
        return {
          ...old,
          quotationId: value,
          snapshot: quote ? structuredClone(quote) : null,
          revisionNumber:
            Math.max(0, ...versions.map((r) => r.revisionNumber)) + 1,
        };
      }
      if (collection === "purchasingDrafts" && key === "supplierQuotationId") {
        const q = workspace.supplierQuotations.find((s) => s.id === value);
        return {
          ...old,
          supplierQuotationId: value,
          unit: q?.unit ?? "",
          estimatedCosts: q ? { ...q.costs } : emptyCosts(),
        };
      }
      return setValue(old, key, value);
    });
  };
  const lines = (record.lines ?? []) as RecordData[];
  function submit(e: FormEvent) {
    e.preventDefault();
    if (collection === "occasionReminders" && !consent) {
      setError(
        "Confirmá que recibiste consentimiento explícito para esta ocasión y acción."
      );
      return;
    }
    if (collection === "fulfilledSales" && !consent) {
      setError(
        "Confirmá que esta venta fue efectivamente entregada y que los importes son reales."
      );
      return;
    }
    if (
      ((collection === "quoteRevisions" && record.status === "accepted") ||
        (collection === "purchasingDrafts" && record.status === "reviewed")) &&
      !consent
    ) {
      setError("Confirmá la acción manual y su evidencia antes de aplicar.");
      return;
    }
    let candidate = record;
    if (
      collection === "customerQuotations" &&
      record.status === "review_ready"
    ) {
      const previous = (initial.servicesSnapshot ?? []) as RecordData[];
      const selectedIds = record.serviceOptionIds as string[];
      const snapshot =
        initial.status === "review_ready" || previous.length
          ? previous
          : workspace.serviceOptions
              .filter((s) => s.enabled && selectedIds.includes(s.id))
              .map(({ id, name, terms, pricePyg, confirmedOn }) => ({
                id,
                name,
                terms,
                pricePyg,
                confirmedOn,
              }));
      candidate = { ...record, servicesSnapshot: snapshot };
    }
    const parsed = schemas[collection].safeParse(candidate);
    if (!parsed.success) {
      setError(
        parsed.error.issues
          .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
          .join(" · ")
      );
      return;
    }
    apply(parsed.data as RecordData);
  }
  return (
    <form
      onSubmit={submit}
      className={styles.section}
      aria-label={`Editar ${labels[collection]}`}
    >
      <h3>
        {workspace[collection].some((r) => r.id === initial.id)
          ? "Editar registro"
          : "Nuevo registro"}{" "}
        · {labels[collection]}
      </h3>
      <p className={styles.muted}>
        Aplicar agrega el registro al borrador de esta pantalla. Guardar en la
        base es una acción separada.
      </p>
      {collection === "quoteRevisions" && (
        <>
          <p className={styles.notice}>
            Se conserva una copia de la cotización seleccionada con su número de
            revisión. Para cambiar modelos o términos, editá primero la
            cotización y después preservá una revisión nueva. Aceptar no crea
            pedido ni pago.
          </p>
          {record.snapshot !== null && (
            <pre className={styles.preview}>
              {operationsQuoteText(
                record.snapshot as CustomerQuotation,
                workspace,
                "Cotización preservada"
              )}
            </pre>
          )}
          {record.status === "accepted" && (
            <label className={styles.field}>
              <span>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                Confirmo que recibí aceptación real de esta revisión; la
                evidencia indicada es una referencia interna.
              </span>
            </label>
          )}
        </>
      )}
      {collection === "purchasingDrafts" && (
        <>
          <p className={styles.notice}>
            Borrador interno por la unidad del proveedor. Completar costos y
            revisar capital no envía una orden, contacta al proveedor, reserva
            ni paga.
          </p>
          {record.status === "reviewed" && (
            <label className={styles.field}>
              <span>
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                />{" "}
                Revisé cantidades, costos, capital y evidencia antes de marcar
                este borrador.
              </span>
            </label>
          )}
        </>
      )}
      {["supplierQuotations", "productCostProfiles", "fulfilledSales"].includes(
        collection
      ) && (
        <p className={styles.notice}>
          {collection === "fulfilledSales"
            ? "Ingreso, reembolso y costos totales reales de esta misma venta entregada"
            : "Costos por la misma unidad confirmada"}
          , en PYG enteros. Vacío significa desconocido. Ingresá 0 sólo si
          verificaste que ese costo es cero.
        </p>
      )}
      <div className={styles.form}>
        {fieldsFor(collection, workspace, context).map((field) => (
          <fieldset
            key={field.key}
            disabled={
              (collection === "customerQuotations" &&
                initial.status === "review_ready" &&
                field.key === "serviceOptionIds") ||
              (collection === "quoteRevisions" &&
                workspace.quoteRevisions.some((r) => r.id === initial.id) &&
                field.key === "quotationId")
            }
            className={
              field.type === "textarea" || field.type === "multi"
                ? styles.wide
                : undefined
            }
          >
            <FieldInput
              field={
                collection === "sampleInspections" && field.type === "number"
                  ? { ...field, step: 0.01 }
                  : field
              }
              record={record}
              change={change}
              prefix={String(record.id)}
            />
          </fieldset>
        ))}
      </div>
      {collection === "customerQuotations" && (
        <div className={styles.section}>
          {initial.status === "review_ready" && (
            <p className={styles.notice}>
              Esta propuesta conserva los precios y condiciones de servicios de
              su primera revisión. Para elegir otros servicios, creá otra
              cotización.
            </p>
          )}
          <h3>Líneas de modelos confirmados</h3>
          <p className={styles.muted}>
            Elegí una cotización real del proveedor y confirmá fuente, modelo,
            unidad y precio para el comprador. Los costos privados no se copian.
          </p>
          <label className={styles.field}>
            Cotización del proveedor
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
            >
              <option value="">Elegí una referencia real</option>
              {workspace.supplierQuotations.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.supplier} · {q.reference}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={!supplierId}
            onClick={() => {
              const q = workspace.supplierQuotations.find(
                (v) => v.id === supplierId
              );
              if (q)
                change("lines", [
                  ...lines,
                  {
                    id: crypto.randomUUID(),
                    supplierQuotationId: q.id,
                    productId: q.productId,
                    productSlug: "",
                    model: q.reference,
                    source: "source" in q ? q.source : "",
                    confirmedOn: "",
                    unit: q.unit,
                    quantity: 1,
                    unitPricePyg: null,
                  },
                ]);
            }}
          >
            Agregar modelo del proveedor
          </button>
          {lines.length === 0 && (
            <p className={styles.empty}>
              Todavía no hay líneas. Primero registrá una cotización real del
              proveedor.
            </p>
          )}
          {lines.map((line, index) => (
            <fieldset className={styles.section} key={String(line.id)}>
              <legend>Modelo {index + 1}</legend>
              <div className={styles.form}>
                {[
                  { key: "productSlug", label: "Slug del producto real" },
                  { key: "model", label: "Modelo confirmado para comprador" },
                  { key: "source", label: "Fuente real verificable" },
                  dateField("confirmedOn", "Modelo confirmado el", false),
                  {
                    key: "unit",
                    label: "Unidad confirmada",
                    type: "select",
                    choices: [
                      { value: "single", label: "Un anillo" },
                      { value: "pair", label: "Par de dos anillos" },
                    ],
                  },
                  numField("quantity", "Cantidad de unidades", false),
                  numField(
                    "unitPricePyg",
                    "Precio confirmado por unidad (PYG)",
                    false
                  ),
                ].map((field) => (
                  <FieldInput
                    key={field.key}
                    field={field as Field}
                    record={line}
                    prefix={String(line.id)}
                    change={(key, value) =>
                      change(
                        "lines",
                        lines.map((l, i) =>
                          i === index ? setValue(l, key, value) : l
                        )
                      )
                    }
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() =>
                  change(
                    "lines",
                    lines.filter((_, i) => i !== index)
                  )
                }
              >
                Quitar línea {index + 1}
              </button>
            </fieldset>
          ))}
        </div>
      )}
      {collection === "occasionReminders" && (
        <label className={styles.field}>
          <span>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />{" "}
            Recibí consentimiento explícito para guardar este recordatorio y
            preparar esta acción manual.
          </span>
        </label>
      )}
      {collection === "fulfilledSales" && (
        <>
          <p className={styles.notice}>
            Esto registra una venta efectivamente entregada e informada por el
            dueño. No crea un pedido, movimiento de inventario, pago ni
            reembolso.
          </p>
          <label className={styles.field}>
            <span>
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />{" "}
              Confirmo que esta venta fue entregada y que informo importes
              reales; los costos que no conozco quedan vacíos.
            </span>
          </label>
        </>
      )}
      {error && (
        <p role="alert" className={styles.notice}>
          {error}
        </p>
      )}
      <div className={styles.actions}>
        <button className={styles.primary} type="submit">
          Aplicar al borrador
        </button>
        <button type="button" onClick={cancel}>
          Cancelar edición
        </button>
      </div>
    </form>
  );
}

export function SalesOperations({
  initial,
  initialError,
  storeName,
  origin,
  categories,
  guides,
}: Props) {
  const [workspace, setWorkspace] = useState(initial.workspace);
  const liveWorkspace = useRef(workspace);
  useEffect(() => {
    liveWorkspace.current = workspace;
  }, [workspace]);
  const [saved, setSaved] = useState(initial.workspace);
  const [revision, setRevision] = useState(initial.revision);
  const [migration, setMigration] = useState(initial.migrationRequired);
  const [unavailable, setUnavailable] = useState(initialError ?? "");
  const [tab, setTab] = useState<WorkspaceTab>("inbox");
  const [editor, setEditor] = useState<{
    collection: Collection;
    record: RecordData;
  } | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [conflict, setConflict] = useState(false);
  const [conflictReason, setConflictReason] = useState(
    "Otra pantalla guardó una versión más reciente. Tu borrador sigue intacto. Exportalo antes de decidir qué conservar."
  );
  const [reloadReview, setReloadReview] =
    useState<SalesWorkspaceSnapshot | null>(null);
  const [importReview, setImportReview] = useState<SalesWorkspace | null>(null);
  const [importText, setImportText] = useState("");
  const [deleteId, setDeleteId] = useState("");
  const [manualDraft, setManualDraft] = useState("");
  const [printQuote, setPrintQuote] = useState<CustomerQuotation | null>(null);
  const [comparisonId, setComparisonId] = useState<string | null>(null);
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [testedPrice, setTestedPrice] = useState<number | null>(null);
  const [testedUnit, setTestedUnit] = useState<"single" | "pair">("single");
  const [searchGaps, setSearchGaps] = useState<
    { day: string; intent: string; count: number }[] | null
  >(null);
  const dirty = JSON.stringify(workspace) !== JSON.stringify(saved);
  const today = operationsToday();
  const due = overdueEnquiries(workspace, today);
  const context = { categories, guides };
  useEffect(() => {
    if (!dirty && !editorDirty) return;
    const warn = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty, editorDirty]);
  const notice = (text: string) => setMessage(text);
  const changeWorkspace = (next: SalesWorkspace) => {
    setWorkspace(next);
    setMessage(
      "Borrador modificado. Guardá explícitamente para sincronizarlo."
    );
  };
  async function save() {
    if (editorDirty || editor) {
      notice(
        "Aplicá o cancelá el formulario abierto antes de guardar el espacio."
      );
      return;
    }
    const parsed = SalesWorkspaceSchema.safeParse(workspace);
    if (!parsed.success) {
      notice(parsed.error.issues.map((i) => i.message).join(" · "));
      return;
    }
    setBusy(true);
    try {
      const result = await saveSalesWorkspaceAction({
        revision,
        workspace: parsed.data,
      });
      if (result.ok) {
        const latestDraft = SalesWorkspaceSchema.safeParse(
          liveWorkspace.current
        );
        const changedWhileSaving =
          !latestDraft.success ||
          JSON.stringify(latestDraft.data) !== JSON.stringify(parsed.data);
        setSaved(result.snapshot.workspace);
        setRevision(result.snapshot.revision);
        if (changedWhileSaving) {
          setConflict(true);
          setConflictReason(
            "Hiciste cambios nuevos mientras se guardaba. Tu borrador permanece intacto; la versión de la base contiene las copias previas preservadas. Exportá tu borrador y revisá antes de reemplazarlo."
          );
          setReloadReview(result.snapshot);
          notice(
            "Guardado completado. Tus cambios posteriores siguen sin guardar."
          );
        } else {
          setWorkspace(result.snapshot.workspace);
          setConflict(false);
          notice(
            "Guardado en la base con sus copias previas preservadas. Disponible en tus otros dispositivos."
          );
        }
      } else {
        setConflict(result.code === "conflict");
        setConflictReason(
          "Otra pantalla guardó una versión más reciente. Tu borrador sigue intacto. Exportalo antes de decidir qué conservar."
        );
        if (result.code === "migration_required") setMigration(true);
        notice(result.error);
      }
    } catch {
      notice(
        "No se pudo guardar. Tu borrador sigue en esta pantalla; exportalo si necesitás conservarlo."
      );
    } finally {
      setBusy(false);
    }
  }
  async function reviewReload() {
    setBusy(true);
    try {
      const result = await readSalesWorkspaceAction();
      if (result.ok) {
        setReloadReview(result.snapshot);
        notice("Revisá la versión de la base antes de descartar tu borrador.");
      } else notice(result.error);
    } catch {
      notice("No se pudo leer la base. Tu borrador permanece intacto.");
    } finally {
      setBusy(false);
    }
  }
  function confirmReload() {
    if (!reloadReview) return;
    setWorkspace(reloadReview.workspace);
    setSaved(reloadReview.workspace);
    setRevision(reloadReview.revision);
    setMigration(reloadReview.migrationRequired);
    setUnavailable("");
    setEditor(null);
    setEditorDirty(false);
    setReloadReview(null);
    setConflict(false);
    setPrintQuote(null);
    setComparisonId(null);
    setManualDraft("");
    setImportReview(null);
    setImportText("");
    setDeleteId("");
    notice(
      "Se abrió la versión guardada. Se descartó el borrador con tu confirmación."
    );
  }
  function edit(collection: Collection, record?: RecordData) {
    if (editor) {
      notice(
        "Aplicá o cancelá el formulario abierto antes de cambiar de registro."
      );
      return;
    }
    setTab(collection);
    setEditor({
      collection,
      record: record ?? blankRecord(collection, workspace),
    });
    setEditorDirty(false);
  }
  function applyRecord(record: RecordData) {
    if (!editor) return;
    const key = editor.collection;
    const rows = workspace[key];
    const next = {
      ...workspace,
      [key]: rows.some((r) => r.id === record.id)
        ? rows.map((r) => (r.id === record.id ? record : r))
        : [...rows, record],
    } as SalesWorkspace;
    const validation = SalesWorkspaceSchema.safeParse(next);
    if (!validation.success) {
      notice(validation.error.issues.map((i) => i.message).join(" · "));
      return;
    }
    changeWorkspace(validation.data);
    setEditor(null);
    setEditorDirty(false);
  }
  function remove(collection: Collection, id: string) {
    const next = {
      ...workspace,
      [collection]: workspace[collection].filter((r) => r.id !== id),
    };
    const valid = SalesWorkspaceSchema.safeParse(next);
    if (!valid.success) {
      notice(
        "No se puede quitar: otro registro lo usa. Desvinculá o quitá primero las referencias relacionadas."
      );
      setDeleteId("");
      return;
    }
    changeWorkspace(valid.data);
    setDeleteId("");
  }
  async function copy(text: string) {
    setManualDraft(text);
    try {
      await navigator.clipboard.writeText(text);
      notice(
        "Borrador copiado. Revisalo y enviá por tu cuenta; no se envió ningún mensaje."
      );
    } catch {
      notice("Copiá el texto manualmente. No se envió ningún mensaje.");
    }
  }
  function exportWorkspace() {
    if (editor) {
      notice(
        "Aplicá o cancelá el formulario antes de exportar: el archivo sólo incluye registros aplicados al borrador."
      );
      return;
    }
    const text = JSON.stringify(workspace, null, 2);
    const url = URL.createObjectURL(
      new Blob([text], { type: "application/json" })
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `espacio-ventas-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    notice(
      "Exportado el borrador privado de esta pantalla. Guardá el archivo en un lugar protegido."
    );
  }
  function reviewImport(text: string) {
    try {
      if (new TextEncoder().encode(text).length > MAX_WORKSPACE_BYTES)
        throw new Error("El archivo excede el límite permitido.");
      const result = SalesWorkspaceSchema.safeParse(JSON.parse(text));
      if (!result.success)
        throw new Error(result.error.issues.map((i) => i.message).join(" · "));
      setImportReview(result.data);
      notice(
        "Importación validada. Revisá los conteos antes de reemplazar el borrador."
      );
    } catch (e) {
      setImportReview(null);
      notice(e instanceof Error ? e.message : "Archivo inválido.");
    }
  }
  function describe(row: RecordData) {
    return String(
      row.alias ??
        row.reference ??
        row.model ??
        row.modelSlug ??
        row.name ??
        row.title ??
        (row.revisionNumber
          ? `Revisión ${row.revisionNumber}`
          : row.supplierQuotationId
            ? workspace.supplierQuotations.find(
                (q) => q.id === row.supplierQuotationId
              )?.reference
            : row.enquiryId
              ? workspace.enquiries.find((q) => q.id === row.enquiryId)?.alias
              : null) ??
        `Producto ${row.productId}`
    );
  }
  function detail(collection: Collection, row: RecordData) {
    if (collection === "quoteRevisions")
      return `Revisión ${row.revisionNumber} · ${{ draft: "Borrador preservado", review_ready: "Revisada", accepted: "Aceptación manual informada" }[String(row.status) as "draft" | "review_ready" | "accepted"]} · ${operationsDay(String(row.createdOn))}`;
    if (collection === "sampleInspections")
      return `${operationsDay(String(row.inspectedOn))} · ${{ pass: "Conforme a muestra", review: "Requiere revisión", reject: "No conforme" }[String(row.outcome) as "pass" | "review" | "reject"]} · Ancho: ${row.widthMm ?? "desconocido"} mm · Interior: ${row.interiorDiameterMm ?? "desconocido"} mm`;
    if (collection === "supplierPerformanceRecords")
      return `Solicitud: ${operationsDay(String(row.requestedOn))} · Respuesta: ${operationsDay(row.respondedOn as string | null)} · Recepción: ${operationsDay(row.receivedOn as string | null)} · Resolución: ${operationsDay(row.resolvedOn as string | null)}`;
    if (collection === "demandRequests")
      return `${row.quantity} ${row.unit === "pair" ? "pares" : "anillos"} · Medida solicitada: ${row.requestedSize ?? "desconocida"} · ${operationsDay(String(row.notedOn))}`;
    if (collection === "purchasingDrafts")
      return `${row.quantity} ${row.unit === "pair" ? "pares" : "anillos"} · ${row.status === "reviewed" ? "Revisión manual informada" : "Borrador interno"}`;
    if (collection === "quoteComparisons")
      return `${(row.quotationIds as string[]).length} alternativas para revisar · ${operationsDay(String(row.createdOn))}`;
    if (collection === "enquiries")
      return `${stageLabels[String(row.stage)]} · ${row.assignedOwner || "Sin asignar"} · ${operationsDay(row.nextActionOn as string | null)}`;
    if (collection === "supplierQuotations") {
      const q = workspace.supplierQuotations.find((v) => v.id === row.id)!;
      const freshness = {
        unknown: "Disponibilidad sin confirmar",
        expired: "Cotización vencida",
        stale: "Reconfirmar disponibilidad",
        current: "Confirmación reciente (no stock de tienda)",
      };
      return `${q.supplier} · ${q.unit === "pair" ? "Par de dos anillos" : "Un anillo"} · Costos por unidad: ${operationsMoney(costTotal(q.costs))} · ${freshness[supplierFreshness(q, today)]}`;
    }
    if (collection === "fulfilledSales")
      return `Contribución: ${operationsMoney(saleContribution(workspace.fulfilledSales.find((s) => s.id === row.id)!))} · ${operationsDay(String(row.fulfilledOn))}`;
    if (collection === "productCostProfiles") {
      const profile = workspace.productCostProfiles.find(
        (p) => p.id === row.id
      )!;
      const floor = priceFloor(profile);
      return `Piso para tu objetivo por ${profile.unit === "pair" ? "par de dos anillos" : "anillo"}: ${operationsMoney(floor)}${testedPrice !== null && floor !== null && profile.unit === testedUnit && testedPrice < floor ? " · Atención: precio ensayado por debajo del piso" : ""}`;
    }
    if (collection === "occasionReminders")
      return `${operationsDay(String(row.reminderOn))} · Consentimiento: ${operationsDay(String(row.consentOn))}`;
    if (collection === "customerQuotations")
      return `${row.status === "review_ready" ? "Revisada para confirmar" : "Borrador"} · ${operationsDay(String(row.createdOn))}`;
    if (collection === "campaigns")
      return row.publicEnabled
        ? "Habilitada públicamente al guardar"
        : "Borrador privado";
    return String(row.status ?? row.terms ?? "Registro privado");
  }
  const reportRows = workspace.fulfilledSales.filter(
    (s) =>
      (!periodFrom || s.fulfilledOn >= periodFrom) &&
      (!periodTo || s.fulfilledOn <= periodTo)
  );
  const completeSales = reportRows.filter((s) => saleContribution(s) !== null);
  const reportTotal = completeSales.length
    ? completeSales.reduce((sum, s) => sum + saleContribution(s)!, 0)
    : null;
  const printSheet = printQuote
    ? operationsCustomerSheet(printQuote, workspace, storeName)
    : null;
  const printQuoteSaved = Boolean(
    printQuote &&
    JSON.stringify(
      saved.customerQuotations.find((q) => q.id === printQuote.id)
    ) === JSON.stringify(printQuote)
  );
  return (
    <div
      className={styles.workspace}
      data-testid="sales-operations"
      data-sales-workspace
    >
      <div className={styles.toolbar}>
        <p>
          <strong>Espacio privado del dueño</strong>
          <br />
          {unavailable
            ? "No se pudo abrir la versión guardada."
            : dirty || editorDirty
              ? "Tenés cambios sin guardar."
              : "Versión guardada en la base."}{" "}
          · Revisión {revision}. No hay guardado automático.
        </p>
        <button
          className={styles.primary}
          disabled={
            busy ||
            migration ||
            Boolean(unavailable) ||
            conflict ||
            Boolean(editor)
          }
          onClick={save}
        >
          Guardar en la base
        </button>
        <button disabled={busy} onClick={reviewReload}>
          Revisar versión guardada
        </button>
        <button onClick={exportWorkspace}>Exportar borrador privado</button>
      </div>
      {unavailable && (
        <p role="alert" className={styles.notice}>
          No se pudo abrir el espacio guardado: {unavailable}. El guardado está
          bloqueado para proteger los datos existentes. Revisá la versión
          guardada antes de reemplazar el espacio.
        </p>
      )}
      {migration && (
        <p className={styles.notice}>
          La base necesita la migración de este espacio. No se guardará hasta
          que se aplique en un despliegue autorizado. Podés exportar tu borrador
          privado.
        </p>
      )}
      {conflict && (
        <div role="alert" className={styles.notice}>
          {conflictReason}
          <button disabled={busy} onClick={reviewReload}>
            Revisar para recargar o descartar
          </button>
        </div>
      )}
      {reloadReview && (
        <div className={styles.notice}>
          <strong>Versión de la base: revisión {reloadReview.revision}</strong>
          <p>
            {reloadReview.workspace.enquiries.length} consultas ·{" "}
            {reloadReview.workspace.customerQuotations.length} cotizaciones ·{" "}
            {reloadReview.workspace.fulfilledSales.length} ventas informadas.
          </p>
          <p>
            Abrirla descartará los cambios y el formulario de esta pantalla. No
            se combinarán automáticamente.
          </p>
          <div className={styles.actions}>
            <button onClick={confirmReload}>
              Descartar mi borrador y abrir esta versión
            </button>
            <button onClick={() => setReloadReview(null)}>
              Conservar mi borrador
            </button>
          </div>
        </div>
      )}
      {message && (
        <p role="status" className={styles.status}>
          {message}
        </p>
      )}
      {tab === "inbox" && (
        <section className={styles.section}>
          <h2>Necesidades sin resultados</h2>
          <p className={styles.muted}>
            Sólo conteos por intención y día. No se guardan búsquedas
            originales, nombres, emails ni teléfonos; no es atribución
            publicitaria ni ventas.
          </p>
          <label className={styles.field}>
            <span>
              <input
                type="checkbox"
                checked={workspace.searchGapCollectionEnabled}
                onChange={(e) =>
                  changeWorkspace({
                    ...workspace,
                    searchGapCollectionEnabled: e.target.checked,
                  })
                }
              />{" "}
              Habilitar conteos mínimos al guardar en la base
            </span>
          </label>
          <button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              try {
                const result = await readSalesSearchGapsAction();
                if (result.ok) setSearchGaps(result.rows);
                else notice(result.error);
              } catch {
                notice("No se pudieron leer los conteos.");
              } finally {
                setBusy(false);
              }
            }}
          >
            Leer conteos guardados
          </button>
          {searchGaps &&
            (searchGaps.length ? (
              <div className={styles.list}>
                {searchGaps.map((gap) => (
                  <p key={`${gap.day}-${gap.intent}`}>
                    {operationsDay(gap.day)} ·{" "}
                    {(
                      {
                        steel: "Acero",
                        silver: "Plata",
                        gold: "Oro",
                        wedding: "Alianzas",
                        engagement: "Compromiso",
                        promise: "Promesa",
                        solitaire: "Solitarios",
                        men: "Hombre",
                        sizing: "Talles",
                        other: "Otro",
                      } as Record<string, string>
                    )[gap.intent] ?? "Otra intención"}
                    : {gap.count}
                  </p>
                ))}
              </div>
            ) : (
              <p className={styles.empty}>
                Todavía no hay conteos guardados. Activá la recolección sólo si
                te resulta útil para evaluar necesidades.
              </p>
            ))}
        </section>
      )}
      <p className={styles.muted}>
        Sólo alias anónimos y referencias internas. No guardés teléfonos,
        emails, nombres ni conversaciones. Las consultas y los clics no son
        ventas. Ninguna herramienta envía mensajes, cobra ni reserva.
      </p>
      <p className={styles.muted}>
        Quitar un registro cambia el borrador y, después de guardar, retira el
        registro activo. El historial puede conservarlo para recuperación. Para
        eliminar una consulta y sus registros según tu política, usá Historial y
        privacidad.
      </p>
      <nav className={styles.tabs} aria-label="Secciones del espacio de ventas">
        {(
          [
            "inbox",
            ...Object.keys(labels),
            "history",
            "productFaqs",
            "transfer",
          ] as WorkspaceTab[]
        ).map((key) => (
          <button
            key={key}
            aria-pressed={tab === key}
            onClick={() => {
              if (editor) {
                notice(
                  "Aplicá o cancelá el formulario antes de cambiar de sección."
                );
                return;
              }
              setTab(key);
            }}
          >
            {key === "inbox"
              ? "Bandeja"
              : key === "transfer"
                ? "Respaldo e importación"
                : key === "history"
                  ? "Historial y privacidad"
                  : key === "productFaqs"
                    ? "Preguntas por modelo"
                    : labels[key]}
          </button>
        ))}
      </nav>
      {tab === "inbox" && (
        <>
          <div className={styles.summary}>
            <div className={styles.stat}>
              <strong>{workspace.enquiries.length}</strong>Consultas registradas
            </div>
            <div className={styles.stat}>
              <strong>{due.length}</strong>Acciones para hoy o vencidas
            </div>
            <div className={styles.stat}>
              <strong>
                {
                  workspace.aftersalesCases.filter(
                    (c) => c.status !== "resolved"
                  ).length
                }
              </strong>
              Casos de posventa abiertos
            </div>
          </div>
          <section className={styles.section}>
            <h2>Tu próxima acción</h2>
            <p className={styles.muted}>
              Los seguimientos son manuales. Sólo vos decidís si corresponde
              escribir.
            </p>
            {due.length === 0 ? (
              <p className={styles.empty}>
                No hay seguimientos pendientes. Registrá tu primera consulta y
                definí quién la sigue y cuándo.
              </p>
            ) : (
              <div className={styles.list}>
                {due.map((e) => (
                  <div className={styles.row} key={e.id}>
                    <div>
                      <strong>{e.alias}</strong>
                      <p>
                        {e.nextAction || "Definí la próxima acción"} ·{" "}
                        {e.assignedOwner || "Sin asignar"} ·{" "}
                        {operationsDay(e.nextActionOn)}
                      </p>
                    </div>
                    <div className={styles.actions}>
                      <button
                        onClick={() =>
                          edit("enquiries", e as unknown as RecordData)
                        }
                      >
                        Revisar consulta
                      </button>
                      <button
                        onClick={() =>
                          copy(
                            `Hola. Retomo tu consulta para revisar las opciones y confirmar modelo, medidas, precio y entrega. ¿Querés que continuemos?`
                          )
                        }
                      >
                        Copiar seguimiento manual
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => edit("enquiries")}>Nueva consulta</button>
          </section>
          <section className={styles.section}>
            <h2>Motivos de pérdida</h2>
            {Object.entries(lossCounts(workspace)).length ? (
              <div className={styles.summary}>
                {Object.entries(lossCounts(workspace)).map(
                  ([reason, count]) => (
                    <p key={reason}>
                      {lossLabels[reason]}: <strong>{count}</strong>
                    </p>
                  )
                )}
              </div>
            ) : (
              <p className={styles.muted}>
                Todavía no hay motivos registrados. Usalos al cerrar una
                consulta perdida.
              </p>
            )}
          </section>
          <a className={styles.link} href="/admin/herramientas-ventas">
            Abrir registro local anterior y calculadora
          </a>
        </>
      )}
      {tab !== "inbox" &&
        tab !== "transfer" &&
        tab !== "history" &&
        tab !== "productFaqs" && (
          <section className={styles.section}>
            <div className={styles.actions}>
              <h2>{labels[tab]}</h2>
              <button
                className={styles.primary}
                disabled={Boolean(editor)}
                onClick={() => edit(tab)}
              >
                Nuevo registro
              </button>
            </div>
            {tab === "supplierQuotations" && (
              <p className={styles.muted}>
                Compará referencias, medidas y unidades equivalentes. Una
                cotización incompleta no tiene total conocido; la frescura de
                disponibilidad no representa inventario propio.
              </p>
            )}
            {tab === "occasionReminders" && (
              <p className={styles.muted}>
                Sólo con consentimiento explícito para esta ocasión. Podés
                eliminarlo en cualquier momento. No se programan ni envían
                mensajes.
              </p>
            )}
            {tab === "customerQuotations" && (
              <p className={styles.muted}>
                Armá una propuesta con datos confirmados. La hoja para comprador
                excluye alias, fuentes internas y todos los costos del
                proveedor. Elegí Imprimir y luego Guardar como PDF.
              </p>
            )}
            {tab === "fulfilledSales" && (
              <>
                <p className={styles.muted}>
                  Aportes reales informados por el dueño. No es ganancia neta ni
                  contabilidad: no incluye costos fijos. Los registros con
                  costos o reembolsos desconocidos quedan fuera del total.
                </p>
                <div className={styles.form}>
                  <label className={styles.field}>
                    Desde
                    <input
                      type="date"
                      value={periodFrom}
                      onChange={(e) => setPeriodFrom(e.target.value)}
                    />
                  </label>
                  <label className={styles.field}>
                    Hasta
                    <input
                      type="date"
                      value={periodTo}
                      onChange={(e) => setPeriodTo(e.target.value)}
                    />
                  </label>
                </div>
                <div className={styles.summary}>
                  <div className={styles.stat}>
                    <strong>{reportRows.length}</strong>Ventas entregadas
                    informadas
                  </div>
                  <div className={styles.stat}>
                    <strong>{operationsMoney(reportTotal)}</strong>Contribución
                    de {completeSales.length} registros completos
                  </div>
                  <div className={styles.stat}>
                    <strong>{reportRows.length - completeSales.length}</strong>
                    Registros incompletos excluidos
                  </div>
                </div>
                {["supplier", "model"].map((key) => (
                  <div key={key} className={styles.section}>
                    <h3>
                      Contribución por{" "}
                      {key === "supplier" ? "proveedor" : "modelo"}
                    </h3>
                    {Array.from(
                      new Set(
                        reportRows.map((r) => r[key as "supplier" | "model"])
                      )
                    ).map((value) => {
                      const rows = reportRows.filter(
                        (r) => r[key as "supplier" | "model"] === value
                      );
                      const complete = rows.filter(
                        (r) => saleContribution(r) !== null
                      );
                      return (
                        <p key={value}>
                          {value}:{" "}
                          {operationsMoney(
                            complete.reduce(
                              (sum, r) => sum + saleContribution(r)!,
                              0
                            )
                          )}{" "}
                          · {complete.length} completos / {rows.length}{" "}
                          informados
                        </p>
                      );
                    })}
                  </div>
                ))}
              </>
            )}
            {tab === "productCostProfiles" && (
              <>
                <p className={styles.muted}>
                  El piso usa los ocho costos y tu contribución objetivo por la
                  misma unidad. No cambia precios del catálogo. Recalculá
                  comisiones e impuestos que dependan del precio. Sólo se
                  comparan perfiles de la unidad elegida.
                </p>
                <div className={styles.form}>
                  <label className={styles.field}>
                    Precio que querés ensayar (PYG)
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={testedPrice ?? ""}
                      onChange={(e) =>
                        setTestedPrice(operationsNullableNumber(e.target.value))
                      }
                    />
                  </label>
                  <label className={styles.field}>
                    Unidad del precio ensayado
                    <select
                      value={testedUnit}
                      onChange={(e) =>
                        setTestedUnit(e.target.value as "single" | "pair")
                      }
                    >
                      <option value="single">Un anillo</option>
                      <option value="pair">Par de dos anillos</option>
                    </select>
                  </label>
                </div>
              </>
            )}
            <SalesOperationsEvidence tab={tab} workspace={workspace} />
            {editor?.collection === tab && (
              <RecordEditor
                key={String(editor.record.id)}
                collection={tab}
                initial={editor.record}
                workspace={workspace}
                context={context}
                apply={applyRecord}
                cancel={() => {
                  setEditor(null);
                  setEditorDirty(false);
                }}
                onDraftChange={() => setEditorDirty(true)}
              />
            )}
            {workspace[tab].length === 0 && !editor && (
              <p className={styles.empty}>
                Todavía no hay registros de {labels[tab].toLowerCase()}. Agregá
                datos reales cuando los tengas; no hay precios, proveedores ni
                ventas de ejemplo.
              </p>
            )}
            <div className={styles.list}>
              {workspace[tab].map((row) => (
                <div className={styles.row} key={row.id}>
                  <div>
                    <strong>{describe(row as unknown as RecordData)}</strong>
                    <p>{detail(tab, row as unknown as RecordData)}</p>
                    {tab === "campaigns" && (
                      <p>
                        {origin
                          ? `${origin}/campanas/${(row as SalesWorkspace["campaigns"][number]).slug}`
                          : "Origen público sin configurar"}
                      </p>
                    )}
                  </div>
                  <div className={styles.actions}>
                    <button
                      disabled={
                        Boolean(editor) ||
                        (tab === "quoteRevisions" &&
                          (row as SalesWorkspace["quoteRevisions"][number])
                            .status === "accepted")
                      }
                      onClick={() => edit(tab, row as unknown as RecordData)}
                    >
                      Editar
                    </button>
                    {tab === "customerQuotations" && (
                      <>
                        <button
                          onClick={() =>
                            copy(
                              operationsQuoteText(
                                row as CustomerQuotation,
                                workspace,
                                storeName
                              )
                            )
                          }
                        >
                          Copiar propuesta manual
                        </button>
                        <button
                          disabled={
                            (row as CustomerQuotation).status !== "review_ready"
                          }
                          onClick={() => {
                            setComparisonId(null);
                            setPrintQuote(row as CustomerQuotation);
                          }}
                        >
                          Revisar hoja para PDF
                        </button>
                      </>
                    )}
                    {tab === "quoteComparisons" && (
                      <button
                        onClick={() => {
                          setPrintQuote(null);
                          setComparisonId(row.id);
                        }}
                      >
                        Revisar comparación para PDF
                      </button>
                    )}
                    {tab === "occasionReminders" && (
                      <button
                        onClick={() =>
                          copy(
                            `Hola. Con tu consentimiento, te escribo por ${String((row as SalesWorkspace["occasionReminders"][number]).occasion)}. ¿Querés revisar opciones y confirmar modelo, medidas, precio y entrega?`
                          )
                        }
                      >
                        Copiar recordatorio manual
                      </button>
                    )}
                    {deleteId === row.id ? (
                      <>
                        <button onClick={() => remove(tab, row.id)}>
                          Confirmar retiro del borrador
                        </button>
                        <button onClick={() => setDeleteId("")}>
                          Conservar registro
                        </button>
                      </>
                    ) : (
                      <button
                        disabled={
                          tab === "quoteRevisions" &&
                          (row as SalesWorkspace["quoteRevisions"][number])
                            .status === "accepted"
                        }
                        onClick={() => setDeleteId(row.id)}
                      >
                        Quitar del borrador
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      {tab === "history" && (
        <SalesOperationsHistory
          workspace={workspace}
          revision={revision}
          blocked={
            dirty ||
            Boolean(editor) ||
            busy ||
            migration ||
            Boolean(unavailable)
          }
          onDatabaseChange={(snapshot) => {
            setReloadReview(snapshot);
            notice(
              "La operación quedó guardada. Revisá la copia de la base antes de reemplazar tu pantalla."
            );
          }}
        />
      )}
      {tab === "productFaqs" && (
        <ProductFaqEditor
          faqs={workspace.productFaqs}
          onChange={(productFaqs) =>
            changeWorkspace({ ...workspace, productFaqs })
          }
        />
      )}
      {tab === "transfer" && (
        <section className={styles.section}>
          <h2>Respaldo privado e importación revisada</h2>
          <p className={styles.muted}>
            Este archivo incluye costos y registros privados. No lo publiques ni
            lo envíes a compradores. La importación reemplaza sólo el borrador
            hasta que guardes en la base.
          </p>
          <button onClick={exportWorkspace}>Exportar archivo privado</button>
          <label className={styles.field}>
            Archivo JSON privado
            <input
              type="file"
              accept=".json,application/json"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (file.size > MAX_WORKSPACE_BYTES) {
                    notice("Archivo demasiado grande.");
                    return;
                  }
                  try {
                    reviewImport(await file.text());
                  } catch {
                    notice("No se pudo leer el archivo.");
                  }
                }
              }}
            />
          </label>
          <label className={styles.field}>
            O pegá JSON para revisar
            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </label>
          <button onClick={() => reviewImport(importText)}>
            Validar y revisar importación
          </button>
          {importReview && (
            <div className={styles.notice}>
              <strong>Reemplazo propuesto</strong>
              {(Object.keys(labels) as Collection[]).map((key) => (
                <p key={key}>
                  {labels[key]}: {workspace[key].length} actuales →{" "}
                  {importReview[key].length} importados
                </p>
              ))}
              <p>
                Preguntas por modelo: {workspace.productFaqs.length} actuales →{" "}
                {importReview.productFaqs.length} importadas
              </p>
              <p>
                Preguntas publicadas:{" "}
                {workspace.productFaqs.filter((faq) => faq.published).length}{" "}
                actuales →{" "}
                {importReview.productFaqs.filter((faq) => faq.published).length}{" "}
                importadas
              </p>
              <p>
                Campañas públicas:{" "}
                {
                  workspace.campaigns.filter(
                    (campaign) => campaign.publicEnabled
                  ).length
                }{" "}
                actuales →{" "}
                {
                  importReview.campaigns.filter(
                    (campaign) => campaign.publicEnabled
                  ).length
                }{" "}
                importadas
              </p>
              {importReview.productFaqs.map((faq) => (
                <details key={faq.id}>
                  <summary>
                    {faq.productSlug}: {faq.question} ·{" "}
                    {faq.published ? "Publicar al guardar" : "Privada"}
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
              <p>
                Conteos de búsquedas sin resultados:{" "}
                {workspace.searchGapCollectionEnabled
                  ? "habilitados"
                  : "apagados"}{" "}
                →{" "}
                {importReview.searchGapCollectionEnabled
                  ? "habilitados"
                  : "apagados"}
              </p>
              <p>
                La importación también reemplaza el contenido y el estado
                público de las preguntas y campañas. Revisá sus textos en el
                borrador antes de guardar.
              </p>
              <p>
                Exportá lo actual antes de reemplazar. No se combinarán datos.
              </p>
              <div className={styles.actions}>
                <button
                  onClick={() => {
                    changeWorkspace(importReview);
                    setPrintQuote(null);
                    setComparisonId(null);
                    setManualDraft("");
                    setDeleteId("");
                    setImportText("");
                    setImportReview(null);
                  }}
                >
                  Confirmar reemplazo del borrador
                </button>
                <button onClick={() => setImportReview(null)}>
                  Cancelar importación
                </button>
              </div>
            </div>
          )}
        </section>
      )}
      {manualDraft && (
        <section className={styles.section}>
          <h2>Borrador para copiar y enviar manualmente</h2>
          <textarea
            className={styles.preview}
            aria-label="Texto para copiar manualmente"
            readOnly
            value={manualDraft}
            rows={8}
          />
          <p className={styles.muted}>
            Revisá destinatario y contenido fuera de esta herramienta. No se
            abrió ni envió WhatsApp.
          </p>
          <button onClick={() => setManualDraft("")}>Cerrar borrador</button>
        </section>
      )}
      {comparisonId && (
        <SalesOperationsComparison
          comparisonId={comparisonId}
          workspace={workspace}
          saved={saved}
          storeName={storeName}
          close={() => setComparisonId(null)}
        />
      )}
      {printSheet && (
        <>
          <section className={styles.section}>
            <h2>Revisión de la hoja para comprador</h2>
            {!printQuoteSaved && (
              <p className={styles.notice}>
                Vista previa de una cotización sin guardar. Guardá en la base
                antes de imprimir o entregar el PDF.
              </p>
            )}
            <pre className={styles.preview}>
              {operationsQuoteText(printQuote!, workspace, storeName)}
            </pre>
            <div className={styles.actions}>
              <button
                disabled={!printQuoteSaved}
                onClick={() => window.print()}
              >
                Imprimir / guardar como PDF
              </button>
              <button onClick={() => setPrintQuote(null)}>
                Cerrar revisión
              </button>
            </div>
          </section>
          {printQuoteSaved && (
            <article
              className={styles.print}
              data-testid="customer-quote-print"
              data-sales-print-sheet="quote"
            >
              <h1>{printSheet.storeName}</h1>
              <h2>Cotización para revisar</h2>
              <p>
                Fecha: {operationsDay(printSheet.createdOn)}
                {printSheet.expiresOn &&
                  ` · Validez: ${operationsDay(printSheet.expiresOn)}`}
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Modelo</th>
                    <th>Unidad / cantidad</th>
                    <th>Precio por unidad</th>
                  </tr>
                </thead>
                <tbody>
                  {printSheet.lines.map((line, index) => (
                    <tr key={index}>
                      <td>{line.model}</td>
                      <td>
                        {line.quantity}{" "}
                        {line.unit === "pair"
                          ? "par(es) de dos anillos"
                          : "anillo(s)"}
                      </td>
                      <td>{operationsMoney(line.unitPricePyg)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {printSheet.services.map((service, index) => (
                <p key={index}>
                  {service.name}: {operationsMoney(service.pricePyg)} ·{" "}
                  {service.terms}
                </p>
              ))}
              <p>
                Entrega: {operationsMoney(printSheet.deliveryPyg)} ·{" "}
                {printSheet.deliveryConditions}
              </p>
              <p>
                Entrega cotizada el:{" "}
                {operationsDay(printSheet.deliveryConfirmedOn)}
              </p>
              <p>
                <strong>Total: {operationsMoney(printSheet.totalPyg)}</strong>
              </p>
              <p>{printSheet.disclaimer}</p>
            </article>
          )}
        </>
      )}
    </div>
  );
}
