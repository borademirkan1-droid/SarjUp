-- Partners table
CREATE TABLE partners (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name text NOT NULL,
  tc_no varchar(11) UNIQUE NOT NULL,
  phone text NOT NULL,
  email text UNIQUE NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  address text NOT NULL,
  company_name text,
  tax_number text,
  commission_rate numeric DEFAULT 30 CHECK (commission_rate >= 0 AND commission_rate <= 100),
  status partner_status DEFAULT 'pending' NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Businesses table
CREATE TABLE businesses (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id uuid REFERENCES partners(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  business_type business_type NOT NULL,
  phone text NOT NULL,
  email text,
  address text NOT NULL,
  city text NOT NULL,
  district text NOT NULL,
  contact_person text NOT NULL,
  contact_phone text NOT NULL,
  device_count integer DEFAULT 0,
  monthly_fee numeric NOT NULL,
  contract_start_date date NOT NULL,
  status business_status DEFAULT 'active' NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Devices table
CREATE TABLE devices (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id text UNIQUE NOT NULL,
  serial_number text UNIQUE NOT NULL,
  business_id uuid REFERENCES businesses(id) ON DELETE SET NULL,
  partner_id uuid REFERENCES partners(id) ON DELETE SET NULL,
  production_batch text,
  production_date date NOT NULL,
  activation_date date,
  last_maintenance date,
  battery_health integer DEFAULT 100 CHECK (battery_health >= 0 AND battery_health <= 100),
  status device_status DEFAULT 'stock' NOT NULL,
  subscription_end_date date,
  hmac_key text,
  last_counter integer DEFAULT 0,
  total_uses integer DEFAULT 0,
  total_usage_hours numeric DEFAULT 0,
  monthly_avg_usage numeric DEFAULT 0,
  stock_location text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE payments (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_no text UNIQUE NOT NULL,
  business_id uuid REFERENCES businesses(id) NOT NULL,
  partner_id uuid REFERENCES partners(id) NOT NULL,
  amount numeric NOT NULL,
  commission_rate numeric NOT NULL,
  commission_amount numeric NOT NULL,
  net_amount numeric NOT NULL,
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending' NOT NULL,
  iyzico_transaction_id text,
  bank_reference text,
  invoice_exists boolean DEFAULT false,
  refund_info jsonb,
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Activity logs table
CREATE TABLE activity_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_id uuid NOT NULL,
  actor_type actor_type NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id uuid,
  details jsonb,
  ip_address text,
  created_at timestamptz DEFAULT now()
);
