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

#### Option A: Fresh/New Supabase Project
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

### 3. Seed Database with Foods

Choose one of the food seeding options:

#### Option A: Complete Food Database (Recommended)
**Includes both international and Nigerian foods**
1. In SQL Editor, copy and paste contents of `seed-all-foods.sql`
2. Click "Run" to populate the foods table
3. This adds ~130+ foods including Nigerian staples like Ugu, Plantain, Yam, etc.

#### Option B: Basic International Foods Only
**If you prefer a smaller dataset**
1. In SQL Editor, copy and paste contents of `seed-foods-clean.sql`
2. Click "Run" to populate the foods table
3. This adds ~45 common international foods

#### Option C: Nigerian Foods Only
**For Nigerian-focused nutrition tracking**
1. In SQL Editor, copy and paste contents of `nigerian_foods_sql.sql`
2. Click "Run" to populate the foods table
3. This adds ~85 Nigerian foods with local names

4. **Verify data:** Go to Database → Tables → foods to see the imported foods
5. **Test search:** In your app, try searching for foods like "Ugu", "Plantain", or "Apple"

### 4. Configure Row Level Security
The schema includes RLS policies, but verify they're enabled:
1. Go to Authentication > Policies
2. Ensure all tables have appropriate policies enabled
3. Test policies by creating a test user

### 5. Get API Credentials
1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - anon/public key
3. Add these to your `.env.local` file:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

### 6. Configure Authentication
1. Go to Authentication > Settings
2. Configure email settings (or use built-in Supabase email)
3. Set up any OAuth providers if needed
4. Configure redirect URLs for your domain

### 7. Test Connection
1. Start your development server: `npm run dev`
2. Try signing up with a test account
3. Verify you can add/view food entries
4. Check database tables to confirm data is being stored

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

### Migration Commands
If you need to modify the schema later:
1. Create migration files in the Supabase dashboard
2. Test migrations on a staging database first
3. Apply migrations during maintenance windows

### Data Export/Import
```sql
-- Export user data
COPY (SELECT * FROM food_entries WHERE user_id = 'user_id_here') TO STDOUT WITH CSV HEADER;

-- Import data
COPY food_entries FROM '/path/to/data.csv' WITH CSV HEADER;
```