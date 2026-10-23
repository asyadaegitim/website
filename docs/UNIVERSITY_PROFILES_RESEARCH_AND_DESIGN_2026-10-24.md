# University-level content and editorial system · 24 October 2026

Branch: `develop/site-foundation-20261023` — **PREVIEW ONLY**; production `asyadaegitim.com` untouched.

## Delivered now
- A **university-specific scholarship directory** at `/universite-burslari/`.
- 6 advanced, evidence-linked university profiles, one or two per priority destination:
  - China: `/universiteler/shanghai-university/`
  - Hong Kong: `/universiteler/the-hong-kong-polytechnic-university/`
  - South Korea: `/universiteler/seoul-national-university/` (NEW, now linked in 28-school atlas and Korean country page)
  - Japan: `/universiteler/tohoku-university/`
  - Singapore: `/universiteler/national-university-of-singapore/`, `/universiteler/nanyang-technological-university/`
- Original existing university records that were previously linked remain intact, now 28 total university URLs. **Only 6 are advanced profiles.** The remaining 22 need substantive university-specific research and visual overhaul; do not represent the whole catalog as completed.
- Detailed record fields in each advanced profile: study context, 3 distinctly named bursary routes, **target audience vs eligibility**, scholarship benefits, admissions checklist, dated caveat and original university/agency sources.
- A separate editorial visual vocabulary in `/university-atlas.css`, with differentiated photo vs typographic hero compositions and unequal section rhythms. No university photo is fabricated; if an original asset is not available, use a typographic masthead rather than another campus's photo.

## University source provenance (24 Oct 2026)

| University | Primary sources & verified claims |
|---|---|
| Shanghai University | https://apply.shu.edu.cn/application/scholarships?language=en — CSC categories, SGS A/B (SGS allowances for degree groups), Shanghai University New International Student Scholarship for Master's/PhD; https://english.shanghai.gov.cn/en-Individuals-HigherEducation-Scholarships/20260813/f1060aadeac645bfa23ac14a0ae29af2.html — official Shanghai Government Scholarship A/B descriptions. Official school webpage lists application dates from **2025–26**, not an open 2026–27 announcement. |
| PolyU Hong Kong | https://www.polyu.edu.hk/en/admissions/tuition-fees-and-scholarships/ — international merit scholarships; https://www.polyu.edu.hk/study/ug/fees-and-scholarships/scholarships — individual entry scholarship rules; https://www.polyu.edu.hk/study/ug/admissions/international-other-qualifications/international-other-qualifications-tuition-fees — **2027/28** nonlocal HK$240,000 per year for specific government-funded full-time undergraduate degrees and HK$20,000 initial payment. Local tuition rates do not apply to this student category. |
| Seoul National University | https://en.snu.ac.kr/admission/undergraduate/scholarships/before_admission — GKS for incoming international undergraduates; https://en.snu.ac.kr/admission/undergraduate/scholarships/after_admission — separate self-financed GKS program for enrolled students; https://en.snu.ac.kr/admission/overview/notice?bbsidx=172484&md=v — **expired** 2027 Spring applications 6–9 July 2026. GKS amounts are official page examples; yearly NIIED guide governs actual awards. |
| Tohoku University | https://www.insc.tohoku.ac.jp/english/scholarship-for-international-students/ — MEXT university/embassy recommendation, stipend amounts for Sendai, JASSO Honors, university scholarship, LEAP doctoral incentive. Categories depend on degree, language and selection mechanism. |
| National University of Singapore | https://nus.edu.sg/oam/scholarships/scholarships-for-freshmen-singapore-permanent-residents/nus-international-undergraduate-scholarship — NUS International Undergraduate Scholarship for international citizens from all countries except Singapore (incl. Turkey eligibility **by nationality only**, subject to all other requirements); https://nus.edu.sg/oam/scholarships/scholarships-for-freshmen-international-students/asean-undergraduate-scholarship — ASEAN limited by citizenship. https://tgs.moe.gov.sg/ — MOE Tuition Grant is related to the **three-year employment bond** despite individual scholarship being described as bond-free. |
| Nanyang Technological University | https://www.ntu.edu.sg/admissions/undergraduate/scholarships-and-awards/scholarship-opportunities/detail/nanyang-scholarship — Nanyang Global open to all nationalities and itemized award (subsidized fee, S$6,500/year living, hostel assistance, computer, program travel subject to conditions), MOE Tuition Grant bond; https://tgs.moe.gov.sg/. |

## Anti-repetition design rules
1. **Never automatically map all universities to the same stack of pastel cards.** Choose among city-led, photographic campus-led, research-led, and scholarship-first compositions. Change story order as appropriate.
2. Use data to decide what appears first: for NUS, eligibility/bond; for SNU, GKS and application dates; for Shanghai, CSC/SGS pathway; for PolyU, intl tuition and entry scholarship; for Tohoku, scholarship/student type; for NTU, funding.
3. Short transparent facts near the masthead, long detail after scroll, official links only at decision points. Don't pack the hero with budgets and eligibility paragraphs.
4. Keep the approved logo intact. Other graphic systems may vary, but preserve reading quality, consistent typography hierarchy and truthful university photography.
5. All changes remain on preview until final owner review. Verify mobile and large-display layouts and deep links.
6. University-by-university sources must be included, with date, academic year, currency, and separation of undergraduate vs postgraduate.
7. A school may be listed in the atlas without a fully verified advanced profile, but never imply bursary eligibility without a source.

## Next content pass
- Deepen remaining 22 existing profiles instead of copying the six pilots' text.
- Build verified new profiles for universities listed in the catalogue but not yet in the school atlas (e.g., Korean SKY/KAIST/POSTECH, Japanese Tokyo/Kyoto/Osaka institutions, Hong Kong and Singapore additional institutions).
- Add structured per-program tuition by academic year, QS 2027 positions with primary data verification, and degree-specific programme names/languages.
- Turn institutional bursaries into structured `audience`, `eligibility`, `award`, `how_to_apply`, `academic_year`, `official_source`, `checked_at` records before implementing a reliable live open/closed availability filter.
- Update summary home, country, and university directory to refer to verified advanced profiles without implying all school profiles are complete.

## Verification performed
- Preview HTTP 200 for six advanced profiles, funding directory, school atlas and Korea country page.
- New pages have 3 institution-specific scholarship entries each, official links, and 1–3 photo/typographic masthead alternatives.
- At least selected 320px, 390px, and 1280px browser previews visually reviewed for overflow and image load.
- GitHub Actions site-audit updated to require 55 HTML routes.


## University imagery pass — 24 October 2026
- **19 new real photographic assets** across the six university identity groups, plus **2 additional verified university identity assets** (Seoul National University public-domain logotype and a licensed photo of the Tohoku University emblem); **21 new credited items** in all.
- Photo provenance stored in `dist/assets/campus-life/ATTRIBUTION.json`, with per-item author, Commons original file URL, image licence and accurate subject description. Public credit page: `/gorsel-kaynaklar/`. Originals resized to WebP; crops/layout only in CSS.
- All six deep profiles now have a real campus photographic masthead + *non-identical* in-page narrative gallery (lake/library, residence/college, classroom, student/study, campus commons), matched by institution.
- All five country pages have 3-image photo essays after the university discovery cards, with institution-aware captions and links to the deeper university profile.
- Bursary directory includes 6 distinct institution campus photographs with correctly matched logos where available.
- University atlas now has official/previously sourced institutional logo artwork on **18 of its 28 school rows**; remaining logos were intentionally not fabricated or replaced with unrelated images. Six featured schools use authentic linked campus photos.
- A photo labelled `Students Walk.jpg` represents the **NTU Students Walk pedestrian route**, not a photo of walking students. Caption and alt text explicitly corrected. For real students in a classroom, see the NUS lecture photograph credited to OfficialKSY.
- Additional dynamic HTML asset tests validate all image paths and presence of 21 attribution manifest records, author/licence/source fields; mobile width 390px checked and the min-content grid overflow of long English university names fixed.
- Student lifestyle imagery remains an **incomplete coverage area** for some institutions: there are no rights-cleared student-portrait photographs for all schools. Do not fill this gap with AI-generated students, generic stock people, another university's campus, or inaccurate captions.
- Future additions: source new true-life student, lab, residence and campus photo sets with explicit use rights, while preserving identity-linked descriptions and balanced editorial variety.
