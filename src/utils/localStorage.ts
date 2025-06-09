import { FoodItem } from '../types';

const STORAGE_KEYS = {
  FOOD_HISTORY: 'nutrient_tracker_food_history',
  USER_PREFERENCES: 'nutrient_tracker_preferences',
  DAILY_GOALS: 'nutrient_tracker_daily_goals'
};

export interface UserPreferences {
  theme: 'light' | 'dark';
  units: 'metric' | 'imperial';
  defaultCategory: string;
  pcosMode: boolean;
  diabetesMode: boolean;
  showNutrientDetails: boolean;
}

export interface DailyGoals {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
  sugar: number;
}

class LocalStorageManager {
  private isAvailable(): boolean {
    try {
      const test = '__localStorage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  private safeGet<T>(key: string, defaultValue: T): T {
    if (!this.isAvailable()) return defaultValue;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading from localStorage for key ${key}:`, error);
      return defaultValue;
    }
  }

  private safeSet<T>(key: string, value: T): boolean {
    if (!this.isAvailable()) return false;
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Error writing to localStorage for key ${key}:`, error);
      return false;
    }
  }

  // Food History Management
  getFoodHistory(): FoodItem[] {
    const foods = this.safeGet<FoodItem[]>(STORAGE_KEYS.FOOD_HISTORY, []);
    
    // Convert date strings back to Date objects
    return foods.map(food => ({
      ...food,
      dateAdded: new Date(food.dateAdded)
    }));
  }

  addFoodItem(food: FoodItem): boolean {
    const foods = this.getFoodHistory();
    foods.push(food);
    
    // Keep only last 500 items to prevent storage bloat
    const trimmedFoods = foods.slice(-500);
    
    return this.safeSet(STORAGE_KEYS.FOOD_HISTORY, trimmedFoods);
  }

  updateFoodItem(id: string, updatedFood: Partial<FoodItem>): boolean {
    const foods = this.getFoodHistory();
    const index = foods.findIndex(food => food.id === id);
    
    if (index === -1) return false;
    
    foods[index] = { ...foods[index], ...updatedFood };
    return this.safeSet(STORAGE_KEYS.FOOD_HISTORY, foods);
  }

  deleteFoodItem(id: string): boolean {
    const foods = this.getFoodHistory();
    const filteredFoods = foods.filter(food => food.id !== id);
    
    return this.safeSet(STORAGE_KEYS.FOOD_HISTORY, filteredFoods);
  }

  getFoodsByDate(date: Date): FoodItem[] {
    const foods = this.getFoodHistory();
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    return foods.filter(food => {
      const foodDate = new Date(food.dateAdded);
      foodDate.setHours(0, 0, 0, 0);
      return foodDate.getTime() === targetDate.getTime();
    });
  }

  getFoodsByDateRange(startDate: Date, endDate: Date): FoodItem[] {
    const foods = this.getFoodHistory();
    const start = new Date(startDate);
    const end = new Date(endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    
    return foods.filter(food => {
      const foodDate = new Date(food.dateAdded);
      return foodDate >= start && foodDate <= end;
    });
  }

  clearFoodHistory(): boolean {
    return this.safeSet(STORAGE_KEYS.FOOD_HISTORY, []);
  }

  // User Preferences Management
  getUserPreferences(): UserPreferences {
    return this.safeGet<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES, {
      theme: 'light',
      units: 'metric',
      defaultCategory: 'grains',
      pcosMode: false,
      diabetesMode: false,
      showNutrientDetails: true
    });
  }

  updateUserPreferences(preferences: Partial<UserPreferences>): boolean {
    const current = this.getUserPreferences();
    const updated = { ...current, ...preferences };
    return this.safeSet(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  // Daily Goals Management
  getDailyGoals(): DailyGoals {
    return this.safeGet<DailyGoals>(STORAGE_KEYS.DAILY_GOALS, {
      calories: 2000,
      protein: 50,
      carbs: 300,
      fat: 65,
      fiber: 25,
      sodium: 2300,
      sugar: 50
    });
  }

  updateDailyGoals(goals: Partial<DailyGoals>): boolean {
    const current = this.getDailyGoals();
    const updated = { ...current, ...goals };
    return this.safeSet(STORAGE_KEYS.DAILY_GOALS, updated);
  }

  // Data Export/Import
  exportData(): {
    foods: FoodItem[];
    preferences: UserPreferences;
    goals: DailyGoals;
    exportDate: string;
  } {
    return {
      foods: this.getFoodHistory(),
      preferences: this.getUserPreferences(),
      goals: this.getDailyGoals(),
      exportDate: new Date().toISOString()
    };
  }

  importData(data: {
    foods?: FoodItem[];
    preferences?: UserPreferences;
    goals?: DailyGoals;
  }): boolean {
    try {
      if (data.foods) {
        this.safeSet(STORAGE_KEYS.FOOD_HISTORY, data.foods);
      }
      if (data.preferences) {
        this.safeSet(STORAGE_KEYS.USER_PREFERENCES, data.preferences);
      }
      if (data.goals) {
        this.safeSet(STORAGE_KEYS.DAILY_GOALS, data.goals);
      }
      return true;
    } catch {
      return false;
    }
  }

  // Storage Statistics
  getStorageStats(): {
    totalFoods: number;
    oldestEntry: Date | null;
    newestEntry: Date | null;
    storageSize: number;
  } {
    const foods = this.getFoodHistory();
    const dates = foods.map(food => new Date(food.dateAdded));
    
    let storageSize = 0;
    try {
      const data = JSON.stringify(this.exportData());
      storageSize = new Blob([data]).size;
    } catch {
      storageSize = 0;
    }
    
    return {
      totalFoods: foods.length,
      oldestEntry: dates.length > 0 ? new Date(Math.min(...dates.map(d => d.getTime()))) : null,
      newestEntry: dates.length > 0 ? new Date(Math.max(...dates.map(d => d.getTime()))) : null,
      storageSize
    };
  }
}

// Create singleton instance
export const storageManager = new LocalStorageManager();

// Hook for React components
export function useFoodStorage() {
  const addFood = (food: FoodItem) => {
    return storageManager.addFoodItem(food);
  };

  const updateFood = (id: string, updates: Partial<FoodItem>) => {
    return storageManager.updateFoodItem(id, updates);
  };

  const deleteFood = (id: string) => {
    return storageManager.deleteFoodItem(id);
  };

  const getFoods = () => {
    return storageManager.getFoodHistory();
  };

  const getFoodsByDate = (date: Date) => {
    return storageManager.getFoodsByDate(date);
  };

  const clearHistory = () => {
    return storageManager.clearFoodHistory();
  };

  return {
    addFood,
    updateFood,
    deleteFood,
    getFoods,
    getFoodsByDate,
    clearHistory
  };
}