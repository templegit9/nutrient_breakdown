import { FoodItem, NutritionAnalysis, NutrientInfo } from '../types';
import { nutritionEngine, DetailedNutritionAnalysis } from './advancedNutritionAnalysis';
import { roundToInteger, roundToOneDecimal, calculatePercentage } from './roundingUtils';

export function calculateTotalNutrition(foods: FoodItem[]): NutritionAnalysis {
  const totalCalories = roundToInteger(foods.reduce((sum, food) => sum + food.calories, 0));
  
  const allNutrients: Record<string, number> = {};
  const nutrientInfo: Record<string, NutrientInfo> = {};

  foods.forEach(food => {
    food.nutrients.forEach(nutrient => {
      if (!allNutrients[nutrient.id]) {
        allNutrients[nutrient.id] = 0;
        nutrientInfo[nutrient.id] = { ...nutrient, amount: 0 };
      }
      allNutrients[nutrient.id] += nutrient.amount;
    });
  });

  const macronutrients = {
    protein: roundToOneDecimal(allNutrients['protein'] || 0),
    carbs: roundToOneDecimal(allNutrients['carbs'] || 0),
    fat: roundToOneDecimal(allNutrients['fat'] || 0),
    fiber: roundToOneDecimal(allNutrients['fiber'] || 0),
  };

  const vitamins: NutrientInfo[] = Object.keys(allNutrients)
    .filter(key => nutrientInfo[key]?.category === 'vitamin')
    .map(key => ({
      ...nutrientInfo[key],
      amount: roundToOneDecimal(allNutrients[key])
    }));

  const minerals: NutrientInfo[] = Object.keys(allNutrients)
    .filter(key => nutrientInfo[key]?.category === 'mineral')
    .map(key => ({
      ...nutrientInfo[key],
      amount: roundToOneDecimal(allNutrients[key])
    }));

  const dailyValuePercentages: Record<string, number> = {};
  Object.keys(allNutrients).forEach(key => {
    const nutrient = nutrientInfo[key];
    if (nutrient?.dailyValue) {
      dailyValuePercentages[key] = calculatePercentage(allNutrients[key], nutrient.dailyValue);
    }
  });

  return {
    totalCalories,
    macronutrients,
    vitamins,
    minerals,
    dailyValuePercentages
  };
}

export function calculateDetailedNutrition(foods: FoodItem[]): DetailedNutritionAnalysis {
  return nutritionEngine.analyzeDetailed(foods);
}