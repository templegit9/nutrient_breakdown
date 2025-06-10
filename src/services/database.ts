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
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .ilike('name', `%${query}%`)
      .limit(20)

    if (error) throw error
    return data
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