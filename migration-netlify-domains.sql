-- Migration: Update domain management for Netlify/Vercel compatibility
-- Date: 2024
-- Description: Remove SSL certificate fields and add subdomain auto flag

-- 1. Add is_subdomain_auto field to custom_domains
ALTER TABLE custom_domains
ADD COLUMN IF NOT EXISTS is_subdomain_auto BOOLEAN DEFAULT false;

-- 2. Remove SSL-related fields that are no longer needed
-- (SSL is handled automatically by Netlify/Vercel)
ALTER TABLE custom_domains
DROP COLUMN IF EXISTS ssl_certificate,
DROP COLUMN IF EXISTS ssl_expires_at;

-- Note: We keep ssl_enabled as a boolean to track if domain is active with SSL
-- But it's now managed by the hosting platform, not by us

-- 3. Add subdomain_slug to companies table for automatic subdomains
-- This allows companies to have subdomains like: company1.yoursite.com
ALTER TABLE companies
ADD COLUMN IF NOT EXISTS subdomain_slug VARCHAR(100) UNIQUE;

-- 4. Add index for performance on subdomain lookups
CREATE INDEX IF NOT EXISTS idx_companies_subdomain ON companies(subdomain_slug);

-- 5. Add index for domain lookups (multi-tenant resolution)
CREATE INDEX IF NOT EXISTS idx_custom_domains_lookup ON custom_domains(domain, status);
CREATE INDEX IF NOT EXISTS idx_custom_domains_company ON custom_domains(company_id, is_primary);

-- 6. Update existing custom_domains to mark auto subdomains
-- (This is a best-effort update; adjust the pattern to match your actual subdomain pattern)
UPDATE custom_domains
SET is_subdomain_auto = true
WHERE domain LIKE '%.yoursite.com' -- Replace 'yoursite.com' with your actual domain
  AND domain NOT LIKE 'www.%';

-- 7. Populate subdomain_slug for existing companies
-- Extract subdomain from existing custom_domains where applicable
UPDATE companies c
SET subdomain_slug = SUBSTRING(cd.domain FROM 1 FOR POSITION('.' IN cd.domain) - 1)
FROM custom_domains cd
WHERE c.id = cd.company_id
  AND cd.is_subdomain_auto = true
  AND c.subdomain_slug IS NULL;

-- 8. Add comment to document the changes
COMMENT ON COLUMN custom_domains.is_subdomain_auto IS 'True for automatic subdomains (e.g., company.yoursite.com), false for custom domains';
COMMENT ON COLUMN companies.subdomain_slug IS 'Subdomain slug for automatic subdomain (e.g., "company1" for company1.yoursite.com)';

-- 9. Update RLS policies if needed (no changes required for basic setup)
-- The existing company_id based RLS policies should work fine

-- 10. Verify the migration
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'custom_domains' 
               AND column_name = 'is_subdomain_auto') THEN
        RAISE NOTICE 'Migration successful: is_subdomain_auto column added';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'companies' 
               AND column_name = 'subdomain_slug') THEN
        RAISE NOTICE 'Migration successful: subdomain_slug column added';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'custom_domains' 
                   AND column_name = 'ssl_certificate') THEN
        RAISE NOTICE 'Migration successful: ssl_certificate column removed';
    END IF;
END $$;
