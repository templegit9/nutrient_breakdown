import { NutrientInfo } from '../types';

interface FoodData {
  name: string;
  calories: number;
  defaultUnit: string;
  nutrients: NutrientInfo[];
}

export const nutritionDatabase: FoodData[] = [
  {
    name: "Apple",
    calories: 52,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 0.3, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 14, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 0.2, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 2.4, unit: 'g', category: 'macronutrient' },
      { id: 'sugar', name: 'Sugar', amount: 10.4, unit: 'g', category: 'macronutrient' },
      { id: 'sodium', name: 'Sodium', amount: 1, unit: 'mg', dailyValue: 2300, category: 'mineral' },
      
      // Vitamins
      { id: 'vitamin-a', name: 'Vitamin A', amount: 3, unit: 'mcg', dailyValue: 900, category: 'vitamin' },
      { id: 'vitamin-c', name: 'Vitamin C', amount: 4.6, unit: 'mg', dailyValue: 90, category: 'vitamin' },
      { id: 'vitamin-e', name: 'Vitamin E', amount: 0.18, unit: 'mg', dailyValue: 15, category: 'vitamin' },
      { id: 'vitamin-k', name: 'Vitamin K', amount: 2.2, unit: 'mcg', dailyValue: 120, category: 'vitamin' },
      { id: 'thiamine', name: 'Thiamine (B1)', amount: 0.017, unit: 'mg', dailyValue: 1.2, category: 'vitamin' },
      { id: 'riboflavin', name: 'Riboflavin (B2)', amount: 0.026, unit: 'mg', dailyValue: 1.3, category: 'vitamin' },
      { id: 'niacin', name: 'Niacin (B3)', amount: 0.091, unit: 'mg', dailyValue: 16, category: 'vitamin' },
      { id: 'vitamin-b6', name: 'Vitamin B6', amount: 0.041, unit: 'mg', dailyValue: 1.7, category: 'vitamin' },
      { id: 'folate', name: 'Folate', amount: 3, unit: 'mcg', dailyValue: 400, category: 'vitamin' },
      
      // Minerals
      { id: 'calcium', name: 'Calcium', amount: 6, unit: 'mg', dailyValue: 1000, category: 'mineral' },
      { id: 'iron', name: 'Iron', amount: 0.12, unit: 'mg', dailyValue: 18, category: 'mineral' },
      { id: 'magnesium', name: 'Magnesium', amount: 5, unit: 'mg', dailyValue: 420, category: 'mineral' },
      { id: 'phosphorus', name: 'Phosphorus', amount: 11, unit: 'mg', dailyValue: 1250, category: 'mineral' },
      { id: 'potassium', name: 'Potassium', amount: 107, unit: 'mg', dailyValue: 4700, category: 'mineral' },
      { id: 'zinc', name: 'Zinc', amount: 0.04, unit: 'mg', dailyValue: 11, category: 'mineral' },
      { id: 'copper', name: 'Copper', amount: 0.027, unit: 'mg', dailyValue: 0.9, category: 'mineral' },
      { id: 'manganese', name: 'Manganese', amount: 0.035, unit: 'mg', dailyValue: 2.3, category: 'mineral' },
      
      // Other nutrients
      { id: 'water', name: 'Water', amount: 85.56, unit: 'g', category: 'other' },
      { id: 'antioxidants', name: 'Antioxidants', amount: 1, unit: 'ORAC', category: 'other' }
    ]
  },
  {
    name: "Chicken Breast",
    calories: 165,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 31, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 0, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 3.6, unit: 'g', category: 'macronutrient' },
      { id: 'saturated-fat', name: 'Saturated Fat', amount: 1.0, unit: 'g', category: 'macronutrient' },
      { id: 'cholesterol', name: 'Cholesterol', amount: 85, unit: 'mg', dailyValue: 300, category: 'other' },
      { id: 'sodium', name: 'Sodium', amount: 74, unit: 'mg', dailyValue: 2300, category: 'mineral' },
      
      // Vitamins
      { id: 'vitamin-a', name: 'Vitamin A', amount: 6, unit: 'mcg', dailyValue: 900, category: 'vitamin' },
      { id: 'vitamin-c', name: 'Vitamin C', amount: 1.2, unit: 'mg', dailyValue: 90, category: 'vitamin' },
      { id: 'vitamin-d', name: 'Vitamin D', amount: 0.1, unit: 'mcg', dailyValue: 20, category: 'vitamin' },
      { id: 'vitamin-e', name: 'Vitamin E', amount: 0.27, unit: 'mg', dailyValue: 15, category: 'vitamin' },
      { id: 'vitamin-k', name: 'Vitamin K', amount: 0.4, unit: 'mcg', dailyValue: 120, category: 'vitamin' },
      { id: 'thiamine', name: 'Thiamine (B1)', amount: 0.07, unit: 'mg', dailyValue: 1.2, category: 'vitamin' },
      { id: 'riboflavin', name: 'Riboflavin (B2)', amount: 0.12, unit: 'mg', dailyValue: 1.3, category: 'vitamin' },
      { id: 'niacin', name: 'Niacin (B3)', amount: 14.8, unit: 'mg', dailyValue: 16, category: 'vitamin' },
      { id: 'vitamin-b6', name: 'Vitamin B6', amount: 1.04, unit: 'mg', dailyValue: 1.7, category: 'vitamin' },
      { id: 'folate', name: 'Folate', amount: 4, unit: 'mcg', dailyValue: 400, category: 'vitamin' },
      { id: 'vitamin-b12', name: 'Vitamin B12', amount: 0.34, unit: 'mcg', dailyValue: 2.4, category: 'vitamin' },
      { id: 'pantothenic-acid', name: 'Pantothenic Acid', amount: 1.33, unit: 'mg', dailyValue: 5, category: 'vitamin' },
      
      // Minerals
      { id: 'calcium', name: 'Calcium', amount: 15, unit: 'mg', dailyValue: 1000, category: 'mineral' },
      { id: 'iron', name: 'Iron', amount: 1.04, unit: 'mg', dailyValue: 18, category: 'mineral' },
      { id: 'magnesium', name: 'Magnesium', amount: 29, unit: 'mg', dailyValue: 420, category: 'mineral' },
      { id: 'phosphorus', name: 'Phosphorus', amount: 196, unit: 'mg', dailyValue: 1250, category: 'mineral' },
      { id: 'potassium', name: 'Potassium', amount: 256, unit: 'mg', dailyValue: 4700, category: 'mineral' },
      { id: 'zinc', name: 'Zinc', amount: 1.31, unit: 'mg', dailyValue: 11, category: 'mineral' },
      { id: 'copper', name: 'Copper', amount: 0.063, unit: 'mg', dailyValue: 0.9, category: 'mineral' },
      { id: 'manganese', name: 'Manganese', amount: 0.02, unit: 'mg', dailyValue: 2.3, category: 'mineral' },
      { id: 'selenium', name: 'Selenium', amount: 27.6, unit: 'mcg', dailyValue: 55, category: 'mineral' },
      
      // Amino acids (essential for protein quality)
      { id: 'leucine', name: 'Leucine', amount: 2.5, unit: 'g', category: 'other' },
      { id: 'lysine', name: 'Lysine', amount: 2.9, unit: 'g', category: 'other' },
      { id: 'methionine', name: 'Methionine', amount: 0.9, unit: 'g', category: 'other' }
    ]
  },
  {
    name: "Brown Rice",
    calories: 112,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 2.6, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 23, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 0.9, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 1.8, unit: 'g', category: 'macronutrient' },
      { id: 'thiamine', name: 'Thiamine (B1)', amount: 0.19, unit: 'mg', dailyValue: 1.2, category: 'vitamin' },
      { id: 'magnesium', name: 'Magnesium', amount: 43, unit: 'mg', dailyValue: 420, category: 'mineral' },
      { id: 'manganese', name: 'Manganese', amount: 1.8, unit: 'mg', dailyValue: 2.3, category: 'mineral' }
    ]
  },
  {
    name: "Broccoli",
    calories: 34,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 2.8, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 7, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 0.4, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 2.6, unit: 'g', category: 'macronutrient' },
      { id: 'vitamin-c', name: 'Vitamin C', amount: 89.2, unit: 'mg', dailyValue: 90, category: 'vitamin' },
      { id: 'vitamin-k', name: 'Vitamin K', amount: 101.6, unit: 'mcg', dailyValue: 120, category: 'vitamin' },
      { id: 'folate', name: 'Folate', amount: 63, unit: 'mcg', dailyValue: 400, category: 'vitamin' },
      { id: 'iron', name: 'Iron', amount: 0.73, unit: 'mg', dailyValue: 18, category: 'mineral' }
    ]
  },
  {
    name: "Salmon",
    calories: 208,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 25.4, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 0, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 12.4, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 0, unit: 'g', category: 'macronutrient' },
      { id: 'vitamin-d', name: 'Vitamin D', amount: 526, unit: 'IU', dailyValue: 800, category: 'vitamin' },
      { id: 'vitamin-b12', name: 'Vitamin B12', amount: 4.9, unit: 'mcg', dailyValue: 2.4, category: 'vitamin' },
      { id: 'omega-3', name: 'Omega-3 Fatty Acids', amount: 2.3, unit: 'g', category: 'other' }
    ]
  },
  {
    name: "Spinach",
    calories: 23,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 2.9, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 3.6, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 0.4, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 2.2, unit: 'g', category: 'macronutrient' },
      { id: 'vitamin-k', name: 'Vitamin K', amount: 483, unit: 'mcg', dailyValue: 120, category: 'vitamin' },
      { id: 'vitamin-a', name: 'Vitamin A', amount: 469, unit: 'mcg', dailyValue: 900, category: 'vitamin' },
      { id: 'folate', name: 'Folate', amount: 194, unit: 'mcg', dailyValue: 400, category: 'vitamin' },
      { id: 'iron', name: 'Iron', amount: 2.71, unit: 'mg', dailyValue: 18, category: 'mineral' }
    ]
  },
  {
    name: "Quinoa",
    calories: 120,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 4.4, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 22, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 1.9, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 2.8, unit: 'g', category: 'macronutrient' },
      { id: 'manganese', name: 'Manganese', amount: 0.6, unit: 'mg', dailyValue: 2.3, category: 'mineral' },
      { id: 'phosphorus', name: 'Phosphorus', amount: 152, unit: 'mg', dailyValue: 1250, category: 'mineral' }
    ]
  },
  {
    name: "Greek Yogurt",
    calories: 100,
    defaultUnit: "grams",
    nutrients: [
      { id: 'protein', name: 'Protein', amount: 10, unit: 'g', category: 'macronutrient' },
      { id: 'carbs', name: 'Carbohydrates', amount: 3.6, unit: 'g', category: 'macronutrient' },
      { id: 'fat', name: 'Fat', amount: 5, unit: 'g', category: 'macronutrient' },
      { id: 'fiber', name: 'Fiber', amount: 0, unit: 'g', category: 'macronutrient' },
      { id: 'calcium', name: 'Calcium', amount: 110, unit: 'mg', dailyValue: 1000, category: 'mineral' },
      { id: 'vitamin-b12', name: 'Vitamin B12', amount: 0.75, unit: 'mcg', dailyValue: 2.4, category: 'vitamin' },
      { id: 'probiotics', name: 'Probiotics', amount: 1, unit: 'billion CFU', category: 'other' }
    ]
  }
];