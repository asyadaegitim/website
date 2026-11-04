import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import enWorker from '../../workers/educationinasia-en/worker.js';
import trWorker from '../../workers/website/worker.js';

globalThis.HTMLRewriter=class {
 on(selector,handler){if(selector==='a[href]')this.anchor=handler;return this}
 transform(response){
  const probe=globalThis.__navigationProbe;
  if(probe&&this.anchor){
   const attrs=new Map([['href',probe.href]]);
   this.anchor.element({getAttribute:name=>attrs.get(name),setAttribute:(name,value)=>attrs.set(name,value)});
   probe.result=attrs.get('href');
  }
  return response;
 }
};
function assets(){
 const seen=[];
 return {seen,ASSETS:{
  async fetch(input){const u=new URL(typeof input==='string'?input:input.url);seen.push(u);
   if(u.pathname==='/en-sitemap.xml') return new Response('<urlset><url><loc>https://educationinasia.com/</loc></url></urlset>',{headers:{'content-type':'application/xml'}});
   if(u.pathname==='/site.js') return new Response('console.log("site")',{headers:{'content-type':'application/javascript'}});
   if(u.pathname.startsWith('/en/')&&!u.pathname.includes('not-a-real')) return new Response('<html><head><title>Education in Asia</title></head><body>Test</body></html>',{headers:{'content-type':'text/html'}});
   return new Response('Not found',{status:404});
  }
 }};
}
test('English pages are sourced from local ASSETS, never a public upstream',async()=>{
 const env=assets();const oldFetch=globalThis.fetch;globalThis.fetch=()=>{throw new Error('Unexpected public network request')};
 try{
  for(const path of ['/','/destinations/china/','/universities/','/free-consultation/']){
   const r=await enWorker.fetch(new Request('https://educationinasia.com'+path),env);
   assert.equal(r.status,200,path);
  }
  assert.ok(env.seen.every(u=>u.hostname==='educationinasia.com'));
  assert.ok(env.seen.some(u=>u.pathname==='/en/ulkeler/cin/'));
 }finally{globalThis.fetch=oldFetch;}
});
test('English host serves correct sitemap, rejects false universities and redirects old paths',async()=>{
 const env=assets();
 const map=await enWorker.fetch(new Request('https://educationinasia.com/sitemap.xml'),env);
 assert.equal(map.status,200);assert.match(await map.text(),/https:\/\/educationinasia.com/);
 const miss=await enWorker.fetch(new Request('https://educationinasia.com/universities/not-a-real/'),env);
 assert.equal(miss.status,404);
 const redirect=await enWorker.fetch(new Request('https://educationinasia.com/ulkeler/cin/?ulke=cin'),env);
 assert.equal(redirect.status,301);assert.equal(redirect.headers.get('location'),'https://educationinasia.com/destinations/china/?country=china');
 const www=await enWorker.fetch(new Request('https://www.educationinasia.com/'),env);
 assert.equal(www.status,301);assert.equal(www.headers.get('location'),'https://educationinasia.com/');
});
test('Turkish /en legacy redirects only when route is known and maps filters',async()=>{
 const env=assets();env.EN_REDIRECTS_ENABLED='true';
 const ok=await trWorker.fetch(new Request('https://asyadaegitim.com/en/ulkeler/cin/dil-programlari/?ulke=cin&alan=M%C3%BChendislik'),env);
 assert.equal(ok.status,301);
 assert.equal(ok.headers.get('location'),'https://educationinasia.com/destinations/china/language-programs/?country=china&field=engineering');
 const missing=await trWorker.fetch(new Request('https://asyadaegitim.com/en/nonexistent/'),env);
 assert.equal(missing.status,404);
 const normal=await trWorker.fetch(new Request('https://asyadaegitim.com/site.css'),env);
 assert.equal(normal.status,404);
});

test('Turkish legacy URLs remain accessible while redirect gate is disabled',async()=>{
 const env=assets();const r=await trWorker.fetch(new Request('https://asyadaegitim.com/en/ulkeler/cin/'),env);
 assert.equal(r.status,200);
 assert.ok(env.seen.some(u=>u.pathname==='/en/ulkeler/cin/'));
});

test('legacy paths without trailing slash redirect in a single hop',async()=>{
 const env=assets();
 const r=await enWorker.fetch(new Request('https://educationinasia.com/ulkeler/cin?ulke=cin'),env);
 assert.equal(r.status,301);
 assert.equal(r.headers.get('location'),'https://educationinasia.com/destinations/china/?country=china');
});
test('English staging assets resolve through their own preview host',async()=>{
 const env=assets();
 const r=await enWorker.fetch(new Request('https://educationinasia-en-stage.example.workers.dev/destinations/china/'),env);
 assert.equal(r.status,200);
 assert.ok(env.seen.some(u=>u.hostname==='educationinasia-en-stage.example.workers.dev'&&u.pathname==='/en/ulkeler/cin/'));
});

test('English staging navigation links stay on the preview host',async()=>{
 const env=assets(),host='https://educationinasia-en-stage.example.workers.dev';
 const probe={href:'/ulkeler/cin/'};
 globalThis.__navigationProbe=probe;
 try{
  const r=await enWorker.fetch(new Request(host+'/destinations/china/'),env);
  assert.equal(r.status,200);
  assert.equal(probe.result,host+'/destinations/china/');
 }finally{delete globalThis.__navigationProbe}
});

test('English staging denies indexing while production keeps normal indexing rules',async()=>{
 const env=assets();
 const stageHost='https://educationinasia-en-stage.example.workers.dev';
 const stage=await enWorker.fetch(new Request(stageHost+'/destinations/china/'),env);
 assert.equal(stage.status,200);
 assert.equal(stage.headers.get('x-robots-tag'),'noindex, nofollow');
 const robots=await enWorker.fetch(new Request(stageHost+'/robots.txt'),env);
 assert.equal(robots.status,200);
 assert.match(await robots.text(),/User-agent: \*\nDisallow: \//);
 const production=await enWorker.fetch(new Request('https://educationinasia.com/destinations/china/'),env);
 assert.equal(production.status,200);
 assert.equal(production.headers.get('x-robots-tag'),null);
});

test('English production logo is the locked Brandstudio V9 vector, not a recreated image',async()=>{
 const data=readFileSync(new URL('../../dist/assets/education-in-asia-logo.svg',import.meta.url));
 const svg=data.toString('utf8'),sha=createHash('sha256').update(data).digest('hex');
 assert.equal(sha,'b3a70033fc37049730a24ca54e1fe5259e32fb40c255450206dd29e40b644dde');
 const meta=JSON.parse(svg.split('<metadata>')[1].split('</metadata>')[0]);
 assert.equal(meta.status,'APPROVED / CANONICAL');
 assert.equal(meta.version,'v9-approved-2026-11-04');
 assert.equal(meta.canonicalLockupId,'H-EN-02/light');
 assert.equal(meta.mainWeight,450);assert.equal(meta.taglineWeight,350);
 assert.equal(meta.metrics.inScale,1.1);assert.equal(meta.metrics.asiaScale,1.1);
 assert.equal((svg.match(/data-country-dot=/g)||[]).length,4);
 assert.match(svg,/data-canonical-logo-sha256="8f5d46f0302c4cc7e3765d3bfce9445f842dbd92f1e0f8fbe99f9f509c77e11a"/);
 assert.doesNotMatch(svg,/<(?:image|text)\b/);
 const env=assets();
 env.ASSETS.fetch=async input=>{const u=new URL(typeof input==='string'?input:input.url);env.seen.push(u);return u.pathname==='/assets/education-in-asia-logo.svg'?new Response(data,{headers:{'content-type':'image/svg+xml'}}):new Response('Not found',{status:404});};
 const response=await enWorker.fetch(new Request('https://educationinasia.com/assets/education-in-asia-logo.svg?v=20261104'),env);
 assert.equal(response.status,200);assert.equal(await response.text(),svg);
 assert.equal(env.seen.length,1);
});
test('English header/footer both reference official V9 SVG, no legacy embedded artwork',()=>{
 const worker=readFileSync(new URL('../../workers/educationinasia-en/worker.js',import.meta.url),'utf8');
 assert.match(worker,/const ENGLISH_LOGO_URL='\/assets\/education-in-asia-logo\.svg\?v=20261104'/);
 assert.match(worker,/\.on\('header img\.brand-logo',new BrandLogo\(\)\)/);
 assert.match(worker,/\.on\('footer img\.footer-logo',new BrandLogo\(\)\)/);
 assert.match(worker,/\.on\('footer a\.footer-logo-link',new BrandLink\(\)\)/);
 assert.doesNotMatch(worker,/const BRAND_SVG=/);
 assert.match(readFileSync(new URL('../../dist/assets/asya-logo.svg',import.meta.url),'utf8'),/Asya.da Eğitim/);
});
