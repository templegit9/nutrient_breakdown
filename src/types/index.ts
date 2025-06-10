export interface NutrientInfo {
  id: string;
  name: string;
  amount: number;
  unit: string;
  dailyValue?: number;
  category: 'macronutrient' | 'vitamin' | 'mineral' | 'other';
}

export interface GlucoseReading {
  preGlucose?: number;  // mg/dL before eating
  postGlucose?: number; // mg/dL 2 hours after eating
  testingTime?: Date;   // when glucose was measured
  notes?: string;       // additional notes about the reading
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
  glucoseData?: GlucoseReading; // optional glucose tracking
  cookingState?: 'raw' | 'cooked' | 'boiled' | 'steamed' | 'fried' | 'baked' | 'grilled' | 'roasted';
}

// Database food item from the foods table
export interface DatabaseFood {
  id: string;
  name: string;
  brand?: string;
  category: string;
  preparation_state: string; // This maps to our cookingState
  serving_size: number;
  serving_unit: string;
  calories_per_100g: number;
  protein_per_100g: number;
  carbs_per_100g: number;
  fat_per_100g: number;
  fiber_per_100g?: number;
  sugar_per_100g?: number;
  sodium_per_100g?: number;
  cholesterol_per_100g?: number;
  potassium_per_100g?: number;
  iron_per_100g?: number;
  calcium_per_100g?: number;
  vitamin_c_per_100g?: number;
  vitamin_d_per_100g?: number;
  glycemic_index?: number;
  glycemic_load?: number;
  created_at?: string;
  updated_at?: string;
}

// Database-compatible food entry type
export interface FoodEntry {
  id: string;
  name: string;
  amount: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  cholesterol?: number;
  potassium?: number;
  iron?: number;
  calcium?: number;
  vitamin_c?: number;
  vitamin_d?: number;
  glycemic_index?: number;
  glycemic_load?: number;
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  cookingState?: 'raw' | 'cooked' | 'boiled' | 'steamed' | 'fried' | 'baked' | 'grilled' | 'roasted';
}

// Blood glucose reading type
export interface BloodGlucoseReading {
  id: string;
  level: number;
  type: 'fasting' | 'post_meal' | 'random' | 'bedtime';
  notes: string;
  timestamp: string;
}

// User profile type
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number;
  weight: number;
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
  healthConditions: string[];
  dietaryRestrictions: string[];
  targetCalories: number;
  targetProtein: number;
  targetCarbs: number;
  targetFat: number;
  targetFiber: number;
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