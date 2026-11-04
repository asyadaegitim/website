import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROUTE_PAIRS} from '../../workers/shared/routes.mjs';

const dist=new URL('../../dist/',import.meta.url);
const read=(route,locale)=>readFileSync(new URL((locale==='en'?'en/':'')+route.slice(1)+'index.html',dist),'utf8');
const count=(s,regex)=>[...s.matchAll(regex)].length;

test('all 94 canonical pages provide exactly one first-focusable, localized skip-to-content link',()=>{
 for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
  const s=read(trPath,locale);
  const label=locale==='tr'?'Ana içeriğe geç':'Skip to main content';
  assert.equal(count(s,/<a class="skip-link" href="#main-content">/g),1,locale+' '+trPath+' skip count');
  assert.match(s,new RegExp('<body[^>]*>\\s*<a class="skip-link" href="#main-content">'+label+'</a>'),locale+' '+trPath+' not first');
  assert.equal(count(s,/<main id="main-content" tabindex="-1">/g),1,locale+' '+trPath+' main target');
  assert.equal(count(s,/\bid="main-content"/g),1,locale+' '+trPath+' duplicate main id');
  assert.equal(count(s,/<main\b/g),1,locale+' '+trPath+' multiple main landmarks');
 }
});

test('language switch links identify their destination without changing TR/EN routing',()=>{
 for(const {trPath,enPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
  const s=read(trPath,locale);
  const lang=s.match(/<div class="lang-switch"[\s\S]*?<\/div>/)?.[0]||'';
  assert.ok(lang,locale+' '+trPath+' language switch missing');
  assert.match(lang,/<a lang="tr"[^>]*aria-label="(?:Türkçe sürüm \(mevcut sayfa\)|Switch to Turkish)"[^>]*>TR<\/a>/);
  assert.match(lang,/<a lang="en"[^>]*aria-label="(?:İngilizce sürüme geç|English version \(current page\))"[^>]*>EN<\/a>/);
  assert.ok(lang.includes('href="https://asyadaegitim.com'+trPath+'"'),locale+' '+trPath+' TR URL');
  assert.ok(lang.includes('href="https://educationinasia.com'+enPath+'"'),locale+' '+trPath+' EN URL');
  assert.equal(count(lang,/aria-current="page"/g),1,locale+' '+trPath+' current language');
 }
});

test('skip link is visually hidden until focus, and carousel/social controls offer 44px targets',()=>{
 const css=readFileSync(new URL('../../dist/site.css',import.meta.url),'utf8');
 assert.match(css,/\.skip-link\s*\{[^}]*position:\s*fixed/);
 assert.match(css,/\.skip-link:focus-visible\s*\{[^}]*transform:\s*none/);
 assert.match(css,/\.carousel-button\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
 assert.match(css,/\.footer-social a\s*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
 assert.match(css,/@media\s*\(forced-colors:\s*active\)/);
 assert.match(css,/@media\s*\(prefers-reduced-motion:\s*reduce\)/);
});

test('accessibility HTML enrichment is idempotent and preserves forms and SEO',async()=>{
 const {enrichAccessibilityHTML}=await import('../../scripts/accessibility-core.mjs');
 for(const [route,locale] of [['/','tr'],['/','en'],['/okullar/','tr'],['/okullar/','en'],['/on-gorusme/','tr'],['/on-gorusme/','en']]){
  const source=read(route,locale),again=enrichAccessibilityHTML(source,locale);
  assert.equal(again,source,locale+' '+route+' duplicated accessibility affordances');
  const canonical=source.match(/<link rel="canonical" href="([^"]+)"/)?.[1];
  assert.equal(again.match(/<link rel="canonical" href="([^"]+)"/)?.[1],canonical);
  if(route==='/on-gorusme/'){
   assert.match(again,/id="consultation-form"/);
   assert.match(again,/action="https:\/\/formsubmit.co\/info@asyadaegitim\.com"/);
   assert.match(again,/id="consultation-data-note"/);
  }
 }
});
