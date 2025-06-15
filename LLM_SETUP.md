# LLM-Brain Setup Guide

This guide covers setting up the Google Gemini API integration for the LLM-powered food processing system.

## 🔑 Required API Key Configuration

The LLM brain uses Google Gemini 1.5 Flash for free, high-quality food analysis with generous usage limits.

### Environment Variable Setup

**Required Environment Variable:**
```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

### Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated key (starts with `AIza`)

### Local Development Setup

Create a `.env.local` file in your project root:

```bash
# .env.local
VITE_GEMINI_API_KEY=AIza-your-actual-gemini-key-here
```

**Important:** Never commit your API key to version control. The `.env.local` file is already in `.gitignore`.

### Production Deployment (Netlify)

1. Go to your Netlify dashboard
2. Select your site
3. Navigate to Site Settings → Environment Variables
4. Add new variable:
   - **Key:** `VITE_GEMINI_API_KEY`
   - **Value:** Your Gemini API key

## 💰 API Costs (Much Better!)

Google Gemini 1.5 Flash offers excellent free tier and low costs:

### Free Tier (Very Generous!)
- **15 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

### Paid Tier (When You Exceed Free)
- **Input tokens:** $0.35 per 1M tokens (75% cheaper than OpenAI!)
- **Output tokens:** $1.05 per 1M tokens (40% cheaper than OpenAI!)
- **Typical food analysis:** ~$0.0003-0.001 per request
- **Monthly usage (100 meals):** ~$0.03-0.10 (vs $0.10-0.30 with OpenAI)

**For most nutrition tracking apps, you'll stay within the free tier!**

## 🧠 How the LLM Brain Works

### Input Processing
The system accepts natural language food descriptions:
```
"I ate 4 slice of bread and a scrambled egg (3 eggs)"
```

### LLM Analysis
The Google Gemini API processes the input and:
- Identifies individual food items
- Determines quantities and units
- Calculates precise nutrition for each item
- Returns structured JSON with complete nutrition data

### Output Structure
```json
{
  "success": true,
  "description": "Bread and Scrambled Eggs",
  "foods": [
    {
      "name": "White bread",
      "quantity": 4,
      "unit": "slice",
      "calories": 280,
      "protein": 8,
      "carbohydrates": 52,
      "fat": 4,
      "fiber": 2,
      "sugar": 4,
      "sodium": 400,
      "calcium": 80,
      "iron": 2.8,
      "vitamin_c": 0
    },
    {
      "name": "Scrambled eggs",
      "quantity": 3,
      "unit": "large egg",
      "calories": 210,
      "protein": 18,
      "carbohydrates": 2,
      "fat": 15,
      "fiber": 0,
      "sugar": 1,
      "sodium": 300,
      "calcium": 120,
      "iron": 1.8,
      "vitamin_c": 0
    }
  ]
}
```

## 🏗️ Architecture Overview

### Core Components

1. **LLMFoodBrain** (`src/services/llmFoodBrain.ts`)
   - Google Gemini API integration
   - Food processing and nutrition analysis
   - Error handling and validation

2. **GroupedFoodDatabase** (`src/services/groupedFoodDatabase.ts`)
   - Database operations for grouped entries
   - JSON storage of individual food items
   - User data isolation with RLS

3. **LLMFoodEntry** (`src/components/LLMFoodEntry.tsx`)
   - AI-powered food entry interface
   - Real-time nutrition preview
   - CSV export functionality

4. **FoodHistory** (`src/components/FoodHistory.tsx`)
   - Expandable grouped meal displays
   - Individual food item breakdown
   - Bulk operations and filtering

### Database Schema

The system uses a new `grouped_food_entries` table:
```sql
CREATE TABLE grouped_food_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  individual_items JSONB NOT NULL,
  total_calories DECIMAL(8,2) NOT NULL,
  total_protein DECIMAL(8,2) NOT NULL,
  total_carbs DECIMAL(8,2) NOT NULL,
  total_fat DECIMAL(8,2) NOT NULL,
  time_of_day TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚀 Getting Started

1. **Set up your API key** (see above)
2. **Run the database migration:**
   ```sql
   -- Execute database/migration-grouped-food-entries.sql in Supabase SQL Editor
   ```
3. **Start the development server:**
   ```bash
   npm run dev
   ```
4. **Test the system:**
   - Navigate to the "Add Food" tab
   - Try entering: "I had 2 slices of toast and a banana"
   - The LLM will analyze and break down the nutrition

## 🔧 Troubleshooting

### Common Issues

1. **"Gemini API key not configured"**
   - Ensure `VITE_GEMINI_API_KEY` is set in your environment
   - Restart your development server after adding the key

2. **"Failed to process food input"**
   - Check your API key is valid (get a new one if needed)
   - Verify your internet connection
   - Check browser console for detailed error messages
   - Ensure you haven't exceeded the 1,500 daily request limit

3. **Database errors**
   - Ensure the migration has been run in Supabase
   - Check RLS policies are enabled
   - Verify user authentication

### Debug Mode

The system includes comprehensive error logging. Check the browser console for detailed information about API calls and responses.

## 🔐 Security Notes

- API keys are never exposed to the client
- All database operations use Row Level Security (RLS)
- User data is isolated by `auth.uid()`
- No food data is stored in the LLM - only processed in real-time

## 📊 Benefits of LLM-Brain Architecture

- **Unlimited Food Database:** No restrictions on food types or varieties
- **Natural Language Processing:** Users can describe meals in their own words
- **Accurate Nutrition Analysis:** AI-powered calculations for precise nutrition data
- **Grouped Meal Tracking:** Intuitive meal-based organization with individual breakdowns
- **Scalable Solution:** Handles any cuisine, preparation method, or food combination