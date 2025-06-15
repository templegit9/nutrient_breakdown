-- Add micronutrient columns to grouped_food_entries table
ALTER TABLE grouped_food_entries 
ADD COLUMN IF NOT EXISTS total_fiber DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sugar DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_sodium DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_calcium DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_iron DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_vitamin_c DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_vitamin_d DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_potassium DECIMAL(10,2) DEFAULT 0;

-- Test the new structure
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
            total_fiber,
            total_sugar,
            total_sodium,
            total_calcium,
            total_iron,
            total_vitamin_c,
            total_vitamin_d,
            total_potassium,
            time_of_day
        ) VALUES (
            test_user_id,
            'Test Micronutrients - Delete Me',
            '[{"name": "test", "calories": 100, "fiber": 5, "calcium": 50}]'::jsonb,
            100,
            10,
            15,
            5,
            5,
            8,
            200,
            50,
            2,
            15,
            0.5,
            300,
            'morning'
        );
        
        -- Clean up
        DELETE FROM grouped_food_entries WHERE description = 'Test Micronutrients - Delete Me';
        
        RAISE NOTICE 'SUCCESS: Micronutrients columns added successfully!';
    ELSE
        RAISE NOTICE 'No users found for testing';
    END IF;
END $$;