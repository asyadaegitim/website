import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../../dist/',import.meta.url);
const read=locale=>readFileSync(new URL((locale==='en'?'en/':'')+'index.html',root),'utf8');

test('bilingual hero places destination link inline after the description',()=>{
  for(const locale of ['tr','en']){
    const h=read(locale);
    const paragraph=h.match(/<p class="hero-description">([\s\S]*?)<\/p>/)?.[1];
    assert.ok(paragraph,locale+' description missing');
    assert.match(paragraph,/<a class="hero-discover-link" href="\/(?:en\/)?ulkeler\/">/);
    assert.equal((h.match(/class="hero-discover-link"/g)||[]).length,1);
    assert.match(paragraph,locale==='tr'?/izini sür\./:/Singapore and Hong Kong\./);
    const source=locale==='tr'?'Ülkeleri keşfet':'Explore destinations';
    assert.ok(paragraph.includes(source));
  }
});


test('consultation calendar icon and WhatsApp button appear in that order below the destination link',()=>{
  for(const locale of ['tr','en']){
    const h=read(locale);
    const block=h.match(/<div class="hero-actions hero-contact-actions">([\s\S]*?)<\/div><\/div><\/div><div class="hero-accordion"/)?.[1];
    assert.ok(block,locale+' CTA group missing');
    assert.equal((block.match(/hero-consultation-cta/g)||[]).length,1);
    assert.equal((block.match(/class="consultation-mark"/g)||[]).length,1);
    assert.match(block,/aria-hidden="true" focusable="false"/);
    assert.ok(block.indexOf('hero-consultation-cta')<block.indexOf('home-whatsapp-link'));
    assert.match(block,/href="\/(?:en\/)?on-gorusme\/"/);
    assert.match(block,/href="https:\/\/wa\.me\/905444181508"/);
    assert.match(block,/src="\/assets\/whatsapp-mark\.svg"/);
    assert.match(block,locale==='tr'?/Ücretsiz Ön Görüşme/:/Free Pre-Consultation/);
    assert.match(block,locale==='tr'?/WhatsApp’tan yaz/:/Chat on WhatsApp/);
    assert.equal((h.match(/class="hero-actions /g)||[]).length,1);
  }
});
test('hero CTA density styles have no clipping and meet accessible touch heights',()=>{
  const css=readFileSync(new URL('../../dist/site.css',import.meta.url),'utf8');
  assert.match(css,/\.hero-discover-link\s*\{/);
  assert.match(css,/\.hero-contact-actions\s*\{/);
  assert.match(css,/\.hero-contact-actions \.hero-consultation-cta\s*\{[^}]*min-height:\s*44px/s);
  assert.match(css,/\.hero-contact-actions \.home-whatsapp-link\s*\{\s*margin-top:\s*0/);
  assert.doesNotMatch(css.slice(css.indexOf('/* Hero CTAs: destination link')),/display:\s*none|max-height:\s*\d|overflow:\s*hidden/);
});
