# Keyword and catalogue coverage audit

## Subsequent implementation

The findings and backlog below record the baseline before the 2026-10-06 catalogue expansion. The current implementation has **ten categories, twelve guides, 129 content sections and 24 local unpurchasable design briefs**. The relevant material, gemstone, style, customization and symbolic topics identified below have now been added to pages or sections. See `docs/SEO-CONTENT-IMPLEMENTATION.md` for the full 166-label disposition register: 105 labels mapped to eligible ring or ring-adjacent content, six held and 55 excluded as standalone targets. These are label dispositions, not purified search-volume totals or a claim that every mixed keyword row is relevant. Supplier-confirmed real inventory remains outstanding. Final validation is in `docs/CATALOGUE-SEO-REVIEW.md`.

## Scope and source

Read-only audit of the current implementation and the owner's `C:/Users/anton/Downloads/anillos.com.py-keywords-for-ai.md`, read in Summary → Meaning groups → relevant Group details order. The export specifies Paraguay, Spanish, Google Keyword Planner and an update of **2026-10-06 19:36 UTC**; the clustering section was built at 18:42 UTC. CPC values are SEK, not PYG. This audit does not query production, provision products, contact suppliers or change database data.

**The first approved SEO wave is implemented. The complete ring catalogue and every useful remaining keyword topic are not yet implemented.** Those are different milestones. Ten category pages and nine guides create the foundation; they do not establish supplier inventory or cover all 166 machine-created clusters.

## What the numbers mean

| Source number | Meaning |
| --- | --- |
| 28,454 | Raw rows read across exports, including overlap. |
| 18,726 | Unique phrase entries in the whole project after the export's spelling merging. |
| 18,687 | Distinct searches after 39 close-variant entries were folded, according to Summary. |
| 12,261 | Selected keyword rows in Part 3, not products, pages, visits or monthly demand. An independent count of the detail table rows matches this number. |
| 166 | Embedding/k-means clusters, not 166 equally coherent ring topics. |
| 220,440 searches/mo | Exported deduplicated aggregate across rings, other jewellery, watches, weddings and contaminated brand queries. The sums of Part 2 group totals and Part 3 main-row volumes both equal this number. It is not an available ring-store market or a traffic forecast. |

Use the file's folded variants as variants on the same destination and count them once. Do not independently merge every equal-volume row: equal numbers alone do not prove identical intent. Conversely, do not create one page for singular/plural, spelling, material-word order or the same ring-size question.

The export says “No brand phrases,” but actual rows contain Pandora, Tous, Cartier, Swarovski, Tiffany, Bulgari and other brands. Its automatic brand classification is incomplete. For example, `pendientes argollas` is an earrings cluster and includes Tous; `pulsera pandora` contains both bracelet brands and nonbrand queries. Exclude competitor targeting despite the summary flag. Groups named `anillos de bod`, `anillo antiestres`, `anillo mason` and `anillo corte marquesa` mix unrelated styles, information, fandom or imagery searches; the cluster name is not a trustworthy specification of all its demand.

A reproducible **label screen**, not a semantic market estimate, finds 107 ring/material/accessory-labelled groups with a raw cluster sum of 126,440. Nine of those are explicitly brand-labelled groups (8,040 raw searches/mo). Removing those nine, one chain-price group, two ring-holder accessory groups and ambiguous `joyeria solitario` leaves **94 candidate ring/material groups** with an overinclusive raw cluster sum of 115,310. The other 59 labels are largely broader jewellery/watches/wedding content, but some contain ring-adjacent useful information such as amatista and anniversary gifts. Even the 94 candidates contain off-topic/brand rows. These numbers are an audit triage screen; they are not “94 needed pages” or purified demand. A final eligible phrase total requires semantic row-level classification, not summing those clusters.

## What exists now

| Implementation | Count and current coverage |
| --- | --- |
| Configured category destinations | **10**: acero, plata-925, alianzas-plata, alianzas-oro, compromiso, promesa, solitarios, alianzas, oro, hombre. Each has original buying copy, FAQs and related links. |
| Guides | **9**: talles, materiales, anillos-economicos, alianzas-boda-civil, compromiso-y-alianzas, cuidados, bodas-de-oro, estilos-de-anillos, piedras-para-anillos. |
| First-wave SEO mapping | Approximately **40 approved priority groups** distributed across 24 public destinations (home, four hubs, ten categories, nine guides), with variants sharing the destination. |
| Configured ring concepts | Exactly **5**, in `src/config/ring-store.ts`: banda-acero, onda-plata, par-plata, par-oro, solitario, all prefixed `concepto-`. They are design references, not confirmed saleable products. |
| Confirmed real ring products in repository configuration/seed | **0**. The store seed creates categories; its optional loopback-only switch adds the five concepts. No supplied supplier SKU list/specification/price/stock catalogue is configured. Actual admin-created database products cannot be counted from source code, and production was not queried. |
| Unrelated fixtures | `scripts/seed-data.ts` retains 24 generic template test products; the isolated admin workspace fixture creates one synthetic browser product. Neither is a real ring assortment. |

The approved wave covers promesa, compromiso/prices, solitarios, boda/alianzas, gold/silver/men, carretón, sizes/measurements, 925/18k/white gold, affordable choices, anniversary gifts, initial style/antiestrés guidance and diamond/amatista information. The material guide covers meanings; a category page can remain useful before stock exists, but product pages and merchant Offers require real data. Some remaining groups are partly mentioned without receiving a substantive dedicated section.

## Remaining topic backlog

Volumes below are the **exported whole-group totals**, with main-query volumes separately shown. They include mixed rows and are not additive traffic opportunities. Before writing, re-read the selected group and route its actual subintents to the correct existing destination. A new category is justified by a distinct buying intent and real assortment, not simply a cluster label.

| Priority | Meaning group / group searches-mo | Main query searches-mo | Current gap and preferred destination |
| --- | --- | --- | --- |
| P1 | anillos de tungsteno — **790** | **320**; carburo de tungsteno 70 | Not covered. Add a substantive tungsten/carbide section to `/guias/materiales`; a tungsten category can follow confirmed supplier models. Keep titanio as a distinct material, not a tungsten variant. |
| P1 | anillo de oro con rubí — **860**; anillo compromiso rubi — **100** | **210**; commitment-ruby main 10 | No ruby coverage. Add ruby-specific identification/care/comparison section to `/guias/piedras-para-anillos`; connect commitment and gold. Later a genuine ruby assortment can have one category. |
| P1 | churumbela — **700** | **170**; churumbela anillo 110 | Missing style/meaning topic. Add an original churumbela section to `/guias/estilos-de-anillos`, with sourced meaning and band/stone comparison; do not fabricate occasion traditions or stock. |
| P1 | anillo de compromiso para hombre — **940** | **70** | Generic men's copy exists but this distinct occasion question is not developed. Add a clear section/FAQ to `/categoria/compromiso` linking `/categoria/hombre`; no variant URL needed. |
| P1 | anillos personalizados paraguay — **1,070** | **30** | Personalization is mentioned as something to confirm, not explained. Add one substantive personalized-name/initial/measure/engraving section; service landing page only once the supplier confirms actual service. Separate toe/children/wholesale rows from personalization. |
| P1 | alianzas con grabado — **530** | **10** | Basic cautions exist. Add engraving layout, paired spelling/measure approval and price-inclusion questions to `/categoria/alianzas`; link the personalization section rather than create duplicate service pages. |
| P2 | anillo de esmeralda — **1,160** | **30** | Missing. Add emerald section to gemstone guide; separate material/gem/origin/treatment questions and link commitment. |
| P2 | anillo de zafiro — **1,010** | **30**, plural 30 | Missing. Add sapphire section to gemstone guide. Its plural and blue variants share that section or a later real category. |
| P2 | anillo oro rosa — **1,190** | **30** | Rose colour is only mentioned. Explain rose-gold alloy versus rose-coloured plating in `/guias/materiales` and connect `/categoria/oro`. The cluster also contains red/pink gemstones, which belong elsewhere. |
| P2 | anillo de sello — **470** | **50** | Missing signet-style section. Add to style guide and link men's category; do not confuse a style with hallmark `sello 750/925`. |
| P2 | anillo corte marquesa — **840** | **30**; corte princesa 20 | Missing stone-shape/setting explanation. Add a shape section to gemstone/style guide. Do not target celebrity/fandom names mixed into this cluster. |
| P2 | anillos de compromiso sencillos — **520** | **20** | Simplicity is implicit. Expand a clear simple-band/low-setting section on commitment with useful profile/comfort comparison, not another commitment URL. |
| P2 | anillo de corazon — **750** | **30** | Heart is only a design example. Expand promise/style section about shape and comfort; exclude branded heart rows. |
| P2 | anillo antiestres — **2,450** | **70** | Giratorio/antiestrés already has a section, but cluster's filigrana, infinito, tulipán and finger-placement subtopics are not covered. Extend style sections for coherent unbranded designs; no health-effect claims and no “2,450 antiestrés demand” claim. |
| P2 | oro 24 kilates precio — **1,060**; kilates de oro — **540** | **50**; **40** | Material guide emphasizes 18k. Extend comparison with 14k/24k and construction/price factors, with primary sourcing; do not publish unsourced gold prices or make price feeds from KWP. |
| P3 | anillo agata musgosa — **350**; aguamarina piedra precio — **350**; alejandrita anillo — **530** | **10**, **20**, **10** | Future gemstone sections after higher priorities. The moss-agate cluster also contains moissanite; allocate that to its own coherent section. A passing moissanita mention is not full coverage. |
| P3 | anillo con piedra topacio — **260**; anillo con onix mujer — **250**; anillo circonita negra — **640** | **10** each | Additional stone sections if relevant to the planned supplier assortment; preserve actual stone identity and natural/lab/imitation distinction. |
| P3 | anillo de san benito — **330**; anillo atlante — **280**; anillo de serpiente — **300**; calavera — **240** | **50**, **110**, **20**, **10** | Niche style/meaning topics only if relevant to intended products. Avoid spiritual/health efficacy claims and broad low-fit expansion for its own sake. |

The stone/design backlog does not imply each group needs a separate page. The user's one meaning-group → one page **or section** rule lets the existing guides contain these distinct sections. Expand navigation/categories only when the resulting buying destinations are useful, sufficiently distinct and supported by products.

## Product assortment still needed

The next major commercial gap is supplier-confirmed products for the existing categories, not thousands of keyword-derived placeholder products. Prepare a research matrix rather than inventing SKUs:

| Assortment lane | Priority / SEO role | Required differentiation |
| --- | --- | --- |
| Promise bands and discreet motifs | First; largest promise intent | Single versus pair, real metal/finish, everyday profile and sizes. |
| Commitment / solitaire options | First; strong buying and proposal intent | Distinct actual bands/settings and identified stones, not the same concept renamed. |
| Wedding pairs in steel, silver and gold | First; established wedding destinations | Two independent measures, widths and explicit pair pricing/content. |
| Men's bands, carretones and signets | First core bands; signets next | Measured width/profile/construction, metal, comfortable real size availability. |
| Gold/silver individual designs | First core catalogue | Verified purity, weight/construction and a real budget range from supplier quotes. |
| Tungsten/carbide and titanium | Next material investigation | Correct distinct material, construction and realistic sizing/adjustment conditions. |
| Ruby/churumbela/coloured-stone designs | Next differentiated assortment | Identified gems and setting; sourced supplier facts and authorized real photos. |
| Personalization / engraving | Confirm capability before offering | Supplier service, approval process, applicable models, prices, deadline and change terms. |

No fixed “required product count” can be inferred from KWP. Several well-differentiated real models with honest variants may serve multiple relevant searches; duplicating one ring into many nearly identical products/pages is not coverage. One shared product placeholder and two gallery placeholders satisfy the temporary image request but do not replace supplier product data or demonstrate saleable inventory.

Before publication, every product needs supplier/reference, confirmed metal/gem, unit/pair content, size system and variant SKUs, integer PYG price/tax, real stock, authorized photography and actual delivery/change/adjustment conditions. Start uncertain items as private drafts or an appropriate enquiry representation, never as fabricated offers. Keep all five `concepto-*` slugs protected.

## Places and exclusions

Do not add artificial city branches. Summary Asunción 1,680 includes ambiguous `joyería asunción` 1,300; Luque 710 includes the explicit `anillos de compromiso luque paraguay precios` 140. Local landing pages require real service/location facts, not an embedding label. Encarnación includes named competitors, and Pilar rows concern devotional bracelets rather than a store location. Existing factual query-preparation mention of Luque is not proof of a branch or delivery promise.

Exclude competitor-brand pages, earrings/bracelets/necklaces/watch retail not sold here, bridal dresses, centrepieces/decorations/invitations, image/vector/PNG/free-download intent, celebrity/fandom replicas and irrelevant legal/religious wedding material. Some ring-adjacent anniversary education is useful, but it must connect to ring selection rather than turn this shop into a generic wedding portal.

## Supplier research and procurement sequence

Public-source research checked 2026-10-06. These are supplier leads and their advertised terms, not negotiated agreements, inspected samples or confirmed stock for this store. No enquiries were sent, accounts created or purchases made. Brazilian prices are in BRL and do not include a confirmed landed cost in Paraguay.

| Lead | Publicly advertised model and terms | Catalogue role / open question |
| --- | --- | --- |
| [Asunción Joyas](https://asuncionjoyas.com.py/sobre-nosotros/) | Silver/steel resale starts with Gs. 300,000. Advertises 20% retail discount for Gs. 20,000–45,000 pieces and 30% for Gs. 50,000+. Own workshop makes 18k gold alliances and solitaires. | First local stock/quote lead. Gold workshop work is separate from the silver/steel wholesale programme; establish reseller prices, allowed photos, current models and delivery. |
| [Majestic, Encarnación](https://majestic.com.py/se-mayorista/) | Approved wholesale account; published investment options begin at Gs. 500,000; discounts up to 30%, wholesale packs and Paraguay shipping. [Ring category](https://majestic.com.py/categorias/joyas/anillos/). | Local ready-stock comparison. The Gs. 500,000 button is an investment tier, not an independently verified universal minimum. Confirm materials/model availability and net prices. |
| [Joyería G&A, Luque](https://joyeriagya.com/par-de-alianzas-de-plata-con-aplique-en-oro/) | Retail page advertises selected alliances made to order, engraving and made-to-measure possibilities. | Custom-production candidate, **not a verified wholesale programme**. Ask about trade manufacturing/resale terms; do not copy their retail conditions into this store. |
| [DS Pratas, Brazil](https://dspratasatacado.com.br/) | Wholesale silver rings for women/men; R$ 500 minimum; published delivery covers Brazil. | Silver assortment comparison. Export/PY delivery, image rights and any direct fulfilment remain unconfirmed. |
| [Alianças Atacado, Brazil](https://lp.aliancasatacado.com.br/) | Factory B2B silver 950/925 wedding bands; published R$ 800 minimum and Brazil delivery. Landing page timed out on direct retrieval; terms were visible in its indexed official page. | Wedding-pair quote candidate. Reconfirm minimum, unit/pair pricing, measures and export availability before selecting. |
| [Hub Joias, Brazil](https://www.hubjoias.com.br/perguntas-frequentes) | Advertises dropshipping with own-brand packaging, no order minimum, supplier plan R$ 107/month and authorised catalogue photos. [Ring catalogue](https://www.hubjoias.com.br/catalogo/aneis) includes plated zirconia solitaires around R$ 39–40 and heart designs R$ 45, advertised as active-plan cost prices. | Genuine publicly advertised dropship lead. The programme describes Brazil; Paraguay delivery and integration with this custom Next.js store are **not confirmed**. Gold/rhodium-plated products must not be sold as solid gold/silver. |
| [Imagem Folheados, Brazil](https://www.imagemfolheados.com.br/info/como-revender) | Wholesale minimum R$ 195, no minimum quantity per design. Its [dropshipping notice](https://www.imagemfolheados.com.br/dropshipping) explicitly says that programme is paused; the same page shows a plated zirconia solitaire AN0824 at an advertised R$ 8.75 wholesale. | Budget plated-ring bulk source to investigate; **not an available dropship recommendation**. Confirm prices, photos, minimum and export terms. |

Two further Luque wholesale/manufacturing leads are [RELAR](https://www.findglocal.com/PY/Luque/183262852045153/Joyer%C3%ADa-RELAR) and [Ojeda & Asociados](https://www.findglocal.com/PY/Luque/600966333251046/Ojeda%26Asociados---Joyer%C3%ADa). These findings rely on mirrored directory/social content; current terms were not verified on an accessible official business page. Treat them as discovery leads, not confirmed partners. Ojeda's mirrored Gs. 300,000 offer is dated October 2025 and must not be presented as a current quote.

Recommended sequence (our assessment): compare local samples/stock for promise and commitment rings first, obtain a Luque workshop quote for custom wedding pairs, then compare Brazilian silver/steel/plated options on total delivered cost. Dropshipping should only enter the operating plan after direct Paraguay delivery, tracking, returns and availability updates are confirmed. A reseller discount is not net profit: delivery, payment fees, packaging and exchanges consume part of it.

Prepare the first assortment around genuine models for the ten existing categories, with several distinct options for each main buying intent. Prioritise promise, commitment/solitaires, wedding pairs and men's rings; then add sourced tungsten, churumbela, signet and identified-gem models. A shared model can cover related search intents; a new name or a different size does not create a distinct design. New categories need useful original buying content and a coherent real assortment. Until the quotation is confirmed, procurement briefs remain planning records, not public merchant offers.

Supplier enquiry brief to send only after owner authorisation: request current ring catalogue/reference codes; wholesale minimum and prices per single ring or pair; actual metal purity and stone identity/treatments; size system, available sizes and width/weight; stock versus made-to-order timing; engraving and resizing capability; invoice and warranty/exchange conditions; written permission to use photos; packaging and direct-to-customer options; Paraguay delivery cost/tracking; and availability-update/export format. No supplier agreement has been established as part of this work.

## Completion standard and limitations

Track coverage at the intent/section level with three separate statuses: **implemented content**, **confirmed assortment**, **published purchasable catalogue**. The first-wave content is complete; the full long-tail section backlog and real product catalogue remain open. Production database counts and service readiness are not verified by this source-only audit. Keyword volume does not guarantee rankings, traffic, sales or domination of Paraguay; indexing, competition, real product usefulness, trust and operational reliability also determine outcomes.
