# Victor

> Bora'nın kişisel AI asistanı — Iron Man Jarvis tarzı

Sesli konuş → Whisper metne çevirsin → Claude (Sonnet) cevaplasın → tarayıcı sesle okusun.

## Stack

| Katman | Teknoloji |
|---|---|
| Framework | Next.js 16 (App Router) + TypeScript |
| Stil | Tailwind CSS v4 + Inter |
| Ses → Metin | OpenAI Whisper (`whisper-1`) |
| AI | Anthropic Claude (`claude-sonnet-4-5`) |
| Metin → Ses | Web Speech API (ücretsiz, tarayıcı built-in) |
| PWA | next-pwa (yüklenebilir, offline) |
| DB | Supabase (opsiyonel — Faz 3'te gelecek) |

## Kurulum

### 1. Bağımlılıkları yükle

```bash
npm install
```

### 2. API key'leri ayarla

```bash
cp .env.example .env.local
```

`.env.local` dosyasını aç ve key'leri doldur:

```env
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

> **Not:** `.env.local` dosyası `.gitignore`'da — asla GitHub'a gitmez.

### 3. Çalıştır

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini aç.

## Kullanım

### Başlatma
1. Sayfayı aç → butona bas → mikrofon izni ver
2. Sistem "BEKLİYOR" moduna girer

### Wake Word — "Hey Victor"
- **"Hey Victor"** veya **"Victor"** de → sistem dinlemeye geçer
- 1 saniye sessizlik → otomatik gönderir → Victor cevaplar

### Stop Komutu
Victor konuşurken şunlardan birini söyle:
- **"Dur"** / **"Sus"** / **"Stop"** / **"Tamam yeter"** / **"Kapat"**
- Ses hemen kesilir, sistem tekrar wake word bekler

### Buton davranışları
| Durum | Butona basınca |
|---|---|
| Kapalı (gri) | Sistemi aç |
| Bekliyor | Sistemi kapat |
| Dinliyor | Kaydı iptal et |
| Konuşuyor | Sesi kes |

### Tarayıcı uyumluluğu
- **Chrome / Edge**: Tam destek (wake word dahil)
- **Firefox**: Çalışır, wake word yok
- **Safari**: Çalışır, wake word yok

## Build & Deploy

```bash
npm run build    # PWA service worker üretilir (webpack mod)
npm run start    # Production sunucu
```

## Proje Yapısı

```
victor-app/
├── app/
│   ├── api/
│   │   ├── chat/route.ts         # Claude API endpoint
│   │   └── transcribe/route.ts   # Whisper STT endpoint
│   ├── globals.css               # Tailwind v4 tema + animasyonlar
│   ├── layout.tsx                # PWA metadata, Inter font
│   └── page.tsx
├── components/
│   └── VoiceChat.tsx             # Ana sesli sohbet UI
├── lib/
│   ├── supabase.ts               # Supabase client (opsiyonel)
│   └── types.ts                  # TypeScript tipleri
├── prompts/
│   └── victor-system.ts          # Victor'un kişilik/sistem promptu
├── public/
│   ├── manifest.json             # PWA manifest
│   └── icons/
├── scripts/
│   └── generate-icons.mjs        # PWA ikon üretici
└── .env.example                  # Key isimleri (değersiz, GitHub'a gider)
```

## Renk Paleti

| İsim | Hex | Kullanım |
|---|---|---|
| Background | `#0A0A0A` | Sayfa zemini |
| Surface | `#1A1A1A` | Kart, bubble arka planı |
| Accent (Cyan) | `#00D4FF` | Mikrofon, vurgu, HUD elementleri |
| Text Primary | `#FFFFFF` | Başlıklar |
| Text Secondary | `#A0A0A0` | Mesajlar, açıklamalar |
