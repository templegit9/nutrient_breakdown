export interface NutrientInfo {
  id: string;
  name: string;
  amount: number;
  unit: string;
  dailyValue?: number;
  category: 'macronutrient' | 'vitamin' | 'mineral' | 'other';
}

export interface FoodItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  nutrients: NutrientInfo[];
  category: string;
  dateAdded: Date;
}

export interface NutritionAnalysis {
  totalCalories: number;
  macronutrients: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  vitamins: NutrientInfo[];
  minerals: NutrientInfo[];
  dailyValuePercentages: Record<string, number>;
}