# Consultation conversion and lead-source minimization — design and release note
**Date:** 2026-11-03  
**Sites:** asyadaegitim.com (TR), educationinasia.com (EN)  
**Feature branch:** feat/consultation-conversion-20261103

## Intent
Reduce unnecessary friction between an interested visitor and Asya'da Eğitim while keeping the published branding, two-host canonical SEO, 47 page pairs, existing consultation email destination and accessible forms. Make campaign attribution useful **without creating a separate tracking database or copying arbitrary URL parameters into an email**.

## Current-state evidence
- Both homepages have a free pre-consultation link; neither showed a direct WhatsApp link. The consultation page displayed email and telephone but no visible WhatsApp action.
- Both consultation forms use FormSubmit, with the AJAX endpoint \`https://formsubmit.co/ajax/info@asyadaegitim.com\`; responses display immediate status but that is not proof of final email delivery.
- Old script passed full \`location.href\` to the \`_url\` field. A browser test with a query parameter resembling a personal email showed that value in the outgoing JSON payload **without actually contacting FormSubmit**.
- No published privacy/KVKK information page was found in the current 47-page static route inventory. Short FormSubmit disclosure is already present, but is not a full legal notice.
- Site contact telephone was \`+90 544 418 15 08\` (existing \`tel:+905444181508\`).

## Options considered
1. **Small, existing-stack conversion fix (selected as the default for this iteration):** Keep the current form, add user-initiated WhatsApp/telephone/email alternatives, whitelist a few UTM campaign labels, and strip all URL query parameters before populating \`_url\`. No new provider, cookie, paid API, database, customer data duplication or change to the current submission endpoint.
2. **HubSpot-native embedded forms:** Potential automatic CRM ingestion and reporting, but introduces Starter plan/UI dependencies and could change the currently functioning design and double-opt-in workflow. Defer to a dedicated CRM integration design.
3. **Cloudflare Worker + D1/R2 application inbox:** Durable lead records, audit trail and HubSpot event integration without a third-party form, but requires authentication, rate limits, privacy/retention rules, backups, idempotency and abuse controls. Coordinate with the separately planned Access-protected customer application management system rather than ship an unreviewed form backend.

## Implementation
- One direct WhatsApp CTA beside existing homepage consultation button, and contact-choice block on both consultation pages: WhatsApp (external, click-initiated), telephone (tel:), email (mailto:). All point to the existing corporate contact details. **The account's WhatsApp registration is not verified here**; validate the business number before relying on it as a channel.
- Existing FormSubmit target and all required form fields remain unchanged.
- Browser submission uses \`origin + pathname\` for \`_url\` (no URL query string). Only \`utm_source\`, \`utm_medium\`, \`utm_campaign\`, \`utm_content\` are included if the values are 1–100 ASCII letters, digits, spaces, underscore, period or hyphen. Reject arbitrarily named parameters and click IDs. Include \`Site language\` for email triage.
- No analytics beacon, cookie, local storage, automated WhatsApp message, auto-created HubSpot contact, marketing consent checkbox, or customer-facing "confirmed" tracking number.
- Add EN translations to \`locales/en.json\` and ensure generator reconstructs the translated EN pages from TR source on every build.

## Verification
- Red stage: 29 tests, 25 pass / **4 fail** (missing WhatsApp actions + unfiltered URL source). Local browser mock also demonstrated query leakage with no real email sent.
- Green stage: 29/29 Node tests passed on Cloudflare preview build; TR and EN static preview contact links and translation inspected; 320 px screens have no horizontal overflow; the WhatsApp touch target is at least 44 px tall.
- Live-browser AJAX mock: safe UTM values are included, arbitrary \`email\` and \`token\` query parameters are omitted; existing success behavior remains unchanged. **No real FormSubmit/WhatsApp message was sent.**
- Full EN Worker staging smoke and safe release are separate gates. Do not merge to \`main\` or publish both domains without checking 47/47 page SEO and the forms.

## Privacy and legal publication gate
A complete pre-consultation-specific KVKK notice must be prepared and formally approved before adding a privacy-policy link claiming compliance. The Turkish Personal Data Protection Authority's Article 10 guidance requires the data controller identity, purposes, recipients/transfer purposes, collection method and legal basis, and data-subject rights; mere "privacy policy" text is not necessarily an adequate form-specific notice.

Business/legal verification needed: data controller's exact registered legal name and contact/address, legal bases, retention schedule and deletion policy, processors/foreign transfers (including FormSubmit), data subject rights/contact method, whether marketing communications are separately opted in, whether/where the business uses WhatsApp Business, and approved EN translation.

Official references:
- https://www.kvkk.gov.tr/Icerik/2033/Aydinlatma-Yukumlulugu-
- https://www.kvkk.gov.tr/Icerik/6765/AYDINLATMA-YUKUMLULUGUNUN-YERINE-GETIRILMESI-HAKKINDA-KAMUOYU-DUYURUSU

Do not make a compulsory "I approve the privacy notice" checkbox just to satisfy this step; notification and optional marketing consent have distinct purposes. Seek legal review before publishing a binding legal notice.

## Next milestone
After testing source capture and contact channels in production, design durable lead tracking as a separate, access-controlled application. Confirm FormSubmit receipt first and then weigh a secure event-driven HubSpot integration against a Worker/D1 lead inbox. Establish real-time source attribution, deduplication, reliable delivery, retention and backup rules before introducing live customer storage.

## Rollback
Restore EN and TR previous Cloudflare Worker versions (EN v5, TR v21 at branch creation); the existing FormSubmit address remains unaffected. Re-run bilingual SEO and form smoke tests on each host.
