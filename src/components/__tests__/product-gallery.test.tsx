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
  expect(screen.getByText(/No representa este producto/)).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Ver imagen 3: Detalle real" })
  );
  expect(
    screen.queryByText(/No representa este producto/)
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
it("renders no controls for an absent or single photo", () => {
  const view = render(<ProductGallery images={[]} />);
  expect(screen.queryByRole("figure")).not.toBeInTheDocument();
  view.rerender(<ProductGallery images={images.slice(0, 1)} />);
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});
