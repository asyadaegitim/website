import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROUTE_PAIRS,TR_HOST,EN_HOST} from '../../workers/shared/routes.mjs';
const root=new URL('../../dist/',import.meta.url).pathname;
const read=path=>readFileSync(join(root,path),'utf8');
const hits=(text,re)=>[...text.matchAll(re)].map(m=>m[1]);
test('both sitemaps list precisely the 47 local canonical 200-page paths',()=>{
 const tr=read('sitemap.xml'),en=read('en-sitemap.xml');
 const trLoc=hits(tr,/<loc>([^<]+)<\/loc>/g),enLoc=hits(en,/<loc>([^<]+)<\/loc>/g);
 assert.equal(trLoc.length,ROUTE_PAIRS.length);assert.equal(enLoc.length,ROUTE_PAIRS.length);
 assert.equal(new Set(trLoc).size,trLoc.length);assert.equal(new Set(enLoc).size,enLoc.length);
 assert.deepEqual(new Set(trLoc),new Set(ROUTE_PAIRS.map(x=>TR_HOST+x.trPath)));
 assert.deepEqual(new Set(enLoc),new Set(ROUTE_PAIRS.map(x=>EN_HOST+x.enPath)));
 assert.doesNotMatch(tr+en,/<loc>https:\/\/asyadaegitim\.com\/en\//);
 assert.match(read('robots.txt'),/Sitemap: https:\/\/asyadaegitim\.com\/sitemap\.xml/);
});
test('every locale has a unique canonical, reciprocal alternates and valid social tags',()=>{
 for(const {trPath,enPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
  const rel=(locale==='tr'?'':'en/')+(trPath==='/'?'':trPath.slice(1))+'index.html';
  const page=read(rel),canonical=(locale==='tr'?TR_HOST+trPath:EN_HOST+enPath);
  assert.match(page,new RegExp('<html lang="'+locale+'">'),rel);
  assert.deepEqual(hits(page,/<link rel="canonical" href="([^"]+)">/g),[canonical],rel);
  assert.deepEqual(hits(page,/<link rel="alternate" hreflang="tr" href="([^"]+)">/g),[TR_HOST+trPath],rel);
  assert.deepEqual(hits(page,/<link rel="alternate" hreflang="en" href="([^"]+)">/g),[EN_HOST+enPath],rel);
  assert.doesNotMatch(page,/hreflang="x-default"/,rel);
  assert.match(page,/<meta property="og:title" content="[^"]+">/,rel);
  assert.match(page,/<meta property="og:description" content="[^"]+">/,rel);
  assert.match(page,new RegExp('<meta property="og:url" content="'+canonical.replaceAll('.','\\.')+'">'),rel);
  assert.match(page,/<meta name="twitter:card" content="summary_large_image">/,rel);
  assert.match(page,/<a lang="tr" hreflang="tr" href="https:\/\/asyadaegitim\.com\//,rel);
  assert.match(page,/<a lang="en" hreflang="en" href="https:\/\/educationinasia\.com\//,rel);
  if(locale==='en') assert.doesNotMatch(page,/<title>[^<]*Asya’da Eğitim[^<]*<\/title>/,rel);
 }
});
test('home pages have truthful Organization JSON-LD',()=>{
 for(const rel of ['index.html','en/index.html']){
  const p=read(rel);
  const scripts=hits(p,/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  assert.equal(scripts.length,1,rel);
  const schema=JSON.parse(scripts[0]);assert.equal(schema['@type'],'Organization');
  assert.ok(schema.url.startsWith('https://'));
 }
});
