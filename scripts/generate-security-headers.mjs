import {writeFileSync} from 'node:fs';
import {staticAssetsHeaders} from '../workers/shared/security.mjs';
const headers=staticAssetsHeaders()+
  '\n/assets/fonts/*\n  Cache-Control: public, max-age=31536000, immutable\n';
writeFileSync(new URL('../dist/_headers',import.meta.url),headers);
console.log('Generated shared security headers with immutable versioned local fonts.');
