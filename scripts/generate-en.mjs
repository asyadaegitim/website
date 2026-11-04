/**
 * Build static English pages and language alternates. Node 18+, no dependencies.
 * Change curated translations in locales/en.json then run: node scripts/generate-en.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import {TR_HOST, EN_HOST, ROUTE_PAIRS, trToEnPath} from "../workers/shared/routes.mjs";
const root = new URL("../dist/", import.meta.url).pathname;
const t = JSON.parse(readFileSync(new URL("../locales/en.json", import.meta.url), "utf8"));
const replacements = {
  "Karar verirken yalnızca okul adlarına değil; programın eğitim dili, başvuru koşulları, burs ve yaşam giderlerine birlikte bak.":
    "Compare more than university names: consider the teaching language, admission requirements, scholarships and living costs together.",
  "Açık programlar, tarih ve ücretler kurumların güncel duyurularına göre değişir.":
    "Available courses, dates and fees are subject to each institution's latest announcements."
};
function title(s) {
  if(t[s]!==undefined) return t[s];
  const countries={"Çin":"China","Japonya":"Japan","Güney Kore":"South Korea","Singapur":"Singapore","Hong Kong":"Hong Kong"};
  for (const [tr,en] of Object.entries(countries)){
    if(s===tr+" Dil Programları")return "Language programs in "+en;
    if(s===tr+" Yaz Okulları")return "Summer schools in "+en;
  }
  return s;
}
function translate(s){
  if(t[s]!==undefined) return t[s];
  if(replacements[s])return replacements[s];
  for(const [tr,en] of Object.entries(replacements)){
    const suffix=" "+tr;
    if(s.endsWith(suffix))return translate(s.slice(0,-suffix.length))+" "+en;
  }
  if(s.startsWith("Konaklama, kampüse ulaşım ve yaşam giderleri program seçimiyle birlikte değerlendirilmeli. ")){
    const c=s.match(/ (Çin|Japonya|Güney Kore|Singapur|Hong Kong) rehberinde/);
    if(c)return "Consider accommodation, transport to campus and living costs alongside your choice of program. Our "+translate(c[1])+" guide introduces the study environment and other universities.";
  }
  if(/^.+?(?:[’']da|[’']de|[’']ta|[’']te) eğitim\.$/i.test(s)){
    const city=s.replace(/(?:[’']da|[’']de|[’']ta|[’']te) eğitim\.$/i,"");
    return "Studying in "+translate(city)+".";
  }
  if(s.endsWith(" logosu"))return translate(s.slice(0,-7))+" logo";
  if(s.endsWith(" kampüsü"))return translate(s.slice(0,-8))+" campus";
  if(s.endsWith(" / kampüs"))return translate(s.slice(0,-9))+" / campus";
  if(s.endsWith(" bayrağı"))return "Flag of "+translate(s.slice(0,-8));
  if(s.endsWith(" üniversite kampüsü görseli"))return "University campus in "+translate(s.slice(0,-27));
  if(s.endsWith(" | Asya’da Eğitim"))return title(s.slice(0,-" | Asya’da Eğitim".length))+" | Education in Asia";
  if(s.includes(" · "))return s.split(" · ").map(translate).join(" · ");
  if(s.includes(" / ") && s.length<100)return s.split(" / ").map(translate).join(" / ");
  return title(s);
}
function inline(s){
  const m=s.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if(!m || !m[2])return s;
  const decoded=m[2].replaceAll("&amp;","&").replaceAll("&nbsp;","\u00a0");
  const translated=translate(decoded);
  return m[1]+translated.replace(/&(?![a-z]+;|#\d+;)/gi,"&amp;")+m[3];
}
function strip(html){
  return html.replace(/<!-- i18n-head -->[\s\S]*?<!-- \/i18n-head -->/g,"")
   .replace(/<!-- i18n-switch -->[\s\S]*?<!-- \/i18n-switch -->/g,"")
   .replace(/<!-- consultation-disclosure -->[\s\S]*?<!-- \/consultation-disclosure -->/g,"")
   .replace(/<!-- discovery-section:start -->[\s\S]*?<!-- discovery-section:end -->/g,"")
   .replace(/<script type="application\/ld\+json" data-discovery-breadcrumb>[\s\S]*?<\/script>/g,"");
}
function localized(p){return "/en"+p;}
function english(html,p){
  let s=html.replace('<html lang="tr">','<html lang="en">');
  if(p==="/")s=s.replace('<h1 class="serif"><span class="hero-slogan-line">Üniversite için</span><span class="hero-slogan-line"><span class="hero-accent">başka bir dünya</span> var.</span></h1>','<h1 class="serif"><span class="hero-slogan-line">There is another <span class="hero-accent">world</span></span><span class="hero-slogan-line">for <span class="hero-accent">university education.</span></span></h1>');
  // FormSubmit uses each field name as the email table label; localize it, too.
  if(p==="/on-gorusme/")s=s.replace('name="Program türü"','name="Program type"').replace('name="Hedef başlangıç"','name="Planned start"').replace('placeholder="Ad Soyad"','placeholder="Your full name"').replace('placeholder="ornek@eposta.com"','placeholder="name@example.com"');
  if(p==="/okullar/")s=s.replace('<h1 class="serif">Üniversiteleri<br>keşfet.</h1>','<h1 class="serif">Discover<br>universities.</h1>');
  s=s.replace(/<a\b[^>]*>/g, tag => tag.replace(/(\bhref=")\/(?!\/)/g, '$1/en/').replace(/(\bhref=")https:\/\/asyadaegitim\.com\/(?!en\/)/g, '$1https://asyadaegitim.com/en/'));
  s=s.replace(/>([^<>]+)</g,(all,value)=>">"+inline(value)+"<");
  s=s.replace(/(\b(?:alt|title|aria-label|placeholder)=")([^"]*)(")/g,(_,a,v,z)=>a+inline(v)+z);
  let desc="Explore universities, academic programs and education opportunities across Asia with Education in Asia.";
  if(p==="/")desc="Explore study opportunities in China, Japan, South Korea, Singapore and Hong Kong with Education in Asia.";
  else if(p.startsWith("/universiteler/")){
    const name=s.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.replace(/\.$/,"") || "this university";
    desc="Explore "+name+": academic fields, campuses and international admissions guidance.";
  }else if(p.startsWith("/ulkeler/")){
    const slug=p.split("/")[2],names={"cin":"China","japonya":"Japan","guney-kore":"South Korea","singapur":"Singapore","hong-kong":"Hong Kong"};
    desc="Explore university study, academic programs and student life in "+(names[slug]||"Asia")+".";
  }else if(p==="/on-gorusme/")desc="Book a free pre-consultation with Education in Asia about university options in Asia.";
  else if(p==="/programlar/")desc="Explore fields of study, including engineering, business, science and design at universities across Asia.";
  else if(p==="/okullar/")desc="Browse universities in China, Japan, South Korea, Singapore and Hong Kong.";
  s=s.replace(/(<meta name="description" content=")[^"]*(")/i,(_,a,z)=>a+desc+z);
  return s;
}
function decorate(html,p,locale){
  let s=strip(html);
  const enPath=trToEnPath(p);
  if(!enPath)throw new Error("No canonical English route for "+p);
  const tr=TR_HOST+p,en=EN_HOST+enPath;
  const canonical=locale==="en"?en:tr;
  const brand=locale==="en"?"Education in Asia":"Asya’da Eğitim";
  if(locale==="en"){
    s=s.replace(/<title>([\s\S]*?)<\/title>/i,(_,v)=>"<title>"+v.replace(/Asya’da Eğitim/g,brand)+"</title>");
    s=s.replace(/(<meta name="description" content=")([^"]*)(")/i,(_,a,v,z)=>a+v.replace(/Asya’da Eğitim/g,brand)+z);
  }
  const title=(s.match(/<title>([\s\S]*?)<\/title>/i)?.[1]||brand).replace(/<[^>]*>/g,"");
  const desc=(s.match(/<meta name="description" content="([^"]*)"/i)?.[1]||"");
  const attr=x=>x.replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;");
  const countryImages={cin:"tsinghua.jpg",japonya:"tohoku.jpg","guney-kore":"kyungbok.jpg",singapur:"nus.jpg","hong-kong":"polyu.jpg"};
  const universityImages={"tsinghua-university":"tsinghua.jpg","tohoku-university":"tohoku.jpg","kyungbok-university":"kyungbok.jpg","national-university-of-singapore":"nus.jpg","the-hong-kong-polytechnic-university":"polyu.jpg"};
  const parts=p.split("/").filter(Boolean);
  const imageName=parts[0]==="ulkeler"&&countryImages[parts[1]]?countryImages[parts[1]]:parts[0]==="universiteler"&&universityImages[parts[1]]?universityImages[parts[1]]:null;
  const imagePath=imageName?"/assets/universities/"+imageName:"/assets/ieft-university-logos.jpeg";
  const ogImage=(locale==="en"?EN_HOST:TR_HOST)+imagePath;
  const head='<!-- i18n-head --><link rel="canonical" href="'+canonical+'">'
  +'<link rel="alternate" hreflang="tr" href="'+tr+'">'
  +'<link rel="alternate" hreflang="en" href="'+en+'">'
  +'<meta property="og:type" content="website">'
  +'<meta property="og:site_name" content="'+attr(brand)+'">'
  +'<meta property="og:title" content="'+attr(title)+'">'
  +'<meta property="og:description" content="'+attr(desc)+'">'
  +'<meta property="og:url" content="'+canonical+'">'
  +'<meta property="og:image" content="'+ogImage+'">'
  +'<meta name="twitter:card" content="summary_large_image">'
  +'<meta name="twitter:title" content="'+attr(title)+'">'
  +'<meta name="twitter:description" content="'+attr(desc)+'">'
  +(p==='/'?'<script type="application/ld+json">'+JSON.stringify({
    "@context":"https://schema.org","@type":"Organization",
    name:brand,url:locale==="en"?EN_HOST+"/":TR_HOST+"/",
    logo:locale==="en"?EN_HOST+"/assets/education-in-asia-logo.svg":TR_HOST+"/assets/asya-logo.svg"
  })+'</script>':'')+'<!-- /i18n-head -->';
  const switcher='<!-- i18n-switch --><div class="lang-switch" role="group" aria-label="'+(locale==="en"?"Language":"Dil")+'">'
    +'<a lang="tr" hreflang="tr" href="'+tr+'"'+(locale==="tr"?' aria-current="page"':'')+'>TR</a>'
    +'<span aria-hidden="true">/</span>'
    +'<a lang="en" hreflang="en" href="'+en+'"'+(locale==="en"?' aria-current="page"':'')+'>EN</a>'
    +'</div><!-- /i18n-switch -->';
  s=s.replace("</head>",head+"</head>");
  s=s.replace('<button class="menu-toggle"',switcher+'<button class="menu-toggle"');
  if(p==="/on-gorusme/"){
    const note=locale==="tr"
      ?"Bu formdaki bilgiler, ön görüşme talebinize yanıt vermek üzere FormSubmit hizmeti aracılığıyla info@asyadaegitim.com adresine iletilir. Pazarlama izni vermiş sayılmazsınız."
      :"The information you enter is sent to info@asyadaegitim.com through FormSubmit so we can respond to your consultation request. Submitting this form does not give marketing consent.";
    s=s.replace(/<form class="contact-form" id="consultation-form"(?: aria-describedby="consultation-data-note")?/,
      '<form class="contact-form" id="consultation-form" aria-describedby="consultation-data-note"');
    const marker='<!-- consultation-disclosure --><p id="consultation-data-note" class="form-data-note">'+note+'</p><!-- /consultation-disclosure -->';
    s=s.replace('<button class="button" type="submit">',marker+'<button class="button" type="submit">');
  }
  return s;
}
function paths(dir,rel=""){
  let all=[];
  for(const e of readdirSync(dir,{withFileTypes:true})){
    if(e.name==="en"||e.name==="gorsel-kaynaklar")continue;
    if(e.isDirectory())all.push(...paths(join(dir,e.name),rel+e.name+"/"));
    else if(e.name==="index.html")all.push({file:join(dir,e.name),pathname:"/"+rel});
  }
  return all;
}
const pages=paths(root);
const actual=new Set(pages.map(x=>x.pathname));
if(actual.size!==ROUTE_PAIRS.length||ROUTE_PAIRS.some(x=>!actual.has(x.trPath))){
  throw new Error("TR page inventory differs from canonical route contract; update routes.mjs first");
}
for(const {file,pathname} of pages){
  const source=strip(readFileSync(file,"utf8"));
  writeFileSync(file,decorate(source,pathname,"tr"));
  const enFile=join(root,"en",pathname.slice(1),"index.html");
  mkdirSync(dirname(enFile),{recursive:true});
  writeFileSync(enFile,decorate(english(source,pathname),pathname,"en"));
}
function sitemap(locale){
 const tr=locale==="tr";
 const host=tr?TR_HOST:EN_HOST;
 const urls=ROUTE_PAIRS.map(({trPath,enPath})=>{
  const url=host+(tr?trPath:enPath);
  return '<url><loc>'+url+'</loc><xhtml:link rel="alternate" hreflang="tr" href="'+TR_HOST+trPath+'"/><xhtml:link rel="alternate" hreflang="en" href="'+EN_HOST+enPath+'"/></url>';
 });
 return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+urls.join("\n")+'</urlset>\n';
}
writeFileSync(join(root,"sitemap.xml"),sitemap("tr"));
writeFileSync(join(root,"en-sitemap.xml"),sitemap("en"));
writeFileSync(join(root,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: https://asyadaegitim.com/sitemap.xml\n");
console.log("Generated "+pages.length+" canonical page pairs, TR/EN metadata and independent sitemaps.");
