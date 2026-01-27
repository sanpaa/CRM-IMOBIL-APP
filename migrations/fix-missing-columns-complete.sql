-- ============================================
-- MIGRATION: Fix Missing Columns and Features
-- Date: 2026-01-27
-- Description: Unifica todas as correções de colunas ausentes reportadas
--              - Website Builder (html, css, storage urls)
--              - Dados da Empresa/Corretor (creci, address, phone...)
-- ============================================

-- 1. WEBSITE BUILDER: Garantir suporte a layout e storage
ALTER TABLE website_layouts
ADD COLUMN IF NOT EXISTS html TEXT,
ADD COLUMN IF NOT EXISTS css TEXT,
ADD COLUMN IF NOT EXISTS html_url TEXT,
ADD COLUMN IF NOT EXISTS css_url TEXT;

COMMENT ON COLUMN website_layouts.html IS 'HTML inline para layouts pequenos (< 50KB)';
COMMENT ON COLUMN website_layouts.css IS 'CSS inline para layouts pequenos (< 50KB)';
COMMENT ON COLUMN website_layouts.html_url IS 'URL do Supabase Storage para HTML grande';
COMMENT ON COLUMN website_layouts.css_url IS 'URL do Supabase Storage para CSS grande';

-- 2. DADOS DA EMPRESA: Garantir campos CRECI e endereço
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS creci VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- 3. DADOS DE USUÁRIOS: Garantir campos CRECI e telefone
ALTER TABLE users
ADD COLUMN IF NOT EXISTS creci VARCHAR(50),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- ============================================
-- 4. Supabase Storage Configuration (Verificação)
-- ============================================
-- Tenta criar o bucket se não existir via SQL
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('website-layouts', 'website-layouts', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- Policies (Recria se não existirem - ignora se duplicado)
DO $$
BEGIN
    -- INSERT Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload layouts'
    ) THEN
        CREATE POLICY "Authenticated users can upload layouts" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'website-layouts');
    END IF;

    -- SELECT Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read layouts'
    ) THEN
        CREATE POLICY "Authenticated users can read layouts" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'website-layouts');
    END IF;

    -- UPDATE Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can update layouts'
    ) THEN
        CREATE POLICY "Authenticated users can update layouts" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'website-layouts');
    END IF;

    -- DELETE Policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete layouts'
    ) THEN
        CREATE POLICY "Authenticated users can delete layouts" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'website-layouts');
    END IF;
END $$;

-- ============================================
-- 5. Validação da Estrutura
-- ============================================
SELECT 
    table_name, 
    column_name, 
    data_type
FROM information_schema.columns 
WHERE (table_name = 'website_layouts' AND column_name IN ('html', 'css', 'html_url', 'css_url'))
   OR (table_name = 'companies' AND column_name IN ('creci', 'address', 'logo_url'))
   OR (table_name = 'users' AND column_name IN ('creci', 'phone'))
ORDER BY table_name, ordinal_position;
