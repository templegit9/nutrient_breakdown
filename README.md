# Nutrient Breakdown Tracker

A comprehensive nutrition tracking web application built with React, TypeScript, and Material UI. Designed specifically for health-conscious individuals, especially those managing conditions like PCOS and diabetes.

## Features

🥗 **Comprehensive Food Logging**
- Search and add foods from extensive nutrition database
- Support for multiple measurement units and portion sizes
- Food categorization and validation
- Local storage persistence

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
- Mobile-first design
- Interactive charts (radial, bar, area charts)
- Export functionality (CSV/JSON)
- Professional health insights

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
- **Storage:** Local Storage API

## Project Structure

```
src/
├── components/          # React components
│   ├── FoodEntry.tsx           # Food logging interface
│   ├── NutritionDashboard.tsx  # Main dashboard with charts
│   ├── HealthConditionDashboard.tsx  # PCOS/diabetes insights
│   └── FoodHistory.tsx         # Food history management
├── utils/              # Utility functions
│   ├── nutritionAnalyzer.ts   # Core nutrition calculations
│   ├── healthConditions.ts    # Health condition algorithms
│   └── localStorage.ts        # Data persistence
├── data/               # Static data
│   └── nutritionDatabase.ts   # Food nutrition database
└── types/              # TypeScript interfaces
    └── index.ts               # Type definitions
```

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