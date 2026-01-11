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
  property_type VARCHAR(50), -- 'casa', 'apartamento', 'terreno', etc.
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
  
  -- Media
  images JSONB DEFAULT '[]',
  video_url TEXT,
  virtual_tour_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_properties_type ON properties(property_type);
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
  last_contact_at TIMESTAMP
);

CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_phone ON clients(phone);
CREATE INDEX idx_clients_type ON clients(client_type);
CREATE INDEX idx_clients_status ON clients(status);
CREATE INDEX idx_clients_assigned_user ON clients(assigned_user_id);

-- ============================================================================
-- 3. VISITS TABLE (Visitas Agendadas)
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
  cancelled_at TIMESTAMP
);

CREATE INDEX idx_visits_property_id ON visits(property_id);
CREATE INDEX idx_visits_client_id ON visits(client_id);
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_visits_date ON visits(visit_date);
CREATE INDEX idx_visits_status ON visits(status);

-- ============================================================================
-- 4. STORE_SETTINGS TABLE (Configurações da Loja)
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
  name VARCHAR(100) NOT NULL,
  template VARCHAR(50) NOT NULL, -- 'modern', 'classic', 'minimalist', etc.
  is_active BOOLEAN DEFAULT false,
  
  -- Configuration (JSON)
  header_config JSONB DEFAULT '{}',
  footer_config JSONB DEFAULT '{}',
  sections_config JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

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
-- 8. ACTIVITY_LOG TABLE (Log de Atividades)
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

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Verify installation
SELECT 'Tenant database schema created successfully!' AS status;
