export interface FoodCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  nutritionalFocus: string[];
  commonFoods: string[];
  healthBenefits: string[];
  pcosRecommendation?: 'excellent' | 'good' | 'moderate' | 'limited';
  glycemicImpact?: 'low' | 'medium' | 'high';
}

export const foodCategories: Record<string, FoodCategory> = {
  fruits: {
    id: 'fruits',
    name: 'Fruits',
    description: 'Fresh, dried, and frozen fruits rich in vitamins and fiber',
    color: '#FF6B6B',
    icon: '🍎',
    nutritionalFocus: ['Vitamin C', 'Fiber', 'Antioxidants', 'Potassium'],
    commonFoods: ['apple', 'banana', 'orange', 'berry', 'grape', 'avocado'],
    healthBenefits: ['Immune support', 'Heart health', 'Digestive health'],
    pcosRecommendation: 'good',
    glycemicImpact: 'medium'
  },
  
  vegetables: {
    id: 'vegetables',
    name: 'Vegetables',
    description: 'Fresh and cooked vegetables, leafy greens, and cruciferous vegetables',
    color: '#4ECDC4',
    icon: '🥬',
    nutritionalFocus: ['Vitamin K', 'Folate', 'Fiber', 'Iron', 'Antioxidants'],
    commonFoods: ['broccoli', 'spinach', 'carrot', 'tomato', 'bell pepper', 'cauliflower'],
    healthBenefits: ['Anti-inflammatory', 'Blood sugar control', 'Digestive health'],
    pcosRecommendation: 'excellent',
    glycemicImpact: 'low'
  },
  
  protein: {
    id: 'protein',
    name: 'Protein',
    description: 'Lean meats, fish, poultry, eggs, and plant-based proteins',
    color: '#FF9F43',
    icon: '🍗',
    nutritionalFocus: ['Protein', 'Iron', 'B Vitamins', 'Zinc', 'Omega-3'],
    commonFoods: ['chicken', 'salmon', 'egg', 'tofu', 'lentil', 'quinoa'],
    healthBenefits: ['Muscle building', 'Satiety', 'Hormone balance'],
    pcosRecommendation: 'excellent',
    glycemicImpact: 'low'
  },
  
  grains: {
    id: 'grains',
    name: 'Grains & Starches',
    description: 'Whole grains, refined grains, bread, pasta, and starchy vegetables',
    color: '#F7B731',
    icon: '🌾',
    nutritionalFocus: ['Carbohydrates', 'B Vitamins', 'Fiber', 'Iron'],
    commonFoods: ['rice', 'bread', 'pasta', 'oats', 'potato', 'quinoa'],
    healthBenefits: ['Energy source', 'Brain function', 'Digestive health'],
    pcosRecommendation: 'moderate',
    glycemicImpact: 'high'
  },
  
  dairy: {
    id: 'dairy',
    name: 'Dairy & Alternatives',
    description: 'Milk, cheese, yogurt, and plant-based dairy alternatives',
    color: '#A55EEA',
    icon: '🥛',
    nutritionalFocus: ['Calcium', 'Protein', 'Vitamin D', 'B12'],
    commonFoods: ['milk', 'cheese', 'yogurt', 'almond milk', 'cottage cheese'],
    healthBenefits: ['Bone health', 'Muscle support', 'Probiotics'],
    pcosRecommendation: 'good',
    glycemicImpact: 'low'
  },
  
  nutsSeeds: {
    id: 'nutsSeeds',
    name: 'Nuts & Seeds',
    description: 'Tree nuts, seeds, and nut/seed butters',
    color: '#8B4513',
    icon: '🥜',
    nutritionalFocus: ['Healthy Fats', 'Protein', 'Vitamin E', 'Magnesium'],
    commonFoods: ['almond', 'walnut', 'chia seed', 'flax seed', 'peanut butter'],
    healthBenefits: ['Heart health', 'Brain function', 'Anti-inflammatory'],
    pcosRecommendation: 'excellent',
    glycemicImpact: 'low'
  },
  
  fatsOils: {
    id: 'fatsOils',
    name: 'Fats & Oils',
    description: 'Cooking oils, butter, and other added fats',
    color: '#FFC312',
    icon: '🫒',
    nutritionalFocus: ['Healthy Fats', 'Vitamin E', 'Omega-3', 'Calories'],
    commonFoods: ['olive oil', 'coconut oil', 'butter', 'avocado oil'],
    healthBenefits: ['Hormone production', 'Nutrient absorption', 'Satiety'],
    pcosRecommendation: 'good',
    glycemicImpact: 'low'
  },
  
  beverages: {
    id: 'beverages',
    name: 'Beverages',
    description: 'Water, tea, coffee, juices, and other drinks',
    color: '#00D2D3',
    icon: '🥤',
    nutritionalFocus: ['Hydration', 'Antioxidants', 'Caffeine', 'Electrolytes'],
    commonFoods: ['water', 'tea', 'coffee', 'juice', 'smoothie'],
    healthBenefits: ['Hydration', 'Antioxidants', 'Mental alertness'],
    pcosRecommendation: 'good',
    glycemicImpact: 'low'
  },
  
  snacks: {
    id: 'snacks',
    name: 'Snacks & Treats',
    description: 'Processed snacks, sweets, and convenience foods',
    color: '#FF6348',
    icon: '🍪',
    nutritionalFocus: ['Calories', 'Sugar', 'Sodium', 'Processed ingredients'],
    commonFoods: ['chips', 'cookies', 'candy', 'crackers', 'ice cream'],
    healthBenefits: ['Occasional enjoyment', 'Quick energy'],
    pcosRecommendation: 'limited',
    glycemicImpact: 'high'
  },
  
  legumes: {
    id: 'legumes',
    name: 'Legumes',
    description: 'Beans, lentils, peas, and other leguminous plants',
    color: '#7D5BA6',
    icon: '🫘',
    nutritionalFocus: ['Protein', 'Fiber', 'Folate', 'Iron', 'Complex Carbs'],
    commonFoods: ['black bean', 'lentil', 'chickpea', 'kidney bean', 'pea'],
    healthBenefits: ['Blood sugar control', 'Heart health', 'Digestive health'],
    pcosRecommendation: 'excellent',
    glycemicImpact: 'low'
  },
  
  herbs: {
    id: 'herbs',
    name: 'Herbs & Spices',
    description: 'Fresh and dried herbs, spices, and seasonings',
    color: '#2ECC71',
    icon: '🌿',
    nutritionalFocus: ['Antioxidants', 'Anti-inflammatory compounds', 'Minerals'],
    commonFoods: ['garlic', 'ginger', 'turmeric', 'cinnamon', 'basil'],
    healthBenefits: ['Anti-inflammatory', 'Immune support', 'Flavor enhancement'],
    pcosRecommendation: 'excellent',
    glycemicImpact: 'low'
  }
};

// Database category mapping from SQL to our category IDs
const databaseCategoryMapping: Record<string, string> = {
  'Proteins': 'protein',
  'Starches': 'grains',
  'Vegetables': 'vegetables',
  'Fruits': 'fruits',
  'Dairy': 'dairy',
  'Nuts and Seeds': 'nutsSeeds',
  'Fats and Oils': 'fatsOils',
  'Beverages': 'beverages',
  'Legumes': 'legumes',
  'Herbs and Spices': 'herbs',
  'Snacks': 'snacks'
};

export function categorizeFoodByName(foodName: string, databaseCategory?: string): string {
  // First, check if we have a database category and map it
  if (databaseCategory && databaseCategoryMapping[databaseCategory]) {
    return databaseCategoryMapping[databaseCategory];
  }
  
  const name = foodName.toLowerCase();
  
  // Check each category's common foods
  for (const [categoryId, category] of Object.entries(foodCategories)) {
    if (category.commonFoods.some(food => name.includes(food))) {
      return categoryId;
    }
  }
  
  // Enhanced keyword matching with Nigerian foods and more comprehensive terms
  if (name.includes('fruit') || name.includes('berry') || 
      ['apple', 'banana', 'orange', 'grape', 'pear', 'peach', 'plum', 'mango', 'pineapple', 'watermelon', 'paw paw', 'coconut'].some(fruit => name.includes(fruit))) {
    return 'fruits';
  }
  
  if (name.includes('vegetable') || name.includes('green') || name.includes('leaf') ||
      ['lettuce', 'cucumber', 'onion', 'garlic', 'celery', 'kale', 'spinach', 'broccoli', 'cabbage', 'tomato', 'pepper', 'okra', 'ugwu', 'bitter leaf'].some(veg => name.includes(veg))) {
    return 'vegetables';
  }
  
  if (['meat', 'chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'egg', 'tofu', 'turkey', 'goat', 'mutton', 'catfish', 'tilapia', 'mackerel'].some(protein => name.includes(protein))) {
    return 'protein';
  }
  
  if (['rice', 'bread', 'pasta', 'cereal', 'oat', 'wheat', 'potato', 'yam', 'cassava', 'plantain', 'fufu', 'garri', 'semolina', 'eba', 'amala'].some(grain => name.includes(grain))) {
    return 'grains';
  }
  
  if (['milk', 'cheese', 'yogurt', 'cream', 'butter', 'wara', 'nono'].some(dairy => name.includes(dairy))) {
    return 'dairy';
  }
  
  if (['nut', 'seed', 'almond', 'walnut', 'cashew', 'peanut', 'groundnut', 'coconut', 'tiger nut'].some(nut => name.includes(nut))) {
    return 'nutsSeeds';
  }
  
  if (['oil', 'fat', 'palm oil', 'olive oil', 'groundnut oil'].some(fat => name.includes(fat))) {
    return 'fatsOils';
  }
  
  if (['drink', 'juice', 'tea', 'coffee', 'water', 'soda', 'zobo', 'kunu', 'fura'].some(beverage => name.includes(beverage))) {
    return 'beverages';
  }
  
  if (['bean', 'lentil', 'pea', 'chickpea', 'black eye', 'cowpea', 'kidney bean'].some(legume => name.includes(legume))) {
    return 'legumes';
  }
  
  if (['spice', 'herb', 'seasoning', 'pepper', 'salt', 'ginger', 'garlic', 'onion', 'curry', 'thyme', 'bay leaf', 'scotch bonnet'].some(spice => name.includes(spice))) {
    return 'herbs';
  }
  
  if (['cookie', 'cake', 'candy', 'chip', 'snack', 'sweet', 'biscuit', 'chin chin', 'puff puff'].some(snack => name.includes(snack))) {
    return 'snacks';
  }
  
  return 'grains'; // Default fallback
}

export function getCategoryInfo(categoryId: string): FoodCategory | null {
  return foodCategories[categoryId] || null;
}

export function getCategoriesForPCOS(): string[] {
  return Object.keys(foodCategories).filter(
    categoryId => foodCategories[categoryId].pcosRecommendation === 'excellent' || 
                  foodCategories[categoryId].pcosRecommendation === 'good'
  );
}

export function getLowGlycemicCategories(): string[] {
  return Object.keys(foodCategories).filter(
    categoryId => foodCategories[categoryId].glycemicImpact === 'low'
  );
}

export function getCategoryColorMap(): Record<string, string> {
  const colorMap: Record<string, string> = {};
  Object.entries(foodCategories).forEach(([id, category]) => {
    colorMap[id] = category.color;
  });
  return colorMap;
}