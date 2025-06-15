import { supabase } from '../config/supabase';
import type { GroupedFoodEntry, FoodItem } from './llmFoodBrain';

export interface GroupedFoodEntryDB {
  id: string;
  user_id: string;
  description: string;
  individual_items: FoodItem[]; // JSON field
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
  time_of_day?: string;
  created_at: string;
}

export class GroupedFoodDatabase {
  /**
   * Save a grouped food entry to the database
   */
  static async saveGroupedFoodEntry(entry: GroupedFoodEntry): Promise<{ data: any; error: any }> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        return { data: null, error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('grouped_food_entries')
        .insert({
          user_id: user.data.user.id,
          description: entry.combinedName,
          individual_items: entry.individualItems,
          total_calories: entry.totalCalories,
          total_protein: entry.totalNutrients.protein,
          total_carbs: entry.totalNutrients.carbohydrates,
          total_fat: entry.totalNutrients.fat,
          time_of_day: entry.timeOfDay
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      console.error('Error saving grouped food entry:', error);
      return { data: null, error };
    }
  }

  /**
   * Get all grouped food entries for the current user
   */
  static async getUserGroupedFoodEntries(limit = 100, offset = 0): Promise<{ data: GroupedFoodEntry[]; error: any }> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        return { data: [], error: 'User not authenticated' };
      }

      const { data, error } = await supabase
        .from('grouped_food_entries')
        .select('*')
        .eq('user_id', user.data.user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        console.error('Database query error:', error);
        return { data: [], error };
      }

      console.log('Raw database data:', data);

      // Ensure data is an array and convert database format to GroupedFoodEntry format
      if (!Array.isArray(data)) {
        console.warn('Database returned non-array data:', data);
        return { data: [], error: 'Invalid data format from database' };
      }

      const groupedEntries: GroupedFoodEntry[] = data.map(GroupedFoodDatabase.dbToGroupedEntry);
      console.log('Converted entries:', groupedEntries);

      return { data: groupedEntries, error: null };
    } catch (error) {
      console.error('Error fetching grouped food entries:', error);
      return { data: [], error };
    }
  }

  /**
   * Get grouped food entries for a specific date
   */
  static async getGroupedFoodEntriesForDate(date: Date): Promise<{ data: GroupedFoodEntry[]; error: any }> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        return { data: [], error: 'User not authenticated' };
      }

      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('grouped_food_entries')
        .select('*')
        .eq('user_id', user.data.user.id)
        .gte('created_at', startOfDay.toISOString())
        .lte('created_at', endOfDay.toISOString())
        .order('created_at', { ascending: false });

      if (error) {
        return { data: [], error };
      }

      const groupedEntries: GroupedFoodEntry[] = (data || []).map(GroupedFoodDatabase.dbToGroupedEntry);

      return { data: groupedEntries, error: null };
    } catch (error) {
      console.error('Error fetching grouped food entries for date:', error);
      return { data: [], error };
    }
  }

  /**
   * Delete a grouped food entry
   */
  static async deleteGroupedFoodEntry(id: string): Promise<{ error: any }> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        return { error: 'User not authenticated' };
      }

      const { error } = await supabase
        .from('grouped_food_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.data.user.id);

      return { error };
    } catch (error) {
      console.error('Error deleting grouped food entry:', error);
      return { error };
    }
  }

  /**
   * Get nutrition totals for a specific date
   */
  static async getDailyNutritionTotals(date: Date): Promise<{
    data: {
      totalCalories: number;
      totalNutrients: {
        protein: number;
        carbohydrates: number;
        fat: number;
        fiber: number;
        sugar: number;
        sodium: number;
        calcium: number;
        iron: number;
        vitamin_c: number;
        vitamin_d: number;
        potassium: number;
      };
    };
    error: any;
  }> {
    try {
      const { data: entries, error } = await GroupedFoodDatabase.getGroupedFoodEntriesForDate(date);
      
      if (error) {
        return {
          data: {
            totalCalories: 0,
            totalNutrients: {
              protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
              calcium: 0, iron: 0, vitamin_c: 0, vitamin_d: 0, potassium: 0
            }
          },
          error
        };
      }

      const totals = entries.reduce((acc, entry) => ({
        totalCalories: acc.totalCalories + entry.totalCalories,
        totalNutrients: {
          protein: acc.totalNutrients.protein + entry.totalNutrients.protein,
          carbohydrates: acc.totalNutrients.carbohydrates + entry.totalNutrients.carbohydrates,
          fat: acc.totalNutrients.fat + entry.totalNutrients.fat,
          fiber: acc.totalNutrients.fiber + entry.totalNutrients.fiber,
          sugar: acc.totalNutrients.sugar + entry.totalNutrients.sugar,
          sodium: acc.totalNutrients.sodium + entry.totalNutrients.sodium,
          calcium: acc.totalNutrients.calcium + (entry.totalNutrients.calcium || 0),
          iron: acc.totalNutrients.iron + (entry.totalNutrients.iron || 0),
          vitamin_c: acc.totalNutrients.vitamin_c + (entry.totalNutrients.vitamin_c || 0),
          vitamin_d: acc.totalNutrients.vitamin_d + (entry.totalNutrients.vitamin_d || 0),
          potassium: acc.totalNutrients.potassium + (entry.totalNutrients.potassium || 0)
        }
      }), {
        totalCalories: 0,
        totalNutrients: {
          protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
          calcium: 0, iron: 0, vitamin_c: 0, vitamin_d: 0, potassium: 0
        }
      });

      return { data: totals, error: null };
    } catch (error) {
      console.error('Error calculating daily nutrition totals:', error);
      return {
        data: {
          totalCalories: 0,
          totalNutrients: {
            protein: 0, carbohydrates: 0, fat: 0, fiber: 0, sugar: 0, sodium: 0,
            calcium: 0, iron: 0, vitamin_c: 0, vitamin_d: 0, potassium: 0
          }
        },
        error
      };
    }
  }

  /**
   * Convert database record to GroupedFoodEntry
   */
  static dbToGroupedEntry(dbEntry: GroupedFoodEntryDB): GroupedFoodEntry {
    return {
      id: dbEntry.id,
      originalInput: dbEntry.description, // Use description as original input
      combinedName: dbEntry.description,
      totalCalories: dbEntry.total_calories,
      totalNutrients: {
        protein: dbEntry.total_protein,
        carbohydrates: dbEntry.total_carbs,
        fat: dbEntry.total_fat,
        fiber: 0, // Default values for missing nutrients
        sugar: 0,
        sodium: 0,
        calcium: 0,
        iron: 0,
        vitamin_c: 0,
        vitamin_d: 0,
        potassium: 0
      },
      individualItems: dbEntry.individual_items,
      dateAdded: new Date(dbEntry.created_at),
      timeOfDay: dbEntry.time_of_day
    };
  }
}

export { GroupedFoodDatabase };