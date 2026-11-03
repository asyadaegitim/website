/** A single, deliberately finite route contract for the bilingual website. */
export const TR_HOST = 'https://asyadaegitim.com';
export const EN_HOST = 'https://educationinasia.com';
export const COUNTRIES = Object.freeze({cin:'china',japonya:'japan','guney-kore':'south-korea',singapur:'singapore','hong-kong':'hong-kong'});
export const FIELDS = Object.freeze({'Bilgisayar ve teknoloji':'computing-technology',Bilim:'science','Dil ve kültür':'language-culture',Ekonomi:'economics','Mühendislik':'engineering',Sağlık:'health','Sosyal bilimler':'social-sciences',Tasarım:'design',Teknoloji:'technology',Yönetim:'management',İşletme:'business'});
export const BACK_COUNTRIES = Object.freeze(Object.fromEntries(Object.entries(COUNTRIES).map(([tr,en])=>[en,tr])));
export const BACK_FIELDS = Object.freeze(Object.fromEntries(Object.entries(FIELDS).map(([tr,en])=>[en,tr])));
export const UNIVERSITIES = Object.freeze([
'chinese-university-of-hong-kong','city-university-of-hong-kong','daejeon-institute-of-science-and-technology','fudan-university','gumi-university','hong-kong-university-of-science-and-technology','hosei-university','kyungbok-university','kyushu-university','nagoya-university-of-commerce-and-business','nanjing-university','nanyang-technological-university','national-university-of-singapore','peking-university','shanghai-jiao-tong-university','shanghai-university','singapore-management-university','sophia-university','suwon-womens-university','the-hong-kong-polytechnic-university','the-university-of-hong-kong','tohoku-university','tsinghua-university','university-of-science-and-technology-of-china','wuhan-university','xian-jiaotong-university','zhejiang-university'
]);
const pairs=[['/','/'],['/ulkeler/','/destinations/'],['/okullar/','/universities/'],['/programlar/','/programs/'],['/on-gorusme/','/free-consultation/']];
for(const [tr,en] of Object.entries(COUNTRIES)){
 pairs.push(['/ulkeler/'+tr+'/','/destinations/'+en+'/']);
 pairs.push(['/ulkeler/'+tr+'/dil-programlari/','/destinations/'+en+'/language-programs/']);
 pairs.push(['/ulkeler/'+tr+'/yaz-okullari/','/destinations/'+en+'/summer-schools/']);
}
for(const slug of UNIVERSITIES)pairs.push(['/universiteler/'+slug+'/','/universities/'+slug+'/']);
export const ROUTE_PAIRS=Object.freeze(pairs.map(([tr,en])=>Object.freeze({trPath:tr,enPath:en})));
const toEN = new Map(ROUTE_PAIRS.map(x=>[x.trPath,x.enPath]));
const toTR = new Map(ROUTE_PAIRS.map(x=>[x.enPath,x.trPath]));
function normalized(path){
 if(typeof path!=='string'||!path.startsWith('/')||path.startsWith('//')||path.includes('?')||path.includes('#')||path.includes('\\')||path.includes('%'))return null;
 if(path==='/' )return '/';
 return path.endsWith('/')?path:path+'/';
}
export function trToEnPath(path){return toEN.get(normalized(path))??null;}
export function enToTrPath(path){return toTR.get(normalized(path))??null;}
export function translateQuery(params,direction){
 const input = new URLSearchParams(params);
 const output=new URLSearchParams();
 const toEnglish=direction==='tr-en';
 if(!toEnglish&&direction!=='en-tr')throw new TypeError('Invalid translation direction');
 const cn=toEnglish?COUNTRIES:BACK_COUNTRIES, f=toEnglish?FIELDS:BACK_FIELDS;
 const value=input.get(toEnglish?'ulke':'country');
 if(value!==null&&Object.hasOwn(cn,value))output.set(toEnglish?'country':'ulke',cn[value]);
 const field=input.get(toEnglish?'alan':'field');
 if(field!==null&&Object.hasOwn(f,field))output.set(toEnglish?'field':'alan',f[field]);
 for(const key of ['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid']){
  const v=input.get(key);if(v&&v.length<=150&&/^[\w\- .]+$/.test(v))output.set(key,v);
 }
 return output;
}
