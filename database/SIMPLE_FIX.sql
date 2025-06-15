-- SIMPLE EMERGENCY FIX: Match what FoodHistory.tsx actually expects
-- This creates the minimal structure the UI needs

-- Drop existing table
DROP TABLE IF EXISTS grouped_food_entries;

-- Create simple table matching UI expectations
CREATE TABLE grouped_food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- UI expects these fields (from FoodHistory.tsx)
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

-- Test with sample data
INSERT INTO grouped_food_entries (
    user_id,
    description,
    individual_items,
    total_calories,
    total_protein,
    total_carbs,
    total_fat,
    time_of_day
) SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    'Sample Meal - Bread and Eggs',
    '[{"name": "bread", "calories": 160, "protein": 6, "carbs": 30, "fat": 2}, {"name": "eggs", "calories": 140, "protein": 12, "carbs": 1, "fat": 10}]'::jsonb,
    300,
    18,
    31,
    12,
    'morning'
WHERE EXISTS (SELECT 1 FROM auth.users LIMIT 1);

-- Verify structure
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'grouped_food_entries' 
ORDER BY ordinal_position;