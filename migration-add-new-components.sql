-- ============================================
-- MIGRATION: Add New Website Components
-- Date: 2025-12-31
-- Description: Add FAQ, Features Grid, Newsletter, and Mortgage Calculator components
-- ============================================

-- Remove old constraint and add new one with additional component types
ALTER TABLE website_components 
DROP CONSTRAINT IF EXISTS website_components_component_type_check;

ALTER TABLE website_components
ADD CONSTRAINT website_components_component_type_check 
CHECK (component_type IN (
    'header', 'footer', 'hero', 'property-grid', 'property-card', 
    'search-bar', 'contact-form', 'testimonials', 'about-section',
    'stats-section', 'team-section', 'map-section', 'text-block',
    'image-gallery', 'video-section', 'cta-button', 'divider', 'spacer',
    'faq', 'features-grid', 'newsletter', 'mortgage-calculator'
));

-- ============================================
-- Insert sample components for the new types (optional)
-- ============================================

-- Example FAQ component
-- INSERT INTO website_components (company_id, name, component_type, config, style_config, is_reusable)
-- SELECT 
--     id as company_id,
--     'FAQ Padrão' as name,
--     'faq' as component_type,
--     '{
--       "title": "Perguntas Frequentes",
--       "subtitle": "Tire suas dúvidas sobre nossos serviços",
--       "items": [
--         {
--           "question": "Como funciona o processo de compra?",
--           "answer": "O processo de compra envolve várias etapas, desde a escolha do imóvel até a assinatura do contrato."
--         },
--         {
--           "question": "Quais documentos são necessários?",
--           "answer": "Você precisará de documentos pessoais, comprovante de renda e outros documentos específicos."
--         }
--       ]
--     }'::jsonb as config,
--     '{
--       "backgroundColor": "#ffffff",
--       "padding": "3rem"
--     }'::jsonb as style_config,
--     true as is_reusable
-- FROM companies
-- LIMIT 1;

-- ============================================
-- Component Configuration Documentation
-- ============================================

-- FAQ Component Schema:
-- {
--   "title": "string (optional)",
--   "subtitle": "string (optional)",
--   "items": [
--     {
--       "question": "string (required)",
--       "answer": "string (required)"
--     }
--   ]
-- }

-- Features Grid Component Schema:
-- {
--   "title": "string (optional)",
--   "subtitle": "string (optional)",
--   "features": [
--     {
--       "icon": "string (Font Awesome class, required)",
--       "title": "string (required)",
--       "description": "string (required)"
--     }
--   ]
-- }

-- Newsletter Component Schema:
-- {
--   "title": "string (optional)",
--   "subtitle": "string (optional)",
--   "buttonText": "string (optional)",
--   "placeholder": "string (optional)"
-- }

-- Mortgage Calculator Component Schema:
-- {
--   "title": "string (optional)",
--   "subtitle": "string (optional)",
--   "defaultInterestRate": "number (optional, default: 9.5)",
--   "defaultTermYears": "number (optional, default: 30)"
-- }

-- ============================================
-- Validation Function (Optional)
-- ============================================

-- Function to validate component config based on type
CREATE OR REPLACE FUNCTION validate_component_config()
RETURNS TRIGGER AS $$
BEGIN
    -- Validate FAQ component
    IF NEW.component_type = 'faq' THEN
        IF NOT (NEW.config ? 'items' AND jsonb_typeof(NEW.config->'items') = 'array') THEN
            RAISE EXCEPTION 'FAQ component must have an array of items';
        END IF;
    END IF;
    
    -- Validate Features Grid component
    IF NEW.component_type = 'features-grid' THEN
        IF NOT (NEW.config ? 'features' AND jsonb_typeof(NEW.config->'features') = 'array') THEN
            RAISE EXCEPTION 'Features Grid component must have an array of features';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for validation (optional - uncomment to enable)
-- DROP TRIGGER IF EXISTS validate_component_config_trigger ON website_components;
-- CREATE TRIGGER validate_component_config_trigger
--     BEFORE INSERT OR UPDATE ON website_components
--     FOR EACH ROW
--     EXECUTE FUNCTION validate_component_config();

-- ============================================
-- Notes:
-- ============================================
-- 1. The trigger for config validation is commented out by default
-- 2. You can enable it if you want strict validation on database level
-- 3. Frontend validation is already in place through TypeScript interfaces
-- 4. These components work with the existing RLS policies (currently disabled)
