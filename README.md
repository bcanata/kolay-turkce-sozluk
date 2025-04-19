# Kolay Türkçe Sözlük

## Açıklama
Kolay Türkçe Sözlük, modern ve kullanıcı dostu bir Türkçe sözlük uygulamasıdır. TDK API'si üzerinden kelime anlamları, kökenleri, örnekler ve atasözleri sunar. Klasik sözlük görünümü ve hızlı arama özellikleriyle dijital çağda Türkçeyi keşfetmek için idealdir.

🔗 **Canlı Proje:** [https://kolay-turkce-sozluk.vercel.app/](https://kolay-turkce-sozluk.vercel.app/)

## Özellikler
- Hızlı kelime arama ve otomatik tamamlama
- Klasik iki sayfalı sözlük görünümü
- TDK'dan canlı anlam, köken, örnek ve atasözü verisi
- Türkçe diline uygun büyük harf kuralları
- Mobil ve masaüstü için duyarlı tasarım
- GitHub Actions ile otomatik Preview ve Production dağıtımı

## Yerel Geliştirme
```bash
npm install
npm run dev
```
Projeyi [localhost:3000](http://localhost:3000) adresinde görüntüleyebilirsiniz.

## Dağıtım
- Vercel ile otomatik dağıtım için `.github/workflows/preview.yaml` ve `.github/workflows/production.yaml` dosyaları kullanılır.
- Gerekli GitHub Secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

Secrets değerlerini almak için:
1. `vercel login` ile giriş yapın.
2. `vercel link` ile projeyi bağlayın.
3. `.vercel/project.json` dosyasından orgId ve projectId alın.
4. GitHub repo ayarlarından Secrets olarak ekleyin.

---

# Kolay Türkçe Sözlük

## Description
Kolay Türkçe Sözlük is a modern, user-friendly Turkish dictionary app. It provides word meanings, origins, examples, and proverbs using the official TDK API. Enjoy a classic dictionary look and fast search features to explore Turkish in the digital age.

🔗 **Live Project:** [https://kolay-turkce-sozluk.vercel.app/](https://kolay-turkce-sozluk.vercel.app/)

## Features
- Fast word search & autocomplete
- Classic two-page dictionary view
- Live TDK data: meanings, origins, examples, proverbs
- Turkish locale-aware uppercasing
- Responsive design for mobile & desktop
- Automated Preview & Production deployments via GitHub Actions

## Local Development
```bash
npm install
npm run dev
```
View the app at [localhost:3000](http://localhost:3000)

## Deployment
- Automated with Vercel using `.github/workflows/preview.yaml` and `.github/workflows/production.yaml`.
- Required GitHub Secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

To obtain secrets:
1. Run `vercel login` to authenticate.
2. Run `vercel link` to link your project.
3. Find orgId and projectId in `.vercel/project.json`.
4. Add them as GitHub repository secrets.

---

MIT License © 2024
