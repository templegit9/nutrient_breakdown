-- Comprehensive fix for supplement-related foreign key type mismatches
-- This script ensures all supplement-related tables have consistent INTEGER types

-- First, let's check what exists and clean up any inconsistencies
DO $$
BEGIN
  -- Drop any existing user_supplement_schedules table that might have wrong types
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_supplement_schedules') THEN
    DROP TABLE user_supplement_schedules CASCADE;
    RAISE NOTICE 'Dropped existing user_supplement_schedules table';
  END IF;
  
  -- Drop any existing supplement_entries table to ensure clean recreation
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplement_entries') THEN
    DROP TABLE supplement_entries CASCADE;
    RAISE NOTICE 'Dropped existing supplement_entries table for clean recreation';
  END IF;
END $$;

-- Ensure supplements table exists with correct integer ID
-- (This should already exist from reset-and-populate-supplements.sql)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'supplements') THEN
    RAISE EXCEPTION 'Supplements table does not exist. Please run reset-and-populate-supplements.sql first.';
  END IF;
  
  -- Verify supplements.id is integer type
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'supplements' 
    AND column_name = 'id' 
    AND data_type = 'integer'
  ) THEN
    RAISE EXCEPTION 'Supplements table id column is not integer type. Please run reset-and-populate-supplements.sql to fix.';
  END IF;
END $$;

-- Create supplement_entries table with correct integer foreign key
CREATE TABLE supplement_entries (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id INTEGER REFERENCES supplements(id) ON DELETE CASCADE,
  
  -- Entry details
  dose_amount DECIMAL(8,2) NOT NULL,
  dose_unit VARCHAR(20) NOT NULL,
  taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Optional fields
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for supplement_entries
ALTER TABLE supplement_entries ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for supplement_entries
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can view their own supplement entries" ON supplement_entries;
  DROP POLICY IF EXISTS "Users can insert their own supplement entries" ON supplement_entries;
  DROP POLICY IF EXISTS "Users can update their own supplement entries" ON supplement_entries;
  DROP POLICY IF EXISTS "Users can delete their own supplement entries" ON supplement_entries;
END $$;

CREATE POLICY "Users can view their own supplement entries" ON supplement_entries
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplement entries" ON supplement_entries
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement entries" ON supplement_entries
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement entries" ON supplement_entries
  FOR DELETE USING (auth.uid() = user_id);

-- Create user_supplement_schedules table with correct integer foreign key
CREATE TABLE user_supplement_schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  supplement_id INTEGER REFERENCES supplements(id) ON DELETE CASCADE,
  
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

-- Enable RLS for user_supplement_schedules
ALTER TABLE user_supplement_schedules ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for user_supplement_schedules
CREATE POLICY "Users can view their own supplement schedules" ON user_supplement_schedules
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own supplement schedules" ON user_supplement_schedules
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own supplement schedules" ON user_supplement_schedules
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own supplement schedules" ON user_supplement_schedules
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS supplement_entries_user_idx ON supplement_entries(user_id, taken_at DESC);
CREATE INDEX IF NOT EXISTS supplement_entries_supplement_idx ON supplement_entries(supplement_id);

CREATE INDEX IF NOT EXISTS user_supplement_schedules_user_idx ON user_supplement_schedules(user_id, is_active);
CREATE INDEX IF NOT EXISTS user_supplement_schedules_supplement_idx ON user_supplement_schedules(supplement_id);

-- Create function for automatic timestamp updates if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_supplement_entries_updated_at ON supplement_entries;
CREATE TRIGGER update_supplement_entries_updated_at 
  BEFORE UPDATE ON supplement_entries 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_supplement_schedules_updated_at ON user_supplement_schedules;
CREATE TRIGGER update_user_supplement_schedules_updated_at 
  BEFORE UPDATE ON user_supplement_schedules 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Verify the relationships are correctly established
DO $$
BEGIN
  -- Check supplement_entries foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'supplement_entries_supplement_id_fkey'
    AND table_name = 'supplement_entries'
  ) THEN
    RAISE NOTICE 'WARNING: supplement_entries foreign key relationship missing';
  ELSE
    RAISE NOTICE 'SUCCESS: supplement_entries foreign key relationship exists';
  END IF;
  
  -- Check user_supplement_schedules foreign key
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'user_supplement_schedules_supplement_id_fkey'
    AND table_name = 'user_supplement_schedules'
  ) THEN
    RAISE NOTICE 'WARNING: user_supplement_schedules foreign key relationship missing';
  ELSE
    RAISE NOTICE 'SUCCESS: user_supplement_schedules foreign key relationship exists';
  END IF;
  
  -- Show the actual types for verification
  RAISE NOTICE 'supplements.id type: %', (
    SELECT data_type FROM information_schema.columns 
    WHERE table_name = 'supplements' AND column_name = 'id'
  );
  RAISE NOTICE 'supplement_entries.supplement_id type: %', (
    SELECT data_type FROM information_schema.columns 
    WHERE table_name = 'supplement_entries' AND column_name = 'supplement_id'
  );
  RAISE NOTICE 'user_supplement_schedules.supplement_id type: %', (
    SELECT data_type FROM information_schema.columns 
    WHERE table_name = 'user_supplement_schedules' AND column_name = 'supplement_id'
  );
END $$;