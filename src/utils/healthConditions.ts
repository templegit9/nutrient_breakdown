import { FoodItem, NutrientInfo } from '../types';
import { foodCategories } from './foodCategories';
import { calculatePercentage } from './roundingUtils';

export interface PCOSRecommendations {
  score: number;
  glycemicLoad: number;
  antiInflammatoryScore: number;
  hormoneSupportScore: number;
  insulinImpact: 'low' | 'moderate' | 'high';
  recommendations: string[];
  warnings: string[];
  mealTiming: string[];
}

export interface DiabetesRecommendations {
  score: number;
  glycemicIndex: number;
  carbLoad: number;
  bloodSugarImpact: 'minimal' | 'moderate' | 'significant';
  insulinResponse: 'low' | 'moderate' | 'high';
  recommendations: string[];
  warnings: string[];
  portionAdvice: string[];
}

export interface FertilityRecommendations {
  score: number;
  reproductiveHealth: number;
  hormonalBalance: number;
  nutritionalSupport: 'optimal' | 'good' | 'needs_improvement';
  recommendations: string[];
  warnings: string[];
  supplementAdvice: string[];
}

export interface HealthConditionInsights {
  pcos: PCOSRecommendations;
  diabetes: DiabetesRecommendations;
  femaleFertility?: FertilityRecommendations;
  maleFertility?: FertilityRecommendations;
  generalHealth: {
    inflammationLevel: 'low' | 'moderate' | 'high';
    oxidativeStress: 'low' | 'moderate' | 'high';
    metabolicHealth: number;
    recommendations: string[];
  };
}

export class HealthConditionAnalyzer {
  // Comprehensive glycemic index database
  private glycemicIndexDB: Record<string, number> = {
    // Fruits
    'apple': 36,
    'banana': 51,
    'orange': 45,
    'grape': 46,
    'strawberry': 40,
    'blueberry': 53,
    'pineapple': 59,
    'watermelon': 72,
    'mango': 51,
    'peach': 43,

    // Vegetables
    'broccoli': 10,
    'spinach': 15,
    'kale': 15,
    'carrot': 47,
    'sweet potato': 63,
    'potato': 78,
    'corn': 52,
    'peas': 48,
    'beetroot': 61,

    // Grains & Starches
    'white rice': 73,
    'brown rice': 68,
    'quinoa': 53,
    'oats': 55,
    'barley': 28,
    'white bread': 75,
    'whole wheat bread': 74,
    'pasta': 49,
    'buckwheat': 45,

    // Legumes
    'lentils': 32,
    'chickpeas': 33,
    'black beans': 30,
    'kidney beans': 24,
    'soybeans': 16,

    // Dairy
    'milk': 39,
    'yogurt': 41,
    'cheese': 15,

    // Nuts & Seeds
    'almonds': 15,
    'walnuts': 15,
    'peanuts': 7,

    // Proteins
    'chicken': 0,
    'beef': 0,
    'fish': 0,
    'egg': 0,
    'tofu': 15,

    // Processed foods
    'cookies': 77,
    'crackers': 74,
    'chips': 56,
    'cake': 76,
    'ice cream': 51
  };

  // Anti-inflammatory foods scoring
  private antiInflammatoryFoods: Record<string, number> = {
    'spinach': 10,
    'kale': 10,
    'broccoli': 8,
    'blueberry': 9,
    'strawberry': 8,
    'salmon': 10,
    'mackerel': 10,
    'walnuts': 8,
    'almonds': 6,
    'olive oil': 9,
    'avocado': 7,
    'tomato': 6,
    'bell pepper': 6,
    'ginger': 9,
    'turmeric': 10,
    'green tea': 8
  };

  // Pro-inflammatory foods (negative scores)
  private proInflammatoryFoods: Record<string, number> = {
    'sugar': -8,
    'white bread': -6,
    'processed meat': -7,
    'fried food': -8,
    'soda': -7,
    'cookies': -6,
    'cake': -6,
    'chips': -5,
    'candy': -7
  };

  analyzePCOS(foods: FoodItem[]): PCOSRecommendations {
    const glycemicLoad = this.calculateGlycemicLoad(foods);
    const antiInflammatoryScore = this.calculateAntiInflammatoryScore(foods);
    const hormoneSupportScore = this.calculateHormoneSupportScore(foods);
    
    let score = 50; // Base score
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const mealTiming: string[] = [];

    // Assess glycemic load impact
    const insulinImpact = glycemicLoad < 10 ? 'low' : glycemicLoad < 20 ? 'moderate' : 'high';
    
    if (glycemicLoad > 20) {
      score -= 20;
      warnings.push('High glycemic load may worsen insulin resistance');
      recommendations.push('Replace high-GI foods with low-GI alternatives');
      recommendations.push('Consider portion control for carbohydrate-rich foods');
      mealTiming.push('Eat high-carb foods earlier in the day when insulin sensitivity is higher');
    } else if (glycemicLoad < 10) {
      score += 15;
      recommendations.push('Excellent glycemic control - maintain this pattern');
    }

    // Assess anti-inflammatory score
    if (antiInflammatoryScore > 70) {
      score += 15;
      recommendations.push('Great anti-inflammatory food choices');
    } else if (antiInflammatoryScore < 30) {
      score -= 10;
      warnings.push('Diet may promote inflammation');
      recommendations.push('Add more omega-3 rich foods like fatty fish');
      recommendations.push('Include colorful vegetables and berries');
    }

    // Assess hormone support
    if (hormoneSupportScore > 70) {
      score += 10;
    } else if (hormoneSupportScore < 40) {
      score -= 10;
      recommendations.push('Include more hormone-supporting nutrients');
      recommendations.push('Add magnesium-rich foods like leafy greens');
      recommendations.push('Consider chromium-rich foods for insulin sensitivity');
    }

    // Fiber assessment
    const totalFiber = this.getTotalNutrient(foods, 'fiber');
    if (totalFiber < 25) {
      warnings.push('Low fiber intake may affect hormone metabolism');
      recommendations.push('Increase fiber intake to support hormone balance');
      mealTiming.push('Include fiber-rich foods at each meal to slow glucose absorption');
    } else {
      score += 5;
    }

    // Protein assessment
    const proteinRatio = this.getProteinRatio(foods);
    if (proteinRatio < 15) {
      recommendations.push('Increase protein intake to support stable blood sugar');
      mealTiming.push('Include protein at every meal to improve satiety');
    } else if (proteinRatio > 20) {
      score += 5;
      recommendations.push('Good protein intake for PCOS management');
    }

    // Specific PCOS nutrients
    const vitamin_d = this.getTotalNutrient(foods, 'vitamin-d');
    const magnesium = this.getTotalNutrient(foods, 'magnesium');
    const chromium = this.getTotalNutrient(foods, 'chromium');

    if (vitamin_d < 10) {
      recommendations.push('Consider vitamin D-rich foods or supplementation');
    }
    if (magnesium < 200) {
      recommendations.push('Add magnesium-rich foods like nuts, seeds, and leafy greens');
    }

    // Meal timing recommendations
    mealTiming.push('Eat regular meals every 3-4 hours to maintain stable blood sugar');
    mealTiming.push('Consider a protein-rich breakfast to set metabolic tone for the day');
    mealTiming.push('Limit refined carbs in evening meals');

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      glycemicLoad,
      antiInflammatoryScore,
      hormoneSupportScore,
      insulinImpact,
      recommendations,
      warnings,
      mealTiming
    };
  }

  analyzeDiabetes(foods: FoodItem[]): DiabetesRecommendations {
    const glycemicIndex = this.calculateWeightedGlycemicIndex(foods);
    const carbLoad = this.getTotalNutrient(foods, 'carbs');
    
    let score = 50;
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const portionAdvice: string[] = [];

    // Assess blood sugar impact
    const bloodSugarImpact = this.assessBloodSugarImpact(glycemicIndex, carbLoad);
    const insulinResponse = this.assessInsulinResponse(foods);

    // GI assessment
    if (glycemicIndex > 70) {
      score -= 25;
      warnings.push('High glycemic index foods may cause blood sugar spikes');
      recommendations.push('Choose lower GI alternatives when possible');
      portionAdvice.push('Use smaller portions of high-GI foods');
    } else if (glycemicIndex < 55) {
      score += 15;
      recommendations.push('Excellent glycemic index control');
    } else {
      score -= 5;
      recommendations.push('Consider mixing high-GI foods with protein or healthy fats');
    }

    // Carb load assessment
    if (carbLoad > 60) {
      score -= 15;
      warnings.push('High carbohydrate load may challenge blood glucose control');
      recommendations.push('Consider carbohydrate counting and portion control');
      portionAdvice.push('Limit carbohydrate portions to 45-60g per meal');
    } else if (carbLoad < 30) {
      score += 10;
      recommendations.push('Good carbohydrate portion control');
    }

    // Fiber assessment for diabetes
    const fiber = this.getTotalNutrient(foods, 'fiber');
    if (fiber > 25) {
      score += 10;
      recommendations.push('Excellent fiber intake for blood sugar control');
    } else if (fiber < 15) {
      warnings.push('Low fiber may lead to faster glucose absorption');
      recommendations.push('Add more high-fiber foods to slow glucose absorption');
    }

    // Protein assessment
    const proteinRatio = this.getProteinRatio(foods);
    if (proteinRatio > 20) {
      score += 5;
      recommendations.push('Good protein intake helps stabilize blood sugar');
    } else if (proteinRatio < 15) {
      recommendations.push('Increase protein to help moderate blood glucose response');
      portionAdvice.push('Include 20-30g protein at each meal');
    }

    // Fat quality assessment
    const saturatedFat = this.getTotalNutrient(foods, 'saturated-fat');
    const totalFat = this.getTotalNutrient(foods, 'fat');
    if (saturatedFat / totalFat > 0.4) {
      warnings.push('High saturated fat may worsen insulin resistance');
      recommendations.push('Choose more unsaturated fats like nuts, olive oil, and avocado');
    }

    // Sodium assessment
    const sodium = this.getTotalNutrient(foods, 'sodium');
    if (sodium > 2300) {
      warnings.push('High sodium intake may increase cardiovascular risk');
      recommendations.push('Reduce processed foods and added salt');
    }

    // Portion advice
    portionAdvice.push('Use the plate method: 1/2 vegetables, 1/4 protein, 1/4 starch');
    portionAdvice.push('Monitor blood glucose 2 hours after meals');
    portionAdvice.push('Consider eating smaller, more frequent meals');

    score = Math.max(0, Math.min(100, score));

    return {
      score,
      glycemicIndex,
      carbLoad,
      bloodSugarImpact,
      insulinResponse,
      recommendations,
      warnings,
      portionAdvice
    };
  }

  analyzeGeneralHealth(foods: FoodItem[]): HealthConditionInsights['generalHealth'] {
    const inflammationLevel = this.assessInflammationLevel(foods);
    const oxidativeStress = this.assessOxidativeStress(foods);
    const metabolicHealth = this.calculateMetabolicHealth(foods);
    
    const recommendations: string[] = [];

    if (inflammationLevel === 'high') {
      recommendations.push('Add more anti-inflammatory foods like fatty fish and colorful vegetables');
      recommendations.push('Reduce processed foods and added sugars');
    }

    if (oxidativeStress === 'high') {
      recommendations.push('Increase antioxidant-rich foods like berries and leafy greens');
      recommendations.push('Consider foods high in vitamins C and E');
    }

    if (metabolicHealth < 60) {
      recommendations.push('Focus on whole foods and balanced macronutrients');
      recommendations.push('Consider intermittent fasting or time-restricted eating');
    }

    return {
      inflammationLevel,
      oxidativeStress,
      metabolicHealth,
      recommendations
    };
  }

  private calculateGlycemicLoad(foods: FoodItem[]): number {
    let totalGL = 0;
    
    foods.forEach(food => {
      const carbs = this.getFoodNutrient(food, 'carbs');
      const gi = this.getFoodGI(food);
      const gl = (gi * carbs) / 100;
      totalGL += gl;
    });

    return totalGL;
  }

  private calculateWeightedGlycemicIndex(foods: FoodItem[]): number {
    let weightedGI = 0;
    let totalCarbs = 0;

    foods.forEach(food => {
      const carbs = this.getFoodNutrient(food, 'carbs');
      if (carbs > 0) {
        const gi = this.getFoodGI(food);
        weightedGI += gi * carbs;
        totalCarbs += carbs;
      }
    });

    return totalCarbs > 0 ? weightedGI / totalCarbs : 50;
  }

  private calculateAntiInflammatoryScore(foods: FoodItem[]): number {
    let score = 50; // Base score
    
    foods.forEach(food => {
      const foodName = food.name.toLowerCase();
      const category = food.category;
      
      // Check specific anti-inflammatory foods
      Object.keys(this.antiInflammatoryFoods).forEach(antiFood => {
        if (foodName.includes(antiFood)) {
          score += this.antiInflammatoryFoods[antiFood];
        }
      });

      // Check pro-inflammatory foods
      Object.keys(this.proInflammatoryFoods).forEach(proFood => {
        if (foodName.includes(proFood)) {
          score += this.proInflammatoryFoods[proFood];
        }
      });

      // Category-based scoring
      if (category === 'vegetables') score += 5;
      if (category === 'fruits') score += 3;
      if (category === 'nutsSeeds') score += 4;
      if (category === 'snacks') score -= 5;
    });

    return Math.max(0, Math.min(100, score));
  }

  private calculateHormoneSupportScore(foods: FoodItem[]): number {
    let score = 50;
    
    const fiber = this.getTotalNutrient(foods, 'fiber');
    const protein = this.getTotalNutrient(foods, 'protein');
    const magnesium = this.getTotalNutrient(foods, 'magnesium');
    const vitaminD = this.getTotalNutrient(foods, 'vitamin-d');
    const omega3 = this.getTotalNutrient(foods, 'omega-3');

    // Fiber supports hormone metabolism
    if (fiber > 25) score += 15;
    else if (fiber < 15) score -= 10;

    // Protein supports stable blood sugar
    const proteinRatio = this.getProteinRatio(foods);
    if (proteinRatio > 20) score += 10;
    else if (proteinRatio < 15) score -= 10;

    // Micronutrients important for PCOS
    if (magnesium > 200) score += 5;
    if (vitaminD > 10) score += 5;
    if (omega3 > 1) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  private assessBloodSugarImpact(gi: number, carbLoad: number): 'minimal' | 'moderate' | 'significant' {
    const impact = (gi / 100) * carbLoad;
    
    if (impact < 15) return 'minimal';
    if (impact < 30) return 'moderate';
    return 'significant';
  }

  private assessInsulinResponse(foods: FoodItem[]): 'low' | 'moderate' | 'high' {
    const gl = this.calculateGlycemicLoad(foods);
    const proteinRatio = this.getProteinRatio(foods);
    const fiber = this.getTotalNutrient(foods, 'fiber');
    
    // Calculate insulin response based on GL, protein, and fiber
    let response = gl;
    if (proteinRatio > 20) response -= 5;
    if (fiber > 20) response -= 5;
    
    if (response < 10) return 'low';
    if (response < 20) return 'moderate';
    return 'high';
  }

  private assessInflammationLevel(foods: FoodItem[]): 'low' | 'moderate' | 'high' {
    const score = this.calculateAntiInflammatoryScore(foods);
    
    if (score > 70) return 'low';
    if (score > 40) return 'moderate';
    return 'high';
  }

  private assessOxidativeStress(foods: FoodItem[]): 'low' | 'moderate' | 'high' {
    const vitaminC = this.getTotalNutrient(foods, 'vitamin-c');
    const vitaminE = this.getTotalNutrient(foods, 'vitamin-e');
    const antioxidants = this.getTotalNutrient(foods, 'antioxidants');
    
    let score = 0;
    if (vitaminC > 70) score += 20;
    if (vitaminE > 10) score += 20;
    if (antioxidants > 5) score += 20;
    
    // Vegetable and fruit count
    const veggieCount = foods.filter(f => f.category === 'vegetables').length;
    const fruitCount = foods.filter(f => f.category === 'fruits').length;
    score += (veggieCount + fruitCount) * 5;
    
    if (score > 60) return 'low';
    if (score > 30) return 'moderate';
    return 'high';
  }

  private calculateMetabolicHealth(foods: FoodItem[]): number {
    let score = 50;
    
    const gi = this.calculateWeightedGlycemicIndex(foods);
    const proteinRatio = this.getProteinRatio(foods);
    const fiber = this.getTotalNutrient(foods, 'fiber');
    const processedCount = foods.filter(f => f.category === 'snacks').length;
    
    // Lower GI is better for metabolic health
    if (gi < 55) score += 20;
    else if (gi > 70) score -= 20;
    
    // Adequate protein
    if (proteinRatio > 15) score += 10;
    
    // High fiber
    if (fiber > 25) score += 15;
    
    // Minimal processed foods
    score -= processedCount * 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private getFoodGI(food: FoodItem): number {
    const foodName = food.name.toLowerCase();
    
    // Check specific food first
    for (const [key, gi] of Object.entries(this.glycemicIndexDB)) {
      if (foodName.includes(key)) {
        return gi;
      }
    }
    
    // Fall back to category defaults
    const categoryGI: Record<string, number> = {
      'fruits': 45,
      'vegetables': 20,
      'grains': 65,
      'protein': 0,
      'dairy': 35,
      'nutsSeeds': 15,
      'legumes': 30,
      'snacks': 70
    };
    
    return categoryGI[food.category] || 50;
  }

  private getFoodNutrient(food: FoodItem, nutrientId: string): number {
    const nutrient = food.nutrients.find(n => n.id === nutrientId);
    return nutrient?.amount || 0;
  }

  private getTotalNutrient(foods: FoodItem[], nutrientId: string): number {
    return foods.reduce((total, food) => {
      return total + this.getFoodNutrient(food, nutrientId);
    }, 0);
  }

  private getProteinRatio(foods: FoodItem[]): number {
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
    const totalProtein = this.getTotalNutrient(foods, 'protein');
    
    if (totalCalories === 0) return 0;
    return calculatePercentage(totalProtein * 4, totalCalories);
  }

  analyzeFemaleFertility(foods: FoodItem[]): FertilityRecommendations {
    let score = 50;
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const supplementAdvice: string[] = [];

    // Key nutrients for female fertility
    const folate = this.getTotalNutrient(foods, 'folate');
    const iron = this.getTotalNutrient(foods, 'iron');
    const vitaminD = this.getTotalNutrient(foods, 'vitamin-d');
    const omega3 = this.getTotalNutrient(foods, 'omega-3');
    const antioxidants = this.calculateAntioxidantScore(foods);

    // Folate assessment
    if (folate < 400) {
      score -= 15;
      warnings.push('Low folate intake may affect egg quality and neural tube development');
      recommendations.push('Include more folate-rich foods like leafy greens, legumes, and fortified grains');
      supplementAdvice.push('Consider prenatal vitamin with 800mcg folate');
    } else if (folate > 600) {
      score += 10;
      recommendations.push('Excellent folate intake for reproductive health');
    }

    // Iron assessment
    if (iron < 18) {
      score -= 10;
      recommendations.push('Increase iron-rich foods to support ovulation');
      recommendations.push('Pair iron sources with vitamin C for better absorption');
    } else if (iron > 25) {
      score += 5;
    }

    // Vitamin D assessment
    if (vitaminD < 600) {
      score -= 10;
      warnings.push('Low vitamin D may affect ovulation and implantation');
      supplementAdvice.push('Consider vitamin D3 supplementation (2000-4000 IU)');
    }

    // Omega-3 assessment
    if (omega3 < 1000) {
      score -= 8;
      recommendations.push('Add fatty fish or omega-3 supplements for hormone balance');
    } else if (omega3 > 2000) {
      score += 8;
      recommendations.push('Great omega-3 intake supporting reproductive health');
    }

    // Antioxidant assessment
    if (antioxidants < 50) {
      score -= 10;
      recommendations.push('Increase colorful fruits and vegetables for egg protection');
    } else if (antioxidants > 80) {
      score += 10;
    }

    // Fertility-specific food recommendations
    const fertilityFoods = ['avocado', 'nuts', 'seeds', 'berries', 'leafy greens', 'fatty fish'];
    const fertilityFoodCount = fertilityFoods.filter(food => 
      foods.some(f => f.name.toLowerCase().includes(food))
    ).length;

    if (fertilityFoodCount < 3) {
      score -= 5;
      recommendations.push('Include more fertility-supporting foods like avocados, nuts, and berries');
    } else if (fertilityFoodCount >= 5) {
      score += 10;
    }

    // Harmful foods assessment
    const harmfulFoods = ['alcohol', 'excessive caffeine', 'trans fat', 'high mercury'];
    const hasHarmfulFoods = harmfulFoods.some(food => 
      foods.some(f => f.name.toLowerCase().includes(food.split(' ')[0]))
    );

    if (hasHarmfulFoods) {
      score -= 15;
      warnings.push('Avoid alcohol, excessive caffeine, and high-mercury fish when trying to conceive');
    }

    const reproductiveHealth = Math.max(0, Math.min(100, score + (antioxidants / 2)));
    const hormonalBalance = Math.max(0, Math.min(100, score + (omega3 / 50)));
    
    let nutritionalSupport: 'optimal' | 'good' | 'needs_improvement';
    if (score >= 80) nutritionalSupport = 'optimal';
    else if (score >= 60) nutritionalSupport = 'good';
    else nutritionalSupport = 'needs_improvement';

    // General recommendations
    recommendations.push('Maintain healthy weight with BMI 18.5-24.9');
    recommendations.push('Limit processed foods and focus on whole foods');
    
    if (supplementAdvice.length === 0) {
      supplementAdvice.push('Consider prenatal vitamins 3 months before conception');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      reproductiveHealth,
      hormonalBalance,
      nutritionalSupport,
      recommendations,
      warnings,
      supplementAdvice
    };
  }

  analyzeMaleFertility(foods: FoodItem[]): FertilityRecommendations {
    let score = 50;
    const recommendations: string[] = [];
    const warnings: string[] = [];
    const supplementAdvice: string[] = [];

    // Key nutrients for male fertility
    const zinc = this.getTotalNutrient(foods, 'zinc');
    const selenium = this.getTotalNutrient(foods, 'selenium');
    const vitaminC = this.getTotalNutrient(foods, 'vitamin-c');
    const vitaminE = this.getTotalNutrient(foods, 'vitamin-e');
    const folate = this.getTotalNutrient(foods, 'folate');
    const antioxidants = this.calculateAntioxidantScore(foods);

    // Zinc assessment (crucial for sperm production)
    if (zinc < 11) {
      score -= 20;
      warnings.push('Low zinc intake may severely impact sperm production and testosterone');
      recommendations.push('Include zinc-rich foods like oysters, beef, pumpkin seeds');
      supplementAdvice.push('Consider zinc supplementation (15-30mg daily)');
    } else if (zinc > 15) {
      score += 15;
      recommendations.push('Excellent zinc intake for sperm health');
    }

    // Selenium assessment
    if (selenium < 55) {
      score -= 15;
      recommendations.push('Add selenium-rich foods like Brazil nuts and fish');
      supplementAdvice.push('2-3 Brazil nuts daily provide adequate selenium');
    } else if (selenium > 100) {
      score += 10;
    }

    // Vitamin C assessment
    if (vitaminC < 90) {
      score -= 10;
      recommendations.push('Increase vitamin C intake to protect sperm from DNA damage');
    } else if (vitaminC > 500) {
      score += 8;
    }

    // Vitamin E assessment
    if (vitaminE < 15) {
      score -= 8;
      recommendations.push('Include vitamin E sources like nuts and seeds');
    }

    // Folate assessment
    if (folate < 400) {
      score -= 10;
      recommendations.push('Adequate folate important for sperm DNA integrity');
    }

    // Antioxidant assessment
    if (antioxidants < 50) {
      score -= 12;
      recommendations.push('Increase antioxidant-rich foods to protect sperm from oxidative stress');
    } else if (antioxidants > 80) {
      score += 12;
    }

    // Male fertility-specific foods
    const maleFertilityFoods = ['oysters', 'pumpkin seeds', 'walnuts', 'tomatoes', 'brazil nuts'];
    const maleFertilityFoodCount = maleFertilityFoods.filter(food => 
      foods.some(f => f.name.toLowerCase().includes(food.replace(' ', '')))
    ).length;

    if (maleFertilityFoodCount < 2) {
      score -= 8;
      recommendations.push('Include more male fertility foods like oysters, nuts, and seeds');
    } else if (maleFertilityFoodCount >= 4) {
      score += 12;
    }

    // Harmful factors
    const processedMeatIntake = foods.filter(f => 
      f.name.toLowerCase().includes('processed') || 
      f.name.toLowerCase().includes('sausage') ||
      f.name.toLowerCase().includes('bacon')
    ).length;

    if (processedMeatIntake > 0) {
      score -= 10;
      warnings.push('Processed meats linked to poor sperm quality');
    }

    const reproductiveHealth = Math.max(0, Math.min(100, score + (zinc * 2)));
    const hormonalBalance = Math.max(0, Math.min(100, score + (antioxidants / 3)));
    
    let nutritionalSupport: 'optimal' | 'good' | 'needs_improvement';
    if (score >= 80) nutritionalSupport = 'optimal';
    else if (score >= 60) nutritionalSupport = 'good';
    else nutritionalSupport = 'needs_improvement';

    // General recommendations
    recommendations.push('Maintain healthy weight to optimize hormone levels');
    recommendations.push('Stay hydrated and limit alcohol consumption');
    recommendations.push('Focus on whole foods and minimize processed foods');
    
    if (supplementAdvice.length === 0) {
      supplementAdvice.push('Consider male fertility supplement with zinc, selenium, and CoQ10');
    }

    return {
      score: Math.max(0, Math.min(100, score)),
      reproductiveHealth,
      hormonalBalance,
      nutritionalSupport,
      recommendations,
      warnings,
      supplementAdvice
    };
  }

  private calculateAntioxidantScore(foods: FoodItem[]): number {
    let score = 0;
    
    // High antioxidant foods
    const antioxidantFoods: Record<string, number> = {
      'blueberry': 15,
      'strawberry': 12,
      'blackberry': 14,
      'raspberry': 12,
      'pomegranate': 18,
      'dark chocolate': 10,
      'green tea': 8,
      'spinach': 10,
      'kale': 12,
      'broccoli': 8,
      'tomato': 6,
      'bell pepper': 6,
      'carrot': 5,
      'sweet potato': 7
    };

    foods.forEach(food => {
      const foodName = food.name.toLowerCase();
      Object.keys(antioxidantFoods).forEach(antioxFood => {
        if (foodName.includes(antioxFood)) {
          score += antioxidantFoods[antioxFood];
        }
      });
    });

    return Math.min(100, score);
  }
}

export const healthAnalyzer = new HealthConditionAnalyzer();