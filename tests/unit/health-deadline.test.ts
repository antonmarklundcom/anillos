import { afterEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ query: vi.fn(), job: vi.fn(), catalog: vi.fn(), schema: vi.fn(), load: vi.fn(), enabled: vi.fn() }));
vi.mock("@/db", () => ({ getPool: () => ({ query: mocks.query }) }));
vi.mock("@/db/migration-status", () => ({ migrationStatus: mocks.schema }));
vi.mock("@/db/queries", () => ({ getCatalog: mocks.catalog }));
vi.mock("@/domain/job-runs", () => ({ getJobRun: mocks.job, cronAtrasado: () => false, backupAtrasado: () => true }));
vi.mock("@/domain/backup", () => ({ backupsEnabled: mocks.enabled }));
vi.mock("@/lib/integraciones-store", () => ({ cargarIntegraciones: mocks.load }));
import { GET } from "@/app/api/health/route";
afterEach(() => { vi.useRealTimers(); vi.resetAllMocks(); });
it("returns a bounded private-free response when the cron query hangs", async () => {
  vi.useFakeTimers();
  mocks.query.mockResolvedValue([]); mocks.job.mockImplementation(() => new Promise(() => {}));
  mocks.catalog.mockResolvedValue([]); mocks.schema.mockResolvedValue({ current: true });
  mocks.load.mockResolvedValue(undefined); mocks.enabled.mockReturnValue(false);
  const result = GET();
  await vi.advanceTimersByTimeAsync(3001);
  expect(await (await result).json()).toEqual({ ok: true, db: true, cron: false, catalog: true, schema: true, backup: true });
});
it("surfaces stale enabled backups without exposing details", async () => {
  mocks.query.mockResolvedValue([]); mocks.job.mockResolvedValue(null); mocks.catalog.mockResolvedValue([]);
  mocks.schema.mockResolvedValue({ current: false }); mocks.load.mockResolvedValue(undefined); mocks.enabled.mockReturnValue(true);
  const response = await GET();
  expect(await response.json()).toMatchObject({ schema: false, backup: false });
  expect(response.headers.get("cache-control")).toBe("no-store");
});
