import { DatabaseService } from '../services/database';
import type { DatabaseFood } from '../types';
import type { ParsedFood } from './conversationalParser';
import type { SmartParsedFood } from './smartFoodParser';

export interface FoodMatch {
  food: DatabaseFood;
  confidence: number;
  matchType: 'exact' | 'partial' | 'synonym' | 'fuzzy';
  matchedName: string;
}

export interface MatchResult {
  originalParsedFood: ParsedFood | SmartParsedFood;
  matches: FoodMatch[];
  bestMatch?: FoodMatch;
  needsDisambiguation: boolean;
  suggestions?: string[];
}

// Common food synonyms and alternative names
const foodSynonyms: Record<string, string[]> = {
  // Proteins
  'chicken': ['poultry', 'hen', 'fowl'],
  'beef': ['cow', 'steak', 'meat'],
  'fish': ['seafood'],
  'egg': ['eggs'],
  'tofu': ['bean curd'],
  
  // Fruits
  'apple': ['apples'],
  'banana': ['bananas'],
  'orange': ['oranges'],
  'avocado': ['avocados', 'avo'],
  
  // Vegetables
  'tomato': ['tomatoes'],
  'potato': ['potatoes', 'spud'],
  'onion': ['onions'],
  'pepper': ['peppers', 'bell pepper'],
  'broccoli': ['brocolli'], // Common misspelling
  
  // Grains
  'rice': ['white rice', 'brown rice'],
  'bread': ['loaf', 'slice', 'brioche', 'brioche bread', 'white bread', 'whole wheat bread'],
  'brioche': ['bread', 'white bread'],
  'brioche bread': ['bread', 'white bread'],
  'white bread': ['bread', 'brioche', 'brioche bread'],
  'pasta': ['noodles', 'spaghetti', 'macaroni'],
  'oats': ['oatmeal', 'porridge'],
  
  // Dairy
  'milk': ['dairy'],
  'cheese': ['cheddar', 'mozzarella'],
  'yogurt': ['yoghurt'],
  
  // Beverages
  'coffee': ['black coffee', 'espresso', 'americano', 'latte', 'cappuccino'],
  'tea': ['black tea', 'green tea'],
  'water': ['h2o'],
  
  // Nigerian foods
  'yam': ['white yam', 'pounded yam'],
  'plantain': ['plantains'],
  'cassava': ['tapioca'],
  'garri': ['gari'],
  'fufu': ['foo foo'],
  'jollof': ['jollof rice'],
  'suya': ['grilled meat'],
  'pap': ['akamu', 'ogi']
};

// Common food name patterns and their standardized forms
const foodNamePatterns: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /^grilled\s+/i, replacement: '' },
  { pattern: /^fried\s+/i, replacement: '' },
  { pattern: /^baked\s+/i, replacement: '' },
  { pattern: /^steamed\s+/i, replacement: '' },
  { pattern: /^roasted\s+/i, replacement: '' },
  { pattern: /\s+with\s+.*/i, replacement: '' }, // Remove "with sauce" etc.
  { pattern: /\s+and\s+.*/i, replacement: '' }, // Remove compound descriptions
];

/**
 * Match parsed foods against the database
 */
export async function matchFoodsToDatabase(parsedFoods: ParsedFood[]): Promise<MatchResult[]>;
export async function matchFoodsToDatabase(parsedFoods: SmartParsedFood[]): Promise<MatchResult[]>;
export async function matchFoodsToDatabase(parsedFoods: (ParsedFood | SmartParsedFood)[]): Promise<MatchResult[]> {
  const results: MatchResult[] = [];
  
  for (const parsedFood of parsedFoods) {
    const matchResult = await matchSingleFood(parsedFood);
    results.push(matchResult);
  }
  
  return results;
}

/**
 * Match a single parsed food against the database
 */
async function matchSingleFood(parsedFood: ParsedFood | SmartParsedFood): Promise<MatchResult> {
  // Handle both ParsedFood and SmartParsedFood types
  const foodName = ('foodName' in parsedFood ? parsedFood.foodName : parsedFood.name).toLowerCase();
  
  // Try different matching strategies in order of preference
  const matches: FoodMatch[] = [];
  
  // 1. Exact match
  const exactMatches = await findExactMatches(foodName);
  matches.push(...exactMatches);
  
  // 2. Partial matches
  if (matches.length === 0) {
    const partialMatches = await findPartialMatches(foodName);
    matches.push(...partialMatches);
  }
  
  // 3. Synonym matches
  if (matches.length === 0) {
    const synonymMatches = await findSynonymMatches(foodName);
    matches.push(...synonymMatches);
  }
  
  // 4. Fuzzy matches
  if (matches.length === 0) {
    const fuzzyMatches = await findFuzzyMatches(foodName);
    matches.push(...fuzzyMatches);
  }
  
  // Sort matches by confidence
  matches.sort((a, b) => b.confidence - a.confidence);
  
  const bestMatch = matches.length > 0 ? matches[0] : undefined;
  const needsDisambiguation = matches.length > 1 && matches[0].confidence - matches[1].confidence < 0.2;
  
  const suggestions = needsDisambiguation 
    ? matches.slice(0, 3).map(match => match.food.name)
    : undefined;
  
  return {
    originalParsedFood: parsedFood,
    matches,
    bestMatch,
    needsDisambiguation,
    suggestions
  };
}

/**
 * Find exact matches in the database
 */
async function findExactMatches(foodName: string): Promise<FoodMatch[]> {
  try {
    console.log(`🔍 Searching database for exact match: "${foodName}"`);
    const results = await DatabaseService.searchAllFoods(foodName);
    console.log(`📊 Database returned ${results?.length || 0} results for "${foodName}":`);
    
    if (results && results.length > 0) {
      results.forEach((food, idx) => {
        console.log(`  ${idx + 1}. ${food.name} (${food.calories_per_100g || 'NO CALORIES'} cal/100g)`);
      });
    } else {
      console.log(`  ❌ No foods found in database for "${foodName}"`);
    }
    
    const exactMatches = (results || [])
      .filter(food => food.name.toLowerCase() === foodName)
      .map(food => ({
        food,
        confidence: 1.0,
        matchType: 'exact' as const,
        matchedName: food.name
      }));
      
    console.log(`🎯 Exact matches found: ${exactMatches.length}`);
    return exactMatches;
  } catch (error) {
    console.error('❌ Error in exact match search:', error);
    return [];
  }
}

/**
 * Find partial matches (food name contains search term or vice versa)
 */
async function findPartialMatches(foodName: string): Promise<FoodMatch[]> {
  try {
    console.log(`🔍 Searching for partial matches: "${foodName}"`);
    const results = await DatabaseService.searchAllFoods(foodName);
    
    const partialMatches = (results || [])
      .filter(food => {
        const dbName = food.name.toLowerCase();
        return dbName.includes(foodName) || foodName.includes(dbName);
      })
      .map(food => {
        const dbName = food.name.toLowerCase();
        const confidence = calculatePartialMatchConfidence(foodName, dbName);
        
        return {
          food,
          confidence,
          matchType: 'partial' as const,
          matchedName: food.name
        };
      });
      
    console.log(`🎯 Partial matches found: ${partialMatches.length}`);
    partialMatches.forEach((match, idx) => {
      console.log(`  ${idx + 1}. ${match.food.name} (confidence: ${match.confidence.toFixed(2)})`);
    });
    
    return partialMatches;
  } catch (error) {
    console.error('❌ Error in partial match search:', error);
    return [];
  }
}

/**
 * Find matches using synonyms
 */
async function findSynonymMatches(foodName: string): Promise<FoodMatch[]> {
  console.log(`🔍 Searching for synonym matches: "${foodName}"`);
  const matches: FoodMatch[] = [];
  
  // Check if foodName is a synonym for any known food
  for (const [standardName, synonyms] of Object.entries(foodSynonyms)) {
    if (synonyms.some(synonym => synonym.toLowerCase() === foodName)) {
      console.log(`📝 Found synonym mapping: "${foodName}" → "${standardName}"`);
      try {
        const results = await DatabaseService.searchAllFoods(standardName);
        console.log(`🔍 Searching database for synonym "${standardName}": ${results?.length || 0} results`);
        
        matches.push(...(results || []).map(food => ({
          food,
          confidence: 0.8,
          matchType: 'synonym' as const,
          matchedName: food.name
        })));
      } catch (error) {
        console.error(`❌ Error searching for synonym ${standardName}:`, error);
      }
    }
  }
  
  // Also check if any synonym contains our food name (for partial matches)
  if (matches.length === 0) {
    for (const [standardName, synonyms] of Object.entries(foodSynonyms)) {
      if (synonyms.some(synonym => foodName.includes(synonym.toLowerCase()) || synonym.toLowerCase().includes(foodName))) {
        console.log(`📝 Found partial synonym mapping: "${foodName}" ↔ "${standardName}"`);
        try {
          const results = await DatabaseService.searchAllFoods(standardName);
          console.log(`🔍 Partial synonym search for "${standardName}": ${results?.length || 0} results`);
          
          matches.push(...(results || []).map(food => ({
            food,
            confidence: 0.7, // Lower confidence for partial matches
            matchType: 'synonym' as const,
            matchedName: food.name
          })));
        } catch (error) {
          console.error(`❌ Error searching for partial synonym ${standardName}:`, error);
        }
      }
    }
  }
  
  console.log(`🎯 Synonym matches found: ${matches.length}`);
  matches.forEach((match, idx) => {
    console.log(`  ${idx + 1}. ${match.food.name} (confidence: ${match.confidence})`);
  });
  
  return matches;
}

/**
 * Find fuzzy matches using string similarity
 */
async function findFuzzyMatches(foodName: string): Promise<FoodMatch[]> {
  try {
    // Get all foods and calculate similarity
    const allFoods = await DatabaseService.searchAllFoods('');
    
    if (!allFoods || allFoods.length === 0) {
      return [];
    }
    
    const fuzzyMatches = allFoods
      .map(food => {
        const similarity = calculateStringSimilarity(foodName, food.name.toLowerCase());
        return {
          food,
          confidence: similarity,
          matchType: 'fuzzy' as const,
          matchedName: food.name
        };
      })
      .filter(match => match.confidence > 0.5) // Only include decent matches
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5); // Limit to top 5 fuzzy matches
    
    return fuzzyMatches;
  } catch (error) {
    console.error('Error in fuzzy match search:', error);
    return [];
  }
}

/**
 * Calculate confidence for partial matches
 */
function calculatePartialMatchConfidence(searchTerm: string, dbName: string): number {
  const longer = searchTerm.length > dbName.length ? searchTerm : dbName;
  const shorter = searchTerm.length > dbName.length ? dbName : searchTerm;
  
  if (longer.includes(shorter)) {
    return shorter.length / longer.length;
  }
  
  return 0.5; // Base confidence for other partial matches
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const distance = matrix[str2.length][str1.length];
  const maxLength = Math.max(str1.length, str2.length);
  
  return 1 - (distance / maxLength);
}

/**
 * Normalize food name for better matching
 */
export function normalizeFoodName(name: string): string {
  let normalized = name.toLowerCase().trim();
  
  // Apply common patterns
  for (const { pattern, replacement } of foodNamePatterns) {
    normalized = normalized.replace(pattern, replacement);
  }
  
  return normalized.trim();
}

/**
 * Get suggestions for common food names when no matches found
 */
export function getCommonFoodSuggestions(): string[] {
  return [
    'apple', 'banana', 'bread', 'rice', 'chicken', 'egg',
    'milk', 'cheese', 'tomato', 'potato', 'onion', 'carrot',
    'broccoli', 'spinach', 'salmon', 'beef', 'pasta', 'oats'
  ];
}

/**
 * Test the food matcher with example inputs
 */
export async function testFoodMatcher() {
  const testFoods: ParsedFood[] = [
    { rawText: '2 apples', foodName: 'apple', quantity: 2, unit: 'piece', confidence: 0.9 },
    { rawText: 'grilled chicken', foodName: 'chicken', quantity: undefined, unit: undefined, confidence: 0.7 },
    { rawText: 'some rice', foodName: 'rice', quantity: undefined, unit: undefined, confidence: 0.6 }
  ];
  
  console.log('Testing food matcher:');
  const results = await matchFoodsToDatabase(testFoods);
  results.forEach(result => {
    const originalText = 'rawText' in result.originalParsedFood 
      ? result.originalParsedFood.rawText 
      : result.originalParsedFood.originalText;
    console.log(`\nOriginal: "${originalText}"`);
    console.log(`Best match: ${result.bestMatch?.food.name || 'No match'}`);
    console.log(`Confidence: ${result.bestMatch?.confidence || 0}`);
    console.log(`Needs disambiguation: ${result.needsDisambiguation}`);
  });
}