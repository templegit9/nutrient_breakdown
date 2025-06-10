import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          name: string | null
          age: number | null
          gender: string | null
          height_cm: number | null
          weight_kg: number | null
          activity_level: string | null
          health_conditions: string[] | null
          dietary_restrictions: string[] | null
          target_calories: number | null
          target_protein_g: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_fiber_g: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string | null
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          activity_level?: string | null
          health_conditions?: string[] | null
          dietary_restrictions?: string[] | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string | null
          age?: number | null
          gender?: string | null
          height_cm?: number | null
          weight_kg?: number | null
          activity_level?: string | null
          health_conditions?: string[] | null
          dietary_restrictions?: string[] | null
          target_calories?: number | null
          target_protein_g?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      foods: {
        Row: {
          id: string
          name: string
          brand: string | null
          category: string | null
          serving_size: number | null
          serving_unit: string | null
          calories_per_100g: number | null
          protein_per_100g: number | null
          carbs_per_100g: number | null
          fat_per_100g: number | null
          fiber_per_100g: number | null
          sugar_per_100g: number | null
          sodium_per_100g: number | null
          cholesterol_per_100g: number | null
          potassium_per_100g: number | null
          iron_per_100g: number | null
          calcium_per_100g: number | null
          vitamin_c_per_100g: number | null
          vitamin_d_per_100g: number | null
          glycemic_index: number | null
          glycemic_load: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand?: string | null
          category?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_100g?: number | null
          protein_per_100g?: number | null
          carbs_per_100g?: number | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          cholesterol_per_100g?: number | null
          potassium_per_100g?: number | null
          iron_per_100g?: number | null
          calcium_per_100g?: number | null
          vitamin_c_per_100g?: number | null
          vitamin_d_per_100g?: number | null
          glycemic_index?: number | null
          glycemic_load?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string | null
          category?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_100g?: number | null
          protein_per_100g?: number | null
          carbs_per_100g?: number | null
          fat_per_100g?: number | null
          fiber_per_100g?: number | null
          sugar_per_100g?: number | null
          sodium_per_100g?: number | null
          cholesterol_per_100g?: number | null
          potassium_per_100g?: number | null
          iron_per_100g?: number | null
          calcium_per_100g?: number | null
          vitamin_c_per_100g?: number | null
          vitamin_d_per_100g?: number | null
          glycemic_index?: number | null
          glycemic_load?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      food_entries: {
        Row: {
          id: string
          user_id: string
          food_id: string | null
          custom_food_name: string | null
          serving_amount: number
          serving_unit: string
          calories: number | null
          protein_g: number | null
          carbs_g: number | null
          fat_g: number | null
          fiber_g: number | null
          sugar_g: number | null
          sodium_mg: number | null
          meal_type: string | null
          consumed_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_id?: string | null
          custom_food_name?: string | null
          serving_amount: number
          serving_unit: string
          calories?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          meal_type?: string | null
          consumed_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          food_id?: string | null
          custom_food_name?: string | null
          serving_amount?: number
          serving_unit?: string
          calories?: number | null
          protein_g?: number | null
          carbs_g?: number | null
          fat_g?: number | null
          fiber_g?: number | null
          sugar_g?: number | null
          sodium_mg?: number | null
          meal_type?: string | null
          consumed_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      blood_glucose_readings: {
        Row: {
          id: string
          user_id: string
          glucose_level: number
          reading_type: string | null
          notes: string | null
          measured_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          glucose_level: number
          reading_type?: string | null
          notes?: string | null
          measured_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          glucose_level?: number
          reading_type?: string | null
          notes?: string | null
          measured_at?: string
          created_at?: string
        }
      }
      nutrition_goals: {
        Row: {
          id: string
          user_id: string
          goal_date: string
          target_calories: number | null
          target_protein_g: number | null
          target_carbs_g: number | null
          target_fat_g: number | null
          target_fiber_g: number | null
          target_sugar_g: number | null
          target_sodium_mg: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_date: string
          target_calories?: number | null
          target_protein_g?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          target_sugar_g?: number | null
          target_sodium_mg?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_date?: string
          target_calories?: number | null
          target_protein_g?: number | null
          target_carbs_g?: number | null
          target_fat_g?: number | null
          target_fiber_g?: number | null
          target_sugar_g?: number | null
          target_sodium_mg?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      custom_foods: {
        Row: {
          id: string
          user_id: string
          name: string
          brand: string | null
          category: string | null
          serving_size: number | null
          serving_unit: string | null
          calories_per_serving: number | null
          protein_per_serving: number | null
          carbs_per_serving: number | null
          fat_per_serving: number | null
          fiber_per_serving: number | null
          sugar_per_serving: number | null
          sodium_per_serving: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          brand?: string | null
          category?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_serving?: number | null
          protein_per_serving?: number | null
          carbs_per_serving?: number | null
          fat_per_serving?: number | null
          fiber_per_serving?: number | null
          sugar_per_serving?: number | null
          sodium_per_serving?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          brand?: string | null
          category?: string | null
          serving_size?: number | null
          serving_unit?: string | null
          calories_per_serving?: number | null
          protein_per_serving?: number | null
          carbs_per_serving?: number | null
          fat_per_serving?: number | null
          fiber_per_serving?: number | null
          sugar_per_serving?: number | null
          sodium_per_serving?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}