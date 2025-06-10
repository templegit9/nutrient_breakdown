# Deployment Guide

## Netlify Deployment

### Prerequisites
- GitHub repository with the project
- Netlify account (free tier available)

### Automatic Deployment Steps

1. **Connect Repository to Netlify:**
   - Login to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Choose GitHub and authorize access
   - Select `templegit9/nutrient_breakdown` repository

2. **Configure Build Settings:**
   - **Base directory:** _(leave empty)_
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Production branch:** `main`

3. **Environment Variables:**
   - In Netlify dashboard, go to Site settings > Environment variables
   - Add the following variables:
     ```
     VITE_APP_NAME=Nutrient Breakdown Tracker
     VITE_APP_VERSION=1.0.0
     VITE_APP_ENVIRONMENT=production
     VITE_ENABLE_GLUCOSE_TRACKING=true
     ```

4. **Deploy:**
   - Click "Deploy site"
   - Netlify will automatically build and deploy from the `main` branch
   - Future pushes to `main` will trigger automatic deployments

### Custom Domain Setup (Optional)

1. **Purchase Domain:**
   - Buy a domain from your preferred registrar
   - Example: `nutrienttracker.com`

2. **Configure in Netlify:**
   - Go to Site settings > Domain management
   - Click "Add custom domain"
   - Enter your domain name
   - Follow DNS configuration instructions

3. **SSL Certificate:**
   - Netlify automatically provides free SSL certificates
   - Enable "Force HTTPS redirect"

### Build Optimization

The project includes:
- ✅ Chunk splitting for better caching
- ✅ Asset optimization
- ✅ Security headers
- ✅ SPA redirect rules
- ✅ Progressive loading

### Production Checklist

Before deploying:
- [ ] Test build locally: `npm run build && npm run preview`
- [ ] Verify all features work offline-first
- [ ] Check responsive design on mobile devices
- [ ] Test glucose tracking functionality
- [ ] Validate export features work correctly

### Monitoring

After deployment:
- Monitor build logs in Netlify dashboard
- Check site performance with Lighthouse
- Set up analytics (optional)
- Monitor error reporting

## Supabase Database Integration

### Enhanced Nutrition Database
This application now includes a comprehensive nutrition database with:
- **105+ Verified Foods** with complete nutrition profiles
- **Nigerian Foods Focus** with traditional names (Ugu, Plantain, Garri, etc.)
- **Cooking State Intelligence** (raw, boiled, fried, etc.)
- **12+ Nutrients** including vitamins, minerals, and micronutrients
- **PCOS/Diabetes Support** with glycemic index data

### Quick Setup
1. **Follow database setup:** See `database/DEPLOYMENT.md` for detailed instructions
2. **Use complete database:** Deploy `complete_verified_foods_database.sql` for full nutrition data
3. **Environment variables:** Add Supabase credentials to your production environment
4. **Test features:** Verify food search, cooking states, and comprehensive nutrition tracking work

### Key Features to Test
- Search for Nigerian foods like "Ugu" or "Garri"
- Notice how nutrition changes with different cooking methods
- Verify vitamins and minerals are displayed
- Check glycemic index data for diabetes management

## Troubleshooting

**Build Fails:**
- Check Node.js version (should be 18+)
- Verify all dependencies are installed
- Review build logs for specific errors

**404 Errors on Refresh:**
- Ensure `_redirects` rule is properly configured
- Check Netlify routing settings

**Large Bundle Size:**
- Use `npm run build:analyze` to identify large chunks
- Consider dynamic imports for heavy components