// Supplement and medication tracking types

export interface ActiveIngredient {
  name: string;
  amount: number;
  unit: string;
}

export interface Supplement {
  id: string;
  name: string;
  brand?: string;
  type: 'vitamin' | 'mineral' | 'herb' | 'medication' | 'probiotic' | 'omega3' | 'protein_powder' | 'other';
  form?: 'tablet' | 'capsule' | 'liquid' | 'powder' | 'gummy' | 'injection';
  
  // Dosage information
  serving_size: number;
  serving_unit: string;
  
  // Active ingredients
  active_ingredients: ActiveIngredient[];
  
  // Nutrition information (for protein powders, etc.)
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  
  // Health condition associations
  health_conditions: string[];
  
  // Safety information
  max_daily_dose?: number;
  max_daily_unit?: string;
  drug_interactions: string[];
  warnings: string[];
  
  // Metadata
  description?: string;
  is_prescription: boolean;
  is_user_added: boolean;
  created_at: string;
  updated_at: string;
}

export interface SupplementEntry {
  id: string;
  user_id: string;
  supplement_id: string;
  supplement?: Supplement; // Populated when joined
  
  // Dosage taken
  amount_taken: number;
  unit_taken: string;
  
  // Timing information
  time_taken: Date;
  time_of_day?: 'morning' | 'afternoon' | 'evening' | 'night' | 'with_meal' | 'empty_stomach';
  
  // Context
  taken_with_food: boolean;
  meal_context?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'none';
  
  // User feedback
  notes?: string;
  side_effects?: string;
  effectiveness_rating?: number; // 1-5 scale
  
  created_at: string;
  updated_at: string;
}

export interface SupplementSchedule {
  id: string;
  user_id: string;
  supplement_id: string;
  supplement?: Supplement; // Populated when joined
  
  // Schedule configuration
  is_active: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'as_needed' | 'custom';
  times_per_day: number;
  days_of_week: number[]; // 1-7 (Monday-Sunday)
  
  // Dosage
  dose_amount: number;
  dose_unit: string;
  
  // Timing preferences
  preferred_times: string[];
  take_with_food: boolean;
  
  // Duration and goals
  start_date?: Date;
  end_date?: Date;
  health_goal?: string;
  
  // Reminders
  reminder_enabled: boolean;
  reminder_times: string[];
  
  created_at: string;
  updated_at: string;
}

export interface SupplementAnalysis {
  totalSupplements: number;
  supplementsByType: Record<string, number>;
  supplementsByCondition: Record<string, Supplement[]>;
  potentialInteractions: string[];
  complianceRate: number; // Percentage of scheduled doses taken
  recommendations: string[];
  warnings: string[];
}

export interface DailySupplementSummary {
  date: Date;
  scheduledCount: number;
  takenCount: number;
  missedCount: number;
  supplements: Array<{
    supplement: Supplement;
    scheduled: number;
    taken: number;
    entries: SupplementEntry[];
  }>;
}

// Form types for creating/editing supplements
export interface CreateSupplementData {
  name: string;
  brand?: string;
  type: Supplement['type'];
  form?: Supplement['form'];
  serving_size: number;
  serving_unit: string;
  active_ingredients: ActiveIngredient[];
  calories_per_serving?: number;
  protein_per_serving?: number;
  carbs_per_serving?: number;
  fat_per_serving?: number;
  health_conditions: string[];
  max_daily_dose?: number;
  max_daily_unit?: string;
  drug_interactions: string[];
  warnings: string[];
  description?: string;
  is_prescription: boolean;
}

export interface CreateSupplementEntryData {
  supplement_id: string;
  amount_taken: number;
  unit_taken: string;
  time_taken?: Date;
  time_of_day?: SupplementEntry['time_of_day'];
  taken_with_food: boolean;
  meal_context?: SupplementEntry['meal_context'];
  notes?: string;
  side_effects?: string;
  effectiveness_rating?: number;
}

export interface CreateSupplementScheduleData {
  supplement_id: string;
  frequency: SupplementSchedule['frequency'];
  times_per_day: number;
  days_of_week: number[];
  dose_amount: number;
  dose_unit: string;
  preferred_times: string[];
  take_with_food: boolean;
  start_date?: Date;
  end_date?: Date;
  health_goal?: string;
  reminder_enabled: boolean;
  reminder_times: string[];
}

// Search and filter types
export interface SupplementSearchFilters {
  type?: Supplement['type'];
  health_condition?: string;
  form?: Supplement['form'];
  is_prescription?: boolean;
  search_term?: string;
}

export interface SupplementEntryFilters {
  date_from?: Date;
  date_to?: Date;
  supplement_id?: string;
  time_of_day?: SupplementEntry['time_of_day'];
  effectiveness_rating?: number;
}

// Health condition specific supplement recommendations
export interface ConditionSupplementRecommendation {
  condition_id: string;
  condition_name: string;
  recommended_supplements: Array<{
    supplement_id: string;
    importance: 'essential' | 'beneficial' | 'optional';
    dosage_recommendation: string;
    timing_recommendation: string;
    evidence_level: 'strong' | 'moderate' | 'limited';
    notes: string;
  }>;
  supplement_interactions: Array<{
    supplement_ids: string[];
    interaction_type: 'positive' | 'negative' | 'caution';
    description: string;
  }>;
}