-- Enable RLS on all tables
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PARTNERS policies
CREATE POLICY "Admins can do everything on partners"
  ON partners FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Partners can view their own record"
  ON partners FOR SELECT
  USING (auth.uid() = id);

-- BUSINESSES policies
CREATE POLICY "Admins can do everything on businesses"
  ON businesses FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Partners can view their businesses"
  ON businesses FOR SELECT
  USING (partner_id = auth.uid());

-- DEVICES policies
CREATE POLICY "Admins can do everything on devices"
  ON devices FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Partners can view their devices"
  ON devices FOR SELECT
  USING (partner_id = auth.uid());

-- PAYMENTS policies
CREATE POLICY "Admins can do everything on payments"
  ON payments FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Partners can view their payments"
  ON payments FOR SELECT
  USING (partner_id = auth.uid());

-- ACTIVITY LOGS policies
CREATE POLICY "Admins can do everything on activity_logs"
  ON activity_logs FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Partners can view their own activity"
  ON activity_logs FOR SELECT
  USING (actor_id = auth.uid());
