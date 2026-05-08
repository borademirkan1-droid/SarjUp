-- Partner statuses
CREATE TYPE partner_status AS ENUM ('active', 'inactive', 'pending');

-- Business types
CREATE TYPE business_type AS ENUM ('cafe', 'restaurant', 'hotel', 'mall', 'hospital', 'other');

-- Business statuses
CREATE TYPE business_status AS ENUM ('active', 'inactive', 'debt');

-- Device statuses
CREATE TYPE device_status AS ENUM ('active', 'stock', 'maintenance', 'broken', 'retired');

-- Payment methods
CREATE TYPE payment_method AS ENUM ('iyzico', 'bank', 'cash', 'other');

-- Payment statuses
CREATE TYPE payment_status AS ENUM ('completed', 'pending', 'failed', 'refunded');

-- Actor types for activity logs
CREATE TYPE actor_type AS ENUM ('admin', 'partner');
