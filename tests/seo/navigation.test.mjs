import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(new URL('../../dist/site.js',import.meta.url),'utf8');
function simulate(destination,search,language){
 const anchor={href:destination,lang:language||'',addEventListener(_event,fn){this.click=fn}};
 const doc={
  documentElement:{lang:'tr'},
  querySelectorAll(selector){return selector==='.lang-switch a'?[anchor]:[]},
  querySelector(){return null}
 };
 const location={search,hash:'#unknown',href:'https://asyadaegitim.com/okullar/'+search};
 const ctx={document:doc,location,URL,URLSearchParams,matchMedia:()=>({matches:false}),history:{replaceState(){}}};
 vm.runInNewContext(script,ctx);
 anchor.click();
 return new URL(anchor.href);
}
test('Turkish country and field filters switch to English names',()=>{
 const u=simulate('https://educationinasia.com/universities/','?ulke=cin&alan=M%C3%BChendislik&utm_source=instagram&redirect=evil');
 assert.equal(u.origin,'https://educationinasia.com');assert.equal(u.searchParams.get('country'),'china');
 assert.equal(u.searchParams.get('field'),'engineering');
 assert.equal(u.searchParams.get('utm_source'),'instagram');
 assert.equal(u.searchParams.has('ulke'),false);assert.equal(u.searchParams.has('redirect'),false);
 assert.equal(u.hash,'');
});
test('English filter switches back to the correct Turkish key/value',()=>{
 const u=simulate('https://asyadaegitim.com/okullar/','?country=japan&field=science');
 assert.equal(u.searchParams.get('ulke'),'japonya');assert.equal(u.searchParams.get('alan'),'Bilim');
 assert.equal(u.searchParams.has('country'),false);
});

test('language switch to an English staging hostname preserves English filter keys',()=>{
 const u=simulate('https://educationinasia-en-stage.example.workers.dev/universities/','?ulke=cin&alan=M%C3%BChendislik','en');
 assert.equal(u.searchParams.get('country'),'china');
 assert.equal(u.searchParams.get('field'),'engineering');
 assert.equal(u.searchParams.has('ulke'),false);
});
