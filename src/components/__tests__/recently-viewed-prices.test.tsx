import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { RecentlyViewed } from "@/components/recently-viewed";
import { CART_STORAGE_KEY } from "@/lib/cart-store";

afterEach(() => {
  cleanup();
  localStorage.clear();
});

it("keeps image-specific history disclosures and persists the current photo evidence", async () => {
  const key = `${CART_STORAGE_KEY}-vistos`;
  const base = {
    name: "Modelo",
    pricePyg: 120000,
    imageCloudinaryId: "test/photo",
    imageAlt: "Vista frontal",
    imageSrc: "https://res.cloudinary.com/demo/image/upload/test/photo.jpg",
  };
  localStorage.setItem(
    key,
    JSON.stringify([
      { ...base, slug: "unknown", name: "Foto antigua" },
      {
        ...base,
        slug: "illustrative",
        name: "Referencia",
        imageProvenance: "illustrative",
        imageVerifiedAt: "2026-01-01T00:00:00Z",
      },
      {
        ...base,
        slug: "confirmed",
        name: "Foto confirmada",
        imageProvenance: "owned-photo",
        imageVerifiedAt: "2026-01-01T00:00:00Z",
      },
    ])
  );
  render(
    <RecentlyViewed
      current={{
        ...base,
        slug: "current",
        imageProvenance: "supplier-authorized",
        imageVerifiedAt: "2026-01-01T00:00:00Z",
      }}
    />
  );
  await waitFor(() =>
    expect(screen.getByText("Foto antigua")).toBeInTheDocument()
  );
  expect(
    within(screen.getByRole("link", { name: /Foto antigua/ })).getByText(
      "Imagen por verificar"
    )
  ).toBeInTheDocument();
  expect(
    within(screen.getByRole("link", { name: /Referencia/ })).getByText(
      "Imagen ilustrativa"
    )
  ).toBeInTheDocument();
  expect(
    within(screen.getByRole("link", { name: /Foto confirmada/ })).queryByText(
      /Imagen por verificar|Imagen ilustrativa/
    )
  ).toBeNull();
  expect(JSON.parse(localStorage.getItem(key)!)[0]).toMatchObject({
    imageProvenance: "supplier-authorized",
    imageVerifiedAt: "2026-01-01T00:00:00Z",
  });
});
it("drops legacy zero-price history and never records a current invalid price", async () => {
  const key = `${CART_STORAGE_KEY}-vistos`;
  const item = {
    slug: "legacy-zero",
    name: "Modelo sin precio",
    pricePyg: 0,
    imageCloudinaryId: null,
    imageAlt: null,
  };
  localStorage.setItem(
    key,
    JSON.stringify([
      item,
      {
        ...item,
        slug: "valid-model",
        name: "Modelo confirmado",
        pricePyg: 120000,
      },
    ])
  );
  render(<RecentlyViewed current={{ ...item, slug: "current-zero" }} />);
  await waitFor(() =>
    expect(screen.getByText("Modelo confirmado")).toBeInTheDocument()
  );
  expect(screen.queryByText("Modelo sin precio")).toBeNull();
  expect(JSON.parse(localStorage.getItem(key)!)).toHaveLength(1);
});
