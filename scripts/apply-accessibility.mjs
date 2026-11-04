import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROUTE_PAIRS} from '../workers/shared/routes.mjs';
import {enrichAccessibilityHTML} from './accessibility-core.mjs';

const root=new URL('../dist/',import.meta.url).pathname;
for(const {trPath} of ROUTE_PAIRS){
 for(const locale of ['tr','en']){
  const path=join(root,locale==='en'?'en':'',trPath.slice(1),'index.html');
  const source=readFileSync(path,'utf8');
  const enriched=enrichAccessibilityHTML(source,locale);
  if(source!==enriched)writeFileSync(path,enriched);
 }
}
console.log('Added keyboard skip links and descriptive language names to '+ROUTE_PAIRS.length+' bilingual page pairs.');
