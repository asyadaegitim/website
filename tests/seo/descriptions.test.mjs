import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS,TR_HOST,EN_HOST} from '../../workers/shared/routes.mjs';

const root=fileURLToPath(new URL('../../dist/',import.meta.url));
const read=(trPath,locale)=>readFileSync(
  join(root,locale==='en'?'en':'',trPath.slice(1),'index.html'),'utf8'
);
const meta=(html,name)=> {
  const patterns={
    description:/<meta name="description" content="([^"]*)"/g,
    og:/<meta property="og:description" content="([^"]*)"/g,
    twitter:/<meta name="twitter:description" content="([^"]*)"/g
  };
  const found=[...html.matchAll(patterns[name])];
  assert.equal(found.length,1,'Expected exactly one '+name+' tag');
  return found[0][1];
};
const generalTR=new Set(['/ulkeler/','/okullar/','/programlar/','/on-gorusme/']);
const isSub=trPath=>/\/(?:dil-programlari|yaz-okullari)\/$/.test(trPath);

test('all 94 pages have unique, nonempty, SEO-safe localized descriptions',()=>{
  assert.equal(ROUTE_PAIRS.length,47);
  for(const locale of ['tr','en']){
    const descriptions=new Map();
    let changed=0;
    for(const {trPath,enPath} of ROUTE_PAIRS){
      const html=read(trPath,locale);
      const description=meta(html,'description');
      assert.ok(description.length>=40&&description.length<=175,locale+' '+trPath+' len '+description.length);
      assert.equal(meta(html,'og'),description,locale+' '+trPath+' OG mismatch');
      assert.equal(meta(html,'twitter'),description,locale+' '+trPath+' Twitter mismatch');
      assert.ok(!descriptions.has(description),locale+' duplicate description: '+trPath+
        ' and '+(descriptions.get(description)||''));
      descriptions.set(description,trPath);
      const targeted=isSub(trPath)||(locale==='tr'&&generalTR.has(trPath));
      if(targeted){
        changed++;
        assert.ok(description.length>=75,locale+' '+trPath+' curated copy too short');
        assert.doesNotMatch(description,/Asya’da Eğitim ile Çin, Japonya|Explore university study, academic programs and student life/);
      }
      const canonical=(locale==='tr'?TR_HOST+trPath:EN_HOST+enPath);
      assert.match(html,new RegExp('<link rel="canonical" href="'+canonical+'">'));
      assert.match(html,/<link rel="alternate" hreflang="tr"/);
      assert.match(html,/<link rel="alternate" hreflang="en"/);
    }
    assert.equal(descriptions.size,47);
    assert.equal(changed,locale==='tr'?14:10);
  }
});

test('program summary language is faithful to on-page subjects',()=>{
  for(const locale of ['tr','en']){
    const china=meta(read('/ulkeler/cin/dil-programlari/',locale),'description');
    const korea=meta(read('/ulkeler/guney-kore/dil-programlari/',locale),'description');
    const singapore=meta(read('/ulkeler/singapur/yaz-okullari/',locale),'description');
    const hongkong=meta(read('/ulkeler/hong-kong/yaz-okullari/',locale),'description');
    assert.match(china,/HSK/);
    assert.match(korea,/TOPIK/);
    assert.match(singapore,locale==='tr'?/kredi aktarımı/i:/credit transfer/i);
    assert.match(hongkong,locale==='tr'?/başvuru takvimleri/i:/application schedules/i);
  }
});

test('consultation forms remain present and keep the existing submit endpoint',()=>{
  for(const locale of ['tr','en']){
    const html=read('/on-gorusme/',locale);
    assert.match(html,/id="consultation-form"/);
    assert.match(html,/formsubmit\.co\/info@asyadaegitim\.com/);
  }
});
