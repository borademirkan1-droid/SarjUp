-- Migration 012: devices tablosuna NFC akışı için eksik kolonlar
-- hmac_key, last_counter, subscription_end_date zaten mevcut.
-- Yalnızca last_renewed_at ekleniyor.

ALTER TABLE devices
  ADD COLUMN IF NOT EXISTS last_renewed_at timestamptz;

-- Kolon belgeleri
COMMENT ON COLUMN devices.hmac_key IS '32 byte hex HMAC secret — sadece super_admin görür, client''a asla döndürülmez';
COMMENT ON COLUMN devices.last_counter IS 'NFC replay koruması için monoton artan sayaç';
COMMENT ON COLUMN devices.subscription_end_date IS 'Abonelik bitiş tarihi — ESP32 RTC bu değere göre çalışır';
COMMENT ON COLUMN devices.last_renewed_at IS 'Son NFC token üretim zamanı (Edge Function tarafından yazılır)';
