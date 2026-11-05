import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS, TR_HOST, EN_HOST} from '../../workers/shared/routes.mjs';

const dist=fileURLToPath(new URL('../../dist/',import.meta.url));
const read=(path,locale)=>readFileSync(join(dist,locale==='en'?'en':'',path.slice(1),'index.html'),'utf8');
const OFFICIAL=Object.freeze({
  'tsinghua-university':'https://www.tsinghua.edu.cn/en/Admissions.htm',
  'national-university-of-singapore':'https://www.nus.edu.sg/oam/admissions/international-qualifications-for-foreigners',
  'the-university-of-hong-kong':'https://admissions.hku.hk/apply/international-qualifications'
});

test('all 94 published pages exclude legacy competitor and obsolete China Education domains',()=>{
  assert.equal(ROUTE_PAIRS.length,47);
  for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
    const html=read(trPath,locale);
    assert.doesNotMatch(html,/globalvizyon\.com|Global Vizyon|cinegitim-kesfet\.adnanakfirat\.chatgpt\.site/i,locale+' '+trPath);
  }
});

test('three university profiles have two official admissions references in both languages',()=>{
  for(const [slug,officialUrl] of Object.entries(OFFICIAL)){
    const path='/universiteler/'+slug+'/';
    for(const locale of ['tr','en']){
      const html=read(path,locale);
      assert.equal(html.split('href="'+officialUrl+'"').length-1,2,locale+' '+slug);
      const label=slug==='tsinghua-university'
        ?(locale==='tr'?'Üniversitenin resmî sitesi':'Official university website')
        :(locale==='tr'?'Resmî uluslararası başvuru sayfası':'Official international admissions page');
      assert.equal(html.split('>'+label+'</a>').length-1,2,locale+' '+slug+' label');
      assert.match(html,/<a class="button" href="\/(?:en\/on-gorusme|on-gorusme|free-consultation)\/">/);
    }
  }
});

test('both China destination pages link to the live Çin Eğitim corporate domain',()=>{
  for(const locale of ['tr','en']){
    const html=read('/ulkeler/cin/',locale);
    assert.equal(html.split('href="https://cinegitim.com/"').length-1,1,locale);
    assert.match(html,locale==='tr'?/Çin Eğitim’i aç/:/Visit Çin Eğitim/);
  }
});

test('external link changes preserve bilingual canonical and language alternates',()=>{
  for(const {trPath,enPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
    const html=read(trPath,locale);
    const canonical=(locale==='tr'?TR_HOST+trPath:EN_HOST+enPath);
    assert.ok(html.includes('<link rel="canonical" href="'+canonical+'">'),locale+' '+trPath);
    assert.ok(html.includes('<link rel="alternate" hreflang="tr" href="'+TR_HOST+trPath+'">'));
    assert.ok(html.includes('<link rel="alternate" hreflang="en" href="'+EN_HOST+enPath+'">'));
  }
});
