# Mobil navigasyon ve üniversite filtreleri — Tasarım

**Tarih:** 2026-11-04  
**Kapsam:** asyadaegitim.com ve educationinasia.com; mobil menü + üniversite liste filtresi. Başvuru formu, CRM, veri depolama ve mevcut kanonik URL şeması kapsam dışı.

## Amaç
Ziyaretçi ülke sayfası ile ülkenin alt menüsünü ayrı kontrollerle açabilsin; üniversiteleri ülke ve alana göre süzebilsin, filtre seçimini paylaşabilsin ve tarayıcı geçmişiyle doğru biçimde geri dönebilsin.

## Mevcut durum / doğrulanan bulgular
- Mobil menü 390 px genişlikte açılıyor; ülke başlığına tıklamak `preventDefault` nedeniyle ülke sayfası yerine alt menüyü açıyor. Ülke alt menülerinde ilgili genel bakış, üniversiteler, dil ve yaz okulu bağlantıları mevcut.
- TR/EN okul listesinde 27 üniversite bulunuyor; ülke + Mühendislik filtreleri canlı testte altı kayıt gösterdi. Türkçe JS `alan` filtresini URL’ye yazmıyor; İngilizce Worker bu açığı metin değiştirme yamasıyla aşmış. Bu kırılgan asimetri ortadan kalkmalı.
- 390 px mobil sitelerde yatay taşma yok; header ve formlar korunmalı.

## Seçenekler
1. **Mevcut HTML'i 94 sayfanın tamamında elle değiştirmek:** Statik ve sağlam ama çok büyük, tekrarlayan diff; en ufak menü değişikliğinde tüm sayfaları güncellemek gerekir.
2. **Var olan tek paylaşılan `site.js` ile menüyü erişilebilir şekilde geliştirmek ve `site.css` ile desteklemek (tercih):** JS, ülke bağlantılarını korur; yanlarına bağımsız aç/kapat düğmesi ekler. Liste ekranında filtre çiplerini yalnız orada ekler. Her iki dilde aynı davranış; eski HTML bağlantılarını bozmadan çalışır.
3. **Yeni bir framework/SPA:** Bu kapsam için gereksiz bağımlılık, yayın riski ve SEO maliyeti.

## Tasarım kararı — Paket 1: Menü
- Ülke adına/başlığına tıklamak her zaman ilgili ülke sayfasına gider.
- 1140 px ve altında, ülkenin yanındaki en az 44×44 px genişlik/yükseklikteki düğme alt menüyü açar/kapatır; `aria-expanded`, `aria-controls` ve seçilen dilde açıklayıcı `aria-label` sağlar.
- Aynı anda yalnız bir ülke alt menüsü açık olur; menü kapatılınca alt paneller de kapanır. Escape ile menü kapatılır ve odak menü düğmesine geri verilir; dışarı tıklama menüyü kapatır. Masaüstü hover navigasyonu korunur.
- Tüm 47 TR + 47 EN statik sayfa aynı paylaşılan JS/CSS'i kullanır; tasarım ve logo değişmez.

## Tasarım kararı — Paket 2: Filtreler
- Üniversite listesinde ülke/alan/arama bağımsız filtrelenir; sonuç sayısı `aria-live=polite` olarak duyurulur. Aktif filtreler kaldırılası çipler ile gösterilir; görünür aramayı temizle ve tüm filtreleri sıfırla kontrolleri yalnız gerektiğinde sunulur.
- Yalnız seçili ülke ve alan URL'ye yazılır: TR `ulke=cin&alan=Mühendislik`; EN `country=china&field=engineering`. Arama metni veya serbest veri URL'ye otomatik eklenmez.
- Her değişiklik `history.pushState` ile kaydedilir; `popstate` eski filtreleri yeniden yükler. Sayfa ilk açılırken gereksiz geçmiş kaydı oluşturulmaz. Başka sorgu parametreleri istenmeden silinmez, fakat aynı ülke/alan için yanlış dildeki parametreler temizlenir.
- `lang-switch` mevcut karşılıklı filtre eşleştirmesini kullanmaya devam eder.
- Mevcut 27 üniversite, görünür etiketler, canonical/sitemap, başvuru bağlantıları ve boş sonuç durumu korunur.

## Güvenlik / UX / yayın
- Üretime doğrudan müdahale yok: ayrı GitHub dalı, test öncesi başarısız regresyonlar, 29 mevcut test + yeni etkileşim testleri; Cloudflare TR GitHub preview ve EN staging üzerinden gerçek tarayıcı kontrolü.
- 320/390/768/1024 px; menü aç/kapa, aynı anda tek alt menü, Escape, dokunma ve klavye; filtreler, URL, geri/ileri, TR/EN, boş sonuç, form ve 94 URL smoke.
- EN ve TR canlı Worker'ları kullanıcı yayın onayı ve olumlu test sonuçlarına kadar değiştirilmez.
