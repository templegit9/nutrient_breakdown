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
    // Water-soluble vitamins
    vitamin_c?: number;
    thiamin?: number;
    riboflavin?: number;
    niacin?: number;
    pantothenic_acid?: number;
    vitamin_b6?: number;
    biotin?: number;
    folate?: number;
    vitamin_b12?: number;
    choline?: number;
    // Fat-soluble vitamins (minimal change)
    vitamin_a?: number;
    vitamin_d?: number;
    vitamin_e?: number;
    vitamin_k?: number;
  },
  cookingState: string
) {
  const adjustment = COOKING_ADJUSTMENTS[cookingState] || COOKING_ADJUSTMENTS.raw;
  
  // Water-soluble vitamin retention factors based on cooking method
  const waterSolubleVitaminRetention = getWaterSolubleVitaminRetention(cookingState);
  const fatSolubleVitaminRetention = getFatSolubleVitaminRetention(cookingState);
  
  return {
    calories: Math.round(rawNutrition.calories * adjustment.calories),
    protein: Math.round((rawNutrition.protein * adjustment.protein) * 10) / 10,
    carbs: Math.round((rawNutrition.carbs * adjustment.carbs) * 10) / 10,
    fat: Math.round((rawNutrition.fat * adjustment.fat) * 10) / 10,
    fiber: rawNutrition.fiber ? Math.round((rawNutrition.fiber * adjustment.fiber) * 10) / 10 : 0,
    sugar: rawNutrition.sugar || 0, // Sugar content typically doesn't change significantly
    sodium: rawNutrition.sodium || 0, // Sodium content typically doesn't change unless added
    
    // Water-soluble vitamins (apply cooking retention factors)
    vitamin_c: rawNutrition.vitamin_c ? Math.round((rawNutrition.vitamin_c * waterSolubleVitaminRetention.vitamin_c) * 100) / 100 : 0,
    thiamin: rawNutrition.thiamin ? Math.round((rawNutrition.thiamin * waterSolubleVitaminRetention.b_vitamins) * 1000) / 1000 : 0,
    riboflavin: rawNutrition.riboflavin ? Math.round((rawNutrition.riboflavin * waterSolubleVitaminRetention.b_vitamins) * 1000) / 1000 : 0,
    niacin: rawNutrition.niacin ? Math.round((rawNutrition.niacin * waterSolubleVitaminRetention.b_vitamins) * 100) / 100 : 0,
    pantothenic_acid: rawNutrition.pantothenic_acid ? Math.round((rawNutrition.pantothenic_acid * waterSolubleVitaminRetention.b_vitamins) * 100) / 100 : 0,
    vitamin_b6: rawNutrition.vitamin_b6 ? Math.round((rawNutrition.vitamin_b6 * waterSolubleVitaminRetention.b_vitamins) * 100) / 100 : 0,
    biotin: rawNutrition.biotin ? Math.round((rawNutrition.biotin * waterSolubleVitaminRetention.b_vitamins) * 100) / 100 : 0,
    folate: rawNutrition.folate ? Math.round((rawNutrition.folate * waterSolubleVitaminRetention.folate) * 100) / 100 : 0,
    vitamin_b12: rawNutrition.vitamin_b12 ? Math.round((rawNutrition.vitamin_b12 * waterSolubleVitaminRetention.b_vitamins) * 100) / 100 : 0,
    choline: rawNutrition.choline ? Math.round((rawNutrition.choline * waterSolubleVitaminRetention.choline) * 100) / 100 : 0,
    
    // Fat-soluble vitamins (minimal changes)
    vitamin_a: rawNutrition.vitamin_a ? Math.round((rawNutrition.vitamin_a * fatSolubleVitaminRetention.vitamin_a) * 10) / 10 : 0,
    vitamin_d: rawNutrition.vitamin_d ? Math.round((rawNutrition.vitamin_d * fatSolubleVitaminRetention.vitamin_d) * 10) / 10 : 0,
    vitamin_e: rawNutrition.vitamin_e ? Math.round((rawNutrition.vitamin_e * fatSolubleVitaminRetention.vitamin_e) * 100) / 100 : 0,
    vitamin_k: rawNutrition.vitamin_k ? Math.round((rawNutrition.vitamin_k * fatSolubleVitaminRetention.vitamin_k) * 100) / 100 : 0,
  };
}

// Research-based vitamin retention factors for different cooking methods
function getWaterSolubleVitaminRetention(cookingState: string): {
  vitamin_c: number;
  b_vitamins: number;
  folate: number;
  choline: number;
} {
  const retentionFactors: { [key: string]: { vitamin_c: number; b_vitamins: number; folate: number; choline: number } } = {
    raw: { vitamin_c: 1.0, b_vitamins: 1.0, folate: 1.0, choline: 1.0 },
    steamed: { vitamin_c: 0.85, b_vitamins: 0.90, folate: 0.75, choline: 0.95 }, // Steaming preserves most vitamins
    boiled: { vitamin_c: 0.50, b_vitamins: 0.60, folate: 0.50, choline: 0.80 }, // Boiling causes significant loss
    sauteed: { vitamin_c: 0.75, b_vitamins: 0.85, folate: 0.70, choline: 0.90 }, // Quick cooking preserves more
    roasted: { vitamin_c: 0.70, b_vitamins: 0.80, folate: 0.65, choline: 0.85 }, // Dry heat
    baked: { vitamin_c: 0.70, b_vitamins: 0.80, folate: 0.65, choline: 0.85 }, // Similar to roasting
    grilled: { vitamin_c: 0.65, b_vitamins: 0.75, folate: 0.60, choline: 0.80 }, // High heat
    fried: { vitamin_c: 0.60, b_vitamins: 0.70, folate: 0.55, choline: 0.75 }, // High heat + oil
    microwaved: { vitamin_c: 0.80, b_vitamins: 0.85, folate: 0.75, choline: 0.90 }, // Quick cooking
  };
  
  return retentionFactors[cookingState] || retentionFactors.raw;
}

function getFatSolubleVitaminRetention(cookingState: string): {
  vitamin_a: number;
  vitamin_d: number;
  vitamin_e: number;
  vitamin_k: number;
} {
  const retentionFactors: { [key: string]: { vitamin_a: number; vitamin_d: number; vitamin_e: number; vitamin_k: number } } = {
    raw: { vitamin_a: 1.0, vitamin_d: 1.0, vitamin_e: 1.0, vitamin_k: 1.0 },
    steamed: { vitamin_a: 0.95, vitamin_d: 1.0, vitamin_e: 0.90, vitamin_k: 0.85 },
    boiled: { vitamin_a: 0.90, vitamin_d: 1.0, vitamin_e: 0.85, vitamin_k: 0.70 }, // K vitamins can leach
    sauteed: { vitamin_a: 1.05, vitamin_d: 1.0, vitamin_e: 0.95, vitamin_k: 0.90 }, // Fat improves absorption
    roasted: { vitamin_a: 0.95, vitamin_d: 1.0, vitamin_e: 0.90, vitamin_k: 0.85 },
    baked: { vitamin_a: 0.95, vitamin_d: 1.0, vitamin_e: 0.90, vitamin_k: 0.85 },
    grilled: { vitamin_a: 0.90, vitamin_d: 1.0, vitamin_e: 0.85, vitamin_k: 0.80 },
    fried: { vitamin_a: 1.05, vitamin_d: 1.0, vitamin_e: 0.95, vitamin_k: 0.90 }, // Fat improves absorption
    microwaved: { vitamin_a: 0.95, vitamin_d: 1.0, vitamin_e: 0.92, vitamin_k: 0.88 },
  };
  
  return retentionFactors[cookingState] || retentionFactors.raw;
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