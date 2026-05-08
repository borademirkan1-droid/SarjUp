CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES partners(id) ON DELETE RESTRICT,
  external_id TEXT,                    -- Nilvera invoice ID
  invoice_no TEXT,                     -- e.g. SRJ2026000001
  ettn TEXT,                           -- GIB UUID
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','cancelled')),
  receiver_vkn TEXT NOT NULL,
  receiver_title TEXT NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL,
  vat_total NUMERIC(12,2) NOT NULL,
  total NUMERIC(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'TRY',
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  pdf_url TEXT,
  lines JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_invoices_partner_id ON invoices(partner_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin tam erişim" ON invoices FOR ALL USING (auth.uid() IS NOT NULL);
