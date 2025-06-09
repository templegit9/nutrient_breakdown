import { NutrientInfo } from '../types';
import { nutritionDatabase } from '../data/nutritionDatabase';
import { convertToBaseUnit } from './unitConversions';

export async function analyzeFoodNutrition(
  foodName: string, 
  quantity: number, 
  unit: string
): Promise<{ calories: number; nutrients: NutrientInfo[] }> {
  const normalizedFoodName = foodName.toLowerCase().trim();
  
  const foodData = nutritionDatabase.find(
    food => food.name.toLowerCase().includes(normalizedFoodName) ||
            normalizedFoodName.includes(food.name.toLowerCase())
  );

  if (!foodData) {
    const genericNutrients: NutrientInfo[] = [
      { id: 'protein', name: 'Protein', amount: 0, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 0, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 0, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 0, unit: 'g', category: 'macronutrient' }
    ];
    
    return {
      calories: 100,
      nutrients: genericNutrients
    };
  }

  const baseConversion = convertToBaseUnit(quantity, unit, foodName);
  
  // Calculate multiplier based on 100g baseline (most nutrition data is per 100g)
  const gramsAmount = baseConversion.grams || 100;
  const multiplier = gramsAmount / 100;
  
  const scaledNutrients = foodData.nutrients.map(nutrient => ({
    ...nutrient,
    amount: nutrient.amount * multiplier
  }));

  return {
    calories: foodData.calories * multiplier,
    nutrients: scaledNutrients
  };
}