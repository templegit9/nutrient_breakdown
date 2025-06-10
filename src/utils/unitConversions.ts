export interface UnitInfo {
  name: string;
  abbreviation: string;
  category: 'weight' | 'volume' | 'count' | 'length';
  baseUnit: string;
  conversionFactor: number;
  commonFor: string[];
}

export const units: Record<string, UnitInfo> = {
  // Weight units
  grams: {
    name: 'Grams',
    abbreviation: 'g',
    category: 'weight',
    baseUnit: 'grams',
    conversionFactor: 1,
    commonFor: ['vegetables', 'fruits', 'meat', 'grains', 'nuts']
  },
  ounces: {
    name: 'Ounces',
    abbreviation: 'oz',
    category: 'weight',
    baseUnit: 'grams',
    conversionFactor: 28.35,
    commonFor: ['meat', 'cheese', 'nuts']
  },
  pounds: {
    name: 'Pounds',
    abbreviation: 'lb',
    category: 'weight',
    baseUnit: 'grams',
    conversionFactor: 453.59,
    commonFor: ['meat', 'large portions']
  },
  kilograms: {
    name: 'Kilograms',
    abbreviation: 'kg',
    category: 'weight',
    baseUnit: 'grams',
    conversionFactor: 1000,
    commonFor: ['bulk items']
  },

  // Volume units
  milliliters: {
    name: 'Milliliters',
    abbreviation: 'ml',
    category: 'volume',
    baseUnit: 'milliliters',
    conversionFactor: 1,
    commonFor: ['liquids', 'sauces', 'oils']
  },
  liters: {
    name: 'Liters',
    abbreviation: 'L',
    category: 'volume',
    baseUnit: 'milliliters',
    conversionFactor: 1000,
    commonFor: ['beverages', 'milk']
  },
  cups: {
    name: 'Cups',
    abbreviation: 'cup',
    category: 'volume',
    baseUnit: 'milliliters',
    conversionFactor: 240,
    commonFor: ['grains', 'vegetables', 'fruits', 'liquids']
  },
  tablespoons: {
    name: 'Tablespoons',
    abbreviation: 'tbsp',
    category: 'volume',
    baseUnit: 'milliliters',
    conversionFactor: 15,
    commonFor: ['oils', 'sauces', 'condiments']
  },
  teaspoons: {
    name: 'Teaspoons',
    abbreviation: 'tsp',
    category: 'volume',
    baseUnit: 'milliliters',
    conversionFactor: 5,
    commonFor: ['spices', 'seasonings', 'small amounts']
  },
  fluidOunces: {
    name: 'Fluid Ounces',
    abbreviation: 'fl oz',
    category: 'volume',
    baseUnit: 'milliliters',
    conversionFactor: 29.57,
    commonFor: ['beverages', 'liquids']
  },

  // Count units
  pieces: {
    name: 'Pieces',
    abbreviation: 'pcs',
    category: 'count',
    baseUnit: 'pieces',
    conversionFactor: 1,
    commonFor: ['fruits', 'eggs', 'cookies', 'nuts']
  },
  slices: {
    name: 'Slices',
    abbreviation: 'slice',
    category: 'count',
    baseUnit: 'pieces',
    conversionFactor: 1,
    commonFor: ['bread', 'cheese', 'meat', 'pizza']
  },
  servings: {
    name: 'Servings',
    abbreviation: 'serving',
    category: 'count',
    baseUnit: 'pieces',
    conversionFactor: 1,
    commonFor: ['packaged foods', 'recipes']
  }
};

export const foodSpecificConversions: Record<string, Record<string, number>> = {
  // Specific food conversions (to grams)
  apple: {
    pieces: 182, // average medium apple
    slices: 15,
  },
  banana: {
    pieces: 118, // average medium banana
  },
  bread: {
    slices: 28, // average slice
  },
  egg: {
    pieces: 50, // average large egg
  },
  rice: {
    cups: 185, // cooked rice
  },
  pasta: {
    cups: 220, // cooked pasta
  },
  milk: {
    cups: 240,
    fluidOunces: 30,
  },
  cheese: {
    slices: 28,
    cups: 113, // shredded
  },
  chicken: {
    pieces: 85, // average serving
  },
  broccoli: {
    cups: 91, // chopped
  },
  spinach: {
    cups: 30, // fresh
  }
};

export function convertToBaseUnit(
  amount: number, 
  fromUnit: string, 
  foodName?: string
): { grams?: number; milliliters?: number; pieces?: number } {
  const unit = units[fromUnit];
  if (!unit) {
    console.warn(`Unknown unit: ${fromUnit}. Cannot perform conversion - this may result in incorrect nutrition calculations.`);
    throw new Error(`Unknown unit: ${fromUnit}. Please use a valid unit for accurate nutrition calculations.`);
  }

  // Check for food-specific conversions first
  if (foodName) {
    const normalizedFood = foodName.toLowerCase();
    // Sort food keys by length (longest first) to prefer more specific matches
    const sortedFoodKeys = Object.keys(foodSpecificConversions).sort((a, b) => b.length - a.length);
    const foodConversions = sortedFoodKeys.find(food => {
      // Use word boundary regex to ensure we match whole words only
      const regex = new RegExp('\\b' + food.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
      return regex.test(normalizedFood);
    });
    
    if (foodConversions && foodSpecificConversions[foodConversions][fromUnit]) {
      const conversionFactor = foodSpecificConversions[foodConversions][fromUnit];
      return { grams: amount * conversionFactor };
    }
  }

  // Use standard conversions
  switch (unit.category) {
    case 'weight':
      return { grams: amount * unit.conversionFactor };
    case 'volume':
      return { milliliters: amount * unit.conversionFactor };
    case 'count':
      return { pieces: amount * unit.conversionFactor };
    default:
      return { grams: amount };
  }
}

/**
 * Validates if a unit is supported for conversion
 */
export function validateUnit(unitName: string): boolean {
  return unitName in units;
}

/**
 * Safe unit conversion with validation
 */
export function safeConvertToBaseUnit(amount: number, fromUnit: string, foodName?: string): { grams?: number; milliliters?: number; pieces?: number; isValid: boolean } {
  try {
    const result = convertToBaseUnit(amount, fromUnit, foodName);
    return { ...result, isValid: true };
  } catch (error) {
    console.error('Unit conversion failed:', error);
    return { grams: amount, isValid: false }; // fallback to assuming grams
  }
}

export function getUnitsForFood(foodName: string): string[] {
  const normalizedFood = foodName.toLowerCase();
  
  // Get food-specific units
  // Sort food keys by length (longest first) to prefer more specific matches
  const sortedFoodKeys = Object.keys(foodSpecificConversions).sort((a, b) => b.length - a.length);
  const foodSpecificUnits = sortedFoodKeys.find(food => {
    // Use word boundary regex to ensure we match whole words only
    const regex = new RegExp('\\b' + food.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return regex.test(normalizedFood);
  });
  
  let recommendedUnits: string[] = [];
  
  if (foodSpecificUnits) {
    recommendedUnits = Object.keys(foodSpecificConversions[foodSpecificUnits]);
  }
  
  // Add common units based on food type
  const commonUnits = ['grams', 'ounces'];
  
  // Helper function to check for word boundary matches
  const containsWord = (text: string, word: string): boolean => {
    const regex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return regex.test(text);
  };
  
  if (containsWord(normalizedFood, 'liquid') || containsWord(normalizedFood, 'milk') || 
      containsWord(normalizedFood, 'juice') || containsWord(normalizedFood, 'water')) {
    commonUnits.push('cups', 'milliliters', 'fluidOunces');
  }
  
  if (containsWord(normalizedFood, 'fruit') || containsWord(normalizedFood, 'apple') || 
      containsWord(normalizedFood, 'banana') || containsWord(normalizedFood, 'egg')) {
    commonUnits.push('pieces');
  }
  
  if (containsWord(normalizedFood, 'bread') || containsWord(normalizedFood, 'cheese') || 
      containsWord(normalizedFood, 'meat')) {
    commonUnits.push('slices');
  }
  
  if (containsWord(normalizedFood, 'rice') || containsWord(normalizedFood, 'pasta') || 
      containsWord(normalizedFood, 'cereal')) {
    commonUnits.push('cups');
  }
  
  if (containsWord(normalizedFood, 'oil') || containsWord(normalizedFood, 'sauce') || 
      containsWord(normalizedFood, 'dressing')) {
    commonUnits.push('tablespoons', 'teaspoons');
  }
  
  // Combine and remove duplicates
  const allUnits = [...new Set([...recommendedUnits, ...commonUnits])];
  
  // Sort by relevance
  const unitOrder = ['pieces', 'slices', 'cups', 'grams', 'ounces', 'tablespoons', 'teaspoons', 'milliliters'];
  return allUnits.sort((a, b) => {
    const aIndex = unitOrder.indexOf(a);
    const bIndex = unitOrder.indexOf(b);
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });
}

export function getPortionSuggestions(foodName: string): Array<{unit: string, amount: number, description: string}> {
  const normalizedFood = foodName.toLowerCase();
  
  const suggestions: Array<{unit: string, amount: number, description: string}> = [];
  
  // Helper function to check for word boundary matches
  const containsWord = (text: string, word: string): boolean => {
    const regex = new RegExp('\\b' + word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'i');
    return regex.test(text);
  };
  
  // Common portion suggestions based on food type
  if (containsWord(normalizedFood, 'apple')) {
    suggestions.push(
      { unit: 'pieces', amount: 1, description: 'Medium apple' },
      { unit: 'slices', amount: 8, description: 'Sliced apple' },
      { unit: 'grams', amount: 182, description: 'Medium apple' }
    );
  } else if (containsWord(normalizedFood, 'banana')) {
    suggestions.push(
      { unit: 'pieces', amount: 1, description: 'Medium banana' },
      { unit: 'grams', amount: 118, description: 'Medium banana' }
    );
  } else if (containsWord(normalizedFood, 'bread')) {
    suggestions.push(
      { unit: 'slices', amount: 1, description: 'Single slice' },
      { unit: 'slices', amount: 2, description: 'Sandwich serving' },
      { unit: 'grams', amount: 28, description: 'Single slice' }
    );
  } else if (containsWord(normalizedFood, 'rice')) {
    suggestions.push(
      { unit: 'cups', amount: 0.5, description: 'Side portion' },
      { unit: 'cups', amount: 1, description: 'Main portion' },
      { unit: 'grams', amount: 185, description: '1 cup cooked' }
    );
  } else if (containsWord(normalizedFood, 'chicken')) {
    suggestions.push(
      { unit: 'ounces', amount: 3, description: 'Small serving' },
      { unit: 'ounces', amount: 6, description: 'Large serving' },
      { unit: 'grams', amount: 85, description: 'Standard serving' }
    );
  }
  
  // Default suggestions for any food
  if (suggestions.length === 0) {
    suggestions.push(
      { unit: 'grams', amount: 100, description: 'Standard portion' },
      { unit: 'ounces', amount: 3.5, description: 'Standard portion' }
    );
  }
  
  return suggestions;
}