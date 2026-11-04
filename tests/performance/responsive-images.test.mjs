import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const dist = fileURLToPath(new URL('../../dist/', import.meta.url));
const photoNames = ['tsinghua', 'tohoku', 'kyungbok', 'nus', 'polyu'];
const load = p => readFileSync(join(dist, p), 'utf8');

for (const [locale, homepage] of [['tr', 'index.html'], ['en', 'en/index.html']]) {
  test(locale + ' homepage uses five WebP picture sources with JPEG fallback', () => {
    const html = load(homepage);
    assert.equal((html.match(/<picture data-responsive-hero="1">/g) || []).length, 5);
    for (const slug of photoNames) {
      assert.match(html, new RegExp('srcset="/assets/optimized/' + slug +
        '-480\\.webp 480w, /assets/optimized/' + slug + '-960\\.webp 960w"'));
      assert.match(html, new RegExp('src="/assets/universities/' + slug + '\\.jpg"'));
    }
    assert.equal((html.match(/fetchpriority="high"/g) || []).length, 1);
    assert.equal((html.match(/fetchpriority="low"/g) || []).length, 4);
    assert.equal((html.match(/loading="lazy" decoding="async"/g) || []).length >= 4, true);
  });
}

test('responsive WebP files are valid, bounded in width, smaller than source JPG', async () => {
  for (const slug of photoNames) {
    const source = join(dist, 'assets/universities', slug + '.jpg');
    const sourceBytes = statSync(source).size;
    for (const width of [480, 960]) {
      const file = join(dist, 'assets/optimized', slug + '-' + width + '.webp');
      const image = await sharp(file).metadata();
      assert.equal(image.format, 'webp');
      assert.ok(image.width <= width);
      assert.ok(image.width > 0 && image.height > 0);
      assert.ok(statSync(file).size < sourceBytes, slug + ' ' + width + ' should save bytes');
    }
  }
});

test('logo sprite preserves dimensions and CSS cropping coordinates', async () => {
  const jpeg = join(dist, 'assets/ieft-university-logos.jpeg');
  const webp = join(dist, 'assets/ieft-university-logos.webp');
  const [oldMeta, newMeta] = await Promise.all([sharp(jpeg).metadata(), sharp(webp).metadata()]);
  assert.equal(newMeta.width, oldMeta.width);
  assert.equal(newMeta.height, oldMeta.height);
  assert.equal(newMeta.format, 'webp');
  assert.ok(statSync(webp).size < statSync(jpeg).size);
  const css = load('site.css');
  assert.match(css, /background-image: url\('\/assets\/ieft-university-logos\.webp'\)/);
  assert.match(css, /\.hero-panel > picture \{ display: block; width: 100%; height: 100%; \}/);
});

test('image build changes no consultation or CRM transport', () => {
  const script = readFileSync(fileURLToPath(new URL('../../scripts/optimize-images.mjs', import.meta.url)), 'utf8');
  assert.doesNotMatch(script, /formsubmit\.co|hubspot\.com|\/on-gorusme\/|\/free-consultation\//);
});
