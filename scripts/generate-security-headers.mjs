import {writeFileSync} from 'node:fs';
import {staticAssetsHeaders} from '../workers/shared/security.mjs';
writeFileSync(new URL('../dist/_headers',import.meta.url),staticAssetsHeaders());
console.log('Generated shared security headers for Workers Static Assets.');
