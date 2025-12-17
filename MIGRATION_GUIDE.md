# Database Migration Guide - Using Neon SQL Editor

## Why Use Neon SQL Editor?
- ✅ No need to install psql
- ✅ No connection string issues
- ✅ Built-in authentication
- ✅ Visual feedback

## Steps

### 1. Open Neon Console
Go to: https://console.neon.tech

### 2. Select Your Project
Click on your GlossyClipsKE project

### 3. Open SQL Editor
Click "SQL Editor" in the left sidebar

### 4. Run Scripts One by One

Copy and paste each script below into the SQL Editor and click "Run"

---

## Script 1: Create Tables (SKIP - Already done)
File: `scripts/001-create-tables.sql`
Status: ✅ Already exists from initial setup

---

## Script 2: Seed Products (SKIP - Already done)
File: `scripts/002-seed-products.sql`
Status: ✅ Already exists from initial setup

---

## Script 3: Seed Testimonials (SKIP - Already done)
File: `scripts/003-seed-testimonials.sql`
Status: ✅ Already exists from initial setup

---

## Script 4: Add Bundles (SKIP - Already done)
File: `scripts/004-add-bundles-and-stock.sql`
Status: ✅ Already exists from initial setup

---

## Script 5: Create Admin (SKIP - Already done)
File: `scripts/004-create-admin.sql`
Status: ✅ Already exists from initial setup

---

## ⭐ Script 6: Add Reviews (NEW - RUN THIS)
File: `scripts/005-add-reviews.sql`

**Instructions:**
1. Open the file: `c:\Users\USERR\PythonProject\glossyke2\scripts\005-add-reviews.sql`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Paste into Neon SQL Editor
4. Click "Run"
5. Wait for success message

---

## ⭐ Script 7: Add Wishlist (NEW - RUN THIS)
File: `scripts/006-add-wishlist.sql`

**Instructions:**
1. Open the file: `c:\Users\USERR\PythonProject\glossyke2\scripts\006-add-wishlist.sql`
2. Copy ALL the content
3. Paste into Neon SQL Editor
4. Click "Run"

---

## ⭐ Script 8: Add Inventory Alerts (NEW - RUN THIS)
File: `scripts/007-add-inventory-alerts.sql`

**Instructions:**
1. Open the file: `c:\Users\USERR\PythonProject\glossyke2\scripts\007-add-inventory-alerts.sql`
2. Copy ALL the content
3. Paste into Neon SQL Editor
4. Click "Run"

---

## ⭐ Script 9: Add Pickup Mtaani (NEW - RUN THIS)
File: `scripts/008-add-pickup-mtaani.sql`

**Instructions:**
1. Open the file: `c:\Users\USERR\PythonProject\glossyke2\scripts\008-add-pickup-mtaani.sql`
2. Copy ALL the content
3. Paste into Neon SQL Editor
4. Click "Run"

---

## Verification

After running all scripts, verify in Neon SQL Editor:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

You should see:
- ✅ product_reviews
- ✅ wishlists
- ✅ inventory_alerts
- ✅ pickup_mtaani_locations

---

## Alternative: Fix psql Connection

If you prefer using psql, the issue is with your DATABASE_URL format.

**Correct format:**
```
postgresql://username:password@hostname/database?sslmode=require
```

**Common issues:**
- Missing quotes around the URL
- Special characters in password not URL-encoded
- Missing `?sslmode=require` at the end

**To fix in PowerShell:**
```powershell
# Set the URL with quotes
$env:DATABASE_URL = "postgresql://user:pass@host.neon.tech/dbname?sslmode=require"

# Then run migrations
psql $env:DATABASE_URL -f scripts/005-add-reviews.sql
```

---

## Need Help?

If you get errors:
1. Share the error message
2. I'll help you fix it

The Neon SQL Editor method is recommended as it's the most reliable!
