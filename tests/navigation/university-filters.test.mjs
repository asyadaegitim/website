import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runSite} from './dom-fixture.mjs';

test('TR country and field presets match exact rows and give accessible results',()=>{
 const app=runSite({navMode:false,filtersMode:true,url:'https://asyadaegitim.com/okullar/?ulke=cin&alan=M%C3%BChendislik'});
 const {nodes}=app;
 assert.equal(nodes['#country-filter'].value,'cin');
 assert.equal(nodes['#theme-filter'].value,'Mühendislik');
 assert.deepEqual(nodes.rows.map(r=>r.hidden),[false,true,true]);
 assert.equal(nodes['#result-count'].getAttribute('aria-live'),'polite');
 assert.match(nodes['#result-count'].textContent,/1 okul/);
 assert.equal(app.pushed.length,0,'initial state must not pollute history');
});
test('EN native canonical country and field links are read without Worker string replacement',()=>{
 const app=runSite({navMode:false,filtersMode:true,lang:'en',url:'https://educationinasia.com/universities/?country=china&field=engineering'});
 assert.equal(app.nodes['#country-filter'].value,'cin');
 assert.equal(app.nodes['#theme-filter'].value,'Mühendislik');
 assert.deepEqual(app.nodes.rows.map(r=>r.hidden),[false,true,true]);
});
test('changing filters pushes canonical URLs, and browser Back restores controls and results',()=>{
 const app=runSite({navMode:false,filtersMode:true,lang:'en',url:'https://educationinasia.com/universities/?utm_source=instagram'});
 const country=app.nodes['#country-filter'],theme=app.nodes['#theme-filter'];
 country.value='cin';country.emit('change');
 assert.match(app.location.href,/country=china/);
 assert.equal(app.pushed.length,1);
 const firstUrl=app.location.href;
 theme.value='Bilim';theme.emit('change');
 assert.match(app.location.href,/field=science/);
 assert.equal(app.pushed.length,2);
 app.location.href=firstUrl;app.location.search=new URL(firstUrl).search;app.emitWindow('popstate');
 assert.equal(country.value,'cin');assert.equal(theme.value,'');
 assert.deepEqual(app.nodes.rows.map(r=>r.hidden),[false,false,true]);
 assert.equal(app.pushed.length,2,'popstate must not push new history');
});
test('clearing one active chip preserves other filters and clearing all preserves UTM metadata',()=>{
 const app=runSite({navMode:false,filtersMode:true,url:'https://asyadaegitim.com/okullar/?ulke=cin&alan=M%C3%BChendislik&utm_source=organic'});
 const bar=app.nodes['.list-controls'].afterNode;
 assert.ok(bar,'missing active filter toolbar');
 const buttons=()=>bar.children.flatMap(el=>el.children);
 const countryChip=buttons().find(x=>x.dataset.filter==='country');
 assert.ok(countryChip);
 countryChip.emit('click');
 assert.equal(app.nodes['#country-filter'].value,'');
 assert.equal(app.nodes['#theme-filter'].value,'Mühendislik');
 assert.match(app.location.search,/alan=M%C3%BChendislik/);
 const reset=buttons().find(x=>x.classList.contains('filters-reset'));
 assert.ok(reset);reset.emit('click');
 assert.equal(app.nodes['#theme-filter'].value,'');
 assert.equal(app.nodes['#school-search'].value,'');
 assert.match(app.location.search,/utm_source=organic/);
 assert.doesNotMatch(app.location.search,/ulke=|alan=/);
});
test('free search remains out of URL and no matches show an accessible empty state',()=>{
 const app=runSite({navMode:false,filtersMode:true,url:'https://asyadaegitim.com/okullar/'});
 const search=app.nodes['#school-search'];search.value='secret@example.com';search.emit('input');
 assert.equal(app.pushed.length,0);
 assert.doesNotMatch(app.location.href,/secret%40|secret@/);
 assert.equal(app.nodes['#empty-state'].style.display,'block');
 const bar=app.nodes['.list-controls'].afterNode;
 const clear=bar.children.flatMap(x=>x.children).find(x=>x.classList.contains('search-clear'));
 assert.ok(clear);clear.emit('click');
 assert.equal(search.value,'');
 assert.equal(app.nodes['#empty-state'].style.display,'none');
});
test('existing EN field and country language switch mapping remains intact',()=>{
 const js=readFileSync(new URL('../../dist/site.js',import.meta.url),'utf8');
 assert.match(js,/LANG_COUNTRIES=\{cin:'china'/);
 assert.match(js,/LANG_FIELDS=\{[^}]*'Mühendislik':'engineering'/);
});

test('English Worker patched site.js preserves canonical filter values and Back navigation',async()=>{
 const {default:enWorker}=await import('../../workers/educationinasia-en/worker.js');
 const js=readFileSync(new URL('../../dist/site.js',import.meta.url),'utf8');
 const env={ASSETS:{fetch:async()=>new Response(js,{headers:{'content-type':'application/javascript'}})}};
 const response=await enWorker.fetch(new Request('https://educationinasia.com/site.js'),env);
 assert.equal(response.status,200);
 const patched=await response.text();
 const app=runSite({navMode:false,filtersMode:true,lang:'en',url:'https://educationinasia.com/universities/?country=china&field=engineering',scriptOverride:patched});
 assert.equal(app.nodes['#country-filter'].value,'cin');
 assert.equal(app.nodes['#theme-filter'].value,'Mühendislik');
 const theme=app.nodes['#theme-filter'];theme.value='Bilim';theme.emit('change');
 assert.match(app.location.search,/field=science/);
 assert.doesNotMatch(app.location.search,/alan=/);
});
