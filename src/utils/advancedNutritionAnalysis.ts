import { FoodItem, NutrientInfo, NutritionAnalysis } from '../types';
import { calculatePercentage, safeDivide } from './roundingUtils';

export interface DetailedNutritionAnalysis extends NutritionAnalysis {
  micronutrients: {
    fatSolubleVitamins: NutrientInfo[];
    waterSolubleVitamins: NutrientInfo[];
    majorMinerals: NutrientInfo[];
    traceMinerals: NutrientInfo[];
  };
  macronutrientRatios: {
    proteinPercentage: number;
    carbPercentage: number;
    fatPercentage: number;
  };
  nutritionQuality: {
    score: number;
    factors: string[];
    warnings: string[];
    recommendations: string[];
  };
  pcosSpecific: {
    glycemicLoad: number;
    antiInflammatoryScore: number;
    hormoneSupportScore: number;
    recommendations: string[];
  };
  diabetesSpecific: {
    glycemicIndex: number;
    carbImpact: 'low' | 'medium' | 'high';
    bloodSugarResponse: string;
    recommendations: string[];
  };
}

export class NutritionAnalysisEngine {
  private readonly fatSolubleVitamins = ['vitamin-a', 'vitamin-d', 'vitamin-e', 'vitamin-k'];
  private readonly waterSolubleVitamins = ['vitamin-c', 'thiamine', 'riboflavin', 'niacin', 'vitamin-b6', 'folate', 'vitamin-b12', 'pantothenic-acid', 'biotin', 'choline'];
  private readonly majorMinerals = ['calcium', 'phosphorus', 'magnesium', 'sodium', 'potassium', 'chloride', 'sulfur'];
  private readonly traceMinerals = ['iron', 'zinc', 'copper', 'manganese', 'iodine', 'selenium', 'molybdenum', 'chromium', 'fluoride'];

  analyzeDetailed(foods: FoodItem[]): DetailedNutritionAnalysis {
    const basicAnalysis = this.calculateBasicNutrition(foods);
    const micronutrients = this.categorizeMicronutrients(foods);
    const macroRatios = this.calculateMacronutrientRatios(basicAnalysis);
    const qualityScore = this.assessNutritionQuality(foods, basicAnalysis);
    const pcosAnalysis = this.analyzePCOSImpact(foods, basicAnalysis);
    const diabetesAnalysis = this.analyzeDiabetesImpact(foods, basicAnalysis);

    return {
      ...basicAnalysis,
      micronutrients,
      macronutrientRatios: macroRatios,
      nutritionQuality: qualityScore,
      pcosSpecific: pcosAnalysis,
      diabetesSpecific: diabetesAnalysis
    };
  }

  private calculateBasicNutrition(foods: FoodItem[]): NutritionAnalysis {
    const totalCalories = foods.reduce((sum, food) => sum + food.calories, 0);
    
    const allNutrients: Record<string, number> = {};
    const nutrientInfo: Record<string, NutrientInfo> = {};

    foods.forEach(food => {
      food.nutrients.forEach(nutrient => {
        if (!allNutrients[nutrient.id]) {
          allNutrients[nutrient.id] = 0;
          nutrientInfo[nutrient.id] = { ...nutrient, amount: 0 };
        }
        allNutrients[nutrient.id] += nutrient.amount;
      });
    });

    const macronutrients = {
      protein: allNutrients['protein'] || 0,
      carbs: allNutrients['carbs'] || 0,
      fat: allNutrients['fat'] || 0,
      fiber: allNutrients['fiber'] || 0,
    };

    const vitamins: NutrientInfo[] = Object.keys(allNutrients)
      .filter(key => nutrientInfo[key]?.category === 'vitamin')
      .map(key => ({
        ...nutrientInfo[key],
        amount: allNutrients[key]
      }));

    const minerals: NutrientInfo[] = Object.keys(allNutrients)
      .filter(key => nutrientInfo[key]?.category === 'mineral')
      .map(key => ({
        ...nutrientInfo[key],
        amount: allNutrients[key]
      }));

    const dailyValuePercentages: Record<string, number> = {};
    Object.keys(allNutrients).forEach(key => {
      const nutrient = nutrientInfo[key];
      if (nutrient?.dailyValue) {
        dailyValuePercentages[key] = (allNutrients[key] / nutrient.dailyValue) * 100;
      }
    });

    return {
      totalCalories,
      macronutrients,
      vitamins,
      minerals,
      dailyValuePercentages
    };
  }

  private categorizeMicronutrients(foods: FoodItem[]) {
    const allNutrients: Record<string, NutrientInfo> = {};
    
    foods.forEach(food => {
      food.nutrients.forEach(nutrient => {
        if (!allNutrients[nutrient.id]) {
          allNutrients[nutrient.id] = { ...nutrient, amount: 0 };
        }
        allNutrients[nutrient.id].amount += nutrient.amount;
      });
    });

    return {
      fatSolubleVitamins: this.fatSolubleVitamins
        .map(id => allNutrients[id])
        .filter(Boolean),
      waterSolubleVitamins: this.waterSolubleVitamins
        .map(id => allNutrients[id])
        .filter(Boolean),
      majorMinerals: this.majorMinerals
        .map(id => allNutrients[id])
        .filter(Boolean),
      traceMinerals: this.traceMinerals
        .map(id => allNutrients[id])
        .filter(Boolean)
    };
  }

  private calculateMacronutrientRatios(analysis: NutritionAnalysis) {
    const { protein, carbs, fat } = analysis.macronutrients;
    const totalMacroCalories = (protein * 4) + (carbs * 4) + (fat * 9);
    
    if (totalMacroCalories === 0) {
      return { proteinPercentage: 0, carbPercentage: 0, fatPercentage: 0 };
    }

    return {
      proteinPercentage: calculatePercentage(protein * 4, totalMacroCalories),
      carbPercentage: calculatePercentage(carbs * 4, totalMacroCalories),
      fatPercentage: calculatePercentage(fat * 9, totalMacroCalories)
    };
  }

  private assessNutritionQuality(foods: FoodItem[], analysis: NutritionAnalysis) {
    let score = 50; // Base score
    const factors: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Assess variety
    const uniqueCategories = new Set(foods.map(food => food.category));
    if (uniqueCategories.size >= 4) {
      score += 15;
      factors.push('Good food variety across categories');
    } else {
      score -= 5;
      recommendations.push('Include foods from more diverse categories');
    }

    // Assess fiber intake
    const fiberPercentage = analysis.dailyValuePercentages['fiber'] || 0;
    if (fiberPercentage >= 100) {
      score += 10;
      factors.push('Excellent fiber intake');
    } else if (fiberPercentage >= 70) {
      score += 5;
      factors.push('Good fiber intake');
    } else {
      warnings.push('Low fiber intake - may impact digestive health');
      recommendations.push('Add more high-fiber foods like vegetables, fruits, and whole grains');
    }

    // Assess sodium
    const sodiumPercentage = analysis.dailyValuePercentages['sodium'] || 0;
    if (sodiumPercentage > 100) {
      score -= 10;
      warnings.push('High sodium intake - may increase blood pressure risk');
      recommendations.push('Reduce processed foods and added salt');
    } else if (sodiumPercentage < 50) {
      score += 5;
      factors.push('Moderate sodium intake');
    }

    // Assess micronutrient density
    const vitaminCoverage = analysis.vitamins.filter(v => 
      analysis.dailyValuePercentages[v.id] >= 20
    ).length;
    const mineralCoverage = analysis.minerals.filter(m => 
      analysis.dailyValuePercentages[m.id] >= 20
    ).length;

    if (vitaminCoverage >= 5 && mineralCoverage >= 5) {
      score += 15;
      factors.push('Rich in essential vitamins and minerals');
    } else if (vitaminCoverage >= 3 && mineralCoverage >= 3) {
      score += 5;
      factors.push('Good micronutrient profile');
    } else {
      recommendations.push('Include more nutrient-dense foods');
    }

    // Normalize score
    score = Math.max(0, Math.min(100, score));

    return { score, factors, warnings, recommendations };
  }

  private analyzePCOSImpact(foods: FoodItem[], analysis: NutritionAnalysis) {
    const recommendations: string[] = [];
    
    // Calculate glycemic load (simplified)
    const totalCarbs = analysis.macronutrients.carbs;
    const glycemicLoad = this.estimateGlycemicLoad(foods, totalCarbs);
    
    // Anti-inflammatory score
    let antiInflammatoryScore = 50;
    const vegetableCount = foods.filter(f => f.category === 'vegetables').length;
    const fruitCount = foods.filter(f => f.category === 'fruits').length;
    const processedCount = foods.filter(f => f.category === 'snacks').length;
    
    antiInflammatoryScore += (vegetableCount * 10) + (fruitCount * 5) - (processedCount * 15);
    antiInflammatoryScore = Math.max(0, Math.min(100, antiInflammatoryScore));

    // Hormone support score
    let hormoneSupportScore = 50;
    const proteinPercentage = calculatePercentage(analysis.macronutrients.protein * 4, analysis.totalCalories);
    const fiberAmount = analysis.macronutrients.fiber;
    
    if (proteinPercentage >= 20) hormoneSupportScore += 15;
    if (fiberAmount >= 25) hormoneSupportScore += 10;
    if (analysis.dailyValuePercentages['vitamin-d'] >= 50) hormoneSupportScore += 10;
    if (analysis.dailyValuePercentages['magnesium'] >= 50) hormoneSupportScore += 10;
    
    hormoneSupportScore = Math.max(0, Math.min(100, hormoneSupportScore));

    // Generate recommendations
    if (glycemicLoad > 20) {
      recommendations.push('Consider reducing high-glycemic foods to help manage insulin levels');
    }
    if (proteinPercentage < 20) {
      recommendations.push('Increase protein intake to support hormone balance');
    }
    if (fiberAmount < 25) {
      recommendations.push('Add more fiber-rich foods to help regulate blood sugar');
    }
    if (analysis.dailyValuePercentages['magnesium'] < 50) {
      recommendations.push('Include magnesium-rich foods like leafy greens and nuts');
    }

    return {
      glycemicLoad,
      antiInflammatoryScore,
      hormoneSupportScore,
      recommendations
    };
  }

  private analyzeDiabetesImpact(foods: FoodItem[], analysis: NutritionAnalysis) {
    const recommendations: string[] = [];
    
    // Estimate glycemic index (simplified)
    const glycemicIndex = this.estimateGlycemicIndex(foods);
    
    // Determine carb impact
    const totalCarbs = analysis.macronutrients.carbs;
    const carbImpact: 'low' | 'medium' | 'high' = 
      totalCarbs < 30 ? 'low' : 
      totalCarbs < 60 ? 'medium' : 'high';

    // Blood sugar response
    let bloodSugarResponse = '';
    if (glycemicIndex < 55 && carbImpact === 'low') {
      bloodSugarResponse = 'Minimal impact on blood sugar';
    } else if (glycemicIndex < 70 && carbImpact !== 'high') {
      bloodSugarResponse = 'Moderate impact on blood sugar';
    } else {
      bloodSugarResponse = 'Significant impact on blood sugar - monitor closely';
    }

    // Generate recommendations
    if (glycemicIndex > 70) {
      recommendations.push('Choose lower glycemic index foods to better control blood sugar');
    }
    if (carbImpact === 'high') {
      recommendations.push('Consider reducing total carbohydrate intake');
    }
    if (analysis.macronutrients.fiber < 10) {
      recommendations.push('Increase fiber intake to slow glucose absorption');
    }

    return {
      glycemicIndex,
      carbImpact,
      bloodSugarResponse,
      recommendations
    };
  }

  private estimateGlycemicLoad(foods: FoodItem[], totalCarbs: number): number {
    // Simplified GL calculation: average GI * carbs / 100
    let weightedGI = 0;
    let totalWeight = 0;

    foods.forEach(food => {
      const foodCarbs = food.nutrients.find(n => n.id === 'carbs')?.amount || 0;
      if (foodCarbs > 0) {
        const gi = this.getFoodGI(food.category, food.name);
        weightedGI += gi * foodCarbs;
        totalWeight += foodCarbs;
      }
    });

    const averageGI = totalWeight > 0 ? weightedGI / totalWeight : 50;
    return (averageGI * totalCarbs) / 100;
  }

  private estimateGlycemicIndex(foods: FoodItem[]): number {
    let weightedGI = 0;
    let totalWeight = 0;

    foods.forEach(food => {
      const foodCarbs = food.nutrients.find(n => n.id === 'carbs')?.amount || 0;
      if (foodCarbs > 0) {
        const gi = this.getFoodGI(food.category, food.name);
        weightedGI += gi * foodCarbs;
        totalWeight += foodCarbs;
      }
    });

    return totalWeight > 0 ? weightedGI / totalWeight : 50;
  }

  private getFoodGI(category: string, name: string): number {
    // Simplified GI lookup - in a real app, this would be a comprehensive database
    const giMap: Record<string, number> = {
      // Fruits (generally medium GI)
      'fruits': 35,
      'apple': 36,
      'banana': 51,
      'orange': 45,
      
      // Vegetables (generally low GI)
      'vegetables': 15,
      'broccoli': 10,
      'spinach': 15,
      'carrot': 47,
      
      // Grains (varies widely)
      'grains': 60,
      'rice': 73,
      'brown rice': 68,
      'bread': 75,
      'quinoa': 53,
      'oats': 55,
      
      // Protein (very low/no carbs)
      'protein': 0,
      
      // Dairy
      'dairy': 25,
      'milk': 39,
      'yogurt': 41,
      
      // Legumes
      'legumes': 28,
      
      // Nuts & Seeds
      'nutsSeeds': 15,
      
      // Snacks (generally high)
      'snacks': 70
    };

    const lowerName = name.toLowerCase();
    return giMap[lowerName] || giMap[category] || 50;
  }
}

export const nutritionEngine = new NutritionAnalysisEngine();