import { describe, expect, it } from "vitest";
import { compareMigrations } from "@/db/migration-status";
import { backupAtrasado } from "@/domain/job-runs";
import { paymentReadinessCheck } from "@/domain/payment-readiness";
import { parseStoreSettings } from "@/domain/store-settings-schema";
import { migrationSyncIssue } from "../../scripts/template-migrations";

describe("operational review safeguards", () => {
  const expected = [{ tag: "0000_a", hash: "a", timestamp: 1 }, { tag: "0001_b", hash: "b", timestamp: 2 }];
  it("distinguishes pending schema from changed or unknown migration history", () => {
    expect(compareMigrations(expected, [{ hash: "a", created_at: "1" }])).toEqual({ compatible: true, current: false, pending: ["0001_b"] });
    expect(compareMigrations(expected, [{ hash: "changed", created_at: 1 }]).compatible).toBe(false);
    expect(compareMigrations(expected, [{ hash: "a", created_at: 1 }, { hash: "b", created_at: 2 }]).current).toBe(true);
  });
  it("keeps absent/null payment policy inherited but malformed policy closed", () => {
    expect(parseStoreSettings({}).checkout.metodosPago).toBeNull();
    expect(parseStoreSettings({ checkout: { metodosPago: null } }).checkout.metodosPago).toBeNull();
    for (const value of [["typo"], "transferencia", 1])
      expect(parseStoreSettings({ checkout: { metodosPago: value } }).checkout.metodosPago).toEqual([]);
  });
  it("blocks unready transfer and invalid inherited env tokens", () => {
    expect(paymentReadinessCheck(["transferencia"], []).severity).toBe("bloquea");
    expect(paymentReadinessCheck(null, [], "transferncia").detail).toContain("STORE_PAYMENT_METHODS");
    expect(paymentReadinessCheck(["transferencia"], ["transferencia"], "bad").severity).toBe("ok");
  });
  it("requires actual completed backup within26h", () => {
    const now = new Date("2026-10-07T12:00:00Z");
    expect(backupAtrasado(null, now)).toBe(true);
    expect(backupAtrasado({ lastOkAt: new Date(now.getTime() - 25 * 3600_000) }, now)).toBe(false);
    expect(backupAtrasado({ lastOkAt: new Date(now.getTime() - 27 * 3600_000) }, now)).toBe(true);
  });
  const base = { entries: [{ idx: 0, tag: "0000_a", when: 1 }], sql: { "0000_a": "CREATE TABLE a" } };
  const store = { entries: [...base.entries, { idx: 1, tag: "0001_store", when: 5 }], sql: { ...base.sql, "0001_store": "ALTER TABLE a" } };
  it("rejects independently authored migration collisions before merging", () => {
    const incoming = { entries: [...base.entries, { idx: 1, tag: "0001_template", when: 6 }], sql: { ...base.sql, "0001_template": "CREATE TABLE b" } };
    expect(migrationSyncIssue(base, store, incoming)).toContain("conflicto");
    expect(migrationSyncIssue(base, base, incoming)).toBeNull();
  });
  it("rejects rewritten SQL and nonmonotonic timestamps", () => {
    expect(migrationSyncIssue(base, base, { ...base, sql: { "0000_a": "DROP TABLE a" } })).toContain("reescribiría");
    expect(migrationSyncIssue(base, store, { ...store, entries: [...base.entries, { idx: 1, tag: "0001_store", when: 1 }] })).toContain("inválido");
  });
});
