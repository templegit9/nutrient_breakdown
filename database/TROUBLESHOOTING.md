# Database Troubleshooting Guide

## PostgreSQL Function Immutability Error

### Error Message
```
ERROR: 42P17: functions in index expression must be marked IMMUTABLE
```

### Cause
This error occurs when trying to create indexes that use functions (like `LOWER()`, `to_tsvector()`, etc.) that PostgreSQL doesn't recognize as immutable.

### Solutions

#### 1. Use Clean Schema Files
- **Schema:** Use `schema-clean.sql` (absolutely NO function-based indexes)
- **Seed Data:** Use `seed-foods-clean.sql` (no additional indexes)

**Note:** `schema-clean.sql` removes ALL function calls from indexes including DATE(), LOWER(), etc.

#### 2. Step-by-Step Fix
1. **Drop problematic indexes** (if they exist):
   ```sql
   DROP INDEX IF EXISTS idx_foods_search;
   DROP INDEX IF EXISTS idx_foods_name_lower;
   DROP INDEX IF EXISTS idx_foods_brand_lower;
   DROP INDEX IF EXISTS idx_foods_category_lower;
   ```

2. **Use simple column indexes instead**:
   ```sql
   CREATE INDEX idx_foods_name ON foods(name);
   CREATE INDEX idx_foods_brand ON foods(brand);
   CREATE INDEX idx_foods_category ON foods(category);
   ```

#### 3. Alternative: Mark Functions as Immutable
If you need functional indexes, you can create immutable wrapper functions:
```sql
CREATE OR REPLACE FUNCTION immutable_lower(text) 
RETURNS text AS $$
BEGIN
  RETURN lower($1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Then use in index:
CREATE INDEX idx_foods_name_lower ON foods(immutable_lower(name));
```

### Recommended Approach
**Use the provided clean files:**
1. Run `schema-fixed.sql` first
2. Then run `seed-foods-clean.sql`
3. Search functionality will work with case-insensitive ILIKE queries

### Verification
After running the clean scripts, verify everything works:
```sql
-- Test table creation
SELECT COUNT(*) FROM foods;

-- Test search functionality
SELECT * FROM foods WHERE name ILIKE '%apple%';
```

### Performance Notes
- Simple column indexes are sufficient for most use cases
- ILIKE queries with `%pattern%` may be slower but will work correctly
- For production with large datasets, consider implementing proper full-text search later

## Other Common Issues

### RLS Policy Issues
If users can't see their data:
```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('food_entries', 'user_profiles');

-- Check policies
SELECT * FROM pg_policies WHERE tablename = 'food_entries';
```

### Authentication Issues
Ensure your environment variables are set correctly:
```bash
# Check if variables are loaded
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY
```

### Migration Issues
To reset and start fresh:
```sql
-- Drop all tables (be careful!)
DROP TABLE IF EXISTS blood_glucose_readings CASCADE;
DROP TABLE IF EXISTS food_entries CASCADE;
DROP TABLE IF EXISTS nutrition_goals CASCADE;
DROP TABLE IF EXISTS custom_foods CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;
DROP TABLE IF EXISTS foods CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```