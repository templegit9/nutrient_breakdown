/**
 * LLM Food Brain - Central intelligence for food processing
 * Uses Google Gemini API for cost-effective food nutrition analysis
 * Takes natural language input and returns structured food data with nutrition
 */

import type { FoodItem, GroupedFoodEntry } from '../types/food';

// Re-export types for backwards compatibility
export type { FoodItem, GroupedFoodEntry };

export interface LLMResponse {
  success: boolean;
  groupedEntry?: GroupedFoodEntry;
  error?: string;
  csvData?: string;
}

// Medical nutrition guidelines for health condition-specific analysis
const MEDICAL_NUTRITION_GUIDELINES = {
  pcos: {
    focus: ['anti-inflammatory foods', 'low glycemic index', 'omega-3 fatty acids', 'high fiber'],
    avoid: ['refined sugars', 'processed foods', 'trans fats', 'high glycemic foods'],
    micronutrients: ['inositol', 'vitamin D', 'chromium', 'omega-3', 'magnesium'],
    targets: 'Glycemic load <10 per meal, Omega-3 >1g daily, Fiber >25g daily'
  },
  type2_diabetes: {
    focus: ['precise carbohydrate counting', 'low glycemic load', 'high fiber', 'lean proteins'],
    avoid: ['simple sugars', 'refined carbohydrates', 'sugary beverages'],
    micronutrients: ['chromium', 'magnesium', 'alpha-lipoic acid', 'vitamin D'],
    targets: 'Carbs 45-65% total calories, Fiber >25g daily, Sodium <2300mg'
  },
  hypertension: {
    focus: ['DASH diet principles', 'potassium-rich foods', 'low sodium', 'magnesium-rich foods'],
    avoid: ['high sodium foods', 'processed meats', 'canned foods with salt'],
    micronutrients: ['potassium', 'magnesium', 'calcium', 'omega-3'],
    targets: 'Sodium <2300mg daily, Potassium >3500mg daily'
  },
  osteoporosis: {
    focus: ['calcium-rich foods', 'vitamin D sources', 'protein for bone health'],
    avoid: ['excessive caffeine', 'high sodium', 'alcohol'],
    micronutrients: ['calcium', 'vitamin D', 'magnesium', 'vitamin K'],
    targets: 'Calcium >1000mg daily, Vitamin D >800 IU daily'
  },
  hypothyroidism: {
    focus: ['iodine-rich foods', 'selenium sources', 'iron-rich foods'],
    avoid: ['goitrogens in excess', 'soy if interfering with medication'],
    micronutrients: ['iodine', 'selenium', 'zinc', 'iron'],
    targets: 'Iodine 150mcg daily, Selenium 55mcg daily'
  },
  fertility: {
    focus: ['folate-rich foods', 'antioxidant foods', 'healthy fats', 'iron sources'],
    avoid: ['trans fats', 'excessive caffeine', 'alcohol'],
    micronutrients: ['folate', 'iron', 'zinc', 'omega-3', 'vitamin E'],
    targets: 'Folate >400mcg daily, Iron >18mg daily'
  }
} as const;

export class LLMFoodBrain {
  private readonly API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  private readonly API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

  constructor() {
    if (!this.API_KEY) {
      console.warn('Gemini API key not found. LLM Food Brain will not function.');
      console.warn('Get your free API key at: https://aistudio.google.com/app/apikey');
    }
  }

  /**
   * Main function to process food input using LLM with optional health condition context
   */
  async processFoodInput(input: string, timeOfDay?: string, healthConditions?: string[]): Promise<LLMResponse> {
    try {
      const prompt = this.createNutritionPrompt(input, healthConditions);
      const response = await this.callLLMAPI(prompt);
      
      if (response.success && response.data) {
        const parsedData = this.parseLLMResponse(response.data, input, timeOfDay);
        return parsedData;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to process food input'
        };
      }
    } catch (error) {
      console.error('LLM Food Brain error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate medical context and guidelines based on user's health conditions
   */
  private generateMedicalContext(healthConditions?: string[]): string {
    if (!healthConditions || healthConditions.length === 0) {
      return 'MEDICAL CONTEXT: General population nutrition analysis with clinical accuracy.';
    }

    const medicalGuidelines: string[] = [];
    
    healthConditions.forEach(conditionId => {
      const guidelines = MEDICAL_NUTRITION_GUIDELINES[conditionId as keyof typeof MEDICAL_NUTRITION_GUIDELINES];
      if (guidelines) {
        medicalGuidelines.push(
          `${conditionId.toUpperCase().replace('_', ' ')}:
- Focus areas: ${guidelines.focus.join(', ')}
- Avoid/limit: ${guidelines.avoid.join(', ')}
- Key micronutrients: ${guidelines.micronutrients.join(', ')}
- Clinical targets: ${guidelines.targets}`
        );
      }
    });

    if (medicalGuidelines.length === 0) {
      return 'MEDICAL CONTEXT: General population nutrition analysis with clinical accuracy.';
    }

    return `PATIENT HEALTH CONDITIONS: ${healthConditions.join(', ')}

MEDICAL NUTRITION THERAPY GUIDELINES:
${medicalGuidelines.join('\n\n')}

CLINICAL CONSIDERATIONS:
- Prioritize accuracy for medical tracking and condition management
- Consider nutrient-drug interactions if applicable
- Account for bioavailability and absorption factors
- Include glycemic impact assessment for metabolic conditions
- Note anti-inflammatory vs pro-inflammatory food properties`;
  }

  private createNutritionPrompt(input: string, healthConditions?: string[]): string {
    // Generate medical context based on health conditions
    const medicalContext = this.generateMedicalContext(healthConditions);
    
    return `You are a board-certified nutritionist with clinical experience in medical nutrition therapy.

${medicalContext}

INPUT: "${input}"

TASK: Break down into individual food items with complete nutrition data per item, considering medical dietary requirements.

REQUIRED JSON FORMAT:
{
  "combinedName": "Short descriptive name for the meal",
  "individualItems": [
    {
      "name": "food_name",
      "quantity": number,
      "unit": "unit",
      "calories": number,
      "protein": number,
      "carbohydrates": number, 
      "fat": number,
      "fiber": number,
      "sugar": number,
      "sodium": number,
      "calcium": number,
      "iron": number,
      "vitamin_c": number,
      "vitamin_d": number,
      "potassium": number
    }
  ]
}

MEDICAL ACCURACY REQUIREMENTS:
- Use USDA Food Data Central values (gold standard for clinical nutrition)
- Account for food preparation effects on bioavailability
- Consider nutrient interactions affecting absorption
- Include bioavailable forms of nutrients (e.g., heme vs non-heme iron)
- Flag potential food-drug interactions if relevant
- Consider glycemic impact for diabetes management
- Account for sodium content for hypertension management
- Include anti-inflammatory properties for chronic conditions

NUTRITION CALCULATION RULES:
- Calculate nutrition per actual quantity specified with clinical precision
- All values in grams except: calories (kcal), sodium/potassium (mg), vitamin_c/vitamin_d (mg)
- Be precise with quantities for medical tracking accuracy
- Include all micronutrients listed above
- Consider cooking methods' impact on nutrition (e.g., steaming vs frying)

EXAMPLES:
Input: "4 slices of bread and scrambled eggs (3 eggs)"
Output: {
  "combinedName": "Bread and Scrambled Eggs",
  "individualItems": [
    {
      "name": "bread",
      "quantity": 4,
      "unit": "slice",
      "calories": 320,
      "protein": 12,
      "carbohydrates": 64,
      "fat": 4,
      "fiber": 8,
      "sugar": 8,
      "sodium": 480,
      "calcium": 160,
      "iron": 4.8,
      "vitamin_c": 0,
      "vitamin_d": 0,
      "potassium": 240
    },
    {
      "name": "scrambled eggs",
      "quantity": 3,
      "unit": "large",
      "calories": 210,
      "protein": 18,
      "carbohydrates": 2,
      "fat": 15,
      "fiber": 0,
      "sugar": 1,
      "sodium": 180,
      "calcium": 84,
      "iron": 2.1,
      "vitamin_c": 0,
      "vitamin_d": 2.2,
      "potassium": 207
    }
  ]
}

RESPOND WITH JSON ONLY:`;
  }

  private async callLLMAPI(prompt: string): Promise<{success: boolean, data?: string, error?: string}> {
    try {
      const response = await fetch(`${this.API_URL}?key=${this.API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a precise nutrition calculator. Always respond with valid JSON only.\n\n${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.1, // Low temperature for consistent results
            maxOutputTokens: 2000,
            topP: 0.8,
            topK: 10
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}${errorData.error?.message ? ` - ${errorData.error.message}` : ''}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
        return {
          success: true,
          data: data.candidates[0].content.parts[0].text
        };
      } else {
        return {
          success: false,
          error: 'Invalid Gemini API response format'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Gemini API call failed'
      };
    }
  }

  private parseLLMResponse(responseText: string, originalInput: string, timeOfDay?: string): LLMResponse {
    try {
      // Clean and extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      if (!parsed.individualItems || !Array.isArray(parsed.individualItems)) {
        throw new Error('Invalid response format - missing individualItems');
      }

      // Calculate total nutrition
      const totalNutrients = this.calculateTotalNutrients(parsed.individualItems);
      const totalCalories = parsed.individualItems.reduce((sum: number, item: any) => sum + (item.calories || 0), 0);

      // Generate CSV data
      const csvData = this.generateCSV(parsed.individualItems);

      const groupedEntry: GroupedFoodEntry = {
        id: Date.now().toString() + Math.random(),
        originalInput,
        combinedName: parsed.combinedName || this.generateCombinedName(parsed.individualItems),
        totalCalories,
        totalNutrients,
        individualItems: parsed.individualItems,
        dateAdded: new Date(),
        timeOfDay: timeOfDay || this.determineTimeOfDay(), // Use passed timeOfDay or fallback to current time
        mealType: this.determineMealType(originalInput)
      };

      return {
        success: true,
        groupedEntry,
        csvData
      };

    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return {
        success: false,
        error: `Parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private calculateTotalNutrients(items: FoodItem[]): GroupedFoodEntry['totalNutrients'] {
    return items.reduce((total, item) => ({
      protein: total.protein + (item.protein || 0),
      carbohydrates: total.carbohydrates + (item.carbohydrates || 0), 
      fat: total.fat + (item.fat || 0),
      fiber: total.fiber + (item.fiber || 0),
      sugar: total.sugar + (item.sugar || 0),
      sodium: total.sodium + (item.sodium || 0),
      calcium: (total.calcium || 0) + (item.calcium || 0),
      iron: (total.iron || 0) + (item.iron || 0),
      vitamin_c: (total.vitamin_c || 0) + (item.vitamin_c || 0),
      vitamin_d: (total.vitamin_d || 0) + (item.vitamin_d || 0),
      potassium: (total.potassium || 0) + (item.potassium || 0)
    }), {
      protein: 0,
      carbohydrates: 0,
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
  }

  private generateCSV(items: FoodItem[]): string {
    const headers = 'Name,Quantity,Unit,Calories,Protein(g),Carbs(g),Fat(g),Fiber(g),Sugar(g),Sodium(mg),Calcium(mg),Iron(mg),VitaminC(mg),VitaminD(mg),Potassium(mg)';
    
    const rows = items.map(item => [
      item.name,
      item.quantity,
      item.unit,
      item.calories,
      item.protein,
      item.carbohydrates,
      item.fat,
      item.fiber,
      item.sugar,
      item.sodium,
      item.calcium || 0,
      item.iron || 0,
      item.vitamin_c || 0,
      item.vitamin_d || 0,
      item.potassium || 0
    ].join(','));

    return [headers, ...rows].join('\n');
  }

  private generateCombinedName(items: FoodItem[]): string {
    if (items.length === 1) {
      return items[0].name;
    } else if (items.length === 2) {
      return `${items[0].name} and ${items[1].name}`;
    } else {
      const lastItem = items[items.length - 1];
      const otherItems = items.slice(0, -1);
      return `${otherItems.map(i => i.name).join(', ')} and ${lastItem.name}`;
    }
  }

  private determineTimeOfDay(): string {
    const hour = new Date().getHours();
    if (hour < 6) return 'late-night';
    if (hour < 10) return 'morning';
    if (hour < 12) return 'late-morning';
    if (hour < 17) return 'afternoon';
    if (hour < 21) return 'evening';
    return 'night';
  }

  private determineMealType(input: string): 'breakfast' | 'lunch' | 'dinner' | 'snack' {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('breakfast') || lowerInput.includes('morning')) return 'breakfast';
    if (lowerInput.includes('lunch') || lowerInput.includes('noon')) return 'lunch';
    if (lowerInput.includes('dinner') || lowerInput.includes('supper') || lowerInput.includes('evening')) return 'dinner';
    if (lowerInput.includes('snack')) return 'snack';
    
    // Determine by time if not specified
    const hour = new Date().getHours();
    if (hour < 11) return 'breakfast';
    if (hour < 16) return 'lunch';
    if (hour < 20) return 'dinner';
    return 'snack';
  }
}

export const llmFoodBrain = new LLMFoodBrain();