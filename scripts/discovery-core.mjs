/**
 * Build-time, evidence-bounded internal discovery links for the bilingual sites.
 * Never infer actual courses or admission conditions from broad subject tags.
 */
import {COUNTRIES, FIELDS, UNIVERSITIES, ROUTE_PAIRS, trToEnPath} from '../workers/shared/routes.mjs';

const TR_COUNTRIES=Object.freeze({
 cin:'Çin',japonya:'Japonya','guney-kore':'Güney Kore',singapur:'Singapur','hong-kong':'Hong Kong'
});
const EN_COUNTRIES=Object.freeze({
 cin:'China',japonya:'Japan','guney-kore':'South Korea',singapur:'Singapore','hong-kong':'Hong Kong'
});
const EN_FIELDS=Object.freeze({
 'Bilgisayar ve teknoloji':'Computing and technology',Bilim:'Science',
 'Dil ve kültür':'Language and culture',Ekonomi:'Economics',
 'Mühendislik':'Engineering',Sağlık:'Health',
 'Sosyal bilimler':'Social sciences',Tasarım:'Design',
 Teknoloji:'Technology',Yönetim:'Management',İşletme:'Business'
});
const PROGRAM_SUBJECTS=Object.freeze(['Teknoloji','Mühendislik','İşletme','Sağlık','Sosyal bilimler','Tasarım']);
const ATTR={tr:'Sayfa yolu',en:'Breadcrumb'};
const COPY={
 tr:{
  home:'Ana sayfa',countries:'Ülkeler',universities:'Üniversiteler',programs:'Programlar',
  consultation:'Ön Görüşme',language:'Dil Programları',summer:'Yaz Okulları',
  countryEyebrow:'Hızlı üniversite keşfi',countryHead:'Bu ülkedeki üniversiteler',
  countryDescription:'Üniversite profillerine doğrudan göz atabilir veya ülke filtresiyle tümünü inceleyebilirsiniz.',
  allCountry:'Ülkedeki tüm üniversiteler',universityEyebrow:'Keşfetmeye devam et',
  universityHead:'Bu ülkedeki diğer seçenekler',universityDescription:'Aynı ülkedeki başka üniversite profillerini, eğitim rehberini ve ilgili keşif sayfalarını inceleyin.',
  countryGuide:'Ülke eğitim rehberi',languagePrograms:'Dil programlarını incele',
  summerSchools:'Yaz okullarını incele',relatedFields:'İlgili alanlar',
  fieldDisclaimer:'Alan etiketleri keşif amaçlıdır; belirli bir programın açık olduğu veya kabul koşulları anlamına gelmez.',
  programsEyebrow:'Alanlardan üniversitelere',programsHead:'Alanına göre üniversite keşfi',
  programsDescription:'Bu alanlarla ilişkilendirilmiş mevcut üniversite profillerini keşfedin.',
  allField:'Bu alandaki tüm üniversiteler',allPrograms:'Tüm program alanları'
 },
 en:{
  home:'Home',countries:'Destinations',universities:'Universities',programs:'Programs',
  consultation:'Free consultation',language:'Language programs',summer:'Summer schools',
  countryEyebrow:'Quick university discovery',countryHead:'Universities in this destination',
  countryDescription:'Open university profiles or browse every listed university with the destination filter already selected.',
  allCountry:'View all universities here',universityEyebrow:'Keep exploring',
  universityHead:'More options in this destination',universityDescription:'Explore other university profiles in the same destination, the study guide and related discovery pages.',
  countryGuide:'Destination study guide',languagePrograms:'Explore language programs',
  summerSchools:'Explore summer schools',relatedFields:'Related fields',
  fieldDisclaimer:'Subject tags are for discovery only; they do not confirm that a particular course is currently open or that you meet its entry requirements.',
  programsEyebrow:'From fields to universities',programsHead:'Find universities by field',
  programsDescription:'Explore existing university profiles associated with these subject areas.',
  allField:'View all universities in this field',allPrograms:'All fields of study'
 }
};

const escapeHTML=value=>String(value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const decodeHTML=value=>String(value).replace(/&amp;/g,'&').replace(/&nbsp;/g,' ').replace(/&#39;/g,"'");
const toEN=tr=>trToEnPath(tr);
const href=(tr,locale)=>locale==='en'?(toEN(tr)??fail('Missing EN route: '+tr)):tr;
const fail=message=>{throw new Error(message)};
const universityPath=slug=>'/universiteler/'+slug+'/';
const countryPath=slug=>'/ulkeler/'+slug+'/';
const cataloguePath='/okullar/';
const checkedCountry=slug=>Object.hasOwn(COUNTRIES,slug)?slug:fail('Unknown country: '+slug);
const checkedSubject=field=>Object.hasOwn(FIELDS,field)?field:fail('Unknown subject: '+field);
const countryLabel=(slug,locale)=>locale==='en'?EN_COUNTRIES[checkedCountry(slug)]:TR_COUNTRIES[checkedCountry(slug)];
const fieldLabel=(subject,locale)=>locale==='en'?EN_FIELDS[checkedSubject(subject)]:subject;

export function catalogFromHTML(html){
 const rx=/<a class="school-row" href="\/universiteler\/([^/]+)\/" data-country="([^"]+)" data-themes="([^"]+)"[^>]*>[\s\S]*?<strong>([\s\S]*?)<\/strong>/g;
 const list=[...String(html).matchAll(rx)].map((m,index)=>{
  const slug=m[1],country=checkedCountry(m[2]),themes=[...new Set(m[3].split('|').filter(Boolean))];
  for(const subject of themes)checkedSubject(subject);
  if(!UNIVERSITIES.includes(slug))fail('Unexpected university: '+slug);
  const name=decodeHTML(m[4].replace(/<[^>]*>/g,'').trim());
  if(!name)fail('Missing university name '+slug);
  return Object.freeze({slug,country,themes,name,index});
 });
 if(list.length!==UNIVERSITIES.length||new Set(list.map(x=>x.slug)).size!==UNIVERSITIES.length
    ||UNIVERSITIES.some(slug=>!list.some(x=>x.slug===slug)))fail('University inventory differs from route contract');
 return Object.freeze(list);
}

function crumbParts(trPath,catalog,locale){
 const c=COPY[locale],parts=trPath.split('/').filter(Boolean);
 const root=[{tr:'/',label:c.home}];
 if(trPath==='/')return [];
 if(parts[0]==='ulkeler'){
  root.push({tr:'/ulkeler/',label:c.countries});
  if(parts[1]){
   checkedCountry(parts[1]);root.push({tr:countryPath(parts[1]),label:countryLabel(parts[1],locale)});
   if(parts[2]==='dil-programlari')root.push({tr:trPath,label:c.language});
   else if(parts[2]==='yaz-okullari')root.push({tr:trPath,label:c.summer});
   else if(parts[2])fail('Unexpected destination subpage '+trPath);
  }
 }else if(parts[0]==='universiteler'){
  const school=catalog.find(x=>x.slug===parts[1]);
  if(!school)fail('University profile not in catalog '+trPath);
  root.push({tr:'/ulkeler/',label:c.countries});
  root.push({tr:countryPath(school.country),label:countryLabel(school.country,locale)});
  root.push({tr:trPath,label:school.name});
 }else{
  const known={okullar:c.universities,programlar:c.programs,'on-gorusme':c.consultation};
  if(!Object.hasOwn(known,parts[0]))fail('Unrecognized route for breadcrumbs '+trPath);
  root.push({tr:trPath,label:known[parts[0]]});
 }
 const current=root.at(-1);
 if(current.tr!==trPath)fail('Breadcrumb contract failed for '+trPath);
 return root;
}

function breadcrumbMarkup(trPath,locale,catalog){
 const crumbs=crumbParts(trPath,catalog,locale),last=crumbs.length-1;
 if(last<1)fail('Expected a non-home breadcrumb');
 const items=crumbs.map((part,i)=>i===last
  ?'<li><span aria-current="page">'+escapeHTML(part.label)+'</span></li>'
  :'<li><a href="'+escapeHTML(href(part.tr,locale))+'">'+escapeHTML(part.label)+'</a><span class="breadcrumb-sep" aria-hidden="true">/</span></li>');
 const schema={
  '@context':'https://schema.org','@type':'BreadcrumbList',
  itemListElement:crumbs.map((part,i)=>({
   '@type':'ListItem',position:i+1,name:part.label,
   item:(locale==='tr'?'https://asyadaegitim.com':'https://educationinasia.com')+href(part.tr,locale)
  }))
 };
 return {
  html:'<nav class="breadcrumb" aria-label="'+ATTR[locale]+'"><ol class="breadcrumb-list">'+items.join('')+'</ol></nav>',
  structured:'<script type="application/ld+json" data-discovery-breadcrumb>'+JSON.stringify(schema).replace(/</g,'\\u003c')+'</script>'
 };
}

function listWithCountry(catalog,country){
 return catalog.filter(x=>x.country===checkedCountry(country));
}

function linkHTML(trPath,label,locale,cls=''){
 return '<a'+(cls?' class="'+cls+'"':'')+' href="'+escapeHTML(href(trPath,locale))+'">'+escapeHTML(label)+'</a>';
}

function countryDiscovery(country,locale,catalog){
 const c=COPY[locale],schools=listWithCountry(catalog,country).slice(0,3);
 if(schools.length<2)fail('Not enough schools in '+country);
 const links=schools.map(x=>linkHTML(universityPath(x.slug),x.name,locale,'discovery-item')).join('');
 const cat=href(cataloguePath,locale);
 const query=new URLSearchParams(locale==='en'?{country:COUNTRIES[country]}:{ulke:country}).toString();
 return '<section class="section shell discovery-country" aria-label="'+escapeHTML(c.countryHead)+'">'
  +'<div class="discovery-heading"><div><div class="eyebrow red">'+c.countryEyebrow+'</div><h2 class="serif">'+c.countryHead+'</h2>'
  +'<p>'+c.countryDescription+'</p></div>'
  +'<a class="text-link discovery-all" href="'+cat+'?'+query+'">'+c.allCountry+'</a></div>'
  +'<div class="discovery-links">'+links+'</div></section>';
}

function choosePeers(catalog,school){
 const same=listWithCountry(catalog,school.country).filter(x=>x.slug!==school.slug);
 const related=entry=>entry.themes.filter(f=>school.themes.includes(f)).length;
 return same.sort((a,b)=>related(b)-related(a)||a.index-b.index).slice(0,3);
}

function fieldURL(field,country,locale){
 const c=checkedCountry(country),f=checkedSubject(field);
 const params=new URLSearchParams(locale==='en'
   ?{country:COUNTRIES[c],field:FIELDS[f]}:{ulke:c,alan:f});
 return href(cataloguePath,locale)+'?'+params.toString();
}

function universityDiscovery(school,locale,catalog){
 const c=COPY[locale],peers=choosePeers(catalog,school);
 if(peers.length<2)fail('Not enough other schools in '+school.country);
 const country=countryPath(school.country);
 const list=peers.map(x=>linkHTML(universityPath(x.slug),x.name,locale,'discovery-item')).join('');
 const fields=school.themes.slice(0,3).map(field=>'<a class="discovery-field" href="'
   +escapeHTML(fieldURL(field,school.country,locale))+'">'+escapeHTML(fieldLabel(field,locale))+'</a>').join('');
 return '<section class="section shell discovery-university" aria-label="'+c.universityHead+'">'
   +'<div class="discovery-heading"><div><div class="eyebrow red">'+c.universityEyebrow+'</div>'
   +'<h2 class="serif">'+c.universityHead+'</h2><p>'+c.universityDescription+'</p></div></div>'
   +'<div class="discovery-links">'+list+'</div>'
   +'<div class="discovery-shortcuts">'
   +linkHTML(country,c.countryGuide,locale,'text-link')
   +linkHTML(country+'dil-programlari/',c.languagePrograms,locale,'text-link')
   +linkHTML(country+'yaz-okullari/',c.summerSchools,locale,'text-link')
   +linkHTML('/programlar/',c.allPrograms,locale,'text-link')
   +'</div>'
   +'<div class="discovery-field-row"><strong>'+c.relatedFields+'</strong>'+fields+'</div>'
   +'<p class="discovery-disclaimer">'+c.fieldDisclaimer+'</p></section>';
}

function representativeSchools(catalog,field){
 const matched=catalog.filter(s=>s.themes.includes(checkedSubject(field)));
 if(matched.length<3)fail('Insufficient verified subject matches '+field);
 const countries=new Set(),picked=[];
 for(const school of matched){
  if(!countries.has(school.country)){picked.push(school);countries.add(school.country);}
  if(picked.length===3)break;
 }
 for(const school of matched){
  if(picked.length===3)break;
  if(!picked.includes(school))picked.push(school);
 }
 return picked;
}

function programDiscovery(locale,catalog){
 const c=COPY[locale];
 const cards=PROGRAM_SUBJECTS.map(field=>{
  const schools=representativeSchools(catalog,field);
  const filter=new URLSearchParams(locale==='en'?{field:FIELDS[field]}:{alan:field}).toString();
  return '<article class="discovery-program-card"><h3>'+escapeHTML(fieldLabel(field,locale))+'</h3>'
    +'<div class="discovery-program-schools">'+schools.map(s=>linkHTML(universityPath(s.slug),s.name,locale)).join('')+'</div>'
    +'<a class="text-link" href="'+href(cataloguePath,locale)+'?'+filter+'">'+c.allField+'</a></article>';
 }).join('');
 return '<section class="section shell discovery-programs"><div class="discovery-heading">'
  +'<div><div class="eyebrow red">'+c.programsEyebrow+'</div><h2 class="serif">'+c.programsHead+'</h2>'
  +'<p>'+c.programsDescription+'</p></div></div>'
  +'<div class="discovery-program-grid">'+cards+'</div><p class="discovery-disclaimer">'+c.fieldDisclaimer+'</p></section>';
}

/**
 * Expects a TR or already-translated EN HTML snapshot and its canonical TR route.
 * Removes its own section on repeated runs, replaces the single breadcrumb, and
 * inserts discoverable static anchors before </main> or after the country hero.
 */
export function enrichDiscoveryPage(source,trPath,locale,catalog){
 if(!ROUTE_PAIRS.some(x=>x.trPath===trPath))fail('Unregistered route '+trPath);
 if(!['tr','en'].includes(locale))fail('Invalid locale '+locale);
 if(!Array.isArray(catalog)||catalog.length!==UNIVERSITIES.length)fail('Invalid catalog');
 let html=source.replace(/<!-- discovery-section:start -->[\s\S]*?<!-- discovery-section:end -->/g,'')
   .replace(/<script type="application\/ld\+json" data-discovery-breadcrumb>[\s\S]*?<\/script>/g,'');
 if(trPath!=='/'){
  const original=/<(?:div|nav) class="breadcrumb"[^>]*>[\s\S]*?<\/(?:div|nav)>/;
  if(!original.test(html))fail('Existing breadcrumb missing '+trPath);
  const b=breadcrumbMarkup(trPath,locale,catalog);
  html=html.replace(original,b.html);
  html=html.replace('</head>',b.structured+'</head>');
 }
 let section='';
 if(/^\/ulkeler\/[^/]+\/$/.test(trPath)){
  section=countryDiscovery(trPath.split('/')[2],locale,catalog);
 }else if(trPath.startsWith('/universiteler/')){
  const slug=trPath.split('/')[2],school=catalog.find(x=>x.slug===slug);
  if(!school)fail('Missing catalog university '+slug);
  section=universityDiscovery(school,locale,catalog);
 }else if(trPath==='/programlar/'){
  section=programDiscovery(locale,catalog);
 }
 if(section){
  const marked='<!-- discovery-section:start -->'+section+'<!-- discovery-section:end -->';
  if(/^\/ulkeler\/[^/]+\/$/.test(trPath)){
   const m=/<main>[\s\S]*?<\/section>/.exec(html);
   if(!m)fail('Country hero section missing '+trPath);
   const position=m.index+m[0].length;
   html=html.slice(0,position)+marked+html.slice(position);
  }else{
   if(!html.includes('</main>'))fail('Missing main in '+trPath);
   html=html.replace('</main>',marked+'</main>');
  }
 }
 return html;
}
