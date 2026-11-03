# Asya'da Eğitim — İki Dilli Site Temeli Tasarımı

**Tarih:** 2026-11-03  
**Durum:** Onay bekleyen tasarım; uygulama ve üretim dağıtımı yapılmadı.  
**Kapsam:** Aşama 1 — TR/EN yayın bütünlüğü, teknik SEO, temel güvenlik ve ölçülebilir doğrulama.

## 1. Niyet ve başarı tanımı

Asya'da Eğitim (`asyadaegitim.com`) ve Education in Asia (`educationinasia.com`) aynı kurumsal kimliğin iki dildeki yayınlarıdır. Hedef; güvenilir, anlaşılır, hızlı ve arama motorlarınca doğru taranan bir üniversite danışmanlığı sitesinin teknik temelini oluşturmaktır. Daha sonraki ayrı aşamalarda içerik kalitesi, mobil UX, HubSpot bağlantılı müşteri kazanımı ve analitik iyileştirilir.

**Bu aşamanın başarılı olması:** Kullanıcı doğru dilde ve doğru alan adında kalır; eski URL'ler kayıpsız yeni adrese ulaşır; canonical / hreflang / sitemap birbirleriyle çelişmez; formlar çalışmaya devam eder; mevcut tasarım, logo ve diğer Cloudflare servisleri bozulmaz.

## 2. Onaylanan yaklaşım ve alternatifler

- **A — Yalnız teknik yamalar:** Hızlı ve ucuz, ancak iki farklı yayın sistemindeki yapısal çelişkileri kalıcı çözmeyebilir.
- **B — Mevcut sistemi kontrollü bütünleştirme (seçilen):** Kaynak ve dağıtım hattını belirginleştirir, ölçülebilir küçük paketlerle teknik temeli onarır, daha sonra UX/içerik/dönüşümü ekler. Mevcut tasarımı korur.
- **C — Tam yeniden yazım:** Uzun vadeli esneklik sağlar; bu ihtiyaç için yüksek geçiş riski ve gereksiz maliyet.

**Karar:** B. Üretimdeki siteyi sıfırdan değiştirmeyiz; her değişiklik test + ön izleme + geri dönüş koşuluyla yapılır.

## 3. İncelenen mevcut durum (2026-11-03, canlı ve GitHub)

- Kurumsal Cloudflare hesabında **iki ayrı üretim Worker'ı** var: `website` → `asyadaegitim.com`; `educationinasia-en` → `educationinasia.com`. İngilizce `educationinasia-en-stage` de var. İlgisiz `sozlesme.*`, `studio.*` Worker'larına kesinlikle dokunulmaz.
- `asyadaegitim/website` deposunun `main` dalı `dist/` statik HTML/CSS/JS, `locales/en.json`, `scripts/generate-en.mjs` ve `wrangler.jsonc` içeriyor. Mevcut betik İngilizceyi **Türkçe alan adı altındaki `/en/...`** için üretiyor; bağımsız İngilizce alan adının yeni kanonik yollarını üretmiyor. İngilizce Worker'ın güncel kod/varlıklarının depodaki hangi kaynağa karşılık geldiği ayrıca doğrulanmalı.
- Türkçe site haritasında **94** kayıt var; bunların 47'si eski `/en/` yapısında. İngilizce site haritasında **47** kayıt var; `/ulkeler/`, `/okullar/`, `/on-gorusme/` gibi eski yolları bildiriyor. Canlı İngilizce sayfalar `/destinations/`, `/universities/`, `/free-consultation/` gibi yeni yolları zaten kullanıyor.
- İncelenen Türkçe ana sayfa `hreflang=en` için `https://asyadaegitim.com/en/` gösteriyor; İngilizce ana sayfa ise `https://educationinasia.com/` için kanonikleşmiş. Alternatif dil kümesi tutarsız.
- İncelenen yanıtlar CSP, HSTS, X-Content-Type-Options, Referrer-Policy gibi başlıkları göndermiyor; mevcut gerçek güvenlik politikaları Cloudflare seviyesinde ayrıca denetlenmeli.
- İki ön görüşme formu, üçüncü taraf FormSubmit'e veri gönderiyor. İncelenen sayfalarda görünür KVKK/gizlilik bilgisi ve işleme amacından ayrı pazarlama izni bulunmuyor. Mevcut gönderim işlevi değiştirilmeden önce e-posta teslimatı uçtan uca doğrulanmalı.
- İncelenen sayfalarda Open Graph ve JSON-LD bulunmadı; bazı sayfa açıklamaları tekrarlı. Mobil Lighthouse ölçümü tarayıcı oturumu hatası nedeniyle henüz mevcut değil.

Bu maddeler **gözlenen başlangıç durumu**dur; GSC dizin kapsamı, gerçek dönüşüm oranı veya Core Web Vitals performansı hakkında henüz sayısal iddia yoktur.

## 4. Mimari kararlar

### 4.1 Alan adı ve dil modeli

- TR: `https://asyadaegitim.com/<turkce-yol>/`; EN: `https://educationinasia.com/<english-path>/`.
- İngilizce site genelinde marka görünen alanlarda **Education in Asia**, Türkçede **Asya'da Eğitim**; onaylı logo geometrisi ve font/renkler korunacak.
- İki alan adı ayrı Worker olarak kalabilir; ancak dil eşleme/kanonik URL verisi **tek sürümlenen, test edilebilen kaynak**tan üretilmeli. Kaynak keşfi tamamlanmadan mevcut `generate-en.mjs` üretimde çalıştırılmayacak.
- Dil düğmeleri ve iç bağlantılar **hedef dilin kanonik alan adı + karşılık gelen yoluna** yönlendirecek. Sorgu parametreleri yalnız eşlenmiş değerlerle korunacak (örn. `ulke=cin` ↔ `country=china`); geçersiz parametreler yeni konuma taşınmayacak. `#fragment` yalnız karşılık gelen bölüm mevcutsa korunacak.
- Yalnız gerçekten karşılığı bulunan iki sayfa `hreflang=tr` ve `hreflang=en` ile karşılıklı bağlanacak. `x-default` için gerçek dil seçici/varsayılan sayfa bulunmadığından bu aşamada kaldırılacak; rastgele bir dili varsayılan gibi göstermeyeceğiz.
- Türkçe `/en/...` ve İngilizce `/ulkeler/...` gibi **eski URL'ler**, bire bir eşleşmesi varsa tek atlamalı kalıcı yönlendirmeyle yeni kanoniğe aktarılacak. Toplu ana sayfaya düşürme, zincir ve döngü olmayacak; parametreler yanlış ülkeye dönüşmeyecek.
- `www` / çıplak alan adı, `http` / `https`, son eğik çizgi ve 404 davranışı tekil tutarlılık testlerine tabi tutulacak.

### 4.2 GSC / teknik SEO

- Her iki domain için ayrı `sitemap.xml` **yalnız o host üzerindeki doğrudan 200 dönen, indekslenebilir kanonik URL'leri** içerecek. Diğer dil alternatifleri tam ve karşılıklı `xhtml:link hreflang` olacak.
- `robots.txt` doğru hostun sitemap'ini gösterecek; alt alan adları (özellikle sözleşme/stüdyo) yanlışlıkla kapsanmayacak.
- Her sayfada benzersiz, dile özgü `<title>`, meta description, canonical, açık `html lang`, mantıklı H1/H2 ve doğru sosyal paylaşım metaverileri bulunacak. Marka adı İngilizce meta alanlarında da güncel olacak.
- `Organization`/uygun `EducationalOrganization`, `BreadcrumbList` ve sayfaya uygun şemalar yalnız **doğrulanabilen gerçek verilerle** üretilecek. Yanıltıcı yıldız, değerlendirme, burs veya üniversite ortaklığı iddiası olmayacak.
- GSC mülkleri ve sahiplik erişimi teyit edildikten sonra iki sitemap gönderilecek; eski URL'lerde indeksleme/zincir yönlendirme hataları izlenecek. **GSC verisi çekilmeden trafik veya sıralama artışı vaat edilmeyecek.**

### 4.3 Güvenlik ve kişisel veri

- Cloudflare güvenlik başlıkları gerçek asset/script/font/form ihtiyaçlarına göre test edilecek. İlk CSP yalnızca `Report-Only` aşamasında; eksik kaynakları engelleyen bir politika üretime taşınmayacak.
- `X-Content-Type-Options`, uygun `Referrer-Policy`, `Permissions-Policy` ve frame koruması doğrulanacak; HSTS yalnız tüm etkilenen ana hostlar HTTPS üzerinden sağlıklıysa, kademeli `max-age` ile eklenecek. `includeSubDomains` / `preload` kapsam genişlemesi ayrı inceleme ister; sözleşme ve stüdyo alanlarını riske atmayız.
- WAF / bot / oran sınırlama kararı gerçek trafik ve form davranışına göre verilecek; gereksiz ücretli ürün açılmayacak.
- Başvuru verisinin üçüncü tarafa gönderilmesi açık gizlilik metninde anlaşılır biçimde belirtilmeli; hizmet amaçlı veri işleme ile **ayrı, opsiyonel pazarlama izni** karıştırılmamalı. Gerekli hukuki metinler kullanıcı tarafından onaylanmadan kesinleşmiş sayılmaz.
- Mevcut FormSubmit kanalı uçtan uca teslimat testleri geçmeden kapatılmaz. Birinci taraf Cloudflare Worker + doğrulama + yetkili HubSpot entegrasyonu **ayrı fazın** konusudur; burada başarısız gönderim kaybı yaratmayacağız.
- Testler gerçek müşteri bilgileri veya sırlarla yapılmayacak; PII, secret ve iç yazışmalar GitHub'a girmez.

### 4.4 Performans ve erişilebilirlik

- Önce gerçek mobil/masaüstü taban ölçümü: sayfa yükü, LCP, CLS, INP (alan verisi varsa), ağ istekleri, görsel boyutları, fontlar.
- Büyük görsellerin gerektiğinde uygun format ve boyutları, kritik görselin yükleme önceliği, lazy-load ve CSS/JS bağımlılıkları gözden geçirilir. İşe yarayan tasarım animasyonlarını gerekçesiz kaldırmayız.
- Klavye ile menü/filtre/form akışı, odak görünürlüğü, form etiketleri ve hata mesajları, dokunmatik hedefler, kontrast ve dar ekran test edilir.
- Aşama 1'in amacı düzeni yeniden tasarlamak değil; var olan deneyimi **kırmadan** ölçülebilir temel kaliteyi sağlamak.

## 5. Fazlar ve teslim sınırları

1. **Faz 1A — Kaynak ve URL sözleşmesi:** Türkçe/İngilizce Worker sürümleri ve gerçek kaynakları tespit; tüm sayfaların TR↔EN manifesti; mevcut 200/301/404 envanteri; korunan servis sınırları.
2. **Faz 1B — İki dilli SEO düzeltmesi:** canonical, hreflang, TR/EN dil düğmeleri, iç linkler, sitemap/robots, eski yol yönlendirmeleri, marka/metaveri. Ayrı test paketi ve ön izleme.
3. **Faz 1C — Güvenlik ve erişilebilirlik temeli:** Başlıklar ve CSP raporlama; form çalışırlığını koruyan küçük UI/a11y düzeltmeleri; rollback koşulları.
4. **Faz 1D — Dağıtım ve GSC doğrulaması:** her iki alan adında gerçek 200/301/404, iki dil navigasyonu, ön görüşme teslimatı, Cloudflare dağıtım versiyonları ve GSC sitemap kontrolü.
5. **Faz 2 (ayrı tasarım):** Kapsamlı ülke/üniversite/program bilgileri, kaynak, başvuru ve burs rehberleri, yazarlık/güncelleme politikası, SEO içerik mimarisi ve genel UX.
6. **Faz 3 (ayrı tasarım):** HubSpot uyumlu güvenli birinci taraf başvuru akışı; nitelikli lead, dönüşüm olayları, onay ve izleme deneyleri.

## 6. Zorunlu doğrulama ve kabul ölçütleri

- Her TR sayfa ve karşılık gelen EN sayfa (tek manifestte listelenen tüm çiftler) **200 + self-canonical + karşılıklı hreflang** verir; kanoniklerin hiçbiri yönlendirmeye gitmez.
- İki sitemap'te eski/başka hosttan `loc`, 301/404, kopya URL bulunmaz; sitemap listedeki tüm URL'ler gerçek sayfalara karşılık gelir.
- Tüm mevcut eski İngilizce yollar doğru yeni EN içeriğine kalıcı olarak yönlenir; ana sayfaya topluca düşmez; filtreli linkler ve dil değiştirici test edilir.
- Türkçe ve İngilizce tasarım, logo, menü ve ücretsiz ön görüşme giriş noktaları görsel/sözdizimsel regresyon testlerinden geçer; `sozlesme.asyadaegitim.com` ve `studio.asyadaegitim.com` etkilenmez.
- Formlar iki dilde sahte test profiliyle başarı ve hata senaryosunda denenir. Gizlilik metinleri bağlanmadan yeni veri işleme veya pazarlama otomasyonu etkinleşmez.
- CSP Report-Only aşamasında gereken font/görsel/form kaynakları gözlemlenir; kısıtlayıcı politika yalnız regresyon testleriyle uygulanır.
- Mobil/masaüstü ölçümleri kayıt altına alınır, kritik erişilebilirlik hataları listelenir; geçmediği bilinen kontrol gizlenmez.
- Her iş paketi bağımsız branch/PR ile önerilir; **kullanıcı onayı olmadan üretim merge/deploy ve DNS değiştirme yoktur**. Hatalı dağıtımda önceki Worker sürümü veya önceki release'e geri dönüş belgelenir.

## 7. Riskler ve açık doğrulamalar

- **En önemli risk:** Depodaki İngilizce üretici ile canlı `educationinasia-en` kodu farklı. Canlı EN Worker'ın kodu/asset kaynağı güvenilirce eşlenmeden tek ortak kaynak sisteme dayatılmayacak.
- Mevcut `main` dalının otomatik üretim dağıtımı riski nedeniyle tasarım ve test değişiklikleri ayrı dalda tutulacak.
- HSTS/CSP/yanlış 301 uygulaması hem SEO hem de FormSubmit'i bozabilir; hazırlık → ön izleme → kontroller → dağıtım sırasını koruyacağız.
- Google Search Console'un gerçek sahiplik, indeks kapsamı ve arama performansı bu denetimde okunmadı; bu veri olmadan artış tahmini yapılmayacak.
- Bu tasarım **henüz kod uygulama izni değildir**; önce inceleme/onay, sonra ayrı uygulanabilir Superpowers görev planı gerekir.
