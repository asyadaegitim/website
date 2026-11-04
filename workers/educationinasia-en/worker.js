import {trToEnPath,enToTrPath,translateQuery} from '../shared/routes.mjs';
import {withSecurityHeaders} from '../shared/security.mjs';
// Education in Asia | English-domain edge publisher. Source: asyadaegitim.com/en/
// Approved English V9: cinegitim/design brands/asyada-egitim/assets/lockups/h-en-02-horizontal-light.svg
const ENGLISH_LOGO_URL='/assets/education-in-asia-logo.svg?v=20261104'; // SHA-256 b3a70033fc37049730a24ca54e1fe5259e32fb40c255450206dd29e40b644dde
const PRIMARY='https://educationinasia.com';
const SOURCE='https://www.asyadaegitim.com';
const TURKISH='https://asyadaegitim.com';
const COUNTRIES={cin:'china',japonya:'japan','guney-kore':'south-korea',singapur:'singapore','hong-kong':'hong-kong'};
const BACK_COUNTRIES=Object.fromEntries(Object.entries(COUNTRIES).map(([tr,en])=>[en,tr]));
const FIELDS={'Bilgisayar ve teknoloji':'computing-technology',Bilim:'science','Dil ve kültür':'language-culture',Ekonomi:'economics','Mühendislik':'engineering',Sağlık:'health','Sosyal bilimler':'social-sciences',Tasarım:'design',Teknoloji:'technology',Yönetim:'management',İşletme:'business'};
const BACK_FIELDS=Object.fromEntries(Object.entries(FIELDS).map(([tr,en])=>[en,tr]));
const STATIC=/^\/(?:assets\/|site\.(?:css|js)$|favicon(?:\.[^/]+)?$|apple-touch-icon(?:\.[^/]+)?$|\.well-known\/)/i;
const FILE=/\.(?:css|js|mjs|svg|png|jpe?g|webp|gif|ico|woff2?|ttf|otf|map|pdf|json)$/i;
function englishPath(path){
 const a=path.split('/').filter(Boolean);
 if(a[0]==='en')a.shift();
 if(a[0]==='ulkeler'||a[0]==='destinations'){a[0]='destinations';if(a[1])a[1]=COUNTRIES[a[1]]||a[1];if(a[2]==='dil-programlari')a[2]='language-programs';if(a[2]==='yaz-okullari')a[2]='summer-schools';}
 if(a[0]==='okullar'||a[0]==='universiteler')a[0]='universities';
 if(a[0]==='programlar')a[0]='programs';
 if(a[0]==='on-gorusme')a[0]='free-consultation';
 return a.length?'/'+a.join('/')+(path.endsWith('/')?'/':''):'/';
}
function turkishPath(path){
 const a=path.split('/').filter(Boolean);
 if(a[0]==='destinations'){a[0]='ulkeler';if(a[1])a[1]=BACK_COUNTRIES[a[1]]||a[1];if(a[2]==='language-programs')a[2]='dil-programlari';if(a[2]==='summer-schools')a[2]='yaz-okullari';}
 else if(a[0]==='universities'){a[0]=a.length>1?'universiteler':'okullar';}
 else if(a[0]==='programs')a[0]='programlar';
 else if(a[0]==='free-consultation')a[0]='on-gorusme';
 return a.length?'/'+a.join('/')+(path.endsWith('/')?'/':''):'/';
}
function rewriteQuery(query){
 if(query.has('ulke')){const v=query.get('ulke');query.delete('ulke');query.set('country',COUNTRIES[v]||v);}
 if(query.has('alan')){const v=query.get('alan');query.delete('alan');query.set('field',FIELDS[v]||v);}
}
function redirectLegacy(u){
 const path=englishPath(u.pathname);
 if(path===u.pathname&&!u.searchParams.has('ulke')&&!u.searchParams.has('alan'))return null;
 const tr=enToTrPath(path);
 if(!tr)return new Response('Not found',{status:404});
 const q=translateQuery(u.searchParams,'tr-en');
 const tail=q.toString()?'?'+q.toString():'';
 return Response.redirect(PRIMARY+trToEnPath(tr)+tail,301);
}
function rewriteLink(raw,turkish=false){
 if(!raw||raw.startsWith('#')||/^(?:mailto:|tel:|javascript:|data:)/i.test(raw))return raw;
 let u;try{u=new URL(raw,turkish?TURKISH:PRIMARY)}catch{return raw;}
 if(turkish){
   if(u.origin!==TURKISH)return raw;
   u.pathname=turkishPath(u.pathname);
   if(u.searchParams.has('country')){const v=u.searchParams.get('country');u.searchParams.delete('country');u.searchParams.set('ulke',BACK_COUNTRIES[v]||v);}
   if(u.searchParams.has('field')){const v=u.searchParams.get('field');u.searchParams.delete('field');u.searchParams.set('alan',BACK_FIELDS[v]||v);}
   return u.toString();
 }
 if(u.origin===TURKISH||u.origin===SOURCE){
   if(!u.pathname.startsWith('/en/')&&u.pathname!=='/en')return raw;
 }else if(u.origin!==PRIMARY)return raw;
 const path=englishPath(u.pathname);
 rewriteQuery(u.searchParams);
 return PRIMARY+path+u.search+u.hash;
}
class Anchor{
 constructor(origin){this.origin=origin}
 element(e){
  const raw=e.getAttribute('href'),tr=e.getAttribute('lang')==='tr'||e.getAttribute('hreflang')==='tr';
  let result=rewriteLink(raw,tr);
  if(!tr&&this.origin!==PRIMARY&&result.startsWith(PRIMARY+'/')){
    result=this.origin+result.slice(PRIMARY.length);
  }
  if(result!==raw)e.setAttribute('href',result);
 }
}
class BrandLogo{element(e){e.setAttribute('src',ENGLISH_LOGO_URL);e.setAttribute('alt','Education in Asia');e.setAttribute('width','1772');e.setAttribute('height','588')}}
class BrandLink{element(e){e.setAttribute('aria-label','Education in Asia home')}}
class HTMLLink{element(e){
 const rel=(e.getAttribute('rel')||'').toLowerCase(),lang=e.getAttribute('hreflang'),href=e.getAttribute('href');
 if(rel==='canonical'||(rel==='alternate'&&lang==='en')){const value=rewriteLink(href);if(value!==href)e.setAttribute('href',value);}
}}
class URLMeta{element(e){const old=e.getAttribute('content'),v=rewriteLink(old);if(v!==old)e.setAttribute('content',v)}}
class EnglishText{text(t){const v=t.text.replace(/Asya’da Eğitim/g,'Education in Asia').replace(/Asya'da Eğitim/g,'Education in Asia');if(v!==t.text)t.replace(v)}}
class FormURL{element(e){e.setAttribute('value',PRIMARY+'/free-consultation/')}}
class ScriptVersion{element(e){e.setAttribute('src','/site.js?english-routes=20261103-v2')}}
function rewriteHTML(res,origin=PRIMARY){
 const h=new Headers(res.headers);
 h.delete('content-encoding');h.delete('content-length');h.delete('set-cookie');
 h.set('x-educationinasia-site','english-slugs-v2');
 h.set('cache-control','public, max-age=60');
 return new HTMLRewriter().on('a[href]',new Anchor(origin)).on('header a.brand',new BrandLink())
 .on('header img.brand-logo',new BrandLogo()).on('footer img.footer-logo',new BrandLogo()).on('footer a.footer-logo-link',new BrandLink()).on('link[rel="canonical"]',new HTMLLink())
 .on('link[rel="alternate"]',new HTMLLink()).on('meta[property="og:url"]',new URLMeta())
 .on('meta[name="twitter:url"]',new URLMeta()).on('.home-intro .eyebrow.red',new EnglishText())
 .on('title',new EnglishText()).on('input[name="_url"]',new FormURL())
 .on('script[src="/site.js"]',new ScriptVersion())
 .transform(new Response(res.body,{status:res.status,statusText:res.statusText,headers:h}));
}
function patchSiteJS(text){
 const pre='const EN_COUNTRY_FROM_NATIVE='+JSON.stringify(COUNTRIES)+';const EN_COUNTRY_TO_NATIVE='+JSON.stringify(BACK_COUNTRIES)+';const EN_FIELD_FROM_NATIVE='+JSON.stringify(FIELDS)+';const EN_FIELD_TO_NATIVE='+JSON.stringify(BACK_FIELDS)+';\n';
 text=text.replaceAll("'https://asyadaegitim.com'","'https://educationinasia.com'");
 text=text.replace("u.search=location.search;u.hash=location.hash;a.href=u.href;","u.search=location.search;u.hash=location.hash;if(a.getAttribute('lang')==='tr'){const c=u.searchParams.get('country');if(c){u.searchParams.delete('country');u.searchParams.set('ulke',EN_COUNTRY_TO_NATIVE[c]||c)}const f=u.searchParams.get('field');if(f){u.searchParams.delete('field');u.searchParams.set('alan',EN_FIELD_TO_NATIVE[f]||f)}}a.href=u.href;");
 text=text.replace("const params=new URLSearchParams(location.search),preset=params.get('ulke');","const params=new URLSearchParams(location.search),preset=(EN_COUNTRY_TO_NATIVE[params.get('country')]||params.get('ulke'));");
 text=text.replace("const presetTheme=params.get('alan');","const presetTheme=(EN_FIELD_TO_NATIVE[params.get('field')]||params.get('alan'));");
 text=text.replace("url.searchParams.set('ulke',c)","url.searchParams.set('country',EN_COUNTRY_FROM_NATIVE[c]||c)").replace("url.searchParams.delete('ulke')","url.searchParams.delete('country')");
 text=text.replace("history.replaceState(null,'',url)};[search,country,theme]","t?url.searchParams.set('field',EN_FIELD_FROM_NATIVE[t]||t):url.searchParams.delete('field');history.replaceState(null,'',url)};[search,country,theme]");
 text=text.replace("new URLSearchParams(location.search).get('ulke')","(EN_COUNTRY_TO_NATIVE[new URLSearchParams(location.search).get('country')]||new URLSearchParams(location.search).get('ulke'))");
 text=text.replace("url.searchParams.set('ulke',pc.value)","url.searchParams.set('country',EN_COUNTRY_FROM_NATIVE[pc.value]||pc.value)").replace("url.searchParams.delete('ulke')","url.searchParams.delete('country')");
 text=text.replace("Asya’da Eğitim — Free Pre-Consultation Request","Education in Asia — Free Pre-Consultation Request");
 return pre+text;
}
async function run(req,env){
 const u=new URL(req.url);
 if(u.hostname==='www.educationinasia.com')return Response.redirect(PRIMARY+u.pathname+u.search,301);
 if(req.method!=='GET'&&req.method!=='HEAD')return new Response('Method not allowed',{status:405,headers:{allow:'GET, HEAD'}});

 if(u.pathname==='/robots.txt')
   return new Response(u.hostname===new URL(PRIMARY).hostname?'User-agent: *\nAllow: /\nSitemap: '+PRIMARY+'/sitemap.xml\n':'User-agent: *\nDisallow: /\n',{headers:{'content-type':'text/plain; charset=utf-8'}});
 if(u.pathname==='/sitemap.xml'){
   const r=await env.ASSETS.fetch(new Request(u.origin+'/en-sitemap.xml'));
   if(!r.ok)return new Response('English sitemap unavailable',{status:502});
   return new Response(req.method==='HEAD'?null:r.body,{headers:{'content-type':'application/xml; charset=utf-8','cache-control':'public, max-age=3600'}});
 }
 const staticAsset=STATIC.test(u.pathname)||FILE.test(u.pathname);
 if(!staticAsset){const redirect=redirectLegacy(u);if(redirect)return redirect;}
 const sourcePath=staticAsset?null:enToTrPath(u.pathname);
 if(!staticAsset&&!sourcePath)return new Response('Not found',{status:404});
 const canonicalPath=staticAsset?null:trToEnPath(sourcePath);
 if(!staticAsset&&canonicalPath!==u.pathname)
   return Response.redirect(PRIMARY+canonicalPath+u.search,301);
 const target=new URL((staticAsset?u.pathname:'/en'+sourcePath)+u.search,u.origin);
 if(!staticAsset){
   if(target.searchParams.has('country')){const v=target.searchParams.get('country');target.searchParams.delete('country');target.searchParams.set('ulke',BACK_COUNTRIES[v]||v);}
   if(target.searchParams.has('field')){const v=target.searchParams.get('field');target.searchParams.delete('field');target.searchParams.set('alan',BACK_FIELDS[v]||v);}
 }
 const headers=new Headers(req.headers);
 headers.delete('host');headers.delete('cookie');headers.delete('authorization');
 const response=await env.ASSETS.fetch(new Request(target.href,{method:req.method,headers}));
 if(u.pathname==='/site.js'&&response.ok){
   const patched=patchSiteJS(await response.text());
   return new Response(req.method==='HEAD'?null:patched,{status:200,headers:{'content-type':'application/javascript; charset=utf-8','cache-control':'public, max-age=900','x-educationinasia-js':'english-query-v2'}});
 }
 if((response.headers.get('content-type')||'').includes('text/html'))return rewriteHTML(response,u.origin);
 const h=new Headers(response.headers);h.delete('set-cookie');
 return new Response(response.body,{status:response.status,statusText:response.statusText,headers:h});
}
export default {
 async fetch(request,env){
  const response=await run(request,env);
  const host=new URL(request.url).hostname;
  const isProduction=host==='educationinasia.com'||host==='www.educationinasia.com';
  return withSecurityHeaders(response,{noindex:!isProduction});
 }
};
