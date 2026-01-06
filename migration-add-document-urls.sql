-- Migration: Add document_urls support to properties table
-- Description: Enables document attachment functionality for property registration

-- Add document_urls column to properties table
ALTER TABLE properties 
ADD COLUMN IF NOT EXISTS document_urls TEXT[] DEFAULT '{}';

-- Add constraint to limit maximum number of documents
ALTER TABLE properties 
ADD CONSTRAINT max_documents_check CHECK (array_length(document_urls, 1) IS NULL OR array_length(document_urls, 1) <= 10);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_document_urls ON properties USING GIN (document_urls);

-- Add comment for documentation
COMMENT ON COLUMN properties.document_urls IS 'Array of document URLs (PDFs, DOCs, etc.) attached to the property. Maximum 10 documents allowed.';
