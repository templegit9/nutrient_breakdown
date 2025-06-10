# Nutrient Breakdown Tracker

A comprehensive nutrition tracking web application built with React, TypeScript, and Material UI. Designed specifically for health-conscious individuals, especially those managing conditions like PCOS and diabetes.

## Features

🥗 **Comprehensive Food Logging**
- Search and add foods with intelligent fallback suggestions
- Support for multiple measurement units and portion sizes
- Food categorization and validation
- Nigerian food options (Yam, Plantain, Cassava, Ugu)
- Supabase database integration with offline fallback

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
│   ├── FoodSearch.tsx          # Enhanced food search with fallback suggestions
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

### v2.0 - Enhanced Food Search & Database Integration
- ✨ Added intelligent fallback suggestions when database is empty
- 🍠 Nigerian food options included (Yam, Plantain, Cassava, Ugu)
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