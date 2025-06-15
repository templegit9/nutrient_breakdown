import { supabase } from '../config/supabase';
import type { GroupedFoodEntry, GroupedFoodEntryDB } from '../types/food';

/**
 * Save a grouped food entry to the database
 */
export async function saveGroupedFoodEntry(entry: GroupedFoodEntry): Promise<{ data: any; error: any }> {
  try {
    console.log('=== INSIDE saveGroupedFoodEntry ===');
    console.log('Function start - entry received:', entry);
    console.log('supabase object:', supabase);
    console.log('supabase.auth:', supabase.auth);
    
    console.log('About to call supabase.auth.getUser()');
    let user;
    try {
      user = await supabase.auth.getUser();
      console.log('getUser result:', user);
    } catch (authError) {
      console.error('Auth error:', authError);
      throw authError;
    }
    
    if (!user.data.user) {
      console.log('User not authenticated');
      return { data: null, error: 'User not authenticated' };
    }

    console.log('Building insert data...');
    const insertData = {
      user_id: user.data.user.id,
      description: entry.combinedName,
      individual_items: entry.individualItems,
      total_calories: entry.totalCalories,
      total_protein: entry.totalNutrients.protein,
      total_carbs: entry.totalNutrients.carbohydrates,
      total_fat: entry.totalNutrients.fat,
      time_of_day: entry.timeOfDay
    };
    console.log('Insert data:', insertData);

    console.log('About to call supabase.from().insert()');
    let insertResult;
    try {
      insertResult = await supabase
        .from('grouped_food_entries')
        .insert(insertData)
        .select()
        .single();
      console.log('Insert completed, result:', insertResult);
    } catch (insertError) {
      console.error('Insert error:', insertError);
      throw insertError;
    }

    const { data, error } = insertResult;
    console.log('Final result - data:', data, 'error:', error);
    return { data, error };
  } catch (error) {
    console.error('=== FUNCTION ERROR ===');
    console.error('Error in saveGroupedFoodEntry:', error);
    console.error('Error stack:', error?.stack);
    return { data: null, error };
  }
}

/**
 * Get all grouped food entries for the current user
 */
export async function getUserGroupedFoodEntries(limit = 100, offset = 0): Promise<{ data: GroupedFoodEntry[]; error: any }> {
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

    const groupedEntries: GroupedFoodEntry[] = data.map(dbToGroupedEntry);
    console.log('Converted entries:', groupedEntries);

    return { data: groupedEntries, error: null };
  } catch (error) {
    console.error('Error fetching grouped food entries:', error);
    return { data: [], error };
  }
}

/**
 * Delete a grouped food entry
 */
export async function deleteGroupedFoodEntry(id: string): Promise<{ error: any }> {
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
 * Convert database record to GroupedFoodEntry
 */
function dbToGroupedEntry(dbEntry: GroupedFoodEntryDB): GroupedFoodEntry {
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