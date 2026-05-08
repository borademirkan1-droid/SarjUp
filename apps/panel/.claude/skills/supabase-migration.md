# Skill: Supabase Migration

Veritabanı şema değişikliği için kullan.

## Adımlar

1. Migration dosyası oluştur:
```bash
supabase migration new <isim>
# Örn: supabase migration new add_nfc_columns_to_devices
```

2. SQL yaz (`supabase/migrations/<timestamp>_<isim>.sql`):
```sql
-- Örnek: kolon ekle
ALTER TABLE devices 
ADD COLUMN IF NOT EXISTS hmac_secret TEXT,
ADD COLUMN IF NOT EXISTS nfc_counter INTEGER DEFAULT 0;

-- Örnek: RLS politikası
CREATE POLICY "partner_kendi_devices" ON devices
  FOR SELECT USING (auth.uid() = partner_id);
```

3. Lokal test (varsa):
```bash
supabase db reset
```

4. Uzak sunucuya uygula:
```bash
supabase db push
```

5. Doğrula:
```bash
supabase db diff
```

## Önemli Kurallar
- `DROP TABLE` / `DROP COLUMN` yazmadan önce MUTLAKA sor
- RLS politikası değişikliği = mevcut politikaları listele, sonra güncelle
- Migration geri alınamaz → önce test et

## Supabase Proje
- URL: https://turvyyedodkpnvlrorst.supabase.co
- Dashboard: https://supabase.com/dashboard/project/turvyyedodkpnvlrorst
