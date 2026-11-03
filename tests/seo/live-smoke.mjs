#!/usr/bin/env node
// Read-only smoke check. Never submits forms or changes Cloudflare configuration.
import assert from 'node:assert/strict';
import {ROUTE_PAIRS,TR_HOST,EN_HOST} from '../../workers/shared/routes.mjs';
const flags=Object.fromEntries(process.argv.slice(2).filter(v=>v.startsWith('--')&&v.includes('=')).map(v=>v.slice(2).split(/=(.*)/s).slice(0,2)));
if(!flags.tr||!flags.en){console.error('Usage: node tests/seo/live-smoke.mjs --tr=https://tr-preview.example --en=https://en-stage.example');process.exit(2);}
let checked=0;
function url(base,path){return new URL(path,new URL(base)).toString();}
async function get(base,path){
 const response=await fetch(url(base,path),{redirect:'manual',headers:{accept:'text/html,application/xml'}});
 return {status:response.status,text:await response.text(),headers:response.headers};
}
function eqLink(html,attr,expected,rel){
 const re=attr==='canonical'?/<link rel="canonical" href="([^"]+)">/g:new RegExp('<link rel="alternate" hreflang="'+attr+'" href="([^"]+)">','g');
 const all=[...html.matchAll(re)].map(m=>m[1]);
 assert.deepEqual(all,[expected],rel+' '+attr);
}
for(const {trPath,enPath} of ROUTE_PAIRS){
 for(const [locale,host,path,canonical] of [['tr',flags.tr,trPath,TR_HOST+trPath],['en',flags.en,enPath,EN_HOST+enPath]]){
  const response=await get(host,path);
  assert.equal(response.status,200,locale+' '+path+' must be direct 200, got '+response.status);
  assert.match(response.text,new RegExp('<html lang="'+locale+'">'),locale+' '+path);
  eqLink(response.text,'canonical',canonical,locale+' '+path);
  eqLink(response.text,'tr',TR_HOST+trPath,locale+' '+path);
  eqLink(response.text,'en',EN_HOST+enPath,locale+' '+path);
  assert.doesNotMatch(response.text,/hreflang="x-default"/);
  checked++;
 }
}
for(const [locale,base,canonicalHost] of [['tr',flags.tr,TR_HOST],['en',flags.en,EN_HOST]]){
 const sitemap=await get(base,'/sitemap.xml');
 assert.equal(sitemap.status,200,locale+' sitemap');
 const locs=[...sitemap.text.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);
 assert.equal(locs.length,ROUTE_PAIRS.length,locale+' sitemap loc count');
 assert.equal(new Set(locs).size,locs.length);
 assert.ok(locs.every(v=>v.startsWith(canonicalHost+'/')),locale+' loc must use own host');
 const miss=await get(base,locale==='tr'?'/universiteler/unknown-university/':'/universities/unknown-university/');
 assert.equal(miss.status,404,locale+' unknown university');
 const consultation=await get(base,locale==='tr'?'/on-gorusme/':'/free-consultation/');
 assert.equal(consultation.status,200);
 assert.match(consultation.text,/id="consultation-form"/);
 assert.match(consultation.text,/formsubmit\.co/);
}
console.log('Bilingual smoke passed:',checked,'HTML pages, 2 sitemaps, 2 missing pages, 2 consultation forms.');
