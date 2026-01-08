# Quick Fix Guide - Missing Layouts Issue

## ⚠️ Problem
Backend logs show: **"Total layouts found: 0"**

## ✅ Solution (3 Simple Steps)

### Step 1: Run Migration in Supabase
1. Open [Supabase Dashboard](https://app.supabase.com)
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy and paste the entire content of `migration-add-all-default-layouts.sql`
5. Click **Run** (or press Ctrl+Enter)

### Step 2: Verify (Optional but Recommended)
Run this in SQL Editor:
```sql
SELECT 
    c.name as company_name,
    COUNT(wl.id) as layout_count,
    STRING_AGG(wl.page_type, ', ' ORDER BY wl.page_type) as page_types
FROM companies c
LEFT JOIN website_layouts wl ON c.id = wl.company_id
WHERE c.website_enabled = true
GROUP BY c.id, c.name;
```
Expected result: **layout_count = 5**, page_types = `about, contact, home, properties, property-detail`

### Step 3: Restart Backend
- **Render.com**: Dashboard → Your Service → Manual Deploy
- **Local**: `npm start` or restart your server

## ✅ Expected Backend Logs After Fix
```
🔍 Found layout for home : YES ✅
🔍 Found layout for properties : YES ✅
🔍 Found layout for property-detail : YES ✅
🔍 Found layout for about : YES ✅
🔍 Found layout for contact : YES ✅
🔍 Total layouts found: 5
```

---

## 📱 WhatsApp Not Working?

**This is separate from the layouts issue.** "disconnected" is normal when not connected yet.

**To connect WhatsApp:**
1. Login to CRM
2. Go to **Configurações** (Settings) → **WhatsApp**
3. Click **"Conectar WhatsApp"** (Connect WhatsApp)
4. Scan QR code with your phone's WhatsApp
5. Wait for "Conectado" (Connected) ✅

**Already connected but not working?**
- Check backend logs for WhatsApp errors
- Verify `sessions/` folder has write permissions
- Check if phone's WhatsApp is still connected to the web
- Try disconnecting and reconnecting

---

## 📁 Files in This PR
- `migration-add-all-default-layouts.sql` - The SQL migration to fix layouts
- `MIGRATION_FIX_LAYOUTS.md` - Detailed documentation
- `QUICK_FIX_GUIDE.md` - This quick reference (you are here!)

---

## ❓ Still Having Issues?

1. Check that `website_enabled = true` for your company in the database
2. Verify the migration ran without errors
3. Check backend logs for specific error messages
4. Ensure Supabase connection is working properly

For more details, see `MIGRATION_FIX_LAYOUTS.md`
