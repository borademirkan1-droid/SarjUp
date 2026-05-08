-- Partners indexes
CREATE INDEX idx_partners_email ON partners(email);
CREATE INDEX idx_partners_tc_no ON partners(tc_no);
CREATE INDEX idx_partners_city ON partners(city);
CREATE INDEX idx_partners_status ON partners(status);

-- Businesses indexes
CREATE INDEX idx_businesses_partner_id ON businesses(partner_id);
CREATE INDEX idx_businesses_city ON businesses(city);
CREATE INDEX idx_businesses_type ON businesses(business_type);
CREATE INDEX idx_businesses_status ON businesses(status);

-- Devices indexes
CREATE INDEX idx_devices_device_id ON devices(device_id);
CREATE INDEX idx_devices_serial_number ON devices(serial_number);
CREATE INDEX idx_devices_business_id ON devices(business_id);
CREATE INDEX idx_devices_partner_id ON devices(partner_id);
CREATE INDEX idx_devices_status ON devices(status);

-- Payments indexes
CREATE INDEX idx_payments_business_id ON payments(business_id);
CREATE INDEX idx_payments_partner_id ON payments(partner_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_method ON payments(method);
CREATE INDEX idx_payments_paid_at ON payments(paid_at);

-- Activity logs indexes
CREATE INDEX idx_activity_logs_actor_id ON activity_logs(actor_id);
CREATE INDEX idx_activity_logs_resource_type ON activity_logs(resource_type);
CREATE INDEX idx_activity_logs_resource_id ON activity_logs(resource_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
