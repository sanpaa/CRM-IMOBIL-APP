# Fix: Missing Website Layouts

## Problem

The backend logs show `"Total layouts found: 0"` for company `3c505bfd-6ab7-44c8-9e02-b6c43428e06f`, which causes the website to not load properly.

The backend is searching for layouts:
- home
- properties  
- property-detail
- about
- contact

But finding **0 layouts** in the database.

## Root Cause

The database migration (`migration-website-customization.sql`) only creates a default **home** layout, but the backend expects all 5 page types to exist.

## Solution

### Step 1: Apply the Migration

Run the SQL migration to create all missing default layouts:

```bash
# Connect to your Supabase database and run:
psql -h <your-db-host> -U <your-db-user> -d <your-db-name> -f migration-add-all-default-layouts.sql
```

Or in Supabase Dashboard:
1. Go to SQL Editor
2. Open `migration-add-all-default-layouts.sql`
3. Click "Run"

### Step 2: Verify Layouts Were Created

Run this query to verify:

```sql
SELECT 
    c.name as company_name,
    c.id as company_id,
    COUNT(wl.id) as layout_count,
    STRING_AGG(wl.page_type, ', ' ORDER BY wl.page_type) as page_types
FROM companies c
LEFT JOIN website_layouts wl ON c.id = wl.company_id
WHERE c.website_enabled = true
GROUP BY c.id, c.name
ORDER BY c.name;
```

You should see:
- **layout_count: 5** (or more)
- **page_types:** `about, contact, home, properties, property-detail`

### Step 3: Restart Backend

After applying the migration, restart your backend server:

```bash
# If using Render.com
# Go to Dashboard → Your Service → Manual Deploy → Deploy Latest Commit

# Or if running locally
npm run start
```

## Expected Result

After applying the migration, the backend logs should show:

```
🔍 Searching for layout: home
🔍 Found layout for home : YES ✅
🔍 Searching for layout: properties
🔍 Found layout for properties : YES ✅
🔍 Searching for layout: property-detail
🔍 Found layout for property-detail : YES ✅
🔍 Searching for layout: about
🔍 Found layout for about : YES ✅
🔍 Searching for layout: contact
🔍 Found layout for contact : YES ✅
🔍 Total layouts found: 5
```

## About WhatsApp Issue

The comment mentions: "quero saber pq essa bosta de whatsapp não está funcionadno cara" (WhatsApp is not working).

The WhatsApp issue is **separate** from the layouts issue. Based on the logs:

```
User 'Novo Admin' has plaintext password in database - passwords should be hashed with bcrypt for security
[WhatsAppService] Status: {
  status: 'disconnected',
  is_connected: false,
  message: 'Not connected. Click "Connect WhatsApp" to start.'
}
```

The WhatsApp shows as disconnected, which is the **expected behavior** when not connected. To connect WhatsApp:

1. Log into the CRM admin panel
2. Go to **Settings** → **WhatsApp**
3. Click **"Connect WhatsApp"**
4. Scan the QR code with your phone
5. Wait for connection confirmation

The WhatsApp service has been enhanced with:
- ✅ Connection persistence (survives page refresh)
- ✅ Automatic reconnection on backend restart
- ✅ Circuit breaker pattern to prevent failures
- ✅ Error handling and graceful degradation

If WhatsApp continues to disconnect unexpectedly, check:
- Backend is properly configured with WhatsApp Web.js
- `sessions/` folder exists and has write permissions
- Database `whatsapp_connections` table exists
- User is scanning the QR code correctly

## Files Changed

- ✅ `migration-add-all-default-layouts.sql` - SQL migration to create missing layouts
- ✅ `MIGRATION_FIX_LAYOUTS.md` - This documentation file

## Next Steps

1. Apply the migration SQL
2. Verify layouts exist in database
3. Restart backend
4. Test: Visit the website and confirm layouts load
5. For WhatsApp: Follow connection steps in admin panel
