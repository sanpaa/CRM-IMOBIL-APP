-- ============================================
-- FIX STORAGE PERMISSIONS
-- Date: 2026-01-27
-- Description: Cria o bucket website-layouts e configura permissões
--              Execute este script no Supabase SQL Editor
-- ============================================

-- 1. Criação do Bucket (se não existir)
-- Nota: buckets são globais no projeto
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'website-layouts', 
    'website-layouts', 
    false, 
    10485760, -- 10MB
    ARRAY['text/html', 'text/css']
)
ON CONFLICT (id) DO UPDATE SET 
    public = false,
    file_size_limit = 10485760,
    allowed_mime_types = ARRAY['text/html', 'text/css'];

-- 2. Limpar políticas antigas para garantir que as novas funcionem
DROP POLICY IF EXISTS "Authenticated users can upload layouts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read layouts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update layouts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete layouts" ON storage.objects;
-- Também limpar políticas com nomes genéricos que possam conflitar
DROP POLICY IF EXISTS "Authenticated users select" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users insert" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete" ON storage.objects;

-- 3. Criar novas políticas (Permissivas para usuários logados)

-- SELECT: Ler arquivos
CREATE POLICY "Authenticated users can read layouts"
ON storage.objects FOR SELECT
TO authenticated
USING ( bucket_id = 'website-layouts' );

-- INSERT: Upload de arquivos
CREATE POLICY "Authenticated users can upload layouts"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK ( bucket_id = 'website-layouts' );

-- UPDATE: Atualizar arquivos (sobrescrever)
CREATE POLICY "Authenticated users can update layouts"
ON storage.objects FOR UPDATE
TO authenticated
USING ( bucket_id = 'website-layouts' );

-- DELETE: Deletar arquivos
CREATE POLICY "Authenticated users can delete layouts"
ON storage.objects FOR DELETE
TO authenticated
USING ( bucket_id = 'website-layouts' );

-- 4. Confirmação
SELECT * FROM storage.buckets WHERE id = 'website-layouts';
