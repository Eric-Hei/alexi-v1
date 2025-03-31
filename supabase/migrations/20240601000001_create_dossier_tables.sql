-- Create tables for dossier management system

-- Dossiers table
CREATE TABLE IF NOT EXISTS dossiers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dossier_number TEXT NOT NULL,
  creation_date TEXT NOT NULL,
  status TEXT NOT NULL,
  next_deadline TEXT,
  next_action TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tenants table
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Landlords table
CREATE TABLE IF NOT EXISTS landlords (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Unpaid amounts table
CREATE TABLE IF NOT EXISTS unpaid_amounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  amount NUMERIC NOT NULL,
  months INTEGER NOT NULL,
  since TEXT NOT NULL,
  reason TEXT NOT NULL,
  previous_actions TEXT,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status tracking table
CREATE TABLE IF NOT EXISTS status_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL,
  date TEXT NOT NULL,
  dossier_id UUID NOT NULL REFERENCES dossiers(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable row level security
ALTER TABLE dossiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE landlords ENABLE ROW LEVEL SECURITY;
ALTER TABLE unpaid_amounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_tracking ENABLE ROW LEVEL SECURITY;

-- Create policies for access
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON dossiers;
CREATE POLICY "Allow full access to authenticated users"
  ON dossiers FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON tenants;
CREATE POLICY "Allow full access to authenticated users"
  ON tenants FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON landlords;
CREATE POLICY "Allow full access to authenticated users"
  ON landlords FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON unpaid_amounts;
CREATE POLICY "Allow full access to authenticated users"
  ON unpaid_amounts FOR ALL
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow full access to authenticated users" ON status_tracking;
CREATE POLICY "Allow full access to authenticated users"
  ON status_tracking FOR ALL
  USING (auth.role() = 'authenticated');

-- Enable realtime subscriptions
alter publication supabase_realtime add table dossiers;
alter publication supabase_realtime add table tenants;
alter publication supabase_realtime add table landlords;
alter publication supabase_realtime add table unpaid_amounts;
alter publication supabase_realtime add table status_tracking;
