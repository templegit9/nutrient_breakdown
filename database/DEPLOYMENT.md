# Database Deployment Instructions

## Setting up Supabase Database

### 1. Create Supabase Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name: "nutrient-tracker"
5. Enter database password (save this securely)
6. Choose region closest to your users
7. Click "Create new project"

### 2. Configure Database Schema

Choose the appropriate option based on your situation:

#### Option A: Fresh/New Supabase Project (Recommended)
**Use this if:** You just created a new Supabase project or have no existing tables
1. Wait for project to be fully provisioned
2. Go to SQL Editor in Supabase dashboard
3. Copy and paste the contents of `clean-install.sql`
4. Click "Run" to execute the schema
5. Verify tables were created successfully

#### Option B: Have Existing Tables with Issues
**Use this if:** You get "relation already exists" or foreign key constraint errors
1. Go to SQL Editor in Supabase dashboard
2. Copy and paste the contents of `migration-safe.sql` (handles all error cases)
3. Click "Run" to execute the migration
4. Verify tables were recreated successfully

#### Option C: Manual Reset (Alternative)
**Use this if:** You want to start completely fresh
1. Go to Database → Tables in Supabase dashboard
2. Manually delete all existing tables (food_entries, user_profiles, foods, etc.)
3. Then use Option A (`clean-install.sql`)

**Important:** 
- `clean-install.sql` - For fresh installations, cleanest approach
- `migration-safe.sql` - Handles all migration scenarios safely
- Both reference Supabase's `auth.users` table directly (no foreign key issues)
- **Warning:** Migration options will delete existing data

### 3. Seed Database with Comprehensive Food Data

**NEW: Enhanced Food Database with 105+ Verified Foods**

#### Complete Verified Foods Database (Strongly Recommended)
**Includes comprehensive nutrition data with vitamins, minerals, and cooking states**
1. In SQL Editor, copy and paste contents of `complete_verified_foods_database.sql`
2. Click "Run" to populate the foods table
3. This adds 105+ foods with complete nutrition profiles including:
   - **Macronutrients:** Protein, carbs, fat, fiber, sugar
   - **Micronutrients:** Cholesterol, potassium, iron, calcium, vitamin C, vitamin D
   - **Glycemic Data:** Glycemic index and glycemic load for diabetes management
   - **Cooking States:** Raw, cooked, boiled, steamed, fried, baked, grilled, roasted
   - **Nigerian Foods:** Ugu, Plantain, Yam, Garri, Egusi, etc. with local names
   - **International Foods:** Apple, chicken, rice, etc. with verified USDA data

**Food Categories Included:**
- Proteins (17 foods): Chicken, fish, tofu, eggs, beef, etc.
- Nuts (8 foods): Locust beans, almonds, melon seeds, etc.
- Grains (15 foods): Rice, oats, quinoa, garri, etc.
- Dairy (4 foods): Greek yogurt, cheese, milk, etc.
- Fruits (14 foods): African pear, baobab, banana, etc.
- Starches (7 foods): Sweet potato, cassava, yam, etc.
- Legumes (8 foods): Groundnuts, soybeans, black-eyed peas, etc.
- Vegetables (14 foods): Ugu, bitter leaf, spinach, etc.
- Beverages (7 foods): Palm wine, zobo, kunu, etc.
- Spices (5 foods): Ginger, garlic, pepper, etc.

4. **Verify data:** Go to Database → Tables → foods to see the imported foods
5. **Test search:** In your app, try searching for foods like "Ugu", "Plantain", "Chicken (Adiye)", or "Apple"

#### Alternative: Basic Foods Only (If Database Size is a Concern)
**If you prefer the older, smaller dataset**
1. Use one of the archived seed files (not recommended for production)
2. You'll miss out on the comprehensive nutrition data and cooking states

### 4. Configure Row Level Security
The schema includes RLS policies, but verify they're enabled:
1. Go to Authentication > Policies
2. Ensure all tables have appropriate policies enabled
3. Test policies by creating a test user

### 5. Update Database Schema for New Nutrition Fields

**Important:** The new food database includes additional nutrition columns that need to be supported in your `food_entries` table:

```sql
-- Add new nutrition columns to food_entries table (if upgrading existing project)
ALTER TABLE food_entries 
ADD COLUMN IF NOT EXISTS cholesterol_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS potassium_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS iron_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS calcium_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamin_c_mg DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS vitamin_d_iu DECIMAL(8,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS glycemic_index INTEGER,
ADD COLUMN IF NOT EXISTS glycemic_load INTEGER;
```

### 6. Get API Credentials
1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - anon/public key
3. Add these to your `.env.local` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 7. Configure Authentication
1. Go to Authentication > Settings
2. Configure email settings (or use built-in Supabase email)
3. Set up any OAuth providers if needed
4. Configure redirect URLs for your domain

### 8. Test Connection and New Features
1. Start your development server: `npm run dev`
2. Try signing up with a test account
3. **Test food search:** Search for Nigerian foods like "Ugu" or "Garri"
4. **Test cooking states:** Notice how nutrition changes with different cooking methods
5. **Test comprehensive nutrition:** Verify vitamins and minerals are displayed
6. **Test PCOS/diabetes features:** Check glycemic index data is shown
7. Check database tables to confirm data is being stored with new nutrition fields

## Production Deployment

### Environment Variables for Production
Add these environment variables to your production deployment platform:
```
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
```

### Database Backups
1. Go to Settings > Database
2. Configure automated backups
3. Set backup retention period
4. Test restore procedure

### Monitoring
1. Set up database monitoring in Supabase dashboard
2. Configure alerts for high usage or errors
3. Monitor API usage and rate limits

## Troubleshooting

### Common Issues
1. **RLS Policies**: If users can't access their data, check RLS policies
2. **API Keys**: Ensure you're using the correct anon key (not service role key)
3. **CORS**: Supabase handles CORS automatically, but verify your domain is allowed
4. **Environment Variables**: Ensure all VITE_ prefixed variables are available at build time
5. **Missing Nutrition Data**: If new nutrition fields don't appear, verify the food_entries table has the new columns

### Migration Commands
If you need to modify the schema later:
1. Create migration files in the Supabase dashboard
2. Test migrations on a staging database first
3. Apply migrations during maintenance windows

### Data Export/Import
```sql
-- Export user data with new nutrition fields
COPY (SELECT * FROM food_entries WHERE user_id = 'user_id_here') TO STDOUT WITH CSV HEADER;

-- Import data
COPY food_entries FROM '/path/to/data.csv' WITH CSV HEADER;

-- Check food database completeness
SELECT 
    category, 
    COUNT(*) as food_count,
    COUNT(DISTINCT preparation_state) as cooking_states
FROM foods 
GROUP BY category 
ORDER BY food_count DESC;
```

## What's New in This Version

### Enhanced Nutrition Tracking
- **12+ Nutrients:** Now tracks vitamins, minerals, and micronutrients
- **Cooking State Awareness:** Nutrition values adjust based on preparation method
- **Glycemic Data:** Support for diabetes and PCOS management
- **Verified Data:** All nutrition values from USDA FoodData Central and FAO sources

### Improved Food Database
- **105+ Foods:** Comprehensive database with cooking variations
- **Nigerian Focus:** Extensive local foods with traditional names
- **Smart Search:** Find foods by name, brand, category, or preparation method
- **Cooking Intelligence:** Database knows how cooking affects nutrition

### Better Health Support
- **PCOS Management:** Foods categorized by PCOS recommendation levels
- **Diabetes Support:** Glycemic index and load data for blood sugar management
- **Comprehensive Micronutrients:** Track iron, calcium, vitamins for complete health picture