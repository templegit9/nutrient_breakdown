import { GroupedFoodEntry } from '../types/food';
import { FoodItem, NutritionAnalysis, NutrientInfo } from '../types';

/**
 * Dashboard Data Aggregation Service
 * Converts GroupedFoodEntry[] to formats needed by dashboard components
 */

// Helper function to create empty nutrition analysis
function createEmptyNutritionAnalysis(): NutritionAnalysis {
  return {
    totalCalories: 0,
    macronutrients: {
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0
    },
    vitamins: [],
    minerals: [],
    dailyValuePercentages: {}
  };
}

// Convert GroupedFoodEntry to FoodItem format for backward compatibility
export function convertGroupedEntryToFoodItem(entry: GroupedFoodEntry): FoodItem[] {
  return entry.individualItems.map((item, index) => ({
    id: `${entry.id || 'temp'}-${index}`,
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    calories: item.calories,
    nutrients: [
      { id: 'protein', name: 'Protein', amount: item.protein, unit: 'g', category: 'macronutrient' as const },
      { id: 'carbs', name: 'Carbohydrates', amount: item.carbohydrates, unit: 'g', category: 'macronutrient' as const },
      { id: 'fat', name: 'Fat', amount: item.fat, unit: 'g', category: 'macronutrient' as const },
      { id: 'fiber', name: 'Fiber', amount: item.fiber, unit: 'g', category: 'other' as const },
      { id: 'sugar', name: 'Sugar', amount: item.sugar, unit: 'g', category: 'other' as const },
      { id: 'sodium', name: 'Sodium', amount: item.sodium, unit: 'mg', category: 'mineral' as const },
      { id: 'calcium', name: 'Calcium', amount: item.calcium || 0, unit: 'mg', category: 'mineral' as const },
      { id: 'iron', name: 'Iron', amount: item.iron || 0, unit: 'mg', category: 'mineral' as const },
      { id: 'vitamin_c', name: 'Vitamin C', amount: item.vitamin_c || 0, unit: 'mg', category: 'vitamin' as const },
      { id: 'vitamin_d', name: 'Vitamin D', amount: item.vitamin_d || 0, unit: 'IU', category: 'vitamin' as const },
      { id: 'potassium', name: 'Potassium', amount: item.potassium || 0, unit: 'mg', category: 'mineral' as const }
    ],
    category: entry.mealType || 'meal',
    dateAdded: entry.dateAdded,
    timeOfDay: entry.timeOfDay || undefined
  }));
}

// Convert array of GroupedFoodEntry to flattened FoodItem array
export function convertGroupedEntriesToFoodItems(entries: GroupedFoodEntry[]): FoodItem[] {
  if (!entries || !Array.isArray(entries)) {
    console.warn('convertGroupedEntriesToFoodItems received invalid data');
    return [];
  }
  
  try {
    return entries.flatMap(convertGroupedEntryToFoodItem);
  } catch (error) {
    console.error('Error converting grouped entries to food items:', error);
    return [];
  }
}

// Calculate nutrition analysis directly from GroupedFoodEntry array
export function calculateNutritionFromGroupedEntries(entries: GroupedFoodEntry[]): NutritionAnalysis {
  if (!entries || !Array.isArray(entries) || entries.length === 0) {
    return createEmptyNutritionAnalysis();
  }
  const totals = entries.reduce((acc, entry) => ({
    calories: acc.calories + entry.totalCalories,
    protein: acc.protein + entry.totalNutrients.protein,
    carbs: acc.carbs + entry.totalNutrients.carbohydrates,
    fat: acc.fat + entry.totalNutrients.fat,
    fiber: acc.fiber + entry.totalNutrients.fiber,
    sugar: acc.sugar + entry.totalNutrients.sugar,
    sodium: acc.sodium + entry.totalNutrients.sodium,
    calcium: acc.calcium + (entry.totalNutrients.calcium || 0),
    iron: acc.iron + (entry.totalNutrients.iron || 0),
    vitamin_c: acc.vitamin_c + (entry.totalNutrients.vitamin_c || 0),
    vitamin_d: acc.vitamin_d + (entry.totalNutrients.vitamin_d || 0),
    potassium: acc.potassium + (entry.totalNutrients.potassium || 0)
  }), {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sugar: 0,
    sodium: 0,
    calcium: 0,
    iron: 0,
    vitamin_c: 0,
    vitamin_d: 0,
    potassium: 0
  });

  // Daily value references (RDA for adults)
  const dailyValues = {
    protein: 50, // grams
    fiber: 25, // grams
    sodium: 2300, // mg
    calcium: 1000, // mg
    iron: 18, // mg
    vitamin_c: 90, // mg
    vitamin_d: 20, // mcg (800 IU)
    potassium: 3500 // mg
  };

  const vitamins: NutrientInfo[] = [
    {
      id: 'vitamin_c',
      name: 'Vitamin C',
      amount: totals.vitamin_c,
      unit: 'mg',
      dailyValue: dailyValues.vitamin_c,
      category: 'vitamin'
    },
    {
      id: 'vitamin_d',
      name: 'Vitamin D',
      amount: totals.vitamin_d,
      unit: 'IU',
      dailyValue: dailyValues.vitamin_d * 40, // Convert mcg to IU
      category: 'vitamin'
    }
  ];

  const minerals: NutrientInfo[] = [
    {
      id: 'calcium',
      name: 'Calcium',
      amount: totals.calcium,
      unit: 'mg',
      dailyValue: dailyValues.calcium,
      category: 'mineral'
    },
    {
      id: 'iron',
      name: 'Iron',
      amount: totals.iron,
      unit: 'mg',
      dailyValue: dailyValues.iron,
      category: 'mineral'
    },
    {
      id: 'sodium',
      name: 'Sodium',
      amount: totals.sodium,
      unit: 'mg',
      dailyValue: dailyValues.sodium,
      category: 'mineral'
    },
    {
      id: 'potassium',
      name: 'Potassium',
      amount: totals.potassium,
      unit: 'mg',
      dailyValue: dailyValues.potassium,
      category: 'mineral'
    }
  ];

  const dailyValuePercentages: Record<string, number> = {};
  [...vitamins, ...minerals].forEach(nutrient => {
    if (nutrient.dailyValue) {
      dailyValuePercentages[nutrient.id] = (nutrient.amount / nutrient.dailyValue) * 100;
    }
  });

  return {
    totalCalories: totals.calories,
    macronutrients: {
      protein: totals.protein,
      carbs: totals.carbs,
      fat: totals.fat,
      fiber: totals.fiber
    },
    vitamins,
    minerals,
    dailyValuePercentages
  };
}

// Date range types for filtering
export type DateRangeType = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'thisWeek' | 'thisMonth' | 'custom';

export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

// Get predefined date ranges
export function getDateRange(type: DateRangeType, customStart?: Date, customEnd?: Date): DateRange {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (type) {
    case 'today':
      return {
        startDate: today,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Today'
      };
      
    case 'yesterday':
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      return {
        startDate: yesterday,
        endDate: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Yesterday'
      };
      
    case 'last7days':
      return {
        startDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Last 7 Days'
      };
      
    case 'last30days':
      return {
        startDate: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Last 30 Days'
      };
      
    case 'thisWeek':
      const dayOfWeek = today.getDay(); // 0 = Sunday
      const startOfWeek = new Date(today.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
      return {
        startDate: startOfWeek,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'This Week'
      };
      
    case 'thisMonth':
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        startDate: startOfMonth,
        endDate: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'This Month'
      };
      
    case 'custom':
      return {
        startDate: customStart || today,
        endDate: customEnd || new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1),
        label: 'Custom Range'
      };
      
    default:
      return getDateRange('today');
  }
}

// Filter entries by date range for time-based analysis
export function filterEntriesByDateRange(
  entries: GroupedFoodEntry[], 
  startDate: Date, 
  endDate: Date
): GroupedFoodEntry[] {
  if (!entries || !Array.isArray(entries)) {
    return [];
  }
  
  return entries.filter(entry => {
    const entryDate = new Date(entry.dateAdded);
    return entryDate >= startDate && entryDate <= endDate;
  });
}

// Filter entries using predefined date range
export function filterEntriesByDateRangeType(
  entries: GroupedFoodEntry[], 
  rangeType: DateRangeType,
  customStart?: Date,
  customEnd?: Date
): { filteredEntries: GroupedFoodEntry[]; dateRange: DateRange } {
  const dateRange = getDateRange(rangeType, customStart, customEnd);
  const filteredEntries = filterEntriesByDateRange(entries, dateRange.startDate, dateRange.endDate);
  
  return { filteredEntries, dateRange };
}

// Get today's entries
export function getTodaysEntries(entries: GroupedFoodEntry[]): GroupedFoodEntry[] {
  const today = new Date();
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
  
  return filterEntriesByDateRange(entries, startOfDay, endOfDay);
}

// Time of day mappings for meal timing analysis
export const TIME_OF_DAY_MAPPINGS = {
  'early-morning': { label: 'Early Morning', order: 1, color: '#FFE4B5' },
  'morning': { label: 'Morning', order: 2, color: '#FFD700' },
  'late-morning': { label: 'Late Morning', order: 3, color: '#FFA500' },
  'afternoon': { label: 'Afternoon', order: 4, color: '#FF6347' },
  'evening': { label: 'Evening', order: 5, color: '#9370DB' },
  'night': { label: 'Night', order: 6, color: '#4169E1' },
  'late-night': { label: 'Late Night', order: 7, color: '#191970' }
} as const;

export const MEAL_TYPE_MAPPINGS = {
  'breakfast': { label: 'Breakfast', color: '#FFD700', icon: '🥞' },
  'lunch': { label: 'Lunch', color: '#FF6347', icon: '🥗' },
  'dinner': { label: 'Dinner', color: '#9370DB', icon: '🍽️' },
  'snack': { label: 'Snack', color: '#32CD32', icon: '🍎' }
} as const;

// Aggregate nutrition by meal type
export function aggregateNutritionByMealType(entries: GroupedFoodEntry[]) {
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
  
  return mealTypes.map(mealType => {
    const mealEntries = entries.filter(entry => entry.mealType === mealType);
    const nutrition = calculateNutritionFromGroupedEntries(mealEntries);
    
    return {
      mealType,
      label: MEAL_TYPE_MAPPINGS[mealType]?.label || mealType,
      icon: MEAL_TYPE_MAPPINGS[mealType]?.icon || '🍴',
      color: MEAL_TYPE_MAPPINGS[mealType]?.color || '#666',
      count: mealEntries.length,
      entries: mealEntries,
      ...nutrition
    };
  }).filter(meal => meal.count > 0); // Only return meals with entries
}

// Aggregate nutrition by time of day
export function aggregateNutritionByTimeOfDay(entries: GroupedFoodEntry[]) {
  const timeSlots = Object.keys(TIME_OF_DAY_MAPPINGS) as Array<keyof typeof TIME_OF_DAY_MAPPINGS>;
  
  return timeSlots.map(timeSlot => {
    const timeEntries = entries.filter(entry => entry.timeOfDay === timeSlot);
    const nutrition = calculateNutritionFromGroupedEntries(timeEntries);
    
    return {
      timeOfDay: timeSlot,
      label: TIME_OF_DAY_MAPPINGS[timeSlot].label,
      order: TIME_OF_DAY_MAPPINGS[timeSlot].order,
      color: TIME_OF_DAY_MAPPINGS[timeSlot].color,
      count: timeEntries.length,
      entries: timeEntries,
      ...nutrition
    };
  })
  .filter(timeSlot => timeSlot.count > 0) // Only return time slots with entries
  .sort((a, b) => a.order - b.order); // Sort by time order
}

// Get hourly nutrition distribution (for more granular analysis)
export function getHourlyNutritionDistribution(entries: GroupedFoodEntry[]) {
  const hourlyData: Record<number, {
    hour: number;
    label: string;
    entries: GroupedFoodEntry[];
    totalCalories: number;
    count: number;
  }> = {};

  // Initialize all 24 hours
  for (let hour = 0; hour < 24; hour++) {
    hourlyData[hour] = {
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
      entries: [],
      totalCalories: 0,
      count: 0
    };
  }

  // Group entries by hour (based on dateAdded time)
  entries.forEach(entry => {
    const hour = new Date(entry.dateAdded).getHours();
    hourlyData[hour].entries.push(entry);
    hourlyData[hour].totalCalories += entry.totalCalories;
    hourlyData[hour].count += 1;
  });

  return Object.values(hourlyData);
}

// Calculate meal timing insights
export function calculateMealTimingInsights(entries: GroupedFoodEntry[]) {
  const mealsByType = aggregateNutritionByMealType(entries);
  const mealsByTime = aggregateNutritionByTimeOfDay(entries);
  
  // Calculate meal frequency
  const totalMeals = mealsByType.reduce((sum, meal) => sum + meal.count, 0);
  
  // Find peak eating times
  const peakTimeSlot = mealsByTime.reduce((peak, current) => 
    current.totalCalories > peak.totalCalories ? current : peak,
    mealsByTime[0] || { totalCalories: 0, label: 'None' }
  );
  
  // Calculate calorie distribution
  const totalCalories = entries.reduce((sum, entry) => sum + entry.totalCalories, 0);
  const calorieDistribution = mealsByType.map(meal => ({
    ...meal,
    percentage: totalCalories > 0 ? (meal.totalCalories / totalCalories) * 100 : 0
  }));
  
  // Identify eating patterns
  const eatingPattern = identifyEatingPattern(mealsByType, mealsByTime);
  
  return {
    totalMeals,
    totalCalories,
    mealsByType,
    mealsByTime,
    calorieDistribution,
    peakTimeSlot,
    eatingPattern,
    insights: generateMealTimingInsights(mealsByType, mealsByTime, totalCalories)
  };
}

// Identify eating patterns based on meal timing
function identifyEatingPattern(
  mealsByType: ReturnType<typeof aggregateNutritionByMealType>,
  mealsByTime: ReturnType<typeof aggregateNutritionByTimeOfDay>
) {
  const breakfastMeals = mealsByType.find(m => m.mealType === 'breakfast')?.count || 0;
  const lunchMeals = mealsByType.find(m => m.mealType === 'lunch')?.count || 0;
  const dinnerMeals = mealsByType.find(m => m.mealType === 'dinner')?.count || 0;
  const snackMeals = mealsByType.find(m => m.mealType === 'snack')?.count || 0;
  
  const morningEating = mealsByTime.find(t => t.timeOfDay === 'morning')?.count || 0;
  const lateNightEating = mealsByTime.find(t => t.timeOfDay === 'late-night')?.count || 0;
  
  if (breakfastMeals >= 1 && lunchMeals >= 1 && dinnerMeals >= 1) {
    return {
      type: 'traditional',
      description: 'Traditional 3-meal pattern',
      score: 'good'
    };
  } else if (snackMeals > (breakfastMeals + lunchMeals + dinnerMeals)) {
    return {
      type: 'grazing',
      description: 'Frequent small meals/snacks',
      score: 'neutral'
    };
  } else if (lateNightEating > 0) {
    return {
      type: 'late-eating',
      description: 'Late night eating pattern',
      score: 'caution'
    };
  } else if (morningEating === 0) {
    return {
      type: 'skip-breakfast',
      description: 'Skipping breakfast pattern',
      score: 'caution'
    };
  } else {
    return {
      type: 'irregular',
      description: 'Irregular eating pattern',
      score: 'neutral'
    };
  }
}

// Generate actionable meal timing insights
function generateMealTimingInsights(
  mealsByType: ReturnType<typeof aggregateNutritionByMealType>,
  mealsByTime: ReturnType<typeof aggregateNutritionByTimeOfDay>,
  totalCalories: number
) {
  const insights: string[] = [];
  
  const breakfastCalories = mealsByType.find(m => m.mealType === 'breakfast')?.totalCalories || 0;
  const dinnerCalories = mealsByType.find(m => m.mealType === 'dinner')?.totalCalories || 0;
  const lateNightCalories = mealsByTime.find(t => t.timeOfDay === 'late-night')?.totalCalories || 0;
  
  // Breakfast insights
  if (breakfastCalories === 0) {
    insights.push("Consider adding breakfast to jumpstart your metabolism");
  } else if (breakfastCalories < totalCalories * 0.2) {
    insights.push("Try increasing breakfast calories to 20-25% of daily intake");
  }
  
  // Dinner timing insights
  if (dinnerCalories > totalCalories * 0.4) {
    insights.push("Consider reducing dinner portion and adding an earlier meal");
  }
  
  // Late night eating
  if (lateNightCalories > 0) {
    insights.push("Late night eating may affect sleep quality and digestion");
  }
  
  // Meal distribution
  const mealCount = mealsByType.filter(m => m.count > 0).length;
  if (mealCount < 3) {
    insights.push("Aim for 3 balanced meals per day for steady energy levels");
  }
  
  return insights;
}