// Cooking adjustments based on nutritional research
// Values represent multipliers for raw nutrition values

export interface CookingAdjustment {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  vitamins: number; // General vitamin retention
  minerals: number; // General mineral retention
}

export const COOKING_ADJUSTMENTS: { [key: string]: CookingAdjustment } = {
  raw: {
    calories: 1.0,
    protein: 1.0,
    carbs: 1.0,
    fat: 1.0,
    fiber: 1.0,
    vitamins: 1.0,
    minerals: 1.0
  },
  cooked: {
    calories: 1.0,
    protein: 1.0,
    carbs: 1.0,
    fat: 1.0,
    fiber: 0.9,
    vitamins: 0.85,
    minerals: 0.95
  },
  boiled: {
    calories: 1.0,
    protein: 0.95,
    carbs: 1.1, // Some starches become more available
    fat: 1.0,
    fiber: 0.8,
    vitamins: 0.7, // Water-soluble vitamins leach out
    minerals: 0.85
  },
  steamed: {
    calories: 1.0,
    protein: 0.98,
    carbs: 1.05,
    fat: 1.0,
    fiber: 0.9,
    vitamins: 0.9, // Better vitamin retention than boiling
    minerals: 0.95
  },
  fried: {
    calories: 1.3, // Oil absorption
    protein: 0.95,
    carbs: 1.0,
    fat: 1.5, // Added oils
    fiber: 0.85,
    vitamins: 0.8,
    minerals: 0.9
  },
  baked: {
    calories: 1.05,
    protein: 0.95,
    carbs: 1.0,
    fat: 1.0,
    fiber: 0.9,
    vitamins: 0.85,
    minerals: 0.95
  },
  grilled: {
    calories: 0.95, // Fat drips away
    protein: 0.9, // Some protein denaturation
    carbs: 1.0,
    fat: 0.85, // Fat loss from dripping
    fiber: 0.9,
    vitamins: 0.8,
    minerals: 0.9
  },
  roasted: {
    calories: 1.0,
    protein: 0.95,
    carbs: 1.0,
    fat: 0.9,
    fiber: 0.85,
    vitamins: 0.8,
    minerals: 0.9
  },
  'pan-fried': {
    calories: 1.25, // Similar to fried but slightly less oil
    protein: 0.95,
    carbs: 1.0,
    fat: 1.4,
    fiber: 0.85,
    vitamins: 0.8,
    minerals: 0.9
  },
  dried: {
    calories: 3.5, // Concentrated by water removal
    protein: 3.5,
    carbs: 3.5,
    fat: 3.5,
    fiber: 3.0,
    vitamins: 0.6, // Some vitamin loss
    minerals: 3.5
  },
  smoked: {
    calories: 1.1,
    protein: 0.95,
    carbs: 1.0,
    fat: 0.9,
    fiber: 0.9,
    vitamins: 0.7,
    minerals: 0.85
  },
  fermented: {
    calories: 1.0,
    protein: 1.0,
    carbs: 0.9, // Some carbs converted
    fat: 1.0,
    fiber: 0.9,
    vitamins: 1.1, // Some B vitamins increase
    minerals: 1.0
  },
  fresh: {
    calories: 1.0,
    protein: 1.0,
    carbs: 1.0,
    fat: 1.0,
    fiber: 1.0,
    vitamins: 1.0,
    minerals: 1.0
  },
  processed: {
    calories: 1.1,
    protein: 0.9,
    carbs: 1.0,
    fat: 1.1,
    fiber: 0.8,
    vitamins: 0.7,
    minerals: 0.8
  }
};

export function adjustNutritionForCooking(
  rawNutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber?: number;
    sugar?: number;
    sodium?: number;
  },
  cookingState: string
) {
  const adjustment = COOKING_ADJUSTMENTS[cookingState] || COOKING_ADJUSTMENTS.raw;
  
  return {
    calories: Math.round(rawNutrition.calories * adjustment.calories),
    protein: Math.round((rawNutrition.protein * adjustment.protein) * 10) / 10,
    carbs: Math.round((rawNutrition.carbs * adjustment.carbs) * 10) / 10,
    fat: Math.round((rawNutrition.fat * adjustment.fat) * 10) / 10,
    fiber: rawNutrition.fiber ? Math.round((rawNutrition.fiber * adjustment.fiber) * 10) / 10 : 0,
    sugar: rawNutrition.sugar || 0, // Sugar content typically doesn't change significantly
    sodium: rawNutrition.sodium || 0 // Sodium content typically doesn't change unless added
  };
}

export function getCookingStateDescription(cookingState: string): string {
  const descriptions: { [key: string]: string } = {
    raw: 'Raw, uncooked state',
    cooked: 'Generally cooked',
    boiled: 'Boiled in water',
    steamed: 'Steamed with water vapor',
    fried: 'Fried in oil/fat',
    'pan-fried': 'Pan-fried with minimal oil',
    baked: 'Baked in oven',
    grilled: 'Grilled over heat',
    roasted: 'Roasted in oven',
    dried: 'Dried or dehydrated',
    smoked: 'Smoked for preservation',
    fermented: 'Fermented or cultured',
    fresh: 'Fresh, ready to eat',
    processed: 'Commercially processed'
  };
  
  return descriptions[cookingState] || descriptions.raw;
}

export function getCookingStateIcon(cookingState: string): string {
  const icons: { [key: string]: string } = {
    raw: '🥗',
    cooked: '🍳',
    boiled: '🫕',
    steamed: '🥄',
    fried: '🍳',
    'pan-fried': '🍳',
    baked: '🔥',
    grilled: '🔥',
    roasted: '🔥',
    dried: '🌞',
    smoked: '💨',
    fermented: '🧄',
    fresh: '🌿',
    processed: '📦'
  };
  
  return icons[cookingState] || icons.raw;
}