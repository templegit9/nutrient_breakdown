/**
 * Smart Food Parser using Transformers.js
 * This uses a combination of a small LLM and pattern matching for accurate food extraction
 */


export interface SmartParsedFood {
  name: string;
  quantity?: number;
  unit?: string;
  cookingMethod?: string;
  confidence: number;
  originalText: string;
}

export interface SmartParseResult {
  foods: SmartParsedFood[];
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  originalText: string;
  processingMethod: 'llm' | 'hybrid' | 'fallback';
  needsClarification: boolean;
  suggestions?: string[];
}

/**
 * Smart Food Parser class
 */
export class SmartFoodParser {
  private pipeline: any = null;
  private isLoading = false;
  private isLoaded = false;

  /**
   * Initialize the Transformers.js pipeline (optional)
   */
  async initialize(): Promise<void> {
    if (this.isLoading || this.isLoaded) return;
    
    this.isLoading = true;
    
    try {
      // Only try to load transformers in development or when explicitly available
      if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
        const { pipeline } = await import('@xenova/transformers');
        
        // Use a lightweight text generation model for food extraction
        this.pipeline = await pipeline(
          'text-generation',
          'Xenova/distilgpt2',
          { 
            revision: 'main',
            quantized: true
          }
        );
        
        this.isLoaded = true;
        console.log('Smart food parser initialized with LLM support');
      } else {
        console.log('Smart food parser initialized in pattern-only mode (production)');
        this.isLoaded = false;
      }
    } catch (error) {
      console.warn('Transformers.js not available, using pattern-only parsing:', error);
      this.isLoaded = false;
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Parse food input using smart extraction
   */
  async parseFood(text: string): Promise<SmartParseResult> {
    // Always try pattern matching first (fast and reliable)
    const patternResult = this.parseWithPatterns(text);
    
    // If pattern matching gives good results, use it
    if (patternResult.foods.length > 0 && patternResult.foods.every(f => f.confidence > 0.7)) {
      return {
        ...patternResult,
        processingMethod: 'hybrid'
      };
    }

    // Try LLM enhancement if available
    if (this.isLoaded) {
      try {
        const llmResult = await this.enhanceWithLLM(text, patternResult);
        return {
          ...llmResult,
          processingMethod: 'llm'
        };
      } catch (error) {
        console.warn('LLM enhancement failed, using pattern result:', error);
      }
    }

    // Fall back to pattern result
    return {
      ...patternResult,
      processingMethod: 'fallback'
    };
  }

  /**
   * Pattern-based parsing (fast and reliable baseline)
   */
  private parseWithPatterns(text: string): SmartParseResult {
    const foods: SmartParsedFood[] = [];
    const normalizedText = text.toLowerCase().trim();

    // Enhanced pattern matching
    const foodPatterns = [
      // "2 slices of bread", "3 cups rice"
      /(\d+(?:\.\d+)?)\s+(slice|slices|cup|cups|piece|pieces|bowl|bowls|glass|glasses|plate|plates|serving|servings|portion|portions)\s+(?:of\s+)?([a-zA-Z\s]+)/g,
      // "200g chicken", "1.5 oz cheese" 
      /(\d+(?:\.\d+)?)\s*(g|gram|grams|kg|kilogram|kilograms|oz|ounce|ounces|lb|pound|pounds|ml|milliliter|milliliters|l|liter|liters)\s+(?:of\s+)?([a-zA-Z\s]+)/g,
      // "a banana", "an apple", "some rice"
      /(a|an|some|little|bit of)\s+([a-zA-Z\s]+)/g,
      // "grilled chicken", "baked potato"
      /(grilled|fried|baked|boiled|steamed|roasted|raw|fresh)\s+([a-zA-Z\s]+)/g,
      // Just food names without quantities
      /\b([a-zA-Z]{3,}(?:\s+[a-zA-Z]{3,})*)\b/g
    ];

    for (const pattern of foodPatterns) {
      const matches = Array.from(normalizedText.matchAll(pattern));
      
      for (const match of matches) {
        const food = this.extractFoodFromMatch(match, text);
        if (food && this.isValidFood(food.name)) {
          foods.push(food);
        }
      }
    }

    // Remove duplicates and merge similar foods
    const uniqueFoods = this.deduplicateFoods(foods);

    // Extract meal type
    const mealType = this.extractMealType(normalizedText);

    return {
      foods: uniqueFoods,
      mealType,
      originalText: text,
      processingMethod: 'hybrid',
      needsClarification: uniqueFoods.some(f => !f.quantity || !f.unit)
    };
  }

  /**
   * Extract food information from regex match
   */
  private extractFoodFromMatch(match: RegExpMatchArray, originalText: string): SmartParsedFood | null {
    if (match.length < 2) return null;

    let quantity: number | undefined;
    let unit: string | undefined;
    let name: string;
    let cookingMethod: string | undefined;

    // Parse based on match pattern
    if (match.length >= 4) {
      // Pattern with quantity, unit, and food name
      quantity = parseFloat(match[1]) || this.parseWordQuantity(match[1]);
      unit = this.normalizeUnit(match[2]);
      name = this.cleanFoodName(match[3]);
    } else if (match.length === 3) {
      // Pattern with cooking method or quantity word
      if (this.isCookingMethod(match[1])) {
        cookingMethod = match[1];
        name = this.cleanFoodName(match[2]);
      } else {
        quantity = this.parseWordQuantity(match[1]);
        name = this.cleanFoodName(match[2]);
      }
    } else {
      // Just food name
      name = this.cleanFoodName(match[1]);
    }

    if (!name || name.length < 2) return null;

    return {
      name,
      quantity,
      unit,
      cookingMethod,
      confidence: this.calculateConfidence(quantity, unit, name, cookingMethod),
      originalText: match[0]
    };
  }

  /**
   * Enhance parsing with LLM
   */
  private async enhanceWithLLM(text: string, patternResult: SmartParseResult): Promise<SmartParseResult> {
    if (!this.pipeline) return patternResult;

    try {
      // Create a structured prompt
      const prompt = `Extract food information from: "${text}"\n\nFood items with quantities and units:\n`;
      
      const result = await this.pipeline(prompt, {
        max_new_tokens: 100,
        temperature: 0.3,
        do_sample: true,
        return_full_text: false
      });

      // Parse the LLM response and merge with pattern results
      const llmFoods = this.parseLLMResponse(result[0].generated_text);
      
      // Merge and improve the results
      const enhancedFoods = this.mergeFoodResults(patternResult.foods, llmFoods);

      return {
        ...patternResult,
        foods: enhancedFoods,
        processingMethod: 'llm'
      };
    } catch (error) {
      console.warn('LLM enhancement failed:', error);
      return patternResult;
    }
  }

  /**
   * Parse LLM response to extract food information
   */
  private parseLLMResponse(response: string): SmartParsedFood[] {
    const foods: SmartParsedFood[] = [];
    const lines = response.split('\n');

    for (const line of lines) {
      const cleaned = line.trim();
      if (cleaned && !cleaned.startsWith('-') && !cleaned.startsWith('•')) {
        // Try to extract structured information from LLM response
        const food = this.parseStructuredLine(cleaned);
        if (food) foods.push(food);
      }
    }

    return foods;
  }

  /**
   * Parse a structured line from LLM response
   */
  private parseStructuredLine(line: string): SmartParsedFood | null {
    // Look for patterns like "2 slices bread" or "1 cup rice"
    const patterns = [
      /(\d+(?:\.\d+)?)\s+(\w+)\s+(.+)/,
      /(\w+)\s+(.+)/
    ];

    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        return this.extractFoodFromMatch(match, line);
      }
    }

    return null;
  }

  /**
   * Helper methods
   */
  private parseWordQuantity(word: string): number | undefined {
    const quantityMap: Record<string, number> = {
      'a': 1, 'an': 1, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
      'half': 0.5, 'quarter': 0.25, 'some': 1, 'little': 0.5
    };
    return quantityMap[word.toLowerCase()];
  }

  private normalizeUnit(unit: string): string {
    const unitMap: Record<string, string> = {
      'slice': 'slice', 'slices': 'slice',
      'cup': 'cup', 'cups': 'cup',
      'piece': 'piece', 'pieces': 'piece',
      'g': 'g', 'gram': 'g', 'grams': 'g',
      'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
      'oz': 'oz', 'ounce': 'oz', 'ounces': 'oz',
      'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
      'l': 'l', 'liter': 'l', 'liters': 'l'
    };
    return unitMap[unit.toLowerCase()] || unit;
  }

  private cleanFoodName(name: string): string {
    return name
      .replace(/^(of\s+|the\s+|some\s+)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isCookingMethod(word: string): boolean {
    const cookingMethods = ['grilled', 'fried', 'baked', 'boiled', 'steamed', 'roasted', 'raw', 'fresh'];
    return cookingMethods.includes(word.toLowerCase());
  }

  private isValidFood(name: string): boolean {
    // Filter out common non-food words
    const excludeWords = ['and', 'with', 'for', 'the', 'a', 'an', 'some', 'much', 'many', 'little'];
    return name.length > 2 && !excludeWords.includes(name.toLowerCase());
  }

  private calculateConfidence(quantity?: number, unit?: string, name?: string, cookingMethod?: string): number {
    let confidence = 0.4; // Base confidence
    if (quantity !== undefined) confidence += 0.2;
    if (unit) confidence += 0.2;
    if (name && name.length > 2) confidence += 0.15;
    if (cookingMethod) confidence += 0.05;
    return Math.min(confidence, 1.0);
  }

  private extractMealType(text: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' | undefined {
    if (text.includes('breakfast') || text.includes('morning')) return 'breakfast';
    if (text.includes('lunch') || text.includes('noon')) return 'lunch';
    if (text.includes('dinner') || text.includes('supper') || text.includes('evening')) return 'dinner';
    if (text.includes('snack') || text.includes('treat')) return 'snack';
    return undefined;
  }

  private deduplicateFoods(foods: SmartParsedFood[]): SmartParsedFood[] {
    const seen = new Map<string, SmartParsedFood>();
    
    for (const food of foods) {
      const key = food.name.toLowerCase();
      const existing = seen.get(key);
      
      if (!existing || food.confidence > existing.confidence) {
        seen.set(key, food);
      }
    }
    
    return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence);
  }

  private mergeFoodResults(patternFoods: SmartParsedFood[], llmFoods: SmartParsedFood[]): SmartParsedFood[] {
    // Simple merge strategy - use pattern results as base, enhance with LLM where missing
    const result = [...patternFoods];
    
    for (const llmFood of llmFoods) {
      const existing = result.find(f => f.name.toLowerCase() === llmFood.name.toLowerCase());
      if (!existing) {
        result.push(llmFood);
      } else if (!existing.quantity && llmFood.quantity) {
        existing.quantity = llmFood.quantity;
        existing.confidence = Math.max(existing.confidence, llmFood.confidence);
      }
    }
    
    return result;
  }
}

/**
 * Global parser instance
 */
let globalParser: SmartFoodParser | null = null;

/**
 * Get or create the global parser instance
 */
export async function getSmartParser(): Promise<SmartFoodParser> {
  if (!globalParser) {
    globalParser = new SmartFoodParser();
    await globalParser.initialize();
  }
  return globalParser;
}

/**
 * Main function to parse food input with smart extraction
 */
export async function parseSmartFood(text: string): Promise<SmartParseResult> {
  const parser = await getSmartParser();
  return parser.parseFood(text);
}

/**
 * Test the smart parser
 */
export async function testSmartParser() {
  const testInputs = [
    "I had 2 slices of bread and a cup of coffee",
    "ate grilled chicken with steamed broccoli", 
    "200g of rice and beans",
    "an apple and banana for breakfast",
    "some pasta for lunch"
  ];

  console.log('Testing Smart Food Parser:');
  
  for (const input of testInputs) {
    console.log(`\nInput: "${input}"`);
    const result = await parseSmartFood(input);
    console.log('Result:', result);
  }
}