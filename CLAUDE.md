# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start Development Server:**
```bash
npm run dev
# Starts Vite dev server on http://localhost:5173
```

**Build & Testing:**
```bash
npm run build          # Clean build for production
npm run preview        # Preview production build locally
npm run lint           # ESLint with TypeScript support
npm run typecheck      # TypeScript type checking without emit
npm run build:analyze  # Build with bundle analysis
```

**Database Operations:**
- Run SQL migrations in Supabase SQL Editor
- Use `database/clean-install.sql` for fresh setup
- Use `database/complete_verified_foods_database.sql` to populate foods
- Use `database/add-custom-foods-table.sql` for custom foods feature

## Architecture Overview

### Core Data Flow Architecture
This is a **nutrition tracking application** built with React + TypeScript + Supabase, designed specifically for health conditions like PCOS and diabetes.

**Key architectural patterns:**
1. **Database-First Design**: All nutrition data comes from Supabase `foods` table with verified nutrition data
2. **Custom Foods Integration**: User-created foods stored in `custom_foods` table with per-serving nutrition
3. **Unit Conversion System**: Complex unit conversions with food-specific fallbacks in `utils/unitConversions.ts`
4. **Health Condition Analysis**: Specialized algorithms for PCOS/diabetes in `utils/healthConditions.ts`

### Database Schema (Supabase)
- `foods` - Verified nutrition database (189 foods with multiple cooking states)
- `custom_foods` - User-created foods (per-serving nutrition data)
- `food_entries` - Individual consumption records
- `user_profiles` - User health information
- `blood_glucose_readings` - Diabetes tracking
- `nutrition_goals` - Daily targets

### Critical Components Architecture

**FoodEntry.tsx** - Main food logging interface:
- Integrates FoodSearch for database/custom food selection
- Dual input modes: Traditional form + Conversational input
- Complex unit conversion logic with custom food serving size support
- Nutrition calculation with cooking state adjustments
- Glucose tracking integration

**FoodDatabase.tsx** - Food database browser with custom food management:
- Toggle system: All Foods / Database Only / Custom Only
- Integrated custom food creation (AddCustomFoodDialog)
- Visual identifiers for custom vs database foods
- Delete functionality for custom foods only

**NutritionDashboard.tsx** - Main analytics dashboard:
- 20+ nutrient tracking with charts (Recharts)
- Daily value percentage calculations
- Progress tracking against targets

**HealthConditionDashboard.tsx** - Specialized health analysis:
- PCOS hormone balance scoring
- Diabetes blood sugar impact analysis
- Condition-specific food recommendations

### Conversational Input System
New dual-mode input architecture for natural language food logging:
- **Text Parser**: `utils/conversationalParser.ts` - extracts foods, quantities, units from natural language
- **Food Matcher**: `utils/foodMatcher.ts` - fuzzy matching against database with synonym handling
- **Conversation Flow**: State management for clarifying questions and confirmations
- **Integration Point**: Parsed foods feed into existing FoodEntry validation and nutrition calculation pipeline

### Unit Conversion System
Located in `utils/unitConversions.ts` - handles complex food-specific conversions:
- Food-specific conversion factors (e.g., "apple" -> specific gram conversions)
- Fallback system for unknown foods
- **Critical**: Custom foods must use their specific `serving_size` when unit conversion fails

### Nutrition Calculation Pipeline
1. **Input**: Food selection + quantity + unit
2. **Unit Conversion**: Convert to grams using `unitConversions.ts`
3. **Serving Size Handling**: Custom foods use stored `serving_size`, database foods use per-100g
4. **Nutrition Scaling**: Scale nutrition values based on actual gram amount
5. **Cooking Adjustments**: Apply cooking state modifications in `cookingAdjustments.ts`
6. **Health Analysis**: Run through PCOS/diabetes algorithms

### Authentication & Data Isolation
- Supabase Auth with Row Level Security (RLS)
- All user data isolated by `auth.uid()`
- Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Common Issues & Solutions

**Unit Conversion Accuracy for Custom Foods:**
When custom foods show incorrect calories (e.g., 43 instead of 40), check:
1. Custom food's `serving_size` and `serving_unit` in database
2. Unit conversion fallback logic in `FoodEntry.tsx`
3. Ensure custom foods use their specific serving size, not generic fallbacks

**Database Connection Issues:**
- Check Supabase environment variables
- Verify RLS policies are correctly applied
- Use `DatabaseService.checkDatabaseSchema()` for debugging

**Search Functionality:**
- Database search uses `searchAllFoods()` for combined database + custom foods
- Custom foods require `custom_foods` table (use `add-custom-foods-table.sql`)
- Always add null safety: `(results || []).map(...)`

**Deployment (Netlify):**
- Uses SPA redirect configuration in `netlify.toml`
- Build optimizations with vendor chunk splitting
- Requires Supabase environment variables in Netlify dashboard

## Health-Specific Features

**PCOS Support:**
- Anti-inflammatory food scoring
- Hormone balance calculations
- Insulin impact assessment in `utils/healthConditions.ts`

**Diabetes Management:**
- Glycemic index/load tracking
- Blood glucose reading integration
- Carbohydrate impact analysis

## Food Database Integration

**Database Foods**: 189 verified foods with multiple cooking states and complete micronutrient profiles
**Custom Foods**: User-created foods with per-serving nutrition data
**Search Integration**: Combined search across both datasets with visual identifiers

The nutrition database includes Nigerian foods and supports multiple preparation states (raw, cooked, boiled, steamed, fried, baked, grilled, roasted, etc.) with research-based nutrition adjustments.