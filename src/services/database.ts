import { supabase } from '../config/supabase'
import type { FoodEntry, BloodGlucoseReading, UserProfile } from '../types'

export class DatabaseService {
  // Food Entries
  static async saveFoodEntry(entry: Omit<FoodEntry, 'id'>) {
    const { data, error } = await supabase
      .from('food_entries')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        food_id: null, // We'll link to foods table later
        custom_food_name: entry.name,
        serving_amount: entry.amount,
        serving_unit: entry.unit,
        calories: entry.calories,
        protein_g: entry.protein,
        carbs_g: entry.carbs,
        fat_g: entry.fat,
        fiber_g: entry.fiber || 0,
        sugar_g: entry.sugar || 0,
        sodium_mg: entry.sodium || 0,
        meal_type: entry.mealType,
        consumed_at: entry.date
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getFoodEntries(startDate?: string, endDate?: string) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    let query = supabase
      .from('food_entries')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('consumed_at', { ascending: false })

    if (startDate) {
      query = query.gte('consumed_at', startDate)
    }
    if (endDate) {
      query = query.lte('consumed_at', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(entry => ({
      id: entry.id,
      name: entry.custom_food_name || 'Unknown Food',
      amount: entry.serving_amount,
      unit: entry.serving_unit,
      calories: entry.calories || 0,
      protein: entry.protein_g || 0,
      carbs: entry.carbs_g || 0,
      fat: entry.fat_g || 0,
      fiber: entry.fiber_g || 0,
      sugar: entry.sugar_g || 0,
      sodium: entry.sodium_mg || 0,
      date: entry.consumed_at,
      mealType: entry.meal_type as FoodEntry['mealType']
    }))
  }

  static async updateFoodEntry(id: string, updates: Partial<FoodEntry>) {
    const { data, error } = await supabase
      .from('food_entries')
      .update({
        custom_food_name: updates.name,
        serving_amount: updates.amount,
        serving_unit: updates.unit,
        calories: updates.calories,
        protein_g: updates.protein,
        carbs_g: updates.carbs,
        fat_g: updates.fat,
        fiber_g: updates.fiber,
        sugar_g: updates.sugar,
        sodium_mg: updates.sodium,
        meal_type: updates.mealType,
        consumed_at: updates.date
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteFoodEntry(id: string) {
    const { error } = await supabase
      .from('food_entries')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Blood Glucose Readings
  static async saveBloodGlucoseReading(reading: Omit<BloodGlucoseReading, 'id'>) {
    const { data, error } = await supabase
      .from('blood_glucose_readings')
      .insert({
        user_id: (await supabase.auth.getUser()).data.user?.id!,
        glucose_level: reading.level,
        reading_type: reading.type,
        notes: reading.notes,
        measured_at: reading.timestamp
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getBloodGlucoseReadings(startDate?: string, endDate?: string) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    let query = supabase
      .from('blood_glucose_readings')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('measured_at', { ascending: false })

    if (startDate) {
      query = query.gte('measured_at', startDate)
    }
    if (endDate) {
      query = query.lte('measured_at', endDate)
    }

    const { data, error } = await query

    if (error) throw error

    return data.map(reading => ({
      id: reading.id,
      level: reading.glucose_level,
      type: reading.reading_type as BloodGlucoseReading['type'],
      notes: reading.notes || '',
      timestamp: reading.measured_at
    }))
  }

  static async deleteBloodGlucoseReading(id: string) {
    const { error } = await supabase
      .from('blood_glucose_readings')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // User Profile
  static async saveUserProfile(profile: Omit<UserProfile, 'id'>) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: user.data.user.id,
        name: profile.name,
        age: profile.age,
        gender: profile.gender,
        height_cm: profile.height,
        weight_kg: profile.weight,
        activity_level: profile.activityLevel,
        health_conditions: profile.healthConditions,
        dietary_restrictions: profile.dietaryRestrictions,
        target_calories: profile.targetCalories,
        target_protein_g: profile.targetProtein,
        target_carbs_g: profile.targetCarbs,
        target_fat_g: profile.targetFat,
        target_fiber_g: profile.targetFiber
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.data.user.id)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null

    return {
      id: data.id,
      name: data.name || '',
      age: data.age || 0,
      gender: data.gender as UserProfile['gender'] || 'other',
      height: data.height_cm || 0,
      weight: data.weight_kg || 0,
      activityLevel: data.activity_level as UserProfile['activityLevel'] || 'moderate',
      healthConditions: data.health_conditions || [],
      dietaryRestrictions: data.dietary_restrictions || [],
      targetCalories: data.target_calories || 2000,
      targetProtein: data.target_protein_g || 150,
      targetCarbs: data.target_carbs_g || 250,
      targetFat: data.target_fat_g || 65,
      targetFiber: data.target_fiber_g || 25
    }
  }

  // Foods Database
  static async searchFoods(query: string) {
    const searchTerm = query.toLowerCase()
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .limit(20)

    if (error) throw error
    return data
  }

  static async getAllFoods(page: number = 0, limit: number = 50) {
    const offset = page * limit
    
    try {
      // Try to get foods from the main foods table
      const { data: foodsData, error: foodsError, count: foodsCount } = await supabase
        .from('foods')
        .select('*', { count: 'exact' })
        .order('name')
        .range(offset, offset + limit - 1)

      if (foodsError) {
        console.warn('Foods table error:', foodsError)
        // If foods table doesn't exist or has errors, try custom_foods
        const { data: customData, error: customError, count: customCount } = await supabase
          .from('custom_foods')
          .select('*', { count: 'exact' })
          .order('name')
          .range(offset, offset + limit - 1)

        if (customError) {
          console.warn('Custom foods table error:', customError)
          // If both tables fail, return fallback data
          return this.getFallbackFoods(page, limit)
        }

        // Map custom foods to foods format
        const mappedCustomFoods = (customData || []).map(food => ({
          id: food.id,
          name: food.name,
          brand: food.brand,
          category: food.category,
          calories_per_100g: food.calories_per_serving,
          protein_per_100g: food.protein_per_serving,
          carbs_per_100g: food.carbs_per_serving,
          fat_per_100g: food.fat_per_serving,
          fiber_per_100g: food.fiber_per_serving,
          sugar_per_100g: food.sugar_per_serving,
          sodium_per_100g: food.sodium_per_serving
        }))

        return { data: mappedCustomFoods, count: customCount || 0 }
      }

      // If foods table is empty, show fallback foods
      if ((foodsData || []).length === 0 && page === 0) {
        return this.getFallbackFoods(page, limit)
      }

      return { data: foodsData || [], count: foodsCount || 0 }
    } catch (error) {
      console.error('Error in getAllFoods:', error)
      return this.getFallbackFoods(page, limit)
    }
  }

  static getFallbackFoods(page: number = 0, limit: number = 50) {
    const fallbackFoods = [
      { id: 'fb1', name: 'Apple', brand: null, category: 'Fruits', calories_per_100g: 52, protein_per_100g: 0.3, carbs_per_100g: 14, fat_per_100g: 0.2, fiber_per_100g: 2.4, sugar_per_100g: 10, sodium_per_100g: 1 },
      { id: 'fb2', name: 'Banana', brand: null, category: 'Fruits', calories_per_100g: 89, protein_per_100g: 1.1, carbs_per_100g: 23, fat_per_100g: 0.3, fiber_per_100g: 2.6, sugar_per_100g: 12, sodium_per_100g: 1 },
      { id: 'fb3', name: 'Rice (White)', brand: null, category: 'Grains', calories_per_100g: 130, protein_per_100g: 2.7, carbs_per_100g: 28, fat_per_100g: 0.3, fiber_per_100g: 0.4, sugar_per_100g: 0.1, sodium_per_100g: 5 },
      { id: 'fb4', name: 'Chicken Breast', brand: null, category: 'Proteins', calories_per_100g: 165, protein_per_100g: 31, carbs_per_100g: 0, fat_per_100g: 3.6, fiber_per_100g: 0, sugar_per_100g: 0, sodium_per_100g: 74 },
      { id: 'fb5', name: 'Yam', brand: null, category: 'Starches', calories_per_100g: 118, protein_per_100g: 1.5, carbs_per_100g: 27.9, fat_per_100g: 0.2, fiber_per_100g: 4.1, sugar_per_100g: 0.5, sodium_per_100g: 9 },
      { id: 'fb6', name: 'Plantain', brand: null, category: 'Starches', calories_per_100g: 122, protein_per_100g: 1.3, carbs_per_100g: 31.9, fat_per_100g: 0.4, fiber_per_100g: 2.3, sugar_per_100g: 15, sodium_per_100g: 4 },
      { id: 'fb7', name: 'Cassava', brand: null, category: 'Starches', calories_per_100g: 160, protein_per_100g: 1.4, carbs_per_100g: 38.1, fat_per_100g: 0.3, fiber_per_100g: 1.8, sugar_per_100g: 1.7, sodium_per_100g: 14 },
      { id: 'fb8', name: 'Ugu (Fluted Pumpkin)', brand: null, category: 'Vegetables', calories_per_100g: 35, protein_per_100g: 5.0, carbs_per_100g: 5.8, fat_per_100g: 0.8, fiber_per_100g: 2.5, sugar_per_100g: 2.2, sodium_per_100g: 15 },
      { id: 'fb9', name: 'Waterleaf', brand: null, category: 'Vegetables', calories_per_100g: 22, protein_per_100g: 2.5, carbs_per_100g: 4.0, fat_per_100g: 0.3, fiber_per_100g: 2.1, sugar_per_100g: 1.5, sodium_per_100g: 8 },
      { id: 'fb10', name: 'Okra', brand: null, category: 'Vegetables', calories_per_100g: 33, protein_per_100g: 1.9, carbs_per_100g: 7.5, fat_per_100g: 0.2, fiber_per_100g: 3.2, sugar_per_100g: 1.5, sodium_per_100g: 7 },
      { id: 'fb11', name: 'Sweet Potato', brand: null, category: 'Starches', calories_per_100g: 86, protein_per_100g: 1.6, carbs_per_100g: 20.1, fat_per_100g: 0.1, fiber_per_100g: 3.0, sugar_per_100g: 4.2, sodium_per_100g: 5 },
      { id: 'fb12', name: 'Palm Oil', brand: null, category: 'Fats', calories_per_100g: 884, protein_per_100g: 0, carbs_per_100g: 0, fat_per_100g: 100, fiber_per_100g: 0, sugar_per_100g: 0, sodium_per_100g: 0 },
      { id: 'fb13', name: 'Groundnut (Peanuts)', brand: null, category: 'Nuts', calories_per_100g: 567, protein_per_100g: 25.8, carbs_per_100g: 16.1, fat_per_100g: 49.2, fiber_per_100g: 8.5, sugar_per_100g: 4.7, sodium_per_100g: 18 },
      { id: 'fb14', name: 'Beans (Black-eyed Peas)', brand: null, category: 'Legumes', calories_per_100g: 336, protein_per_100g: 23.5, carbs_per_100g: 60.0, fat_per_100g: 1.3, fiber_per_100g: 11.0, sugar_per_100g: 6.9, sodium_per_100g: 6 },
      { id: 'fb15', name: 'Jollof Rice', brand: null, category: 'Dishes', calories_per_100g: 150, protein_per_100g: 3.5, carbs_per_100g: 28.0, fat_per_100g: 3.0, fiber_per_100g: 1.0, sugar_per_100g: 2.0, sodium_per_100g: 400 }
    ]

    const offset = page * limit
    const paginatedFoods = fallbackFoods.slice(offset, offset + limit)
    
    return { 
      data: paginatedFoods, 
      count: fallbackFoods.length,
      isFallback: true 
    }
  }

  static async addCustomFood(food: {
    name: string
    brand?: string
    category?: string
    calories: number
    protein: number
    carbs: number
    fat: number
    fiber?: number
    sugar?: number
    sodium?: number
    servingSize: number
    servingUnit: string
  }) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('custom_foods')
      .insert({
        user_id: user.data.user.id,
        name: food.name,
        brand: food.brand,
        category: food.category,
        serving_size: food.servingSize,
        serving_unit: food.servingUnit,
        calories_per_serving: food.calories,
        protein_per_serving: food.protein,
        carbs_per_serving: food.carbs,
        fat_per_serving: food.fat,
        fiber_per_serving: food.fiber || 0,
        sugar_per_serving: food.sugar || 0,
        sodium_per_serving: food.sodium || 0
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getCustomFoods() {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', user.data.user.id)
      .order('name')

    if (error) throw error
    return data
  }

  // Nutrition Goals
  static async saveNutritionGoals(date: string, goals: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
    fiber?: number
    sugar?: number
    sodium?: number
  }) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('nutrition_goals')
      .upsert({
        user_id: user.data.user.id,
        goal_date: date,
        target_calories: goals.calories,
        target_protein_g: goals.protein,
        target_carbs_g: goals.carbs,
        target_fat_g: goals.fat,
        target_fiber_g: goals.fiber,
        target_sugar_g: goals.sugar,
        target_sodium_mg: goals.sodium
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async getNutritionGoals(date: string) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', user.data.user.id)
      .eq('goal_date', date)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  // Authentication helpers
  static async signUp(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (error) throw error
    return data
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    if (error) throw error
    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  static async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  }

  static onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null)
    })
  }
}