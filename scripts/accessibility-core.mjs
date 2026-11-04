/**
 * Static keyboard-navigation accessibility pass for bilingual pages.
 * Preserve all canonical content, destination URLs, form markup and field values.
 */
const COPY={
 tr:{
  skip:'Ana içeriğe geç',
  tr:'Türkçe sürüm (mevcut sayfa)',
  en:'İngilizce sürüme geç'
 },
 en:{
  skip:'Skip to main content',
  tr:'Switch to Turkish',
  en:'English version (current page)'
 }
};
const escapeAttribute=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');

export function enrichAccessibilityHTML(source,locale){
 if(!Object.hasOwn(COPY,locale))throw new Error('Unsupported locale '+locale);
 if(typeof source!=='string')throw new Error('Expected HTML source');
 const copy=COPY[locale];
 let html=source.replace(/<a class="skip-link" href="#main-content">[\s\S]*?<\/a>\s*/g,'');
 html=html.replace(/<main id="main-content" tabindex="-1">/g,'<main>');
 const main=[...html.matchAll(/<main\b[^>]*>/g)];
 if(main.length!==1)throw new Error('Expected exactly one main landmark, got '+main.length);
 if(/\bid="main-content"/.test(html))throw new Error('Duplicate main-content identifier');
 html=html.replace(/<main\b[^>]*>/,'<main id="main-content" tabindex="-1">');
 const bodies=[...html.matchAll(/<body\b[^>]*>/g)];
 if(bodies.length!==1)throw new Error('Expected exactly one body');
 html=html.replace(/<body\b[^>]*>/,match=>
  match+'<a class="skip-link" href="#main-content">'+copy.skip+'</a>');
 let replaced=0;
 html=html.replace(/<div class="lang-switch"[\s\S]*?<\/div>/,block=>{
  let count=0;
  const out=block.replace(/<a lang="(tr|en)"([^>]*)>/g,(_tag,destination,attrs)=>{
   count++;
   const sanitized=attrs.replace(/\saria-label="[^"]*"/g,'');
   return '<a lang="'+destination+'"'+sanitized+' aria-label="'+escapeAttribute(copy[destination])+'">';
  });
  if(count!==2)throw new Error('Expected two language links');
  replaced++;
  return out;
 });
 if(replaced!==1)throw new Error('Language selector not found');
 return html;
}
