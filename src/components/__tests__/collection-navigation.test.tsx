import { cleanup, render } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, expect, it, vi } from "vitest";
import { CollectionNavigation } from "@/components/collection-navigation";
import { TESTIDS } from "@/lib/testids";

vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
const categories = [{ slug: "acero", name: "Anillos de acero" }];

it("keeps both responsive layouts in server markup before mobile hydration", () => {
  const markup = renderToString(
    <CollectionNavigation categories={categories} />
  );
  expect(markup).toContain('class="collection-menu"');
  expect(markup).toContain('class="collection-navigation"');
  // The viewport subscription cannot replace a toolbar row after hydration.
  expect(markup.match(/data-testid=/g)).toHaveLength(1);
});

it.each([true, false])(
  "keeps category test selectors unique when mobile=%s",
  (mobile) => {
    vi.stubGlobal("matchMedia", () => ({
      matches: mobile,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const { container, getAllByTestId } = render(
      <CollectionNavigation categories={categories} />
    );
    const links = getAllByTestId(TESTIDS.headerCategoryLink);
    expect(links).toHaveLength(1);
    expect(
      links[0]!.closest(mobile ? ".collection-menu" : ".collection-navigation")
    ).not.toBeNull();
    expect(container.querySelector(".collection-menu")).not.toBeNull();
    expect(container.querySelector(".collection-navigation")).not.toBeNull();
  }
);
