-- Diagnostic script for supplement schedules table issue
-- Run this in Supabase SQL Editor to check the current state

-- Check if user_supplement_schedules table exists
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'user_supplement_schedules';

-- Check foreign key constraints
SELECT 
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'user_supplement_schedules';

-- Check if supplements table exists and has data
SELECT 
  'supplements' as table_name,
  COUNT(*) as row_count
FROM supplements
UNION ALL
SELECT 
  'supplement_entries' as table_name,
  COUNT(*) as row_count
FROM supplement_entries;

-- Test the problematic query to see exact error
-- SELECT 
--   *,
--   supplement:supplements(*)
-- FROM user_supplement_schedules
-- WHERE user_id = 'test'
-- LIMIT 1;