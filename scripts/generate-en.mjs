/**
 * Build static English pages and language alternates. Node 18+, no dependencies.
 * Change curated translations in locales/en.json then run: node scripts/generate-en.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
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
  if(s.endsWith(" | Asya’da Eğitim"))return title(s.slice(0,-" | Asya’da Eğitim".length))+" | Asya’da Eğitim";
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
   .replace(/<!-- i18n-switch -->[\s\S]*?<!-- \/i18n-switch -->/g,"");
}
function localized(p){return "/en"+p;}
function english(html,p){
  let s=html.replace('<html lang="tr">','<html lang="en">');
  if(p==="/")s=s.replace('<h1 class="serif">Üniversite için<br><span class="hero-accent">başka bir dünya</span><br>var.</h1>','<h1 class="serif">There is another<br><span class="hero-accent">world</span> for<br><span class="hero-accent">university education.</span></h1>');
  if(p==="/okullar/")s=s.replace('<h1 class="serif">Üniversiteleri<br>keşfet.</h1>','<h1 class="serif">Discover<br>universities.</h1>');
  s=s.replace(/<a\b[^>]*>/g, tag => tag.replace(/(\bhref=")\/(?!\/)/g, '$1/en/').replace(/(\bhref=")https:\/\/asyadaegitim\.com\/(?!en\/)/g, '$1https://asyadaegitim.com/en/'));
  s=s.replace(/>([^<>]+)</g,(all,value)=>">"+inline(value)+"<");
  s=s.replace(/(\b(?:alt|title|aria-label|placeholder)=")([^"]*)(")/g,(_,a,v,z)=>a+inline(v)+z);
  let desc="Explore universities, academic programs and education opportunities across Asia with Asya’da Eğitim.";
  if(p==="/")desc="Explore study opportunities in China, Japan, South Korea, Singapore and Hong Kong with Asya’da Eğitim.";
  else if(p.startsWith("/universiteler/")){
    const name=s.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1]?.replace(/\.$/,"") || "this university";
    desc="Explore "+name+": academic fields, campuses and international admissions guidance.";
  }else if(p.startsWith("/ulkeler/")){
    const slug=p.split("/")[2],names={"cin":"China","japonya":"Japan","guney-kore":"South Korea","singapur":"Singapore","hong-kong":"Hong Kong"};
    desc="Explore university study, academic programs and student life in "+(names[slug]||"Asia")+".";
  }else if(p==="/on-gorusme/")desc="Book a free pre-consultation with Asya’da Eğitim about university options in Asia.";
  else if(p==="/programlar/")desc="Explore fields of study, including engineering, business, science and design at universities across Asia.";
  else if(p==="/okullar/")desc="Browse universities in China, Japan, South Korea, Singapore and Hong Kong.";
  s=s.replace(/(<meta name="description" content=")[^"]*(")/i,(_,a,z)=>a+desc+z);
  return s;
}
function decorate(html,p,locale){
  let s=strip(html);
  const tr="https://asyadaegitim.com"+p,en="https://asyadaegitim.com"+localized(p);
  const canonical=locale==="en"?en:tr;
  const head='<!-- i18n-head --><link rel="canonical" href="'+canonical+'"><link rel="alternate" hreflang="tr" href="'+tr+'"><link rel="alternate" hreflang="en" href="'+en+'"><link rel="alternate" hreflang="x-default" href="'+tr+'"><!-- /i18n-head -->';
  const switcher='<!-- i18n-switch --><div class="lang-switch" role="group" aria-label="'+(locale==="en"?"Language":"Dil")+'"><a lang="tr" hreflang="tr" href="'+p+'"'+(locale==="tr"?' aria-current="page"':'')+'>TR</a><span aria-hidden="true">/</span><a lang="en" hreflang="en" href="'+localized(p)+'"'+(locale==="en"?' aria-current="page"':'')+'>EN</a></div><!-- /i18n-switch -->';
  s=s.replace("</head>",head+"</head>");
  s=s.replace('<button class="menu-toggle"',switcher+'<button class="menu-toggle"');
  return s;
}
function paths(dir,rel=""){
  let all=[];
  for(const e of readdirSync(dir,{withFileTypes:true})){
    if(e.name==="en")continue;
    if(e.isDirectory())all.push(...paths(join(dir,e.name),rel+e.name+"/"));
    else if(e.name==="index.html")all.push({file:join(dir,e.name),pathname:"/"+rel});
  }
  return all;
}
const pages=paths(root);
for(const {file,pathname} of pages){
  const source=strip(readFileSync(file,"utf8"));
  writeFileSync(file,decorate(source,pathname,"tr"));
  const enFile=join(root,"en",pathname.slice(1),"index.html");
  mkdirSync(dirname(enFile),{recursive:true});
  writeFileSync(enFile,decorate(english(source,pathname),pathname,"en"));
}
const routes=pages.map(x=>x.pathname).sort();
const urls=routes.flatMap(p=>[p,localized(p)]).map(p=>{
  const tr=p.startsWith("/en/")?p.slice(3):p,en=localized(tr);
  return '<url><loc>https://asyadaegitim.com'+p+'</loc><xhtml:link rel="alternate" hreflang="tr" href="https://asyadaegitim.com'+tr+'"/><xhtml:link rel="alternate" hreflang="en" href="https://asyadaegitim.com'+en+'"/></url>';
});
writeFileSync(join(root,"sitemap.xml"),'<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">'+urls.join("\n")+'</urlset>\n');
writeFileSync(join(root,"robots.txt"),"User-agent: *\nAllow: /\nSitemap: https://asyadaegitim.com/sitemap.xml\n");
console.log("Generated "+pages.length+" English pages and language alternates.");
