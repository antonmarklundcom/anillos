import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { saveStoreSettingsSection, readStoreSettings } from "@/domain/store-settings";
import { storeSettings } from "@/db/schema";
import { closeTestDb, getTestDb, hasTestDb, resetTables } from "../helpers/db";
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
describe.skipIf(!hasTestDb)("checkout payment inheritance", () => {
  beforeEach(resetTables); afterAll(closeTestDb);
  it("saving unrelated copy retains inherited and explicit payment policies", async () => {
    await saveStoreSettingsSection("checkout", { confianzaTitulo: "Ayuda" }, { userId: null });
    expect((await readStoreSettings()).settings.checkout.metodosPago).toBeNull();
    await saveStoreSettingsSection("checkout", { metodosPago: [], confianzaTitulo: "Pausa" }, { userId: null });
    await saveStoreSettingsSection("checkout", { confianzaTitulo: "Otro texto" }, { userId: null });
    expect((await readStoreSettings()).settings.checkout.metodosPago).toEqual([]);
  });
  it("malformed persisted policy stays closed even after saving unrelated copy", async () => {
    await getTestDb().insert(storeSettings).values({ id: 1, data: { checkout: { metodosPago: ["typo"] } } });
    await saveStoreSettingsSection("checkout", { confianzaTitulo: "Ayuda" }, { userId: null });
    expect((await readStoreSettings()).settings.checkout.metodosPago).toEqual([]);
  });
});
