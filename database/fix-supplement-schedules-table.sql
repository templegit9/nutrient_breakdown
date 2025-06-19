-- Fix user_supplement_schedules table and foreign key relationship
-- This script ensures the table exists and has proper relationships

-- Drop and recreate user_supplement_schedules table with proper foreign keys
DROP TABLE IF EXISTS user_supplement_schedules CASCADE;

CREATE TABLE user_supplement_schedules (
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

-- Enable RLS
ALTER TABLE user_supplement_schedules ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view their own supplement schedules" ON user_supplement_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplement schedules" ON user_supplement_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement schedules" ON user_supplement_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement schedules" ON user_supplement_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS user_supplement_schedules_user_idx ON user_supplement_schedules(user_id, is_active);
CREATE INDEX IF NOT EXISTS user_supplement_schedules_supplement_idx ON user_supplement_schedules(supplement_id);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_user_supplement_schedules_updated_at 
  BEFORE UPDATE ON user_supplement_schedules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the foreign key relationship exists
DO $$
BEGIN
  -- Check if foreign key exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_supplement_schedules_supplement_id_fkey'
    AND table_name = 'user_supplement_schedules'
  ) THEN
    RAISE NOTICE 'Foreign key relationship missing - this should not happen with the above CREATE TABLE';
  ELSE
    RAISE NOTICE 'Foreign key relationship exists correctly';
  END IF;
END $$;