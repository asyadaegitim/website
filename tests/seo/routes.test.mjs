import { test } from 'node:test';
import assert from 'node:assert/strict';
import {trToEnPath,enToTrPath,translateQuery,TR_HOST,EN_HOST,ROUTE_PAIRS} from '../../workers/shared/routes.mjs';

test('the 47 known pages map uniquely between both domains',()=>{
 assert.equal(ROUTE_PAIRS.length,47);
 assert.equal(new Set(ROUTE_PAIRS.map(x=>x.trPath)).size,47);
 assert.equal(new Set(ROUTE_PAIRS.map(x=>x.enPath)).size,47);
 for(const {trPath,enPath} of ROUTE_PAIRS) {
  assert.equal(trToEnPath(trPath),enPath);
  assert.equal(enToTrPath(enPath),trPath);
 }
 assert.equal(TR_HOST,'https://asyadaegitim.com');
 assert.equal(EN_HOST,'https://educationinasia.com');
});
test('canonical page examples are translated correctly',()=>{
 for(const [tr,en] of [
 ['/','/'],['/ulkeler/','/destinations/'],['/ulkeler/cin/','/destinations/china/'],
 ['/ulkeler/guney-kore/dil-programlari/','/destinations/south-korea/language-programs/'],
 ['/ulkeler/japonya/yaz-okullari/','/destinations/japan/summer-schools/'],
 ['/okullar/','/universities/'],['/on-gorusme/','/free-consultation/'],
 ['/programlar/','/programs/'],['/universiteler/tsinghua-university/','/universities/tsinghua-university/']]){
  assert.equal(trToEnPath(tr),en);assert.equal(enToTrPath(en),tr);
 }
});
test('unknown paths are rejected instead of phantom canonicals',()=>{
 assert.equal(trToEnPath('/missing/'),null);
 assert.equal(enToTrPath('/universities/made-up-university/'),null);
 assert.equal(trToEnPath('/universiteler/made-up-university/'),null);
 assert.equal(enToTrPath('/destinations/narnia/'),null);
 assert.equal(trToEnPath('//outside.com/'),null);
});
test('country/field filters translate while unsafe or irrelevant values are discarded',()=>{
 const out=translateQuery(new URLSearchParams('ulke=cin&alan=M%C3%BChendislik&utm_source=instagram&bad=1'),'tr-en');
 assert.equal(out.get('country'),'china');assert.equal(out.get('field'),'engineering');
 assert.equal(out.get('utm_source'),'instagram');assert.equal(out.has('bad'),false);
 const back=translateQuery(new URLSearchParams('country=japan&field=science&utm_campaign=test'),'en-tr');
 assert.equal(back.get('ulke'),'japonya');assert.equal(back.get('alan'),'Bilim');
 assert.equal(back.get('utm_campaign'),'test');
 const bad=translateQuery(new URLSearchParams('country=na&field=random&redirect=https://evil.example/'),'en-tr');
 assert.equal(bad.toString(),'');
});
