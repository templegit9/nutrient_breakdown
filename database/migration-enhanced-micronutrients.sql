-- Enhanced Migration: Add All Micronutrient Columns to food_entries
-- This migration adds comprehensive micronutrient tracking support

-- First, let's create the enhanced food_entries table with all micronutrient columns
CREATE TABLE IF NOT EXISTS food_entries_enhanced (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    food_id INTEGER REFERENCES foods(id),
    custom_food_name VARCHAR(255),
    serving_amount DECIMAL(8,2) NOT NULL,
    serving_unit VARCHAR(50) NOT NULL,
    
    -- Macronutrients
    calories DECIMAL(10,2) DEFAULT 0,
    protein_g DECIMAL(10,2) DEFAULT 0,
    carbs_g DECIMAL(10,2) DEFAULT 0,
    fat_g DECIMAL(10,2) DEFAULT 0,
    fiber_g DECIMAL(10,2) DEFAULT 0,
    sugar_g DECIMAL(10,2) DEFAULT 0,
    
    -- Basic minerals
    sodium_mg DECIMAL(10,2) DEFAULT 0,
    cholesterol_mg DECIMAL(10,2) DEFAULT 0,
    potassium_mg DECIMAL(10,2) DEFAULT 0,
    
    -- Essential minerals
    calcium_mg DECIMAL(10,2) DEFAULT 0,
    iron_mg DECIMAL(10,2) DEFAULT 0,
    magnesium_mg DECIMAL(10,2) DEFAULT 0,
    phosphorus_mg DECIMAL(10,2) DEFAULT 0,
    zinc_mg DECIMAL(10,2) DEFAULT 0,
    copper_mg DECIMAL(10,3) DEFAULT 0,
    manganese_mg DECIMAL(10,3) DEFAULT 0,
    selenium_mcg DECIMAL(10,2) DEFAULT 0,
    
    -- Vitamins - Fat Soluble
    vitamin_a_iu DECIMAL(10,2) DEFAULT 0,
    vitamin_d_iu DECIMAL(10,2) DEFAULT 0,
    vitamin_e_mg DECIMAL(10,2) DEFAULT 0,
    vitamin_k_mcg DECIMAL(10,2) DEFAULT 0,
    
    -- Vitamins - Water Soluble
    vitamin_c_mg DECIMAL(10,2) DEFAULT 0,
    thiamin_mg DECIMAL(10,3) DEFAULT 0,
    riboflavin_mg DECIMAL(10,3) DEFAULT 0,
    niacin_mg DECIMAL(10,2) DEFAULT 0,
    pantothenic_acid_mg DECIMAL(10,2) DEFAULT 0,
    vitamin_b6_mg DECIMAL(10,2) DEFAULT 0,
    biotin_mcg DECIMAL(10,2) DEFAULT 0,
    folate_mcg DECIMAL(10,2) DEFAULT 0,
    vitamin_b12_mcg DECIMAL(10,2) DEFAULT 0,
    choline_mg DECIMAL(10,2) DEFAULT 0,
    
    -- Additional nutrients
    glycemic_index INTEGER,
    glycemic_load DECIMAL(10,2),
    
    -- Meal tracking
    meal_type VARCHAR(50),
    cooking_state VARCHAR(50) DEFAULT 'raw',
    time_of_day VARCHAR(50),
    
    -- Timestamps
    consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copy existing data to enhanced table (excluding food_id since it's incompatible type)
INSERT INTO food_entries_enhanced (
    id, user_id, custom_food_name, serving_amount, serving_unit,
    calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
    meal_type, consumed_at, created_at, updated_at
)
SELECT 
    id, user_id, custom_food_name, serving_amount, serving_unit,
    calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg,
    meal_type, consumed_at, created_at, updated_at
FROM food_entries;

-- Drop old table and rename enhanced table
DROP TABLE food_entries;
ALTER TABLE food_entries_enhanced RENAME TO food_entries;

-- Create indexes for performance
CREATE INDEX idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX idx_food_entries_consumed_at ON food_entries(consumed_at);
CREATE INDEX idx_food_entries_meal_type ON food_entries(meal_type);

-- Enable RLS
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own food entries" ON food_entries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own food entries" ON food_entries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own food entries" ON food_entries
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food entries" ON food_entries
    FOR DELETE USING (auth.uid() = user_id);

-- Update trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_food_entries_updated_at 
    BEFORE UPDATE ON food_entries 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();