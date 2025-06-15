# EMERGENCY DATABASE FIX

## Current Error
`Could not find the 'combined_name' column of 'grouped_food_entries' in the schema cache`

## IMMEDIATE SOLUTION

### Step 1: Run This SQL in Supabase SQL Editor

```sql
-- EMERGENCY: Create simple working table
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

-- Test insert (will fail if structure wrong)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        INSERT INTO grouped_food_entries (
            user_id,
            description,
            individual_items,
            total_calories,
            total_protein,
            total_carbs,
            total_fat,
            time_of_day
        ) VALUES (
            test_user_id,
            'Test Entry - Delete Me',
            '[{"name": "test", "calories": 100}]'::jsonb,
            100,
            10,
            15,
            5,
            'morning'
        );
        
        -- Clean up
        DELETE FROM grouped_food_entries WHERE description = 'Test Entry - Delete Me';
        
        RAISE NOTICE 'SUCCESS: Table structure is correct!';
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
END $$;
```

### Step 2: Restart Development Server
```bash
npm run dev
```

### Step 3: Clear Browser Cache
Hard refresh: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)

### Step 4: Set Gemini API Key (if not done)
Create `.env.local`:
```bash
VITE_GEMINI_API_KEY=AIza-your-actual-key-here
```

## Why This Error Occurred

1. **Schema Mismatch**: The code expects `combined_name` but database has `description`
2. **Missing Columns**: Code looks for columns that don't exist in simplified schema
3. **Static vs Instance Methods**: Service class method calls were inconsistent

## Files That Need the Database

- `src/services/groupedFoodDatabase.ts` - Database service (updated)
- `src/components/FoodHistory.tsx` - Uses the service
- `src/components/LLMFoodEntry.tsx` - Saves to database

## Expected Behavior After Fix

✅ FoodHistory loads without errors
✅ LLM food entry saves to database
✅ Expandable rows show individual foods
✅ Nutrient selection works
✅ No console errors

## If Still Not Working

1. Check browser console for new errors
2. Verify user is logged in
3. Test with: "I ate an apple" in LLM Food Entry
4. Check Supabase logs for SQL errors

---

**This fix creates a minimal working database structure that matches the current code expectations.**