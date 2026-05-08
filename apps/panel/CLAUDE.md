# Sarjup Admin Panel — Claude Kuralları

## Proje Özeti
B2B akıllı telefon şarj cihazı kiralama yönetim paneli.
- Next.js 14 + TypeScript + Tailwind + Shadcn/ui
- Supabase Auth + RLS (3 rol: SUPER_ADMIN > ADMIN > PARTNER)
- Canlı: https://admin.sarjup.com.tr (Vercel)
- Repo: github.com/borademirkan1-droid/SarjUp (monorepo → apps/panel)

## Çalışma Kuralları

### 1. Net Çözüme Git
Uzun açıklama değil, direkt çalışır kod. Pseudocode yok.

### 2. Zarif Çözüm
Karmaşık bir çözüm üretince:
> "Remove all previous attempts. Implement only the final working solution."

### 3. Hata Döngüsüne Girme
2 denemede çözemiyorsan farklı yaklaşım öner, sormadan devam etme.

### 4. CLAUDE.md Güncelleme
Tekrarlayan hata keşfedilince ekle.

## Teknik Kurallar

### Auth / Middleware
- `middleware.ts` session kontrolü yapar
- `/api/mobile/*` ve `/api/receipts/*` → session gerekmez (partner_id ile auth)
- `/login` ve `/_next` → her zaman public
- Supabase key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (eski anon key değil)

### Veritabanı Tabloları
- `partners` (id, name, role, status, email)
- `businesses` (id, partner_id, name, address)
- `devices` (id, partner_id, serial, status, hmac_secret, nfc_counter)
- `payments` (id, device_id, amount, method, status)
- `agent_tasks`, `agent_activity` → Victor worker için

### RLS Politikası
- SUPER_ADMIN: her şeye erişir
- ADMIN: kendi organization'ı
- PARTNER: sadece kendi kayıtları
- RLS değişikliği = migration dosyası yaz, direkt uygulama

### Deploy
```bash
git add -A && git commit -m "feat/fix: açıklama" && git push
# Vercel otomatik deploy eder
```

### Edge Functions
- `supabase/functions/` dizininde Deno runtime
- Local test: `supabase functions serve`
- Deploy: `supabase functions deploy <isim>`

## Bilinen Sorunlar / Çözümleri
- Supabase key adı değişti: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- TypeScript derlemesi `supabase/functions/` klasörünü dışla (`tsconfig.json` exclude)
- Auth debug için: login sayfasında gerçek hata mesajını göster, genel mesaj değil
- Supabase client module-level init build'de patlar → handler içinde init et (sarjup-website/app/api/contact/route.ts örnek)
- RLS cross-schema EXISTS unreliable → `auth.uid() IS NOT NULL` kullan

## Mevcut Durum (08 Mayıs 2026)

### Lead Scraper
- `scripts/lead-scraper/` — Playwright tabanlı Google Maps scraper
- Supabase `leads` tablosuna yazar (source: 'google_maps_scraper')
- **Şu an çalışıyor:** Batch 0 (task ID: b6eavfuwp) — Üsküdar, Maltepe, Pendik, Ümraniye, Sarıyer, Beyoğlu
- **Mevcut lead sayısı:** 2.749 (2.746 Maps + 3 form)
- **Kapsanan şehirler (26):** İzmit, İzmir, Ankara, Bursa, İstanbul, Antalya + ilçeleri
- `--batch N` flag eklendi: 71 yeni şehir, 12 batch olarak planlandı
- Scheduled tasks: lead-scraper-batch-0 → batch-11 (09–12 Mayıs aralığı)
- Sıradaki batch'i çalıştırmak için: `npm run scrape:leads -- --batch N`

### Batch Takvimi (kalan)
| Batch | Şehirler | Zaman |
|-------|----------|-------|
| 0 | Üsküdar, Maltepe, Pendik, Ümraniye, Sarıyer, Beyoğlu | ÇALIŞIYOR |
| 1 | Fatih, Zeytinburnu, Büyükçekmece, Keçiören, Mamak, Sincan | 09 Mayıs 12:00 |
| 2 | Etimesgut, Konak, Buca, Gaziemir, Çiğli, Yıldırım | 09 Mayıs 18:00 |
| 3 | Mudanya, Konyaaltı, Alanya, Manavgat, Adana, Gaziantep | 10 Mayıs 00:00 |
| 4 | Konya, Mersin, Diyarbakır, Kayseri, Eskişehir, Samsun | 10 Mayıs 06:00 |
| 5 | Trabzon, Malatya, Sakarya, Adapazarı, Tekirdağ, Denizli | 10 Mayıs 12:00 |
| 6 | Manisa, Balıkesir, Çorlu, Kahramanmaraş, Batman, Elazığ | 10 Mayıs 18:00 |
| 7 | Erzurum, Van, Şanlıurfa, Hatay, Antakya, Muğla | 11 Mayıs 00:00 |
| 8 | Bodrum, Marmaris, Fethiye, Nevşehir, Kapadokya, Edirne | 11 Mayıs 06:00 |
| 9 | Kırklareli, Aydın, Kuşadası, Çanakkale, Rize, Ordu | 11 Mayıs 12:00 |
| 10 | Giresun, Zonguldak, Karabük, Bolu, Düzce, Yalova | 11 Mayıs 18:00 |
| 11 | Afyon, Isparta, Burdur, Uşak, Kütahya | 12 Mayıs 00:00 |

### Bekleyen Görevler
- [ ] Meta API token bağlama (Facebook/Instagram DM otomasyonu için)
- [ ] iyzico Sanal POS API entegrasyonu (onay bekleniyor)
- [ ] EAS Build — Android APK (Expo)

### Supabase
- Project ID: `turvyyedodkpnvlrorst`
- Leads tablosu RLS: `auth.uid() IS NOT NULL`
- Sosyal medya tabloları: social_posts, social_accounts, social_dm_templates, social_dm_logs
