# Skill: Yeni Sayfa Ekle (sarjup-panel)

Admin paneline yeni sayfa eklerken kullan.

## Dosya Yapısı
```
app/
  (dashboard)/
    <sayfa-adi>/
      page.tsx        ← sunucu bileşeni (veri çeker)
components/
  <SayfaAdi>/
    index.tsx         ← istemci bileşeni (UI)
```

## Şablon: page.tsx
```typescript
import { createServerClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import SayfaComponent from '@/components/SayfaAdi'

export default async function SayfaPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase.from('tablo').select('*')
  
  return <SayfaComponent data={data ?? []} />
}
```

## Kontrol Listesi
- [ ] Sayfa erişim kontrolü var mı? (auth check)
- [ ] RLS politikası doğru mu? (sadece yetkili veri gelsin)
- [ ] Loading state var mı?
- [ ] Hata durumu handle ediliyor mu?
- [ ] Sidebar navigation'a eklendi mi?
