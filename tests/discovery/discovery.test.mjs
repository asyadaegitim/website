import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {ROUTE_PAIRS, COUNTRIES, UNIVERSITIES, FIELDS} from '../../workers/shared/routes.mjs';

const root=new URL('../../dist/',import.meta.url);
const file=(trPath,locale='tr')=>new URL((locale==='en'?'en/':'')+trPath.slice(1)+'index.html',root);
const html=(trPath,locale='tr')=>readFileSync(file(trPath,locale),'utf8');
const unescape=s=>s.replaceAll('&amp;','&');
const anchors=s=>[...s.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>/g)].map(m=>unescape(m[1]));
const routePaths=new Set(ROUTE_PAIRS.flatMap(x=>[x.trPath,x.enPath]));
const validPath=(href,locale)=>{
 const u=new URL(href,'https://'+(locale==='tr'?'asyadaegitim.com':'educationinasia.com'));
 return routePaths.has(u.pathname)&&!u.hash;
};

test('all 46 non-home page pairs have accessible, route-valid breadcrumbs and BreadcrumbList structured data',()=>{
 for(const {trPath,enPath} of ROUTE_PAIRS){
  if(trPath==='/')continue;
  for(const locale of ['tr','en']){
   const source=html(trPath,locale);
   const b=source.match(/<nav class="breadcrumb" aria-label="[^"]+">([\s\S]*?)<\/nav>/);
   assert.ok(b,locale+' '+trPath+' missing semantic breadcrumb');
   assert.match(b[1],/<span aria-current="page">[^<]+<\/span>/);
   assert.match(b[1],new RegExp('<a href="/">'+(locale==='tr'?'Ana sayfa':'Home')+'<\\/a>'));
   const links=anchors(b[1]);
   for(const link of links)assert.equal(validPath(link,locale),true,'invalid breadcrumb '+locale+trPath+' '+link);
   assert.equal(links.includes(locale==='tr'?trPath:enPath),false,'current page must not be linked');
   const schema=source.match(/<script type="application\/ld\+json" data-discovery-breadcrumb>([\s\S]+?)<\/script>/);
   assert.ok(schema,locale+trPath+' lacks BreadcrumbList');
   const obj=JSON.parse(schema[1]);
   assert.equal(obj['@type'],'BreadcrumbList');
   assert.equal(obj.itemListElement.at(-1).item,locale==='tr'?'https://asyadaegitim.com'+trPath:'https://educationinasia.com'+enPath);
   assert.equal(obj.itemListElement.length,links.length+1);
  }
 }
});

test('country overview pages expose concise, real local university routes and filtered complete list in both languages',()=>{
 const validNames=new Set(UNIVERSITIES);
 for(const [tr,en] of Object.entries(COUNTRIES)){
  for(const locale of ['tr','en']){
   const source=html('/ulkeler/'+tr+'/',locale);
   const box=source.match(/<section class="section shell discovery-country"[\s\S]*?<\/section>/);
   assert.ok(box,locale+' '+tr+' missing country discovery');
   const hrefs=anchors(box[0]);
   assert.ok(hrefs.length>=4&&hrefs.length<=5,'country quick links must be compact');
   const more=locale==='tr'?'/okullar/?ulke='+tr:'/universities/?country='+en;
   assert.ok(hrefs.includes(more),locale+' '+tr+' missing full filtered catalog');
   const unis=hrefs.filter(s=>s.includes('/universiteler/')||s.includes('/universities/'));
   assert.ok(unis.length>=2&&unis.length<=3,locale+' '+tr+' expected 2–3 universities');
   for(const link of unis){
    const slug=link.split('/').filter(Boolean).at(-1);
    assert.ok(validNames.has(slug),'invented university: '+slug);
    assert.ok(link.startsWith(locale==='tr'?'/universiteler/':'/universities/'));
   }
  }
 }
});

test('all 27 university profiles show same-country alternatives without linking to themselves',()=>{
 for(const slug of UNIVERSITIES){
  for(const locale of ['tr','en']){
   const source=html('/universiteler/'+slug+'/',locale);
   const box=source.match(/<section class="section shell discovery-university"[\s\S]*?<\/section>/);
   assert.ok(box,locale+' '+slug+' missing related content');
   const hrefs=anchors(box[0]),self=(locale==='tr'?'/universiteler/':'/universities/')+slug+'/';
   assert.equal(hrefs.includes(self),false,locale+' '+slug+' contains self recommendation');
   const same=hrefs.filter(h=>h.startsWith(locale==='tr'?'/universiteler/':'/universities/'));
   assert.ok(same.length>=2&&same.length<=3,locale+' '+slug+' insufficient same-country neighbors');
   assert.ok(hrefs.some(h=>h.includes(locale==='tr'?'/ulkeler/':'/destinations/')),'country guide missing');
   assert.ok(hrefs.some(h=>h.includes(locale==='tr'?'/dil-programlari/':'/language-programs/')),'language options missing');
   assert.ok(hrefs.some(h=>h.includes(locale==='tr'?'/yaz-okullari/':'/summer-schools/')),'summer options missing');
   for(const link of hrefs)assert.ok(validPath(link,locale),'invalid related link '+locale+' '+slug+' '+link);
  }
 }
});

test('program discovery lists existing university profiles and six filtered university subjects',()=>{
 for(const locale of ['tr','en']){
  const source=html('/programlar/',locale),box=source.match(/<section class="section shell discovery-programs"[\s\S]*?<\/section>/);
  assert.ok(box,locale+' lacks program-to-university explorer');
  const links=anchors(box[0]);
  const school=links.filter(x=>x.startsWith(locale==='tr'?'/universiteler/':'/universities/'));
  assert.ok(school.length>=12,'too few university recommendations');
  for(const link of school){
   assert.ok(UNIVERSITIES.includes(link.split('/').filter(Boolean).at(-1)),'unknown university '+link);
  }
  const filtered=links.filter(x=>x.startsWith(locale==='tr'?'/okullar/?alan=':'/universities/?field='));
  assert.equal(filtered.length,6,'six fields must have filtered destination');
  for(const link of links)assert.ok(validPath(link,locale),'bad program link '+locale+' '+link);
 }
});

test('catalog references use only categories appearing in existing school rows, never invent degree offerings',()=>{
 const c=html('/okullar/');
 const school=[...c.matchAll(/<a class="school-row" href="\/universiteler\/([^/]+)\/" data-country="([^"]+)" data-themes="([^"]+)"/g)];
 assert.equal(school.length,UNIVERSITIES.length,'catalog inventory mismatch');
 const catalog=new Map(school.map(m=>[m[1],{country:m[2],themes:m[3].split('|')}]));
 for(const slug of UNIVERSITIES){
  for(const locale of ['tr','en']){
   const s=html('/universiteler/'+slug+'/',locale);
   const block=s.match(/<section class="section shell discovery-university"[\s\S]*?<\/section>/)?.[0]||'';
   const country=catalog.get(slug).country;
   const peers=anchors(block).filter(a=>a.startsWith(locale==='tr'?'/universiteler/':'/universities/'));
   for(const peer of peers)assert.equal(catalog.get(peer.split('/').filter(Boolean).at(-1))?.country,country);
  }
 }
});

test('discovery markup remains inside main, preserves existing forms and SEO metadata',()=>{
 for(const {trPath,enPath} of ROUTE_PAIRS){
  for(const locale of ['tr','en']){
   const source=html(trPath,locale);
   assert.equal((source.match(/<link rel="canonical"/g)||[]).length,1,locale+trPath+' canonical duplicated');
   assert.equal((source.match(/<nav class="breadcrumb"/g)||[]).length,trPath==='/'?0:1);
   assert.equal((source.match(/data-discovery-breadcrumb/g)||[]).length,trPath==='/'?0:1);
   assert.equal((source.match(/<!-- discovery-section:start -->/g)||[]).length,
     trPath.startsWith('/universiteler/')||trPath.startsWith('/ulkeler/')&&trPath.split('/').filter(Boolean).length===2||trPath==='/programlar/'?1:0,
     locale+trPath+' unexpected discovery section count');
   assert.equal((source.match(/<!-- discovery-section:end -->/g)||[]).length,(source.match(/<!-- discovery-section:start -->/g)||[]).length);
   if(trPath==='/on-gorusme/'){
    assert.match(source,/id="consultation-form"/);
    assert.match(source,/action="https:\/\/formsubmit\.co\/info@asyadaegitim\.com"/);
    assert.match(source,/id="consultation-data-note"/);
   }
  }
 }
});
