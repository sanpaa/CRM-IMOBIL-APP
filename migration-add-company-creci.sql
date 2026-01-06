-- Migration to add CRECI and additional company information for PDF generation
-- This allows companies to display their CRECI registration and full contact details

-- Add fields to companies table
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS creci VARCHAR(50),
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- Add CRECI and phone fields to users table for individual brokers
ALTER TABLE users
ADD COLUMN IF NOT EXISTS creci VARCHAR(50),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Add comments for documentation (these are optional and may be skipped if permissions are insufficient)
DO $$
BEGIN
  EXECUTE 'COMMENT ON COLUMN companies.creci IS ''CRECI registration number for the real estate company''';
  EXECUTE 'COMMENT ON COLUMN companies.address IS ''Full address of the company for documents and PDFs''';
  EXECUTE 'COMMENT ON COLUMN companies.logo_url IS ''URL of the company logo for PDF headers''';
  EXECUTE 'COMMENT ON COLUMN users.creci IS ''CRECI registration number for individual brokers''';
  EXECUTE 'COMMENT ON COLUMN users.phone IS ''Phone number for individual brokers''';
EXCEPTION
  WHEN insufficient_privilege THEN
    RAISE NOTICE 'Comments could not be added due to insufficient privileges. Migration will continue.';
END $$;
