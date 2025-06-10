# Nutrition Calculations Analysis - FoodHistory & Related Components

This document extracts all nutrition calculations used in the FoodHistory table and related components for verification purposes.

## 1. FoodHistory Component Calculations
**File:** `src/components/FoodHistory.tsx`

### Basic Nutrient Display (Lines 338-347)
```typescript
// Simple Math.round() applied to each nutrient
<TableCell align="right">
  {Math.round(food.calories)}
</TableCell>
<TableCell align="right">
  {Math.round(food.nutrients.find(n => n.name === 'Protein')?.amount || 0)}
</TableCell>
<TableCell align="right">
  {Math.round(food.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0)}
</TableCell>
<TableCell align="right">
  {Math.round(food.nutrients.find(n => n.name === 'Fat')?.amount || 0)}
</TableCell>
```

### Glucose Level Classifications (Lines 354-377)
```typescript
// Pre-meal glucose color coding
color={
  food.glucoseData.preGlucose <= 100 ? 'success' :
  food.glucoseData.preGlucose <= 125 ? 'warning' : 'error'
}

// Post-meal glucose color coding
color={
  food.glucoseData.postGlucose <= 140 ? 'success' :
  food.glucoseData.postGlucose <= 199 ? 'warning' : 'error'
}
```

### Sorting Calculation (Line 156)
```typescript
// Simple subtraction for calorie sorting
comparison = a.calories - b.calories;
```

## 2. Core Nutrition Calculator
**File:** `src/utils/nutritionCalculator.ts`

### Total Calorie Aggregation (Line 5)
```typescript
// Basic reduce sum for total calories
const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
```

### Nutrient Summation (Lines 10-18)
```typescript
// Accumulate all nutrients by ID
foods.forEach(food => {
  food.nutrients.forEach(nutrient => {
    if (!allNutrients[nutrient.id]) {
      allNutrients[nutrient.id] = 0;
      nutrientInfo[nutrient.id] = { ...nutrient, amount: 0 };
    }
    allNutrients[nutrient.id] += nutrient.amount;  // ⚠️ POTENTIAL ISSUE: Direct addition
  });
});
```

### Daily Value Percentage (Lines 42-47)
```typescript
// Convert to percentage of daily value
Object.keys(allNutrients).forEach(key => {
  const nutrient = nutrientInfo[key];
  if (nutrient?.dailyValue) {
    dailyValuePercentages[key] = (allNutrients[key] / nutrient.dailyValue) * 100;
  }
});
```

## 3. Advanced Nutrition Analysis Engine
**File:** `src/utils/advancedNutritionAnalysis.ts`

### Macronutrient Ratio Calculations (Lines 141-154)
```typescript
// Calculate macro percentages using 4-4-9 calorie conversion
private calculateMacronutrientRatios(analysis: NutritionAnalysis) {
  const { protein, carbs, fat } = analysis.macronutrients;
  const totalMacroCalories = (protein * 4) + (carbs * 4) + (fat * 9);  // ⚠️ Standard conversion
  
  if (totalMacroCalories === 0) {
    return { proteinPercentage: 0, carbPercentage: 0, fatPercentage: 0 };
  }

  return {
    proteinPercentage: ((protein * 4) / totalMacroCalories) * 100,
    carbPercentage: ((carbs * 4) / totalMacroCalories) * 100,
    fatPercentage: ((fat * 9) / totalMacroCalories) * 100
  };
}
```

### Glycemic Load Calculation (Lines 311-327)
```typescript
// Weighted average glycemic index calculation
private estimateGlycemicLoad(foods: FoodItem[], totalCarbs: number): number {
  let weightedGI = 0;
  let totalWeight = 0;

  foods.forEach(food => {
    const foodCarbs = food.nutrients.find(n => n.id === 'carbs')?.amount || 0;
    if (foodCarbs > 0) {
      const gi = this.getFoodGI(food.category, food.name);  // ⚠️ Custom GI lookup
      weightedGI += gi * foodCarbs;  // Weight by carb content
      totalWeight += foodCarbs;
    }
  });

  const averageGI = totalWeight > 0 ? weightedGI / totalWeight : 50;
  return (averageGI * totalCarbs) / 100;  // Standard GL formula: (GI × carbs) / 100
}
```

### Health Condition Scoring (Lines 227-246)
```typescript
// PCOS Anti-Inflammatory Score
let antiInflammatoryScore = 50;
const vegetableCount = foods.filter(f => f.category === 'vegetables').length;
const fruitCount = foods.filter(f => f.category === 'fruits').length;
const processedCount = foods.filter(f => f.category === 'snacks').length;

antiInflammatoryScore += (vegetableCount * 10) + (fruitCount * 5) - (processedCount * 15);
antiInflammatoryScore = Math.max(0, Math.min(100, antiInflammatoryScore));

// Hormone Support Score
let hormoneSupportScore = 50;
const proteinPercentage = analysis.macronutrients.protein / analysis.totalCalories * 100 * 4;  // ⚠️ Double multiplication?
const fiberAmount = analysis.macronutrients.fiber;

if (proteinPercentage >= 20) hormoneSupportScore += 15;
if (fiberAmount >= 25) hormoneSupportScore += 10;
```

## 4. Unit Conversion Calculations
**File:** `src/utils/unitConversions.ts`

### Base Unit Conversion (Lines 186-195)
```typescript
// Convert all units to base measurements
switch (unit.category) {
  case 'weight':
    return { grams: amount * unit.conversionFactor };  // ⚠️ Direct multiplication
  case 'volume':
    return { milliliters: amount * unit.conversionFactor };
  case 'count':
    return { pieces: amount * unit.conversionFactor };
  default:
    return { grams: amount };  // ⚠️ Default assumption
}
```

### Food-Specific Conversions (Lines 179-182)
```typescript
// Override with food-specific conversion factors
if (foodConversions && foodSpecificConversions[foodConversions][fromUnit]) {
  const conversionFactor = foodSpecificConversions[foodConversions][fromUnit];
  return { grams: amount * conversionFactor };  // ⚠️ Potential precision loss
}
```

## 5. Cooking Adjustment Calculations
**File:** `src/utils/cookingAdjustments.ts`

### Nutrition Scaling (Lines 157-165)
```typescript
// Apply cooking state multipliers to raw nutrition
return {
  calories: Math.round(rawNutrition.calories * adjustment.calories),
  protein: Math.round((rawNutrition.protein * adjustment.protein) * 10) / 10,  // ⚠️ One decimal precision
  carbs: Math.round((rawNutrition.carbs * adjustment.carbs) * 10) / 10,
  fat: Math.round((rawNutrition.fat * adjustment.fat) * 10) / 10,
  fiber: rawNutrition.fiber ? Math.round((rawNutrition.fiber * adjustment.fiber) * 10) / 10 : 0,
  sugar: rawNutrition.sugar || 0,  // ⚠️ No adjustment applied
  sodium: rawNutrition.sodium || 0  // ⚠️ No adjustment applied
};
```

## 6. Daily Value Progress Calculations
**File:** `src/components/NutritionDashboard.tsx` (Lines 166-192)

### Vitamin/Mineral Progress (Lines 166-192)
```typescript
const vitaminData = analysis.vitamins.slice(0, 6).map(vitamin => {
  const percentage = vitamin.dailyValue ? Math.min((vitamin.amount / vitamin.dailyValue) * 100, 200) : 0;  // ⚠️ Capped at 200%
  return {
    name: vitamin.name.replace('Vitamin ', '').replace(' (B1)', '').replace(' (B2)', '').replace(' (B3)', ''),
    amount: vitamin.amount,
    target: vitamin.dailyValue || 100,  // ⚠️ Default target of 100
    percentage,
    color: percentage >= 100 ? theme.palette.success.main : 
           percentage >= 50 ? theme.palette.warning.main : 
           theme.palette.error.main,
    unit: vitamin.unit
  };
});
```

## POTENTIAL ISSUES IDENTIFIED:

### 🚨 Critical Issues:
1. **Line 237 in advancedNutritionAnalysis.ts**: `proteinPercentage = analysis.macronutrients.protein / analysis.totalCalories * 100 * 4` - This appears to have an extra multiplication by 4
2. **Nutrient summation**: Direct addition without considering serving sizes or units may cause incorrect totals
3. **Default values**: Many calculations default to 0 or 100 when data is missing, potentially masking real issues

### ⚠️ Precision Issues:
1. **Cooking adjustments**: Sugar and sodium are not adjusted for cooking state
2. **Unit conversions**: Default assumption that unknown units = grams
3. **Rounding inconsistencies**: Some values rounded to integers, others to 1 decimal place

### 💡 Validation Concerns:
1. **Daily Value percentages**: Capped at 200% which may hide overconsumption
2. **Glycemic calculations**: Custom GI lookup may not match actual food GI values
3. **Health scores**: Arbitrary scoring system may not reflect actual health impact

## RECOMMENDED VERIFICATION STEPS:
1. Check if protein percentage calculation in hormone support score is correct
2. Verify unit conversion factors match standard nutrition databases
3. Validate that cooking adjustments are applied consistently to all nutrients
4. Confirm daily value targets match current RDA/DRI guidelines
5. Test edge cases where foods have missing nutrition data