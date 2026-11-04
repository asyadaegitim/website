/**
 * Post-i18n static discovery pass. Runs after generate-en.mjs in npm run build.
 * The TR catalog is authoritative; both locales receive route-safe markup.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {ROUTE_PAIRS} from '../workers/shared/routes.mjs';
import {catalogFromHTML,enrichDiscoveryPage} from './discovery-core.mjs';

const root=new URL('../dist/',import.meta.url).pathname;
const source=readFileSync(join(root,'okullar','index.html'),'utf8');
const catalog=catalogFromHTML(source);
for(const {trPath} of ROUTE_PAIRS){
 for(const locale of ['tr','en']){
  const file=join(root,locale==='en'?'en':'',trPath.slice(1),'index.html');
  const html=readFileSync(file,'utf8');
  const enriched=enrichDiscoveryPage(html,trPath,locale,catalog);
  writeFileSync(file,enriched);
 }
}
console.log('Built bilingual breadcrumb trails and catalog-backed discovery paths for '+ROUTE_PAIRS.length+' page pairs.');
