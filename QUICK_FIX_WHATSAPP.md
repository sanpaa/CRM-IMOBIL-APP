# Quick Fix Guide - WhatsApp Database Error

## Problem
WhatsApp backend was crashing with:
```
Could not find the 'has_keywords' column of 'whatsapp_messages' in the schema cache
```

## Solution
Added the missing `has_keywords` column to the `whatsapp_messages` table.

## How to Apply (Choose One Method)

### Method 1: Quick Fix (If WhatsApp tables already exist)
Run this single SQL command in Supabase SQL Editor:

```sql
ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS has_keywords BOOLEAN DEFAULT false;
CREATE INDEX IF NOT EXISTS idx_whatsapp_messages_keywords ON whatsapp_messages(has_keywords);
```

### Method 2: Full Migration (If starting fresh or tables don't exist)
Run the complete migration file:
```sql
-- Copy and run: migration-add-whatsapp-tables.sql
```

### Method 3: New Database Setup
Use the updated `supabase-schema.sql` which now includes all WhatsApp tables.

## Verification
After applying, verify with:
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'whatsapp_messages'
AND column_name = 'has_keywords';
```

Expected output:
```
column_name  | data_type | column_default
-------------+-----------+----------------
has_keywords | boolean   | false
```

## What This Column Does
- Tracks messages containing real estate keywords (casa, apartamento, imóvel, etc.)
- Helps identify potential leads automatically
- Used by backend for keyword detection feature

## Files Modified
1. `migration-add-whatsapp-tables.sql` - New migration file
2. `supabase-schema.sql` - Updated with WhatsApp tables
3. `WHATSAPP_DATABASE_FIX.md` - Detailed documentation

## Result
✅ WhatsApp messages save successfully
✅ No more backend crashes
✅ Keyword detection works properly
