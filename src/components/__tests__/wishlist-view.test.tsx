import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { WishlistView } from "@/components/wishlist-view";
import { useWishlist } from "@/lib/wishlist-store";
import type { CatalogProduct } from "@/db/queries";
const mocks = vi.hoisted(() => ({ query: "", products: vi.fn() }));
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(mocks.query),
}));
vi.mock("@/app/actions/wishlist", () => ({
  getWishlistProducts: mocks.products,
}));
vi.mock("@/components/product-card", () => ({
  ProductCard: ({ product }: { product: { name: string } }) => (
    <div data-testid="resolved-card">{product.name}</div>
  ),
  ProductCardSkeleton: () => <div data-testid="loading-card" />,
}));
const product: CatalogProduct = {
  id: 1,
  slug: "real-model",
  name: "Real model",
  brand: null,
  ivaRate: 10,
  categoryName: "Anillos",
  categorySlug: "acero",
  saleMode: "enquiry",
  showPrice: false,
  image: null,
  variants: [],
};
beforeEach(() => {
  mocks.query = "";
  mocks.products.mockReset().mockResolvedValue([product]);
  useWishlist.setState({ slugs: [product.slug] });
});
afterEach(() => {
  cleanup();
  localStorage.clear();
});
it("shows an error and explicitly retries without discarding saved favourites", async () => {
  mocks.products.mockRejectedValueOnce(new Error("offline"));
  render(<WishlistView />);
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Tu lista sigue guardada"
  );
  expect(screen.queryByTestId("loading-card")).toBeNull();
  expect(useWishlist.getState().slugs).toEqual([product.slug]);
  fireEvent.click(screen.getByRole("button", { name: "Volver a intentar" }));
  expect(await screen.findByTestId("resolved-card")).toHaveTextContent(
    product.name
  );
  expect(screen.queryByRole("alert")).toBeNull();
  expect(mocks.products).toHaveBeenCalledTimes(2);
});
it("resolves duplicate shared slugs only once and composes a single design", async () => {
  mocks.query = "p=real-model,real-model";
  render(<WishlistView />);
  await screen.findByTestId("resolved-card");
  expect(mocks.products).toHaveBeenCalledWith([product.slug]);
  expect(screen.getAllByTestId("resolved-card")).toHaveLength(1);
  fireEvent.click(
    screen.getByRole("checkbox", { name: /Consultar por Real model/ })
  );
  expect(
    screen
      .getByTestId("enquiry-composer")
      .querySelector("pre")
      ?.textContent?.match(/• Real model/g)
  ).toHaveLength(1);
});
it("ignores an obsolete failure after navigating to a new shared list", async () => {
  let reject!: (reason: Error) => void;
  mocks.products.mockReturnValueOnce(
    new Promise<CatalogProduct[]>((_, no) => {
      reject = no;
    })
  );
  const view = render(<WishlistView />);
  await waitFor(() => expect(mocks.products).toHaveBeenCalledTimes(1));
  mocks.query = "p=other-model";
  view.rerender(<WishlistView />);
  await screen.findByTestId("resolved-card");
  reject(new Error("obsolete request"));
  await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
});
