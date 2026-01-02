-- Adicionar colunas header_config e footer_config na tabela companies
-- Execute este SQL no Supabase Dashboard

ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS header_config JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS footer_config JSONB DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN companies.header_config IS 'Configurações do header do site público (logo, cores, menu)';
COMMENT ON COLUMN companies.footer_config IS 'Configurações do footer do site público (contatos, redes sociais, links)';

-- Exemplo de dados padrão (opcional - descomente se quiser popular empresas existentes)
/*
UPDATE companies 
SET 
  header_config = jsonb_build_object(
    'logoUrl', NULL,
    'showLogo', true,
    'showMenu', true,
    'backgroundColor', '#ffffff',
    'textColor', '#333333'
  ),
  footer_config = jsonb_build_object(
    'companyName', name,
    'description', NULL,
    'logoUrl', NULL,
    'showLogo', false,
    'address', NULL,
    'phone', phone,
    'email', email,
    'instagram', NULL,
    'facebook', NULL,
    'whatsapp', NULL,
    'quickLinks', '[]'::jsonb,
    'services', '[]'::jsonb,
    'showCopyright', true,
    'backgroundColor', '#1a1a1a',
    'textColor', '#ffffff'
  )
WHERE header_config IS NULL;
*/
