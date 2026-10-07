import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SettingsSectionForm } from "./store-settings-form";
const mocks = vi.hoisted(() => ({ save: vi.fn(), reset: vi.fn() }));
vi.mock("@/app/actions/admin-ajustes", () => ({ guardarAjustes: mocks.save, restaurarAjustes: mocks.reset }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("sonner", () => ({ toast: { success: vi.fn() } }));
beforeEach(() => { mocks.save.mockReset(); mocks.save.mockResolvedValue({ ok: true }); });
afterEach(cleanup);
function form() {
  render(<SettingsSectionForm seccion="checkout" campos={{ metodosPago: "lista", confianzaTitulo: "texto" }}>
    <label>Transferencia<input type="checkbox" name="metodosPago" value="transferencia" defaultChecked /></label>
    <label>Título<input name="confianzaTitulo" defaultValue="Información" /></label>
  </SettingsSectionForm>);
}
it("saving checkout copy preserves inherited methods", async () => {
  form(); fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Nuevo texto" } });
  fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ seccion: "checkout", valores: { confianzaTitulo: "Nuevo texto" } }));
});
it("an explicit payment selection can pause checkout", async () => {
  form(); fireEvent.click(screen.getByLabelText("Transferencia"));
  fireEvent.click(screen.getByRole("button", { name: "Guardar cambios" }));
  await waitFor(() => expect(mocks.save).toHaveBeenCalledWith({ seccion: "checkout", valores: { metodosPago: [], confianzaTitulo: "Información" } }));
});
