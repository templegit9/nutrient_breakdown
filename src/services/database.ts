import { supabase } from '../config/supabase'
import type { FoodEntry, BloodGlucoseReading, UserProfile, DatabaseFood } from '../types'

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
        cholesterol_mg: entry.cholesterol || 0,
        potassium_mg: entry.potassium || 0,
        calcium_mg: entry.calcium || 0,
        iron_mg: entry.iron || 0,
        magnesium_mg: entry.magnesium || 0,
        phosphorus_mg: entry.phosphorus || 0,
        zinc_mg: entry.zinc || 0,
        copper_mg: entry.copper || 0,
        manganese_mg: entry.manganese || 0,
        selenium_mcg: entry.selenium || 0,
        vitamin_a_iu: entry.vitamin_a || 0,
        vitamin_c_mg: entry.vitamin_c || 0,
        vitamin_d_iu: entry.vitamin_d || 0,
        vitamin_e_mg: entry.vitamin_e || 0,
        vitamin_k_mcg: entry.vitamin_k || 0,
        thiamin_mg: entry.thiamin || 0,
        riboflavin_mg: entry.riboflavin || 0,
        niacin_mg: entry.niacin || 0,
        pantothenic_acid_mg: entry.pantothenic_acid || 0,
        vitamin_b6_mg: entry.vitamin_b6 || 0,
        biotin_mcg: entry.biotin || 0,
        folate_mcg: entry.folate || 0,
        vitamin_b12_mcg: entry.vitamin_b12 || 0,
        choline_mg: entry.choline || 0,
        glycemic_index: entry.glycemic_index || null,
        glycemic_load: entry.glycemic_load || null,
        meal_type: entry.mealType,
        cooking_state: entry.cookingState || 'raw',
        time_of_day: entry.timeOfDay || null,
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
      mealType: entry.meal_type as FoodEntry['mealType'],
      cookingState: entry.cooking_state as FoodEntry['cookingState'] || 'raw',
      timeOfDay: entry.time_of_day as FoodEntry['timeOfDay'] || null
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
        cooking_state: updates.cookingState,
        time_of_day: updates.timeOfDay,
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

    console.log('DatabaseService: Saving user profile for user:', user.data.user.id)
    console.log('DatabaseService: Profile data:', profile)

    const profileData = {
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
    }

    console.log('DatabaseService: Upserting profile data:', profileData)

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(profileData)
      .select()
      .single()

    if (error) {
      console.error('DatabaseService: Error saving user profile:', error)
      throw error
    }
    
    console.log('DatabaseService: Successfully saved user profile:', data)
    return data
  }

  static async getUserProfile(): Promise<UserProfile | null> {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    console.log('DatabaseService: Getting user profile for user:', user.data.user.id)

    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.data.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('DatabaseService: Error getting user profile:', error)
      throw error
    }
    
    if (!data) {
      console.log('DatabaseService: No user profile found')
      return null
    }

    console.log('DatabaseService: Found user profile:', data)

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
  static async searchAllFoods(query: string) {
    const searchTerm = query.toLowerCase()
    console.log('Searching all foods (database + custom) with query:', searchTerm)
    
    try {
      // Search database foods and custom foods in parallel
      const [databaseFoodsResult, customFoodsResult] = await Promise.all([
        this.searchFoods(searchTerm),
        this.searchCustomFoods(searchTerm)
      ])
      
      // Combine and sort results
      const combinedResults = [
        ...databaseFoodsResult.map(food => ({ ...food, isCustom: false })),
        ...customFoodsResult.map(food => ({ ...food, isCustom: true }))
      ].sort((a, b) => a.name.localeCompare(b.name))
      
      console.log('Combined search results:', combinedResults.length, 'foods found')
      return combinedResults
    } catch (error) {
      console.error('Error searching all foods:', error)
      throw error
    }
  }

  static async searchCustomFoods(query: string) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')
    
    const searchTerm = query.toLowerCase()
    console.log('Searching custom foods with query:', searchTerm)
    
    const { data, error } = await supabase
      .from('custom_foods')
      .select('*')
      .eq('user_id', user.data.user.id)
      .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('name')
      .limit(20)

    if (error) {
      console.error('Custom foods search error:', error)
      throw new Error(`Custom foods search error: ${error.message}`)
    }
    
    return (data || []).map(food => ({
      id: food.id.toString(),
      name: food.name || 'Unknown Food',
      brand: food.brand,
      category: food.category,
      preparation_state: 'raw', // Custom foods default to raw
      serving_size: food.serving_size || 100,
      serving_unit: food.serving_unit || 'g',
      // Convert per-serving to per-100g for consistency with database foods
      calories_per_100g: (food.calories_per_serving || 0) * 100 / (food.serving_size || 100),
      protein_per_100g: (food.protein_per_serving || 0) * 100 / (food.serving_size || 100),
      carbs_per_100g: (food.carbs_per_serving || 0) * 100 / (food.serving_size || 100),
      fat_per_100g: (food.fat_per_serving || 0) * 100 / (food.serving_size || 100),
      fiber_per_100g: (food.fiber_per_serving || 0) * 100 / (food.serving_size || 100),
      sugar_per_100g: (food.sugar_per_serving || 0) * 100 / (food.serving_size || 100),
      sodium_per_100g: (food.sodium_per_serving || 0) * 100 / (food.serving_size || 100),
      cholesterol_per_100g: 0, // Not tracked in custom foods
      potassium_per_100g: 0, // Not tracked in custom foods
      iron_per_100g: 0, // Not tracked in custom foods
      calcium_per_100g: 0, // Not tracked in custom foods
      vitamin_c_per_100g: 0, // Not tracked in custom foods
      vitamin_d_per_100g: 0, // Not tracked in custom foods
      glycemic_index: null,
      glycemic_load: null,
      created_at: food.created_at,
      updated_at: food.updated_at
    }))
  }

  static async searchFoods(query: string) {
    const searchTerm = query.toLowerCase()
    console.log('Searching foods table with query:', searchTerm)
    
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,brand.ilike.%${searchTerm}%,category.ilike.%${searchTerm}%`)
      .order('name')
      .limit(20)

    console.log('Foods search results:', { data, error })

    if (error) {
      console.error('Foods search error:', error)
      throw new Error(`Search error: ${error.message}`)
    }
    
    return (data || []).map(food => ({
      id: food.id,
      name: food.name || 'Unknown Food',
      brand: food.brand,
      category: food.category,
      preparation_state: food.preparation_state || 'raw',
      serving_size: food.serving_size || 100,
      serving_unit: food.serving_unit || 'g',
      calories_per_100g: food.calories_per_100g || 0,
      protein_per_100g: food.protein_per_100g || 0,
      carbs_per_100g: food.carbs_per_100g || 0,
      fat_per_100g: food.fat_per_100g || 0,
      fiber_per_100g: food.fiber_per_100g || 0,
      sugar_per_100g: food.sugar_per_100g || 0,
      sodium_per_100g: food.sodium_per_100g || 0,
      cholesterol_per_100g: food.cholesterol_per_100g || 0,
      potassium_per_100g: food.potassium_per_100g || 0,
      iron_per_100g: food.iron_per_100g || 0,
      calcium_per_100g: food.calcium_per_100g || 0,
      vitamin_c_per_100g: food.vitamin_c_per_100g || 0,
      vitamin_d_per_100g: food.vitamin_d_per_100g || 0,
      glycemic_index: food.glycemic_index || null,
      glycemic_load: food.glycemic_load || null,
      created_at: food.created_at,
      updated_at: food.updated_at
    }))
  }

  // Debug method to check database schema
  static async checkDatabaseSchema() {
    try {
      // Try to get a small sample from foods table to see the structure
      const { data, error } = await supabase
        .from('foods')
        .select('*')
        .limit(1)

      console.log('Foods table sample:', { data, error })

      // Also check custom_foods table
      const { data: customData, error: customError } = await supabase
        .from('custom_foods')
        .select('*')
        .limit(1)

      console.log('Custom foods table sample:', { customData, customError })

      return { foods: { data, error }, custom_foods: { data: customData, error: customError } }
    } catch (err) {
      console.error('Schema check error:', err)
      return { error: err }
    }
  }

  static async getAllFoods(page: number = 0, limit: number = 50) {
    const offset = page * limit
    
    console.log('Fetching foods from foods table, page:', page, 'limit:', limit)
    
    let query = supabase
      .from('foods')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true })

    if (page > 0 || limit < 1000) {
      query = query.range(offset, offset + limit - 1)
    }

    const { data, error, count } = await query

    console.log('Foods table response:', { data, error, count, offset, limit })

    if (error) {
      console.error('Foods table error:', error)
      throw new Error(`Database error: ${error.message}`)
    }

    const mappedFoods: DatabaseFood[] = (data || []).map(food => ({
      id: food.id,
      name: food.name || 'Unknown Food',
      brand: food.brand,
      category: food.category,
      preparation_state: food.preparation_state || 'raw',
      serving_size: food.serving_size || 100,
      serving_unit: food.serving_unit || 'g',
      calories_per_100g: food.calories_per_100g || 0,
      protein_per_100g: food.protein_per_100g || 0,
      carbs_per_100g: food.carbs_per_100g || 0,
      fat_per_100g: food.fat_per_100g || 0,
      fiber_per_100g: food.fiber_per_100g || 0,
      sugar_per_100g: food.sugar_per_100g || 0,
      sodium_per_100g: food.sodium_per_100g || 0,
      cholesterol_per_100g: food.cholesterol_per_100g || 0,
      potassium_per_100g: food.potassium_per_100g || 0,
      iron_per_100g: food.iron_per_100g || 0,
      calcium_per_100g: food.calcium_per_100g || 0,
      vitamin_c_per_100g: food.vitamin_c_per_100g || 0,
      vitamin_d_per_100g: food.vitamin_d_per_100g || 0,
      glycemic_index: food.glycemic_index || null,
      glycemic_load: food.glycemic_load || null,
      created_at: food.created_at,
      updated_at: food.updated_at
    }))

    return {
      data: mappedFoods,
      count: count || 0
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

  static async updateCustomFood(id: string, updates: {
    name?: string
    brand?: string
    category?: string
    serving_size?: number
    serving_unit?: string
    calories_per_serving?: number
    protein_per_serving?: number
    carbs_per_serving?: number
    fat_per_serving?: number
    fiber_per_serving?: number
    sugar_per_serving?: number
    sodium_per_serving?: number
  }) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { data, error } = await supabase
      .from('custom_foods')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.data.user.id) // Ensure user can only update their own foods
      .select()
      .single()

    if (error) throw error
    return data
  }

  static async deleteCustomFood(id: string) {
    const user = await supabase.auth.getUser()
    if (!user.data.user) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('custom_foods')
      .delete()
      .eq('id', id)
      .eq('user_id', user.data.user.id) // Ensure user can only delete their own foods

    if (error) throw error
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