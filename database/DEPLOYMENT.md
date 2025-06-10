# Supabase Database Setup Guide

## Quick Start (5 Steps)

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Project name:** `nutrient-tracker`
   - **Database password:** Create a strong password (save it!)
   - **Region:** Choose closest to your location
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### 2. Set Up Database Tables
1. In your Supabase project, click **"SQL Editor"** in the sidebar
2. Copy the entire contents of `clean-install.sql` from this folder
3. Paste it into the SQL Editor
4. Click **"Run"** button
5. You should see "Success. No rows returned" message

### 3. Load Food Database
1. Still in **SQL Editor**, clear the previous query
2. Copy the entire contents of `complete_verified_foods_database.sql` 
3. Paste it into the SQL Editor
4. Click **"Run"** button
5. You should see "Success. 441 rows affected" (or similar)

### 4. Get Your API Keys
1. Click **"Settings"** in the sidebar
2. Click **"API"**
3. Copy these two values:
   - **Project URL**
   - **anon public key** (NOT the service_role key)

### 5. Add Keys to Your App
Create a `.env.local` file in your project root with:
```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Test Your Setup

1. Run your app: `npm run dev`
2. Try these tests:
   - Sign up with a test email
   - Search for "Ugu" or "Plantain" in food search
   - Add a food entry and verify it saves
   - Check different cooking states (raw, boiled, fried)

## What You Get

Your database now includes:

### ✅ Complete Food Database (105+ Foods)
- **Nigerian Foods:** Ugu, Plantain, Yam, Garri, Egusi, etc.
- **International Foods:** Chicken, Rice, Apple, etc.
- **All Cooking States:** Raw, boiled, fried, steamed, baked, grilled, roasted

### ✅ Comprehensive Nutrition Data
- **Basic:** Calories, protein, carbs, fat, fiber, sugar, sodium
- **Vitamins:** Vitamin C, Vitamin D
- **Minerals:** Iron, calcium, potassium
- **Health Data:** Cholesterol, glycemic index, glycemic load

### ✅ Smart Features
- **Cooking Intelligence:** Nutrition adjusts based on cooking method
- **PCOS Support:** Food recommendations for PCOS management
- **Diabetes Support:** Glycemic index data for blood sugar management

---

## For Production Deployment

### Netlify Environment Variables
In your Netlify dashboard, add these environment variables:
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Vercel Environment Variables
In your Vercel dashboard, add the same variables in Settings → Environment Variables.

---

## Troubleshooting

### ❌ "relation already exists" Error
**Solution:** You already have tables. Use `migration-safe.sql` instead of `clean-install.sql`

### ❌ Food search returns empty results
**Solution:** 
1. Go to **Database → Tables → foods** 
2. Check if foods were imported (should see 100+ rows)
3. If empty, re-run the `complete_verified_foods_database.sql`

### ❌ Can't save food entries
**Solution:** Check Row Level Security policies:
1. Go to **Authentication → Policies**
2. Ensure policies exist for `food_entries` table
3. If missing, re-run `clean-install.sql`

### ❌ App can't connect to database
**Solution:** Check your environment variables:
1. Verify `.env.local` file exists
2. Check API keys are correct (no extra spaces)
3. Restart your dev server: `npm run dev`

### ❌ Missing nutrition fields
**Solution:** If upgrading from old database, run this in SQL Editor:
```sql
ALTER TABLE food_entries 
ADD COLUMN IF NOT EXISTS cholesterol_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS potassium_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS iron_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS calcium_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamin_c_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamin_d_iu DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS glycemic_index INTEGER,
ADD COLUMN IF NOT EXISTS glycemic_load INTEGER;
```

---

## Advanced Options

### Option A: Fresh Install (Recommended)
Use if you're starting completely fresh:
1. Use `clean-install.sql` for database schema
2. Use `complete_verified_foods_database.sql` for food data

### Option B: Safe Migration  
Use if you have existing data but want to upgrade:
1. Use `migration-safe.sql` instead of `clean-install.sql`
2. Then use `complete_verified_foods_database.sql`
3. **Warning:** This will delete existing food entries but preserve user accounts

### Option C: Reset Everything
Use if you want to completely start over:
1. Go to **Database → Tables** 
2. Delete all tables manually
3. Then follow Option A

---

## Need Help?

1. **Check the food database:** Go to Database → Tables → foods to verify import
2. **Test authentication:** Try signing up with a test account
3. **Verify API keys:** Double-check your environment variables
4. **Check console:** Look for error messages in browser dev tools

The setup should take about 10 minutes total!