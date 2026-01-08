-- ============================================
-- WhatsApp Integration - Database Tables
-- ============================================
-- This migration creates the necessary tables for WhatsApp integration
-- and adds the missing 'has_keywords' column to track messages with real estate keywords

-- ============================================
-- 1. WHATSAPP_CONNECTIONS
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone_number TEXT,
  is_connected BOOLEAN DEFAULT false,
  session_data JSONB,
  last_connected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(company_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_company ON whatsapp_connections(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_user ON whatsapp_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_connections_connected ON whatsapp_connections(is_connected);

-- ============================================
-- 2. WHATSAPP_MESSAGES
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  body TEXT,
  message_id TEXT UNIQUE,
  is_group BOOLEAN DEFAULT false,
  is_from_me BOOLEAN DEFAULT false,
  contact_name TEXT,
  has_keywords BOOLEAN DEFAULT false,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_connection ON whatsapp_messages(connection_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_company ON whatsapp_messages(company_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_from ON whatsapp_messages(from_number);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_timestamp ON whatsapp_messages(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_keywords ON whatsapp_messages(has_keywords);

-- ============================================
-- 3. WHATSAPP_AUTO_CLIENTS
-- ============================================
CREATE TABLE IF NOT EXISTS whatsapp_auto_clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id UUID NOT NULL REFERENCES whatsapp_connections(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  phone_number TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(connection_id, phone_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_auto_clients_connection ON whatsapp_auto_clients(connection_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auto_clients_client ON whatsapp_auto_clients(client_id);

-- ============================================
-- 4. Add has_keywords column if table already exists
-- ============================================
-- This handles the case where the table was already created without the has_keywords column
-- The CREATE TABLE IF NOT EXISTS above will only create the table if it doesn't exist
-- This ALTER TABLE will add the column if the table exists but doesn't have the column
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS has_keywords BOOLEAN DEFAULT false;

-- ============================================
-- 5. TRIGGERS for updated_at
-- ============================================
DROP TRIGGER IF EXISTS update_whatsapp_connections_updated_at ON whatsapp_connections;
CREATE TRIGGER update_whatsapp_connections_updated_at 
  BEFORE UPDATE ON whatsapp_connections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) - DISABLED
-- ============================================
-- Disable RLS on WhatsApp tables (using custom auth)
ALTER TABLE whatsapp_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_auto_clients DISABLE ROW LEVEL SECURITY;
