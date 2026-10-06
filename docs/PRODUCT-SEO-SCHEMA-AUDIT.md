# Product structured data audit

Reviewed 2026-10-06. The original public-site audit was read-only. The subsequent catalogue/SEO change implements the metadata and concept protections described below; production data, credentials and provider configuration remain untouched.

## Answer

Yes. `/producto/[slug]` server-renders a JSON-LD script containing `BreadcrumbList` and `Product`. The implementation is in `src/app/producto/[slug]/page.tsx` and `src/lib/seo.ts`.

The Product includes name, plain-text description, canonical product URL, first variant SKU and the supplier brand when present. Up to five uploaded Cloudinary images are used. Illustrative fallback/gallery placeholders are not included as product images.

For stock products with public prices, each variant contributes an `Offer` with SKU, variant label, integer PYG price, condition, product URL and current InStock/OutOfStock availability. Availability comes from the catalogue query's reservation-aware stock data. Configured delivery and return information is included only when the necessary settings exist. Approved real reviews can contribute `AggregateRating` and up to five `Review` objects; zero reviews do not create a fake rating.

Enquiry/showcase products and products with hidden prices omit offers. That is truthful but a Product without offers or real reviews/ratings does not meet Google's product-snippet eligibility requirements. Merchant listing requirements are stricter and include real product images and a positive purchasable offer price. Schema presence does not guarantee a rich result. [Google product snippets](https://developers.google.com/search/docs/appearance/structured-data/product-snippet), [Google merchant listings](https://developers.google.com/search/docs/appearance/structured-data/merchant-listing).

## Concepts, indexing and live evidence

Reserved `concepto-*` pages are noindex and excluded from the sitemap. The illustrative concepts have no offers and cannot be purchased. Real products require new slugs and confirmed supplier data. Product pages use their clean canonical URL and force dynamic rendering; active/published products in active categories enter the sitemap. Inactive/unpublished products or products in disabled categories are not public product destinations.

Public GET of `https://anillos.com.py/sitemap.xml` returned HTTP 200 with 24 URLs and **zero `/producto/` URLs** during this audit. Therefore no live product URL was discovered through the public sitemap, and this audit does not claim to have validated a live product's rendered markup or its Google eligibility. This is consistent with an editorial site whose sale catalogue is still being prepared; it is not proof of the state of every private catalogue record.

## Meaningful next improvements

1. Publish confirmed real products with real uploaded photos, final prices, units/talles, availability and commercial conditions; then validate their actual HTML in Google's Rich Results Test and Search Console. Keep placeholders and concepts outside merchant claims. Do not fabricate reviews, prices or identifiers to eliminate warnings.
2. Improve real variant modelling. The present markup is one Product with multiple Offers, not a ProductGroup with separate variant Products, explicit size/material attributes and stable group identity. Every Offer uses the same base URL, and the selector uses browser memory rather than a variant-preselecting query URL. Google's variant guidance calls for unique variant identity, group identity and directly selectable variant URLs. Add these together when supplier variants are confirmed, retaining one canonical group URL for a single-page design. This is an enhancement gap, not evidence that the existing basic Product markup is absent. [Google product variants](https://developers.google.com/search/docs/appearance/structured-data/product-variants).
3. Add genuine supplier GTIN/MPN and structured material/size fields only when available and verified. Their absence is not permission to invent identifiers. Shipping rates/regions and return terms must continue to match the visible, effective policies.

**Implemented:** the hidden-price metadata fallback is now gated on stock sale mode, visible prices and a positive confirmed price in `src/store/product-metadata.ts`. Enquiry/showcase/hidden-price products use neutral fallback copy. Actual authored descriptions remain intact. Focused regression tests cover these modes in `tests/unit/product-metadata.test.ts`.

**Implemented:** reserved concept identities are protected independently of mutable database sale settings. Catalogue hydration masks their price/availability, cart revaluation rejects them, the feed excludes them, and JSON-LD omits their Offers even if raw input mistakenly claims positive stock and prices. `tests/integration/selling-readiness.test.ts` verifies no order or reservation is created for such a concept and that a genuine stock product still works.

## Existing regression coverage

- `tests/unit/seo.test.ts`: product image/URL/condition/currency/availability, no fabricated image/origin, approved ratings/reviews, omission of empty ratings, shipping and return policy completeness.
- `tests/store/seo.spec.ts`: concept noindex/sitemap exclusion, gallery placeholder selection and exclusion of placeholder images/offers from concept Product JSON-LD.
- `tests/integration/feed-products.test.ts` and `tests/unit/product-feed.test.ts`: published catalogue/feed filters and feed generation; the merchant feed is distinct from on-page JSON-LD.

The subsequent implementation adds unit and database regression coverage and desktop/mobile/Chrome gallery and SEO checks. Final validation results are recorded in `docs/CATALOGUE-SEO-REVIEW.md`. No URLs were submitted to Google and authenticated Search Console was not used.
