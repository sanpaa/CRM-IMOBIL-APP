-- ============================================================================
-- MIGRATION: Company Themes Table
-- Description: Cria tabela para armazenar temas personalizados por empresa
-- Date: 2026-01-02
-- ============================================================================

-- Criar extensão UUID se não existir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: company_themes
-- ============================================================================
CREATE TABLE IF NOT EXISTS company_themes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- ========================================
  -- CORES PRINCIPAIS
  -- ========================================
  primary_color VARCHAR(7) NOT NULL DEFAULT '#004AAD',
  secondary_color VARCHAR(7) NOT NULL DEFAULT '#FFA500',
  accent_color VARCHAR(7) NOT NULL DEFAULT '#2c7a7b',
  
  -- ========================================
  -- CORES DE TEXTO
  -- ========================================
  text_color VARCHAR(7) NOT NULL DEFAULT '#333333',
  text_light_color VARCHAR(7) NOT NULL DEFAULT '#718096',
  
  -- ========================================
  -- CORES DE BACKGROUND
  -- ========================================
  background_color VARCHAR(7) NOT NULL DEFAULT '#ffffff',
  background_dark VARCHAR(7) NOT NULL DEFAULT '#1a202c',
  border_color VARCHAR(7) NOT NULL DEFAULT '#e2e8f0',
  
  -- ========================================
  -- CORES DE STATUS
  -- ========================================
  success_color VARCHAR(7) NOT NULL DEFAULT '#10b981',
  error_color VARCHAR(7) NOT NULL DEFAULT '#ef4444',
  warning_color VARCHAR(7) NOT NULL DEFAULT '#f59e0b',
  info_color VARCHAR(7) NOT NULL DEFAULT '#3b82f6',
  link_color VARCHAR(7) NOT NULL DEFAULT '#004AAD',
  
  -- ========================================
  -- TIPOGRAFIA
  -- ========================================
  font_family VARCHAR(255) NOT NULL DEFAULT 'Inter, system-ui, sans-serif',
  font_size VARCHAR(20) NOT NULL DEFAULT '1rem',
  font_weight VARCHAR(20) NOT NULL DEFAULT '400',
  line_height VARCHAR(20) NOT NULL DEFAULT '1.6',
  
  -- ========================================
  -- ESPAÇAMENTOS
  -- ========================================
  border_radius VARCHAR(20) NOT NULL DEFAULT '8px',
  padding_small VARCHAR(20) NOT NULL DEFAULT '0.5rem',
  padding_medium VARCHAR(20) NOT NULL DEFAULT '1rem',
  padding_large VARCHAR(20) NOT NULL DEFAULT '2rem',
  margin_small VARCHAR(20) NOT NULL DEFAULT '0.5rem',
  margin_medium VARCHAR(20) NOT NULL DEFAULT '1rem',
  margin_large VARCHAR(20) NOT NULL DEFAULT '2rem',
  
  -- ========================================
  -- METADADOS
  -- ========================================
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- ========================================
  -- CONSTRAINTS
  -- ========================================
  CONSTRAINT company_themes_company_id_unique UNIQUE(company_id),
  
  -- Validação de cores HEX
  CONSTRAINT valid_primary_color CHECK (primary_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_secondary_color CHECK (secondary_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_accent_color CHECK (accent_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_text_color CHECK (text_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_text_light_color CHECK (text_light_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_background_color CHECK (background_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_background_dark CHECK (background_dark ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_border_color CHECK (border_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_success_color CHECK (success_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_error_color CHECK (error_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_warning_color CHECK (warning_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_info_color CHECK (info_color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_link_color CHECK (link_color ~ '^#[0-9A-Fa-f]{6}$')
);

-- ============================================================================
-- ÍNDICES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_company_themes_company_id ON company_themes(company_id);
CREATE INDEX IF NOT EXISTS idx_company_themes_created_at ON company_themes(created_at);

-- ============================================================================
-- TRIGGER: Atualizar updated_at automaticamente
-- ============================================================================
CREATE OR REPLACE FUNCTION update_company_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_company_themes_updated_at ON company_themes;

CREATE TRIGGER trigger_update_company_themes_updated_at
  BEFORE UPDATE ON company_themes
  FOR EACH ROW
  EXECUTE FUNCTION update_company_themes_updated_at();

-- ============================================================================
-- SEED: Criar temas padrão para empresas existentes
-- ============================================================================
INSERT INTO company_themes (company_id)
SELECT id 
FROM companies
WHERE id NOT IN (SELECT company_id FROM company_themes)
ON CONFLICT (company_id) DO NOTHING;

-- ============================================================================
-- RLS (Row Level Security) - Opcional
-- ============================================================================
-- Descomente se estiver usando RLS no Supabase

-- ALTER TABLE company_themes ENABLE ROW LEVEL SECURITY;

-- -- Policy: Empresas podem ler seus próprios temas
-- CREATE POLICY "Companies can read own themes"
--   ON company_themes
--   FOR SELECT
--   USING (auth.uid() IN (
--     SELECT user_id FROM users WHERE company_id = company_themes.company_id
--   ));

-- -- Policy: Admins podem atualizar temas de sua empresa
-- CREATE POLICY "Admins can update company themes"
--   ON company_themes
--   FOR UPDATE
--   USING (auth.uid() IN (
--     SELECT user_id FROM users 
--     WHERE company_id = company_themes.company_id 
--     AND role = 'admin'
--   ));

-- -- Policy: Admins podem inserir temas
-- CREATE POLICY "Admins can insert company themes"
--   ON company_themes
--   FOR INSERT
--   WITH CHECK (auth.uid() IN (
--     SELECT user_id FROM users 
--     WHERE company_id = company_themes.company_id 
--     AND role = 'admin'
--   ));

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Verificar se a tabela foi criada
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'company_themes') THEN
    RAISE NOTICE '✅ Tabela company_themes criada com sucesso';
  ELSE
    RAISE EXCEPTION '❌ Erro ao criar tabela company_themes';
  END IF;
END $$;

-- Contar registros criados
DO $$
DECLARE
  theme_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO theme_count FROM company_themes;
  RAISE NOTICE '✅ % temas padrão criados', theme_count;
END $$;

-- ============================================================================
-- QUERIES ÚTEIS
-- ============================================================================

-- Ver todos os temas
-- SELECT 
--   ct.*,
--   c.name as company_name
-- FROM company_themes ct
-- JOIN companies c ON c.id = ct.company_id
-- ORDER BY ct.created_at DESC;

-- Ver tema de uma empresa específica
-- SELECT * FROM company_themes WHERE company_id = 'YOUR_COMPANY_ID';

-- Atualizar tema de uma empresa
-- UPDATE company_themes 
-- SET primary_color = '#FF0000'
-- WHERE company_id = 'YOUR_COMPANY_ID';

-- Deletar tema (volta para o padrão)
-- DELETE FROM company_themes WHERE company_id = 'YOUR_COMPANY_ID';

-- ============================================================================
-- ROLLBACK (caso necessário)
-- ============================================================================

-- DROP TRIGGER IF EXISTS trigger_update_company_themes_updated_at ON company_themes;
-- DROP FUNCTION IF EXISTS update_company_themes_updated_at();
-- DROP TABLE IF EXISTS company_themes CASCADE;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
