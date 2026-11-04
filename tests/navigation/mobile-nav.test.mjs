import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runSite} from './dom-fixture.mjs';

test('country links remain navigable while independent submenu toggles are accessible',()=>{
 const app=runSite({navMode:true,filtersMode:false,lang:'tr'}),items=app.nodes.menuItems;
 for(const {item,a,drop} of items){
  assert.equal(a.handlers.click?.length??0,0,'country link must not be intercepted');
  const button=item.children.find(x=>x.classList.contains('nav-expand'));
  assert.ok(button,'missing separate submenu button');
  assert.equal(button.tagName,'BUTTON');
  assert.equal(button.getAttribute('aria-expanded'),'false');
  assert.equal(button.getAttribute('aria-controls'),drop.id);
  assert.match(button.getAttribute('aria-label'),/alt menüsünü aç/);
  assert.equal(a.getAttribute('aria-expanded'),null,'anchor should not pretend to be a toggle');
 }
});
test('opening another submenu closes the previous one; Escape closes menu and restores focus',()=>{
 const app=runSite({navMode:true,filtersMode:false});
 const {menuItems,menu}=app.nodes;
 menu.emit('click');
 assert.equal(menu.getAttribute('aria-expanded'),'true');
 const buttons=menuItems.map(x=>x.item.children.find(el=>el.classList.contains('nav-expand')));
 buttons[0].emit('click');
 assert.equal(menuItems[0].item.classList.contains('open'),true);
 buttons[1].emit('click');
 assert.equal(menuItems[0].item.classList.contains('open'),false);
 assert.equal(buttons[0].getAttribute('aria-expanded'),'false');
 assert.equal(menuItems[1].item.classList.contains('open'),true);
 app.document.dispatch('keydown',{key:'Escape'});
 assert.equal(menu.getAttribute('aria-expanded'),'false');
 assert.equal(menuItems[1].item.classList.contains('open'),false);
 assert.equal(menu.focused,true);
});
test('English submenu accessible names are English; closing menu collapses children',()=>{
 const app=runSite({navMode:true,filtersMode:false,lang:'en'}),{menuItems,menu}=app.nodes;
 const button=menuItems[0].item.children.find(el=>el.classList.contains('nav-expand'));
 assert.match(button.getAttribute('aria-label'),/Open China submenu/);
 menu.emit('click');button.emit('click');menu.emit('click');
 assert.equal(button.getAttribute('aria-expanded'),'false');
});
test('mobile split control has 44px target and does not alter 980px desktop navigation',()=>{
 const css=readFileSync(new URL('../../dist/site.css',import.meta.url),'utf8');
 assert.match(css,/\.nav-expand[^{]*\{[^}]*min-width:\s*44px[^}]*min-height:\s*44px/s);
 assert.match(css,/@media\s*\(max-width:\s*1140px\)[\s\S]*?\.nav-expand/s);
});

test('clicking outside the header closes mobile navigation without navigating',()=>{
 const app=runSite({navMode:true,filtersMode:false});
 const menu=app.nodes.menu;
 menu.emit('click');
 assert.equal(menu.getAttribute('aria-expanded'),'true');
 app.document.dispatch('click',{target:{closest:()=>null}});
 assert.equal(menu.getAttribute('aria-expanded'),'false');
});

test('tablet width uses the compact navigation before the language selector overflows',()=>{
 const css=readFileSync(new URL('../../dist/site.css',import.meta.url),'utf8');
 const js=readFileSync(new URL('../../dist/site.js',import.meta.url),'utf8');
 assert.match(css,/@media\s*\(max-width:\s*1140px\)/);
 assert.match(js,/matchMedia\('\(max-width: 1140px\)'\)/);
});
