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