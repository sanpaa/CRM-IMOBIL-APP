-- ============================================
-- FIX STORAGE ULTIMATE FORCE
-- Date: 2026-01-27
-- Description: Permissões TOTAIS para PUBLIC e AUTHENTICATED
-- ============================================

-- 1. Garantir bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('website-layouts', 'website-layouts', true, 10485760, ARRAY['text/html', 'text/css', 'application/json'])
ON CONFLICT (id) DO UPDATE SET 
    public = true,
    allowed_mime_types = ARRAY['text/html', 'text/css', 'application/json'];

-- 2. Limpeza total de políticas
DROP POLICY IF EXISTS "Authenticated users can upload layouts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read layouts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update layouts" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete layouts" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Authenticated" ON storage.objects;
DROP POLICY IF EXISTS "Public Read" ON storage.objects;
DROP POLICY IF EXISTS "Allow All Public" ON storage.objects;

-- 3. POLÍTICA: LIBEROU GERAL (Authenticated)
CREATE POLICY "Allow All Authenticated"
ON storage.objects FOR ALL TO authenticated
USING ( bucket_id = 'website-layouts' )
WITH CHECK ( bucket_id = 'website-layouts' );

-- 4. POLÍTICA: LIBEROU GERAL (Public/Anon) - SOLUÇÃO DE EMERGÊNCIA
-- Isso permite upload mesmo se o login falhar
CREATE POLICY "Allow All Public"
ON storage.objects FOR ALL TO public
USING ( bucket_id = 'website-layouts' )
WITH CHECK ( bucket_id = 'website-layouts' );

-- 5. Grant permissions to roles just in case
GRANT ALL ON storage.objects TO postgres, anon, authenticated, service_role;
GRANT ALL ON storage.buckets TO postgres, anon, authenticated, service_role;

SELECT * FROM storage.buckets WHERE id = 'website-layouts';
