# Asya’da Eğitim · Atlas

Çin, Hong Kong, Japonya, Güney Kore ve Singapur ülkelerini tanıtan eğitim danışmanlığı web sitesi.

## Depo içeriği

- `dist/`: ChatGPT Sites üzerinde yayınlanan sitenin 17 Ekim 2026 tarihinde alınmış, bağımsız barındırılabilir HTML, CSS, JavaScript, SVG, JPEG ve PNG dosyaları.
- `dist/index.html`: Ana sayfa. Alt sayfalar kendi klasörlerindeki `index.html` dosyalarıdır.

**Kaynak ayrımı:** Bu aktarım yayınlanmış sitenin statik çıktısını içerir. ChatGPT Sites içindeki özgün Python sayfa üreticisi, üniversite veri kaynakları ve `.openai/hosting.json` henüz bu depoya aktarılmamıştır. Bu dosyalar elde edilmedikçe bu repo, Sites projesinin eksiksiz kaynak kodu olarak değerlendirilmemelidir.

## Yerelde açma

```sh
python3 -m http.server 8000 --directory dist
```

Ardından http://localhost:8000 adresini açın. Statik sunucunun yayın kökü `dist/` olmalıdır.

## Kaynak proje

- Canlı yayın: https://asya-egitim-atlas.iakfiratt.chatgpt.site/
- ChatGPT Sites projesi: `appgprj_6abbb39f777c81918fb1842d994630a6`
- Yayın dosyası kopyası: 17 Ekim 2026

Bu GitHub deposuna yapılan değişiklikler mevcut ChatGPT Sites yayınına otomatik yansımaz.

## Güncel iki dilli Cloudflare mimarisi (3 Kasım 2026)

Bu depo **iki ayrı üretim Worker'ının** ve İngilizce ön izleme Worker'ının kaynak kodunu barındırır:

| Dil | Alan adı | Worker | Yapılandırma |
| --- | --- | --- | --- |
| Türkçe | `https://asyadaegitim.com/` | `website` | `wrangler.jsonc` |
| English | `https://educationinasia.com/` | `educationinasia-en` | `wrangler.english.jsonc` |
| English staging | Worker'ın ayrı ön izleme adresi | `educationinasia-en-stage` | `wrangler.english.stage.jsonc` |

* `dist/` Türkçe statik sayfaların kaynaklarını, `dist/en/` ise İngilizce sayfaların **yalnızca iç statik varlıklarını** tutar. İngilizcenin kamusal kanonik URL'leri `educationinasia.com/destinations/china/`, `educationinasia.com/universities/`, `educationinasia.com/free-consultation/` gibi İngilizce yollardır. `asyadaegitim.com/en/` kanonik değildir.
* `workers/shared/routes.mjs` 47 sayfanın iki dilli URL sözleşmesi ve filtre çevirisidir. Kaynaklar değişirse bu sözleşme ve testler birlikte güncellenmelidir.
* `workers/educationinasia-en/worker.js`, `ASSETS` binding üzerinden aynı dağıtımda bulunan İngilizce sayfaları sunar; çalışırken Türkçe kamu sitesine HTTP isteği göndermemelidir. İngilizce logonun kanonik SVG'si bu dosyada korunur.
* `scripts/generate-en.mjs` iki dilin canonical/hreflang, sosyal paylaşım meta verileri ve ayrı `dist/sitemap.xml`, `dist/en-sitemap.xml` dosyalarını oluşturur. Her Wrangler yapılandırmasında `build.command` bu betiği **otomatik** çalıştırır. Bu nedenle kaynak depoda eski statik HTML bulunsa da dağıtılan sürüm üretim sırasında yenilenir.
* `dist/robots.txt` yalnız Türkçe sitemap'i işaret eder; İngilizce Worker kendi `robots.txt` ve `sitemap.xml` çıktısını aynı dağıtımdaki İngilizce sitemap kaynağından sunar.

### Test ve ön izleme

Node.js 20+ ile ek bağımlılık kurmadan:

```sh
npm test
npx wrangler dev --config wrangler.english.stage.jsonc
npx wrangler dev --config wrangler.jsonc
```

`npm test`, öncelikle `node scripts/generate-en.mjs` çalıştırıp daha sonra `node --test tests/seo/*.test.mjs` ile 47 karşılıklı sayfayı, filtreleri ve Worker davranışlarını doğrular. Dosyalar ve test verileri gerçek müşteri bilgisi içermez.

### Kritik yayın sırası ve geri dönüş

1. **Önce İngilizce:** Yeni İngilizce Worker sürümü ayrı ön izleme üzerinde kontrol edilir; onaydan sonra İngilizce üretime alınır. `educationinasia.com` sayfalarının Türkçe alan adının `/en/` yollarına artık erişmeden çalıştığı doğrulanır. Korunan İngilizce SVG logo ve ön görüşme formu ayrıca kontrol edilir.
2. **Sonra Türkçe:** Türkçe sitemap ve canonical düzeltmeleri `website` Worker'ına alınır. `wrangler.jsonc` içindeki `EN_REDIRECTS_ENABLED=false` olduğu için eski `/en/` sayfaları erişilebilir kalır.
3. **En son eski URL yönlendirmesi:** Her iki host testleri geçtikten sonra **ayrı onay/PR** ile `EN_REDIRECTS_ENABLED=true` yapılır ve eski `/en/` URL'lerinin doğru İngilizce sayfalara 301 döndüğü doğrulanır.
4. Başarısızlıkta Cloudflare'de önceki `website` ve/veya `educationinasia-en` Worker sürümüne dönülür; ardından iki hostta sitemap, ana sayfa, ülke, üniversite, form ve 404 yeniden kontrol edilir. `sozlesme.asyadaegitim.com` ve `studio.asyadaegitim.com` bu yayın hattının dışındadır.

Uygulama tasarımı ve adım planı: `docs/superpowers/specs/2026-11-03-bilingual-site-foundation-design.md` ve `docs/superpowers/plans/2026-11-03-bilingual-technical-seo-implementation.md` (plan dalında).

## Ön görüşme formu (TR/EN)

Her iki `/on-gorusme/` sayfasındaki form, JavaScript ile FormSubmit AJAX uç noktasına POST yapar. JavaScript kapalıysa formun `action` özelliği normal POST gönderimi sağlar; e-posta uygulaması açılmaz. Bildirim hedefi `info@asyadaegitim.com` adresidir. `_honey` gizli alanı ve FormSubmit spam koruması kullanılır. Form gönderilirken düğme kilitlenir; başarı/hata durumu sayfada gösterilir.

**İlk etkinleştirme:** FormSubmit, ilk gönderimin ardından `info@asyadaegitim.com` adresine doğrulama e-postası yollar. Alıcı bağlantıyı onaylamadan yeni başvurular e-posta kutusuna düşmeyebilir. Bu, alan adının MX kayıtlarına müdahale etmeden çalışan ve hesap açmayı gerektirmeyen bir çözümdür. Farklı sağlayıcıya geçiş yapılırsa hem iki HTML sayfasındaki `action` hem `dist/site.js` içindeki AJAX adresi değiştirilmelidir.

### Program türü ve hedef başlangıç

Ön görüşme formunda ülke seçiminin altında **Program türü** (lisans, yüksek lisans, doktora, dil programı, yaz-kış okulu, diğer, kararsız) ve **Hedef başlangıç** (2027, 2028, daha sonra, henüz belli değil) seçilir. Bu alanlar zorunludur ancak kararsız seçenekleri mevcuttur. Türkçe ve İngilizce HTML'de insan tarafından okunabilir farklı `name` nitelikleri kullanılır; `dist/site.js` içindeki `new FormData(consultationForm)` bunların ikisini de otomatik olarak FormSubmit'in JSON gövdesine dahil eder. JavaScript kapalıyken yerel HTML POST da bu alanları iletir. Yeni Türkçe alanlar `locales/en.json` içinde çevrilir; `scripts/generate-en.mjs` İngilizce FormSubmit sütun başlıklarını eşler.
