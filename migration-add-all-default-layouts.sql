-- ============================================
-- MIGRATION: Add All Default Layouts
-- Date: 2026-01-08
-- Description: Creates default layouts for all page types (home, properties, property-detail, about, contact)
--              for companies that don't have them yet.
--              This fixes the "Total layouts found: 0" issue.
-- ============================================

-- ============================================
-- Insert default HOME layout for companies that don't have one
-- ============================================
INSERT INTO website_layouts (company_id, name, page_type, is_active, is_default, layout_config, meta_title, meta_description)
SELECT 
    id as company_id,
    'Home Page' as name,
    'home' as page_type,
    true as is_active,
    true as is_default,
    '{"sections": [
        {"id": "header", "type": "header", "order": 1},
        {"id": "hero", "type": "hero", "order": 2, "config": {"title": "Encontre seu imóvel ideal", "subtitle": "As melhores opções do mercado", "height": "large", "alignment": "center"}},
        {"id": "search", "type": "search-bar", "order": 3},
        {"id": "properties", "type": "property-grid", "order": 4, "config": {"limit": 6, "showFeatured": true, "columns": 3}},
        {"id": "footer", "type": "footer", "order": 5}
    ]}'::jsonb as layout_config,
    'Imóveis - Encontre seu imóvel ideal' as meta_title,
    'Encontre os melhores imóveis à venda e para locação. As melhores opções do mercado imobiliário.' as meta_description
FROM companies
WHERE website_enabled = true
AND NOT EXISTS (
    SELECT 1 FROM website_layouts 
    WHERE website_layouts.company_id = companies.id 
    AND website_layouts.page_type = 'home'
);

-- ============================================
-- Insert default PROPERTIES layout for companies that don't have one
-- ============================================
INSERT INTO website_layouts (company_id, name, page_type, is_active, is_default, layout_config, meta_title, meta_description)
SELECT 
    id as company_id,
    'Properties Listing' as name,
    'properties' as page_type,
    true as is_active,
    true as is_default,
    '{"sections": [
        {"id": "header", "type": "header", "order": 1},
        {"id": "search", "type": "search-bar", "order": 2, "config": {"fields": ["type", "city", "priceRange", "bedrooms"]}},
        {"id": "properties", "type": "property-grid", "order": 3, "config": {"showFilters": true, "columns": 3}},
        {"id": "footer", "type": "footer", "order": 4}
    ]}'::jsonb as layout_config,
    'Imóveis Disponíveis - Veja todos os imóveis' as meta_title,
    'Navegue por nossa seleção completa de imóveis disponíveis para venda e locação.' as meta_description
FROM companies
WHERE website_enabled = true
AND NOT EXISTS (
    SELECT 1 FROM website_layouts 
    WHERE website_layouts.company_id = companies.id 
    AND website_layouts.page_type = 'properties'
);

-- ============================================
-- Insert default PROPERTY-DETAIL layout for companies that don't have one
-- ============================================
INSERT INTO website_layouts (company_id, name, page_type, is_active, is_default, layout_config, meta_title, meta_description)
SELECT 
    id as company_id,
    'Property Detail Page' as name,
    'property-detail' as page_type,
    true as is_active,
    true as is_default,
    '{"sections": [
        {"id": "header", "type": "header", "order": 1},
        {"id": "property-hero", "type": "property-hero", "order": 2, "config": {"showGallery": true, "showFavorite": true}},
        {"id": "property-details", "type": "property-details", "order": 3, "config": {"showDescription": true, "showFeatures": true, "showLocation": true}},
        {"id": "contact-agent", "type": "contact-form", "order": 4, "config": {"title": "Interessado? Entre em contato", "fields": ["name", "email", "phone", "message"]}},
        {"id": "similar-properties", "type": "property-grid", "order": 5, "config": {"title": "Imóveis Semelhantes", "limit": 3, "columns": 3}},
        {"id": "footer", "type": "footer", "order": 6}
    ]}'::jsonb as layout_config,
    'Detalhes do Imóvel' as meta_title,
    'Veja todos os detalhes, fotos e informações sobre este imóvel.' as meta_description
FROM companies
WHERE website_enabled = true
AND NOT EXISTS (
    SELECT 1 FROM website_layouts 
    WHERE website_layouts.company_id = companies.id 
    AND website_layouts.page_type = 'property-detail'
);

-- ============================================
-- Insert default ABOUT layout for companies that don't have one
-- ============================================
INSERT INTO website_layouts (company_id, name, page_type, is_active, is_default, layout_config, meta_title, meta_description)
SELECT 
    id as company_id,
    'About Page' as name,
    'about' as page_type,
    true as is_active,
    true as is_default,
    '{"sections": [
        {"id": "header", "type": "header", "order": 1},
        {"id": "about-hero", "type": "hero", "order": 2, "config": {"title": "Sobre Nós", "subtitle": "Conheça nossa história", "height": "medium"}},
        {"id": "about-content", "type": "text-block", "order": 3, "config": {"content": "Somos uma empresa dedicada a conectar pessoas aos seus imóveis ideais."}},
        {"id": "stats", "type": "stats-section", "order": 4, "config": {"stats": [{"label": "Anos de Experiência", "value": "10+"}, {"label": "Imóveis Vendidos", "value": "500+"}, {"label": "Clientes Satisfeitos", "value": "1000+"}]}},
        {"id": "team", "type": "team-section", "order": 5, "config": {"title": "Nossa Equipe"}},
        {"id": "footer", "type": "footer", "order": 6}
    ]}'::jsonb as layout_config,
    'Sobre Nós - Conheça nossa empresa' as meta_title,
    'Conheça nossa história, missão e a equipe que trabalha para encontrar o imóvel ideal para você.' as meta_description
FROM companies
WHERE website_enabled = true
AND NOT EXISTS (
    SELECT 1 FROM website_layouts 
    WHERE website_layouts.company_id = companies.id 
    AND website_layouts.page_type = 'about'
);

-- ============================================
-- Insert default CONTACT layout for companies that don't have one
-- ============================================
INSERT INTO website_layouts (company_id, name, page_type, is_active, is_default, layout_config, meta_title, meta_description)
SELECT 
    id as company_id,
    'Contact Page' as name,
    'contact' as page_type,
    true as is_active,
    true as is_default,
    '{"sections": [
        {"id": "header", "type": "header", "order": 1},
        {"id": "contact-hero", "type": "hero", "order": 2, "config": {"title": "Entre em Contato", "subtitle": "Estamos aqui para ajudar", "height": "medium"}},
        {"id": "contact-form", "type": "contact-form", "order": 3, "config": {"fields": ["name", "email", "phone", "message"], "showWhatsApp": true}},
        {"id": "map", "type": "map-section", "order": 4, "config": {"showAddress": true}},
        {"id": "footer", "type": "footer", "order": 5}
    ]}'::jsonb as layout_config,
    'Contato - Fale Conosco' as meta_title,
    'Entre em contato conosco. Estamos prontos para ajudá-lo a encontrar o imóvel perfeito.' as meta_description
FROM companies
WHERE website_enabled = true
AND NOT EXISTS (
    SELECT 1 FROM website_layouts 
    WHERE website_layouts.company_id = companies.id 
    AND website_layouts.page_type = 'contact'
);

-- ============================================
-- Verification Query
-- Run this to check how many layouts were created
-- ============================================
-- SELECT 
--     c.name as company_name,
--     c.id as company_id,
--     COUNT(wl.id) as layout_count,
--     STRING_AGG(wl.page_type, ', ' ORDER BY wl.page_type) as page_types
-- FROM companies c
-- LEFT JOIN website_layouts wl ON c.id = wl.company_id
-- WHERE c.website_enabled = true
-- GROUP BY c.id, c.name
-- ORDER BY c.name;

-- ============================================
-- NOTES
-- ============================================
-- This migration ensures all companies with website_enabled = true have default layouts for:
-- 1. home - Landing page with hero, search, and featured properties
-- 2. properties - Full property listing page with filters
-- 3. property-detail - Individual property detail page
-- 4. about - Company information and team
-- 5. contact - Contact form and location map
--
-- Each layout is marked as is_active = true and is_default = true
-- This prevents the "Total layouts found: 0" error in the backend logs
--
-- To apply this migration:
-- 1. Connect to your Supabase database
-- 2. Run this SQL script in the SQL Editor
-- 3. Verify the layouts were created using the verification query above
