/**
 * Curated per-route SEO summaries, based only on existing page content.
 * Runs after generate-en.mjs; intentionally changes HTML head metadata only.
 * Do not claim open programs, admission, prices, rankings or scholarships.
 */
import {readFileSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {ROUTE_PAIRS} from '../workers/shared/routes.mjs';

const root=fileURLToPath(new URL('../dist/',import.meta.url));
const DESCRIPTIONS={
  "tr": {
    "/ulkeler/": "Çin, Japonya, Güney Kore, Singapur ve Hong Kong'da eğitim seçeneklerini ülke rehberleri ve üniversite profilleriyle karşılaştırın.",
    "/okullar/": "Çin, Japonya, Güney Kore, Singapur ve Hong Kong'daki üniversiteleri ülke ve akademik alanlara göre keşfedin, okul profillerini inceleyin.",
    "/programlar/": "Asya'da mühendislik, teknoloji, işletme, sağlık, sosyal bilimler ve tasarım alanlarıyla ilişkili üniversite profillerini keşfedin.",
    "/on-gorusme/": "Asya'da Eğitim ile ücretsiz ön görüşme talebi oluşturun; ülke, akademik alan ve eğitim hedeflerinizi paylaşarak seçenekleri değerlendirin.",
    "/ulkeler/cin/dil-programlari/": "Çin'de dil programları: Mandarin hazırlığı, İngilizce eğitim koşulları ve HSK gerekliliklerini üniversite seçimiyle birlikte inceleyin.",
    "/ulkeler/cin/yaz-okullari/": "Çin'de yaz okulları için kısa dönem akademik ve kültürel programları; eğitim dili, yaş koşulları ve konaklama açısından inceleyin.",
    "/ulkeler/japonya/dil-programlari/": "Japonya'da Japonca dil okulları, üniversiteye hazırlık seçenekleri ve İngilizce programların dil koşullarını birlikte karşılaştırın.",
    "/ulkeler/japonya/yaz-okullari/": "Japonya'daki araştırma, dil ve kültür odaklı yaz okullarını; program takvimi, süre ve başvuru şartları açısından değerlendirin.",
    "/ulkeler/guney-kore/dil-programlari/": "Güney Kore'de Korece dil merkezlerini, TOPIK hedeflerini ve İngilizce programların dil yeterlilik koşullarını inceleyin.",
    "/ulkeler/guney-kore/yaz-okullari/": "Güney Kore'de yaz okullarında Korece dersleri, akademik alan dersleri ve kredi koşullarını karşılaştırarak seçenekleri keşfedin.",
    "/ulkeler/singapur/dil-programlari/": "Singapur'da İngilizce akademik hazırlık seçeneklerini ve üniversitelerin kabul ettiği dil yeterlilik belgelerini okul bazında inceleyin.",
    "/ulkeler/singapur/yaz-okullari/": "Singapur'da kısa dönem üniversite yaz okullarını; ders içerikleri, kredi aktarımı ve konaklama seçenekleri açısından değerlendirin.",
    "/ulkeler/hong-kong/dil-programlari/": "Hong Kong'da İngilizce eğitim, program düzeyindeki dil şartları ve yerel dil seçeneklerini üniversitelere göre karşılaştırın.",
    "/ulkeler/hong-kong/yaz-okullari/": "Hong Kong'da yaz okullarını; akademik dersler, başvuru takvimleri ve kampüs yaşamı bakımından inceleyin ve karşılaştırın."
  },
  "en": {
    "/ulkeler/cin/dil-programlari/": "Language programs in China: compare Mandarin preparation, HSK requirements and language conditions for English-taught degrees.",
    "/ulkeler/cin/yaz-okullari/": "Summer schools in China: explore short academic and cultural programs, teaching languages, age requirements and accommodation.",
    "/ulkeler/japonya/dil-programlari/": "Language programs in Japan: explore Japanese language schools, university preparation and requirements for English-taught degrees.",
    "/ulkeler/japonya/yaz-okullari/": "Summer schools in Japan: explore research, language and cultural programs, schedules and application requirements.",
    "/ulkeler/guney-kore/dil-programlari/": "Language programs in South Korea: compare Korean language centres, TOPIK goals and English-language admission requirements.",
    "/ulkeler/guney-kore/yaz-okullari/": "Summer schools in South Korea: compare Korean language classes, academic subjects and credit arrangements on campus.",
    "/ulkeler/singapur/dil-programlari/": "Language programs in Singapore: check English academic preparation and accepted proficiency tests at each university.",
    "/ulkeler/singapur/yaz-okullari/": "Summer schools in Singapore: examine short university courses, credit transfer and accommodation options.",
    "/ulkeler/hong-kong/dil-programlari/": "Language programs in Hong Kong: review English-medium instruction, course-specific language requirements and local options.",
    "/ulkeler/hong-kong/yaz-okullari/": "Summer schools in Hong Kong: compare academic courses, application schedules and the campus experience."
  }
};

const knownRoutes=new Set(ROUTE_PAIRS.map(({trPath})=>trPath));
for(const [locale,descriptions] of Object.entries(DESCRIPTIONS)){
  const paths=Object.keys(descriptions);
  const expected=locale==='tr'?14:10;
  if(paths.length!==expected)throw new Error(locale+' description inventory: expected '+expected+', got '+paths.length);
  for(const path of paths)if(!knownRoutes.has(path))throw new Error('Unregistered SEO description path: '+locale+' '+path);
}
const escapeAttribute=value=>value.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const tags=[
  ['description',/(<meta name="description" content=")([^"]*)(")/g],
  ['og:description',/(<meta property="og:description" content=")([^"]*)(")/g],
  ['twitter:description',/(<meta name="twitter:description" content=")([^"]*)(")/g]
];
let updated=0;
for(const {trPath} of ROUTE_PAIRS)for(const locale of ['tr','en']){
  const description=DESCRIPTIONS[locale][trPath];
  if(!description)continue;
  if(description.length<75||description.length>175)throw new Error('Unexpected description length: '+locale+' '+trPath);
  const path=join(root,locale==='en'?'en':'',trPath.slice(1),'index.html');
  let html=readFileSync(path,'utf8');
  for(const [label,pattern] of tags){
    let count=0;
    html=html.replace(pattern,(_match,before,_old,after)=>{
      count++;
      return before+escapeAttribute(description)+after;
    });
    if(count!==1)throw new Error('Expected one '+label+' at '+locale+' '+trPath+', got '+count);
  }
  writeFileSync(path,html);
  updated++;
}
if(updated!==24)throw new Error('SEO descriptions updated '+updated+' instead of 24');
console.log('Set 24 curated TR/EN meta, Open Graph and Twitter descriptions.');
