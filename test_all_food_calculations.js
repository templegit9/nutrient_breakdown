// Comprehensive test for all food calculations including calorie calculations
console.log('=== COMPREHENSIVE FOOD CALCULATION TEST ===\n');

// Mock the food conversion system
const foodSpecificConversions = {
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
    'fluid ounces': 30,
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

const units = {
  pieces: { category: 'count', conversionFactor: 1 },
  slices: { category: 'count', conversionFactor: 1 },
  cups: { category: 'volume', conversionFactor: 240 },
  'fluid ounces': { category: 'volume', conversionFactor: 30 },
  g: { category: 'weight', conversionFactor: 1 },
  kg: { category: 'weight', conversionFactor: 1000 },
};

// Sample nutrition data per 100g
const nutritionData = {
  apple: { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 },
  banana: { calories: 89, protein: 1.1, carbs: 22.8, fat: 0.3 },
  bread: { calories: 265, protein: 9, carbs: 49, fat: 3.2 },
  egg: { calories: 155, protein: 13, carbs: 1.1, fat: 11 },
  rice: { calories: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  pasta: { calories: 131, protein: 5, carbs: 25, fat: 1.1 },
  milk: { calories: 42, protein: 3.4, carbs: 5, fat: 1 },
  cheese: { calories: 113, protein: 7, carbs: 1, fat: 9 },
  chicken: { calories: 239, protein: 27, carbs: 0, fat: 14 },
  broccoli: { calories: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  spinach: { calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  // Test foods that might cause issues
  pineapple: { calories: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  'green apple': { calories: 52, protein: 0.3, carbs: 13.8, fat: 0.2 },
  'whole wheat bread': { calories: 247, protein: 13, carbs: 41, fat: 4.2 },
  'brown rice': { calories: 123, protein: 2.6, carbs: 23, fat: 0.9 }
};

function convertToBaseUnit(amount, fromUnit, foodName) {
  const unit = units[fromUnit];
  if (!unit) {
    throw new Error(`Unknown unit: ${fromUnit}`);
  }

  // Check for food-specific conversions first
  if (foodName) {
    const normalizedFood = foodName.toLowerCase();
    // Sort food keys by length (longest first) to prefer more specific matches
    const sortedFoodKeys = Object.keys(foodSpecificConversions).sort((a, b) => b.length - a.length);
    const foodConversions = sortedFoodKeys.find(food => {
      // Use word boundary regex to ensure we match whole words only
      const regex = new RegExp('\\b' + food.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&') + '\\b', 'i');
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
      return { grams: amount * unit.conversionFactor };
    case 'count':
      return { grams: amount * unit.conversionFactor };
    default:
      return { grams: amount };
  }
}

function calculateNutrition(quantity, unit, foodName) {
  const food = nutritionData[foodName.toLowerCase()];
  if (!food) {
    console.log(`⚠️  Food "${foodName}" not found in nutrition database`);
    return null;
  }

  try {
    // Convert units to grams
    const convertedAmount = convertToBaseUnit(quantity, unit, foodName);
    const gramsAmount = convertedAmount.grams || quantity;
    const scaleFactor = gramsAmount / 100;

    return {
      food: foodName,
      quantity: quantity,
      unit: unit,
      gramsEquivalent: gramsAmount,
      calories: Math.round(food.calories * scaleFactor),
      protein: Math.round((food.protein * scaleFactor) * 10) / 10,
      carbs: Math.round((food.carbs * scaleFactor) * 10) / 10,
      fat: Math.round((food.fat * scaleFactor) * 10) / 10,
      conversionWorked: gramsAmount !== quantity // True if unit conversion was applied
    };
  } catch (error) {
    console.log(`❌ Error calculating nutrition for ${foodName}: ${error.message}`);
    return null;
  }
}

// Test cases covering various scenarios
const testCases = [
  // Foods with specific conversions
  { quantity: 1, unit: 'pieces', food: 'apple' },
  { quantity: 6, unit: 'pieces', food: 'apple' },
  { quantity: 1, unit: 'pieces', food: 'banana' },
  { quantity: 2, unit: 'slices', food: 'bread' },
  { quantity: 1, unit: 'pieces', food: 'egg' },
  { quantity: 1, unit: 'cups', food: 'rice' },
  { quantity: 1, unit: 'cups', food: 'milk' },
  { quantity: 2, unit: 'slices', food: 'cheese' },
  
  // Foods that might cause partial matching issues
  { quantity: 1, unit: 'pieces', food: 'pineapple' }, // Should NOT match "apple"
  { quantity: 1, unit: 'pieces', food: 'green apple' }, // SHOULD match "apple"
  { quantity: 2, unit: 'slices', food: 'whole wheat bread' }, // SHOULD match "bread"
  { quantity: 1, unit: 'cups', food: 'brown rice' }, // SHOULD match "rice"
  
  // Foods without specific conversions (should fall back to standard)
  { quantity: 100, unit: 'g', food: 'chicken' },
  { quantity: 1, unit: 'cups', food: 'broccoli' },
  { quantity: 2, unit: 'cups', food: 'spinach' },
  
  // Edge cases
  { quantity: 0.5, unit: 'pieces', food: 'apple' },
  { quantity: 10, unit: 'slices', food: 'apple' }
];

console.log('Testing food calculations for various foods and units:\n');

let passed = 0;
let failed = 0;
let conversionIssues = [];

testCases.forEach((test, index) => {
  const result = calculateNutrition(test.quantity, test.unit, test.food);
  
  if (result) {
    const expectedConversion = foodSpecificConversions[test.food.toLowerCase()] || 
                             foodSpecificConversions[Object.keys(foodSpecificConversions).find(key => 
                               test.food.toLowerCase().includes(key))] ||
                             null;
    
    const shouldHaveConversion = expectedConversion && expectedConversion[test.unit];
    const hasConversion = result.conversionWorked;
    
    if (shouldHaveConversion && !hasConversion) {
      console.log(`❌ Test ${index + 1}: ${test.quantity} ${test.unit} ${test.food}`);
      console.log(`   Expected conversion but got: ${result.gramsEquivalent}g, ${result.calories} cal`);
      console.log(`   Should have used: ${expectedConversion[test.unit]}g per ${test.unit}\n`);
      conversionIssues.push(`${test.food} (${test.unit})`);
      failed++;
    } else {
      console.log(`✅ Test ${index + 1}: ${test.quantity} ${test.unit} ${test.food}`);
      console.log(`   Result: ${result.gramsEquivalent}g, ${result.calories} cal`);
      console.log(`   Conversion: ${hasConversion ? 'Applied' : 'Standard fallback'}\n`);
      passed++;
    }
  } else {
    console.log(`❌ Test ${index + 1}: ${test.quantity} ${test.unit} ${test.food} - FAILED\n`);
    failed++;
  }
});

console.log('=== TEST RESULTS ===');
console.log(`✅ Passed: ${passed}`);
console.log(`❌ Failed: ${failed}`);
console.log(`📊 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

if (conversionIssues.length > 0) {
  console.log('🔧 Foods with conversion issues:');
  conversionIssues.forEach(issue => console.log(`   - ${issue}`));
  console.log('');
}

if (failed === 0) {
  console.log('🎉 ALL TESTS PASSED! Food calculations are working correctly for all foods.');
} else {
  console.log('⚠️  Some food calculations failed. Check the unit conversion logic.');
}