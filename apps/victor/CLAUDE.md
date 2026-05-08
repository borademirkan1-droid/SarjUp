@AGENTS.md

# Victor App — Claude Kuralları

## Proje Özeti
Victor: Bora'nın bilgisayarında çalışan Claude Code worker + Şarjup proje yönetim paneli.
- Next.js 16 + React 19 + TypeScript + Tailwind v4
- Supabase (agent_tasks, agent_activity, victor_messages tabloları)
- Ajanlar: fullstack-gelistirici, elektronik-muhendis, veri-panel, claude-code (local worker)

## Çalışma Kuralları

### 1. Net Çözüme Git
- Uzun açıklama yapma, direkt çalışır kodu yaz
- Pseudocode değil, gerçek implementasyon
- Şüphe varsa en basit çözümü seç

### 2. Zarif Çözüm
Çalışan ama karmaşık kod ürettikten sonra:
> "Remove all previous attempts. Implement only the final working solution — as if written correctly first try."

### 3. Hata Düzeltme
Tam hata mesajını al, kök nedeni bul, tek seferde düzelt.
Döngüye girme — 2 denemede çözemiyorsan farklı yaklaşım dene.

### 4. Dosya Değişikliği
Her değiştirilen dosyayı belirt. Silinen kodu açıkla.

### 5. CLAUDE.md Güncelleme
Tekrarlayan hata veya yeni kural keşfedilince:
> "Update CLAUDE.md so a future Claude with zero context would know NOT to [davranış]"

## Teknik Kurallar
- `app/api/agents/execute/route.ts` → Vercel agent'ları (60s timeout)
- `scripts/worker.ts` → claude-code local worker (PowerShell, sonsuz döngü)
- `prompts/agents.ts` → Tüm ajan system prompt'ları buraya
- `.env.local` → dotenv worker'ın kendisi yüklüyor, `--env-file` flag kullanma
- Worker başlatmak için: `npm run worker` (victor-app dizininde)

## Bilinen Sorunlar / Çözümleri
- `--env-file` flag tsx ile çalışmıyor → worker.ts başında dotenv import kullan
- Node.js `--env-file` uzun değerleri (120+ char) boş bırakıyor → dotenv tercih et
