# Prompt for the ecom template coding session

```text
You are working in antonmarklundcom/ecom, the reusable multi-store template.
Anillos (antonmarklundcom/anillos) is a separate store created from ecom at its
.template-baseline; treat its October review-fixes PR and handoff as evidence
to investigate, not patches to copy blindly. Do not change Anillos in this
session. Read ecom's AGENTS.md, CLAUDE.md, ARCH.md, NEW-STORE.md, deployment,
backup, template-distribution instructions and current Git status first.

Goal: make ecom reliable, accessible and easy to initialize and maintain for
multiple independent stores. Verify each suspected defect in current code;
reproduce it with a focused regression test before changing it. Record the
failure, priority, smallest sound fix, neutral extension hook and acceptance
criteria in docs/TEMPLATE-IMPROVEMENT-PLAN.md. Preserve uncommitted user work.

Prioritize these generic mechanisms:
1. Positive purchasable prices, integer money and authoritative stock/order
   transitions, including legacy bad rows and non-stock/hidden-price products.
2. Atomic supplier CSV import, absent-versus-empty preservation, stable export
   roundtrips, database-collation SKU ownership, default drafts, role permissions
   and audited price/inventory changes; reject conflicts without partial writes.
   Include absent variant labels and stored zero comparison prices in roundtrips.
3. Server-stamped fact verification with preserved unchanged dates/actors,
   private supplier/verifier DTOs, per-image provenance and safe merchant/OG/feed
   projection. Use configurable attributes; never assume jewellery vocabulary.
4. Effective payment readiness, inherited policy versus explicit overrides,
   malformed lists fail closed, missing-storage fallback, atomic receipt quota/
   state checks and bounded stock holds with consistent locking.
5. Migration-specific backup inventory/restore validation, bounded health checks,
   pending-schema diagnostics, real job freshness and tested recovery. Never
   claim that a local integrity tool creates a hosted backup schedule.
6. Template sync guards for journal index/time/hash/snapshot collisions and
   rewritten migration history before any write; document safe regeneration.
7. Correct variant deep links and canonical redirects, stable ProductGroup for
   sold-out variants, verified identifiers/images and positive feed prices.
   Related-product SQL must work when the source has no price: ORDER BY 0 is
   an invalid column ordinal on MySQL/MariaDB, not a neutral ranking term.
8. Accessible admin field errors/focus, password confirmation and visibility,
   obvious setup success/next steps, role-aware sidebar, mobile/printing/logout;
   valid product-card controls, truthful placeholders, bounded comparison queries
   and useful mobile filters with conditioned counts/result announcements.
   Preserve photo provenance in recently viewed cards and derive filter
   availability from the category, not only the current page of results.

Keep all store facts outside the template: ring copy/assets/suppliers, Paraguay
KWP dataset, Anillos phone, bank details and ueno-only launch policy. Preserve
test IDs, configuration precedence, credential readers and existing role/order
guarantees. No invented GTINs, reviews, prices, stock, materials or delivery terms.

Generate versioned migrations with committed snapshots/journal; no db:push or
production reset. Use only disposable loopback test databases. Run the frozen
install, typecheck, lint, unit/component suite, MySQL8 and MariaDB integration,
production build and Chromium/mobile/axe workflows. Also create two stores with
different branding/roles/payments/content, test setup/import/checkout/admin,
sync a later template update and verify neither store's data/skin/private env
is overwritten. Exercise migration collisions and rollback/recovery scenarios.
Test Linux standalone packaging and Hostinger compatibility using the current
repo's actual supported Node/pnpm versions, not a copied pin from another store.

Use small dependency-ordered PRs with concrete before/after behaviour and exact
PASS/FAIL/skips. Push and prepare conflict-free PRs; do not merge, deploy, modify
production/DNS/accounts, contact suppliers or add paid services. Do not print
secrets. Ask only for business choices or external actions that require me.
Finish each batch with a report and a one-line fresh-window resume prompt.
```
