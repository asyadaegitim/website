import vm from 'node:vm';
import {readFileSync} from 'node:fs';

const script=readFileSync(new URL('../../dist/site.js',import.meta.url),'utf8');

export class Element {
 constructor(tag='div',{className='',textContent='',dataset={},options=[]}={}){
  this.tagName=tag.toUpperCase();this.dataset=dataset;this.textContent=textContent;this.value='';
  this.options=options;this.children=[];this.handlers={};this.attrs={};this.style={};
  this.parentElement=null;this.hidden=false;this.id='';
  this._classes=new Set(className.split(/\s+/).filter(Boolean));
  this.classList={
   contains:x=>this._classes.has(x),add:x=>this._classes.add(x),remove:x=>this._classes.delete(x),
   toggle:(x,force)=>{const now=force===undefined?!this._classes.has(x):Boolean(force);now?this._classes.add(x):this._classes.delete(x);return now}
  };
 }
 get className(){return [...this._classes].join(' ')}
 set className(s){this._classes=new Set(s.split(/\s+/).filter(Boolean))}
 get selectedIndex(){return this.options.findIndex(x=>x.value===this.value)}
 setAttribute(k,v){this.attrs[k]=String(v)}
 getAttribute(k){return this.attrs[k]??null}
 removeAttribute(k){delete this.attrs[k]}
 addEventListener(k,f){(this.handlers[k]??=[]).push(f)}
 emit(k,event={}){for(const fn of this.handlers[k]||[])fn({target:this,preventDefault(){this.prevented=true},...event})}
 append(...nodes){for(const n of nodes){this.children.push(n);n.parentElement=this}}
 insertBefore(node,ref){const i=this.children.indexOf(ref);this.children.splice(i<0?this.children.length:i,0,node);node.parentElement=this}
 after(node){this.afterNode=node;node.parentElement=this.parentElement}
 replaceChildren(...nodes){this.children=[];this.append(...nodes)}
 focus(){this.focused=true}
 closest(sel){let node=this;while(node){if(sel[0]==='.'&&node.classList.contains(sel.slice(1)))return node;node=node.parentElement;}return null}
 querySelector(s){if(s==='span:not(.flag)')return this.titleSpan??null;return null}
}

export function runSite({lang='tr',url='https://asyadaegitim.com/okullar/',navMode=true,filtersMode=false,scriptOverride=script}={}){
 const globals={},documentEvents={},nodes={};
 const document={
  documentElement:{lang},
  createElement:tag=>new Element(tag),
  addEventListener:(k,fn)=>(documentEvents[k]??=[]).push(fn),
  dispatch(k,event){(documentEvents[k]||[]).forEach(fn=>fn(event))},
  querySelector:s=>nodes[s]||null,
  querySelectorAll:s=>{
   if(s==='.nav-trigger[data-country]')return nodes.triggers||[];
   if(s==='.school-row')return nodes.rows||[];
   return [];
  }
 };
 if(navMode){
  const nav=new Element('nav',{className:'nav'}),menu=new Element('button',{className:'menu-toggle'});
  const countryNames=lang==='en'?['China','Japan']:['Çin','Japonya'];
  const triggers=countryNames.map((name,i)=>{
   const item=new Element('div',{className:'nav-item'});
   const a=new Element('a',{className:'nav-trigger',textContent:name+'⌄',dataset:{country:i?'japonya':'cin'}});
   a.titleSpan=new Element('span',{textContent:name});a.setAttribute('aria-expanded','false');
   const drop=new Element('div',{className:'dropdown'});
   item.append(a,drop);
   return {item,a,drop};
  });
  nodes['.menu-toggle']=menu;nodes.menu=menu;nodes['.nav']=nav;
  nodes.triggers=triggers.map(x=>x.a);nodes.menuItems=triggers;nav.append(...triggers.map(x=>x.item));
 }
 if(filtersMode){
  const search=new Element('input'),country=new Element('select',{options:[
   {value:'',text:'All'},{value:'cin',text:lang==='en'?'China':'Çin'},{value:'japonya',text:lang==='en'?'Japan':'Japonya'}
  ]}),theme=new Element('select',{options:[
   {value:'',text:'All'},{value:'Mühendislik',text:lang==='en'?'Engineering':'Mühendislik'},{value:'Bilim',text:lang==='en'?'Science':'Bilim'}
  ]});
  const result=new Element('p'),empty=new Element('div'),controls=new Element('div',{className:'list-controls'});
  country.value='';theme.value='';search.value='';
  nodes['#school-search']=search;nodes['#country-filter']=country;nodes['#theme-filter']=theme;
  nodes['#result-count']=result;nodes['#empty-state']=empty;nodes['.list-controls']=controls;
  nodes.rows=[
   new Element('a',{className:'school-row',dataset:{country:'cin',themes:'Mühendislik|Teknoloji',search:'tsinghua pekin çin'}}),
   new Element('a',{className:'school-row',dataset:{country:'cin',themes:'Bilim',search:'peking pekin çin'}}),
   new Element('a',{className:'school-row',dataset:{country:'japonya',themes:'Bilim',search:'tohoku sendai japonya'}})
  ];
 }
 const location={href:url,search:new URL(url).search,pathname:new URL(url).pathname,origin:new URL(url).origin};
 const pushed=[];
 const history={pushState(_state,_title,next){pushed.push(String(next));location.href=String(next);location.search=new URL(location.href).search},
  replaceState(_state,_title,next){location.href=String(next);location.search=new URL(location.href).search}};
 const listeners={};
 const context={document,location,history,URL,URLSearchParams,matchMedia:()=>({matches:true,addEventListener(){}}),
  addEventListener:(k,fn)=>(listeners[k]??=[]).push(fn),
  getComputedStyle:()=>({columnGap:'0'}),console};
 vm.runInNewContext(scriptOverride,context);
 return {document,nodes,location,history,pushed,emitWindow(k,e={}){for(const fn of listeners[k]||[])fn(e)}};
}
