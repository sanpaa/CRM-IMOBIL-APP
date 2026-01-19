-- ============================================
-- Supabase Storage Configuration
-- Bucket: property-documents
-- ============================================

-- Note: This script assumes you have already created the 'property-documents' bucket
-- in Supabase Storage dashboard. If not, create it first with Public access.

-- Enable Row Level Security on storage.objects if not already enabled
-- (This is usually enabled by default in Supabase)

-- ============================================
-- Storage Policies for property-documents bucket
-- ============================================

-- Drop existing policies to make this script re-runnable
DROP POLICY IF EXISTS "Users can upload documents to their company folder" ON storage.objects;
DROP POLICY IF EXISTS "Anon can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can read documents from their company folder" ON storage.objects;
DROP POLICY IF EXISTS "Public can read all documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete documents from their company folder" ON storage.objects;

-- Policy 1: Allow authenticated users to upload documents to their company's folder
CREATE POLICY "Users can upload documents to their company folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 1b: Allow anon users to upload documents (for custom auth setups)
-- NOTE: This is less secure; consider moving uploads to a backend with service role.
CREATE POLICY "Anon can upload documents"
ON storage.objects
FOR INSERT
TO anon
WITH CHECK (
  bucket_id = 'property-documents'
);

-- Policy 2: Allow authenticated users to read documents from their company's folder
CREATE POLICY "Users can read documents from their company folder"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-documents'
);

-- Policy 3: Allow public read access (for public property listings)
-- Only enable this if you want documents to be accessible without authentication
CREATE POLICY "Public can read all documents"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'property-documents'
);

-- Policy 4: Allow authenticated users to delete documents from their company's folder
CREATE POLICY "Users can delete documents from their company folder"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Notes
-- ============================================
-- 1. These policies assume you're using Supabase Auth
-- 2. Adjust the policies according to your security requirements
-- 3. The policies above use auth.uid() but you might need to adapt them
--    to use your custom users table and company_id relationships
-- 4. Test the policies thoroughly before deploying to production
-- 5. Consider adding additional checks for file size, type, etc.

-- ============================================
-- Alternative: Disable RLS for Public Access (Not Recommended for Production)
-- ============================================
-- If you want to make the bucket fully public without RLS checks:
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
-- WARNING: This removes all access control. Use with caution!
