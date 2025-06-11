-- Minimal migration to add custom_foods table only
-- This script adds the missing custom_foods table without affecting existing data

-- Check if custom_foods table already exists, and create it if it doesn't
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables 
                   WHERE table_schema = 'public' 
                   AND table_name = 'custom_foods') THEN
        
        -- Create custom_foods table
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

        -- Create index for performance
        CREATE INDEX idx_custom_foods_user_id ON custom_foods(user_id);

        -- Enable Row Level Security
        ALTER TABLE custom_foods ENABLE ROW LEVEL SECURITY;

        -- Create RLS policies
        CREATE POLICY "Users can view own custom foods" ON custom_foods
          FOR SELECT USING (auth.uid() = user_id);
        CREATE POLICY "Users can insert own custom foods" ON custom_foods
          FOR INSERT WITH CHECK (auth.uid() = user_id);
        CREATE POLICY "Users can update own custom foods" ON custom_foods
          FOR UPDATE USING (auth.uid() = user_id);
        CREATE POLICY "Users can delete own custom foods" ON custom_foods
          FOR DELETE USING (auth.uid() = user_id);

        -- Create trigger for automatic updated_at timestamps
        CREATE TRIGGER update_custom_foods_updated_at 
          BEFORE UPDATE ON custom_foods 
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

        RAISE NOTICE 'custom_foods table created successfully!';
    ELSE
        RAISE NOTICE 'custom_foods table already exists, skipping creation.';
    END IF;
END $$;

-- Verify the table was created
SELECT 'Custom foods table migration completed!' as status;