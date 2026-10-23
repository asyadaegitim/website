# Hero V4.1 — photo reveal and IEFT announcement (23 October 2026)

Status: **preview-only development branch**, not production.
Review URL: https://asyadaegitim-preview.lucky-truth-c0b3.workers.dev/

## Requested and implemented
- Narrower matte gradient: photographic layer starts further left (carousel left 16% instead of 24% for desktop), gradient finishes around 56% instead of 75%, giving much more actual image area.
- Slogan/copy block shrunk to 53% width at desktop with responsive display typography; exact tagline still forms two lines.
- Announcement overlay widened, bolder visual hierarchy, dynamic event-date tags and more legible CTA.
- Original 5-photo destination grid and all subsequent sections retained.
- IEFT story now reads: “24–25 Ekim’de Hilton İstanbul Bosphorus’tayız”, with “Harbiye · İstanbul”, “13.00–18.00”, and invitation to visit our stand.
- Linked the IEFT story to the official organizer event details.

## Photo origin and handling
- Real photograph of an earlier IEFT fair, from organizer archive: https://ieft.net/a/b/i/Pavilyon.JPG
- Resized to **1520×1010 WebP** for performant preview and saved as `dist/assets/events/ieft-archive.webp`. 100 KB approximate payload.
- Photo is *archival*, not a photo of the upcoming 24–25 October 2026 fair. The slide credits “Fotoğraf: IEFT fuar arşivi”.
- **Rights check before production:** the organizer source is public, but no reusable image licence was confirmed; obtain organizer/photographer usage permission or substitute a rights-cleared company-owned photograph before live launch.

## Factual sources
- Official IEFT event listing: https://ieft.com.tr/i/ieft/istanbul_avrupa_yakasi (24–25 October 2026, Hilton İstanbul Bosphorus, Harbiye, 13:00–18:00).
- The statement of Asya’da Eğitim's attendance is supplied by the consultancy, not independently confirmed from an organizer's exhibitor list.
- Winter school 25% discount terms are still awaiting internal verification and should not go live unchecked.

## QA
- Chrome desktop 1280px and mobile 390px rendered, screenshot visually inspected.
- Browser measured 320, 390, 768, 1024, 1440px: all versions have exactly two slogan lines, no text clipping, no page-level horizontal overflow, no broken IEFT images, and the overlay remains within the slide.
- Production Worker `website` was not modified. Preview files only.
- GitHub static preflight passed: https://github.com/asyadaegitim/website/actions/runs/40020957900

## Remaining
- Visual approval, final publishing rights and commercial promotion verification; the site remains in draft development.
