# Rollout of the October review fixes

This document is preparation, not evidence of a production operation. The PR stays open for Anton's manual merge. No production database, hosting setting or account has been changed.

## Database work: yes, one new versioned migration

`0024_silent_star_brand` adds nullable `product_images.provenance` and `product_images.verified_at`. Its SQL, journal and snapshot were generated with Drizzle. Existing photos start with unknown provenance; do not bulk mark them verified. Fact verifier metadata lives in existing JSON columns and does not require another table or data reset.

If production has not applied PR #13's `0023`, that is also pending. Inspect the real migration journal; do not guess that it was applied from a successful deployment. Existing catalogue queries require those columns, and this PR's image queries require `0024`.

1. Identify the correct production database privately. Never paste its URL or password into a report.
2. Take and verify a recoverable backup before schema work. The current running version may have an older-schema backup gap; use the documented native/database backup path if necessary. See BACKUP-RECOVERY.md.
3. Coordinate Hostinger auto-deploy with migration. Do not let dependent code begin serving before the migration is applied. Stage this PR checkout privately and apply its versioned migrations against the explicitly approved target, then release the matching code. Do not merge merely to obtain the SQL if `main` auto-deploys first.
4. From the matching checkout, with the correct private environment loaded, run `pnpm install --frozen-lockfile`, `pnpm db:check`, then **`pnpm db:migrate`**. This applies pending journal migrations and schema extras with bounded metadata lock waits. A lock timeout is a failed migration: diagnose and retry, never record success manually.
5. Run `pnpm db:check` again. After matching code is released, check `/api/health`: `db`, `catalog` and `schema` must be true. `cron`/`backup` depend on genuine configured jobs and storage; false is a real readiness issue, not a reason to weaken the check.
6. Verify a category, product, admin product/images and an existing order. Inspect sanitized server errors and recent backup job status.

Do **not** run `db:push`, `db:seed`, `demo`, a test reset, or `seed-store --with-concepts` against production. No production data replacement, demo loading, fake bank information, manufactured inventory or automatic product publication is required.

## Environment and launch configuration

No new environment variable is required by this migration or its fixes. Retain the repository's supported Node range and pinned package manager, and inspect Hostinger install **and** build logs. The source build was checked locally; hosting has not been changed.

Before accepting bank transfers, enter the actual five bank-recipient fields in `/admin/banco`; confirm the ueno account details yourself. Configure receipt storage in `/admin/integraciones` or use the explicitly displayed WhatsApp fallback while storage is unavailable. Missing card credentials do not enable cards. Do not change the store's transfer-first policy by copying template or another store's values.

Set up and verify reservation expiry and backups in the hosting environment. The freshness signals and local `backup:verify` command do not schedule jobs themselves. Rotate any credentials previously exposed outside private configuration; values must never be included in Git or handoffs. Finish owner setup through the existing guarded setup/login flow and remove `SETUP_SECRET` afterwards as documented.

## Catalogue after rollout

Imports stage new products as drafts and preserve omitted fields on existing products. Confirm actual supplier model, unit, material/stone, measurements, sizes, your price, availability, image rights and delivery/returns before publication. Inspect each image's provenance in admin; historic unknown photos remain ineligible for merchant representations until individually verified.

The local preview's 24 concept fixtures are examples of layouts, not stock. They remain zero-price/zero-stock, unpurchasable, noindex and excluded from feeds/sitemap/offers. Ten categories and existing buying guides can be viewed without claiming that all keyword demand has already become commercial merchandise or traffic.

## Prompt for a local Sonnet database session

```text
Work in antonmarklundcom/anillos, not ecom. Read AGENTS.md, DEPLOY.md,
docs/REVIEW-FIXES-ROLLOUT.md, docs/BACKUP-RECOVERY.md and the open review-fixes
PR completely. This is a database rollout preparation session. Do not merge,
deploy, alter hosting or touch production until I explicitly approve the
identified target and timing; main may auto-deploy on merge.

First inspect HEAD/status and the generated journal/snapshots/SQL for 0023
and 0024_silent_star_brand. Never open or print private secrets in your report.
Use the existing private configuration only after the target is confirmed;
never copy credentials or data from another store. Rehearse versioned migrations
and backup/restore on a disposable 127.0.0.1 database containing test in its name.
Verify fresh and older schema upgrades on MySQL/MariaDB where available.

Prepare a concrete plan identifying pending tags, backup/recovery evidence,
Hostinger auto-deploy coordination, bounded lock-timeout failure handling and
post-upgrade checks. After my explicit production approval: obtain/verify a
backup, run pnpm db:check and pnpm db:migrate from the PR's matching checkout,
verify no pending tags, then coordinate the separately authorized release.
Never use db:push, db:seed, demo, seed-store --with-concepts or reset production.
Do not auto-verify old images or fabricate products, stock, bank facts or prices.
Check matching deployed /api/health db/catalog/schema, category/product/admin
pages and backup freshness. Report exact PASS/FAIL and sanitized errors, what
was actually changed, rollback evidence and anything still awaiting approval.
```
