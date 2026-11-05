import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read = p => readFileSync(new URL('../../dist/'+p,import.meta.url),'utf8');
const script=read('site.js');
const phone='905444181508';

test('consultation gives direct contact alternatives without removing the working email form',()=>{
 for(const locale of ['tr','en']){
  const html=read((locale==='en'?'en/':'')+'on-gorusme/index.html');
  assert.match(html,new RegExp('href="https://wa\\.me/'+phone+'"'),locale+' WhatsApp');
  assert.match(html,/href="tel:\+905444181508"/);
  assert.match(html,/href="mailto:info@asyadaegitim\.com/);
  assert.match(html,/<form[^>]*id="consultation-form"[^>]*action="https:\/\/formsubmit\.co\/info@asyadaegitim\.com"/);
  assert.match(html,/id="consultation-data-note"/);
  assert.match(html,/id="form-status"[^>]*role="status"/);
  assert.doesNotMatch(html,/marketing_consent[^>]+required/);
  assert.match(html,/<a[^>]+href="https:\/\/wa\.me\/905444181508"[^>]*rel="noopener noreferrer"/);
 }
 const tr=read('on-gorusme/index.html'),en=read('en/on-gorusme/index.html');
 assert.match(tr,/>WhatsApp’tan yaz<\/a>/);
 assert.match(tr,/>Telefonla ara<\/span>/);
 assert.match(en,/>Chat on WhatsApp<\/a>/);
 assert.match(en,/>Call us<\/span>/);
 assert.match(tr,/<span class="contact-channel-detail">0544 418 15 08<\/span>/);
 assert.match(en,/<span class="contact-channel-detail">\+90 544 418 15 08<\/span>/);
 assert.match(tr,/<span class="contact-channel-detail">info@asyadaegitim\.com<\/span>/);
 assert.match(en,/<span class="contact-channel-detail">info@asyadaegitim\.com<\/span>/);
});

test('both homepages place the consultation action before the WhatsApp button',()=>{
 const tr=read('index.html'),en=read('en/index.html');
 for(const [html,locale] of [[tr,'tr'],[en,'en']]){
  const label=locale==='tr'?'Ücretsiz Ön Görüşme':'Free Pre-Consultation';
  const href=locale==='tr'?'/on-gorusme/':'/en/on-gorusme/';
  const consult=html.indexOf('class="button outline hero-consultation-cta" href="'+href+'"');
  const whatsapp=html.indexOf('class="home-whatsapp-link" href="https://wa.me/905444181508"');
  assert.ok(consult>0,locale+' consultation action must remain present');
  assert.ok(whatsapp>consult,locale+' WhatsApp must follow consultation');
  const block=html.slice(consult,whatsapp);
  assert.match(block,/class="consultation-mark"/);
  assert.ok(block.includes(label),locale+' consultation label');
  assert.match(html,/class="hero-discover-link" href="\\/(?:en\\/)?ulkeler\\/"/);
 }
});

function simulateForm(locale,search){
 const button={textContent:'Send',disabled:false};
 const status={textContent:'',hidden:true,dataset:{}};
 const listeners={};
 const form={
  addEventListener(event,callback){listeners[event]=callback},
  reportValidity(){return true},
  querySelector(s){return s==='button[type="submit"]'?button:s==='#form-status'?status:null},
  reset(){this.wasReset=true}
 };
 const doc={
  documentElement:{lang:locale},
  querySelectorAll(){return []},
  querySelector(s){return s==='#consultation-form'?form:null}
 };
 const host=locale==='tr'?'https://asyadaegitim.com':'https://educationinasia.com';
 const path=locale==='tr'?'/on-gorusme/':'/free-consultation/';
 const url=new URL(host+path+search);
 let sent=null;
 const context={
  document:doc,
  URL,URLSearchParams,
  location:{href:url.href,origin:url.origin,pathname:url.pathname,search:url.search,hash:url.hash},
  FormData:class {entries(){return [['name','Example Lead'],['email','example@example.invalid']] }},
  fetch:async(target,options)=>{
   assert.equal(target,'https://formsubmit.co/ajax/info@asyadaegitim.com');
   sent=JSON.parse(options.body);
   return {ok:true,json:async()=>({success:true})};
  },
  history:{replaceState(){}}
 };
 vm.runInNewContext(script,context);
 return {submit:()=>listeners.submit({preventDefault(){}}),form,status,getPayload:()=>sent};
}

test('source attribution sends only safe campaign keys, not arbitrary query parameters or identifiers',async()=>{
 const x=simulateForm('tr','?utm_source=instagram&utm_medium=organic&utm_campaign=asia_2027&utm_content=hero&email=private%40example.com&token=secret&gclid=potential-id');
 await x.submit();const body=x.getPayload();
 assert.equal(body._url,'https://asyadaegitim.com/on-gorusme/');
 assert.equal(body['Campaign source'],'instagram');
 assert.equal(body['Campaign medium'],'organic');
 assert.equal(body['Campaign name'],'asia_2027');
 assert.equal(body['Campaign content'],'hero');
 assert.equal(body['Site language'],'tr');
 const serialized=JSON.stringify(body);
 assert.doesNotMatch(serialized,/private%40example\.com|private@example\.com|token=secret|potential-id|gclid/);
 assert.equal(x.status.dataset.state,'success');
 assert.equal(x.form.wasReset,true);
});

test('invalid source labels are ignored and English lead locale is retained',async()=>{
 const x=simulateForm('en','?utm_source=https%3A%2F%2Fevil.example%2Fpath&utm_medium=organic%20social&utm_campaign=asia-2027&state=private');
 await x.submit();const body=x.getPayload();
 assert.equal(body._url,'https://educationinasia.com/free-consultation/');
 assert.equal(body['Site language'],'en');
 assert.equal(body['Campaign source'],undefined);
 assert.equal(body['Campaign medium'],'organic social');
 assert.equal(body['Campaign name'],'asia-2027');
 assert.doesNotMatch(JSON.stringify(body),/evil\.example|state=private/);
});
