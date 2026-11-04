import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS} from '../../workers/shared/routes.mjs';

const dist=fileURLToPath(new URL('../../dist/',import.meta.url));
const load=p=>readFileSync(join(dist,p),'utf8');
const names=['tsinghua','tohoku','kyungbok','nus','polyu'];

test('94 localized documents load only local CSS, not third-party Google Fonts CSS',()=>{
  for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
    const content=load(join(locale==='en'?'en':'',trPath.slice(1),'index.html'));
    assert.doesNotMatch(content,/fonts\.googleapis\.com|fonts\.gstatic\.com/,locale+' '+trPath);
    assert.match(content,/<link rel="stylesheet" href="\/site\.css">/,locale+' '+trPath);
    assert.match(content,/<script[^>]+\/site\.js/,locale+' '+trPath);
  }
});

test('four licensed WOFF2 subsets load locally and preserve font families and weight axes',()=>{
  const css=load('site.css');
  assert.equal((css.match(/@font-face/g)||[]).length,4);
  assert.match(css,/font-family: 'DM Sans'; font-style: normal; font-weight: 400 700/);
  assert.match(css,/font-family: 'Jost'; font-style: normal; font-weight: 400 600/);
  assert.match(css,/font-display: swap/);
  for(const filename of [
    'dm-sans-latin-ext-v17.woff2','dm-sans-latin-v17.woff2',
    'jost-latin-ext-v20.woff2','jost-latin-v20.woff2'
  ]){
    const path=join(dist,'assets/fonts',filename);
    assert.equal(readFileSync(path).subarray(0,4).toString(),'wOF2');
    assert.match(css,new RegExp(filename.replace('.','\\.')+'\\b'));
    assert.ok(statSync(path).size<50000);
  }
  assert.match(load('assets/fonts/DM-Sans-OFL.txt'),/SIL OPEN FONT LICENSE/);
  assert.match(load('assets/fonts/Jost-OFL.txt'),/SIL OPEN FONT LICENSE/);
});

test('versioned local fonts use immutable asset cache policy',()=>{
  assert.match(load('_headers'),/\/assets\/fonts\/\*\n  Cache-Control: public, max-age=31536000, immutable/);
});

for(const [locale,homepage] of [['tr','index.html'],['en','en/index.html']]){
  test(locale+' featured cards reuse campus WebP variants and JPEG fallback',()=>{
    const html=load(homepage);
    assert.equal((html.match(/<picture data-responsive-featured="1">/g)||[]).length,5);
    for(const slug of names){
      assert.match(html,new RegExp('srcset="/assets/optimized/'+slug+
        '-480\\.webp 480w, /assets/optimized/'+slug+'-960\\.webp 960w"'));
      assert.match(html,new RegExp('<div class="featured-photo"><picture[^>]*>[\\s\\S]*?src="/assets/universities/'+slug+'\\.jpg"'));
    }
    assert.match(load('site.css'),/\.featured-photo > picture \{ display: block; width: 100%; height: 100%; \}/);
  });
}

test('consultation form endpoints and scripts stay untouched',()=>{
  const tr=load('on-gorusme/index.html');
  const en=load('en/on-gorusme/index.html');
  for(const html of [tr,en]){
    assert.match(html,/formsubmit\.co\/info@asyadaegitim\.com/);
    assert.match(html,/id="consultation-form"/);
    assert.doesNotMatch(html,/fonts\.googleapis\.com/);
  }
  assert.match(load('site.js'),/const consultationForm=document\.querySelector\('#consultation-form'\)/);
});
