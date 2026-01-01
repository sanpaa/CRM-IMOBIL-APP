-- Migration: Newsletter Subscribers and Website Themes
-- Description: Add newsletter subscription tracking and global theme configuration
-- Date: 2025-12-31

-- =====================================================
-- 1. Newsletter Subscribers Table
-- =====================================================

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    subscribed_at TIMESTAMP DEFAULT NOW(),
    source VARCHAR(50) DEFAULT 'website',
    active BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT unique_email_company UNIQUE(email, company_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_newsletter_company ON newsletter_subscribers(company_id);
CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_active ON newsletter_subscribers(active) WHERE active = TRUE;
CREATE INDEX IF NOT EXISTS idx_newsletter_created ON newsletter_subscribers(created_at DESC);

-- =====================================================
-- 2. Add Theme Configuration to Companies
-- =====================================================

-- Adicionar coluna visual_config se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'companies' AND column_name = 'visual_config'
    ) THEN
        ALTER TABLE companies ADD COLUMN visual_config JSONB DEFAULT '{"theme": {}}';
    END IF;
END $$;

-- =====================================================
-- 3. Triggers para updated_at
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para newsletter_subscribers
DROP TRIGGER IF EXISTS update_newsletter_subscribers_updated_at ON newsletter_subscribers;
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 4. Default Theme Configuration (Example)
-- =====================================================

-- Update companies sem visual_config definido
UPDATE companies 
SET visual_config = '{
  "theme": {
    "primaryColor": "#004AAD",
    "secondaryColor": "#FFA500",
    "accentColor": "#2c7a7b",
    "textColor": "#333333",
    "textLightColor": "#718096",
    "backgroundColor": "#ffffff",
    "backgroundDark": "#1a202c",
    "borderColor": "#e2e8f0",
    "successColor": "#10b981",
    "errorColor": "#ef4444",
    "warningColor": "#f59e0b",
    "infoColor": "#3b82f6",
    "linkColor": "#004AAD"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": "1rem",
    "fontWeight": "400",
    "lineHeight": "1.6"
  },
  "spacing": {
    "borderRadius": "8px",
    "paddingSmall": "0.5rem",
    "paddingMedium": "1rem",
    "paddingLarge": "2rem"
  }
}'::jsonb
WHERE visual_config IS NULL OR visual_config = '{}'::jsonb OR visual_config->'theme' IS NULL;

-- =====================================================
-- 5. Comments and Documentation
-- =====================================================

COMMENT ON TABLE newsletter_subscribers IS 'Stores email subscriptions from website newsletter forms';
COMMENT ON COLUMN newsletter_subscribers.email IS 'Subscriber email address';
COMMENT ON COLUMN newsletter_subscribers.company_id IS 'Company that owns this subscription';
COMMENT ON COLUMN newsletter_subscribers.source IS 'Source of subscription (website, landing-page, etc)';
COMMENT ON COLUMN newsletter_subscribers.active IS 'Whether subscription is active (unsubscribe sets to false)';
COMMENT ON COLUMN newsletter_subscribers.metadata IS 'Additional data like name, preferences, tags';

COMMENT ON COLUMN companies.visual_config IS 'Global theme colors, typography and spacing configuration for website builder';

-- =====================================================
-- 6. Sample Data (Optional - Remove in production)
-- =====================================================

-- Uncomment to add sample data
/*
INSERT INTO newsletter_subscribers (email, company_id, source, active) 
VALUES 
  ('teste1@email.com', (SELECT id FROM companies LIMIT 1), 'website', TRUE),
  ('teste2@email.com', (SELECT id FROM companies LIMIT 1), 'landing-page', TRUE)
ON CONFLICT (email, company_id) DO NOTHING;
*/

-- =====================================================
-- 7. Verification Queries
-- =====================================================

-- Verify table creation
SELECT 
    table_name, 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('newsletter_subscribers')
ORDER BY table_name, ordinal_position;

-- Verify indexes
SELECT 
    tablename, 
    indexname, 
    indexdef 
FROM pg_indexes 
WHERE tablename IN ('newsletter_subscribers')
ORDER BY tablename, indexname;

-- Verify companies have visual_config
SELECT 
    id,
    name,
    visual_config IS NOT NULL as has_visual_config,
    visual_config->'theme'->>'primaryColor' as primary_color
FROM companies
LIMIT 5;
