-- Fix missing time_of_day column in food_entries table
-- This adds the column if it doesn't exist

-- Add time_of_day column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'food_entries' 
        AND column_name = 'time_of_day'
    ) THEN
        ALTER TABLE food_entries ADD COLUMN time_of_day VARCHAR(50);
        
        -- Add index for performance
        CREATE INDEX IF NOT EXISTS idx_food_entries_time_of_day ON food_entries(time_of_day);
        
        RAISE NOTICE 'Added time_of_day column to food_entries table';
    ELSE
        RAISE NOTICE 'time_of_day column already exists in food_entries table';
    END IF;
END $$;