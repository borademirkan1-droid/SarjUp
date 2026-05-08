-- payment_receipts tablosuna iyzico mail order için gerekli kolon
ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS iyzico_conversation_id text;

-- Callback'te hızlı arama için index
CREATE INDEX IF NOT EXISTS idx_payment_receipts_iyzico_conversation
  ON payment_receipts (iyzico_conversation_id)
  WHERE iyzico_conversation_id IS NOT NULL;
