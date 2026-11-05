/**
 * Bilingual source-backed China pilot. Preserve existing design, forms and SEO.
 * Generate the two Chinese programme page pairs after i18n but before discovery.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const data=JSON.parse(readFileSync(new URL('../content/china-program-pilot.json',import.meta.url),'utf8'));
const escapeText=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const marker=/<!-- china-program-guide:start -->[\s\S]*?<!-- china-program-guide:end -->/g;
const beforeUniversities='<section class="section shell rule"><div class="section-head">';

function verifySource(input){
  const url=new URL(input);
  if(url.protocol!=='https:'||url.username||url.password||![
    'tsinghua.edu.cn','pku.edu.cn','fudan.edu.cn'
  ].some(host=>url.hostname===host||url.hostname.endsWith('.'+host))){
    throw new Error('Source is not an official university domain: '+input);
  }
  return url.href;
}
function guide(type,locale){
  const entry=data.content[type][locale],esc=escapeText;
  if(!entry||entry.cards.length!==3||entry.steps.length!==4)throw new Error('Missing content: '+type+' '+locale);
  const headId='china-'+type+'-verified-programs';
  const cards=entry.cards.map((c,i)=>{
    if(c.length!==7)throw new Error('Malformed card: '+type+' '+locale+' '+i);
    const [institution,status,heading,summary,details,source,label]=c;
    const url=verifySource(source);
    return '<article class="school-card" data-china-program="'+(i+1)+'">'
      +'<div class="top"><span class="eyebrow red">'+esc(status)+'</span></div>'
      +'<h3>'+esc(institution)+'</h3>'
      +'<p><strong>'+esc(heading)+'</strong></p>'
      +'<p style="margin-top:14px">'+esc(summary)+'</p>'
      +'<p style="margin-top:12px">'+esc(details)+'</p>'
      +'<a class="text-link link" href="'+esc(url)+'" target="_blank" rel="noopener noreferrer">'+esc(label)+'</a>'
      +'</article>';
  }).join('');
  const steps=entry.steps.map((text,i)=>'<div class="step"><strong>'+String(i+1).padStart(2,'0')+'</strong><p>'+esc(text)+'</p></div>').join('');
  return '<!-- china-program-guide:start -->'
    +'<section class="section shell rule" data-china-guide="'+type+'" data-source-verified="'+esc(data.verifiedOn)+'" aria-labelledby="'+headId+'">'
    +'<div class="section-head"><div><div class="eyebrow red">'+esc(entry.eyebrow)+'</div>'
    +'<h2 class="serif" id="'+headId+'">'+esc(entry.title)+'</h2></div>'
    +'<p>'+esc(entry.lead)+'</p></div>'
    +'<div class="card-grid">'+cards+'</div>'
    +'<p class="note-box" style="margin-top:26px">'+esc(entry.note)+'</p>'
    +'</section>'
    +'<section class="section shell rule" aria-labelledby="'+headId+'-steps">'
    +'<div class="country-intro"><div><div class="eyebrow red">'+(locale==='tr'?'Karar rehberi':'Decision guide')+'</div>'
    +'<h2 class="serif" id="'+headId+'-steps">'+esc(entry.stepTitle)+'</h2></div>'
    +'<div><p>'+esc(entry.stepIntro)+'</p><div class="steps guide-steps">'+steps+'</div></div></div>'
    +'</section>'
    +'<!-- china-program-guide:end -->';
}

let applied=0;
for(const [type,slug] of [['language','dil-programlari'],['summer','yaz-okullari']]){
  for(const locale of ['tr','en']){
    const file=join(dist,locale==='en'?'en':'','ulkeler','cin',slug,'index.html');
    let html=readFileSync(file,'utf8').replace(marker,'');
    if(html.includes('<!-- china-program-guide:'))throw new Error('Unbalanced guide marker: '+file);
    if(html.split(beforeUniversities).length!==2)throw new Error('University cards anchor changed: '+file);
    html=html.replace(beforeUniversities,guide(type,locale)+beforeUniversities);
    if((html.match(/<!-- china-program-guide:start -->/g)||[]).length!==1)throw new Error('Wrong guide count: '+file);
    writeFileSync(file,html);
    applied++;
  }
}
if(applied!==4)throw new Error('Expected four bilingual Chinese programme pages');
console.log('Enriched 4 TR/EN China programme pages with verified dated university notices.');
