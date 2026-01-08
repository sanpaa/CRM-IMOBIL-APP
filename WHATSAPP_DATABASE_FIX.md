# WhatsApp Database Fix - Missing `has_keywords` Column

## Problem Description

The WhatsApp backend service was encountering the following error when trying to save incoming messages:

```
[WhatsAppService] ❌ ERRO AO PROCESSAR MENSAGEM
[WhatsAppService] Erro: Could not find the 'has_keywords' column of 'whatsapp_messages' in the schema cache
```

This error occurred because the backend code was attempting to insert a `has_keywords` column into the `whatsapp_messages` table, but this column didn't exist in the database schema.

## Root Cause

The original `whatsapp_messages` table schema defined in `WHATSAPP_BACKEND_IMPLEMENTATION.md` did not include the `has_keywords` column, which is used by the backend to track whether a message contains real estate-related keywords (like "casa", "apartamento", "imóvel", etc.). This feature helps identify potential leads automatically.

The backend logs showed:
```
[WhatsAppService] 🔍 Contém palavras-chave imobiliárias: ❌ NÃO
[WhatsAppService] 💾 Salvando mensagem no banco...
[WhatsAppService] ❌ ERRO AO PROCESSAR MENSAGEM
```

## Solution

### 1. Migration File Created

Created `migration-add-whatsapp-tables.sql` which:
- Creates all three WhatsApp tables if they don't exist:
  - `whatsapp_connections` - Stores active WhatsApp connections per company
  - `whatsapp_messages` - Stores all received/sent messages **with `has_keywords` column**
  - `whatsapp_auto_clients` - Tracks auto-created clients from WhatsApp
- Adds the missing `has_keywords` column if the table already exists
- Creates appropriate indexes for performance
- Sets up triggers and disables RLS (Row Level Security)

### 2. Main Schema Updated

Updated `supabase-schema.sql` to include:
- All WhatsApp tables with the `has_keywords` column
- Proper indexes including one for `has_keywords` for efficient filtering
- Triggers and RLS configuration

## How to Apply the Fix

### Option 1: If Database is Already Set Up (Recommended)
Run only the migration to add the missing column:

```sql
-- Connect to your Supabase database and run:
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS has_keywords BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_keywords ON whatsapp_messages(has_keywords);
```

### Option 2: Full Migration
If you haven't created the WhatsApp tables yet, run the complete migration:

1. Open Supabase SQL Editor
2. Copy the contents of `migration-add-whatsapp-tables.sql`
3. Execute the migration
4. Verify tables were created:
   ```sql
   SELECT * FROM information_schema.tables 
   WHERE table_name IN ('whatsapp_connections', 'whatsapp_messages', 'whatsapp_auto_clients');
   ```

### Option 3: Fresh Database Setup
If setting up a new database from scratch:
1. Use the updated `supabase-schema.sql` which now includes all WhatsApp tables

## Verification

After applying the fix, verify the column exists:

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'whatsapp_messages'
AND column_name = 'has_keywords';
```

Expected result:
```
column_name  | data_type | is_nullable | column_default
-------------+-----------+-------------+----------------
has_keywords | boolean   | YES         | false
```

## What the `has_keywords` Column Does

The `has_keywords` column is a boolean flag that indicates whether a WhatsApp message contains real estate-related keywords. The backend automatically:

1. Analyzes incoming message text for keywords like:
   - "casa", "apartamento", "imóvel", "terreno"
   - "comprar", "vender", "alugar"
   - "quarto", "dormitório", "suíte"
   - And other real estate-related terms

2. Sets `has_keywords = true` if any keywords are found

3. This allows filtering high-priority messages (potential leads) from general inquiries

## Impact

With this fix:
- ✅ WhatsApp messages will be saved successfully
- ✅ Backend will no longer crash when processing messages
- ✅ Keyword detection will work properly
- ✅ High-priority leads can be identified automatically
- ✅ The application can track engagement metrics

## Files Modified

1. `migration-add-whatsapp-tables.sql` - New migration file (created)
2. `supabase-schema.sql` - Updated with WhatsApp tables including `has_keywords`
3. `WHATSAPP_DATABASE_FIX.md` - This documentation file (created)
