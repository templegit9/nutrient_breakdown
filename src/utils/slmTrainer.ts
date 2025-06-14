import type { SmartParsedFood } from '../types';

export interface TrainingExample {
  input: string;
  output: {
    components: Array<{
      name: string;
      quantity: number;
      unit: string;
      calories: number;
    }>;
    totalCalories: number;
    macronutrients: {
      protein: number;
      carbohydrates: number;
      fat: number;
      fiber: number;
    };
  };
}

export interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export class SLMTrainer {
  private trainingData: TrainingExample[] = [];
  // Use a more capable instruction-following model
  private readonly HUGGING_FACE_API_URL = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-large';
  private readonly BACKUP_API_URL = 'https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill';
  private readonly API_KEY = import.meta.env.VITE_HUGGING_FACE_TOKEN || 'hf_placeholder';
  private isInitialized = false;

  constructor() {
    this.loadTrainingData();
  }

  private parseTrainingRow(rowText: string): TrainingExample | null {
    const parts = rowText.split('|').map(p => p.trim());
    if (parts.length < 8) return null;

    const mealDescription = parts[2];
    const components = parts[3];
    const totalCalories = parseInt(parts[4]);
    const protein = parseFloat(parts[5]);
    const carbohydrates = parseFloat(parts[6]);
    const fat = parseFloat(parts[7]);
    const fiber = parseFloat(parts[8]);

    // Parse individual components
    const parsedComponents = this.parseComponents(components);

    return {
      input: mealDescription,
      output: {
        components: parsedComponents,
        totalCalories,
        macronutrients: { protein, carbohydrates, fat, fiber }
      }
    };
  }

  private parseComponents(componentText: string): Array<{name: string; quantity: number; unit: string; calories: number}> {
    const components: Array<{name: string; quantity: number; unit: string; calories: number}> = [];
    
    // Split by '+' to get individual items
    const items = componentText.split('+').map(item => item.trim());
    
    for (const item of items) {
      // Extract calories using regex pattern (number followed by 'cal')
      const calorieMatch = item.match(/\((\d+)\s*cal\)/);
      const calories = calorieMatch ? parseInt(calorieMatch[1]) : 0;
      
      // Extract quantity and unit using various patterns
      let quantity = 1;
      let unit = 'serving';
      let name = item;
      
      // Pattern: "Bread (3 slices, 90g)" or "Jollof rice (1.5 cups, 300g)"
      const quantityMatch = item.match(/\(([0-9.]+)\s*([^,)]+)/);
      if (quantityMatch) {
        quantity = parseFloat(quantityMatch[1]);
        unit = quantityMatch[2].trim();
        name = item.split('(')[0].trim();
      }
      
      // Remove calorie information from name
      name = name.replace(/\s*\(\d+\s*cal\)/, '').trim();
      
      components.push({ name, quantity, unit, calories });
    }
    
    return components;
  }

  async loadTrainingData(): Promise<void> {
    try {
      // Load global training data
      const globalResponse = await fetch('/Training/global_meal_descriptions.md');
      if (globalResponse.ok) {
        const globalText = await globalResponse.text();
        this.parseDataset(globalText);
      } else {
        console.warn('Could not load global training data');
      }
      
      // Load Nigerian training data  
      const nigerianResponse = await fetch('/Training/nigerian_meal_descriptions.md');
      if (nigerianResponse.ok) {
        const nigerianText = await nigerianResponse.text();
        this.parseDataset(nigerianText);
      } else {
        console.warn('Could not load Nigerian training data');
      }
      
      console.log(`Loaded ${this.trainingData.length} training examples`);
      
      // If no training data loaded, add some basic examples
      if (this.trainingData.length === 0) {
        this.addFallbackTrainingData();
      }
    } catch (error) {
      console.error('Error loading training data:', error);
      this.addFallbackTrainingData();
    }
  }

  private parseDataset(text: string): void {
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('|') && line.includes('|') && !line.includes('---') && !line.includes('Meal Description')) {
        const example = this.parseTrainingRow(line);
        if (example && example.input.length > 0) {
          this.trainingData.push(example);
        }
      }
    }
  }

  // Advanced LLM-powered food breakdown using Hugging Face API
  async predict(mealDescription: string): Promise<SmartParsedFood[]> {
    try {
      // Try LLM first for best results
      const llmResult = await this.predictWithLLM(mealDescription);
      if (llmResult.length > 0) {
        return llmResult;
      }
    } catch (error) {
      console.warn('LLM prediction failed, using fallback:', error);
    }

    // Fallback to training data matching
    const normalizedInput = mealDescription.toLowerCase();
    let bestMatch: TrainingExample | null = null;
    let bestScore = 0;
    
    for (const example of this.trainingData) {
      const score = this.calculateEnhancedSimilarity(normalizedInput, example.input.toLowerCase());
      if (score > bestScore) {
        bestScore = score;
        bestMatch = example;
      }
    }
    
    if (bestMatch && bestScore > 0.25) {
      return bestMatch.output.components.map(component => ({
        food: component.name,
        quantity: component.quantity,
        unit: component.unit,
        confidence: Math.min(bestScore + 0.2, 1.0)
      }));
    }
    
    // Final fallback to basic parsing
    return this.basicParse(mealDescription);
  }

  private async predictWithLLM(mealDescription: string): Promise<SmartParsedFood[]> {
    const prompt = this.createFoodExtractionPrompt(mealDescription);
    
    // Try primary model first
    try {
      const result = await this.callHuggingFaceAPI(this.HUGGING_FACE_API_URL, prompt);
      if (result.length > 0) {
        return result;
      }
    } catch (error) {
      console.warn('Primary model failed, trying backup:', error);
    }

    // Try backup model
    try {
      const result = await this.callHuggingFaceAPI(this.BACKUP_API_URL, prompt);
      if (result.length > 0) {
        return result;
      }
    } catch (error) {
      console.error('Both models failed:', error);
    }

    return [];
  }

  private async callHuggingFaceAPI(apiUrl: string, prompt: string): Promise<SmartParsedFood[]> {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.2, // Lower temperature for more consistent results
          do_sample: true,
          return_full_text: false,
          repetition_penalty: 1.1
        }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data: HuggingFaceResponse[] = await response.json();
    
    if (data && data[0] && data[0].generated_text) {
      return this.parseLLMResponse(data[0].generated_text);
    }
    
    return [];
  }

  private createFoodExtractionPrompt(mealDescription: string): string {
    return `Extract food items from this meal description. Return ONLY a JSON array.

Task: Break down "${mealDescription}" into individual food components with quantities.

Rules:
- Return valid JSON array only
- Each item needs: food, quantity, unit
- Use common food names that exist in nutrition databases
- Estimate reasonable portions if not specified
- Units: g, cup, slice, piece, tbsp, tsp, medium, large, small

Examples:
"rice and chicken" → [{"food":"rice","quantity":1,"unit":"cup"},{"food":"chicken","quantity":100,"unit":"g"}]
"2 eggs with toast" → [{"food":"eggs","quantity":2,"unit":"large"},{"food":"bread","quantity":2,"unit":"slice"}]

Now extract from: "${mealDescription}"`;
  }

  private parseLLMResponse(responseText: string): SmartParsedFood[] {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\[.*?\]/s);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (Array.isArray(parsed)) {
          return parsed.map(item => ({
            food: this.cleanAndValidateFoodName(item.food || item.name || ''),
            quantity: item.quantity || 1,
            unit: this.normalizeUnit(item.unit || 'serving'),
            confidence: 0.85 // High confidence for LLM predictions
          })).filter(item => item.food !== ''); // Remove empty food names
        }
      }
      
      // Fallback parsing if JSON extraction fails
      return this.parseTextResponse(responseText);
    } catch (error) {
      console.warn('Failed to parse LLM response:', error);
      return this.parseTextResponse(responseText);
    }
  }

  private cleanAndValidateFoodName(foodName: string): string {
    if (!foodName || typeof foodName !== 'string') {
      return '';
    }
    
    // Clean the food name
    let cleaned = foodName
      .toLowerCase()
      .trim()
      .replace(/^(i had |i ate |ate |had |some |a |an |the )/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    // Validate minimum length
    if (cleaned.length < 2) {
      return '';
    }
    
    // Remove common non-food words
    const nonFoodWords = ['unknown', 'food', 'item', 'thing', 'stuff', 'something'];
    if (nonFoodWords.includes(cleaned)) {
      return '';
    }
    
    // Map common variations to standard names
    const foodNameMapping: Record<string, string> = {
      'scrambled eggs': 'eggs',
      'fried eggs': 'eggs', 
      'boiled eggs': 'eggs',
      'white bread': 'bread',
      'brown bread': 'bread',
      'jollof rice': 'rice',
      'fried rice': 'rice',
      'grilled chicken': 'chicken',
      'fried chicken': 'chicken',
      'baked chicken': 'chicken',
      'fried plantain': 'plantain',
      'boiled plantain': 'plantain'
    };
    
    return foodNameMapping[cleaned] || cleaned;
  }

  private normalizeUnit(unit: string): string {
    if (!unit || typeof unit !== 'string') {
      return 'serving';
    }
    
    const unitMapping: Record<string, string> = {
      'pieces': 'piece',
      'slices': 'slice',
      'cups': 'cup',
      'grams': 'g',
      'gram': 'g',
      'large': 'large',
      'medium': 'medium',
      'small': 'small',
      'tbsp': 'tbsp',
      'tablespoon': 'tbsp',
      'tablespoons': 'tbsp',
      'tsp': 'tsp',
      'teaspoon': 'tsp',
      'teaspoons': 'tsp'
    };
    
    const normalized = unit.toLowerCase().trim();
    return unitMapping[normalized] || normalized;
  }

  private parseTextResponse(responseText: string): SmartParsedFood[] {
    const foods: SmartParsedFood[] = [];
    const lines = responseText.split('\n').filter(line => line.trim());
    
    for (const line of lines) {
      // Look for patterns like "1 cup rice" or "2 slices bread"
      const match = line.match(/(\d+(?:\.\d+)?)\s*(\w+)?\s*(.+)/);
      if (match) {
        const [_, quantityStr, unit, foodName] = match;
        const quantity = parseFloat(quantityStr);
        const cleanedFood = this.cleanAndValidateFoodName(foodName);
        
        if (quantity && cleanedFood) {
          foods.push({
            food: cleanedFood,
            quantity,
            unit: this.normalizeUnit(unit || 'serving'),
            confidence: 0.75
          });
        }
      } else {
        // If no quantity found, extract just the food name
        const cleanLine = line.replace(/^[-•*]\s*/, '').trim();
        const cleanedFood = this.cleanAndValidateFoodName(cleanLine);
        if (cleanedFood) {
          foods.push({
            food: cleanedFood,
            quantity: 1,
            unit: 'serving',
            confidence: 0.6
          });
        }
      }
    }
    
    return foods.filter(food => food.food !== ''); // Remove any empty food names
  }

  private calculateSimilarity(input1: string, input2: string): number {
    const words1 = new Set(input1.split(/\s+/));
    const words2 = new Set(input2.split(/\s+/));
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size; // Jaccard similarity
  }

  private calculateEnhancedSimilarity(input1: string, input2: string): number {
    // Basic Jaccard similarity
    let jaccard = this.calculateSimilarity(input1, input2);
    
    // Boost score for key food words
    const keyFoods = ['rice', 'chicken', 'bread', 'eggs', 'fish', 'beans', 'yam', 'plantain', 'soup', 'stew'];
    const words1 = input1.split(/\s+/);
    const words2 = input2.split(/\s+/);
    
    let foodMatches = 0;
    for (const food of keyFoods) {
      if (words1.some(w => w.includes(food)) && words2.some(w => w.includes(food))) {
        foodMatches++;
      }
    }
    
    // Add bonus for food matches
    const foodBonus = foodMatches * 0.1;
    
    // Add bonus for similar structure/patterns
    let structureBonus = 0;
    if (input1.includes('had') && input2.includes('had')) structureBonus += 0.05;
    if (input1.includes('ate') && input2.includes('ate')) structureBonus += 0.05;
    if (input1.includes('with') && input2.includes('with')) structureBonus += 0.05;
    
    return Math.min(jaccard + foodBonus + structureBonus, 1.0);
  }

  private addFallbackTrainingData(): void {
    // Add some basic training examples as fallback
    const fallbackExamples: TrainingExample[] = [
      {
        input: "I had rice and chicken",
        output: {
          components: [
            { name: "rice", quantity: 1, unit: "cup", calories: 200 },
            { name: "chicken", quantity: 100, unit: "g", calories: 150 }
          ],
          totalCalories: 350,
          macronutrients: { protein: 25, carbohydrates: 45, fat: 5, fiber: 2 }
        }
      },
      {
        input: "I ate bread and eggs",
        output: {
          components: [
            { name: "bread", quantity: 2, unit: "slice", calories: 160 },
            { name: "eggs", quantity: 2, unit: "piece", calories: 140 }
          ],
          totalCalories: 300,
          macronutrients: { protein: 18, carbohydrates: 32, fat: 12, fiber: 3 }
        }
      }
    ];
    
    this.trainingData.push(...fallbackExamples);
    console.log('Added fallback training data');
  }

  private basicParse(mealDescription: string): SmartParsedFood[] {
    const commonFoods = [
      'rice', 'chicken', 'bread', 'eggs', 'fish', 'beans', 'yam', 'plantain',
      'beef', 'pork', 'turkey', 'cheese', 'milk', 'yogurt', 'apple', 'banana',
      'tomato', 'onion', 'garlic', 'potato', 'carrot', 'spinach', 'lettuce',
      'pasta', 'noodles', 'soup', 'salad', 'sandwich'
    ];
    const found: SmartParsedFood[] = [];
    
    const normalizedText = mealDescription.toLowerCase();
    
    // Extract quantity patterns first
    const quantityMatches = normalizedText.match(/(\d+(?:\.\d+)?)\s*(\w+)?\s*([a-z\s]+)/g);
    
    if (quantityMatches) {
      for (const match of quantityMatches) {
        const parts = match.match(/(\d+(?:\.\d+)?)\s*(\w+)?\s*([a-z\s]+)/);
        if (parts) {
          const [_, quantityStr, unit, foodText] = parts;
          const quantity = parseFloat(quantityStr);
          
          for (const food of commonFoods) {
            if (foodText.includes(food)) {
              found.push({
                food: food,
                quantity: quantity || 1,
                unit: this.normalizeUnit(unit || 'serving'),
                confidence: 0.6
              });
              break; // Only match first food found in this text
            }
          }
        }
      }
    }
    
    // If no quantity-based matches, look for just food names
    if (found.length === 0) {
      for (const food of commonFoods) {
        if (normalizedText.includes(food)) {
          found.push({
            food: food,
            quantity: 1,
            unit: 'serving',
            confidence: 0.4
          });
        }
      }
    }
    
    // Remove duplicates
    const unique = found.filter((item, index, self) => 
      index === self.findIndex(t => t.food === item.food)
    );
    
    return unique;
  }

  getTrainingDataSize(): number {
    return this.trainingData.length;
  }

  getTrainingExample(index: number): TrainingExample | null {
    return this.trainingData[index] || null;
  }
}

export const slmTrainer = new SLMTrainer();