-- Fix column name mismatch in grouped_food_entries table
-- The original migration used 'total_carbohydrates' but code expects 'total_carbs'

-- First, check if we need to rename the column
DO $$
BEGIN
    -- Check if total_carbohydrates column exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'grouped_food_entries' 
        AND column_name = 'total_carbohydrates'
    ) THEN
        -- Rename total_carbohydrates to total_carbs
        ALTER TABLE grouped_food_entries 
        RENAME COLUMN total_carbohydrates TO total_carbs;
        
        RAISE NOTICE 'SUCCESS: Renamed total_carbohydrates to total_carbs';
    ELSE
        RAISE NOTICE 'Column total_carbohydrates does not exist, no rename needed';
    END IF;
    
    -- Ensure all required columns exist (some may have been added by previous migrations)
    ALTER TABLE grouped_food_entries 
    ADD COLUMN IF NOT EXISTS total_fiber DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_sugar DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_sodium DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_calcium DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_iron DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_vitamin_c DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_vitamin_d DECIMAL(10,2) DEFAULT 0,
    ADD COLUMN IF NOT EXISTS total_potassium DECIMAL(10,2) DEFAULT 0;
    
    -- Also ensure we have the description column (used instead of combined_name)
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'grouped_food_entries' 
        AND column_name = 'description'
    ) THEN
        -- If combined_name exists but description doesn't, rename it
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'grouped_food_entries' 
            AND column_name = 'combined_name'
        ) THEN
            ALTER TABLE grouped_food_entries 
            RENAME COLUMN combined_name TO description;
            RAISE NOTICE 'SUCCESS: Renamed combined_name to description';
        ELSE
            -- Add description column if neither exists
            ALTER TABLE grouped_food_entries 
            ADD COLUMN description TEXT NOT NULL DEFAULT '';
            RAISE NOTICE 'SUCCESS: Added description column';
        END IF;
    END IF;
    
    RAISE NOTICE 'SUCCESS: All column fixes applied';
END $$;