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

## Next Phase: Supabase Integration

Once Netlify deployment is successful, proceed with:
1. Supabase project setup
2. Database schema creation
3. Authentication integration
4. Data migration from localStorage to Supabase

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