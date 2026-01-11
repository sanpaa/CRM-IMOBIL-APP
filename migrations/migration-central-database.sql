-- ============================================================================
-- MIGRATION: Central Database Schema
-- Description: Creates shared tables for multi-tenant architecture
-- Version: 1.0.0
-- Date: 2026-01-11
-- ============================================================================

-- ============================================================================
-- 1. COMPANIES TABLE (Tenants)
-- ============================================================================

CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  document VARCHAR(50),
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  
  -- Multi-tenant configuration
  database_name VARCHAR(100) NOT NULL UNIQUE,
  database_url TEXT NOT NULL,
  database_key TEXT NOT NULL,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  activated_at TIMESTAMP DEFAULT NOW(),
  suspended_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_companies_email ON companies(email);
CREATE INDEX idx_companies_active ON companies(is_active);
CREATE INDEX idx_companies_database_name ON companies(database_name);

-- ============================================================================
-- 2. USERS TABLE (Authentication)
-- ============================================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Authentication
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  
  -- Profile
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL, -- 'admin', 'gestor', 'corretor'
  
  -- Status
  active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_users_active ON users(active);

-- ============================================================================
-- 3. SUBSCRIPTION_PLANS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Plan identification
  name VARCHAR(50) NOT NULL UNIQUE, -- 'prime', 'k', 'k2'
  display_name VARCHAR(100) NOT NULL, -- 'Prime', 'K', 'K2'
  description TEXT,
  
  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  activation_fee DECIMAL(10, 2) DEFAULT 0,
  
  -- Limits
  max_users INTEGER NOT NULL,
  max_properties INTEGER, -- NULL = unlimited
  additional_user_price DECIMAL(10, 2) NOT NULL,
  
  -- Features (JSON)
  features JSONB NOT NULL DEFAULT '{}',
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Insert default plans
INSERT INTO subscription_plans (name, display_name, price_monthly, price_yearly, activation_fee, max_users, max_properties, additional_user_price, features) VALUES
('prime', 'Prime', 247.00, 2964.00, 197.00, 2, 100, 57.00, '{"app_mobile": true, "landing_page": true, "blog": false, "api": false, "customer_success": false}'),
('k', 'K', 397.00, 4764.00, 197.00, 5, 500, 37.00, '{"app_mobile": true, "landing_page": true, "blog": true, "api": true, "customer_success": false, "training_included": 1}'),
('k2', 'K2', 597.00, 7164.00, 0.00, 12, NULL, 27.00, '{"app_mobile": true, "landing_page": true, "blog": true, "api": true, "customer_success": true, "training_included": 2, "white_label": true}')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 4. TENANT_SUBSCRIPTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  
  -- Subscription details
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'cancelled', 'trial'
  started_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP,
  trial_ends_at TIMESTAMP,
  
  -- Usage tracking
  current_users INTEGER DEFAULT 0,
  current_properties INTEGER DEFAULT 0,
  additional_users INTEGER DEFAULT 0,
  
  -- Billing
  next_billing_date DATE,
  payment_method VARCHAR(50), -- 'credit_card', 'boleto', 'pix'
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_tenant_subscriptions_tenant_id ON tenant_subscriptions(tenant_id);
CREATE INDEX idx_tenant_subscriptions_status ON tenant_subscriptions(status);

-- ============================================================================
-- 5. CUSTOM_DOMAINS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS custom_domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Domain configuration
  domain VARCHAR(255) NOT NULL UNIQUE,
  subdomain VARCHAR(100), -- For wildcard subdomains
  is_primary BOOLEAN DEFAULT false,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'active', 'failed'
  verified_at TIMESTAMP,
  
  -- SSL
  ssl_enabled BOOLEAN DEFAULT false,
  ssl_issued_at TIMESTAMP,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_custom_domains_tenant_id ON custom_domains(tenant_id);
CREATE INDEX idx_custom_domains_domain ON custom_domains(domain);

-- ============================================================================
-- 6. TENANT_AUDIT_LOG TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS tenant_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Action details
  action VARCHAR(100) NOT NULL, -- 'user.create', 'property.update', etc.
  entity_type VARCHAR(50), -- 'property', 'client', 'user', etc.
  entity_id UUID,
  
  -- Changes (JSON)
  changes JSONB,
  
  -- Request metadata
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamp
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_audit_log_tenant_id ON tenant_audit_log(tenant_id);
CREATE INDEX idx_audit_log_user_id ON tenant_audit_log(user_id);
CREATE INDEX idx_audit_log_action ON tenant_audit_log(action);
CREATE INDEX idx_audit_log_created_at ON tenant_audit_log(created_at);

-- ============================================================================
-- 7. HELPER FUNCTIONS
-- ============================================================================

-- Function to get tenant limits
CREATE OR REPLACE FUNCTION get_tenant_limits(p_tenant_id UUID)
RETURNS TABLE (
  max_users INTEGER,
  max_properties INTEGER,
  current_users INTEGER,
  current_properties INTEGER,
  additional_users INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sp.max_users,
    sp.max_properties,
    ts.current_users,
    ts.current_properties,
    ts.additional_users
  FROM tenant_subscriptions ts
  JOIN subscription_plans sp ON ts.plan_id = sp.id
  WHERE ts.tenant_id = p_tenant_id
    AND ts.status = 'active'
  ORDER BY ts.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to check if tenant can add resource
CREATE OR REPLACE FUNCTION can_add_resource(
  p_tenant_id UUID,
  p_resource_type VARCHAR,
  p_count INTEGER DEFAULT 1
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current INTEGER;
  v_limit INTEGER;
BEGIN
  IF p_resource_type = 'user' THEN
    SELECT current_users, max_users + additional_users
    INTO v_current, v_limit
    FROM tenant_subscriptions ts
    JOIN subscription_plans sp ON ts.plan_id = sp.id
    WHERE ts.tenant_id = p_tenant_id AND ts.status = 'active';
    
    RETURN (v_current + p_count) <= v_limit;
    
  ELSIF p_resource_type = 'property' THEN
    SELECT current_properties, max_properties
    INTO v_current, v_limit
    FROM tenant_subscriptions ts
    JOIN subscription_plans sp ON ts.plan_id = sp.id
    WHERE ts.tenant_id = p_tenant_id AND ts.status = 'active';
    
    -- NULL means unlimited
    IF v_limit IS NULL THEN
      RETURN TRUE;
    END IF;
    
    RETURN (v_current + p_count) <= v_limit;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. TRIGGERS
-- ============================================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenant_subscriptions_updated_at BEFORE UPDATE ON tenant_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

-- Verify installation
SELECT 'Central database schema created successfully!' AS status;
