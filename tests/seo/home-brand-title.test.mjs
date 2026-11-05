import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const files=new URL('../../dist/',import.meta.url);
const expected={
  tr:'Asya’da Eğitim | Üniversite için başka bir dünya var',
  en:'Education in Asia | There is another world for university education.'
};

test('both homepages start their browser title with the company brand',()=>{
  for(const [locale,title] of Object.entries(expected)){
    const path=locale==='tr'?'index.html':'en/index.html';
    const html=readFileSync(new URL(path,files),'utf8');
    assert.equal((html.match(/<title>/g)||[]).length,1);
    assert.ok(html.includes('<title>'+title+'</title>'),locale+' browser title');
    assert.ok(html.includes('<meta property="og:title" content="'+title+'">'),locale+' social preview title');
    assert.ok(html.includes('<meta name="twitter:title" content="'+title+'">'),locale+' Twitter/X preview title');
    assert.ok(html.includes('<link rel="canonical" href="https://'+(locale==='tr'?'asyadaegitim.com':'educationinasia.com')+'/">'));
  }
});

test('the translation map preserves the brand-first English homepage title on rebuild',()=>{
  const lang=JSON.parse(readFileSync(new URL('../../locales/en.json',import.meta.url),'utf8'));
  assert.equal(lang[expected.tr],expected.en);
});
