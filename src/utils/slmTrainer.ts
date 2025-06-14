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

export class SLMTrainer {
  private trainingData: TrainingExample[] = [];

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

  // Simple rule-based model for now (can be replaced with neural network later)
  predict(mealDescription: string): SmartParsedFood[] {
    const normalizedInput = mealDescription.toLowerCase();
    
    // Find closest training example using enhanced keyword matching
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
      // Convert training format to SmartParsedFood format
      return bestMatch.output.components.map(component => ({
        food: component.name,
        quantity: component.quantity,
        unit: component.unit,
        confidence: Math.min(bestScore + 0.2, 1.0) // Boost confidence for SLM predictions
      }));
    }
    
    // Fallback to basic parsing if no good match found
    return this.basicParse(mealDescription);
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
    // Simple fallback parser
    const commonFoods = ['rice', 'chicken', 'bread', 'eggs', 'fish', 'beans', 'yam', 'plantain'];
    const found: SmartParsedFood[] = [];
    
    const words = mealDescription.toLowerCase().split(/\s+/);
    
    for (const food of commonFoods) {
      if (words.some(word => word.includes(food))) {
        found.push({
          food: food,
          quantity: 1,
          unit: 'serving',
          confidence: 0.5
        });
      }
    }
    
    return found;
  }

  getTrainingDataSize(): number {
    return this.trainingData.length;
  }

  getTrainingExample(index: number): TrainingExample | null {
    return this.trainingData[index] || null;
  }
}

export const slmTrainer = new SLMTrainer();