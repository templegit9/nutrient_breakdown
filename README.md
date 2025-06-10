# Nutrient Breakdown Tracker

A comprehensive nutrition tracking web application built with React, TypeScript, and Material UI. Designed specifically for health-conscious individuals, especially those managing conditions like PCOS and diabetes.

## Features

🥗 **Comprehensive Food Logging**
- Search and add foods directly from Supabase database
- Support for multiple measurement units and portion sizes
- Food categorization and validation
- Database-only approach for accurate nutrition data
- Real-time search with comprehensive logging

📊 **Advanced Nutrition Analysis**
- 20+ tracked nutrients (macronutrients, vitamins, minerals)
- Daily value percentage calculations
- Interactive charts and visualizations
- Progress tracking against daily targets

🏥 **Health Condition Support**
- PCOS-specific hormone balance scoring
- Diabetes blood sugar impact analysis
- Glycemic index/load calculations
- Condition-specific food recommendations

📱 **Responsive Dashboard**
- Mobile-first design with Material-UI styling
- Interactive charts (radial, bar, area charts)
- Comprehensive Food Database browser with pagination
- Export functionality (CSV/JSON)
- Professional health insights
- User authentication and personalized data

## Quick Start

### Option 1: Use the startup script (recommended)

**On macOS/Linux:**
```bash
./start.sh
```

**On Windows:**
```cmd
start.bat
```

### Option 2: Manual setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to http://localhost:5173/

## Technology Stack

- **Frontend:** React 18 with TypeScript
- **UI Framework:** Material UI v5
- **Build Tool:** Vite
- **Charts:** Recharts
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Netlify

## Project Structure

```
src/
├── components/          # React components
│   ├── FoodEntry.tsx           # Food logging interface
│   ├── FoodSearch.tsx          # Database-only food search
│   ├── FoodDatabase.tsx        # Comprehensive food database browser
│   ├── NutritionDashboard.tsx  # Main dashboard with charts
│   ├── HealthConditionDashboard.tsx  # PCOS/diabetes insights
│   └── FoodHistory.tsx         # Food history management
├── utils/              # Utility functions
│   ├── advancedNutritionAnalysis.ts  # Core nutrition calculations
│   ├── healthConditions.ts           # Health condition algorithms
│   └── nutritionCalculator.ts        # Nutrition aggregation
├── services/           # External service integrations
│   └── database.ts            # Supabase database operations
└── types/              # TypeScript interfaces
    └── index.ts               # Type definitions
```

## Recent Updates

### v2.1 - Pure Database Architecture & Food Database Browser
- 🗃️ Added comprehensive Food Database tab with pagination and search
- 🔍 Database-only approach - shows only real Supabase data
- 📱 Responsive food database viewer for mobile and desktop
- 🔧 Enhanced debugging tools with comprehensive logging
- ⚡ Reduced bundle size by removing fallback data systems
- 🎯 Clear error messaging for database troubleshooting

### v2.0 - Enhanced Food Search & Database Integration
- 🎨 Complete Material-UI redesign of login interface
- 🗃️ Full Supabase database integration replacing local storage
- ⚡ Optimized production build with vendor chunk splitting
- 🔍 Enhanced search feedback with result counts and better error messages

## Health Insights

### PCOS Support
- Hormone balance scoring
- Anti-inflammatory food recommendations
- Insulin impact assessment
- Meal timing strategies

### Diabetes Management
- Blood sugar impact analysis
- Glycemic index tracking
- Portion control guidance
- Carbohydrate monitoring

## Export Features

- **CSV Export:** Basic nutrition data for spreadsheet analysis
- **JSON Export:** Complete nutrition report with metadata
- **Future:** PDF reports (coming soon)

## Browser Support

- Chrome/Edge 88+
- Firefox 85+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a personal nutrition tracking project. Feel free to fork and customize for your own health needs.

## License

Private project - All rights reserved

---

**Disclaimer:** This application is for informational purposes only and should not replace professional medical advice. Always consult with healthcare providers for medical guidance.