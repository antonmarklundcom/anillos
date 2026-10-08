import { beforeEach, expect, it, vi } from "vitest";
import { useCart, type CartLine } from "@/lib/cart-store";
import type { RevalidatedCart } from "@/app/actions/cart";
const mocks = vi.hoisted(() => ({ revalidate: vi.fn() }));
vi.mock("@/app/actions/cart", () => ({ revalidateCart: mocks.revalidate }));
const line: CartLine = {
  variantId: 1,
  qty: 1,
  productSlug: "real-model",
  name: "Real model",
  variantLabel: "M",
  unitPricePyg: 100000,
};
function priced(lines: CartLine[]): RevalidatedCart {
  return {
    lines: lines.map((l) => ({
      ...l,
      sku: `SKU${l.variantId}`,
      available: 20,
      lineTotalPyg: l.qty * l.unitPricePyg,
      ivaRate: 10,
    })),
    subtotalPyg: 100000,
    iva10Pyg: 0,
    iva5Pyg: 0,
    issues: [],
    freeShipping: { kind: "sin_umbral" },
  };
}
function deferred() {
  let resolve!: (value: RevalidatedCart) => void;
  const promise = new Promise<RevalidatedCart>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
beforeEach(() => {
  mocks.revalidate.mockReset();
  useCart.setState({
    lines: [line],
    issues: [],
    freeShipping: null,
    isSyncing: false,
  });
});
it("does not resurrect a removed line after a refresh", async () => {
  const first = deferred();
  mocks.revalidate.mockReturnValueOnce(first.promise);
  const sync = useCart.getState().sync();
  useCart.getState().remove(1);
  first.resolve(priced([line]));
  await sync;
  expect(useCart.getState().lines).toEqual([]);
  expect(useCart.getState().isSyncing).toBe(false);
});
it("revalidates quantity edits and additions instead of replacing them", async () => {
  const first = deferred();
  mocks.revalidate
    .mockReturnValueOnce(first.promise)
    .mockImplementationOnce(async (input: CartLine[]) =>
      priced(input.map((l) => ({ ...line, ...l })))
    );
  const sync = useCart.getState().sync();
  useCart.getState().setQty(1, 3);
  useCart.getState().add({ ...line, variantId: 2 }, 2);
  first.resolve(priced([line]));
  await sync;
  expect(mocks.revalidate).toHaveBeenLastCalledWith([
    { variantId: 1, qty: 3, unitPricePyg: 100000 },
    { variantId: 2, qty: 2, unitPricePyg: 100000 },
  ]);
  expect(useCart.getState().lines.map((l) => [l.variantId, l.qty])).toEqual([
    [1, 3],
    [2, 2],
  ]);
});
it("ignores an older overlapping refresh even when it completes last", async () => {
  const first = deferred(),
    second = deferred();
  mocks.revalidate
    .mockReturnValueOnce(first.promise)
    .mockReturnValueOnce(second.promise);
  const oldSync = useCart.getState().sync();
  const newSync = useCart.getState().sync();
  second.resolve(priced([{ ...line, unitPricePyg: 120000 }]));
  await newSync;
  first.resolve(priced([line]));
  await oldSync;
  expect(useCart.getState().lines[0]?.unitPricePyg).toBe(120000);
});
