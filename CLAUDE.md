# SarjUp Monorepo — Claude Kuralları

## Proje Özeti
B2B akıllı telefon şarj cihazı kiralama ekosistemi.
- Supabase Project ID: `turvyyedodkpnvlrorst`
- GitHub: github.com/borademirkan1-droid/sarjup

## Monorepo Yapısı

```
apps/
├── panel/    → Admin panel (Next.js 14) — admin.sarjup.com.tr
├── website/  → Pazarlama sitesi (Next.js 14) — sarjup.com.tr
├── mobile/   → Partner Android uygulaması (Expo 54, React Native)
└── victor/   → Claude Code worker + proje yönetim paneli (Next.js 16)

packages/
├── types/    → @sarjup/types — Tüm Supabase DB tipleri (TEK KAYNAK)
└── utils/    → @sarjup/utils — Paylaşımlı formatters (formatCurrencyTRY vb.)
```

## Çalışma Kuralları

### 1. Net Çözüme Git
Uzun açıklama değil, direkt çalışır kod. Pseudocode yok.

### 2. Hangi Uygulamada Çalıştığını Belirt
Her zaman `apps/panel`, `apps/mobile` gibi tam path kullan.

### 3. Shared Types
DB tipi değişince → `packages/types/index.ts` güncelle, app'ler otomatik alır.
App'ler kendi `lib/supabase/types.ts` dosyasından import etmeye devam eder (re-export pattern).

### 4. Hata Döngüsüne Girme
2 denemede çözemiyorsan farklı yaklaşım öner.

### 5. CLAUDE.md Güncelleme
Tekrarlayan hata veya yeni kural → ekle.

## Teknik Kurallar

### Shared Packages Import
```typescript
// App içinde: değişmez (re-export pattern)
import type { PartnerRow } from '@/lib/supabase/types'
import { formatCurrencyTRY } from '@/lib/format'

// packages/types direkt kullananlar:
import type { PartnerRow } from '@sarjup/types'
```

### Deploy
```bash
# Panel
cd apps/panel && git push  # Vercel otomatik deploy
                            # Vercel Root Directory: apps/panel

# Website
cd apps/website && git push
                            # Vercel Root Directory: apps/website

# Mobile
cd apps/mobile
eas build --platform android --profile preview
```

### Supabase
- Key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (eski anon key değil)
- Auth: `middleware.ts` session kontrolü
- `/api/mobile/*` → session gerekmez (partner_id ile auth)
- RLS değişikliği = migration dosyası yaz
- Edge Functions: `apps/panel/supabase/functions/`

### Turborepo
```bash
# Sadece panel geliştir
npm run dev:panel

# Hepsini build et
npm run build

# Tip kontrolü
npm run type-check
```

## Servisler

| Servis | Kullanım | Durum |
|--------|---------|-------|
| Supabase | DB + Auth + Storage + Edge Functions | Aktif |
| Vercel | panel + website hosting | Aktif |
| GitHub | sarjup monorepo | Aktif |
| Anthropic API | Dekont AI analizi | Aktif |
| iyzico Sanal POS | Kart ödemesi | Onay bekleniyor |
| Meta API | Instagram/FB DM | Token bağlanmadı |
| EAS Build | Android APK | Hazır, build edilmedi |

## Mevcut Durum (08 Mayıs 2026)

### Panel (apps/panel)
- Lead scraper batch 0-11 çalışıyor (09-12 Mayıs)
- Mevcut lead sayısı: ~2.750
- iyzico entegrasyonu hazır (env var gelince aktif)
- Bekleyen: Meta API token, EAS APK

### Mobile (apps/mobile)
- ~%80 MVP
- NFC HCE implementasyonu eksik
- EAS build henüz yapılmadı

### Victor (apps/victor)
- Claude Code worker + proje yönetim paneli
- Supabase: agent_tasks, agent_activity, victor_messages tabloları

## Bilinen Sorunlar
- Supabase key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key değil)
- TypeScript: `supabase/functions/` klasörünü tsconfig exclude listesine ekle
- Supabase client module-level init build'de patlar → handler içinde init et
- RLS cross-schema EXISTS unreliable → `auth.uid() IS NOT NULL` kullan
- react-native-hce managed workflow'da çalışmaz → bare workflow gerekir
