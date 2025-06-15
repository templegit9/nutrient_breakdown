-- Migration: Add grouped food entries table for LLM-brain architecture
-- This table stores meal entries with individual food items as JSON

-- Create grouped_food_entries table
CREATE TABLE IF NOT EXISTS grouped_food_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Original input and combined name
    original_input TEXT NOT NULL,
    combined_name TEXT NOT NULL,
    
    -- Total nutrition values (aggregated)
    total_calories DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_protein DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_carbohydrates DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fat DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_fiber DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_sugar DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_sodium DECIMAL(10,2) NOT NULL DEFAULT 0,
    
    -- Total micronutrients (optional)
    total_calcium DECIMAL(10,2),
    total_iron DECIMAL(10,2),
    total_vitamin_c DECIMAL(10,2),
    total_vitamin_d DECIMAL(10,2),
    total_potassium DECIMAL(10,2),
    
    -- Individual food items as JSON
    individual_items JSONB NOT NULL,
    
    -- Metadata
    date_added TIMESTAMPTZ NOT NULL,
    time_of_day TEXT,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_user_id ON grouped_food_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_date_added ON grouped_food_entries(date_added);
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_meal_type ON grouped_food_entries(meal_type);
CREATE INDEX IF NOT EXISTS idx_grouped_food_entries_user_date ON grouped_food_entries(user_id, date_added);

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

-- Sample data structure for individual_items JSONB field:
-- [
--   {
--     "name": "bread",
--     "quantity": 4,
--     "unit": "slice",
--     "calories": 320,
--     "protein": 12,
--     "carbohydrates": 64,
--     "fat": 4,
--     "fiber": 8,
--     "sugar": 8,
--     "sodium": 480,
--     "calcium": 160,
--     "iron": 4.8,
--     "vitamin_c": 0,
--     "vitamin_d": 0,
--     "potassium": 240
--   },
--   {
--     "name": "scrambled eggs",
--     "quantity": 3,
--     "unit": "large",
--     "calories": 210,
--     "protein": 18,
--     "carbohydrates": 2,
--     "fat": 15,
--     "fiber": 0,
--     "sugar": 1,
--     "sodium": 180,
--     "calcium": 84,
--     "iron": 2.1,
--     "vitamin_c": 0,
--     "vitamin_d": 2.2,
--     "potassium": 207
--   }
-- ]

COMMENT ON TABLE grouped_food_entries IS 'Stores meal entries with LLM-processed individual food items';
COMMENT ON COLUMN grouped_food_entries.original_input IS 'Original user input like "4 slices bread and 3 eggs"';
COMMENT ON COLUMN grouped_food_entries.combined_name IS 'Display name like "Bread and Scrambled Eggs"';
COMMENT ON COLUMN grouped_food_entries.individual_items IS 'JSON array of individual food items with nutrition';
COMMENT ON COLUMN grouped_food_entries.total_calories IS 'Sum of all individual item calories';
COMMENT ON COLUMN grouped_food_entries.total_protein IS 'Sum of all individual item protein in grams';