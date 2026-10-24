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

## Cloudflare Workers üzerinden yayın (BRIQ modeli)

BRIQ'ı örnek alan yayın hattı:

`GitHub main → Cloudflare Workers Builds → Wrangler → Cloudflare Workers Static Assets → alan adı`

Bu site BRIQ'ın aksine Next.js/Vinext veya R2 gerektirmez; 48 sayfanın HTML çıktısı ve CSS/JS/görselleri `dist/` altında hazırdır. Kök dizindeki `wrangler.jsonc` yapılandırması yalnızca statik varlıkları yayınlar. Worker kodu yoktur.

Workers & Pages → Create application → **Continue with GitHub** akışında `asyadaegitim/website` reposunu seçin ve aşağıdaki ayarları kullanın:

| Ayar | Değer |
| --- | --- |
| Uygulama / Worker adı | `asyadaegitim` |
| GitHub | `asyadaegitim/website` |
| Production branch | `main` |
| Root directory | `/` |
| Build command | Boş (derleme gerekmiyor) |
| Deploy command | `npx --yes wrangler@4.92.0 deploy` |
| Preview build | Başlangıçta kapalı olabilir |

Cloudflare GitHub uygulamasına yalnızca bu depoya erişim izni vermek yeterlidir. Her `main` güncellemesi için otomatik dağıtım açık olmalıdır. İlk olarak `*.workers.dev` bağlantısında ana sayfa, ülke/üniversite sayfaları ve statik dosyalar doğrulanmalıdır; ardından `asyadaegitim.com` alan adı Worker'a bağlanabilir.

**Önemli:** Bu GitHub deposundaki statik kopyanın Sites'ın özgün kaynak koduyla eşit olduğu varsayılmamalıdır. Cloudflare yapılandırma dosyası GitHub'a eklendi diye Cloudflare'de henüz bir uygulama oluşmuş ya da alan adı yönlendirilmiş olmaz. Mevcut ChatGPT Sites yayını ayrıca çalışmaya devam eder.

## Türkçe / English

Her Türkçe sayfanın `dist/en/` altında İngilizce karşılığı bulunur. Üst menüde TR/EN dil seçimi, iki dilin karşılıklı `hreflang` / canonical bağlantıları ve `dist/sitemap.xml` yer alır. İngilizce metinler `locales/en.json` dosyasında yönetilir. Türkçe kaynak sayfalar güncellendiğinde `node scripts/generate-en.mjs` çalıştırılarak eşlenik HTML ve site haritası yenilenmelidir. Derleme servisi, ücretli çeviri API'si veya üçüncü taraf i18n paketi gerekmez.

## Ön görüşme formu (TR/EN)

Her iki `/on-gorusme/` sayfasındaki form, JavaScript ile FormSubmit AJAX uç noktasına POST yapar. JavaScript kapalıysa formun `action` özelliği normal POST gönderimi sağlar; e-posta uygulaması açılmaz. Bildirim hedefi `info@asyadaegitim.com` adresidir. `_honey` gizli alanı ve FormSubmit spam koruması kullanılır. Form gönderilirken düğme kilitlenir; başarı/hata durumu sayfada gösterilir.

**İlk etkinleştirme:** FormSubmit, ilk gönderimin ardından `info@asyadaegitim.com` adresine doğrulama e-postası yollar. Alıcı bağlantıyı onaylamadan yeni başvurular e-posta kutusuna düşmeyebilir. Bu, alan adının MX kayıtlarına müdahale etmeden çalışan ve hesap açmayı gerektirmeyen bir çözümdür. Farklı sağlayıcıya geçiş yapılırsa hem iki HTML sayfasındaki `action` hem `dist/site.js` içindeki AJAX adresi değiştirilmelidir.

### Program türü ve hedef başlangıç

Ön görüşme formunda ülke seçiminin altında **Program türü** (lisans, yüksek lisans, doktora, dil programı, yaz-kış okulu, diğer, kararsız) ve **Hedef başlangıç** (2027, 2028, daha sonra, henüz belli değil) seçilir. Bu alanlar zorunludur ancak kararsız seçenekleri mevcuttur. Türkçe ve İngilizce HTML'de insan tarafından okunabilir farklı `name` nitelikleri kullanılır; `dist/site.js` içindeki `new FormData(consultationForm)` bunların ikisini de otomatik olarak FormSubmit'in JSON gövdesine dahil eder. JavaScript kapalıyken yerel HTML POST da bu alanları iletir. Yeni Türkçe alanlar `locales/en.json` içinde çevrilir; `scripts/generate-en.mjs` İngilizce FormSubmit sütun başlıklarını eşler.
