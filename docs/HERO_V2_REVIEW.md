# Hero V2 — 23 October 2026 · Asya’da Eğitim

## Approved scope and URL
Preview only: https://asyadaegitim-preview.lucky-truth-c0b3.workers.dev/
Protected production: https://asyadaegitim.com/
Branch: `develop/site-foundation-20261023`
Draft PR: https://github.com/asyadaegitim/website/pull/1

## Design changes
- Official tagline **“Üniversite için başka bir dünya var.”** rendered in **exactly two deliberate lines** using independently styled, no-wrap spans. “var.” is never orphaned.
- Hero re-composed as editorial copy at left and a real five-country campus-photo slider on the right on desktop; stack gracefully on narrow screens.
- Existing brand logo, approved SVG and its wordmark were not replaced or retouched.
- No generic maroon info card competing with the tagline. A calmer hierarchy: eyebrow → slogan → short explanatory copy → two clear paths.
- Carousel built with original campus photos already licensed/attributed in the site, linked to actual existing country pages. Each slide shows country/city/university rather than made-up facts.
- Manual previous/next buttons, individual country/slide buttons, arrow keys, accessible labels and active/inert state.
- Automatic rotation is slow (8.5 seconds), pauses on hover/focus/visibility changes; direct selection ends auto rotation. Honors reduced-motion preference.
- Repeated five-country photography below the hero replaced by an editorial country index with descriptive links. This avoids redundancy and makes the page feel calmer.
- Overall section spacing tightened slightly, no indiscriminate component proliferation; scholarship, university and admissions sections kept.

## Browser QA — performed on Chrome
- Measured at viewport widths **320, 360, 390, 600, 768, 850, 900, 1024, 1180, 1280, 1440, 1920**: heading occupies exactly two lines, second line does not exceed its column, and there is no document-level horizontal overflow.
- Screenshots reviewed at 390px/mobile and 1280px/desktop.
- Slider 5 slides, arrows, individual country selection, ArrowRight on focused controls: active index, `aria-pressed`, `aria-hidden`, `inert`, and counter correctly synchronized.
- Mobile reduced-motion emulation: transition duration 0, first slide initially active. Mobile menu still opens and order on homepage is China, Hong Kong, South Korea, Japan, Singapore.
- No broken homepage images in tested renders; page JS and CSS loaded.
- GitHub actions static preflight is required before release.

## Limits and next steps
- Only the **homepage** uses new editorial shell. Other country/university pages remain at earlier design level. Shared navigation/design harmonization is pending.
- The home intro, application process and bursary overview do not yet constitute a verified full scholarship/fees content centre.
- Data-sensitive claims are intentionally general until authoritative sources are recorded.
- This is a design candidate for owner review, **not** a production release. Never merge/deploy to `website` without explicit final approval.
