/**
 * Site delivery optimization; runs AFTER optimize-images.mjs.
 * All assets are already local. Does not alter form scripts, SEO URLs or copy.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ROUTE_PAIRS } from '../workers/shared/routes.mjs';

const dist=fileURLToPath(new URL('../dist/',import.meta.url));
const names=['tsinghua','tohoku','kyungbok','nus','polyu'];
const latin='U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD';
const latinExt='U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF';
const fontFaces=[
  ['DM Sans','400 700','dm-sans-latin-ext-v17.woff2',latinExt],
  ['DM Sans','400 700','dm-sans-latin-v17.woff2',latin],
  ['Jost','400 600','jost-latin-ext-v20.woff2',latinExt],
  ['Jost','400 600','jost-latin-v20.woff2',latin]
];
const cssFile=join(dist,'site.css');
let css=readFileSync(cssFile,'utf8');
if (!css.includes('/* Local font subsets (OFL 1.1) */')) {
  css='/* Local font subsets (OFL 1.1) */\n'+
    fontFaces.map(([name,weight,file,range])=>
      "@font-face { font-family: '"+name+"'; font-style: normal; font-weight: "+
      weight+"; font-display: swap; src: url('/assets/fonts/"+file+
      "') format('woff2'); unicode-range: "+range+"; }"
    ).join('\n')+'\n'+css;
}
if(!css.includes('.featured-photo > picture {')){
  css+='\n/* Preserve featured card geometry with responsive picture. */\n'+
    '.featured-photo > picture { display: block; width: 100%; height: 100%; }\n';
}
writeFileSync(cssFile,css);

let htmlCount=0,featuredCount=0;
for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
  const file=join(dist,locale==='en'?'en':'',trPath.slice(1),'index.html');
  let s=readFileSync(file,'utf8');
  // Eliminate the render-blocking Google Fonts CSS request and cross-origin DNS/TLS.
  s=s.replace(/<link\b(?=[^>]*https:\/\/fonts\.(?:googleapis|gstatic)\.com)[^>]*>/gi,'');
  if(s.includes('fonts.googleapis.com')||s.includes('fonts.gstatic.com')) {
    throw new Error('External font resource still in '+file);
  }
  if(trPath==='/'){
    let updated=0;
    s=s.replace(
      /(<div class="featured-photo">)(<img\b[^>]*\bsrc="\/assets\/universities\/([a-z-]+)\.jpg"[^>]*>)/g,
      (whole,start,img,slug)=>{
        if(!names.includes(slug))throw new Error('Unknown featured photo '+slug);
        updated++;
        const fallback=img.replace(/\sloading="[^"]*"/g,'')
          .replace(/>$/, ' loading="lazy" decoding="async" fetchpriority="low">');
        const asset='/assets/optimized/'+slug;
        return start+'<picture data-responsive-featured="1">'+
          '<source type="image/webp" srcset="'+asset+'-480.webp 480w, '+
          asset+'-960.webp 960w" sizes="(max-width: 600px) 88vw, '+
          '(max-width: 1140px) 44vw, 400px">'+fallback+'</picture>';
      }
    );
    const count=(s.match(/data-responsive-featured="1"/g)||[]).length;
    if(count!==names.length || (updated!==0&&updated!==names.length)){
      throw new Error('Featured photo mismatch for '+locale+': '+updated+' new, '+count+' total');
    }
    featuredCount+=count;
  }
  writeFileSync(file,s);
  htmlCount++;
}
console.log('Optimized fonts on '+htmlCount+' pages and '+featuredCount+
  ' responsive featured cards; original JPEGs retained as fallback.');
