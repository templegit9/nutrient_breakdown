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
  'Female Fertility & Health',
  'Male Fertility & Health',
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
  },

  // FEMALE FERTILITY & HEALTH CONDITIONS
  {
    id: 'female_fertility_optimization',
    name: 'Female Fertility Optimization',
    category: 'Female Fertility & Health',
    description: 'Nutritional support for optimal reproductive health, egg quality, and conception preparation.',
    keyNutrients: [
      {
        nutrient: 'folate',
        target: 800,
        unit: 'mcg',
        reasoning: 'Critical for neural tube development and DNA synthesis in developing eggs',
        evidenceLevel: 'strong',
        sources: ['Cochrane Review 2021', 'ACOG Guidelines 2022']
      },
      {
        nutrient: 'coq10',
        target: 300,
        unit: 'mg',
        reasoning: 'Improves mitochondrial function in eggs, especially for women over 35',
        evidenceLevel: 'moderate',
        sources: ['Fertil Steril 2021', 'Reprod Biomed Online 2020']
      },
      {
        nutrient: 'vitamin_d',
        target: 2000,
        unit: 'IU',
        reasoning: 'Deficiency linked to ovulatory dysfunction and implantation issues',
        evidenceLevel: 'strong',
        sources: ['Hum Reprod Update 2021']
      },
      {
        nutrient: 'iron',
        target: 27,
        unit: 'mg',
        reasoning: 'Iron deficiency associated with ovulatory infertility',
        evidenceLevel: 'moderate',
        sources: ['Obstet Gynecol 2019']
      },
      {
        nutrient: 'omega3',
        target: 2000,
        unit: 'mg',
        reasoning: 'DHA supports egg membrane health and hormonal balance',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2021']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['dark leafy greens', 'berries', 'avocados', 'nuts', 'seeds', 'fatty fish', 'eggs', 'quinoa'],
        reasoning: 'Antioxidant-rich foods protect eggs from oxidative damage and support hormone production',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['trans fats', 'excessive caffeine', 'alcohol', 'high mercury fish', 'processed foods'],
        reasoning: 'These can impair egg quality, hormone balance, and ovulation',
        evidenceLevel: 'strong'
      }
    ],
    mealTimingAdvice: 'Consistent meal timing supports hormonal balance. Include protein at each meal to stabilize blood sugar.',
    supplementAdvice: 'Consider prenatal vitamins 3 months before conception. CoQ10 may benefit egg quality especially after age 35.',
    monitoringMetrics: ['menstrual_cycle_regularity', 'ovulation_timing', 'bmi', 'inflammatory_markers'],
    clinicalNotes: 'Optimize nutrition 3-6 months before conception. Address underlying conditions like PCOS or thyroid disorders.'
  },

  {
    id: 'endometriosis',
    name: 'Endometriosis',
    category: 'Female Fertility & Health',
    description: 'Chronic inflammatory condition where anti-inflammatory nutrition can help manage pain and symptoms.',
    keyNutrients: [
      {
        nutrient: 'omega3',
        target: 3000,
        unit: 'mg',
        reasoning: 'EPA/DHA reduce inflammatory prostaglandins associated with endometrial pain',
        evidenceLevel: 'strong',
        sources: ['Am J Clin Nutr 2021', 'Reprod Sci 2020']
      },
      {
        nutrient: 'vitamin_d',
        target: 2000,
        unit: 'IU',
        reasoning: 'Deficiency common in endometriosis; supplementation may reduce inflammation',
        evidenceLevel: 'moderate',
        sources: ['Gynecol Endocrinol 2020']
      },
      {
        nutrient: 'antioxidants',
        target: 5000,
        unit: 'ORAC',
        reasoning: 'Counter oxidative stress and inflammation associated with endometrial lesions',
        evidenceLevel: 'moderate',
        sources: ['Antioxidants 2021']
      },
      {
        nutrient: 'magnesium',
        target: 400,
        unit: 'mg',
        reasoning: 'May help reduce menstrual cramping and muscle tension',
        evidenceLevel: 'moderate',
        sources: ['Cochrane Review 2019']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['salmon', 'sardines', 'turmeric', 'ginger', 'berries', 'leafy greens', 'green tea'],
        reasoning: 'Anti-inflammatory compounds may reduce endometrial inflammation and pain',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['red meat', 'processed foods', 'caffeine', 'alcohol', 'high-fat dairy'],
        reasoning: 'These foods may increase inflammatory markers and worsen symptoms',
        evidenceLevel: 'moderate'
      }
    ],
    mealTimingAdvice: 'Regular meals help maintain stable energy. Consider smaller, frequent meals during flare-ups.',
    monitoringMetrics: ['pain_levels', 'menstrual_symptoms', 'inflammatory_markers', 'quality_of_life'],
    clinicalNotes: 'Mediterranean diet pattern shows promise. Consider elimination diet to identify trigger foods.'
  },

  {
    id: 'menopause_support',
    name: 'Menopause Support',
    category: 'Female Fertility & Health',
    description: 'Nutritional support for managing menopausal symptoms and maintaining bone and heart health.',
    keyNutrients: [
      {
        nutrient: 'calcium',
        target: 1200,
        unit: 'mg',
        reasoning: 'Increased needs due to estrogen decline affecting bone density',
        evidenceLevel: 'strong',
        sources: ['NOF Guidelines 2021']
      },
      {
        nutrient: 'vitamin_d',
        target: 2000,
        unit: 'IU',
        reasoning: 'Essential for calcium absorption and bone health during menopause',
        evidenceLevel: 'strong',
        sources: ['Endocr Rev 2021']
      },
      {
        nutrient: 'phytoestrogens',
        target: 50,
        unit: 'mg',
        reasoning: 'Isoflavones may help reduce hot flashes and support bone health',
        evidenceLevel: 'moderate',
        sources: ['Menopause 2020']
      },
      {
        nutrient: 'omega3',
        target: 2000,
        unit: 'mg',
        reasoning: 'May reduce inflammation and support cardiovascular health',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2021']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['soy foods', 'flaxseeds', 'dairy products', 'canned fish with bones', 'dark leafy greens'],
        reasoning: 'Provide phytoestrogens, calcium, and bone-supporting nutrients',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['alcohol', 'caffeine', 'spicy foods', 'sugar'],
        reasoning: 'May trigger hot flashes and worsen menopausal symptoms',
        evidenceLevel: 'moderate'
      }
    ],
    mealTimingAdvice: 'Consistent meal timing helps manage mood and energy fluctuations.',
    monitoringMetrics: ['bone_density', 'hot_flash_frequency', 'cardiovascular_markers', 'weight'],
    clinicalNotes: 'Consider hormone therapy consultation. Monitor cardiovascular and bone health closely.'
  },

  {
    id: 'iron_deficiency_anemia',
    name: 'Iron Deficiency Anemia',
    category: 'Female Fertility & Health',
    description: 'Common in women due to menstrual losses, requiring strategic iron intake and absorption optimization.',
    keyNutrients: [
      {
        nutrient: 'iron',
        target: 27,
        unit: 'mg',
        reasoning: 'Higher needs in menstruating women, especially with heavy periods',
        evidenceLevel: 'strong',
        sources: ['WHO Guidelines 2021']
      },
      {
        nutrient: 'vitamin_c',
        target: 200,
        unit: 'mg',
        reasoning: 'Enhances non-heme iron absorption from plant sources',
        evidenceLevel: 'strong',
        sources: ['Am J Clin Nutr 2020']
      },
      {
        nutrient: 'vitamin_b12',
        target: 2.4,
        unit: 'mcg',
        reasoning: 'Often co-deficient and required for red blood cell formation',
        evidenceLevel: 'strong',
        sources: ['Blood 2019']
      },
      {
        nutrient: 'folate',
        target: 400,
        unit: 'mcg',
        reasoning: 'Essential for DNA synthesis in red blood cell production',
        evidenceLevel: 'strong',
        sources: ['Hematology 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['lean red meat', 'poultry', 'fish', 'lentils', 'spinach', 'fortified cereals', 'citrus fruits'],
        reasoning: 'Heme iron from meat is better absorbed than non-heme iron from plants',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['tea', 'coffee', 'calcium supplements with meals', 'whole grains with iron-rich foods'],
        reasoning: 'These can inhibit iron absorption when consumed together',
        evidenceLevel: 'strong'
      }
    ],
    mealTimingAdvice: 'Take iron supplements on empty stomach when possible. Separate calcium and iron supplements by 2+ hours.',
    monitoringMetrics: ['hemoglobin', 'ferritin', 'transferrin_saturation', 'energy_levels'],
    clinicalNotes: 'Investigate underlying cause of iron loss. Monitor for GI side effects of supplementation.'
  },

  // MALE FERTILITY & HEALTH CONDITIONS
  {
    id: 'male_fertility_optimization',
    name: 'Male Fertility Optimization',
    category: 'Male Fertility & Health',
    description: 'Nutritional support for optimal sperm production, quality, and reproductive health.',
    keyNutrients: [
      {
        nutrient: 'zinc',
        target: 15,
        unit: 'mg',
        reasoning: 'Essential for testosterone production and sperm development',
        evidenceLevel: 'strong',
        sources: ['Fertil Steril 2021', 'Andrologia 2020']
      },
      {
        nutrient: 'selenium',
        target: 200,
        unit: 'mcg',
        reasoning: 'Critical for sperm motility and protects against oxidative damage',
        evidenceLevel: 'strong',
        sources: ['Reprod Toxicol 2021']
      },
      {
        nutrient: 'vitamin_c',
        target: 1000,
        unit: 'mg',
        reasoning: 'Antioxidant that protects sperm from DNA damage',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2020']
      },
      {
        nutrient: 'vitamin_e',
        target: 400,
        unit: 'IU',
        reasoning: 'Works with selenium to protect sperm membrane integrity',
        evidenceLevel: 'moderate',
        sources: ['Asian J Androl 2019']
      },
      {
        nutrient: 'coq10',
        target: 300,
        unit: 'mg',
        reasoning: 'Improves sperm motility and energy production',
        evidenceLevel: 'moderate',
        sources: ['Cochrane Review 2019']
      },
      {
        nutrient: 'folate',
        target: 400,
        unit: 'mcg',
        reasoning: 'Low folate associated with decreased sperm count and DNA integrity',
        evidenceLevel: 'moderate',
        sources: ['Hum Reprod 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['oysters', 'brazil nuts', 'pumpkin seeds', 'dark leafy greens', 'berries', 'tomatoes', 'walnuts'],
        reasoning: 'Rich in antioxidants and nutrients critical for sperm health',
        evidenceLevel: 'strong'
      },
      {
        type: 'limit',
        foods: ['processed meats', 'trans fats', 'excessive alcohol', 'high mercury fish', 'soy products'],
        reasoning: 'These can negatively impact sperm concentration and quality',
        evidenceLevel: 'moderate'
      }
    ],
    mealTimingAdvice: 'Consistent nutrition for 74+ days (sperm production cycle). Include antioxidants at each meal.',
    supplementAdvice: 'Consider comprehensive male fertility supplement 3+ months before conception attempts.',
    monitoringMetrics: ['sperm_count', 'sperm_motility', 'sperm_morphology', 'testosterone_levels'],
    clinicalNotes: 'Sperm production takes 74 days - nutrition changes take time. Address heat exposure and lifestyle factors.'
  },

  {
    id: 'low_testosterone',
    name: 'Low Testosterone (Hypogonadism)',
    category: 'Male Fertility & Health',
    description: 'Nutritional support for healthy testosterone production and male hormonal balance.',
    keyNutrients: [
      {
        nutrient: 'zinc',
        target: 15,
        unit: 'mg',
        reasoning: 'Zinc deficiency directly linked to low testosterone levels',
        evidenceLevel: 'strong',
        sources: ['Nutrition 2021', 'J Am Coll Nutr 2020']
      },
      {
        nutrient: 'vitamin_d',
        target: 3000,
        unit: 'IU',
        reasoning: 'Vitamin D receptors in reproductive tissues; deficiency lowers testosterone',
        evidenceLevel: 'strong',
        sources: ['Horm Metab Res 2021']
      },
      {
        nutrient: 'magnesium',
        target: 420,
        unit: 'mg',
        reasoning: 'Magnesium supplementation can increase free and total testosterone',
        evidenceLevel: 'moderate',
        sources: ['Biol Trace Elem Res 2020']
      },
      {
        nutrient: 'omega3',
        target: 2000,
        unit: 'mg',
        reasoning: 'Supports steroid hormone production and reduces inflammation',
        evidenceLevel: 'moderate',
        sources: ['Prostaglandins 2021']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['oysters', 'lean beef', 'eggs', 'fatty fish', 'nuts', 'seeds', 'pomegranates'],
        reasoning: 'Foods that support testosterone production and hormonal health',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['excessive alcohol', 'processed foods', 'sugar', 'soy products', 'mint'],
        reasoning: 'These can suppress testosterone production or increase estrogen',
        evidenceLevel: 'moderate'
      }
    ],
    mealTimingAdvice: 'Adequate caloric intake important - severe calorie restriction lowers testosterone.',
    monitoringMetrics: ['total_testosterone', 'free_testosterone', 'lh', 'fsh', 'estradiol'],
    clinicalNotes: 'Rule out underlying causes. Consider sleep, stress, and exercise factors alongside nutrition.'
  },

  {
    id: 'benign_prostatic_hyperplasia',
    name: 'Benign Prostatic Hyperplasia (BPH)',
    category: 'Male Fertility & Health',
    description: 'Enlarged prostate condition where specific nutrients may help reduce symptoms and inflammation.',
    keyNutrients: [
      {
        nutrient: 'lycopene',
        target: 30,
        unit: 'mg',
        reasoning: 'Concentrated in prostate tissue; may reduce prostate size and symptoms',
        evidenceLevel: 'moderate',
        sources: ['Prostate 2021', 'Nutrients 2020']
      },
      {
        nutrient: 'beta_sitosterol',
        target: 130,
        unit: 'mg',
        reasoning: 'Plant sterol that may improve urinary flow and reduce BPH symptoms',
        evidenceLevel: 'moderate',
        sources: ['Cochrane Review 2019']
      },
      {
        nutrient: 'zinc',
        target: 15,
        unit: 'mg',
        reasoning: 'Prostate has highest zinc concentration; deficiency may worsen BPH',
        evidenceLevel: 'moderate',
        sources: ['Prostate Cancer Prostatic Dis 2020']
      },
      {
        nutrient: 'saw_palmetto',
        target: 320,
        unit: 'mg',
        reasoning: 'May inhibit 5-alpha reductase and reduce prostate inflammation',
        evidenceLevel: 'limited',
        sources: ['Cochrane Review 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['tomatoes', 'watermelon', 'pumpkin seeds', 'green tea', 'soy foods', 'fish'],
        reasoning: 'Rich in lycopene, phytosterols, and anti-inflammatory compounds',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['red meat', 'high-fat dairy', 'alcohol', 'caffeine', 'spicy foods'],
        reasoning: 'May worsen urinary symptoms or promote prostate inflammation',
        evidenceLevel: 'limited'
      }
    ],
    mealTimingAdvice: 'Limit fluids 2-3 hours before bedtime to reduce nighttime urination.',
    monitoringMetrics: ['psa_levels', 'urinary_flow_rate', 'prostate_volume', 'symptom_scores'],
    clinicalNotes: 'Monitor PSA levels regularly. Dietary changes complement but don\'t replace medical treatment.'
  },

  {
    id: 'erectile_dysfunction',
    name: 'Erectile Dysfunction',
    category: 'Male Fertility & Health',
    description: 'Vascular and hormonal condition where nutrition can support blood flow and sexual health.',
    keyNutrients: [
      {
        nutrient: 'l_arginine',
        target: 5000,
        unit: 'mg',
        reasoning: 'Precursor to nitric oxide which improves blood flow to reproductive organs',
        evidenceLevel: 'moderate',
        sources: ['Int J Impot Res 2021']
      },
      {
        nutrient: 'flavonoids',
        target: 500,
        unit: 'mg',
        reasoning: 'Improve endothelial function and blood flow',
        evidenceLevel: 'moderate',
        sources: ['Am J Clin Nutr 2020']
      },
      {
        nutrient: 'vitamin_d',
        target: 2000,
        unit: 'IU',
        reasoning: 'Deficiency associated with erectile dysfunction',
        evidenceLevel: 'moderate',
        sources: ['Int J Endocrinol 2021']
      },
      {
        nutrient: 'omega3',
        target: 2000,
        unit: 'mg',
        reasoning: 'Supports cardiovascular health and blood flow',
        evidenceLevel: 'moderate',
        sources: ['Nutrients 2020']
      }
    ],
    foodRecommendations: [
      {
        type: 'encourage',
        foods: ['watermelon', 'dark chocolate', 'pistachios', 'berries', 'leafy greens', 'fatty fish'],
        reasoning: 'Rich in compounds that support vascular health and blood flow',
        evidenceLevel: 'moderate'
      },
      {
        type: 'limit',
        foods: ['processed foods', 'excessive alcohol', 'high sodium foods', 'trans fats'],
        reasoning: 'Can impair vascular function and blood flow',
        evidenceLevel: 'moderate'
      }
    ],
    mealTimingAdvice: 'Avoid large meals before sexual activity. Mediterranean diet pattern beneficial.',
    monitoringMetrics: ['erectile_function_scores', 'cardiovascular_markers', 'testosterone_levels'],
    clinicalNotes: 'Often related to cardiovascular health. Address underlying vascular risk factors.'
  }
];

export function calculateConditionScore(condition: HealthConditionData, entries: GroupedFoodEntry[], userProfile?: any, supplementEntries?: any[]): number {
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

  // Supplement adherence scoring
  if (supplementEntries && supplementEntries.length > 0) {
    maxScore += 20; // Add weight for supplement adherence
    let supplementScore = 0;
    
    // Check for condition-specific supplements
    const conditionSupplements = supplementEntries.filter(entry => 
      entry.supplement?.health_conditions?.includes(condition.id)
    );
    
    if (conditionSupplements.length > 0) {
      // Give points for taking condition-specific supplements
      supplementScore += Math.min(15, conditionSupplements.length * 3);
      
      // Bonus points for consistent supplementation (recent entries)
      const recentEntries = supplementEntries.filter(entry => {
        const entryDate = new Date(entry.time_taken);
        const daysDiff = (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7; // Within last week
      });
      
      if (recentEntries.length > 0) {
        supplementScore += Math.min(5, recentEntries.length);
      }
    }
    
    // Check for general health supplements that benefit this condition
    const beneficialSupplements = supplementEntries.filter(entry => {
      const supplementName = entry.supplement?.name?.toLowerCase() || '';
      
      // Condition-specific beneficial supplements
      if (condition.id === 'pcos') {
        return supplementName.includes('inositol') || 
               supplementName.includes('spearmint') || 
               supplementName.includes('omega') ||
               supplementName.includes('vitamin d');
      } else if (condition.id === 'type2_diabetes') {
        return supplementName.includes('chromium') || 
               supplementName.includes('alpha lipoic') ||
               supplementName.includes('omega') ||
               supplementName.includes('magnesium');
      } else if (condition.id === 'hypertension') {
        return supplementName.includes('magnesium') ||
               supplementName.includes('potassium') ||
               supplementName.includes('omega') ||
               supplementName.includes('coq10') ||
               supplementName.includes('coenzyme q10') ||
               supplementName.includes('garlic');
      } else if (condition.id === 'osteoporosis') {
        return supplementName.includes('calcium') ||
               supplementName.includes('vitamin d') ||
               supplementName.includes('magnesium') ||
               supplementName.includes('vitamin k');
      } else if (condition.id === 'hypothyroidism') {
        return supplementName.includes('iodine') ||
               supplementName.includes('selenium') ||
               supplementName.includes('vitamin d');
      } else if (condition.id === 'depression' || condition.id === 'anxiety') {
        return supplementName.includes('vitamin d') ||
               supplementName.includes('omega') ||
               supplementName.includes('magnesium') ||
               supplementName.includes('ashwagandha') ||
               supplementName.includes('b complex');
      } else if (condition.id === 'insomnia' || condition.id === 'sleep_disorders') {
        return supplementName.includes('melatonin') ||
               supplementName.includes('magnesium') ||
               supplementName.includes('ashwagandha');
      }
      
      return false;
    });
    
    if (beneficialSupplements.length > 0) {
      supplementScore += Math.min(10, beneficialSupplements.length * 2);
    }
    
    score += supplementScore;
  }

  // Apply user profile adjustments if available
  if (userProfile) {
    // Calculate BMI for additional context
    const bmi = userProfile.height && userProfile.weight 
      ? userProfile.weight / Math.pow(userProfile.height / 100, 2) 
      : null;

    // Age-based adjustments for certain conditions
    if (userProfile.age) {
      if (condition.id === 'type2_diabetes' && userProfile.age > 65) {
        // Older adults with diabetes need stricter glucose control
        score *= 0.95;
      }
      if (condition.id === 'hypertension' && userProfile.age > 60) {
        // Stricter sodium limits for older adults
        score *= 0.95;
      }
    }

    // BMI-based adjustments
    if (bmi) {
      if (condition.id === 'type2_diabetes' && bmi > 25) {
        // Weight management is crucial for diabetes
        score *= 0.9;
      }
      if (condition.id === 'hypertension' && bmi > 25) {
        // Weight affects blood pressure
        score *= 0.92;
      }
      if (condition.id === 'metabolic_syndrome' && bmi > 30) {
        // BMI is a key component of metabolic syndrome
        score *= 0.85;
      }
    }

    // Gender-specific adjustments
    if (userProfile.gender === 'female') {
      if (condition.id === 'pcos') {
        // PCOS requires specific nutrition approach for women
        if (bmi && bmi > 25) score *= 0.9;
      }
      if (condition.id === 'iron_deficiency_anemia') {
        // Women have higher iron needs
        score *= 0.95;
      }
    }
  }

  return maxScore > 0 ? Math.max(0, (score / maxScore) * 100) : 0;
}

export function getConditionRecommendations(condition: HealthConditionData, entries: GroupedFoodEntry[], userProfile?: any): string[] {
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

  // Add user profile-based personalized recommendations
  if (userProfile) {
    const bmi = userProfile.height && userProfile.weight 
      ? userProfile.weight / Math.pow(userProfile.height / 100, 2) 
      : null;

    // BMI-based recommendations
    if (bmi) {
      if (bmi > 25 && ['type2_diabetes', 'hypertension', 'metabolic_syndrome', 'pcos'].includes(condition.id)) {
        recommendations.push(`Weight management recommended (current BMI: ${bmi.toFixed(1)}). Consider reducing calorie intake and increasing physical activity.`);
      }
      if (bmi < 18.5) {
        recommendations.push(`Underweight status may affect health management. Consider consulting a dietitian for healthy weight gain strategies.`);
      }
    }

    // Age-based recommendations
    if (userProfile.age) {
      if (userProfile.age > 65 && condition.id === 'type2_diabetes') {
        recommendations.push('Older adults with diabetes should monitor blood sugar more frequently and consider gentler exercise routines.');
      }
      if (userProfile.age > 50 && condition.id === 'hypertension') {
        recommendations.push('Consider increasing calcium and magnesium intake as blood pressure management becomes more important with age.');
      }
    }

    // Gender-specific recommendations
    if (userProfile.gender === 'female') {
      if (condition.id === 'iron_deficiency_anemia') {
        recommendations.push('Women of reproductive age have higher iron needs. Consider pairing iron-rich foods with vitamin C sources.');
      }
      if (condition.id === 'pcos') {
        recommendations.push('Focus on low glycemic index foods and consider omega-3 fatty acids for hormone balance.');
      }
    }

    // Activity level considerations
    if (userProfile.activityLevel === 'very_active' && condition.id === 'type2_diabetes') {
      recommendations.push('High activity levels may require carbohydrate timing adjustments. Monitor blood glucose before and after exercise.');
    }
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