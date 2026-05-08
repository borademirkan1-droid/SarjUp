-- Migration 011: Admin rolü için RLS politikaları
-- is_admin() fonksiyonu 007'de zaten tanımlı; burada REPLACE ediyoruz
-- (jwt().role veya app_metadata/user_metadata üzerinden kontrol).
-- Mevcut super_admin politikaları DOKUNULMADAN bırakılıyor.

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'role')::text IN ('super_admin', 'admin')
    OR (auth.jwt() -> 'app_metadata' ->> 'role')::text IN ('super_admin', 'admin')
    OR (auth.jwt() -> 'user_metadata'  ->> 'role')::text IN ('super_admin', 'admin'),
    false
  )
$$;

-- partners
CREATE POLICY IF NOT EXISTS "admin_all_partners" ON partners
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- businesses
CREATE POLICY IF NOT EXISTS "admin_all_businesses" ON businesses
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- devices
CREATE POLICY IF NOT EXISTS "admin_all_devices" ON devices
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- payments
CREATE POLICY IF NOT EXISTS "admin_all_payments" ON payments
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- activity_logs
CREATE POLICY IF NOT EXISTS "admin_all_activity_logs" ON activity_logs
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- payment_receipts
CREATE POLICY IF NOT EXISTS "admin_all_receipts" ON payment_receipts
  FOR ALL TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());
