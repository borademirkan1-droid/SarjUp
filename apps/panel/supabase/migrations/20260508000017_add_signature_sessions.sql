CREATE TABLE IF NOT EXISTS signature_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_type TEXT NOT NULL,
  document_ref_id UUID NOT NULL,
  document_hash TEXT NOT NULL,
  document_title TEXT NOT NULL,
  signer_phone TEXT NOT NULL,
  signer_name TEXT NOT NULL,
  external_session_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','otp_sent','completed','rejected','expired','cancelled')),
  signature_value TEXT,
  certificate_serial TEXT,
  expires_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sig_sessions_status ON signature_sessions(status);
CREATE INDEX IF NOT EXISTS idx_sig_sessions_doc_ref ON signature_sessions(document_ref_id);

ALTER TABLE signature_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin tam erişim" ON signature_sessions FOR ALL USING (auth.uid() IS NOT NULL);
