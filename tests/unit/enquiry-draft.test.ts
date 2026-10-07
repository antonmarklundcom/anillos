import { describe, expect, it } from "vitest";
import {
  BUDGET_PREFERENCES,
  cleanEnquiryDetails,
  EMPTY_ENQUIRY,
  enquiryMessage,
  enquiryValidationErrors,
  enquiryWhatsappHref,
  readEnquiryDraft,
  removeEnquiryDraft,
  saveEnquiryDraft,
} from "@/store/enquiry-draft";

describe("buyer enquiry draft", () => {
  it("encodes user punctuation as message text and only reuses a valid configured recipient", () => {
    const text = "Me gusta plata & oro? # diseño + 1";
    const href = enquiryWhatsappHref(
      "https://wa.me/595981234567?text=old",
      text
    )!;
    expect(new URL(href).searchParams.get("text")).toBe(text);
    expect(new URL(href).pathname).toBe("/595981234567");
    for (const unsafe of [
      null,
      "javascript:alert(1)",
      "https://wa.me.evil.test/595981234567",
      "https://wa.me/?text=test",
      "https://user@wa.me/595981234567",
      "http://wa.me/595981234567",
    ])
      expect(enquiryWhatsappHref(unsafe, text)).toBeNull();
    expect(
      enquiryWhatsappHref("https://wa.me/595981234567", "a".repeat(6001))
    ).toBeNull();
  });
  it("bounds stored input, rejects impossible dates and measures and adds useful validation", () => {
    const dirty = {
      ...EMPTY_ENQUIRY,
      quantity: "99",
      diameter: "0",
      secondDiameter: "17,5",
      city: "a".repeat(500),
      desiredDate: "2026-02-30",
      budget: "₲100",
      notes: "a\u0000b",
    };
    const cleaned = cleanEnquiryDetails(dirty);
    expect(cleaned).toMatchObject({
      quantity: "",
      diameter: "",
      secondDiameter: "17,5",
      desiredDate: "",
      budget: "",
      notes: "a b",
    });
    expect(cleaned.city).toHaveLength(80);
    expect(enquiryValidationErrors(dirty)).toHaveLength(3);
    expect(
      cleanEnquiryDetails({ quantity: "201", diameter: "17.555" })
    ).toMatchObject({ quantity: "", diameter: "" });
  });
  it("keeps distinct pair measures and buyer preferences without implying a price or order", () => {
    const text = enquiryMessage(
      [
        {
          slug: "concepto-par",
          name: "Diseño de bandas",
          categorySlug: "alianzas",
          concept: true,
          unit: "pair",
        },
        {
          slug: "otro",
          name: "Otro diseño",
          categorySlug: "alianzas",
          concept: false,
          unit: null,
        },
      ],
      {
        ...EMPTY_ENQUIRY,
        diameter: "17,5",
        secondDiameter: "19",
        city: "Luque",
        budget: BUDGET_PREFERENCES[0] ?? "",
      }
    );
    expect(text).toContain("persona 1: 17,5 mm");
    expect(text).toContain("persona 2: 19 mm");
    expect(text).toContain("Unidad de venta por confirmar");
    expect(text).toContain("diseño ilustrativo");
    expect(text).toContain("no es un precio");
    expect(text).toContain(
      "no confirma disponibilidad ni crea pedido, reserva o pago"
    );
    expect(text).not.toContain("₲");
  });
  it("saves only explicit bounded details and tolerates denied and corrupt storage", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => {
        values.set(key, value);
      },
      removeItem: (key: string) => {
        values.delete(key);
      },
    };
    expect(readEnquiryDraft(storage, "one")).toBeNull();
    expect(
      saveEnquiryDraft(storage, "one", { ...EMPTY_ENQUIRY, city: "Luque" })
    ).toBe(true);
    expect(readEnquiryDraft(storage, "one")?.city).toBe("Luque");
    expect(readEnquiryDraft(storage, "two")).toBeNull();
    expect(removeEnquiryDraft(storage, "one")).toBe(true);
    expect(readEnquiryDraft(storage, "one")).toBeNull();
    storage.setItem("ring-enquiry:one", "{broken");
    expect(readEnquiryDraft(storage, "one")).toBeNull();
    const denied = {
      getItem() {
        throw Error("denied");
      },
      setItem() {
        throw Error("denied");
      },
      removeItem() {
        throw Error("denied");
      },
    };
    expect(readEnquiryDraft(denied, "one")).toBeNull();
    expect(saveEnquiryDraft(denied, "one", EMPTY_ENQUIRY)).toBe(false);
    expect(removeEnquiryDraft(denied, "one")).toBe(false);
  });
  it("distinguishes complete pair quantities from physical pieces in mixed lists", () => {
    const pair = {
      slug: "par",
      name: "Bandas",
      categorySlug: "alianzas",
      concept: false,
      unit: "pair" as const,
    };
    const individual = {
      slug: "uno",
      name: "Banda",
      categorySlug: "acero",
      concept: false,
      unit: "individual" as const,
    };
    const details = { ...EMPTY_ENQUIRY, quantity: "2" };
    expect(enquiryMessage([pair], details)).toContain(
      "Cantidad de pares deseada por diseño: 2 (dos anillos por par)"
    );
    const mixed = enquiryMessage([pair, individual], details);
    expect(mixed).toContain("Cantidad de piezas deseada por diseño: 2 anillos");
    expect(mixed).toContain(
      "confirmar la unidad de venta correspondiente a cada modelo"
    );
    expect(mixed).not.toContain("Cantidad de pares deseada");
  });
});
