## Her Sohbet Basinda
1. `D:\Novabora\Drive\SarjUp\HANDOFF.md` oku
2. `D:\Novabora\Drive\SarjUp\_memory\MEMORY.md` oku
3. `D:\Novabora\Drive\SarjUp\LAST_SESSION.md` oku (varsa)
4. Tek cumleyle ozet: Kaldigimiz yer: [konu]

## Her Sohbet Sonunda
Su dosyalari guncelle, sonra Bora'ya bildir:
1. `D:\Novabora\Drive\SarjUp\LAST_SESSION.md` → bugun ne konusuldugu, alinan kararlar, siradaki adim
2. `D:\Novabora\Drive\SarjUp\_memory\MEMORY.md` → yeni bir sey ogrenirsek ekle/guncelle
3. `D:\Novabora\Drive\SarjUp\HANDOFF.md` → her sohbette guncelle
Son mesaj: "Hafiza guncellendi — LAST_SESSION ✓ | MEMORY [✓ / degismedi] | HANDOFF ✓"

> Sadece bu projeyi bil. Digerleri (Prox, Victor, rebornspaces) tanima.

---

# SarjUp Monorepo

B2B akilli telefon sarj cihazi kiralama. Supabase: `turvyyedodkpnvlrorst`

```
apps/panel/    → admin.sarjup.com.tr (Next.js 14)
apps/website/  → sarjup.com.tr (Next.js 14)
apps/mobile/   → Expo 54, React Native
packages/types/ → @sarjup/types (TEK KAYNAK)
packages/utils/ → @sarjup/utils
```

## Agent Routing (otomatik)
| Durum | Agent |
|-------|-------|
| Kod degisti | `code-reviewer` |
| Auth/RLS/odeme | `security-reviewer` |
| Build hatasi | `build-error-resolver` |
| Yeni feature | `tdd-guide` |
| SQL/migration | `database-reviewer` |
| TS tip hatasi | `typescript-reviewer` |

Log: `node "C:/Users/Bora/.claude/scripts/log-agent.js" <kategori> "<mesaj>"`

## Teknik Kurallar
- Shared types: `packages/types/index.ts` → app'ler `@/lib/supabase/types` ile import eder
- Supabase key: `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (anon key degil)
- Supabase client: module-level degil, handler icinde init et
- RLS: `auth.uid() IS NOT NULL` kullan
- Edge Functions: `apps/panel/supabase/functions/`
- RLS degisikligi = migration dosyasi yaz

## Deploy
```bash
npm run dev:panel   # Sadece panel
npm run build       # Hepsini build
npm run type-check
# Vercel: git push yeterli (Root Dir ayarli)
# Mobile: eas build --platform android --profile preview
```

## Bilinen Sorunlar
- `supabase/functions/` → tsconfig exclude listesine ekle
- RLS cross-schema EXISTS unreliable → `auth.uid() IS NOT NULL` kullan
- react-native-hce managed workflow'da calismiyor → bare workflow gerekir
