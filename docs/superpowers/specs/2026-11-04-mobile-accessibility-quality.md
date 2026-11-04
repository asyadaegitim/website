# Mobil erişilebilirlik ve etkileşim kalitesi — Tasarım ve kabul kriterleri

**Tarih:** 4 Kasım 2026
**Siteler:** asyadaegitim.com (TR), educationinasia.com (EN)
**Kapsam:** Paket 4, mobil UX ve erişilebilirlik; mevcut form gönderimi, HubSpot, SEO adresleri ve diğer Worker'lar kapsam dışıdır.

## Gerçek tarayıcıda tespit edilenler
- TR/EN ana sayfa, katalog, ülke ve üniversite profilinde 390 px mobil viewport'ta yatay taşma yok; tek H1, görsellerde alt ve form alanlarında görünür label çoğunlukla mevcut.
- 94 sayfanın hiçbirinde klavyeyle doğrudan ana içeriğe geçiş bağlantısı ve hedefi yoktu. Menü tekrarı yüzünden klavye kullanıcıları her sayfada menüyü geçmek zorunda kalıyor.
- Ana sayfa carousel düğmeleri ve footer sosyal ikonları 38×38 px, 44×44 px dokunma hedeflerine büyütülecek.
- Dil değiştiricilerindeki TR ve EN görünür yazıları ekran okuyucu için anlamlı hedef dili açıklamıyor.
- Mevcut reduced-motion kuralları, 1140 px mobil menüsü, form etiketleri ve temel focus-visible stilleri korunacak.
- Chrome Lighthouse aracında 'session not found' hatası görüldü. Bu paket WCAG uygunluk sertifikası değildir; otomatik test + manuel mobil klavye QA yapılacak.

## Onaylanan uygulama şekli
94 sayfayı elle değiştirmek yerine statik build'e küçük ve idempotent bir erişilebilirlik adımı eklenir. Önce İngilizce sayfalar üretilir, ardından keşif bağlantıları ve son olarak erişilebilirlik HTML'si eklenir. Tek ortak CSS dosyası iki dile uygulanır.

## Kabul kriterleri
- Body'nin ilk odaklanabilir öğesi Türkçe Ana içeriğe geç veya İngilizce Skip to main content bağlantısı olur.
- Main tam bir kez main-content kimliğini ve tabindex=-1 özelliğini taşır; klavye ile skip kullanıldığında hedefe ulaşılır.
- Dil seçicilerinin TR/EN görünür metni ve URL'leri değişmez; aria-label hedef dili açıklar ve mevcut aria-current aynen korunur.
- Carousel okları ve footer sosyal medya hedefleri her biri en az 44×44 px olur; 320, 390, 768, 1024 ve 1440 px ekranlarda yatay taşma bulunmaz.
- Forced colors sisteminde odak işaretleri görünür; reduced motion kuralları korunur.
- 47 Türkçe + 47 İngilizce sayfa rotası, canonical, hreflang ve breadcrumb JSON-LD değişmez. Ön görüşme formu ve FormSubmit hedefi korunur.
- TDD RED -> GREEN, npm test, TR preview / EN staging, gerçek tarayıcıda keyboard Tab/Enter + navigasyon ve 94 sayfa canlı smoke uygulanır.

## Yayın ve geri dönüş
Önce İngilizce Worker, sonra GitHub main birleştirmesi ve Türkçe Worker yayımlanır. Eski Worker sürümleri saklanır; üretim build'leri test kapısı olmadan geçemez.