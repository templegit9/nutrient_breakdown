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
  date: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
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