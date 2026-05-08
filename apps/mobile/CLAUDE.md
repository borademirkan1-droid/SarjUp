# Sarjup Mobile — Claude Kuralları

## Proje Özeti
Partner Android uygulaması — NFC HCE ile cihaz aktivasyonu.
- React Native + Expo SDK 54 + expo-router
- Supabase JS client (partner auth)
- react-native-hce (NFC Host Card Emulation)
- Durum: ~%80 MVP, NFC gerçek implementasyon eksik
- Build: EAS Build (Android öncelikli)

## Çalışma Kuralları

### 1. Net Çözüme Git
Direkt çalışır kod. Android öncelikli düşün (iOS ikincil).

### 2. Expo Managed → Bare Workflow Geçişi
react-native-hce bare workflow gerektirir. Eğer managed workflow'daysa önce sor.

### 3. Hata Döngüsüne Girme
Native modül hatalarında 2 denemede çözemediysen farklı yaklaşım öner.

### 4. CLAUDE.md Güncelleme
Tekrarlayan hata veya karar değişince ekle.

## Teknik Kurallar

### NFC Akışı
```
Partner telefon (HCE) → Şarjup cihazı (PN532) → Supabase Edge Function → cihaz açılır
Token: HMAC-SHA256(device_id + timestamp + counter, hmac_secret)
Süre: 30 saniye, tek kullanımlık
```

### Supabase Bağlantısı
- URL: https://turvyyedodkpnvlrorst.supabase.co
- Partner auth: email/password login
- RLS: sadece kendi partner_id kayıtları görünür

### Klasör Yapısı
```
app/          → expo-router sayfaları
lib/          → supabase client, utils
assets/       → görseller
```

### EAS Build
```bash
eas build --platform android --profile preview   # test APK
eas build --platform android --profile production # store
```

### Bağımlılıklar
- `react-native-hce` → NFC HCE (bare workflow zorunlu)
- `@supabase/supabase-js` → backend bağlantısı
- `expo-router` → navigation

## Bilinen Sorunlar / Çözümleri
- react-native-hce Expo managed'da çalışmaz → bare workflow veya dev client gerekir
- Android NFC izni: `AndroidManifest.xml`'de `CHANGE_COMPONENT_ENABLED_STATE` gerekebilir
- Supabase realtime mobile'da arka planda kesilir → reconnect mantığı ekle
