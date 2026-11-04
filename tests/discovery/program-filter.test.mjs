import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const read=name=>readFileSync(new URL('../../dist/'+name,import.meta.url),'utf8');
test('each of six discovery program cards has a verifiable subject and country metadata',()=>{
 for(const loc of ['tr','en']){
  const html=read((loc==='en'?'en/':'')+'programlar/index.html');
  const m=[...html.matchAll(/<article class="discovery-program-card" data-field="([^"]+)" data-countries="([^"]+)"/g)];
  assert.equal(m.length,6,loc+' six subject groups');
  const schoolLinks=[...html.matchAll(/<a class="discovery-program-school" data-country="([^"]+)" href="([^"]+)"/g)];
  assert.ok(schoolLinks.length>=18,'all suggested schools should have country identifiers');
  for(const [,c] of schoolLinks)assert.ok(['cin','japonya','guney-kore','singapur','hong-kong'].includes(c));
  assert.equal((html.match(/class="text-link discovery-all-field"/g)||[]).length,6);
 }
});

function simulate(lang){
 const page=lang==='tr'?'https://asyadaegitim.com/programlar/':'https://educationinasia.com/programs/';
 const selectors=new Map(),callbacks=new Map();
 const pc={
   value:'',options:[{value:''},{value:'cin'},{value:'japonya'}],
   addEventListener(name,fn){callbacks.set(name,fn)},
   dispatchEvent(event){callbacks.get(event.type)?.(event)}
 };
 const cards=['Mühendislik','Sağlık'].map(field=>{
  const links=[
   {dataset:{country:'cin'},hidden:false},
   {dataset:{country:'japonya'},hidden:false}
  ];
  const all={href:(lang==='tr'?'https://asyadaegitim.com/okullar/?alan=':'https://educationinasia.com/universities/?field=')+(lang==='tr'?'M%C3%BChendislik':'engineering'),dataset:{}};
  return {
   dataset:{field,countries:'cin,japonya'},hidden:false,
   querySelectorAll:sel=>sel==='.discovery-program-school'?links:[],
   querySelector:sel=>sel==='a.discovery-all-field'?all:null,
   links,all
  };
 });
 const existing=[{dataset:{countries:'cin,japonya'},hidden:false}];
 const document={
  documentElement:{lang},
  querySelector:sel=>sel==='#program-country'?pc:null,
  querySelectorAll:sel=>{
   if(sel==='.program-card')return existing;
   if(sel==='.discovery-program-card')return cards;
   return [];
  },
  addEventListener(){}
 };
 const location={href:page,search:'',origin:new URL(page).origin,pathname:new URL(page).pathname};
 const history={replaceState(_s,_t,url){location.href=String(url);location.search=new URL(location.href).search}};
 const context={document,location,history,URL,URLSearchParams,Event:class Event{constructor(type){this.type=type}},matchMedia:()=>({matches:false}),console};
 vm.runInNewContext(read('site.js'),context);
 return{pc,cards,location};
}
test('selected country hides unrelated recommendations and scopes field listing links; reset restores',()=>{
 for(const lang of ['tr','en']){
  const app=simulate(lang);
  app.pc.value='japonya';app.pc.dispatchEvent({type:'change'});
  const [card]=app.cards;
  assert.equal(card.links[0].hidden,true,lang+' China school hidden for Japan');
  assert.equal(card.links[1].hidden,false);
  const u=new URL(card.all.href);
  assert.equal(u.searchParams.get(lang==='tr'?'ulke':'country'),lang==='tr'?'japonya':'japan');
  assert.ok(u.searchParams.has(lang==='tr'?'alan':'field'));
  app.pc.value='';app.pc.dispatchEvent({type:'change'});
  assert.equal(card.links[0].hidden,false);
  assert.equal(card.links[1].hidden,false);
  assert.equal(new URL(card.all.href).searchParams.has(lang==='tr'?'ulke':'country'),false);
 }
});
