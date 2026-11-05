import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, statSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS} from '../../workers/shared/routes.mjs';
const root=fileURLToPath(new URL('../../dist/',import.meta.url));
const data=JSON.parse(readFileSync(new URL('../../content/university-gallery-media.json',import.meta.url),'utf8'));
const slugs=['tsinghua-university','peking-university','fudan-university'];
const read=(path,locale)=>readFileSync(join(root,locale==='en'?'en':'',path.slice(1),'index.html'),'utf8');

test('three licensed images and accessible controls exist on six China profile galleries',()=>{
 assert.deepEqual(Object.keys(data.universities).sort(),slugs.slice().sort());
 for(const slug of slugs){
  const group=data.universities[slug];
  assert.equal(group.images.length,3);
  for(const p of group.images){
   assert.match(p.source,/^https:\/\/commons\.wikimedia\.org\/wiki\/File:/);
   assert.match(p.licenseUrl,/^https:\/\/creativecommons\.org\//);
   assert.ok(p.tr&&p.en&&p.artist);
   assert.ok(statSync(join(root,'assets','campus-galleries',p.file)).size>10_000);
   assert.ok(statSync(join(root,'assets','campus-galleries',p.file)).size<450_000);
  }
  for(const locale of ['tr','en']){
   const html=read('/universiteler/'+slug+'/',locale);
   assert.equal((html.match(/data-campus-gallery\b/g)||[]).length,1);
   assert.equal((html.match(/data-gallery-item\b/g)||[]).length,3);
   assert.equal((html.match(/data-gallery-prev\b/g)||[]).length,1);
   assert.equal((html.match(/data-gallery-next\b/g)||[]).length,1);
   assert.equal((html.match(/data-gallery-enlarge\b/g)||[]).length,1);
   assert.equal((html.match(/class="campus-gallery-dialog"/g)||[]).length,1);
   assert.match(html,/<button class="campus-gallery-thumb"[^>]+aria-pressed="true"/);
   assert.match(html,/data-gallery-license/);
   assert.match(html,/<!-- campus-gallery:end -->/);
   for(const p of group.images)assert.match(html,new RegExp(p.file.replace('.','\\.') ));
  }
 }
});
test('other 88 pages do not receive unrelated galleries and keep navigation',()=>{
 assert.equal(ROUTE_PAIRS.length,47);
 for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
  const html=read(trPath,locale);
  const should=slugs.some(s=>trPath==='/universiteler/'+s+'/');
  assert.equal((html.match(/data-campus-gallery\b/g)||[]).length,should?1:0,locale+' '+trPath);
  if(trPath.startsWith('/universiteler/')){
   assert.match(html,/<nav class="toc"/);
   for(const id of ['genel-bakis','akademik','kampus','basvuru','kaynak']){
    assert.ok(html.includes('href="#'+id+'"'));
    assert.ok(html.includes('id="'+id+'"'));
   }
  }
 }
});
test('scrollspy uses aria-current and gallery respects reduced motion and visibility',()=>{
 const js=readFileSync(join(root,'site.js'),'utf8');
 const css=readFileSync(join(root,'site.css'),'utf8');
 assert.ok(js.includes("item.link.setAttribute('aria-current','location')"));
 assert.match(js,/requestAnimationFrame/);
 assert.match(js,/data-gallery-enlarge/);
 assert.match(js,/IntersectionObserver/);
 assert.match(js,/visibilitychange/);
 assert.match(js,/prefers-reduced-motion/);
 assert.match(css,/\.detail-layout \.toc a\.is-active/);
 assert.match(css,/\.campus-gallery-dialog::backdrop/);
});
