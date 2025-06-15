// Shared food-related type definitions
export interface FoodItem {
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbohydrates: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  calcium?: number;
  iron?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  potassium?: number;
}

export interface GroupedFoodEntry {
  id?: string;
  originalInput: string;
  combinedName: string; // e.g., "Bread and Eggs"
  totalCalories: number;
  totalNutrients: {
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    calcium?: number;
    iron?: number;
    vitamin_c?: number;
    vitamin_d?: number;
    potassium?: number;
  };
  individualItems: FoodItem[];
  dateAdded: Date;
  timeOfDay?: string;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export interface GroupedFoodEntryDB {
  id: string;
  user_id: string;
  description: string;
  individual_items: FoodItem[]; // JSON field
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  total_fiber?: number;
  total_sugar?: number;
  total_sodium?: number;
  total_calcium?: number;
  total_iron?: number;
  total_vitamin_c?: number;
  total_vitamin_d?: number;
  total_potassium?: number;
  time_of_day?: string;
  created_at: string;
}