/**
 * Source-backed bilingual China university profiles, 2027 intake pilot.
 * Existing compact CSS, form, TOC anchors, university images and SEO stay intact.
 * Runs after generate-en; replaces generated text in both locales idempotently.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const info=JSON.parse(readFileSync(new URL('../content/china-university-profiles-2027.json',import.meta.url),'utf8'));
const h=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const sourceAllowed=url=>{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.username||u.password||!['tsinghua.edu.cn','join-tsinghua.edu.cn','pku.edu.cn','fudan.edu.cn'].some(x=>u.hostname===x||u.hostname.endsWith('.'+x)))throw Error('Not university official source: '+url);
  return u.href;
};
const external=(p,k,label)=>{
  const url=p.sources[k];
  if(!url)throw Error('Unknown source '+k);
  return '<a class="text-link" href="'+h(sourceAllowed(url))+'" target="_blank" rel="noopener noreferrer">'+h(label)+'</a>';
};
const links=(p,items)=>'<div class="source-actions profile-2027-links">'+items.map(([label,key])=>external(p,key,label)).join('')+'</div>';
function replaceFirstLead(html,id,text){
  const re=new RegExp('(<section id="'+id+'"[^>]*>[\\s\\S]*?<h2>[\\s\\S]*?<\\/h2>\\s*)<p>[\\s\\S]*?<\\/p>');
  if(!re.test(html))throw Error('Missing section lead '+id);
  return html.replace(re,(_,start)=>start+'<p>'+h(text)+'</p>');
}
function sectionAcademic(p,d,slug,locale){
  const fields=d.fields.map(([label,description],i)=>'<div class="field-card"><span class="eyebrow red">'+String(i+1).padStart(2,'0')+' / '+(locale==='tr'?'seçenek':'option')+'</span><strong>'+h(label)+'</strong><p>'+h(description)+'</p></div>').join('');
  return '<section id="akademik" class="profile-2027" data-university-profile="'+h(slug)+'" data-reviewed-at="'+info.reviewedOn+'">'
    +'<div class="eyebrow red">02 / '+(locale==='tr'?'Programlar ve öğretim dili':'Programmes and teaching language')+'</div>'
    +'<h2>'+h(d.academicTitle)+'</h2><p>'+h(d.academicLead)+'</p>'
    +'<div class="field-grid profile-2027-fields">'+fields+'</div>'
    +'<p class="note-box">'+h(d.academicNote)+'</p>'
    +links(p,d.academicLinks)+'</section>';
}
function sectionAdmissions(p,d,slug,locale){
  const steps=d.steps.map(([label,description])=>'<div class="step"><strong>'+h(label)+'</strong><p>'+h(description)+'</p></div>').join('');
  const tr=locale==='tr',langPath=tr?'/ulkeler/cin/dil-programlari/':'https://educationinasia.com/destinations/china/language-programs/',summerPath=tr?'/ulkeler/cin/yaz-okullari/':'https://educationinasia.com/destinations/china/summer-schools/';
  return '<section id="basvuru" class="profile-2027" data-university-profile="'+h(slug)+'" data-reviewed-at="'+info.reviewedOn+'">'
    +'<div class="eyebrow red">04 / '+(tr?'Kabul ve maliyet':'Admissions and costs')+'</div>'
    +'<h2>'+h(d.admissionsTitle)+'</h2><p>'+h(d.admissionsLead)+'</p>'
    +'<div class="steps profile-2027-steps">'+steps+'</div>'
    +'<div class="note-box">'+h(d.note)+'</div>'
    +'<h3 class="serif profile-2027-subtitle">'+h(d.fundingTitle)+'</h3>'
    +'<p>'+h(d.fundingText)+'</p>'+links(p,d.fundingLinks)
    +'<div class="profile-2027-related"><strong>'+h(d.relatedTitle)+'</strong><p>'+h(d.relatedText)+'</p>'
    +'<div class="source-actions profile-2027-links"><a class="text-link" href="'+h(langPath)+'">'+(tr?'Çin dil programları':'Chinese language programmes')+'</a>'
    +'<a class="text-link" href="'+h(summerPath)+'">'+(tr?'Çin yaz okulları':'Summer schools in China')+'</a></div></div></section>';
}
let count=0;
for(const [slug,p]of Object.entries(info.profiles)){
  for(const locale of ['tr','en']){
    const d=p[locale];
    if(!d||d.fields.length!==3||d.steps.length!==4)throw Error('Incomplete '+slug+' '+locale);
    const path=join(root,locale==='en'?'en':'','universiteler',slug,'index.html');
    let html=readFileSync(path,'utf8');
    const heroRe=/(<h1 class="serif">[\s\S]*?<\/h1>)<p>[\s\S]*?<\/p>/;
    if(!heroRe.test(html))throw Error('No profile hero '+slug+' '+locale);
    html=html.replace(heroRe,(_,heading)=>heading+'<p>'+h(d.hero)+'</p>');
    html=replaceFirstLead(html,'genel-bakis',d.overview);
    html=replaceFirstLead(html,'kampus',d.campus);
    for(const [id,content]of [['akademik',sectionAcademic(p,d,slug,locale)],['basvuru',sectionAdmissions(p,d,slug,locale)]]){
      const re=new RegExp('<section id="'+id+'"[^>]*>[\\s\\S]*?<\\/section>');
      if(!re.test(html))throw Error('Missing '+id+' in '+slug+' '+locale);
      html=html.replace(re,content);
      if((html.match(new RegExp('<section id="'+id+'"','g'))||[]).length!==1)throw Error('Duplicate '+id+' '+slug+' '+locale);
    }
    if(locale==='tr')html=html.replace(/Pekin’da eğitim\./g,'Pekin’de eğitim.').replace(/Çin’da Eğitim/g,'Çin’de Eğitim');
    if((html.match(/data-university-profile=/g)||[]).length!==2)throw Error('Unexpected enriched section count '+slug+' '+locale);
    writeFileSync(path,html);
    count++;
  }
}
if(count!==6)throw Error('Expected six university profiles');
console.log('Enriched six 2027 China university profiles using official source-backed TR/EN admissions, programmes and scholarship guidance.');
