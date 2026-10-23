# Asya’da Eğitim — Site quality contract

Status: development foundation, 23 October 2026. **Do not deploy this branch to production automatically.**

## Authority and identity
- Production website: https://asyadaegitim.com/
- Protected design baseline: production visual design as it existed when development began. GitHub `main` is a 17 October static export, **not** the original ChatGPT Sites generator or authoritative data source; its visual/content parity with the live Worker must be verified.
- Official primary slogan, exact spelling and punctuation: **Üniversite için başka bir dünya var.**
- Primary CTA: **Ücretsiz ön görüşme için randevu alın.**
- Country order everywhere: **Çin → Hong Kong → Güney Kore → Japonya → Singapur**.
- Original approved logo and wordmark assets are locked. Never redraw, reinterpret, replace, or substitute typographic versions; find and reuse the original master SVG/type assets before any logo intervention.
- Relationship: **Asya’da Eğitim** is the parent brand, **Çin Eğitim** is the specialist brand.

## Design non-regression
- Preserve the strongest existing campus-focused layout, photography, tasteful interactions, spacing and navigation; do not simplify into generic cards or add bloated sections.
- Keep the homepage selective; detailed bursaries, tuition, living costs and application rules belong on dedicated pages.
- Reuse a common design system but allow distinctive editorial layouts for each destination.
- Do not shrink body typography merely to fit text. Make mobile layouts genuinely readable and keyboard accessible.
- For substantive visual changes, inspect *before and after* on desktop and mobile, document differences and require human approval. Automated HTML checks alone cannot establish visual parity.

## Content and evidence
- The printed 2026–2027 catalogue is a content brief, **not** proof that a figure or deadline is currently valid.
- Program eligibility, scholarship target audience versus eligibility criteria, fees, QS ranking year, HSK/English prerequisites and deadlines must each be verifiable via primary sources.
- Store source URL, applicable academic year/currency, and date verified with changing information. Never imply bursaries are open without verification.
- Distinguish university recognition, program acceptance, funded awards and advisory services. Do not claim admission or scholarship guarantees.
- No unsupported imagery (imaginary campuses/logos), decorative legal notices or distracting animation.

## Change procedure
1. Work only on a feature/development branch.
2. Run `python3 scripts/audit_site.py` and any future content checks.
3. Verify that the preview uses this exact branch and that `main` and live Cloudflare Worker remain untouched.
4. Review actual mobile and desktop renders; fix regressions before approval.
5. Only after explicit approval, merge and deploy; check production and keep a rollback reference.

## Known technical limitations
- Repository currently contains a static `dist/` export (48 HTML pages), not the source generator. Do **not** silently invent or replace that source.
- Production Cloudflare Worker is `website`; dedicated preview must use a different Worker.
- A read-only GitHub-raw-content Worker preview, when available, is a **development preview only**, not a scalable production build or evidence of byte-for-byte parity with the production Worker.
