-- Add supplements and pills tracking tables
-- This script adds supplement tracking functionality to the nutrition tracker

-- Create supplements master table
CREATE TABLE IF NOT EXISTS supplements (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  type VARCHAR(100) NOT NULL, -- 'vitamin', 'mineral', 'herb', 'medication', 'probiotic', 'omega3', 'protein_powder', 'other'
  form VARCHAR(50), -- 'tablet', 'capsule', 'liquid', 'powder', 'gummy', 'injection'
  
  -- Dosage information
  serving_size DECIMAL(8,2), -- Amount per serving (e.g., 500 for 500mg)
  serving_unit VARCHAR(20), -- 'mg', 'mcg', 'g', 'iu', 'tablets', 'capsules', 'ml'
  
  -- Active ingredients (JSON for flexibility)
  active_ingredients JSONB, -- e.g., [{"name": "Vitamin D3", "amount": 1000, "unit": "IU"}, {"name": "Vitamin K2", "amount": 100, "unit": "mcg"}]
  
  -- Nutrition information (optional, for protein powders, etc.)
  calories_per_serving DECIMAL(8,2) DEFAULT 0,
  protein_per_serving DECIMAL(8,2) DEFAULT 0,
  carbs_per_serving DECIMAL(8,2) DEFAULT 0,
  fat_per_serving DECIMAL(8,2) DEFAULT 0,
  
  -- Health condition associations
  health_conditions TEXT[], -- Array of condition IDs this supplement supports
  
  -- Safety and interaction information
  max_daily_dose DECIMAL(8,2), -- Maximum safe daily dose
  max_daily_unit VARCHAR(20),
  drug_interactions TEXT[], -- Array of known drug interactions
  warnings TEXT[], -- Array of warnings or contraindications
  
  -- Metadata
  description TEXT,
  is_prescription BOOLEAN DEFAULT FALSE,
  is_user_added BOOLEAN DEFAULT FALSE, -- TRUE for user-added supplements
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create supplement entries table (user consumption tracking)
CREATE TABLE IF NOT EXISTS supplement_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
  
  -- Dosage taken
  amount_taken DECIMAL(8,2) NOT NULL,
  unit_taken VARCHAR(20) NOT NULL,
  
  -- Timing information
  time_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  time_of_day VARCHAR(50), -- 'morning', 'afternoon', 'evening', 'night', 'with_meal', 'empty_stomach'
  
  -- Context
  taken_with_food BOOLEAN DEFAULT FALSE,
  meal_context VARCHAR(100), -- 'breakfast', 'lunch', 'dinner', 'snack', 'none'
  
  -- User notes
  notes TEXT,
  side_effects TEXT,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user supplement schedules (for recurring supplements)
CREATE TABLE IF NOT EXISTS user_supplement_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id UUID REFERENCES supplements(id) ON DELETE CASCADE,
  
  -- Schedule configuration
  is_active BOOLEAN DEFAULT TRUE,
  frequency VARCHAR(50) NOT NULL, -- 'daily', 'weekly', 'monthly', 'as_needed', 'custom'
  times_per_day INTEGER DEFAULT 1,
  days_of_week INTEGER[], -- [1,2,3,4,5] for weekdays, [1,2,3,4,5,6,7] for daily
  
  -- Dosage
  dose_amount DECIMAL(8,2) NOT NULL,
  dose_unit VARCHAR(20) NOT NULL,
  
  -- Timing preferences
  preferred_times VARCHAR(100)[], -- ['morning', 'evening'] or ['8:00', '20:00']
  take_with_food BOOLEAN DEFAULT FALSE,
  
  -- Duration and goals
  start_date DATE,
  end_date DATE, -- Optional, for limited courses
  health_goal TEXT, -- Why user is taking this supplement
  
  -- Reminders
  reminder_enabled BOOLEAN DEFAULT FALSE,
  reminder_times TIME[],
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, supplement_id, is_active) DEFERRABLE INITIALLY DEFERRED
);

-- Add RLS policies for supplements (public read for supplement database)
ALTER TABLE supplements ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplement_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_supplement_schedules ENABLE ROW LEVEL SECURITY;

-- Supplements table: Read access for all authenticated users (for supplement database)
-- Write access only for user-added supplements
CREATE POLICY "Supplements are viewable by authenticated users" ON supplements
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can add custom supplements" ON supplements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND is_user_added = TRUE);

CREATE POLICY "Users can update their custom supplements" ON supplements
  FOR UPDATE USING (is_user_added = TRUE AND auth.uid() IS NOT NULL);

-- Supplement entries: Users can only access their own entries
CREATE POLICY "Users can view their own supplement entries" ON supplement_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplement entries" ON supplement_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement entries" ON supplement_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement entries" ON supplement_entries
  FOR DELETE USING (auth.uid() = user_id);

-- User supplement schedules: Users can only access their own schedules
CREATE POLICY "Users can view their own supplement schedules" ON user_supplement_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplement schedules" ON user_supplement_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement schedules" ON user_supplement_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement schedules" ON user_supplement_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS supplements_type_idx ON supplements(type);
CREATE INDEX IF NOT EXISTS supplements_health_conditions_idx ON supplements USING GIN(health_conditions);
CREATE INDEX IF NOT EXISTS supplement_entries_user_time_idx ON supplement_entries(user_id, time_taken DESC);
CREATE INDEX IF NOT EXISTS supplement_entries_supplement_idx ON supplement_entries(supplement_id);
CREATE INDEX IF NOT EXISTS user_supplement_schedules_user_idx ON user_supplement_schedules(user_id, is_active);

-- Insert common supplements database
INSERT INTO supplements (name, brand, type, form, serving_size, serving_unit, active_ingredients, health_conditions, description, max_daily_dose, max_daily_unit, warnings) VALUES
-- Vitamins
('Vitamin D3', 'Generic', 'vitamin', 'capsule', 1000, 'IU', '[{"name": "Cholecalciferol", "amount": 1000, "unit": "IU"}]', '{"pcos","diabetes","bone_health","immune_support"}', 'Essential vitamin for bone health, immune function, and hormone regulation', 4000, 'IU', '{"May interact with blood thinners","Consult doctor if taking digoxin"}'),

('Vitamin B12', 'Generic', 'vitamin', 'tablet', 1000, 'mcg', '[{"name": "Cyanocobalamin", "amount": 1000, "unit": "mcg"}]', '{"anemia","fatigue","vegetarian_support"}', 'Essential for energy metabolism and nervous system function', 2000, 'mcg', '{"Generally safe at recommended doses"}'),

('Folic Acid', 'Generic', 'vitamin', 'tablet', 400, 'mcg', '[{"name": "Folic Acid", "amount": 400, "unit": "mcg"}]', '{"pregnancy","female_fertility","anemia"}', 'Crucial for DNA synthesis and fetal development', 1000, 'mcg', '{"Consult doctor during pregnancy","May mask B12 deficiency"}'),

('Vitamin C', 'Generic', 'vitamin', 'tablet', 500, 'mg', '[{"name": "Ascorbic Acid", "amount": 500, "unit": "mg"}]', '{"immune_support","antioxidant","iron_absorption"}', 'Powerful antioxidant supporting immune function and collagen synthesis', 2000, 'mg', '{"May cause digestive upset at high doses","Reduce dose if experiencing diarrhea"}'),

('Multivitamin', 'Generic', 'vitamin', 'tablet', 1, 'tablet', '[{"name": "Mixed Vitamins", "amount": 1, "unit": "tablet"}]', '{"general_health","nutrition_gaps"}', 'Comprehensive vitamin and mineral supplement for general health', 1, 'tablet', '{"Do not exceed recommended dose","May contain iron - separate from calcium"}'),

-- Minerals
('Magnesium Glycinate', 'Generic', 'mineral', 'capsule', 200, 'mg', '[{"name": "Magnesium", "amount": 200, "unit": "mg"}]', '{"pcos","sleep","muscle_cramps","anxiety"}', 'Well-absorbed magnesium for muscle relaxation and hormone support', 400, 'mg', '{"May cause loose stools at high doses","Start with lower dose"}'),

('Iron Bisglycinate', 'Generic', 'mineral', 'tablet', 18, 'mg', '[{"name": "Iron", "amount": 18, "unit": "mg"}]', '{"anemia","female_fertility","fatigue"}', 'Gentle iron supplement for treating iron deficiency', 45, 'mg', '{"Take on empty stomach for best absorption","May cause constipation","Separate from calcium and zinc"}'),

('Zinc Picolinate', 'Generic', 'mineral', 'capsule', 15, 'mg', '[{"name": "Zinc", "amount": 15, "unit": "mg"}]', '{"male_fertility","immune_support","wound_healing","acne"}', 'Essential mineral for immune function and reproductive health', 40, 'mg', '{"Take on empty stomach","May cause nausea if taken without food","Separate from iron and calcium"}'),

('Calcium Citrate', 'Generic', 'mineral', 'tablet', 500, 'mg', '[{"name": "Calcium", "amount": 500, "unit": "mg"}]', '{"bone_health","osteoporosis_prevention"}', 'Well-absorbed calcium for bone health', 2500, 'mg', '{"Take with meals for best absorption","May interfere with iron absorption","Consult doctor if history of kidney stones"}'),

-- Omega-3 and Heart Health
('Fish Oil', 'Generic', 'omega3', 'capsule', 1000, 'mg', '[{"name": "EPA", "amount": 300, "unit": "mg"}, {"name": "DHA", "amount": 200, "unit": "mg"}]', '{"heart_health","inflammation","brain_health","pregnancy"}', 'Essential fatty acids for heart, brain, and inflammatory health', 3000, 'mg', '{"May increase bleeding risk","Consult doctor if taking blood thinners","Take with meals to reduce fishy aftertaste"}'),

('Omega-3 Vegan', 'Generic', 'omega3', 'capsule', 500, 'mg', '[{"name": "DHA", "amount": 250, "unit": "mg"}, {"name": "EPA", "amount": 125, "unit": "mg"}]', '{"heart_health","inflammation","vegan_nutrition"}', 'Plant-based omega-3 from algae for vegans and vegetarians', 2000, 'mg', '{"Generally well tolerated","Take with meals"}'),

-- Probiotics
('Probiotic Multi-Strain', 'Generic', 'probiotic', 'capsule', 50, 'billion CFU', '[{"name": "Mixed Probiotic Strains", "amount": 50, "unit": "billion CFU"}]', '{"digestive_health","immune_support","gut_health"}', 'Multi-strain probiotic for digestive and immune health', 100, 'billion CFU', '{"Refrigerate for maximum potency","Start with lower dose to avoid digestive upset","Separate from antibiotics by 2 hours"}'),

-- PCOS Specific
('Inositol', 'Generic', 'other', 'powder', 2000, 'mg', '[{"name": "Myo-Inositol", "amount": 2000, "unit": "mg"}]', '{"pcos","insulin_resistance","fertility"}', 'Insulin sensitizer particularly beneficial for PCOS management', 4000, 'mg', '{"Generally well tolerated","May cause mild digestive upset initially","Take with meals"}'),

('Spearmint Tea Extract', 'Generic', 'herb', 'capsule', 500, 'mg', '[{"name": "Spearmint Extract", "amount": 500, "unit": "mg"}]', '{"pcos","hirsutism","hormone_balance"}', 'May help reduce androgens and unwanted hair growth in PCOS', 1000, 'mg', '{"Limited long-term safety data","Consult healthcare provider","May interact with diabetes medications"}'),

-- Diabetes Specific
('Chromium Picolinate', 'Generic', 'mineral', 'tablet', 200, 'mcg', '[{"name": "Chromium", "amount": 200, "unit": "mcg"}]', '{"diabetes","blood_sugar","insulin_sensitivity"}', 'May help improve insulin sensitivity and glucose metabolism', 1000, 'mcg', '{"Monitor blood sugar closely","May enhance insulin effects","Consult doctor if diabetic"}'),

('Alpha Lipoic Acid', 'Generic', 'other', 'capsule', 300, 'mg', '[{"name": "Alpha Lipoic Acid", "amount": 300, "unit": "mg"}]', '{"diabetes","neuropathy","antioxidant"}', 'Antioxidant that may help with blood sugar control and nerve health', 600, 'mg', '{"May lower blood sugar","Monitor glucose levels","Take on empty stomach"}');

-- Add function to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
CREATE TRIGGER update_supplements_updated_at BEFORE UPDATE ON supplements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplement_entries_updated_at BEFORE UPDATE ON supplement_entries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_supplement_schedules_updated_at BEFORE UPDATE ON user_supplement_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();