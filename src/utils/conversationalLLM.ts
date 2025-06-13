/**
 * LLM-powered conversational food parser using Transformers.js
 * This approach uses a small language model to extract structured food data
 * from natural language inputs with high accuracy.
 */

// Types for LLM integration
export interface LLMConfig {
  modelType: 'transformers-js' | 'ollama' | 'huggingface-api';
  modelName: string;
  apiKey?: string;
  localEndpoint?: string;
}

export interface ExtractedFoodData {
  foods: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    cookingMethod?: string;
    confidence: number;
  }>;
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  timeContext?: string;
  originalText: string;
  extractionMethod: 'llm' | 'fallback';
}

/**
 * Main class for LLM-powered food extraction
 */
export class ConversationalFoodLLM {
  private config: LLMConfig;
  private model: any; // Will hold the loaded model
  private isModelLoaded = false;

  constructor(config: LLMConfig) {
    this.config = config;
  }

  /**
   * Initialize the LLM model
   */
  async initialize(): Promise<void> {
    switch (this.config.modelType) {
      case 'transformers-js':
        await this.initializeTransformersJS();
        break;
      case 'ollama':
        await this.initializeOllama();
        break;
      case 'huggingface-api':
        await this.initializeHuggingFaceAPI();
        break;
    }
    this.isModelLoaded = true;
  }

  /**
   * Extract food data from natural language text
   */
  async extractFoodData(text: string): Promise<ExtractedFoodData> {
    if (!this.isModelLoaded) {
      console.warn('LLM not loaded, falling back to regex parser');
      return this.fallbackExtraction(text);
    }

    try {
      switch (this.config.modelType) {
        case 'transformers-js':
          return await this.extractWithTransformersJS(text);
        case 'ollama':
          return await this.extractWithOllama(text);
        case 'huggingface-api':
          return await this.extractWithHuggingFace(text);
        default:
          return this.fallbackExtraction(text);
      }
    } catch (error) {
      console.error('LLM extraction failed:', error);
      return this.fallbackExtraction(text);
    }
  }

  /**
   * Initialize Transformers.js (runs in browser)
   */
  private async initializeTransformersJS(): Promise<void> {
    try {
      // Import transformers.js dynamically
      const { pipeline } = await import('@xenova/transformers');
      
      // Use a pre-trained NER model or fine-tuned food extraction model
      this.model = await pipeline('token-classification', 'Xenova/bert-base-NER', {
        revision: 'main',
      });
      
      console.log('Transformers.js model loaded successfully');
    } catch (error) {
      console.error('Failed to load Transformers.js model:', error);
      throw error;
    }
  }

  /**
   * Initialize Ollama (local API)
   */
  private async initializeOllama(): Promise<void> {
    const endpoint = this.config.localEndpoint || 'http://localhost:11434';
    
    try {
      // Test connection to Ollama
      const response = await fetch(`${endpoint}/api/tags`);
      if (!response.ok) {
        throw new Error(`Ollama not available at ${endpoint}`);
      }
      
      this.model = { endpoint, modelName: this.config.modelName };
      console.log('Ollama connection established');
    } catch (error) {
      console.error('Failed to connect to Ollama:', error);
      throw error;
    }
  }

  /**
   * Initialize Hugging Face API
   */
  private async initializeHuggingFaceAPI(): Promise<void> {
    if (!this.config.apiKey) {
      throw new Error('Hugging Face API key required');
    }
    
    this.model = {
      apiKey: this.config.apiKey,
      modelName: this.config.modelName || 'microsoft/DialoGPT-medium'
    };
    
    console.log('Hugging Face API configured');
  }

  /**
   * Extract food data using Transformers.js
   */
  private async extractWithTransformersJS(text: string): Promise<ExtractedFoodData> {
    // Use the NER model to identify food entities
    const entities = await this.model(text);
    
    // Process entities to extract food information
    const foods = this.processNEREntities(entities, text);
    
    return {
      foods,
      originalText: text,
      extractionMethod: 'llm'
    };
  }

  /**
   * Extract food data using Ollama
   */
  private async extractWithOllama(text: string): Promise<ExtractedFoodData> {
    const prompt = this.createFoodExtractionPrompt(text);
    
    const response = await fetch(`${this.model.endpoint}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model.modelName,
        prompt,
        stream: false,
        options: {
          temperature: 0.1, // Low temperature for consistent extraction
          top_p: 0.9
        }
      })
    });
    
    const result = await response.json();
    return this.parseStructuredResponse(result.response, text);
  }

  /**
   * Extract food data using Hugging Face API
   */
  private async extractWithHuggingFace(text: string): Promise<ExtractedFoodData> {
    const prompt = this.createFoodExtractionPrompt(text);
    
    const response = await fetch(`https://api-inference.huggingface.co/models/${this.model.modelName}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.model.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 200,
          temperature: 0.1
        }
      })
    });
    
    const result = await response.json();
    return this.parseStructuredResponse(result[0].generated_text, text);
  }

  /**
   * Create a structured prompt for food extraction
   */
  private createFoodExtractionPrompt(text: string): string {
    return `Extract food information from this text and return it as JSON:

Text: "${text}"

Extract:
1. Food names
2. Quantities (numbers)
3. Units (grams, cups, pieces, etc.)
4. Cooking methods (if mentioned)
5. Meal type (breakfast, lunch, dinner, snack)

Return JSON format:
{
  "foods": [
    {
      "name": "food name",
      "quantity": number or null,
      "unit": "unit" or null,
      "cookingMethod": "method" or null,
      "confidence": 0.0-1.0
    }
  ],
  "mealType": "breakfast|lunch|dinner|snack" or null
}

JSON:`;
  }

  /**
   * Process NER entities from Transformers.js
   */
  private processNEREntities(entities: any[], text: string): ExtractedFoodData['foods'] {
    // Group entities by type and position
    const foodEntities = entities.filter(entity => 
      entity.entity.includes('FOOD') || 
      entity.entity.includes('MISC') ||
      entity.word.length > 2
    );
    
    // Simple processing - in production, you'd want more sophisticated logic
    const foods = foodEntities.map(entity => ({
      name: entity.word,
      quantity: this.extractQuantityNearEntity(text, entity),
      unit: this.extractUnitNearEntity(text, entity),
      confidence: entity.score
    }));
    
    return foods;
  }

  /**
   * Parse structured response from LLM
   */
  private parseStructuredResponse(response: string, originalText: string): ExtractedFoodData {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        foods: parsed.foods || [],
        mealType: parsed.mealType,
        originalText,
        extractionMethod: 'llm'
      };
    } catch (error) {
      console.error('Failed to parse LLM response:', error);
      return this.fallbackExtraction(originalText);
    }
  }

  /**
   * Fallback to regex-based extraction when LLM fails
   */
  private fallbackExtraction(text: string): ExtractedFoodData {
    // Import our existing regex parser as fallback
    const { parseConversationalInput } = require('./conversationalParser');
    const parsed = parseConversationalInput(text);
    
    return {
      foods: parsed.foods.map((food: any) => ({
        name: food.foodName,
        quantity: food.quantity,
        unit: food.unit,
        cookingMethod: food.cookingMethod,
        confidence: food.confidence
      })),
      mealType: parsed.mealContext,
      originalText: text,
      extractionMethod: 'fallback'
    };
  }

  // Helper methods for entity processing
  private extractQuantityNearEntity(text: string, entity: any): number | undefined {
    // Look for numbers near the entity
    const words = text.split(' ');
    const entityIndex = words.findIndex(word => word.includes(entity.word));
    
    for (let i = Math.max(0, entityIndex - 2); i <= Math.min(words.length - 1, entityIndex + 2); i++) {
      const num = parseFloat(words[i]);
      if (!isNaN(num)) return num;
    }
    
    return undefined;
  }

  private extractUnitNearEntity(text: string, entity: any): string | undefined {
    const units = ['g', 'kg', 'ml', 'l', 'cup', 'cups', 'piece', 'pieces', 'slice', 'slices'];
    const words = text.split(' ');
    const entityIndex = words.findIndex(word => word.includes(entity.word));
    
    for (let i = Math.max(0, entityIndex - 2); i <= Math.min(words.length - 1, entityIndex + 2); i++) {
      if (units.includes(words[i].toLowerCase())) {
        return words[i].toLowerCase();
      }
    }
    
    return undefined;
  }
}

/**
 * Factory function to create LLM instance with best available option
 */
export async function createFoodLLM(): Promise<ConversationalFoodLLM> {
  // Try to determine the best available option
  const configs: LLMConfig[] = [
    // Try Transformers.js first (runs in browser, no API needed)
    {
      modelType: 'transformers-js',
      modelName: 'Xenova/bert-base-NER'
    },
    // Fallback to Ollama if available locally
    {
      modelType: 'ollama',
      modelName: 'llama3.2:1b',
      localEndpoint: 'http://localhost:11434'
    }
  ];

  for (const config of configs) {
    try {
      const llm = new ConversationalFoodLLM(config);
      await llm.initialize();
      console.log(`Successfully initialized LLM with ${config.modelType}`);
      return llm;
    } catch (error) {
      console.warn(`Failed to initialize ${config.modelType}:`, error);
      continue;
    }
  }

  // If all fail, create instance that will use fallback
  console.warn('All LLM options failed, will use regex fallback');
  return new ConversationalFoodLLM({ modelType: 'transformers-js', modelName: '' });
}

/**
 * Example usage and testing
 */
export async function testLLMExtraction() {
  const llm = await createFoodLLM();
  
  const testInputs = [
    "I had 2 slices of bread and a cup of coffee for breakfast",
    "ate grilled chicken with steamed broccoli",
    "200ml of milk and an apple",
    "some rice and beans for lunch"
  ];

  console.log('Testing LLM food extraction:');
  
  for (const input of testInputs) {
    console.log(`\nInput: "${input}"`);
    const result = await llm.extractFoodData(input);
    console.log('Result:', result);
  }
}