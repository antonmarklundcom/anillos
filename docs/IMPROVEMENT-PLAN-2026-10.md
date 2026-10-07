# Anillos improvement plan — October 2026

Reconciled against the independent review baseline `a1fd64f8f6539118444eedbac0837bd66d0d51fe` and the code on `codex/review-fixes-catalogue`. Anillos is a store. The ecom repository, `.template-baseline`, production, hosting and supplier accounts remain untouched. The user requested one merge-ready PR and will merge it manually; this session uses that branch and a combined acceptance report rather than a stack requiring several coordinated merges.

`CONFIRMED` means the code supports the reported failure; `PARTLY` narrows the report or its proposed remedy. Status describes this branch, not deployment. “Partial” identifies the precise remaining enhancement instead of claiming all original acceptance criteria passed. Verification results are recorded in CODING-HANDOFF-2026-10.md.

| # | Idea and reconciliation | Verdict | Final priority / batch | Status on this branch |
| --- | --- | --- | --- | --- |
| 1 | Nonpositive stock prices permit invalid purchase/merchant claims. Zero is still valid storage for an unpublished quotation draft. | CONFIRMED | P1 / A | Fixed: published stock write/cart guards; schema/feed exclude invalid prices; legacy zero UI hidden. |
| 2 | Missing CSV columns overwrite stored facts; export omits roundtrip fields. Absence and explicit clearing must differ. | CONFIRMED | P1 / D | Fixed preservation, stable export fields, inactive flags and import ownership. Exact no-op reporting remains an enhancement. |
| 3 | Import publication/auditing and stock-alert eligibility need governance. Reject reserved concept namespace rather than manufacture merchandise from concepts. | CONFIRMED | P1 / D | New rows draft; price/stock auditing and actor restrictions; non-stock inventory unavailable; eligible alerts only. |
| 4 | Browser dates and prechecked facts make verification unreliable. Existing historic dates cannot acquire an invented verifier. | CONFIRMED | P1 / C | Server timestamps + actor, unchanged preservation, explicit confirmation; staff import cannot forge verification; private actors excluded publicly. |
| 5 | Product-level photo provenance does not protect individual images. | CONFIRMED | P1 / C | Nullable generated image migration, per-photo admin verification; unknown/illustrative excluded from merchant/schema/OG and captioned. CSV photos start unverified. |
| 6 | Backup table inventory follows new code, not applied migration. | CONFIRMED | P1 / B | Migration-specific manifest inventory and validation; unsupported schema rejected. |
| 7 | Connectivity health does not prove schema compatibility; unbounded metadata waits complicate rollout. | CONFIRMED | P1 / B | Schema/pending migration probes, admin banner, db-check/version diagnostics, bounded migrate lock wait and rollout guidance. |
| 8 | Effective payment configuration and stored malformed lists can disagree with preflight. Transfer without receipt storage needs a supported fallback. | PARTLY | P1 / E | Effective bank/provider checks, fail-closed malformed lists, preserve inherited policy on unrelated saves, unavailable upload hidden with WhatsApp fallback. Real payment remains untested. |
| 9 | Receipt review can outlive stock holds; indefinite renewal is also unsafe. | CONFIRMED | P1 / A | Atomic receipt finalization/state/quota checks; bounded 48-hour review hold anchored to first receipt; consistent order/variant locking. |
| 10 | One sold-out size changes family schema shape. Size belongs on Product, not an unsupported Offer property. | CONFIRMED | P2 / F | Stable verified ProductGroup; OutOfStock variant offers and SKU URLs. |
| 11 | Feed omits confirmed size/identifier/unit details and SKU selection. Absence of IDs is not proof they do not exist. | PARTLY | P2 / F | Verified optional attributes/identifiers, per-SKU links, positive price and photo gates; no fabricated identifier absence or delivery terms. |
| 12 | Child metadata replaces inherited sharing image. | CONFIRMED | P2 / F | Explicit effective-brand OG/Twitter fallback and verified product-photo selection. |
| 13 | Low contrast on editorial labels/captions. | CONFIRMED | P2 / G | Darker text tokens; browser axe verification recorded separately. |
| 14 | Concepts sort ahead of real merchandise. Automatic hiding threshold is a merchandising choice. | PARTLY | P2 / G | Real stock/quotation products rank first; threshold hiding and bulk concept removal deferred. |
| 15 | Missing real-product photos reuse concept imagery/copy. | CONFIRMED | P2 / G | Neutral photo-pending state; concept-only statements conditional; comparison shares same photo policy. |
| 16 | Raw case/space variants split facets. Rewriting materials or restricting unknown legitimate facts is broader than the defect. | PARTLY | P2 / C | SQL and request normalization merge case/whitespace; actual purity and stone identities preserved. Controlled store vocabulary deferred. |
| 17 | Sold-out SKU links silently select another size. | CONFIRMED | P2 / F | Existing SKU retained, purchase disabled when unavailable; invalid SKU removed. |
| 18 | Inactive variants and product-wide provenance distort readiness. Zero inventory is valid for an honestly sold-out product. | PARTLY | P2 / C | Only active variants, per-photo verification and positive purchase price; advisory checklist retained without inventing mandatory stock or blanket publication overrides. |
| 19 | Supplier URL validation can throw; errors lack Spanish field context/focus. | CONFIRMED | P2 / C | Safe HTTPS parsing, Spanish issue mapping, field errors/aria links and opening/focusing invalid details. |
| 20 | Wishlist button is nested inside a product link. | CONFIRMED | P2 / G | Sibling controls; DOM/keyboard contract regression. |
| 21 | Own historical alias cannot be reclaimed and redirects lose SKU. | CONFIRMED | P2 / H | A→B→A allowed without freeing reservations; foreign aliases protected; case normalization and SKU-preserving 308. Alias management/release UI deferred. |
| 22 | Backup freshness is not surfaced. Provider download/scheduling is separate from local integrity verification. | PARTLY | P2 / B | Dashboard/health/digest freshness and `backup:verify` private-file integrity/optional isolated restore; no invented hosted schedule or provider download. |
| 23 | Consultation product payload exposes inventory and excess fields. | CONFIRMED | P2 / A | Mask private stock and use minimal purchase DTO; verified staff identities also stripped from public facts. |
| 24 | Filters overwhelm mobile and counts ignore other selections. | CONFIRMED | P2 / G | Mobile disclosure, conditioned facets, irrelevant price/stock controls hidden and live result announcement. |
| 25 | Owner SEO dashboard is static planning coverage, not live inventory; permission is currently intentionally owner-only. | PARTLY | P3 / H | Existing owner dashboard retained. Live coverage, separate SEO capability, counters and duplicate-title warnings deferred. |
| 26 | Comparison combinations form a heavy crawl path. | CONFIRMED | P2 / H | noindex/nofollow, nofollow candidate links and bounded slim candidate query. Card comparison toggle deferred. |
| 27 | Small thumbnail uses oversized media; deleting assets requires reference proof. | PARTLY | P3 / G | Smaller Cloudinary thumbnail transformation. Local responsive asset generation/cleanup and byte targets deferred. |
| 28 | Upstream migration histories can collide or be skipped on template sync. | CONFIRMED | P1 / B | Pre-write journal/index/time/hash/snapshot history checks; synthetic conflicts rejected and runbook added. |
| 29 | Editorial schema lacks optional dated metadata. Dates must reflect an actual review. | PARTLY | P3 / F | Optional dates/publisher hooks and sitemap metadata; no artificial current/build dates or claim that editorial review occurred. |
| 30 | Supplier access is shared with product staff by current capability contract. Owner-only access is a new role-policy change. | PARTLY | P3 / C | Existing roles preserved. Public DTO privacy fixed; a separate supplier capability remains a deliberate follow-up. |

## Batch checklist

- [x] A: money, stock, receipt integrity and public inventory privacy.
- [x] B: versioned backups, pending schema diagnostics, freshness and migration sync protection.
- [x] C: server verification, per-image provenance, truthful readiness and field validation; narrower fixes above.
- [x] D: atomic import, preservation, ownership, draft defaults and auditing.
- [x] E: effective payment policy and missing-storage UI.
- [x] F: structured data, merchant feed, SKU links and sharing fallback; no invented facts/dates.
- [x] G: essential contrast, mobile filters, real-first listing, placeholders and valid card controls.
- [x] H: canonical/history corrections and comparison crawl protection.
- [ ] Deferred enhancements: exact no-op metrics, controlled vocabulary, concept threshold/bulk tools, alias management UI, live SEO dashboard, local asset regeneration, supplier capability, hosted backup verification.
- [ ] Production rollout, real suppliers/products, bank/storage/jobs, external SEO accounts: owner-controlled; this PR does not activate them.

## Additional defects verified while fixing

1. CSV SKU ownership must use database collation under locks; a case/accent-equivalent SKU must never migrate between products. Batch D.
2. Import errors late in a batch must roll back earlier products/categories. Batch D.
3. Receipt state and quota can change while cloud upload is in flight; validate inside the final locked transaction. Batch A.
4. Health probes can hang long enough to defeat uptime checks; independent bounded probes fail closed. Batch B.
5. Newly recorded verifier identities must remain private even when verified public specifications are projected. Batch C.
6. Related-product ranking used `ORDER BY 0` when a quotation/concept had no visible price; MySQL/MariaDB interpret this as an invalid column ordinal. Omit that ranking term and retain brand/name order. Two database regressions cover available and empty results. Batch G.
7. The documented backup verification command passes a literal `--` through pnpm 11. Ignore the argument separator before validating CLI options. Batch B.
8. Missing/blank variant labels now preserve an existing label rather than overwriting a size with “Único”; zero comparison-price values round-trip through CSV. Batch D.
9. Recently viewed cards retain photo provenance/captions; price-filter visibility follows the whole category, independently of the current page. Batch G.

## Decisions and dependencies

- Operational fixes #6/#7 sit with the new migration in the same PR. Migration-based backup logic protects old schemas; catalogue queries still require schema upgrade before serving this code.
- The best-five dependency order remains #1, #6, #4, #5, #2; complete integration checks, not coding chronology, determine release readiness. #7 and #28 accompany #6 before new schema adoption.
- Keep integers in PYG, state transitions through `transitionOrder`, signed SQL subtraction and all existing test IDs.
- Preserve absent CSV fields and unknown photo/fact provenance rather than auto-verifying supplier spreadsheets. Photos require per-image confirmation in admin.
- A visible sold-out product is legitimate. Do not use SEO readiness to require fabricated stock or arbitrarily unpublish it.
- Supplier-specific facts, KWP export, ring content, phone and ueno launch policy stay in Anillos. Only generic mechanisms are proposed for future ecom review.
- No merge/deploy/production migration, external account edits, supplier contact or paid media generation in this session.
