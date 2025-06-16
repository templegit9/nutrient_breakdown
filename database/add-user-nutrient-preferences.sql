-- Add nutrient preferences column to user_profiles table
-- This stores the user's preferred nutrients to display in the history tab

ALTER TABLE user_profiles 
ADD COLUMN preferred_nutrients TEXT[] DEFAULT ARRAY['calories', 'protein', 'carbs', 'fat', 'fiber'];

-- Add comment explaining the column
COMMENT ON COLUMN user_profiles.preferred_nutrients IS 'Array of nutrient field names that user prefers to see in history tab';