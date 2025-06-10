import { useState, useEffect } from 'react'
import { DatabaseService } from '../services/database'
import { FoodItem, FoodEntry } from '../types'
import { useAuth } from '../components/AuthProvider'

export function useFoodData() {
  const [foods, setFoods] = useState<FoodItem[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Convert FoodEntry to FoodItem for compatibility with existing components
  const convertEntryToItem = (entry: FoodEntry): FoodItem => ({
    id: entry.id,
    name: entry.name,
    quantity: entry.amount,
    unit: entry.unit,
    calories: entry.calories,
    nutrients: [
      { id: '1', name: 'Protein', amount: entry.protein, unit: 'g', category: 'macronutrient' },
      { id: '2', name: 'Carbohydrates', amount: entry.carbs, unit: 'g', category: 'macronutrient' },
      { id: '3', name: 'Fat', amount: entry.fat, unit: 'g', category: 'macronutrient' },
      { id: '4', name: 'Fiber', amount: entry.fiber || 0, unit: 'g', category: 'other' },
      { id: '5', name: 'Sugar', amount: entry.sugar || 0, unit: 'g', category: 'other' },
      { id: '6', name: 'Sodium', amount: entry.sodium || 0, unit: 'mg', category: 'mineral' },
      { id: '7', name: 'Cholesterol', amount: entry.cholesterol || 0, unit: 'mg', category: 'other' },
      { id: '8', name: 'Potassium', amount: entry.potassium || 0, unit: 'mg', category: 'mineral' },
      { id: '9', name: 'Iron', amount: entry.iron || 0, unit: 'mg', category: 'mineral' },
      { id: '10', name: 'Calcium', amount: entry.calcium || 0, unit: 'mg', category: 'mineral' },
      { id: '11', name: 'Vitamin C', amount: entry.vitamin_c || 0, unit: 'mg', category: 'vitamin' },
      { id: '12', name: 'Vitamin D', amount: entry.vitamin_d || 0, unit: 'IU', category: 'vitamin' }
    ],
    category: entry.mealType || 'other',
    dateAdded: new Date(entry.date),
    cookingState: entry.cookingState
  })

  // Convert FoodItem to FoodEntry for database storage
  const convertItemToEntry = (item: FoodItem): Omit<FoodEntry, 'id'> => {
    const proteinNutrient = item.nutrients.find(n => n.name === 'Protein')
    const carbsNutrient = item.nutrients.find(n => n.name === 'Carbohydrates')
    const fatNutrient = item.nutrients.find(n => n.name === 'Fat')
    const fiberNutrient = item.nutrients.find(n => n.name === 'Fiber')
    const sugarNutrient = item.nutrients.find(n => n.name === 'Sugar')
    const sodiumNutrient = item.nutrients.find(n => n.name === 'Sodium')
    const cholesterolNutrient = item.nutrients.find(n => n.name === 'Cholesterol')
    const potassiumNutrient = item.nutrients.find(n => n.name === 'Potassium')
    const ironNutrient = item.nutrients.find(n => n.name === 'Iron')
    const calciumNutrient = item.nutrients.find(n => n.name === 'Calcium')
    const vitaminCNutrient = item.nutrients.find(n => n.name === 'Vitamin C')
    const vitaminDNutrient = item.nutrients.find(n => n.name === 'Vitamin D')

    return {
      name: item.name,
      amount: item.quantity,
      unit: item.unit,
      calories: item.calories,
      protein: proteinNutrient?.amount || 0,
      carbs: carbsNutrient?.amount || 0,
      fat: fatNutrient?.amount || 0,
      fiber: fiberNutrient?.amount || 0,
      sugar: sugarNutrient?.amount || 0,
      sodium: sodiumNutrient?.amount || 0,
      cholesterol: cholesterolNutrient?.amount || 0,
      potassium: potassiumNutrient?.amount || 0,
      iron: ironNutrient?.amount || 0,
      calcium: calciumNutrient?.amount || 0,
      vitamin_c: vitaminCNutrient?.amount || 0,
      vitamin_d: vitaminDNutrient?.amount || 0,
      date: item.dateAdded.toISOString(),
      mealType: (item.category as FoodEntry['mealType']) || 'snack',
      cookingState: item.cookingState
    }
  }

  // Load food data from database
  const loadFoods = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      const entries = await DatabaseService.getFoodEntries()
      const convertedFoods = entries.map(convertEntryToItem)
      setFoods(convertedFoods)
    } catch (error) {
      console.error('Error loading foods:', error)
    } finally {
      setLoading(false)
    }
  }

  // Add new food
  const addFood = async (food: FoodItem) => {
    try {
      const entry = convertItemToEntry(food)
      const savedEntry = await DatabaseService.saveFoodEntry(entry)
      
      // Add to local state with the returned ID
      const newFood = { ...food, id: savedEntry.id }
      setFoods(prev => [...prev, newFood])
      return newFood
    } catch (error) {
      console.error('Error adding food:', error)
      throw error
    }
  }

  // Update food
  const updateFood = async (id: string, updates: Partial<FoodItem>) => {
    try {
      // Find the food to update
      const existingFood = foods.find(f => f.id === id)
      if (!existingFood) return

      // Apply updates
      const updatedFood = { ...existingFood, ...updates }
      
      // Convert to database format
      const entryUpdates = convertItemToEntry(updatedFood)
      await DatabaseService.updateFoodEntry(id, entryUpdates)
      
      // Update local state
      setFoods(prev => prev.map(food => 
        food.id === id ? updatedFood : food
      ))
      
      return updatedFood
    } catch (error) {
      console.error('Error updating food:', error)
      throw error
    }
  }

  // Delete food
  const deleteFood = async (id: string) => {
    try {
      await DatabaseService.deleteFoodEntry(id)
      setFoods(prev => prev.filter(food => food.id !== id))
    } catch (error) {
      console.error('Error deleting food:', error)
      throw error
    }
  }

  // Load data when user changes
  useEffect(() => {
    loadFoods()
  }, [user])

  return {
    foods,
    loading,
    addFood,
    updateFood,
    deleteFood,
    refreshFoods: loadFoods
  }
}