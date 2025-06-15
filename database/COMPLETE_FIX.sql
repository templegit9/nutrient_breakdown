-- COMPLETE FIX: Create table with ALL required columns
-- This matches the GroupedFoodEntryDB interface exactly

-- Drop existing table to start fresh
DROP TABLE IF EXISTS grouped_food_entries;

-- Create table with complete structure matching the code
CREATE TABLE grouped_food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Required by GroupedFoodEntryDB interface
    original_input TEXT NOT NULL,
    combined_name TEXT NOT NULL,
    
    -- Nutrition totals (required)
    total_calories DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_protein DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_carbohydrates DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fat DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fiber DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_sugar DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_sodium DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Micronutrients (optional)
    total_calcium DECIMAL(10,2),
    total_iron DECIMAL(10,2),
    total_vitamin_c DECIMAL(10,2),
    total_vitamin_d DECIMAL(10,2),
    total_potassium DECIMAL(10,2),
    
    -- Individual items as JSON
    individual_items JSONB NOT NULL,
    
    -- Metadata
    date_added TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_of_day TEXT,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE grouped_food_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own grouped food entries" ON grouped_food_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own grouped food entries" ON grouped_food_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own grouped food entries" ON grouped_food_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own grouped food entries" ON grouped_food_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_user_id ON grouped_food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_date_added ON grouped_food_entries(date_added);
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_created_at ON grouped_food_entries(created_at);
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_meal_type ON grouped_food_entries(meal_type);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_grouped_food_entries_updated_at 
    BEFORE UPDATE ON grouped_food_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Verify table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'grouped_food_entries' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Test the structure with a sample insert (will be deleted)
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get a user ID (or create a dummy one for testing)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NULL THEN
        -- If no users exist, just test the table structure
        RAISE NOTICE 'No users found, skipping test insert';
    ELSE
        -- Test insert
        INSERT INTO grouped_food_entries (
            user_id,
            original_input,
            combined_name,
            total_calories,
            total_protein,
            total_carbohydrates,
            total_fat,
            total_fiber,
            total_sugar,
            total_sodium,
            individual_items,
            date_added
        ) VALUES (
            test_user_id,
            'Test input: 2 slices bread',
            'Test Bread',
            160,
            6,
            30,
            2,
            4,
            4,
            240,
            '[{"name": "bread", "quantity": 2, "unit": "slice", "calories": 160, "protein": 6, "carbohydrates": 30, "fat": 2}]'::jsonb,
            NOW()
        );
        
        -- Verify the insert worked
        RAISE NOTICE 'Test insert successful, deleting test data...';
        
        -- Clean up test data
        DELETE FROM grouped_food_entries WHERE combined_name = 'Test Bread';
        
        RAISE NOTICE 'Test complete - table is working correctly!';
    END IF;
END $$;