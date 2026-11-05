import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROUTE_PAIRS} from '../../workers/shared/routes.mjs';

const dist=new URL('../../dist/',import.meta.url);
const read=(trPath,locale)=>readFileSync(new URL((locale==='en'?'en/':'')+trPath.slice(1)+'index.html',dist),'utf8');
const seal=readFileSync(new URL('../../dist/assets/brand-seal-v01.svg',import.meta.url),'utf8');
const wa=readFileSync(new URL('../../dist/assets/whatsapp-mark.svg',import.meta.url),'utf8');

test('every one of the 94 pages declares the shared approved Brandstudio seal favicon exactly once',()=>{
  assert.equal(ROUTE_PAIRS.length,47);
  assert.match(seal,/viewBox="0 0 400 370"/);
  assert.match(seal,/<rect[^>]*fill="#BD2120"/);
  assert.doesNotMatch(seal,/<text\b/i);
  for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
    const html=read(trPath,locale);
    assert.equal((html.match(/<link rel="icon" type="image\/svg\+xml" href="\/assets\/brand-seal-v01\.svg">/g)||[]).length,1,locale+' '+trPath);
  }
});
test('home and consultation WhatsApp actions preserve destination and use an accessible local brand icon in both languages',()=>{
  assert.match(wa,/viewBox="0 0 448 512"/);
  assert.match(wa,/fill="#25D366"/);
  for(const locale of ['tr','en']){
    for(const trPath of ['/','/on-gorusme/']){
      const html=read(trPath,locale);
      const cls=trPath==='/'?'home-whatsapp-link':'contact-whatsapp';
      assert.match(html,new RegExp('<a class="[^"]*'+cls+'[^"]*" href="https://wa\\.me/905444181508" target="_blank" rel="noopener noreferrer">'));
      assert.equal((html.match(/class="whatsapp-mark" src="\/assets\/whatsapp-mark\.svg" width="20" height="20" alt="" aria-hidden="true"/g)||[]).length,1);
      assert.match(html,locale==='tr'?/WhatsApp’tan yaz/:/Chat on WhatsApp/);
    }
  }
});
test('contact form submission and brand logo paths remain unchanged',()=>{
  for(const locale of ['tr','en']){
    const html=read('/on-gorusme/',locale);
    assert.match(html,/id="consultation-form"/);
    assert.match(html,/https:\/\/formsubmit\.co\/info@asyadaegitim\.com/);
    assert.match(html,/src="\/assets\/asya-logo\.svg"/);
  }
});
