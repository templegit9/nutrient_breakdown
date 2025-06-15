import { GroupedFoodEntry } from '../types/food';

export interface HealthConditionConfig {
  id: string;
  name: string;
  category: string;
  description: string;
  enabled: boolean;
  severity?: 'mild' | 'moderate' | 'severe';
  medications?: string[];
  comorbidities?: string[];
}

export interface NutrientRecommendation {
  nutrient: string;
  target: number;
  unit: string;
  reasoning: string;
  evidenceLevel: 'strong' | 'moderate' | 'limited';
  sources: string[];
}

export interface FoodRecommendation {
  type: 'encourage' | 'limit' | 'avoid';
  foods: string[];
  reasoning: string;
  evidenceLevel: 'strong' | 'moderate' | 'limited';
}

export interface HealthConditionData {
  id: string;
  name: string;
  category: string;
  description: string;
  keyNutrients: NutrientRecommendation[];
  foodRecommendations: FoodRecommendation[];
  mealTimingAdvice?: string;
  supplementAdvice?: string;
  monitoringMetrics: string[];
  drugInteractions?: string[];
  contraindicatedFoods?: string[];
  clinicalNotes?: string;
}

export const HEALTH_CONDITION_CATEGORIES = [
  'Metabolic',
  'Cardiovascular',
  'Digestive',
  'Autoimmune',
  'Mental Health',
  'Kidney & Liver',
  'Bone & Joint',
  'Respiratory',
  'Thyroid & Hormonal',
  'Cancer Support',
  'Pregnancy & Reproductive',
  'Aging & Cognitive'
] as const;

export const EXPANDED_HEALTH_CONDITIONS: HealthConditionData[] = [
  // METABOLIC CONDITIONS
  {
    id: 'type2_diabetes',
    name: 'Type 2 Diabetes',
    category: 'Metabolic',
    description: 'Insulin resistance and impaired glucose metabolism requiring careful carbohydrate management and blood sugar monitoring.',
    keyNutrients: [
      {
        nutrient: 'carbohydrates',
        target: 130,
        unit: 'g',
        reasoning: 'Moderate carb intake (45-65% calories) with emphasis on complex carbs and fiber',
        evidenceLevel: 'strong',
        sources: ['ADA 2023 Standards', 'Cochrane Reviews']
      },
      {
        nutrient: 'fiber',
        target: 35,
        unit: 'g',
        reasoning: 'Soluble fiber improves glycemic control and insulin sensitivity',
        evidenceLevel: 'strong',
        sources: ['JAMA 2019', 'Nutrients 2020']
      },
      {
        nutrient: 'chromium',
        target: 200,
        unit: 'mcg',
        reasoning: 'May improve glucose metabolism and insulin sensitivity',
        evidenceLevel: 'moderate',
        sources: ['Diabetes Care 2018']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['oats', 'quinoa', 'legumes', 'leafy greens', 'berries', 'nuts', 'fatty fish'],
        reasoning: 'Low glycemic index foods that provide sustained energy and beneficial nutrients',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['white rice', 'white bread', 'sugary drinks', 'processed snacks'],
        reasoning: 'High glycemic foods cause rapid blood sugar spikes',
        evidenceLevel: 'strong'
      }
    ],
    mealTimingAdvice: 'Eat 3 balanced meals with 2-3 small snacks. Consistent timing helps regulate blood sugar.',
    monitoringMetrics: ['blood_glucose', 'hba1c', 'weight', 'blood_pressure'],
    drugInteractions: ['Monitor with metformin - high fiber may affect absorption timing'],
    clinicalNotes: 'Consider referral to CDE for complex cases. Monitor for diabetic complications.'
  },

  {
    id: 'pcos',
    name: 'PCOS (Polycystic Ovary Syndrome)',
    category: 'Metabolic',
    description: 'Hormonal disorder affecting reproductive health, often involving insulin resistance and metabolic dysfunction.',
    keyNutrients: [
      {
        nutrient: 'inositol',
        target: 4000,
        unit: 'mg',
        reasoning: 'Myo-inositol improves insulin sensitivity and ovarian function',
        evidenceLevel: 'strong',
        sources: ['Eur Rev Med Pharmacol 2021', 'Gynecol Endocrinol 2020']
      },
      {
        nutrient: 'omega3',
        target: 2000,
        unit: 'mg',
        reasoning: 'Reduces inflammation and may improve hormonal balance',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2021']
      },
      {
        nutrient: 'vitamin_d',
        target: 2000,
        unit: 'IU',
        reasoning: 'PCOS patients often deficient; supplementation may improve insulin resistance',
        evidenceLevel: 'moderate',
        sources: ['Endocrine 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['salmon', 'walnuts', 'chia seeds', 'spinach', 'turmeric', 'green tea'],
        reasoning: 'Anti-inflammatory foods that support hormonal balance',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['refined sugar', 'trans fats', 'high glycemic carbs'],
        reasoning: 'These foods worsen insulin resistance and inflammation',
        evidenceLevel: 'strong'
      }
    ],
    mealTimingAdvice: 'Smaller, frequent meals help manage insulin spikes. Consider intermittent fasting under supervision.',
    monitoringMetrics: ['insulin_levels', 'testosterone', 'weight', 'menstrual_cycle'],
    clinicalNotes: 'Often comorbid with insulin resistance. Monitor for metabolic syndrome development.'
  },

  {
    id: 'metabolic_syndrome',
    name: 'Metabolic Syndrome',
    category: 'Metabolic',
    description: 'Cluster of conditions including high blood pressure, high blood sugar, excess belly fat, and abnormal cholesterol levels.',
    keyNutrients: [
      {
        nutrient: 'fiber',
        target: 40,
        unit: 'g',
        reasoning: 'High fiber intake improves all components of metabolic syndrome',
        evidenceLevel: 'strong',
        sources: ['Am J Clin Nutr 2021']
      },
      {
        nutrient: 'potassium',
        target: 4700,
        unit: 'mg',
        reasoning: 'Helps reduce blood pressure and cardiovascular risk',
        evidenceLevel: 'strong',
        sources: ['Hypertension 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['Mediterranean diet foods', 'whole grains', 'fruits', 'vegetables', 'olive oil'],
        reasoning: 'Mediterranean pattern shown to reverse metabolic syndrome',
        evidenceLevel: 'strong'
      }
    ],
    monitoringMetrics: ['waist_circumference', 'blood_pressure', 'triglycerides', 'hdl_cholesterol', 'fasting_glucose'],
    clinicalNotes: 'Requires comprehensive lifestyle intervention. High cardiovascular risk.'
  },

  // CARDIOVASCULAR CONDITIONS
  {
    id: 'hypertension',
    name: 'Hypertension',
    category: 'Cardiovascular',
    description: 'Elevated blood pressure requiring dietary sodium reduction and emphasis on heart-healthy nutrients.',
    keyNutrients: [
      {
        nutrient: 'sodium',
        target: 1500,
        unit: 'mg',
        reasoning: 'DASH diet recommendation for blood pressure reduction',
        evidenceLevel: 'strong',
        sources: ['NEJM 2020', 'AHA Guidelines 2023']
      },
      {
        nutrient: 'potassium',
        target: 4700,
        unit: 'mg',
        reasoning: 'Potassium counteracts sodium effects and reduces BP',
        evidenceLevel: 'strong',
        sources: ['Hypertension 2019']
      },
      {
        nutrient: 'magnesium',
        target: 420,
        unit: 'mg',
        reasoning: 'Magnesium deficiency linked to hypertension',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2021']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['bananas', 'spinach', 'avocados', 'beets', 'garlic', 'hibiscus tea'],
        reasoning: 'Foods rich in potassium, nitrates, and natural ACE inhibitors',
        evidenceLevel: 'strong'
      },
      {
        type: 'avoid',
        foods: ['processed meats', 'canned soups', 'pickled foods', 'restaurant meals'],
        reasoning: 'High sodium content significantly raises blood pressure',
        evidenceLevel: 'strong'
      }
    ],
    mealTimingAdvice: 'Consistent meal times help regulate circadian blood pressure patterns.',
    drugInteractions: ['ACE inhibitors + high potassium foods = monitor electrolytes'],
    monitoringMetrics: ['systolic_bp', 'diastolic_bp', 'pulse_pressure'],
    clinicalNotes: 'DASH diet compliance critical. Monitor for white coat hypertension.'
  },

  {
    id: 'high_cholesterol',
    name: 'High Cholesterol',
    category: 'Cardiovascular',
    description: 'Elevated blood cholesterol requiring dietary modification to reduce cardiovascular risk.',
    keyNutrients: [
      {
        nutrient: 'saturated_fat',
        target: 13,
        unit: 'g',
        reasoning: 'Limit to <7% of total calories to reduce LDL cholesterol',
        evidenceLevel: 'strong',
        sources: ['ACC/AHA Guidelines 2019']
      },
      {
        nutrient: 'plant_sterols',
        target: 2000,
        unit: 'mg',
        reasoning: 'Plant sterols can reduce LDL cholesterol by 5-15%',
        evidenceLevel: 'strong',
        sources: ['Eur Heart J 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['oats', 'barley', 'beans', 'eggplant', 'okra', 'almonds'],
        reasoning: 'Soluble fiber and plant sterols reduce cholesterol absorption',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['red meat', 'full-fat dairy', 'fried foods', 'trans fats'],
        reasoning: 'High in saturated and trans fats that raise LDL cholesterol',
        evidenceLevel: 'strong'
      }
    ],
    monitoringMetrics: ['total_cholesterol', 'ldl_cholesterol', 'hdl_cholesterol', 'triglycerides'],
    drugInteractions: ['Statins + grapefruit = avoid grapefruit products'],
    clinicalNotes: 'Focus on LDL targets. Consider familial hypercholesterolemia screening.'
  },

  // DIGESTIVE CONDITIONS
  {
    id: 'ibs',
    name: 'Irritable Bowel Syndrome',
    category: 'Digestive',
    description: 'Functional gastrointestinal disorder requiring careful dietary management, often with FODMAP restriction.',
    keyNutrients: [
      {
        nutrient: 'fiber',
        target: 25,
        unit: 'g',
        reasoning: 'Gradual increase in soluble fiber; insoluble fiber may worsen symptoms',
        evidenceLevel: 'moderate',
        sources: ['Gastroenterology 2021']
      },
      {
        nutrient: 'probiotics',
        target: 1000000000,
        unit: 'CFU',
        reasoning: 'Specific strains may improve IBS symptoms',
        evidenceLevel: 'moderate',
        sources: ['Am J Gastroenterol 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['rice', 'bananas', 'carrots', 'potatoes', 'peppermint tea'],
        reasoning: 'Low FODMAP foods that are generally well-tolerated',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['beans', 'onions', 'garlic', 'apples', 'wheat', 'dairy'],
        reasoning: 'High FODMAP foods that commonly trigger symptoms',
        evidenceLevel: 'strong'
      }
    ],
    mealTimingAdvice: 'Regular meal times, smaller portions, eat slowly, avoid large meals.',
    monitoringMetrics: ['symptom_severity', 'bowel_movement_frequency', 'abdominal_pain'],
    clinicalNotes: 'Consider FODMAP elimination diet with dietitian guidance. Rule out IBD.'
  },

  {
    id: 'crohns_disease',
    name: 'Crohn\'s Disease',
    category: 'Digestive',
    description: 'Inflammatory bowel disease requiring anti-inflammatory nutrition and careful monitoring of nutritional status.',
    keyNutrients: [
      {
        nutrient: 'vitamin_b12',
        target: 2.4,
        unit: 'mcg',
        reasoning: 'Malabsorption common due to ileal involvement',
        evidenceLevel: 'strong',
        sources: ['IBD Guidelines 2021']
      },
      {
        nutrient: 'iron',
        target: 18,
        unit: 'mg',
        reasoning: 'Blood loss and malabsorption lead to iron deficiency',
        evidenceLevel: 'strong',
        sources: ['Inflamm Bowel Dis 2020']
      },
      {
        nutrient: 'zinc',
        target: 15,
        unit: 'mg',
        reasoning: 'Deficiency common and affects wound healing',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2019']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['fatty fish', 'bone broth', 'cooked vegetables', 'rice'],
        reasoning: 'Anti-inflammatory and easily digestible during flares',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['high fiber foods', 'seeds', 'nuts', 'spicy foods'],
        reasoning: 'May worsen symptoms during active inflammation',
        evidenceLevel: 'moderate'
      }
    ],
    monitoringMetrics: ['c_reactive_protein', 'calprotectin', 'weight', 'albumin'],
    drugInteractions: ['Corticosteroids affect calcium/vitamin D metabolism'],
    clinicalNotes: 'Nutritional assessment critical. Consider enteral nutrition during flares.'
  },

  // AUTOIMMUNE CONDITIONS
  {
    id: 'rheumatoid_arthritis',
    name: 'Rheumatoid Arthritis',
    category: 'Autoimmune',
    description: 'Chronic inflammatory arthritis requiring anti-inflammatory nutrition and bone health support.',
    keyNutrients: [
      {
        nutrient: 'omega3',
        target: 3000,
        unit: 'mg',
        reasoning: 'EPA/DHA reduce inflammatory markers and joint pain',
        evidenceLevel: 'strong',
        sources: ['Arthritis Rheumatol 2020']
      },
      {
        nutrient: 'vitamin_d',
        target: 2000,
        unit: 'IU',
        reasoning: 'Deficiency common; important for bone health and immune function',
        evidenceLevel: 'strong',
        sources: ['Rheumatology 2021']
      },
      {
        nutrient: 'antioxidants',
        target: 5000,
        unit: 'ORAC',
        reasoning: 'Counter oxidative stress from chronic inflammation',
        evidenceLevel: 'moderate',
        sources: ['Free Radic Biol Med 2019']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['salmon', 'blueberries', 'turmeric', 'ginger', 'olive oil', 'green tea'],
        reasoning: 'Anti-inflammatory compounds may reduce disease activity',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['processed meats', 'sugar', 'trans fats', 'excessive omega-6 oils'],
        reasoning: 'Pro-inflammatory foods may worsen joint inflammation',
        evidenceLevel: 'moderate'
      }
    ],
    drugInteractions: ['Methotrexate requires folic acid supplementation'],
    monitoringMetrics: ['crp', 'esr', 'joint_count', 'morning_stiffness'],
    clinicalNotes: 'Mediterranean diet pattern shows promise. Monitor for cardiovascular comorbidities.'
  },

  // MENTAL HEALTH CONDITIONS
  {
    id: 'depression',
    name: 'Depression',
    category: 'Mental Health',
    description: 'Mood disorder where nutrition can support brain health and neurotransmitter function.',
    keyNutrients: [
      {
        nutrient: 'omega3',
        target: 2000,
        unit: 'mg',
        reasoning: 'EPA particularly beneficial for depression symptoms',
        evidenceLevel: 'strong',
        sources: ['Mol Psychiatry 2021', 'JAMA Psychiatry 2020']
      },
      {
        nutrient: 'folate',
        target: 800,
        unit: 'mcg',
        reasoning: 'Deficiency linked to depression; supports neurotransmitter synthesis',
        evidenceLevel: 'strong',
        sources: ['J Psychiatr Res 2020']
      },
      {
        nutrient: 'vitamin_b6',
        target: 2,
        unit: 'mg',
        reasoning: 'Required for serotonin and dopamine synthesis',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2021']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['fatty fish', 'leafy greens', 'berries', 'nuts', 'dark chocolate', 'fermented foods'],
        reasoning: 'Support neurotransmitter production and gut-brain axis',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['alcohol', 'caffeine', 'processed foods', 'high sugar foods'],
        reasoning: 'Can worsen mood stability and sleep patterns',
        evidenceLevel: 'moderate'
      }
    ],
    mealTimingAdvice: 'Regular meals help stabilize blood sugar and mood. Avoid skipping breakfast.',
    monitoringMetrics: ['mood_scores', 'sleep_quality', 'energy_levels'],
    clinicalNotes: 'Nutrition supports but doesn\'t replace therapy/medication. Screen for eating disorders.'
  },

  // KIDNEY CONDITIONS
  {
    id: 'chronic_kidney_disease',
    name: 'Chronic Kidney Disease',
    category: 'Kidney & Liver',
    description: 'Progressive kidney function decline requiring careful protein, phosphorus, and potassium management.',
    keyNutrients: [
      {
        nutrient: 'protein',
        target: 70,
        unit: 'g',
        reasoning: 'Moderate restriction (0.8-1.0g/kg) to reduce kidney burden',
        evidenceLevel: 'strong',
        sources: ['KDIGO Guidelines 2022']
      },
      {
        nutrient: 'phosphorus',
        target: 800,
        unit: 'mg',
        reasoning: 'Restriction needed to prevent bone disease',
        evidenceLevel: 'strong',
        sources: ['Clin J Am Soc Nephrol 2021']
      },
      {
        nutrient: 'potassium',
        target: 2000,
        unit: 'mg',
        reasoning: 'May need restriction if hyperkalemia present',
        evidenceLevel: 'strong',
        sources: ['Kidney Int 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['white rice', 'cabbage', 'bell peppers', 'apples', 'egg whites'],
        reasoning: 'Lower potassium and phosphorus options',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['dark colas', 'processed meats', 'dairy products', 'nuts', 'dried fruits'],
        reasoning: 'High in phosphorus, potassium, or protein additives',
        evidenceLevel: 'strong'
      }
    ],
    drugInteractions: ['ACE inhibitors may increase potassium - monitor closely'],
    monitoringMetrics: ['egfr', 'creatinine', 'bun', 'phosphorus', 'potassium'],
    clinicalNotes: 'Stage-specific nutrition. Refer to renal dietitian. Monitor for mineral bone disease.'
  }
];

export function calculateConditionScore(condition: HealthConditionData, entries: GroupedFoodEntry[]): number {
  let score = 0;
  let maxScore = 0;

  // Enhanced scoring algorithm based on condition-specific recommendations
  condition.keyNutrients.forEach(nutrient => {
    const dailyIntake = entries.reduce((sum, entry) => {
      return sum + (entry.totalNutrients[nutrient.nutrient as keyof typeof entry.totalNutrients] || 0);
    }, 0);

    maxScore += 10;
    
    if (nutrient.nutrient === 'sodium' || nutrient.nutrient === 'saturated_fat') {
      // For nutrients we want to limit
      score += dailyIntake <= nutrient.target ? 10 : Math.max(0, 10 - (dailyIntake - nutrient.target) / nutrient.target * 5);
    } else {
      // For nutrients we want to reach
      const percentage = dailyIntake / nutrient.target;
      score += Math.min(10, percentage * 10);
    }
  });

  // Food recommendation scoring
  condition.foodRecommendations.forEach(rec => {
    maxScore += 10;
    let recScore = 0;

    rec.foods.forEach(food => {
      const hasFood = entries.some(entry => 
        entry.combinedName.toLowerCase().includes(food.toLowerCase())
      );

      if (rec.type === 'encourage' && hasFood) {
        recScore += 2;
      } else if ((rec.type === 'limit' || rec.type === 'avoid') && !hasFood) {
        recScore += 2;
      }
    });

    score += Math.min(10, recScore);
  });

  return maxScore > 0 ? (score / maxScore) * 100 : 0;
}

export function getConditionRecommendations(condition: HealthConditionData, entries: GroupedFoodEntry[]): string[] {
  const recommendations: string[] = [];

  // Check nutrient targets
  condition.keyNutrients.forEach(nutrient => {
    const dailyIntake = entries.reduce((sum, entry) => {
      return sum + (entry.totalNutrients[nutrient.nutrient as keyof typeof entry.totalNutrients] || 0);
    }, 0);

    if (nutrient.nutrient === 'sodium' || nutrient.nutrient === 'saturated_fat') {
      if (dailyIntake > nutrient.target) {
        recommendations.push(`Reduce ${nutrient.nutrient} intake. Current: ${dailyIntake.toFixed(1)}${nutrient.unit}, Target: ≤${nutrient.target}${nutrient.unit}`);
      }
    } else {
      if (dailyIntake < nutrient.target * 0.7) {
        recommendations.push(`Increase ${nutrient.nutrient} intake. Current: ${dailyIntake.toFixed(1)}${nutrient.unit}, Target: ${nutrient.target}${nutrient.unit}`);
      }
    }
  });

  // Add general recommendations based on food choices
  const encouragedFoodsEaten = condition.foodRecommendations
    .filter(rec => rec.type === 'encourage')
    .flatMap(rec => rec.foods)
    .filter(food => entries.some(entry => entry.combinedName.toLowerCase().includes(food.toLowerCase())));

  if (encouragedFoodsEaten.length < 3) {
    recommendations.push('Try to include more anti-inflammatory foods in your diet');
  }

  // Add meal timing advice if available
  if (condition.mealTimingAdvice && recommendations.length < 3) {
    recommendations.push(condition.mealTimingAdvice);
  }

  return recommendations.slice(0, 5); // Limit to 5 recommendations
}

export function getHealthConditionById(id: string): HealthConditionData | undefined {
  return EXPANDED_HEALTH_CONDITIONS.find(condition => condition.id === id);
}

export function getHealthConditionsByCategory(category: string): HealthConditionData[] {
  return EXPANDED_HEALTH_CONDITIONS.filter(condition => condition.category === category);
}

export function getAllHealthConditions(): HealthConditionData[] {
  return EXPANDED_HEALTH_CONDITIONS;
}