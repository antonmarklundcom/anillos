import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProductGallery } from "@/components/product-gallery";
vi.mock("next/image", () => ({
  default: ({ src, alt }: { src: string; alt: string }) => (
    // Test-only replacement keeps image semantics without Next's loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} />
  ),
}));
afterEach(cleanup);
const images = [
  { src: "/first.webp", alt: "Vista frontal", illustrative: true },
  { src: "/second.webp", alt: "Vista lateral", illustrative: true },
  { src: "/third.webp", alt: "Detalle real", illustrative: false },
];
it("selects native gallery buttons and keeps illustrative disclosures attached to the active image", () => {
  render(<ProductGallery images={images} />);
  expect(
    screen.getByRole("img", { name: "Vista frontal" })
  ).toBeInTheDocument();
  const second = screen.getByRole("button", {
    name: "Ver imagen 2: Vista lateral",
  });
  fireEvent.click(second);
  expect(second).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("button", { name: "Ver imagen 1: Vista frontal" })
  ).toHaveAttribute("aria-pressed", "false");
  expect(
    screen.getByText(
      "Imagen ilustrativa; las características de una pieza real requieren confirmación."
    )
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Ver imagen 3: Detalle real" })
  );
  expect(
    screen.queryByText(
      "Imagen ilustrativa; las características de una pieza real requieren confirmación."
    )
  ).not.toBeInTheDocument();
  expect(screen.getByText("Vista 3 de 3 · Detalle real")).toBeInTheDocument();
});
it("falls back to the first new photo if the selected photo is removed", () => {
  const view = render(<ProductGallery images={images} />);
  fireEvent.click(
    screen.getByRole("button", { name: "Ver imagen 3: Detalle real" })
  );
  view.rerender(<ProductGallery images={images.slice(0, 2)} />);
  expect(
    screen.getByRole("img", { name: "Vista frontal" })
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: "Ver imagen 1: Vista frontal" })
  ).toHaveAttribute("aria-pressed", "true");
});
it("renders no gallery for absent photos and only zoom for a single photo", () => {
  const view = render(<ProductGallery images={[]} />);
  expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  view.rerender(<ProductGallery images={images.slice(0, 1)} />);
  expect(
    screen.getByRole("button", { name: /Ampliar imagen/ })
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("button", { name: /Ver imagen/ })
  ).not.toBeInTheDocument();
});
it("opens an accessible zoom dialog, changes photos with arrows, and closes it", () => {
  render(<ProductGallery images={images} />);
  fireEvent.click(screen.getByRole("button", { name: /Ampliar imagen 1/ }));
  const dialog = screen.getByRole("dialog", { name: "Imagen 1 de 3" });
  expect(dialog).toHaveAccessibleDescription(/Imagen ilustrativa/);
  fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(
    screen.getByRole("dialog", { name: "Imagen 2 de 3" })
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Imagen siguiente" }));
  expect(
    screen.getByRole("dialog", { name: "Imagen 3 de 3" })
  ).toHaveAccessibleDescription("Detalle real");
  fireEvent.click(screen.getByRole("button", { name: "Cerrar" }));
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
});
