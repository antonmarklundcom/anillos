import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { CatalogFilters } from "@/components/catalog-filters";
const navigation = vi.hoisted(() => ({
  push: vi.fn(),
  query: "material=Plata+925&piedra=Circonia&page=4",
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navigation.push }),
  useSearchParams: () => new URLSearchParams(navigation.query),
}));
afterEach(() => {
  cleanup();
  navigation.push.mockReset();
});
it("renders verified facets and changes stock in the URL while preserving other filters and resetting page", () => {
  render(
    <CatalogFilters
      brands={[]}
      facets={{
        material: [{ value: "Plata 925", total: 2 }],
        stone: [{ value: "Circonia", total: 1 }],
        unit: [{ value: "pair", total: 1 }],
        inStock: 1,
      }}
    />
  );
  expect(
    screen.getByLabelText("Material verificado")
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText("Piedra verificada")
  ).toBeInTheDocument();
  expect(
    screen.getByLabelText("Unidad incluida")
  ).toBeInTheDocument();
  fireEvent.click(screen.getByLabelText("Con stock (1)"));
  expect(navigation.push).toHaveBeenCalledWith(
    "?material=Plata+925&piedra=Circonia&stock=1",
    { scroll: false }
  );
  fireEvent.click(
    screen.getByRole("button", { name: /Material verificado: Plata 925/ })
  );
  expect(navigation.push).toHaveBeenLastCalledWith("?piedra=Circonia", {
    scroll: false,
  });
});
