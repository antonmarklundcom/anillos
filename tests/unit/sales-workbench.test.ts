import { describe, expect, it } from "vitest";
import {
  campaignDestinations,
  campaignDraft,
} from "../../src/store/sales-workbench";

import {
  blankContribution,
  calculateContribution,
  parsePlanningPyg,
  serializeEnquiries,
  parseEnquiries,
  validateEnquiry,
  enquirySummary,
  readLedger,
  saveLedger,
  removeLedger,
  ledgerKey,
  MAX_ENQUIRIES,
  MAX_LEDGER_BYTES,
  type ManualEnquiry,
  type LedgerStorage,
} from "../../src/store/sales-workbench";

const row: ManualEnquiry = {
  id: "test-1",
  alias: "consulta-001",
  category: "compromiso",
  style: "solitario",
  stage: "nueva",
  date: "2026-10-07",
  followUp: "2026-10-08",
};

describe("manual marketing drafts", () => {
  const context = {
    storeName: "Marca vigente",
    origin: "https://tienda.example",
    categories: [{ slug: "compromiso", name: "Compromiso" }],
  };
  it("uses the effective name and exact selected destination without commercial promises", () => {
    const draft = campaignDraft({
      ...context,
      destination: "/categoria/compromiso",
      objective: "consulta",
    });
    expect(draft.href).toBe("https://tienda.example/categoria/compromiso");
    expect(draft.text).toContain("Marca vigente");
    expect(draft.text).toContain(
      "Precio, disponibilidad y condiciones quedan por confirmar"
    );
    expect(draft.text).not.toMatch(
      /₲|stock|envío gratis|fabricamos|oro|plata|garantizado/
    );
  });
  it("allows only supplied categories and fixed public paths", () => {
    expect(
      campaignDestinations([
        ...context.categories,
        { slug: "../privado", name: "Bad" },
        context.categories[0]!,
      ]).map(({ path }) => path)
    ).toEqual([
      "/elegir",
      "/guias/talles",
      "/favoritos",
      "/categoria/compromiso",
    ]);
    for (const destination of [
      "https://evil.example",
      "//evil.example",
      "/admin",
      "/categoria/oculta",
      "/favoritos?token=secret",
    ])
      expect(() =>
        campaignDraft({ ...context, destination, objective: "medidas" })
      ).toThrow();
  });
  it("keeps missing or unsafe origins text-only and never fabricates a domain", () => {
    for (const origin of [
      null,
      "",
      "bad",
      "javascript:alert(1)",
      "https://user:secret@tienda.example",
    ]) {
      const draft = campaignDraft({
        ...context,
        origin,
        destination: "/guias/talles",
        objective: "medidas",
      });
      expect(draft.href).toBeNull();
      expect(draft.text).not.toContain("http");
    }
  });
});

describe("owner unit contribution planning in integer PYG", () => {
  it("requires unknown costs including tax rather than assuming zero", () => {
    expect(
      calculateContribution({ ...blankContribution(), price: "150000" })
    ).toMatchObject({
      ready: false,
      missing: expect.arrayContaining([
        "Compra al proveedor",
        "Impuestos variables estimados",
      ]),
    });
    expect(parsePlanningPyg("")).toBeNull();
    expect(parsePlanningPyg("0")).toBe(0);
  });
  it("subtracts every entered cost and derives hypothetical prices", () => {
    const result = calculateContribution({
      price: "150000",
      target: "40000",
      acquisition: "60000",
      freight: "5000",
      packaging: "3000",
      fees: "2000",
      delivery: "10000",
      returns: "4000",
      marketing: "7000",
      tax: "9000",
    });
    expect(result).toEqual({
      ready: true,
      price: 150000,
      costs: 100000,
      contribution: 50000,
      breakEven: 100000,
      targetPrice: 140000,
    });
  });
  it("shows losses and leaves a missing target unknown", () => {
    expect(
      calculateContribution({
        price: "100",
        target: "",
        acquisition: "101",
        freight: "0",
        packaging: "0",
        fees: "0",
        delivery: "0",
        returns: "0",
        marketing: "0",
        tax: "0",
      })
    ).toMatchObject({ ready: true, contribution: -1, targetPrice: null });
  });
  it.each([
    "1.5",
    "100.000",
    "1,000",
    "1e6",
    "-1",
    "+1",
    " 1 ",
    "1000000000001",
    "NaN",
    "Infinity",
  ])("rejects noninteger or excessive input %s", (value) => {
    expect(() => parsePlanningPyg(value)).toThrow();
    expect(
      calculateContribution({ ...blankContribution(), price: value })
    ).toMatchObject({ ready: false, error: expect.any(String) });
  });
  it("keeps the largest permitted sum and derived price exact", () => {
    expect(
      calculateContribution({
        price: "1000000000000",
        target: "1000000000000",
        acquisition: "1000000000000",
        freight: "1000000000000",
        packaging: "1000000000000",
        fees: "1000000000000",
        delivery: "1000000000000",
        returns: "1000000000000",
        marketing: "1000000000000",
        tax: "1000000000000",
      })
    ).toMatchObject({
      ready: true,
      costs: 8000000000000,
      contribution: -7000000000000,
      targetPrice: 9000000000000,
    });
  });
});

describe("bounded anonymous manual enquiry ledger", () => {
  it("round-trips whitelisted data without unexpected personal or calculator fields", () => {
    const exported = serializeEnquiries([
      {
        ...row,
        phone: "private",
        email: "private",
        price: 9876543,
        costs: 12345,
      },
    ]);
    expect(parseEnquiries(exported)).toEqual([row]);
    expect(exported).not.toMatch(/private|phone|email|9876543|12345/);
    expect(JSON.parse(exported)).toMatchObject({
      source: "registro-manual-local",
      notice: expect.stringContaining("No acredita pedidos ni pagos"),
    });
  });
  it.each([
    "Maria",
    "cliente@mail.py",
    "consulta-595981234567",
    "=HYPERLINK()",
  ])("rejects a personal or arbitrary alias %s", (alias) => {
    expect(() => validateEnquiry({ ...row, alias })).toThrow();
  });
  it("rejects malformed dates, backward follow-up, unsupported stages and duplicates", () => {
    for (const invalid of [
      { date: "2026-02-30" },
      { followUp: "2026-10-06" },
      { stage: "pagado" },
      { category: "<script>" },
      { id: "../secret" },
    ])
      expect(() => validateEnquiry({ ...row, ...invalid })).toThrow();
    expect(() => serializeEnquiries([row, row])).toThrow(/duplicadas/);
    expect(() => serializeEnquiries([row, { ...row, id: "test-2" }])).toThrow(
      /duplicadas/
    );
  });
  it("bounds rows and serialized input and rejects corrupt saved data", () => {
    expect(() =>
      serializeEnquiries(Array.from({ length: MAX_ENQUIRIES + 1 }, () => row))
    ).toThrow();
    expect(() => parseEnquiries("x".repeat(MAX_LEDGER_BYTES + 1))).toThrow();
    expect(() => parseEnquiries("{")).toThrow();
    expect(() => parseEnquiries('{"version":2,"enquiries":[]}')).toThrow();
    expect(() => parseEnquiries('{"version":1,"enquiries":{}}')).toThrow();
  });
  it("counts stages manually and excludes closed rows from due follow-ups", () => {
    expect(
      enquirySummary(
        [
          row,
          {
            ...row,
            id: "test-2",
            alias: "consulta-002",
            stage: "cerrada-venta",
            followUp: "2026-10-07",
          },
          {
            ...row,
            id: "test-3",
            alias: "consulta-003",
            followUp: "2026-10-07",
          },
        ],
        "2026-10-07"
      )
    ).toMatchObject({
      total: 3,
      followUpsDue: 1,
      stages: { nueva: 2, "cerrada-venta": 1 },
      categories: { compromiso: 3 },
    });
  });
  it("isolates saved copies by owner and deletes only the requested copy", () => {
    const map = new Map<string, string>();
    const storage: LedgerStorage = {
      getItem: (key) => map.get(key) ?? null,
      setItem: (key, value) => {
        map.set(key, value);
      },
      removeItem: (key) => {
        map.delete(key);
      },
    };
    saveLedger(storage, 1, [row]);
    saveLedger(storage, 2, []);
    expect(readLedger(storage, 1)).toEqual([row]);
    expect(readLedger(storage, 2)).toEqual([]);
    removeLedger(storage, 1);
    expect(map.has(ledgerKey(1))).toBe(false);
    expect(map.has(ledgerKey(2))).toBe(true);
    expect(() => ledgerKey(0)).toThrow();
  });
  it("propagates denied reads/writes/removals for the UI to report without pretending success", () => {
    const denied = () => {
      throw new Error("Storage denied");
    };
    const storage: LedgerStorage = {
      getItem: denied,
      setItem: denied,
      removeItem: denied,
    };
    expect(() => readLedger(storage, 1)).toThrow("Storage denied");
    expect(() => saveLedger(storage, 1, [row])).toThrow("Storage denied");
    expect(() => removeLedger(storage, 1)).toThrow("Storage denied");
  });
});
