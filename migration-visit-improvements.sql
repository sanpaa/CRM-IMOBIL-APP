-- ============================================
-- MIGRATION: Visit Module Improvements
-- Adds support for multiple properties per visit and client evaluations
-- ============================================

-- Add new fields to visits table
ALTER TABLE visits
ADD COLUMN IF NOT EXISTS broker_id UUID REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES clients(id) ON DELETE SET NULL;

-- Create visit_properties table to support multiple properties per visit
CREATE TABLE IF NOT EXISTS visit_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  property_reference VARCHAR(255),
  full_address TEXT,
  development VARCHAR(255),
  bedrooms INTEGER,
  suites INTEGER,
  bathrooms INTEGER,
  parking_spaces INTEGER,
  total_area DECIMAL(10, 2),
  built_area DECIMAL(10, 2),
  suggested_sale_value DECIMAL(15, 2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create visit_evaluations table for client feedback after visits
CREATE TABLE IF NOT EXISTS visit_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visit_id UUID NOT NULL REFERENCES visits(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES visit_properties(id) ON DELETE CASCADE,
  conservation_state INTEGER CHECK (conservation_state >= 1 AND conservation_state <= 5),
  location_rating INTEGER CHECK (location_rating >= 1 AND location_rating <= 5),
  property_value_rating INTEGER CHECK (property_value_rating >= 1 AND property_value_rating <= 5),
  interest_level VARCHAR(50) CHECK (interest_level IN ('DESCARTOU', 'INTERESSOU', 'INTERESSOU_E_ASSINOU_PROPOSTA')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visit_properties_visit_id ON visit_properties(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_evaluations_visit_id ON visit_evaluations(visit_id);
CREATE INDEX IF NOT EXISTS idx_visit_evaluations_property_id ON visit_evaluations(property_id);
CREATE INDEX IF NOT EXISTS idx_visits_broker_id ON visits(broker_id);
CREATE INDEX IF NOT EXISTS idx_visits_owner_id ON visits(owner_id);

-- Add comments for documentation
COMMENT ON TABLE visit_properties IS 'Stores properties associated with each visit - a visit can have multiple properties';
COMMENT ON TABLE visit_evaluations IS 'Stores client evaluations for each property in a visit - only filled when status is Realizada';
COMMENT ON COLUMN visits.broker_id IS 'Reference to the broker (corretor) responsible for the visit';
COMMENT ON COLUMN visits.owner_id IS 'Reference to the property owner';
