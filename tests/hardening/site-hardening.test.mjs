import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import enWorker from '../../workers/educationinasia-en/worker.js';
import trWorker from '../../workers/website/worker.js';
const root=new URL('../../dist/',import.meta.url);
const read=name=>readFileSync(new URL(name,root),'utf8');
globalThis.HTMLRewriter ??= class {on(){return this} transform(response){return response}};
const mockAssets={fetch:async req=>{
 const path=new URL(req.url).pathname;
 if(path.startsWith('/en/'))return new Response('<!doctype html><html lang="en"><head><title>Page</title></head><body>Test</body></html>',{headers:{'content-type':'text/html'}});
 return new Response('Not found',{status:404});
}};
const SECURITY_KEYS=['x-content-type-options','referrer-policy','permissions-policy','x-frame-options','strict-transport-security','content-security-policy-report-only'];
test('English Worker applies safe security headers to page and 404 without breaking noindex',async()=>{
 for(const [url,expectNoIndex] of [['https://educationinasia.com/destinations/china/',false],['https://educationinasia-en-stage.example.workers.dev/destinations/china/',true],['https://educationinasia.com/universities/not-found/',false]]){
  const response=await enWorker.fetch(new Request(url),{ASSETS:mockAssets});
  for(const key of SECURITY_KEYS)assert.ok(response.headers.get(key),url+' is missing '+key);
  assert.equal(response.headers.get('x-content-type-options'),'nosniff');
  assert.equal(response.headers.get('x-frame-options'),'DENY');
  assert.match(response.headers.get('strict-transport-security'),/^max-age=86400$/);
  assert.doesNotMatch(response.headers.get('strict-transport-security'),/includesubdomains|preload/i);
  assert.match(response.headers.get('content-security-policy-report-only'),/connect-src [^;]*https:\/\/formsubmit\.co/);
  assert.equal(response.headers.has('content-security-policy'),false,'CSP must not be enforced before report-only validation');
  assert.equal(response.headers.get('x-robots-tag')==='noindex, nofollow',expectNoIndex);
 }
});
test('TR Worker redirects get the same headers as static HTML',async()=>{
 const response=await trWorker.fetch(new Request('https://asyadaegitim.com/en/ulkeler/cin/'),{ASSETS:mockAssets,EN_REDIRECTS_ENABLED:'true'});
 assert.equal(response.status,301);
 for(const key of SECURITY_KEYS)assert.ok(response.headers.get(key),'TR redirect lacks '+key);
 assert.equal(response.headers.get('location'),'https://educationinasia.com/destinations/china/');
});
test('Workers Static Assets _headers ships equivalent safe defaults for every TR and EN page',()=>{
 const file=read('_headers');
 assert.match(file,/^\/\*\s*$/m);
 for(const key of SECURITY_KEYS){
   assert.ok(file.toLowerCase().includes(key+':'),key+' missing from _headers');
 }
 assert.doesNotMatch(file,/includeSubDomains|preload/i);
 assert.doesNotMatch(file,/^  content-security-policy:/mi);
});
test('both consultation pages clearly disclose FormSubmit before submit without adding compulsory marketing consent',()=>{
 const tr=read('on-gorusme/index.html');
 const en=read('en/on-gorusme/index.html');
 const check=(html,needle)=>{
  assert.ok(html.includes(needle),'missing concise disclosure: '+needle);
  const p=html.indexOf('id="consultation-data-note"'),submit=html.indexOf('type="submit"');
  assert.ok(p>0&&submit>p,'disclosure should precede submit');
  assert.match(html,/id="consultation-form"[^>]*aria-describedby="consultation-data-note"/);
  assert.doesNotMatch(html,/name="marketing_consent"[^>]*required/);
 };
 check(tr,'FormSubmit');
 check(en,'FormSubmit');
 assert.match(tr,/Pazarlama izni/);
 assert.match(en,/marketing consent/);
});
test('mobile interactive styles have accessible language and footer tap areas',()=>{
 const css=read('site.css');
 assert.match(css,/\.lang-switch a\s*\{[^}]*min-width:\s*32px[^}]*min-height:\s*44px/s);
 assert.match(css,/\.footer-nav-links a\s*\{[^}]*min-height:\s*44px/s);
 assert.match(css,/\.breadcrumb a\s*\{[^}]*min-height:\s*28px/s);
});
