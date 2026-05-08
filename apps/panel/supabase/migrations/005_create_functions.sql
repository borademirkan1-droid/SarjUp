-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for partners updated_at
CREATE TRIGGER update_partners_updated_at
  BEFORE UPDATE ON partners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Full-text search function for partners
CREATE OR REPLACE FUNCTION search_partners(search_query text)
RETURNS SETOF partners AS $$
BEGIN
  RETURN QUERY
    SELECT * FROM partners
    WHERE
      full_name ILIKE '%' || search_query || '%'
      OR email ILIKE '%' || search_query || '%'
      OR phone ILIKE '%' || search_query || '%'
      OR tc_no ILIKE '%' || search_query || '%'
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Full-text search function for businesses
CREATE OR REPLACE FUNCTION search_businesses(search_query text)
RETURNS SETOF businesses AS $$
BEGIN
  RETURN QUERY
    SELECT * FROM businesses
    WHERE
      name ILIKE '%' || search_query || '%'
      OR phone ILIKE '%' || search_query || '%'
      OR contact_person ILIKE '%' || search_query || '%'
    ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS jsonb AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_devices', (SELECT COUNT(*) FROM devices),
    'active_devices', (SELECT COUNT(*) FROM devices WHERE status = 'active'),
    'total_partners', (SELECT COUNT(*) FROM partners),
    'active_partners', (SELECT COUNT(*) FROM partners WHERE status = 'active'),
    'total_businesses', (SELECT COUNT(*) FROM businesses),
    'active_businesses', (SELECT COUNT(*) FROM businesses WHERE status = 'active'),
    'monthly_revenue', (
      SELECT COALESCE(SUM(amount), 0) FROM payments
      WHERE status = 'completed'
        AND paid_at >= date_trunc('month', now())
    ),
    'monthly_commission', (
      SELECT COALESCE(SUM(commission_amount), 0) FROM payments
      WHERE status = 'completed'
        AND paid_at >= date_trunc('month', now())
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
