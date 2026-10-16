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
