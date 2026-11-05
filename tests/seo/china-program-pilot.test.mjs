import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS,TR_HOST,EN_HOST} from '../../workers/shared/routes.mjs';

const root=fileURLToPath(new URL('../../dist/',import.meta.url));
const pages={
  language:'/ulkeler/cin/dil-programlari/',
  summer:'/ulkeler/cin/yaz-okullari/'
};
const read=(path,locale)=>readFileSync(join(root,locale==='en'?'en':'',path.slice(1),'index.html'),'utf8');
const sources=[
  /https:\/\/isd\.pku\.edu\.cn\//,
  /https:\/\/(?:intl-nondegree|www)\.tsinghua\.edu\.cn\//,
  /https:\/\/(?:iso|iss)\.fudan\.edu\.cn\//
];

test('four Chinese programme pages include three official university sources and an accessible decision guide',()=>{
  for(const [type,path] of Object.entries(pages))for(const locale of ['tr','en']){
    const html=read(path,locale);
    assert.equal((html.match(/<!-- china-program-guide:start -->/g)||[]).length,1);
    assert.equal((html.match(/<!-- china-program-guide:end -->/g)||[]).length,1);
    assert.equal((html.match(/data-china-program="\d"/g)||[]).length,3);
    assert.match(html,new RegExp('data-china-guide="'+type+'" data-source-verified="2026-11-05"'));
    assert.match(html,new RegExp('aria-labelledby="china-'+type+'-verified-programs"'));
    assert.match(html,new RegExp('id="china-'+type+'-verified-programs-steps"'));
    assert.equal((html.match(/target="_blank" rel="noopener noreferrer"/g)||[]).length>=3,true);
    for(const re of sources)assert.match(html,re,locale+' '+type+' source missing');
    assert.match(html,/<div class="card-grid">/);
    assert.match(html,/<div class="steps guide-steps">/);
    assert.match(html,locale==='tr'?/Son kontrol: 5 Kasım 2026/:/Last checked: 5 November 2026/);
    assert.doesNotMatch(html,/globalvizyon\.com|cinegitim-kesfet\.adnanakfirat\.chatgpt\.site/);
  }
});

test('language guide shows upcoming Peking intake, closed Tsinghua intake, Fudan notice, never generic open admission',()=>{
  for(const locale of ['tr','en']){
    const html=read(pages.language,locale);
    assert.match(html,/2027/);
    assert.match(html,/isd\.pku\.edu\.cn\/en\/detail\.php\?id=836/);
    assert.match(html,locale==='tr'?/15 Kasım 2026/:/15 Nov 2026/);
    assert.match(html,locale==='tr'?/3 Kasım 2026/:/3 November 2026/);
    assert.match(html,/8\.000 RMB|RMB 8,000/);
    assert.match(html,locale==='tr'?/Duyuru yayımlandı/:/Notice published/);
    assert.doesNotMatch(html,/2027 yaz (?:okulu|programı) başvuruya açık/i);
  }
});

test('summer guide identifies 2026 programmes as historical, not open 2027 applications',()=>{
  for(const locale of ['tr','en']){
    const html=read(pages.summer,locale);
    assert.match(html,locale==='tr'?/2026 sona erdi/:/2026 ended/);
    assert.match(html,locale==='tr'?/2027 ilanı bekleniyor/:/Awaiting 2027 notice/);
    assert.match(html,/iss\.fudan\.edu\.cn\/info\/1008\/1310\.htm/);
    assert.match(html,/tsinghua\.edu\.cn\/gss\/Upcoming_Events\.htm/);
    assert.doesNotMatch(html,/2027\s+(?:summer|yaz)[^<]{0,40}(?:open|açık)/i);
  }
});

test('all other 90 pages remain free of China guide injection, canonical/hreflang stable on all 94',()=>{
  assert.equal(ROUTE_PAIRS.length,47);
  for(const {trPath,enPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
    const html=read(trPath,locale);
    const wanted=Object.values(pages).includes(trPath);
    const count=(html.match(/<!-- china-program-guide:start -->/g)||[]).length;
    assert.equal(count,wanted?1:0,locale+' '+trPath+' unexpected China guide');
    assert.ok(html.includes('<link rel="canonical" href="'+(locale==='tr'?TR_HOST+trPath:EN_HOST+enPath)+'">'));
    assert.ok(html.includes('<link rel="alternate" hreflang="tr" href="'+TR_HOST+trPath+'">'));
    assert.ok(html.includes('<link rel="alternate" hreflang="en" href="'+EN_HOST+enPath+'">'));
  }
});

test('consultation pages retain their original email form endpoint',()=>{
  for(const locale of ['tr','en']){
    const html=read('/on-gorusme/',locale);
    assert.match(html,/id="consultation-form"/);
    assert.match(html,/formsubmit\.co\/info@asyadaegitim\.com/);
  }
});
