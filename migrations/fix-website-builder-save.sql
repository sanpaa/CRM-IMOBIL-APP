-- ============================================
-- MIGRATION: Website Layouts Storage URLs
-- Date: 2026-01-26
-- Description: Adiciona colunas para armazenar URLs do Storage
--              quando o HTML/CSS é muito grande para inline
-- ============================================

-- 1. Garantir que as colunas html e css existam
ALTER TABLE website_layouts
ADD COLUMN IF NOT EXISTS html TEXT,
ADD COLUMN IF NOT EXISTS css TEXT;

-- 2. Adicionar colunas para URLs do Storage (para conteúdo grande)
ALTER TABLE website_layouts
ADD COLUMN IF NOT EXISTS html_url TEXT,
ADD COLUMN IF NOT EXISTS css_url TEXT;

-- 3. Comentários explicativos
COMMENT ON COLUMN website_layouts.html IS 'HTML inline para layouts pequenos (< 50KB)';
COMMENT ON COLUMN website_layouts.css IS 'CSS inline para layouts pequenos (< 50KB)';
COMMENT ON COLUMN website_layouts.html_url IS 'URL do Supabase Storage para HTML grande';
COMMENT ON COLUMN website_layouts.css_url IS 'URL do Supabase Storage para CSS grande';

-- ============================================
-- 4. Configurar Storage Bucket
-- ============================================
-- Executar no painel do Supabase > Storage > New Bucket
-- Nome: website-layouts
-- Public: false
-- File size limit: 10MB
--
-- Ou via SQL (pode não funcionar dependendo das permissões):
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('website-layouts', 'website-layouts', false, 10485760)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. Políticas de Acesso ao Storage
-- ============================================
-- Permite que usuários autenticados façam upload de layouts
-- (Executar no Supabase Dashboard > Storage > Policies)

-- Política para INSERT (upload)
CREATE POLICY "Authenticated users can upload layouts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'website-layouts'
);

-- Política para SELECT (download) 
CREATE POLICY "Authenticated users can read layouts"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'website-layouts'
);

-- Política para UPDATE (sobrescrever)
CREATE POLICY "Authenticated users can update layouts"
ON storage.objects FOR UPDATE
TO authenticated
USING (
    bucket_id = 'website-layouts'
);

-- Política para DELETE
CREATE POLICY "Authenticated users can delete layouts"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'website-layouts'
);

-- ============================================
-- 6. Verificar estrutura
-- ============================================
SELECT 
    column_name, 
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'website_layouts'
AND column_name IN ('html', 'css', 'html_url', 'css_url')
ORDER BY ordinal_position;

-- ============================================
-- INSTRUÇÕES DE CONFIGURAÇÃO MANUAL:
-- ============================================
-- Se as políticas de Storage falharem via SQL, configure manualmente:
--
-- 1. Vá para Supabase Dashboard > Storage
-- 2. Clique em "New Bucket"
-- 3. Nome: website-layouts
-- 4. Desmarque "Public bucket"
-- 5. File size limit: 10MB
-- 6. Clique em "Create bucket"
--
-- 7. Clique no bucket criado > Policies
-- 8. Adicione políticas para authenticated:
--    - SELECT: Permitir download
--    - INSERT: Permitir upload
--    - UPDATE: Permitir atualização
--    - DELETE: Permitir exclusão
-- ============================================
