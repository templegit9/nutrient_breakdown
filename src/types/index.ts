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