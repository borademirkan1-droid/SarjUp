# Google Maps Lead Scraper

Google Maps'ten işletme verisi toplayarak Supabase `leads` tablosuna kaydeden Playwright tabanlı scraper.

## Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. Playwright Chromium'u yükle

```bash
npm run scrape:install
```

### 3. Ortam değişkenlerini ayarla

`.env.local` dosyasında şu değişkenler tanımlı olmalı:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-id>.supabase.co
SUPABASE_SECRET_KEY=<service_role_key>
```

## Kullanım

### Tek sorgu + tek şehir

```bash
npm run scrape:leads -- --query "kafe" --city "İzmit"
```

### Tek şehir, tüm kategoriler

```bash
npm run scrape:leads -- --city "İzmit" --all-queries
```

### Tüm config (tüm sorgular x tüm şehirler)

```bash
npm run scrape:leads -- --all
```

### Headless kapalı (görsel mod)

```bash
npm run scrape:leads -- --query "kafe" --city "İzmit" --no-headless
```

## Konsol çıktısı

```
🔍 Arıyor: "kafe" in "İzmit" → https://...
  📋 18 sonuç bulundu
  ✓ Insert: Kahve Durağı | +905321234567 | İzmit
  ⟳ Skip (duplicate): Latte Cafe | +905339876543 | İzmit
  ❌ Insert hatası: Örnek Kafe — ...
```

## Notlar

- Scraper her sonuç için `try/catch` kullanır — tek bir hata tüm işlemi durdurmaz.
- Duplicate kontrolü: aynı telefon numarası veya (isim + şehir) kombinasyonu zaten varsa atlanır.
- Eklenen leadler otomatik olarak admin paneldeki **Başvurular** sayfasında `source: google_maps_scraper` ile görünür.
- `config.ts` dosyasından arama hedefleri, şehirler ve scraper ayarları özelleştirilebilir.
