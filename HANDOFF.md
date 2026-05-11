# SarjUp — Devir Teslim Notu

> Bu dosyayı her çalışma seansı sonunda güncelle. Bir sonraki kişi buradan devam eder.

---

## Son Güncelleme
- **Tarih:** 11 Mayıs 2026
- **Kim:** Bora

---

## Şu An Neredeydik

- Monorepo konsolidasyonu tamamlandı: `sarjup-panel`, `sarjup-mobile`, `sarjup-website` ayrı repoları silindi
- Monorepo `C:\Users\Bora\Projects\SarjUp` tek canonical kaynak
- Lead scraper batch 0-11 çalışıyor (09-12 Mayıs, otomatik)
- iyzico entegrasyonu hazır — env var (`IYZICO_API_KEY`) gelince aktif
- push notification altyapısı kuruldu (expo-server-sdk + expo-notifications)

---

## Sıradaki Görevler

### Öncelikli
- [ ] Meta API token bağla (Instagram/Facebook DM için) — `apps/panel/app/api/webhooks/meta/`
- [ ] EAS Android APK build et: `cd apps/mobile && eas build --platform android --profile preview`
- [ ] Mobile: NFC HCE implementasyonu (bare workflow gerekir, managed çalışmaz)

### İkincil
- [ ] Lead scraper sonuçlarını kontrol et (12 Mayıs sonrası ~3.500 lead bekleniyor)
- [ ] CRM pipeline kanban görünümünü test et: `apps/panel/app/(dashboard)/crm/`
- [ ] WhatsApp Business API sandbox test: `apps/panel/app/api/whatsapp/`

---

## Bilmen Gerekenler

- Supabase key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (eski `anon key` değil!)
- Panel local başlatmak: `npm run dev:panel` (repo root'undan)
- `.env.local` dosyaları git'te yok — `apps/panel/.env.local.example` baz al
- iyzico henüz sandbox — canlı için Bora'dan onay al
- Replicate -$12 borç var, `replicate` paketi kullanma

---

## Repo & Servisler

- GitHub: https://github.com/borademirkan1-droid/SarjUp
- Supabase: https://supabase.com/dashboard/project/turvyyedodkpnvlrorst
- Vercel Panel: admin.sarjup.com.tr
- Vercel Website: sarjup.com.tr

---

## Nasıl Güncellenir

Çalışmanı bitirince bu dosyayı güncelle:
1. "Son Güncelleme" kısmını değiştir (tarih + adın)
2. Yaptıklarını "Şu An Neredeydik" kısmına ekle
3. "Sıradaki Görevler" listesini güncelle
4. Dosyayı commit et: `git add HANDOFF.md && git commit -m "handoff: <adın> <tarih>"`
5. Drive'a kopyala: bu dosyayı `D:\NovaBora\Drive\SarjUp\HANDOFF.md` olarak kaydet
