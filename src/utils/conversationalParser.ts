export interface ParsedFood {
  rawText: string;
  foodName: string;
  quantity?: number;
  unit?: string;
  cookingMethod?: string;
  confidence: number; // 0-1 score of parsing confidence
  alternatives?: string[]; // Alternative interpretations
}

export interface ParsedMessage {
  originalText: string;
  foods: ParsedFood[];
  mealContext?: string; // breakfast, lunch, dinner, snack
  timeContext?: string; // this morning, yesterday, etc.
  confidence: number;
  needsClarification: boolean;
  clarificationPrompts?: string[];
}

// Common quantity words and their numeric equivalents
const quantityMap: Record<string, number> = {
  'a': 1, 'an': 1, 'one': 1, 'single': 1,
  'two': 2, 'three': 3, 'four': 4, 'five': 5,
  'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
  'couple': 2, 'few': 3, 'several': 4, 'many': 6,
  'half': 0.5, 'quarter': 0.25, 'third': 0.33
};

// Common units and their variations
const unitMap: Record<string, string> = {
  // Weight
  'g': 'g', 'gram': 'g', 'grams': 'g', 'gr': 'g',
  'kg': 'kg', 'kilo': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
  'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz',
  'lb': 'lb', 'lbs': 'lb', 'pound': 'lb', 'pounds': 'lb',
  
  // Volume
  'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
  'l': 'l', 'liter': 'l', 'liters': 'l', 'litre': 'l', 'litres': 'l',
  'cup': 'cup', 'cups': 'cup',
  'tsp': 'tsp', 'teaspoon': 'tsp', 'teaspoons': 'tsp',
  'tbsp': 'tbsp', 'tablespoon': 'tbsp', 'tablespoons': 'tbsp',
  'glass': 'glass', 'glasses': 'glass',
  
  // Count
  'piece': 'piece', 'pieces': 'piece', 'pc': 'piece',
  'slice': 'slice', 'slices': 'slice',
  'serving': 'serving', 'servings': 'serving',
  'portion': 'portion', 'portions': 'portion',
  'bowl': 'bowl', 'bowls': 'bowl',
  'plate': 'plate', 'plates': 'plate'
};

// Cooking methods
const cookingMethods = [
  'raw', 'fresh', 'cooked', 'boiled', 'steamed', 'fried', 'baked', 'grilled', 
  'roasted', 'pan-fried', 'deep-fried', 'sautéed', 'broiled', 'smoked', 
  'dried', 'pickled', 'fermented', 'toasted', 'microwaved'
];

// Meal context keywords
const mealContextMap: Record<string, string> = {
  'breakfast': 'breakfast', 'morning': 'breakfast', 'brunch': 'breakfast',
  'lunch': 'lunch', 'noon': 'lunch', 'afternoon': 'lunch',
  'dinner': 'dinner', 'supper': 'dinner', 'evening': 'dinner',
  'snack': 'snack', 'treat': 'snack', 'dessert': 'snack'
};

/**
 * Main function to parse natural language food descriptions
 * Now uses SLM as primary parsing method with fallback to pattern matching
 */
export async function parseConversationalInput(text: string): Promise<ParsedMessage> {
  const normalizedText = text.toLowerCase().trim();
  
  // Try SLM parsing first
  try {
    const { parseSmartFood } = await import('./smartFoodParser');
    const smartResult = await parseSmartFood(text);
    
    if (smartResult.foods.length > 0 && smartResult.foods.some(f => f.confidence > 0.6)) {
      // Convert SmartParsedFood to ParsedFood format
      const convertedFoods: ParsedFood[] = smartResult.foods.map(smartFood => ({
        rawText: smartFood.originalText || text,
        foodName: smartFood.food,
        quantity: smartFood.quantity,
        unit: smartFood.unit,
        cookingMethod: smartFood.cookingMethod,
        confidence: smartFood.confidence
      }));
      
      const confidence = convertedFoods.reduce((sum, food) => sum + food.confidence, 0) / convertedFoods.length;
      
      return {
        originalText: text,
        foods: convertedFoods,
        mealContext: smartResult.mealType,
        confidence,
        needsClarification: smartResult.needsClarification,
        clarificationPrompts: smartResult.suggestions || generateClarificationPrompts(convertedFoods)
      };
    }
  } catch (error) {
    console.warn('SLM parsing failed, falling back to pattern matching:', error);
  }
  
  // Fallback to original pattern-based parsing
  const mealContext = extractMealContext(normalizedText);
  const foodSegments = segmentFoodItems(normalizedText);
  const foods = foodSegments.map(segment => parseFoodSegment(segment));
  
  const confidence = foods.length > 0 
    ? foods.reduce((sum, food) => sum + food.confidence, 0) / foods.length 
    : 0;
  
  const needsClarification = confidence < 0.7 || foods.some(food => !food.quantity || !food.unit);
  const clarificationPrompts = generateClarificationPrompts(foods);
  
  return {
    originalText: text,
    foods,
    mealContext,
    confidence,
    needsClarification,
    clarificationPrompts: clarificationPrompts.length > 0 ? clarificationPrompts : undefined
  };
}

/**
 * Extract meal context from text
 */
function extractMealContext(text: string): string | undefined {
  for (const [keyword, context] of Object.entries(mealContextMap)) {
    if (text.includes(keyword)) {
      return context;
    }
  }
  return undefined;
}

/**
 * Split text into individual food item segments
 */
function segmentFoodItems(text: string): string[] {
  // Remove common meal context phrases
  let cleanText = text
    .replace(/for (breakfast|lunch|dinner|snack)/g, '')
    .replace(/this (morning|afternoon|evening)/g, '')
    .replace(/i (had|ate|drank|consumed)/g, '')
    .replace(/^(had|ate|drank|consumed)\s+/g, '')
    .trim();
  
  // Split on common separators
  const segments = cleanText
    .split(/\s+and\s+|\s*,\s*|\s+with\s+|\s*\+\s*/)
    .filter(segment => segment.trim().length > 0);
  
  return segments;
}

/**
 * Parse an individual food segment
 */
function parseFoodSegment(segment: string): ParsedFood {
  const originalSegment = segment;
  
  // Extract cooking method
  const cookingMethod = extractCookingMethod(segment);
  if (cookingMethod) {
    segment = segment.replace(new RegExp(`\\b${cookingMethod}\\b`, 'g'), '').trim();
  }
  
  // Extract quantity and unit
  const { quantity, unit, remainingText } = extractQuantityAndUnit(segment);
  
  // The remaining text should be the food name
  const foodName = cleanFoodName(remainingText);
  
  // Calculate confidence based on what we found
  let confidence = 0.5; // Base confidence
  if (quantity !== undefined) confidence += 0.2;
  if (unit) confidence += 0.2;
  if (foodName.length > 2) confidence += 0.1;
  
  return {
    rawText: originalSegment,
    foodName,
    quantity,
    unit,
    cookingMethod,
    confidence: Math.min(confidence, 1.0)
  };
}

/**
 * Extract cooking method from text
 */
function extractCookingMethod(text: string): string | undefined {
  for (const method of cookingMethods) {
    if (text.includes(method)) {
      return method;
    }
  }
  return undefined;
}

/**
 * Extract quantity and unit from text
 */
function extractQuantityAndUnit(text: string): { 
  quantity?: number; 
  unit?: string; 
  remainingText: string; 
} {
  // Pattern to match number + unit combinations
  const patterns = [
    // "2 cups", "1.5 oz", "3.5g"
    /(\d+(?:\.\d+)?)\s*([a-z]+)/g,
    // "two slices", "a cup"
    /\b(a|an|one|two|three|four|five|six|seven|eight|nine|ten|half|quarter|couple|few|several|many)\s+([a-z]+)/g
  ];
  
  let quantity: number | undefined;
  let unit: string | undefined;
  let remainingText = text;
  
  for (const pattern of patterns) {
    const matches = Array.from(text.matchAll(pattern));
    
    for (const match of matches) {
      const [fullMatch, quantityStr, unitStr] = match;
      
      // Parse quantity
      const parsedQuantity = parseFloat(quantityStr) || quantityMap[quantityStr.toLowerCase()];
      
      // Normalize unit
      const normalizedUnit = unitMap[unitStr.toLowerCase()];
      
      if (parsedQuantity && normalizedUnit) {
        quantity = parsedQuantity;
        unit = normalizedUnit;
        remainingText = remainingText.replace(fullMatch, '').trim();
        break;
      }
    }
    
    if (quantity && unit) break;
  }
  
  return { quantity, unit, remainingText };
}

/**
 * Clean and normalize food name
 */
function cleanFoodName(text: string): string {
  return text
    .replace(/^(of\s+|the\s+)/g, '') // Remove "of" and "the" prefixes
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Generate clarification prompts for ambiguous inputs
 */
function generateClarificationPrompts(foods: ParsedFood[]): string[] {
  const prompts: string[] = [];
  
  foods.forEach((food, index) => {
    if (!food.quantity) {
      prompts.push(`How much ${food.foodName} did you have?`);
    }
    if (!food.unit && food.quantity) {
      prompts.push(`What unit for the ${food.quantity} ${food.foodName}? (grams, cups, pieces, etc.)`);
    }
    if (food.confidence < 0.6) {
      prompts.push(`Could you clarify "${food.rawText}"? I'm not sure I understood correctly.`);
    }
  });
  
  return prompts;
}

/**
 * Helper function to test the parser with example inputs
 */
export function testParser() {
  const testCases = [
    "I had 2 slices of bread and a cup of coffee",
    "ate an apple and banana for breakfast",
    "grilled chicken breast with steamed broccoli",
    "200ml of milk",
    "3 eggs and 2 pieces of toast",
    "had some rice for lunch"
  ];
  
  console.log('Testing conversational parser:');
  testCases.forEach(test => {
    console.log(`\nInput: "${test}"`);
    console.log('Result:', parseConversationalInput(test));
  });
}