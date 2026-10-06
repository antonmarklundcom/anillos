# Store implementation

Bootstrapped into the existing repository with `NEW-STORE.md §1b` and `pnpm bootstrap:repo`, after inspecting a complete dry-run copy plan: 652 new files and the existing `.gitignore` extended. The initial destination commit `6d451c3` remains an ancestor; origin remains `antonmarklundcom/anillos`. The source working tree was clean at `c5422e3c9184f0c4e4575da3db2774329d063214` (merged template PR 144). The exact SHA is in `.template-baseline`; template remote points to ecom.

No source environments, credentials, databases, builds or Git metadata were copied. The store wizard generated distinct session, cron and setup secrets privately in ignored `.env.local`. Contact, bank, payments, suppliers, street address, hours and delivery conditions remain unset.

## Presentation and content

Store-only merchandising lives in `src/config/ring-store.ts`, prose in `src/content/guides.ts`, generated media in `public/media`, and the brand in `src/config/tienda.ts`. The effective admin identity still takes precedence. Shared domain, actions, inventory, payment readiness, integer PYG calculations, transitionOrder, SQL casts, outbox, account security and migrations remain the pinned template implementations. Existing test IDs remain in place.

Five collections prioritize steel and silver before gold. Pairs are identified as **two rings per unit**. Individual rings are **one ring per unit**. The concept variants use interior millimetres, with two independent measures for pairs. No supplier price has been invented. Internal zero values in preview fixtures satisfy the existing schema and never appear as a public price or offer.

The home has an ivory editorial layout, a civil-wedding section, an adult fictional Paraguayan model and guide links. The current header uses a complete ring still with continuous scroll motion and three detail stages; the model appears in the lifestyle section. The earlier video sequence is superseded. Current changes and validation are in `RING-SCROLL-AUDIT.md`; `HOMEPAGE-REVIEW.md` records the previous review. GEMORA and Caretline informed the direction without importing unsupported heritage, atelier, certification or commission claims. No GSAP, AOS, preloader, tracking provider or production dependency was added. System sans and Georgia remove build-time Google Fonts requests.

The default hero now uses one responsive still of a complete ring with a small scroll-controlled camera move; no video sequence or canvas is requested. It supports pause, a direct skip link, reduced motion, data saving and missing-image fallback. Text and links are server-rendered independently of motion. Historical media prompts and generation IDs remain in `MEDIA-PROVENANCE.json`; asset metadata is in `public/media/assets.json`. The review is in `docs/RING-SCROLL-AUDIT.md`.

## Local and production data

After migrations, run `pnpm exec tsx scripts/seed-store.ts` to create the five collection records. This command inserts missing records only and preserves owner edits. It invents no products, stock, prices, shipping zones or provider configuration.

For a **disposable loopback database with `test` in its name**, add `--with-concepts` to preview five enquiry-mode examples. They have zero inventory, hidden prices, no purchase controls, no merchant offers, and cannot enter checkout. Their reserved `concepto-*` slugs are noindex and omitted from the sitemap. New real supplier products must use new slugs. Supplier photography uploaded through the admin takes precedence over illustrative fallback images.

Do not run the generic template `pnpm db:seed`, `pnpm demo` or HTTP setup with `seed:true` in production. Those commands retain the template's test catalogue and stock fixtures. Use the store seed above. Customer accounts remain disabled by default; all validated account machinery is available when deliberately configured.

Six substantial Spanish/voseo guides cover sizing, materials, limited budgets, civil-wedding pairs, engagement versus wedding rings and care. Category metadata and pagination are inherited; guides, collections, contact and fulfilment information have distinct metadata and canonicals. Search/filter pages stay noindex. The sitemap excludes concept product URLs. No reviews, partnerships, certifications, search volumes or delivery promises were invented.

New public pages and favourites render per request to match the template's nonce-based CSP. The security policy is unchanged. Guides are crawlable server-rendered content; the initial static-parameter approach was removed after a fresh-visit screenshot exposed blocked hydration. Browser checks assert visible headings and articles, including on the small-phone guide capture.

The initial showcase was followed by merged [PR 6](https://github.com/antonmarklundcom/anillos/pull/6) for the complete-ring hero and catalog resilience. No supplier contact or template registry change was made. Register distribution in the template's `tiendas.json` later, with hosting details confirmed, as a separate template change. Current readiness and follow-up fixes are tracked in `docs/SITE-IMPROVEMENTS.md`.
