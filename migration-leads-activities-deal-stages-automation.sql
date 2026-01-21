-- ============================================
-- CRM IMOBILIÁRIO - LEADS, ACTIVITIES, PIPELINE, AUTOMATION
-- ============================================

-- Leads (central de leads)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  email VARCHAR,
  source VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  assigned_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  converted_client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  last_interaction_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT leads_source_check CHECK (source IN ('WHATSAPP', 'SITE', 'PORTAL', 'MANUAL')),
  CONSTRAINT leads_status_check CHECK (status IN ('NEW', 'CONTACTED', 'QUALIFIED', 'LOST', 'CONVERTED'))
);

CREATE INDEX IF NOT EXISTS idx_leads_company_id ON leads(company_id);
CREATE INDEX IF NOT EXISTS idx_leads_company_status ON leads(company_id, status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_user ON leads(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_leads_last_interaction ON leads(last_interaction_at DESC);

-- Activities (timeline global)
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  entity_type VARCHAR(20) NOT NULL,
  entity_id UUID NOT NULL,
  type VARCHAR(20) NOT NULL,
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT activities_entity_type_check CHECK (entity_type IN ('LEAD', 'CLIENT', 'DEAL', 'PROPERTY')),
  CONSTRAINT activities_type_check CHECK (type IN ('NOTE', 'MESSAGE', 'VISIT', 'STATUS', 'SYSTEM'))
);

CREATE INDEX IF NOT EXISTS idx_activities_company_id ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_entity ON activities(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);

-- Deal stages (pipeline customizavel)
CREATE TABLE IF NOT EXISTS deal_stages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  "order" INTEGER NOT NULL,
  is_won BOOLEAN DEFAULT FALSE,
  is_lost BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT deal_stages_won_lost_check CHECK (NOT (is_won AND is_lost))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_deal_stages_company_order ON deal_stages(company_id, "order");
CREATE INDEX IF NOT EXISTS idx_deal_stages_company_id ON deal_stages(company_id);

ALTER TABLE deals
  ADD COLUMN IF NOT EXISTS stage_id UUID REFERENCES deal_stages(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_deals_company_stage ON deals(company_id, stage_id);

-- Automation rules (automacao simples)
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  trigger VARCHAR(50) NOT NULL,
  condition JSONB,
  action JSONB NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_automation_rules_company ON automation_rules(company_id);
CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger ON automation_rules(trigger);

-- Property quality score
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS quality_score INTEGER,
  ADD CONSTRAINT properties_quality_score_check
    CHECK (quality_score IS NULL OR (quality_score BETWEEN 0 AND 100));

-- KPI snapshots (dashboard instantaneo)
CREATE TABLE IF NOT EXISTS kpi_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  leads_new INTEGER DEFAULT 0,
  visits_done INTEGER DEFAULT 0,
  deals_won INTEGER DEFAULT 0,
  conversion_rate NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_kpi_snapshots_company_date ON kpi_snapshots(company_id, date);

-- Soft delete columns (safe future-proofing)
ALTER TABLE clients ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE properties ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE visits ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE deals ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Updated_at triggers for new tables
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_stages_updated_at
  BEFORE UPDATE ON deal_stages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
  BEFORE UPDATE ON automation_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (custom auth)
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE deal_stages DISABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_snapshots DISABLE ROW LEVEL SECURITY;
