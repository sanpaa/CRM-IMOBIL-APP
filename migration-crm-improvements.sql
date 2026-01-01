-- ============================================
-- CRM IMOBILIÁRIO - MIGRATION FOR IMPROVEMENTS
-- ============================================

-- Add new fields to clients table
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS cpf VARCHAR(14),
ADD COLUMN IF NOT EXISTS interest TEXT,
ADD COLUMN IF NOT EXISTS last_status_change TIMESTAMPTZ DEFAULT NOW();

-- Create index on CPF
CREATE INDEX IF NOT EXISTS idx_clients_cpf ON clients(cpf);

-- Update existing clients to set last_status_change
UPDATE clients 
SET last_status_change = updated_at 
WHERE last_status_change IS NULL;

-- ============================================
-- CLIENT NOTES (Immutable)
-- ============================================
CREATE TABLE IF NOT EXISTS client_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_company_id ON client_notes(company_id);

-- ============================================
-- OWNERS (Proprietários)
-- ============================================
CREATE TABLE IF NOT EXISTS owners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  cpf VARCHAR(14),
  phone VARCHAR,
  whatsapp VARCHAR,
  email VARCHAR,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_owners_company_id ON owners(company_id);
CREATE INDEX IF NOT EXISTS idx_owners_cpf ON owners(cpf);

-- Add owner_id to properties
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES owners(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);

-- ============================================
-- REMINDER SETTINGS
-- ============================================
CREATE TABLE IF NOT EXISTS reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  days_without_change INTEGER DEFAULT 15,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  whatsapp_enabled BOOLEAN DEFAULT FALSE,
  contact_email VARCHAR,
  contact_phone VARCHAR,
  contact_whatsapp VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reminder_settings_company_id ON reminder_settings(company_id);

-- ============================================
-- Insert default reminder settings for existing companies
-- (Must be done BEFORE enabling RLS)
-- ============================================
INSERT INTO reminder_settings (company_id, days_without_change)
SELECT id, 15 FROM companies
WHERE id NOT IN (SELECT company_id FROM reminder_settings)
ON CONFLICT DO NOTHING;

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_owners_updated_at ON owners;
CREATE TRIGGER update_owners_updated_at 
  BEFORE UPDATE ON owners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_reminder_settings_updated_at ON reminder_settings;
CREATE TRIGGER update_reminder_settings_updated_at 
  BEFORE UPDATE ON reminder_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Trigger to update last_status_change when status changes
-- ============================================
CREATE OR REPLACE FUNCTION update_client_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        NEW.last_status_change = NOW();
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trigger_client_status_change ON clients;
CREATE TRIGGER trigger_client_status_change
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_client_status_change();

-- ============================================
-- ROW LEVEL SECURITY (RLS) - DISABLED
-- Note: Using custom authentication without Supabase Auth
-- RLS policies won't work because auth.uid() is NULL
-- Security is handled at application level
-- ============================================

-- Disable RLS on new tables (using custom auth)
ALTER TABLE client_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE owners DISABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_settings DISABLE ROW LEVEL SECURITY;

