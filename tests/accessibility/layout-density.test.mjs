import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css=readFileSync(new URL('../../dist/site.css',import.meta.url),'utf8');
const marker='Compact editorial layout · 2026-11-05';
const density=css.split(marker)[1]||'';

test('a single shared compact layer preserves brand colors and applies to both locales',()=>{
  assert.equal(css.split(marker).length-1,1);
  assert.match(css, /--paper: #f7f3e9/);
  assert.match(css, /--red: #bd2120/);
  assert.match(density,/\.section\s*\{\s*padding:\s*40px 0/);
  assert.match(density,/\.header-action\s*\{\s*min-height:\s*44px/);
  assert.match(density,/\.page-hero\s*\{\s*padding:\s*28px 0 24px/);
  assert.match(density,/\.footer\s*\{\s*padding:\s*30px 0 16px/);
  assert.doesNotMatch(density, /\bdisplay:\s*none\b|\bvisibility:\s*hidden\b|\bcontent-visibility:\s*hidden\b/);
});

test('compact cards and document sections do not depend on fixed-height truncation',()=>{
  assert.match(density,/\.school-card\s*\{\s*min-height:\s*248px/);
  assert.match(density,/\.detail-content section\s*\{\s*padding-bottom:\s*25px;\s*margin-bottom:\s*25px/);
  assert.match(density,/\.guide-steps\s*\{\s*margin-top:\s*18px/);
  assert.doesNotMatch(density, /\bline-clamp\s*:|\btext-overflow\s*:\s*ellipsis|\bmax-height\s*:\s*\d/);
});

test('mobile density preserves all key navigation and CTA touch targets',()=>{
  const mobile=density.split('@media (max-width: 760px) {')[1]||'';
  assert.ok(mobile);
  assert.match(mobile,/\.school-card\s*\{\s*min-height:\s*0;\s*padding:\s*16px/);
  assert.match(mobile,/\.home-hero h1\s*\{\s*font-size:\s*clamp\(2rem,\s*9\.5vw,\s*4rem\)/);
  assert.match(mobile,/\.country-bar a\s*\{\s*min-height:\s*51px/);
  assert.match(mobile,/\.subnav a\s*\{\s*min-height:\s*44px/);
  assert.match(mobile,/\.toc a\s*\{\s*min-height:\s*44px/);
  assert.match(mobile,/\.feature-band \.button,\s*\.cta-strip \.button\s*\{[^}]*min-height:\s*44px/);
  assert.doesNotMatch(mobile,/\bfont-size:\s*\d+(?:\.\d+)?px\b/);
});
