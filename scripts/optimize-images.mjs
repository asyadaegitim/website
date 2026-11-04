/**
 * Cloud-only build-time image optimization for both public websites.
 *
 * Originals are kept in assets/universities for fallback, rollback, and other
 * pages. Only the homepage's five campus panels are converted to responsive
 * <picture> sources. No visitor-side processing or external image CDN.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));
const assets = join(dist, 'assets');
const optimized = join(assets, 'optimized');
const campuses = ['tsinghua', 'tohoku', 'kyungbok', 'nus', 'polyu'];
const widths = [480, 960];
const sizes = '(max-width: 600px) 82vw, (max-width: 1140px) 44vw, 38vw';
mkdirSync(optimized, { recursive: true });

let originalTotal = 0;
let derivativeTotal = 0;
for (const slug of campuses) {
  const original = join(assets, 'universities', slug + '.jpg');
  originalTotal += statSync(original).size;
  for (const width of widths) {
    const out = join(optimized, slug + '-' + width + '.webp');
    await sharp(original).rotate()
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 78, effort: 4 })
      .toFile(out);
    derivativeTotal += statSync(out).size;
  }
}
const spriteJpeg = join(assets, 'ieft-university-logos.jpeg');
const spriteWebp = join(assets, 'ieft-university-logos.webp');
const spriteSize = statSync(spriteJpeg).size;
await sharp(spriteJpeg).webp({ quality: 88, effort: 4 }).toFile(spriteWebp);

for (const locale of ['tr', 'en']) {
  const path = locale === 'tr' ? join(dist, 'index.html') : join(dist, 'en', 'index.html');
  let html = readFileSync(path, 'utf8');
  let updated = 0;
  html = html.replace(
    /(<a class="hero-panel"[^>]*>\s*)(<img\b[^>]*\bsrc="\/assets\/universities\/([a-z-]+)\.jpg"[^>]*>)/g,
    (full, anchor, image, slug) => {
      if (!campuses.includes(slug)) throw new Error('Unexpected hero photo: ' + slug);
      updated++;
      const first = slug === campuses[0];
      const fallback = image
        .replace(/\sloading="[^"]*"/g, '')
        .replace(/>$/, ' loading="' + (first ? 'eager' : 'lazy') +
          '" decoding="async" fetchpriority="' + (first ? 'high' : 'low') + '">');
      const prefix = '/assets/optimized/' + slug;
      return anchor + '<picture data-responsive-hero="1">' +
        '<source type="image/webp" srcset="' + prefix + '-480.webp 480w, ' +
        prefix + '-960.webp 960w" sizes="' + sizes + '">' +
        fallback + '</picture>';
    }
  );
  const count = (html.match(/data-responsive-hero="1"/g) || []).length;
  if (count !== campuses.length || (updated !== 0 && updated !== campuses.length)) {
    throw new Error(locale + ' homepage hero mismatch: ' + updated + ' replacements, ' + count + ' total');
  }
  writeFileSync(path, html);
}
const cssPath = join(dist, 'site.css');
let css = readFileSync(cssPath, 'utf8')
  .replaceAll('.hero-panel > img', '.hero-panel > picture > img')
  .replaceAll('.hero-panel:hover > img', '.hero-panel:hover > picture > img')
  .replace("url('/assets/ieft-university-logos.jpeg')", "url('/assets/ieft-university-logos.webp')");
if (!css.includes('.hero-panel > picture {')) {
  css += '\n/* Responsive hero photo wrapper: preserve original accordion layout. */\n' +
    '.hero-panel > picture { display: block; width: 100%; height: 100%; }\n';
}
if (!css.includes("url('/assets/ieft-university-logos.webp')")) {
  throw new Error('Sprite optimization CSS was not applied');
}
writeFileSync(cssPath, css);
console.log('Optimized 5 homepage campus photographs into 480/960px WebP variants (' +
  Math.round(originalTotal / 1024) + ' KiB original, ' +
  Math.round(derivativeTotal / 1024) + ' KiB for all 10 derivatives); logo sprite ' +
  Math.round(spriteSize / 1024) + ' -> ' +
  Math.round(statSync(spriteWebp).size / 1024) + ' KiB.');
