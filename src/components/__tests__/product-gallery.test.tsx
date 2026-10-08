import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import type { CSSProperties } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { ProductGallery } from "@/components/product-gallery";
vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    style,
  }: {
    src: string;
    alt: string;
    style?: CSSProperties;
  }) => (
    // Test-only replacement keeps image semantics without Next's loader.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} style={style} />
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
it("bounds zoom, allows keyboard panning, and resets when changing images", () => {
  render(<ProductGallery images={images} />);
  fireEvent.click(screen.getByRole("button", { name: /Ampliar imagen 1/ }));
  const dialog = screen.getByRole("dialog");
  for (let i = 0; i < 8; i++) fireEvent.keyDown(dialog, { key: "+" });
  expect(screen.getByRole("status")).toHaveTextContent("300%");
  expect(screen.getByRole("button", { name: "Acercar +" })).toBeDisabled();
  fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(dialog).toHaveAccessibleName("Imagen 1 de 3");
  fireEvent.click(screen.getByRole("button", { name: "Imagen siguiente" }));
  expect(screen.getByRole("status")).toHaveTextContent("100%");
  expect(screen.getByRole("button", { name: "Alejar −" })).toBeDisabled();
  fireEvent.keyDown(dialog, { key: "+" });
  fireEvent.keyDown(dialog, { key: "0" });
  expect(screen.getByRole("status")).toHaveTextContent("100%");
});
it("reaches the full 390px pan range at 3x and returns to zero at 1x", () => {
  render(<ProductGallery images={images.slice(0, 1)} />);
  fireEvent.click(screen.getByRole("button", { name: /Ampliar imagen 1/ }));
  const dialog = screen.getByRole("dialog");
  const image = within(dialog).getByRole("img", { name: "Vista frontal" });
  const viewport = image.parentElement!;
  vi.spyOn(viewport, "getBoundingClientRect").mockReturnValue(
    new DOMRect(0, 0, 390, 500)
  );
  Object.defineProperty(image, "naturalWidth", {
    configurable: true,
    value: 390,
  });
  Object.defineProperty(image, "naturalHeight", {
    configurable: true,
    value: 500,
  });
  fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(image).toHaveStyle({ transform: "translate(0px, 0px) scale(1)" });
  for (let i = 0; i < 4; i++) fireEvent.keyDown(dialog, { key: "+" });
  for (let i = 0; i < 20; i++) fireEvent.keyDown(dialog, { key: "ArrowRight" });
  expect(image).toHaveStyle({ transform: "translate(390px, 0px) scale(3)" });
  for (let i = 0; i < 40; i++) fireEvent.keyDown(dialog, { key: "ArrowLeft" });
  expect(image).toHaveStyle({ transform: "translate(-390px, 0px) scale(3)" });
  fireEvent.keyDown(dialog, { key: "0" });
  expect(image).toHaveStyle({ transform: "translate(0px, 0px) scale(1)" });
});
