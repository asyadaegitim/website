/**
 * Accessible, local, source-credited campus photo galleries for the three
 * verified China university profiles. Both locales; safe to run repeatedly.
 * Replaces only the profile hero's existing image/logo art, never navigation,
 * admissions content, URLs, metadata, or forms.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../dist/',import.meta.url));
const manifest=JSON.parse(readFileSync(new URL('../content/university-gallery-media.json',import.meta.url),'utf8'));
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
const existing=/<div class="campus-gallery"[\s\S]*?<!-- campus-gallery:end -->/;
const original=/<div class="detail-(?:campus|logo-art)">[\s\S]*?<\/div>/;
function markup(slug,group,locale){
 const en=locale==='en',h=esc;
 const pictures=group.images;
 if(pictures.length<2||pictures.length>8)throw Error('Insufficient pictures '+slug);
 const url=file=>'/assets/campus-galleries/'+file;
 const first=pictures[0];
 const mainLabel=en?'Enlarge photo':'Fotoğrafı büyüt';
 const control=(action,sign,label)=>'<button class="campus-gallery-arrow campus-gallery-'+action+'" type="button" data-gallery-'+action+' aria-label="'+h(label)+'">'+sign+'</button>';
 const thumbs=pictures.map((p,i)=>{
  if(!/^[a-z0-9-]+\.webp$/.test(p.file))throw Error('Invalid photo filename '+p.file);
  const originalUrl=new URL(p.source),licenseUrl=new URL(p.licenseUrl);
  if(originalUrl.hostname!=='commons.wikimedia.org'||licenseUrl.hostname!=='creativecommons.org')throw Error('Unapproved photo credit URL '+slug+' '+i);
  return '<button class="campus-gallery-thumb" type="button" data-gallery-item data-image="'+h(url(p.file))+'" data-alt="'+h(en?p.en:p.tr)+'" data-artist="'+h(p.artist)+'" data-license="'+h(p.license)+'" data-source="'+h(p.source)+'" data-license-url="'+h(p.licenseUrl)+'" aria-label="'+h((en?'Show photo ':'Fotoğrafı göster ')+(i+1))+'" aria-pressed="'+(i===0?'true':'false')+'">'
  +'<img src="'+h(url(p.file))+'" width="150" height="96" loading="lazy" decoding="async" alt=""></button>';
 }).join('');
 const credit=(en?'Photo: ':'Fotoğraf: ')+first.artist;
 return '<div class="campus-gallery" data-campus-gallery data-university="'+h(slug)+'" aria-label="'+h(group.name+(en?' campus photo gallery':' kampüs fotoğraf galerisi'))+'">'
  +'<div class="campus-gallery-stage">'
  +'<button type="button" class="campus-gallery-view" data-gallery-enlarge aria-label="'+h(mainLabel)+'">'
  +'<img data-gallery-main src="'+h(url(first.file))+'" alt="'+h(en?first.en:first.tr)+'" width="1100" height="740" loading="eager" decoding="async" fetchpriority="high">'
  +'<span class="campus-gallery-expand" aria-hidden="true">⤢</span></button>'
  +control('prev','‹',en?'Previous photo':'Önceki fotoğraf')+control('next','›',en?'Next photo':'Sonraki fotoğraf')
  +'<span class="campus-gallery-brand" aria-hidden="true"><img class="university-logo" src="/assets/university-logos/'+h(slug)+'.png" width="180" height="60" alt="" loading="lazy"></span>'
  +'<span class="campus-gallery-count" data-gallery-count>1 / '+pictures.length+'</span>'
  +'</div><div class="campus-gallery-thumbs" role="group" aria-label="'+(en?'Choose campus photo':'Kampüs fotoğrafını seç')+'">'+thumbs+'</div>'
  +'<div class="campus-gallery-attribution"><span data-gallery-description>'+h(en?first.en:first.tr)+'</span>'
  +'<div><a data-gallery-source href="'+h(first.source)+'" target="_blank" rel="noopener noreferrer">'+h(credit)+'</a> · <a data-gallery-license href="'+h(first.licenseUrl)+'" target="_blank" rel="noopener noreferrer">'+h(first.license)+'</a></div></div>'
  +'<dialog class="campus-gallery-dialog" aria-label="'+(en?'Campus photo enlargement':'Büyütülmüş kampüs fotoğrafı')+'">'
  +'<button type="button" class="campus-gallery-close" data-gallery-close aria-label="'+(en?'Close photo':'Fotoğrafı kapat')+'">×</button>'
  +'<img data-gallery-modal-image alt="" width="1100" height="740">'
  +'<p data-gallery-modal-caption></p></dialog>'
  +'</div><!-- campus-gallery:end -->';
}
let updated=0;
for(const [slug,group] of Object.entries(manifest.universities)){
 for(const locale of ['tr','en']){
  const file=join(root,locale==='en'?'en':'','universiteler',slug,'index.html');
  let html=readFileSync(file,'utf8');
  const start=html.indexOf('<div class="detail-hero">'),end=html.indexOf('</section>',start);
  if(start<0||end<0)throw Error('University hero not found '+file);
  const hero=html.slice(start,end);
  const re=existing.test(hero)?existing:original;
  if(!re.test(hero))throw Error('No replaceable hero art '+file);
  const target=hero.match(re);
  const replaced=hero.replace(re,markup(slug,group,locale));
  if((replaced.match(/data-campus-gallery\b/g)||[]).length!==1)throw Error('Bad gallery count '+file);
  html=html.slice(0,start)+replaced+html.slice(end);
  writeFileSync(file,html);updated++;
 }
}
if(updated!==6)throw Error('Expected 6 gallery pages');
console.log('Installed six bilingual three-photo university galleries, all sources locally optimized with credit links.');
