-- Fix supplement database relationships and create proper schema

-- First, check if supplement_entries table exists and fix it
DO $$ 
BEGIN
    -- Drop supplement_entries table if it exists (to recreate with proper relationships)
    DROP TABLE IF EXISTS supplement_entries CASCADE;
    
    -- Create supplement_entries table with proper foreign key to supplements
    CREATE TABLE supplement_entries (
        id SERIAL PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        supplement_id INTEGER NOT NULL REFERENCES supplements(id) ON DELETE CASCADE,
        amount_taken DECIMAL(10,2) NOT NULL,
        unit_taken VARCHAR(50) NOT NULL,
        time_taken TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        time_of_day VARCHAR(50),
        taken_with_food BOOLEAN DEFAULT FALSE,
        meal_context VARCHAR(100),
        effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
        side_effects TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS on supplement_entries
    ALTER TABLE supplement_entries ENABLE ROW LEVEL SECURITY;

    -- Create RLS policies for supplement_entries
    CREATE POLICY "Users can view their own supplement entries" 
        ON supplement_entries FOR SELECT 
        USING (auth.uid() = user_id);

    CREATE POLICY "Users can insert their own supplement entries" 
        ON supplement_entries FOR INSERT 
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can update their own supplement entries" 
        ON supplement_entries FOR UPDATE 
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Users can delete their own supplement entries" 
        ON supplement_entries FOR DELETE 
        USING (auth.uid() = user_id);

    -- Create indexes for better performance
    CREATE INDEX idx_supplement_entries_user_id ON supplement_entries(user_id);
    CREATE INDEX idx_supplement_entries_supplement_id ON supplement_entries(supplement_id);
    CREATE INDEX idx_supplement_entries_time_taken ON supplement_entries(time_taken);
    CREATE INDEX idx_supplement_entries_user_time ON supplement_entries(user_id, time_taken);

    -- Create function to update updated_at timestamp
    CREATE OR REPLACE FUNCTION update_supplement_entries_updated_at()
    RETURNS TRIGGER AS $update_trigger$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $update_trigger$ language 'plpgsql';

    -- Create trigger for updated_at
    CREATE TRIGGER update_supplement_entries_updated_at 
        BEFORE UPDATE ON supplement_entries
        FOR EACH ROW EXECUTE FUNCTION update_supplement_entries_updated_at();

    -- Grant permissions
    GRANT ALL ON supplement_entries TO authenticated;
    GRANT USAGE, SELECT ON SEQUENCE supplement_entries_id_seq TO authenticated;

    RAISE NOTICE 'supplement_entries table created successfully with proper relationships';

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error creating supplement_entries: %', SQLERRM;
END $$;

-- Also ensure the supplements table has the correct structure
DO $$
BEGIN
    -- Check if supplements table needs the health_conditions column
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'supplements' 
        AND column_name = 'health_conditions'
    ) THEN
        ALTER TABLE supplements ADD COLUMN health_conditions TEXT[];
        RAISE NOTICE 'Added health_conditions column to supplements table';
    END IF;

    -- Update some supplements with health condition associations
    UPDATE supplements SET health_conditions = ARRAY['pcos', 'fertility'] 
    WHERE name ILIKE '%inositol%';
    
    UPDATE supplements SET health_conditions = ARRAY['pcos', 'hormonal'] 
    WHERE name ILIKE '%spearmint%';
    
    UPDATE supplements SET health_conditions = ARRAY['type2_diabetes', 'metabolic'] 
    WHERE name ILIKE '%chromium%';
    
    UPDATE supplements SET health_conditions = ARRAY['type2_diabetes', 'metabolic'] 
    WHERE name ILIKE '%alpha lipoic%';
    
    UPDATE supplements SET health_conditions = ARRAY['hypertension', 'cardiovascular'] 
    WHERE name ILIKE '%magnesium%' OR name ILIKE '%potassium%';
    
    UPDATE supplements SET health_conditions = ARRAY['cardiovascular', 'general'] 
    WHERE name ILIKE '%omega%';
    
    UPDATE supplements SET health_conditions = ARRAY['bone_health', 'osteoporosis'] 
    WHERE name ILIKE '%calcium%' OR name ILIKE '%vitamin d%';
    
    UPDATE supplements SET health_conditions = ARRAY['thyroid', 'hypothyroidism'] 
    WHERE name ILIKE '%iodine%' OR name ILIKE '%selenium%';
    
    UPDATE supplements SET health_conditions = ARRAY['mental_health', 'depression', 'anxiety'] 
    WHERE name ILIKE '%ashwagandha%' OR name ILIKE '%b complex%';
    
    UPDATE supplements SET health_conditions = ARRAY['sleep', 'insomnia'] 
    WHERE name ILIKE '%melatonin%' OR name ILIKE '%gaba%';

    RAISE NOTICE 'Updated supplements with health condition associations';

EXCEPTION
    WHEN others THEN
        RAISE NOTICE 'Error updating supplements: %', SQLERRM;
END $$;

-- Refresh the schema cache to ensure PostgREST picks up the changes
NOTIFY pgrst, 'reload schema';