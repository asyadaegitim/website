import {test} from 'node:test';
import assert from 'node:assert/strict';
import enWorker from '../../workers/educationinasia-en/worker.js';
import trWorker from '../../workers/website/worker.js';

globalThis.HTMLRewriter=class {
 on(){return this}
 transform(response){return response}
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
