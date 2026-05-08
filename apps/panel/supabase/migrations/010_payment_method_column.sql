-- Migration 010: payment_method kolonu ve receipt_url opsiyonel yapma
-- Supabase SQL Editor'da çalıştırın.

-- receipt_url mail order için boş bırakılabilir olacak
ALTER TABLE payment_receipts
  ALTER COLUMN receipt_url SET DEFAULT '';

-- payment_method kolonu: banka dekontu mu, mail order mu?
ALTER TABLE payment_receipts
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'bank_transfer';

-- payment_method değerleri: 'bank_transfer' | 'mail_order'
COMMENT ON COLUMN payment_receipts.payment_method IS 'bank_transfer | mail_order';
