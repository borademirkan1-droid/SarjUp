-- Super admin helper for RLS checks
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (auth.jwt() ->> 'role') = 'super_admin'
    OR (auth.jwt() -> 'app_metadata' ->> 'role') = 'super_admin'
    OR (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Single-row app settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  company_name text NOT NULL DEFAULT 'ŞarjUp',
  default_commission_rate numeric NOT NULL DEFAULT 30 CHECK (default_commission_rate >= 0 AND default_commission_rate <= 100),
  currency text NOT NULL DEFAULT 'TL',
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by uuid
);

CREATE OR REPLACE FUNCTION update_app_settings_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_app_settings_updated_at ON app_settings;
CREATE TRIGGER trg_app_settings_updated_at
BEFORE UPDATE ON app_settings
FOR EACH ROW
EXECUTE FUNCTION update_app_settings_updated_at();

ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admins can manage app_settings" ON app_settings;
CREATE POLICY "Super admins can manage app_settings"
  ON app_settings FOR ALL
  USING (is_super_admin())
  WITH CHECK (is_super_admin());
