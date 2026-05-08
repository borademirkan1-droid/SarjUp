# Vercel Monorepo Kurulumu

Her uygulama Vercel'de ayrı bir Project olarak kalır.
Tek değişen: GitHub repo `sarjup` oldu ve her app kendi alt klasöründe.

## Panel (admin.sarjup.com.tr)

Vercel Dashboard → sarjup-panel project → Settings → General:
- **Root Directory:** `apps/panel`
- Framework: Next.js (otomatik algılar)
- Build Command: `next build` (değişmez)

## Website (sarjup.com.tr)

Vercel Dashboard → sarjup-website project → Settings → General:
- **Root Directory:** `apps/website`

## Yeni proje bağlama adımları (eğer yeniden bağlaman gerekirse)

1. Vercel Dashboard → Add New Project
2. Import GitHub repo: `sarjup`
3. Root Directory: `apps/panel` (veya website/victor)
4. Environment Variables kopyala

## Not
Her app kendi `.env.local` dosyasına sahip.
Vercel'de her app'in env var'larını ayrı ayrı tanımla.
