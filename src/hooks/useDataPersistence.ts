import { useState, useEffect, useCallback } from 'react';
import { FoodItem } from '../types';
import { storageManager, UserPreferences, DailyGoals } from '../utils/localStorage';

export function useDataPersistence() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [dailyGoals, setDailyGoals] = useState<DailyGoals | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [storedFoods, storedPreferences, storedGoals] = await Promise.all([
          Promise.resolve(storageManager.getFoodHistory()),
          Promise.resolve(storageManager.getUserPreferences()),
          Promise.resolve(storageManager.getDailyGoals())
        ]);

        setFoods(storedFoods);
        setPreferences(storedPreferences);
        setDailyGoals(storedGoals);
      } catch (err) {
        setError('Failed to load data from storage');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Food operations
  const addFood = useCallback((food: FoodItem) => {
    try {
      setFoods(prev => [...prev, food]);
      storageManager.addFoodItem(food);
      return true;
    } catch (err) {
      setError('Failed to save food item');
      console.error('Error adding food:', err);
      return false;
    }
  }, []);

  const updateFood = useCallback((id: string, updates: Partial<FoodItem>) => {
    try {
      setFoods(prev => prev.map(food => 
        food.id === id ? { ...food, ...updates } : food
      ));
      storageManager.updateFoodItem(id, updates);
      return true;
    } catch (err) {
      setError('Failed to update food item');
      console.error('Error updating food:', err);
      return false;
    }
  }, []);

  const deleteFood = useCallback((id: string) => {
    try {
      setFoods(prev => prev.filter(food => food.id !== id));
      storageManager.deleteFoodItem(id);
      return true;
    } catch (err) {
      setError('Failed to delete food item');
      console.error('Error deleting food:', err);
      return false;
    }
  }, []);

  const clearFoodHistory = useCallback(() => {
    try {
      setFoods([]);
      storageManager.clearFoodHistory();
      return true;
    } catch (err) {
      setError('Failed to clear food history');
      console.error('Error clearing food history:', err);
      return false;
    }
  }, []);

  // Preferences operations
  const updatePreferences = useCallback((newPreferences: Partial<UserPreferences>) => {
    try {
      const updated = { ...preferences!, ...newPreferences };
      setPreferences(updated);
      storageManager.updateUserPreferences(newPreferences);
      return true;
    } catch (err) {
      setError('Failed to update preferences');
      console.error('Error updating preferences:', err);
      return false;
    }
  }, [preferences]);

  // Daily goals operations
  const updateDailyGoals = useCallback((newGoals: Partial<DailyGoals>) => {
    try {
      const updated = { ...dailyGoals!, ...newGoals };
      setDailyGoals(updated);
      storageManager.updateDailyGoals(newGoals);
      return true;
    } catch (err) {
      setError('Failed to update daily goals');
      console.error('Error updating daily goals:', err);
      return false;
    }
  }, [dailyGoals]);

  // Data export/import
  const exportData = useCallback(() => {
    try {
      return storageManager.exportData();
    } catch (err) {
      setError('Failed to export data');
      console.error('Error exporting data:', err);
      return null;
    }
  }, []);

  const importData = useCallback((data: Parameters<typeof storageManager.importData>[0]) => {
    try {
      const success = storageManager.importData(data);
      if (success) {
        // Reload data after import
        setFoods(storageManager.getFoodHistory());
        setPreferences(storageManager.getUserPreferences());
        setDailyGoals(storageManager.getDailyGoals());
      }
      return success;
    } catch (err) {
      setError('Failed to import data');
      console.error('Error importing data:', err);
      return false;
    }
  }, []);

  // Utility functions
  const getFoodsByDate = useCallback((date: Date) => {
    return storageManager.getFoodsByDate(date);
  }, []);

  const getFoodsByDateRange = useCallback((startDate: Date, endDate: Date) => {
    return storageManager.getFoodsByDateRange(startDate, endDate);
  }, []);

  const getStorageStats = useCallback(() => {
    return storageManager.getStorageStats();
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // Data
    foods,
    preferences,
    dailyGoals,
    loading,
    error,

    // Food operations
    addFood,
    updateFood,
    deleteFood,
    clearFoodHistory,

    // Preferences operations
    updatePreferences,

    // Daily goals operations
    updateDailyGoals,

    // Data management
    exportData,
    importData,

    // Utility functions
    getFoodsByDate,
    getFoodsByDateRange,
    getStorageStats,
    clearError
  };
}