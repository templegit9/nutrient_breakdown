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
1. Wait for project to be fully provisioned
2. Go to SQL Editor in Supabase dashboard
3. Copy and paste the contents of `schema-fixed-auth.sql` (references auth.users directly, no foreign key issues)
4. Click "Run" to execute the schema
5. Verify tables were created successfully

**Important:** Use `schema-fixed-auth.sql` which references Supabase's built-in `auth.users` table directly instead of creating a separate users table. This fixes foreign key constraint errors.

### 3. Seed Database with Foods
1. In SQL Editor, copy and paste contents of `seed-foods-clean.sql` (this version has no indexes to avoid immutability errors)
2. Click "Run" to populate the foods table
3. Verify data was inserted by checking the Table Editor

**Note:** Use `seed-foods-clean.sql` instead of `seed-foods.sql` to avoid any PostgreSQL function immutability issues.

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