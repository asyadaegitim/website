/**
 * Use white-background official Xi'an Jiaotong logo artwork in all 94
 * canonical static pages, including catalog and generated discovery cards.
 * Idempotent and runs after discovery has written its output.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS} from '../workers/shared/routes.mjs';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const original='src="/assets/university-logos/xian-jiaotong-university.png"';
const replacement='src="/assets/university-logos/xian-jiaotong-university-white.webp"';
let updated=0;
for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
  const file=join(root,locale==='en'?'en':'',trPath.slice(1),'index.html');
  const raw=readFileSync(file,'utf8'),out=raw.replaceAll(original,replacement);
  if(raw!==out){writeFileSync(file,out);updated++}
}
console.log('White-background Xi’an Jiaotong logo applied to '+updated+' bilingual pages; remaining legacy reverse logos use high-contrast white panels.');
