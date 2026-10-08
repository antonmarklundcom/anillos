import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { SearchBox } from "@/components/search-box";

const mocks = vi.hoisted(() => ({
  query: "oro",
  push: vi.fn(),
  suggest: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push }),
  useSearchParams: () => new URLSearchParams({ q: mocks.query }),
}));
vi.mock("@/app/actions/search-suggest", () => ({
  sugerirProductos: mocks.suggest,
}));
beforeEach(() => {
  vi.useFakeTimers();
  mocks.query = "oro";
  mocks.push.mockReset();
  mocks.suggest
    .mockReset()
    .mockResolvedValue([
      { slug: "modelo-oro", name: "Modelo oro", brand: null },
    ]);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
async function suggestions() {
  await act(async () => {
    await vi.advanceTimersByTimeAsync(251);
  });
}
it("resynchronizes the field and selection when the URL query changes", async () => {
  const view = render(<SearchBox />);
  fireEvent.focus(screen.getByRole("combobox"));
  await suggestions();
  fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
  mocks.query = "plata";
  view.rerender(<SearchBox />);
  expect(screen.getByRole("combobox")).toHaveValue("plata");
  expect(screen.getByRole("combobox")).not.toHaveAttribute(
    "aria-activedescendant"
  );
  expect(screen.queryByRole("option")).toBeNull();
});
it("uses native click activation for a focused suggestion and the all-results button", async () => {
  render(<SearchBox />);
  fireEvent.focus(screen.getByRole("combobox"));
  await suggestions();
  const option = screen.getByRole("option");
  option.focus();
  fireEvent.click(option);
  expect(mocks.push).toHaveBeenCalledTimes(1);
  expect(mocks.push).toHaveBeenLastCalledWith("/producto/modelo-oro");
  fireEvent.focus(screen.getByRole("combobox"));
  fireEvent.click(screen.getByRole("button", { name: /Ver todos/i }));
  expect(mocks.push).toHaveBeenLastCalledWith("/buscar?q=oro");
});
it("never submits a highlighted result from the previous text during debounce", async () => {
  const view = render(<SearchBox />);
  const input = screen.getByRole("combobox");
  fireEvent.focus(input);
  await suggestions();
  fireEvent.keyDown(input, { key: "ArrowDown" });
  fireEvent.change(input, { target: { value: "solitairo" } });
  expect(screen.queryByRole("option")).toBeNull();
  fireEvent.submit(view.container.querySelector("form")!);
  expect(mocks.push).toHaveBeenCalledWith("/buscar?q=solitairo");
  expect(mocks.push).not.toHaveBeenCalledWith("/producto/modelo-oro");
});
it("keeps submitting text after a suggestion request fails", async () => {
  mocks.suggest.mockRejectedValue(new Error("offline"));
  const view = render(<SearchBox />);
  fireEvent.focus(screen.getByRole("combobox"));
  await suggestions();
  fireEvent.submit(view.container.querySelector("form")!);
  expect(mocks.push).toHaveBeenCalledWith("/buscar?q=oro");
});
