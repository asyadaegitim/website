# Catalogue-to-web editorial and content plan

Reference: **Asya'da Eğitim — 2026–2027 Üniversite ve Burs Kataloğu (v2)**, 16 pages. The catalogue itself is the editorial and visual brief; numeric claims are **not automatically verified**.

## Editorial direction
- **Only logo and its approved wordmark are fixed.** All other elements are open to a better design.
- Catalogue visual grammar: warm mineral paper; high-contrast serif display; italic editorial emphasis; restrained burgundy plus destination-specific colors; asymmetric campus photography; fine rules; disciplined micro-headlines, indices and captions; good information density without small illegible body type.
- Web translation: dramatic but accessible mastheads, responsive photographic mosaics, collapsible structured information rather than all data on the homepage, curated lists, visual contrasts, real navigation, and deliberate whitespace.
- Do not fake a campus or represent the catalogue's artistic composite of Asian skylines as an actual place photo.
- Keep factual and visual audits separate: a beautiful page with unsupported claims fails; an accurate page with degraded composition also fails.

## Catalogue content → site routes

| Source page | Catalogue module | Website destination | Work needed |
|---|---|---|---|
| 1 | Brand proposition, fixed slogan, five countries | Homepage hero and brand CTA | Editorial version in preview; assess visually before production |
| 2 | Pan-Asia rationale; academic merits; international routes | `/neden-asya/` and homepage overview | Build comparative narrative; verify QS/Nature Index/YÖK and fee claims |
| 3 | Five-destination comparison table | `/ulkeler/` and comparison interface | Source-verified country matrix with mobile-friendly comparison |
| 4–6 | China overview, university directory, financing, admissions | `/ulkeler/cin/`, university profiles, scholarships | China pilot: substantive info architecture + full content |
| 7 | Hong Kong overview, English-medium offers and scholarship profile | `/ulkeler/hong-kong/` | Refine route + source fields, scholarships |
| 8–9 | South Korea overview, university selection, GKS | `/ulkeler/guney-kore/` | Enrich academic profiles and funding |
| 10–11 | Japan overview, university selection, MEXT | `/ulkeler/japonya/` | Enrich academic profiles and funding |
| 12–13 | Singapore overview, NUS/NTU and tuition support | `/ulkeler/singapur/` | Enrich institutional diversity, program fees, available grants |
| 14 | Six-stage admissions pathway and destination calendars | `/basvuru-rehberi/` | Detailed document checklist, timelines, qualification rules |
| 15 | Academic advisory manifesto and institutional relationship | `/hakkimizda/` | Stronger philosophy, service boundaries, Shanghai University connection only as verified |
| 16 | Appointment CTA / consultative final page | `/on-gorusme/` + cross-site CTAs | Conversion form actually deliverable, link destinations and privacy |

## Shared country page requirements
1. Editorial country masthead and hero image with reliable provenance.
2. Compact fact sheet: relevant degree levels, academic languages, admissions paths; sources & academic year.
3. University shortlist and full searchable country-filtered catalogue (not copy-pasted generic lists).
4. Tuition & living-cost range with year, city context, currency and primary citations.
5. Funding sorted into government, university and other; **target audience** distinct from **eligibility**; award scope, application path, dates and last checked.
6. Application requirements (language tests, HSK etc.) must be programme-specific and not overgeneralized.
7. Student life/cities, modest genuine imagery and FAQs.
8. Country-specific consultation CTA.

## Priorities
- **Stage 1** Editorial homepage design pilot — interactive preview completed for review; no production edit.
- **Stage 2** China pilot rich country page, university profiles, and scholarship model; test content depth and page hierarchy.
- **Stage 3** Four other country pages and catalogue-wide university profiles; standardized sourced data.
- **Stage 4** Cross-destination comparison, scholarship & cost center, six-stage application guide.
- **Stage 5** End-to-end UX, forms, SEO, performance, accessibility, responsive photography, claim review and staged production release.

## Content truth conditions
For each rank, bursary, fee, calendar or program fact, maintain:
`country`, `institution`, `programme`, `academic_year`, `claim`, `eligibility`, `target_audience`, `source_url`, `source_checked_at`, `status`, `currency` if relevant.
Do not publish a precise award, rank or deadline from a catalogue spread without official source verification. Features that require scheduled upkeep must have an ownership and update strategy before release.

## Review gates
- Build and inspect responsive desktop/mobile preview; compare with catalogue for design (not pixel-identical layout).
- Evaluate actual readability, navigation, focal point, photo quality, and data scanability.
- Run static link test CI.
- Preview only until explicit owner sign-off. Production `website` Cloudflare Worker must remain unchanged.
