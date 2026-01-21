-- ============================================================================
-- MIGRATION: Tenant Database Schema
-- Description: Creates tables for each individual tenant (imobiliária)
-- Version: 1.0.0
-- Date: 2026-01-11
-- Note: This migration must be run for EACH new tenant database
-- ============================================================================

-- ============================================================================
-- 1. PROPERTIES TABLE (Imóveis)
-- ============================================================================

CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50), -- 'casa', 'apartamento', 'terreno', etc.
  transaction_type VARCHAR(50), -- 'venda', 'locacao', 'ambos'
  
  -- Location
  address VARCHAR(255),
  neighborhood VARCHAR(100),
  city VARCHAR(100),
  state VARCHAR(2),
  zip_code VARCHAR(10),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Details
  bedrooms INTEGER,
  bathrooms INTEGER,
  suites INTEGER,
  parking_spots INTEGER,
  total_area DECIMAL(10, 2),
  built_area DECIMAL(10, 2),
  
  -- Pricing
  price DECIMAL(12, 2),
  rental_price DECIMAL(10, 2),
  condominium_fee DECIMAL(10, 2),
  iptu DECIMAL(10, 2),
  
  -- Owner
  owner_client_id UUID,
  
  -- Status
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'sold', 'rented', 'archived'
  is_featured BOOLEAN DEFAULT false,

  -- Quality score (0-100)
  quality_score INTEGER,
  
  -- Media
  images JSONB DEFAULT '[]',
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  CONSTRAINT properties_quality_score_check CHECK (quality_score IS NULL OR (quality_score BETWEEN 0 AND 100))
);

-- Ensure columns exist when the table was created in an older version
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'properties'
      AND column_name = 'property_type'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'properties'
      AND column_name = 'type'
  ) THEN
    EXECUTE 'ALTER TABLE properties RENAME COLUMN property_type TO type';
  END IF;
END $$;

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS transaction_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

CREATE INDEX idx_properties_type ON properties(type);
CREATE INDEX idx_properties_transaction ON properties(transaction_type);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_price ON properties(price);

-- Full-text search
CREATE INDEX idx_properties_search ON properties USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(description, '')));

-- ============================================================================
-- 2. CLIENTS TABLE (Clientes e Leads)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic info
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  cpf_cnpj VARCHAR(20),
  
  -- Type
  client_type VARCHAR(50) DEFAULT 'lead', -- 'lead', 'buyer', 'seller', 'owner'
  
  -- Preferences
  interest_type VARCHAR(50), -- 'compra', 'locacao', 'venda'
  min_price DECIMAL(12, 2),
  max_price DECIMAL(12, 2),
  preferred_neighborhoods TEXT[],
  preferred_property_types TEXT[],
  
  -- Assignment
  assigned_user_id UUID,
  
  -- Status
  status VARCHAR(50) DEFAULT 'new', -- 'new', 'contacted', 'qualified', 'converted', 'lost'
  
  -- Notes
  notes TEXT,
  tags TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_contact_at TIMESTAMP,
  deleted_at TIMESTAMP
);

ALTER TABLE clients
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'new';

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_type ON clients(client_type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_assigned_user ON clients(assigned_user_id);

-- ============================================================================
-- 3. LEADS TABLE (Central de Leads)
-- ============================================================================

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic info
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(255),

  -- Source and status
  source VARCHAR(20) NOT NULL, -- 'WHATSAPP', 'SITE', 'PORTAL', 'MANUAL'
  status VARCHAR(20) NOT NULL, -- 'NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'

  -- Assignment and conversion
  assigned_user_id UUID,
  converted_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  last_interaction_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,

  CONSTRAINT leads_source_check CHECK (source IN ('WHATSAPP', 'SITE', 'PORTAL', 'MANUAL')),
  CONSTRAINT leads_status_check CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'))
);

CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_assigned_user ON leads(assigned_user_id);
CREATE INDEX idx_leads_last_interaction ON leads(last_interaction_at);

-- ============================================================================
-- 4. ACTIVITIES TABLE (Timeline Global)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Activity details
  entity_type VARCHAR(20) NOT NULL, -- 'LEAD', 'CLIENT', 'DEAL', 'PROPERTY'
  entity_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL, -- 'NOTE', 'MESSAGE', 'VISIT', 'STATUS', 'SYSTEM'
  description TEXT,
  user_id UUID, -- NULL if system action

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,

  CONSTRAINT activities_entity_type_check CHECK (entity_type IN ('LEAD', 'CLIENT', 'DEAL', 'PROPERTY')),
  CONSTRAINT activities_type_check CHECK (type IN ('NOTE', 'MESSAGE', 'VISIT', 'STATUS', 'SYSTEM'))
);

CREATE INDEX idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX idx_activities_created_at ON activities(created_at);

-- ============================================================================
-- 5. VISITS TABLE (Visitas Agendadas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  user_id UUID, -- Corretor responsável
  
  -- Schedule
  visit_date DATE NOT NULL,
  visit_time TIME NOT NULL,
  scheduled_datetime TIMESTAMP GENERATED ALWAYS AS (visit_date + visit_time) STORED,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
  
  -- Feedback
  feedback TEXT,
  client_interest_level INTEGER CHECK (client_interest_level BETWEEN 1 AND 5),
  
  -- Notifications
  reminder_sent BOOLEAN DEFAULT false,
  confirmation_sent BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  deleted_at TIMESTAMP
);

ALTER TABLE visits
  ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'scheduled';

CREATE INDEX idx_visits_property_id ON visits(property_id);
CREATE INDEX idx_visits_client_id ON visits(client_id);
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_status ON visits(status);

-- ============================================================================
-- 6. DEAL STAGES TABLE (Pipeline de Negócios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deal_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  "order" INTEGER NOT NULL,
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP,
  CONSTRAINT deal_stages_won_lost_check CHECK (NOT (is_won AND is_lost))
);

CREATE UNIQUE INDEX idx_deal_stages_order ON deal_stages("order");

-- ============================================================================
-- 7. DEALS TABLE (Negócios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  user_id UUID,
  stage_id UUID REFERENCES deal_stages(id) ON DELETE SET NULL,
  proposed_value NUMERIC(14,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  closed_at TIMESTAMP,
  deleted_at TIMESTAMP
);

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS status VARCHAR(50);

CREATE INDEX idx_deals_stage_id ON deals(stage_id);
CREATE INDEX idx_deals_user_id ON deals(user_id);
CREATE INDEX idx_deals_status ON deals(status);

-- ============================================================================
-- 8. STORE_SETTINGS TABLE (Configurações da Loja)
-- ============================================================================

CREATE TABLE IF NOT EXISTS store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Branding
  company_name VARCHAR(255),
  logo_url TEXT,
  favicon_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#004AAD',
  secondary_color VARCHAR(7) DEFAULT '#FFA500',
  
  -- Contact
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  whatsapp_number VARCHAR(50),
  address TEXT,
  
  -- Social media
  facebook_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  youtube_url TEXT,
  
  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Features
  enable_blog BOOLEAN DEFAULT false,
  enable_newsletter BOOLEAN DEFAULT false,
  enable_chat BOOLEAN DEFAULT false,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO store_settings (company_name, primary_color, secondary_color)
VALUES ('Minha Imobiliária', '#004AAD', '#FFA500')
ON CONFLICT DO NOTHING;

-- ============================================================================
-- 5. WEBSITE_LAYOUTS TABLE (Layouts do Site)
-- ============================================================================

CREATE TABLE IF NOT EXISTS website_layouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Layout info
  company_id UUID,
  name VARCHAR(100) NOT NULL,
  page_type VARCHAR(50) NOT NULL, -- 'home', 'properties', 'contact', etc.
  slug VARCHAR(100),
  is_active BOOLEAN DEFAULT false,
  is_default BOOLEAN DEFAULT false,
  
  -- Configuration (JSON)
  layout_config JSONB DEFAULT '{}',
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE website_layouts
  ADD COLUMN IF NOT EXISTS company_id UUID,
  ADD COLUMN IF NOT EXISTS page_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS slug VARCHAR(100),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_default BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS meta_title VARCHAR(255),
  ADD COLUMN IF NOT EXISTS meta_description TEXT,
  ADD COLUMN IF NOT EXISTS meta_keywords TEXT;

CREATE INDEX IF NOT EXISTS idx_website_layouts_company_id ON website_layouts(company_id);
CREATE INDEX IF NOT EXISTS idx_website_layouts_page_type ON website_layouts(page_type);
CREATE INDEX IF NOT EXISTS idx_website_layouts_active ON website_layouts(is_active);

-- ============================================================================
-- 6. WHATSAPP_MESSAGES TABLE (Mensagens WhatsApp)
-- ============================================================================

CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relations
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  
  -- Message details
  from_number VARCHAR(50),
  to_number VARCHAR(50),
  message_text TEXT,
  message_type VARCHAR(50) DEFAULT 'text', -- 'text', 'image', 'document', etc.
  media_url TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'sent', -- 'sent', 'delivered', 'read', 'failed'
  direction VARCHAR(50), -- 'inbound', 'outbound'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  read_at TIMESTAMP,
  delivered_at TIMESTAMP
);

CREATE INDEX idx_whatsapp_messages_client_id ON whatsapp_messages(client_id);
CREATE INDEX idx_whatsapp_messages_from ON whatsapp_messages(from_number);
CREATE INDEX idx_whatsapp_messages_created_at ON whatsapp_messages(created_at);

-- ============================================================================
-- 7. PROPERTY_DOCUMENTS TABLE (Documentos de Imóveis)
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Document info
  document_name VARCHAR(255) NOT NULL,
  document_type VARCHAR(50), -- 'matricula', 'iptu', 'condominio', etc.
  file_url TEXT NOT NULL,
  file_size INTEGER, -- in bytes
  mime_type VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_property_documents_property_id ON property_documents(property_id);

-- ============================================================================
-- 8. AUTOMATION_RULES TABLE (Automacao)
-- ============================================================================

CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger VARCHAR(50) NOT NULL, -- 'NEW_LEAD', 'NO_RESPONSE_24H', 'DEAL_STAGE_CHANGED'
  condition JSONB,
  action JSONB NOT NULL, -- 'CREATE_TASK', 'SEND_WHATSAPP', 'SEND_EMAIL'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  deleted_at TIMESTAMP
);

CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger);

-- ============================================================================
-- 9. KPI_SNAPSHOTS TABLE (Métricas do Dashboard)
-- ============================================================================

CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  leads_new INTEGER DEFAULT 0,
  visits_done INTEGER DEFAULT 0,
  deals_won INTEGER DEFAULT 0,
  conversion_rate NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_kpi_snapshots_date ON kpi_snapshots(date);

-- ============================================================================
-- 10. ACTIVITY_LOG TABLE (Log de Atividades)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Activity details
  user_id UUID, -- NULL if system action
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id UUID,
  description TEXT,
  
  -- Changes (JSON)
  changes JSONB,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_entity ON activity_log(entity_type, entity_id);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at);

-- ============================================================================
-- 9. TRIGGERS
-- ============================================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_visits_updated_at BEFORE UPDATE ON visits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_store_settings_updated_at BEFORE UPDATE ON store_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_stages_updated_at BEFORE UPDATE ON deal_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Verify installation
SELECT 'Tenant database schema created successfully!' AS status;
