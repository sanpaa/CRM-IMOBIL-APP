-- ============================================
-- MIGRATION: Website Customization System
-- Date: 2025-12-31
-- Description: Add tables and fields for website customization, 
--              drag & drop builder, and custom domain management
-- ============================================

-- ============================================
-- 1. CUSTOM DOMAINS
-- Store custom domain configurations for each company
-- ============================================
CREATE TABLE IF NOT EXISTS custom_domains (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    domain VARCHAR(255) NOT NULL UNIQUE,
    subdomain VARCHAR(255),
    is_primary BOOLEAN DEFAULT FALSE,
    ssl_enabled BOOLEAN DEFAULT FALSE,
    ssl_certificate TEXT,
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    dns_configured BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    verified_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'active', 'failed', 'disabled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. WEBSITE LAYOUTS
-- Store complete page layouts for each company's website
-- ============================================
CREATE TABLE IF NOT EXISTS website_layouts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    page_type VARCHAR(100) NOT NULL CHECK (page_type IN ('home', 'properties', 'property-detail', 'about', 'contact', 'custom')),
    slug VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,
    layout_config JSONB NOT NULL DEFAULT '{}',
    meta_title VARCHAR(255),
    meta_description TEXT,
    meta_keywords TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT unique_company_page_type UNIQUE(company_id, page_type, slug)
);

-- ============================================
-- 3. WEBSITE COMPONENTS
-- Store individual component configurations that can be reused
-- ============================================
CREATE TABLE IF NOT EXISTS website_components (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    component_type VARCHAR(100) NOT NULL CHECK (component_type IN (
        'header', 'footer', 'hero', 'property-grid', 'property-card', 
        'search-bar', 'contact-form', 'testimonials', 'about-section',
        'stats-section', 'team-section', 'map-section', 'text-block',
        'image-gallery', 'video-section', 'cta-button', 'divider', 'spacer'
    )),
    config JSONB NOT NULL DEFAULT '{}',
    style_config JSONB DEFAULT '{}',
    is_reusable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. ALTER COMPANIES TABLE
-- Add custom domain and website-related fields
-- ============================================
ALTER TABLE companies ADD COLUMN IF NOT EXISTS custom_domain VARCHAR(255);
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_enabled BOOLEAN DEFAULT TRUE;
ALTER TABLE companies ADD COLUMN IF NOT EXISTS website_published BOOLEAN DEFAULT FALSE;

-- ============================================
-- 5. ALTER STORE_SETTINGS TABLE
-- Add layout and theme configuration fields
-- ============================================
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS layout_config JSONB DEFAULT '{}';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS theme_config JSONB DEFAULT '{"headerStyle": "modern", "fontFamily": "Inter", "borderRadius": "medium"}';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS business_hours JSONB DEFAULT '{}';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS header_image TEXT;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS footer_text TEXT DEFAULT 'Todos os direitos reservados';
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS show_properties_count BOOLEAN DEFAULT TRUE;
ALTER TABLE store_settings ADD COLUMN IF NOT EXISTS contact_form_enabled BOOLEAN DEFAULT TRUE;

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_custom_domains_company_id ON custom_domains(company_id);
CREATE INDEX IF NOT EXISTS idx_custom_domains_domain ON custom_domains(domain);
CREATE INDEX IF NOT EXISTS idx_custom_domains_status ON custom_domains(status);
CREATE INDEX IF NOT EXISTS idx_website_layouts_company_id ON website_layouts(company_id);
CREATE INDEX IF NOT EXISTS idx_website_layouts_page_type ON website_layouts(page_type);
CREATE INDEX IF NOT EXISTS idx_website_layouts_is_active ON website_layouts(is_active);
CREATE INDEX IF NOT EXISTS idx_website_components_company_id ON website_components(company_id);
CREATE INDEX IF NOT EXISTS idx_website_components_type ON website_components(component_type);
CREATE INDEX IF NOT EXISTS idx_companies_custom_domain ON companies(custom_domain);

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE TRIGGER update_custom_domains_updated_at
    BEFORE UPDATE ON custom_domains
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_layouts_updated_at
    BEFORE UPDATE ON website_layouts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_website_components_updated_at
    BEFORE UPDATE ON website_components
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ROW LEVEL SECURITY - DISABLED
-- (Consistent with existing schema)
-- ============================================
-- NOTE: RLS is currently disabled to match existing architecture.
-- For production, consider enabling RLS with the following policies:
--
-- ENABLE ROW LEVEL SECURITY FOR custom_domains:
-- CREATE POLICY custom_domains_isolation ON custom_domains
--   USING (company_id = current_setting('app.current_company_id')::uuid);
--
-- ENABLE ROW LEVEL SECURITY FOR website_layouts:
-- CREATE POLICY website_layouts_isolation ON website_layouts
--   USING (company_id = current_setting('app.current_company_id')::uuid);
--
-- ENABLE ROW LEVEL SECURITY FOR website_components:
-- CREATE POLICY website_components_isolation ON website_components
--   USING (company_id = current_setting('app.current_company_id')::uuid);
--
-- To enable, uncomment the following and implement session management:
-- ALTER TABLE custom_domains ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE website_layouts ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE website_components ENABLE ROW LEVEL SECURITY;

ALTER TABLE custom_domains DISABLE ROW LEVEL SECURITY;
ALTER TABLE website_layouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE website_components DISABLE ROW LEVEL SECURITY;

-- ============================================
-- SAMPLE DATA for Testing
-- ============================================
-- Insert default home layout for existing companies
INSERT INTO website_layouts (company_id, name, page_type, is_active, is_default, layout_config)
SELECT 
    id as company_id,
    'Home Page Default' as name,
    'home' as page_type,
    true as is_active,
    true as is_default,
    '{"sections": [
        {"id": "header", "type": "header", "order": 1},
        {"id": "hero", "type": "hero", "order": 2, "config": {"title": "Encontre seu imóvel ideal", "subtitle": "As melhores opções do mercado"}},
        {"id": "search", "type": "search-bar", "order": 3},
        {"id": "properties", "type": "property-grid", "order": 4, "config": {"limit": 6, "showFeatured": true}},
        {"id": "footer", "type": "footer", "order": 5}
    ]}'::jsonb as layout_config
FROM companies
WHERE NOT EXISTS (
    SELECT 1 FROM website_layouts 
    WHERE website_layouts.company_id = companies.id 
    AND website_layouts.page_type = 'home'
);

-- ============================================
-- NOTES
-- ============================================
-- This migration adds support for:
-- 1. Custom domain management with SSL validation
-- 2. Drag & drop website builder with flexible layouts
-- 3. Reusable component library
-- 4. Theme and branding customization
-- 5. SEO configuration per page
-- 
-- To implement custom domain routing at the application level:
-- - Use a reverse proxy (e.g., Nginx, Traefik) to route domains to the app
-- - Implement middleware to identify company by domain
-- - Configure SSL certificates (Let's Encrypt recommended)
-- 
-- DNS Configuration Required:
-- - A record pointing to server IP
-- - CNAME for www subdomain
-- - TXT record for domain verification
