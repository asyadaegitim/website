# Asya’da Eğitim

Çin, Japonya, Güney Kore, Singapur ve Hong Kong için hazırlanmış çok sayfalı eğitim danışmanlığı sitesi.

## Dosya yapısı

- `src/`: Python sayfa üreticisi, üniversite verileri ve CSS kaynağı.
- `dist/`: Yayına hazır HTML, CSS, JavaScript, logolar ve kampüs görselleri.
- `.openai/hosting.json`: Mevcut ChatGPT Sites projesinin yayın yapılandırması.

## Yerelde çalıştırma

Python 3.12 veya üzeri yeterlidir; ek Python paketi gerekmez. Komutları repo kökünde çalıştırın:

```sh
python3 -B src/build.py
python3 -m http.server 8000 --directory dist
```

Ardından `http://localhost:8000` adresini açın. Statik barındırmada yayın kökü `dist/` olmalıdır; site bağlantıları alan adı köküne göre düzenlenmiştir.

## Düzenleme

Metinler ve üniversiteler `src/` altındaki Python dosyalarından, tasarım `src/site.css` dosyasından düzenlenir. Sonra sayfa üreticisi yeniden çalıştırılır. Etkileşimler `dist/site.js`, görseller `dist/assets/` altındadır. Görsel kaynakları ve ikon lisansları sitenin `/gorsel-kaynaklar/` sayfasında bulunur.

Ön görüşme formu, sunucuya kayıt yapmak yerine e-posta uygulamasını açan `mailto:` bağlantısını kullanır.

## Aktarılan sürüm

- Canlı site: https://asya-egitim-atlas.iakfiratt.chatgpt.site
- ChatGPT Sites sürümü: 11
- Kaynak commit: `dd664b8477e9e675d7eb05472c434b10ebf8dcb7`

Bu repo, yukarıdaki Sites sürümünün kaynaklarını ve statik çıktısını içerir. GitHub’a gönderilen değişiklikler mevcut Sites yayınına kendiliğinden aktarılmaz.
