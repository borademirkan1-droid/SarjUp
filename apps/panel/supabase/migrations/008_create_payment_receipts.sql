-- payment_receipts tablosu: Partner banka dekontlarını tutar
-- Admin onay/red akışı + NFC token tetiklemesi için

CREATE TYPE receipt_status AS ENUM ('pending', 'approved', 'rejected');

CREATE TABLE payment_receipts (
  id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id       uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  device_id        uuid REFERENCES devices(id) ON DELETE SET NULL,
  payment_id       uuid REFERENCES payments(id) ON DELETE SET NULL,
  amount           numeric NOT NULL CHECK (amount > 0),
  receipt_url      text NOT NULL,
  receipt_filename text,
  status           receipt_status DEFAULT 'pending' NOT NULL,
  rejection_reason text,
  admin_note       text,
  reviewed_by      uuid,
  reviewed_at      timestamptz,
  nfc_token_id     uuid,
  created_at       timestamptz DEFAULT now()
);

CREATE INDEX idx_payment_receipts_partner_id ON payment_receipts(partner_id);
CREATE INDEX idx_payment_receipts_status ON payment_receipts(status);
CREATE INDEX idx_payment_receipts_created_at ON payment_receipts(created_at DESC);

ALTER TABLE payment_receipts ENABLE ROW LEVEL SECURITY;

-- Super admin: tüm dekontlara tam erişim
CREATE POLICY "super_admin_all_receipts" ON payment_receipts
  FOR ALL TO authenticated
  USING (is_super_admin());

-- Partner: sadece kendi dekontlarını görebilir
CREATE POLICY "partner_own_receipts" ON payment_receipts
  FOR SELECT TO authenticated
  USING (partner_id = auth.uid());
