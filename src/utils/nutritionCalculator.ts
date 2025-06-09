import { FoodItem, NutritionAnalysis, NutrientInfo } from '../types';
import { nutritionEngine, DetailedNutritionAnalysis } from './advancedNutritionAnalysis';

export function calculateTotalNutrition(foods: FoodItem[]): NutritionAnalysis {
  const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
  
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
    protein: allNutrients['protein'] || 0,
    carbs: allNutrients['carbs'] || 0,
    fat: allNutrients['fat'] || 0,
    fiber: allNutrients['fiber'] || 0,
  };

  const vitamins: NutrientInfo[] = Object.keys(allNutrients)
    .filter(key => nutrientInfo[key]?.category === 'vitamin')
    .map(key => ({
      ...nutrientInfo[key],
      amount: allNutrients[key]
    }));

  const minerals: NutrientInfo[] = Object.keys(allNutrients)
    .filter(key => nutrientInfo[key]?.category === 'mineral')
    .map(key => ({
      ...nutrientInfo[key],
      amount: allNutrients[key]
    }));

  const dailyValuePercentages: Record<string, number> = {};
  Object.keys(allNutrients).forEach(key => {
    const nutrient = nutrientInfo[key];
    if (nutrient?.dailyValue) {
      dailyValuePercentages[key] = (allNutrients[key] / nutrient.dailyValue) * 100;
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