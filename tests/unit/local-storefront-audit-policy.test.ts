import { describe, expect, it } from "vitest";
import {
  AUDIT_VIEWPORTS,
  auditProductRoute,
  localAuditBaseUrl,
  performanceBudgetFailures,
  localAuditFailure,
} from "../../scripts/local-storefront-audit-policy";

describe("local audit boundary", () => {
  it("reports browser serialization errors without retaining private URLs", () => {
    const result = localAuditFailure(
      new Error(
        "page.evaluate: ReferenceError: __name is not defined at https://private.example.test/?q=PRIVATE-QUERY"
      )
    );
    expect(result.code).toBe("browser_reference_error");
    expect(result.message).toContain("__name");
    expect(JSON.stringify(result)).not.toContain("PRIVATE-QUERY");
    expect(
      localAuditFailure(
        new Error(
          "net::ERR_CONNECTION_REFUSED at http://localhost:54644/?token=PRIVATE"
        )
      ).code
    ).toBe("local_server_unavailable");
  });
  it("accepts only explicit loopback origins", () => {
    expect(localAuditBaseUrl("http://127.0.0.1:54643")).toBe(
      "http://127.0.0.1:54643"
    );
    expect(localAuditBaseUrl("http://[::1]:3000")).toBe("http://[::1]:3000");
    for (const value of [
      "https://anillos.com.py",
      "http://127.0.0.1.example.com",
      "http://user:pass@localhost:3000",
      "http://localhost:3000/admin",
      "http://localhost:3000/?token=secret",
      "http://0.0.0.0:3000",
    ])
      expect(() => localAuditBaseUrl(value)).toThrow();
  });
  it("never turns a slug into another route or external URL", () => {
    expect(auditProductRoute("modelo-real")).toBe("/producto/modelo-real");
    for (const value of [
      "../admin",
      "//example.com",
      "modelo?token=x",
      "MODELO",
      "a".repeat(161),
    ])
      expect(() => auditProductRoute(value)).toThrow();
    expect(AUDIT_VIEWPORTS.map((viewport) => viewport.width)).toEqual([
      1440, 390,
    ]);
  });
});
describe("actionable performance budgets", () => {
  const measured = {
    lcpMs: 2000,
    cls: 0.05,
    transferBytes: 1_000_000,
    scriptBytes: 200_000,
    largestImageBytes: 300_000,
  };
  it("passes known measurements and treats unavailable metrics as incomplete", () => {
    expect(performanceBudgetFailures(measured)).toEqual([]);
    expect(
      performanceBudgetFailures({ ...measured, lcpMs: null, cls: null })
    ).toHaveLength(2);
  });
  it("reports each breached budget with an actionable remedy", () => {
    expect(
      performanceBudgetFailures({
        lcpMs: 3000,
        cls: 0.2,
        transferBytes: 3_000_000,
        scriptBytes: 500_000,
        largestImageBytes: 700_000,
      })
    ).toHaveLength(5);
  });
});
