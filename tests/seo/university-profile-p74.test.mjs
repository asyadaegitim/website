import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS,TR_HOST,EN_HOST} from '../../workers/shared/routes.mjs';

const root=fileURLToPath(new URL('../../dist/',import.meta.url));
const content=JSON.parse(readFileSync(new URL('../../content/china-university-profiles-2027.json',import.meta.url),'utf8'));
const slugs=['tsinghua-university','peking-university','fudan-university'];
const read=(path,locale)=>readFileSync(join(root,locale==='en'?'en':'',path.slice(1),'index.html'),'utf8');
const official=/(?:^|\/\/)(?:[a-z0-9-]+\.)*(?:tsinghua\.edu\.cn|join-tsinghua\.edu\.cn|pku\.edu\.cn|fudan\.edu\.cn)\//;

test('six bilingual China university profiles have sourced, dated 2027 admission guidance',()=>{
  assert.equal(content.reviewedOn,'2026-11-05');
  assert.deepEqual(Object.keys(content.profiles).sort(),slugs.slice().sort());
  for(const slug of slugs)for(const locale of ['tr','en']){
    const html=read('/universiteler/'+slug+'/',locale);
    assert.equal((html.match(/data-university-profile=/g)||[]).length,2,slug+' '+locale);
    assert.equal((html.match(/data-reviewed-at="2026-11-05"/g)||[]).length,2);
    assert.match(html,/<section id="akademik" class="profile-2027"/);
    assert.match(html,/<section id="basvuru" class="profile-2027"/);
    assert.match(html,/class="field-grid profile-2027-fields"/);
    assert.match(html,/class="steps profile-2027-steps"/);
    assert.equal((html.match(/<div class="field-card">/g)||[]).length,3);
    assert.equal((html.match(/<div class="step">/g)||[]).length,4);
    const links=[...html.matchAll(/<a class="text-link" href="(https:\/\/[^"]+)" target="_blank" rel="noopener noreferrer">/g)].map(x=>x[1]);
    assert.ok(links.length>=4,slug+' '+locale+' official references');
    for(const url of links)assert.match(url,official,slug+' '+locale+' '+url);
    const p=content.profiles[slug],d=p[locale];
    assert.ok(html.includes(d.academicTitle));
    assert.ok(html.includes(d.admissionsTitle));
    assert.ok(html.includes(d.relatedTitle));
    assert.match(html,/\/(?:en\/)?ulkeler\/cin\//);
    assert.match(html,locale==='tr'?/Ücretsiz Ön Görüşme/:/Free Pre-Consultation/);
    assert.doesNotMatch(html,/globalvizyon\.com|cinegitim-kesfet/);
  }
});

test('the 2027 programme and deadline claims are distinguished by institution',()=>{
  for(const locale of ['tr','en']){
    const ts=read('/universiteler/tsinghua-university/',locale);
    const pk=read('/universiteler/peking-university/',locale);
    const fu=read('/universiteler/fudan-university/',locale);
    assert.match(ts,/54/);
    assert.match(ts,/40/);
    assert.match(ts,locale==='tr'?/800 RMB/:/RMB 800/);
    assert.match(pk,locale==='tr'?/26 Ekim–25 Aralık 2026/:/26 October–25 December 2026/);
    assert.match(pk,/HSK 6/);
    assert.match(fu,locale==='tr'?/3 Kasım 2026/:/3 November 2026/);
    assert.match(fu,/\bMIF\b/);
    assert.match(fu,/\bMAIB\b/);
    assert.match(fu,locale==='tr'?/Ekim 2026–Nisan 2027/:/October 2026–April 2027/);
    assert.doesNotMatch(fu,/\bAll Fudan programmes close in April 2027\b/);
  }
});

test('all other 88 pages remain untouched by the university profile enrichment and all 94 retain SEO links',()=>{
  assert.equal(ROUTE_PAIRS.length,47);
  for(const {trPath,enPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
    const html=read(trPath,locale);
    const expected=slugs.some(slug=>trPath==='/universiteler/'+slug+'/');
    assert.equal((html.match(/data-university-profile=/g)||[]).length,expected?2:0,locale+' '+trPath);
    assert.ok(html.includes('<link rel="canonical" href="'+(locale==='tr'?TR_HOST+trPath:EN_HOST+enPath)+'">'));
    assert.ok(html.includes('<link rel="alternate" hreflang="tr" href="'+TR_HOST+trPath+'">'));
    assert.ok(html.includes('<link rel="alternate" hreflang="en" href="'+EN_HOST+enPath+'">'));
  }
});

test('existing consultation form routes and delivery stay intact',()=>{
  for(const locale of ['tr','en']){
    const html=read('/on-gorusme/',locale);
    assert.match(html,/id="consultation-form"/);
    assert.match(html,/https:\/\/formsubmit\.co\/info@asyadaegitim\.com/);
  }
});
