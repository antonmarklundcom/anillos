# Store implementation

Bootstrapped into the existing repository with `NEW-STORE.md §1b` and `pnpm bootstrap:repo`, after inspecting a complete dry-run copy plan: 652 new files and the existing `.gitignore` extended. The initial destination commit `6d451c3` remains an ancestor; origin remains `antonmarklundcom/anillos`. The source working tree was clean at `c5422e3c9184f0c4e4575da3db2774329d063214` (merged template PR 144). The exact SHA is in `.template-baseline`; template remote points to ecom.

No source environments, credentials, databases, builds or Git metadata were copied. The store wizard generated distinct session, cron and setup secrets privately in ignored `.env.local`. Contact, bank, payments, suppliers, street address, hours and delivery conditions remain unset.

## Presentation and content

Store-only merchandising lives in `src/config/ring-store.ts`, prose in `src/content/guides.ts`, generated media in `public/media`, and the brand in `src/config/tienda.ts`. The effective admin identity still takes precedence. Shared domain, actions, inventory, payment readiness, integer PYG calculations, transitionOrder, SQL casts, outbox, account security and migrations remain the pinned template implementations. Existing test IDs remain in place.

Five collections prioritize steel and silver before gold. Pairs are identified as **two rings per unit**. Individual rings are **one ring per unit**. The concept variants use interior millimetres, with two independent measures for pairs. No supplier price has been invented. Internal zero values in preview fixtures satisfy the existing schema and never appear as a public price or offer.

The home has an ivory editorial layout, a civil-wedding section, an adult fictional Paraguayan model and guide links. The homepage review adds a woman-led scroll hero and retains the original ring-led hero at `/?hero=rings`; details and validation are in `HOMEPAGE-REVIEW.md`. The supplied GEMORA attachment was a specification with snippets, not complete source code or footage. Its cinematic direction was adapted without importing unsupported claims about heritage, ateliers, certifications or commissions. No GSAP, AOS, preloader, tracking provider or additional production dependency was added. System sans and Georgia remove build-time Google Fonts requests.

The optional canvas renders 48 video frames; desktop and mobile use separate optimized sizes. It starts after the initial poster, yields network slots in small batches, and supports pause, a direct skip link, reduced motion, data saving and missing-frame fallback. Text and links are server-rendered independently of motion. Media prompts, tool names and generation IDs are recorded in `MEDIA-PROVENANCE.json`; image dimensions, byte counts and SHA-256 hashes are in `public/media/assets.json`.

## Local and production data

After migrations, run `pnpm exec tsx scripts/seed-store.ts` to create the five collection records. This command inserts missing records only and preserves owner edits. It invents no products, stock, prices, shipping zones or provider configuration.

For a **disposable loopback database with `test` in its name**, add `--with-concepts` to preview five enquiry-mode examples. They have zero inventory, hidden prices, no purchase controls, no merchant offers, and cannot enter checkout. Their reserved `concepto-*` slugs are noindex and omitted from the sitemap. New real supplier products must use new slugs. Supplier photography uploaded through the admin takes precedence over illustrative fallback images.

Do not run the generic template `pnpm db:seed`, `pnpm demo` or HTTP setup with `seed:true` in production. Those commands retain the template's test catalogue and stock fixtures. Use the store seed above. Customer accounts remain disabled by default; all validated account machinery is available when deliberately configured.

Six substantial Spanish/voseo guides cover sizing, materials, limited budgets, civil-wedding pairs, engagement versus wedding rings and care. Category metadata and pagination are inherited; guides, collections, contact and fulfilment information have distinct metadata and canonicals. Search/filter pages stay noindex. The sitemap excludes concept product URLs. No reviews, partnerships, certifications, search volumes or delivery promises were invented.

New public pages and favourites render per request to match the template's nonce-based CSP. The security policy is unchanged. Guides are crawlable server-rendered content; the initial static-parameter approach was removed after a fresh-visit screenshot exposed blocked hydration. Browser checks assert visible headings and articles, including on the small-phone guide capture.

No merge, deployment, supplier contact or template registry change was made. Register distribution in the template's `tiendas.json` later, with hosting details confirmed, as a separate template change.
