# Troubleshooting Guide - LLM-Brain Architecture

This guide helps resolve common issues with the new LLM-powered food processing system.

## 🚨 Current Error: "getUserGroupedFoodEntries is not a function"

### Root Cause
Multiple issues:
1. Database table doesn't exist or has wrong column structure
2. Import/instantiation issues with the `GroupedFoodDatabase` class

### IMMEDIATE FIX (Emergency)

#### Step 1: Run SIMPLE Database Fix
**CRITICAL: The error shows column mismatch - use this simplified fix**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Copy and paste the entire contents of `database/SIMPLE_FIX.sql`

OR copy this simplified SQL:

```sql
-- SIMPLE FIX: Match UI expectations exactly
DROP TABLE IF EXISTS grouped_food_entries;

CREATE TABLE grouped_food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    description TEXT NOT NULL,
    individual_items JSONB NOT NULL,
    total_calories DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_protein DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_carbs DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fat DECIMAL(10,2) NOT NULL DEFAULT 0,
    time_of_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE grouped_food_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own grouped food entries" ON grouped_food_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grouped food entries" ON grouped_food_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own grouped food entries" ON grouped_food_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_user_id ON grouped_food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_created_at ON grouped_food_entries(created_at);
```

5. Click **Run**

#### Step 2: Check Environment Variables
Ensure you have the Gemini API key set:

Create `.env.local` file in project root:
```bash
VITE_GEMINI_API_KEY=AIza-your-actual-gemini-key-here
```

Get your key from: [Google AI Studio](https://aistudio.google.com/app/apikey)

#### Step 3: Restart Development Server
```bash
npm run dev
```

#### Step 4: Clear Browser Cache
- Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or open Developer Tools → Application → Clear Storage

## 🔍 Common Error Types

### 1. Database Errors

**Error**: `Failed to load resource: 404`
**Cause**: Database table doesn't exist
**Fix**: Run the migration SQL above

**Error**: `RLS policy violation`
**Cause**: Row Level Security policies not set
**Fix**: Ensure user is authenticated and RLS policies are created

### 2. API Errors

**Error**: `Gemini API key not configured`
**Cause**: Missing environment variable
**Fix**: Add `VITE_GEMINI_API_KEY` to `.env.local`

**Error**: `Failed to process food input`
**Possible Causes**:
- Invalid API key
- Rate limit exceeded (1,500 requests/day)
- Network connectivity issues

### 3. Import/Module Errors

**Error**: `getUserGroupedFoodEntries is not a function`
**Cause**: Import or build issue
**Fixes**:
1. Restart development server
2. Clear browser cache
3. Check console for module loading errors

## 🛠️ Step-by-Step Debugging

### 1. Verify Database Connection
Run this in Supabase SQL Editor:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'grouped_food_entries';
```

Should return: `grouped_food_entries`

### 2. Test Authentication
In browser console:
```javascript
// Check if user is logged in
console.log('User:', supabase.auth.getUser());
```

### 3. Test API Key
In browser console:
```javascript
// Check if API key is loaded
console.log('Gemini API Key:', import.meta.env.VITE_GEMINI_API_KEY ? 'SET' : 'MISSING');
```

### 4. Test Gemini API
Use the test script:
```bash
node test_gemini_integration.js
```

(Update the API key in the file first)

## 🔧 Manual Fixes

### If Database Migration Fails
Try creating the table manually:
```sql
CREATE TABLE grouped_food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    description TEXT NOT NULL,
    individual_items JSONB NOT NULL,
    total_calories DECIMAL(10,2) DEFAULT 0,
    total_protein DECIMAL(10,2) DEFAULT 0,
    total_carbs DECIMAL(10,2) DEFAULT 0,
    total_fat DECIMAL(10,2) DEFAULT 0,
    time_of_day TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### If Import Errors Persist
1. Check file paths in imports
2. Verify all new files are properly saved
3. Restart TypeScript language server in VS Code: `Ctrl+Shift+P` → "TypeScript: Restart TS Server"

## 📊 Verification Checklist

- [ ] Database table `grouped_food_entries` exists
- [ ] RLS policies are enabled and configured
- [ ] User is authenticated in the application
- [ ] `VITE_GEMINI_API_KEY` environment variable is set
- [ ] Development server restarted after env changes
- [ ] Browser cache cleared
- [ ] No console errors on page load
- [ ] Network tab shows successful API calls

## 🆘 If All Else Fails

### Temporary Fallback
If you need the app working immediately, you can temporarily disable the new LLM features by:

1. Reverting `src/App.tsx` to use the old `FoodEntry` component
2. Using the original `FoodHistory` component
3. This will restore basic functionality while debugging

### Get Help
1. Check browser console for specific error messages
2. Verify all files were saved and built properly
3. Ensure database connection is working
4. Test with a fresh browser session/incognito mode

## 📝 Success Indicators

When everything is working correctly, you should see:
- ✅ No console errors on app load
- ✅ LLM Food Entry component loads without errors
- ✅ Food History shows "No food entries yet" (not error messages)
- ✅ Test API call in `test_gemini_integration.js` succeeds
- ✅ Database queries return without 404 errors

---

**Note**: The new LLM-brain architecture is a significant change. If issues persist, ensure all migration steps were completed and the development server was fully restarted.