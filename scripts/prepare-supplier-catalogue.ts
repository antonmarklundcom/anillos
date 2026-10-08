import { readFileSync, writeFileSync } from "node:fs";
import {
  supplierDraftCsv,
  type SupplierModel,
} from "./supplier-catalogue-data";
import { CATEGORY_PAGES } from "../src/content/category-pages";
import { toCsv } from "../src/lib/csv";

const manifest = JSON.parse(
  readFileSync("docs/supplier-models-2026-10.json", "utf8")
) as { models: (SupplierModel & { related: string[] })[] };
const csv = supplierDraftCsv(manifest.models);
writeFileSync("docs/supplier-candidates-draft.csv", csv);
console.log(
  `${manifest.models.length} unpriced enquiry rows prepared. No database or media service accessed; new imports remain unpublished drafts.`
);
const intents = JSON.parse(
  readFileSync("docs/catalogue-intents-2026-10.json", "utf8")
) as {
  category: string;
  group: string;
  main: string;
  searches: number;
  variants: string;
  next: string;
}[];
writeFileSync(
  "docs/supplier-catalogue-coverage.csv",
  toCsv(
    [
      "Meaning group",
      "Main phrase",
      "Monthly searches (main row only)",
      "Variants/context",
      "URL",
      "Editorial title (brand suffix applied at render)",
      "H1",
      "Meta description",
      "Private candidate keys (primary or related)",
      "Content quality",
      "Indexability/schema",
      "Remaining evidence",
    ],
    intents.map((intent) => {
      const page = CATEGORY_PAGES[intent.category];
      if (!page)
        throw new Error(`Missing category content: ${intent.category}`);
      return [
        intent.group,
        intent.main,
        intent.searches,
        intent.variants,
        `/categoria/${intent.category}`,
        page.title,
        page.heading,
        page.description,
        manifest.models
          .filter(
            (model) =>
              model.category === intent.category ||
              model.related.includes(intent.category)
          )
          .map((model) => model.key)
          .join(" / "),
        "Existing educational sections + two tailored comparisons; no confirmed commercial offer",
        "Base category canonical/indexable; filter pages noindex; ItemList only published products. Concept product routes noindex/excluded from sitemap/feed; drafts unpublished.",
        intent.next,
      ];
    })
  )
);
console.log(
  "Ten current category titles, H1s, meta descriptions, KWP destinations and evidence gaps written to the private coverage CSV."
);
