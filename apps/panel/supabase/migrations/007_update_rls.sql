-- Backward-compatible admin check:
-- accepts both admin and super_admin roles.
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'super_admin')
    OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin', 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PARTNERS
DROP POLICY IF EXISTS "Admins can do everything on partners" ON partners;
DROP POLICY IF EXISTS "Super admins can do everything on partners" ON partners;
CREATE POLICY "Super admins can do everything on partners"
  ON partners FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- BUSINESSES
DROP POLICY IF EXISTS "Admins can do everything on businesses" ON businesses;
DROP POLICY IF EXISTS "Super admins can do everything on businesses" ON businesses;
CREATE POLICY "Super admins can do everything on businesses"
  ON businesses FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- DEVICES
DROP POLICY IF EXISTS "Admins can do everything on devices" ON devices;
DROP POLICY IF EXISTS "Super admins can do everything on devices" ON devices;
CREATE POLICY "Super admins can do everything on devices"
  ON devices FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- PAYMENTS
DROP POLICY IF EXISTS "Admins can do everything on payments" ON payments;
DROP POLICY IF EXISTS "Super admins can do everything on payments" ON payments;
CREATE POLICY "Super admins can do everything on payments"
  ON payments FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());

-- ACTIVITY LOGS
DROP POLICY IF EXISTS "Admins can do everything on activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Super admins can do everything on activity_logs" ON activity_logs;
CREATE POLICY "Super admins can do everything on activity_logs"
  ON activity_logs FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
