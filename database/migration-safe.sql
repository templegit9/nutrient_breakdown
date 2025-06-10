-- Safe migration script that handles missing tables gracefully
-- This script checks for table existence before dropping and creates new schema

-- STEP 1: Drop existing tables only if they exist (CASCADE will handle dependencies)
DROP TABLE IF EXISTS blood_glucose_readings CASCADE;
DROP TABLE IF EXISTS food_entries CASCADE;
DROP TABLE IF EXISTS nutrition_goals CASCADE;
DROP TABLE IF EXISTS custom_foods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS foods CASCADE;

-- STEP 2: Drop triggers and functions safely
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
DROP TRIGGER IF EXISTS update_foods_updated_at ON foods;
DROP TRIGGER IF EXISTS update_food_entries_updated_at ON food_entries;
DROP TRIGGER IF EXISTS update_nutrition_goals_updated_at ON nutrition_goals;
DROP TRIGGER IF EXISTS update_custom_foods_updated_at ON custom_foods;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- STEP 3: Drop any existing indexes
DROP INDEX IF EXISTS idx_food_entries_user_id;
DROP INDEX IF EXISTS idx_food_entries_consumed_at;
DROP INDEX IF EXISTS idx_blood_glucose_user_id;
DROP INDEX IF EXISTS idx_blood_glucose_measured_at;
DROP INDEX IF EXISTS idx_foods_name;
DROP INDEX IF EXISTS idx_foods_category;
DROP INDEX IF EXISTS idx_foods_brand;
DROP INDEX IF EXISTS idx_custom_foods_user_id;
DROP INDEX IF EXISTS idx_nutrition_goals_user_id;
DROP INDEX IF EXISTS idx_nutrition_goals_date;
DROP INDEX IF EXISTS idx_user_profiles_user_id;

-- STEP 4: Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- STEP 5: Create the new schema with auth.users references

-- Food database table (no foreign keys, create first)
CREATE TABLE foods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(100),
  serving_size DECIMAL(8,2),
  serving_unit VARCHAR(50),
  calories_per_100g DECIMAL(8,2),
  protein_per_100g DECIMAL(8,2),
  carbs_per_100g DECIMAL(8,2),
  fat_per_100g DECIMAL(8,2),
  fiber_per_100g DECIMAL(8,2),
  sugar_per_100g DECIMAL(8,2),
  sodium_per_100g DECIMAL(8,2),
  cholesterol_per_100g DECIMAL(8,2),
  potassium_per_100g DECIMAL(8,2),
  iron_per_100g DECIMAL(8,2),
  calcium_per_100g DECIMAL(8,2),
  vitamin_c_per_100g DECIMAL(8,2),
  vitamin_d_per_100g DECIMAL(8,2),
  glycemic_index INTEGER,
  glycemic_load DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles with health information (references auth.users directly)
CREATE TABLE user_profiles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255),
  age INTEGER,
  gender VARCHAR(20),
  height_cm DECIMAL(5,2),
  weight_kg DECIMAL(5,2),
  activity_level VARCHAR(50),
  health_conditions TEXT[],
  dietary_restrictions TEXT[],
  target_calories INTEGER,
  target_protein_g DECIMAL(6,2),
  target_carbs_g DECIMAL(6,2),
  target_fat_g DECIMAL(6,2),
  target_fiber_g DECIMAL(6,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Food entries table for tracking daily consumption
CREATE TABLE food_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  food_id UUID REFERENCES foods(id),
  custom_food_name VARCHAR(255),
  serving_amount DECIMAL(8,2) NOT NULL,
  serving_unit VARCHAR(50) NOT NULL,
  calories DECIMAL(8,2),
  protein_g DECIMAL(8,2),
  carbs_g DECIMAL(8,2),
  fat_g DECIMAL(8,2),
  fiber_g DECIMAL(8,2),
  sugar_g DECIMAL(8,2),
  sodium_mg DECIMAL(8,2),
  meal_type VARCHAR(50),
  consumed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blood glucose readings table
CREATE TABLE blood_glucose_readings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  glucose_level DECIMAL(5,2) NOT NULL,
  reading_type VARCHAR(50),
  notes TEXT,
  measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Nutrition goals table for dynamic goal setting
CREATE TABLE nutrition_goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_date DATE NOT NULL,
  target_calories INTEGER,
  target_protein_g DECIMAL(6,2),
  target_carbs_g DECIMAL(6,2),
  target_fat_g DECIMAL(6,2),
  target_fiber_g DECIMAL(6,2),
  target_sugar_g DECIMAL(6,2),
  target_sodium_mg DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, goal_date)
);

-- Custom foods table for user-created foods
CREATE TABLE custom_foods (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  category VARCHAR(100),
  serving_size DECIMAL(8,2),
  serving_unit VARCHAR(50),
  calories_per_serving DECIMAL(8,2),
  protein_per_serving DECIMAL(8,2),
  carbs_per_serving DECIMAL(8,2),
  fat_per_serving DECIMAL(8,2),
  fiber_per_serving DECIMAL(8,2),
  sugar_per_serving DECIMAL(8,2),
  sodium_per_serving DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 6: Create indexes
CREATE INDEX idx_food_entries_user_id ON food_entries(user_id);
CREATE INDEX idx_food_entries_consumed_at ON food_entries(consumed_at);
CREATE INDEX idx_blood_glucose_user_id ON blood_glucose_readings(user_id);
CREATE INDEX idx_blood_glucose_measured_at ON blood_glucose_readings(measured_at);
CREATE INDEX idx_foods_name ON foods(name);
CREATE INDEX idx_foods_category ON foods(category);
CREATE INDEX idx_foods_brand ON foods(brand);
CREATE INDEX idx_custom_foods_user_id ON custom_foods(user_id);
CREATE INDEX idx_nutrition_goals_user_id ON nutrition_goals(user_id);
CREATE INDEX idx_nutrition_goals_date ON nutrition_goals(goal_date);
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);

-- STEP 7: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_glucose_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutrition_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

-- STEP 8: Create RLS policies
-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policies for food_entries
CREATE POLICY "Users can view own food entries" ON food_entries
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own food entries" ON food_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own food entries" ON food_entries
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own food entries" ON food_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for blood_glucose_readings
CREATE POLICY "Users can view own glucose readings" ON blood_glucose_readings
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own glucose readings" ON blood_glucose_readings
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own glucose readings" ON blood_glucose_readings
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own glucose readings" ON blood_glucose_readings
  FOR DELETE USING (auth.uid() = user_id);

-- Policies for nutrition_goals
CREATE POLICY "Users can view own nutrition goals" ON nutrition_goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own nutrition goals" ON nutrition_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nutrition goals" ON nutrition_goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Policies for custom_foods
CREATE POLICY "Users can view own custom foods" ON custom_foods
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own custom foods" ON custom_foods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own custom foods" ON custom_foods
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own custom foods" ON custom_foods
  FOR DELETE USING (auth.uid() = user_id);

-- STEP 9: Create functions and triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_user_profiles_updated_at 
  BEFORE UPDATE ON user_profiles 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_foods_updated_at 
  BEFORE UPDATE ON foods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_food_entries_updated_at 
  BEFORE UPDATE ON food_entries 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_nutrition_goals_updated_at 
  BEFORE UPDATE ON nutrition_goals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_custom_foods_updated_at 
  BEFORE UPDATE ON custom_foods 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
SELECT 'Database schema successfully created with auth.users references!' as status;