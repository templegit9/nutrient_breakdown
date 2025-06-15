import { useState, useEffect } from 'react';
import { getUserGroupedFoodEntries, deleteGroupedFoodEntry } from '../services/groupedFoodDatabaseUtils';
import type { GroupedFoodEntry } from '../types/food';
import { useAuth } from '../components/AuthProvider';

export function useGroupedFoodData(userId?: string) {
  const [groupedEntries, setGroupedEntries] = useState<GroupedFoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  // Use provided userId or current user
  const effectiveUserId = userId || user?.id;

  // Load grouped food entries from database
  const loadGroupedEntries = async () => {
    if (!effectiveUserId) {
      setGroupedEntries([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const { data, error: fetchError } = await getUserGroupedFoodEntries();
      
      if (fetchError) {
        console.error('Error fetching grouped entries:', fetchError);
        setError('Failed to load food entries');
        setGroupedEntries([]);
      } else {
        setGroupedEntries(data);
      }
    } catch (error) {
      console.error('Error in loadGroupedEntries:', error);
      setError('Failed to load food entries');
      setGroupedEntries([]);
    } finally {
      setLoading(false);
    }
  };

  // Delete a grouped food entry
  const deleteEntry = async (id: string) => {
    try {
      const { error: deleteError } = await deleteGroupedFoodEntry(id);
      
      if (deleteError) {
        console.error('Error deleting entry:', deleteError);
        throw new Error('Failed to delete entry');
      }
      
      // Remove from local state
      setGroupedEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (error) {
      console.error('Error in deleteEntry:', error);
      throw error;
    }
  };

  // Add entry to local state (called when new entry is added)
  const addEntryToState = (entry: GroupedFoodEntry) => {
    setGroupedEntries(prev => [entry, ...prev]);
  };

  // Load data when user changes
  useEffect(() => {
    loadGroupedEntries();
  }, [effectiveUserId]);

  return {
    groupedEntries,
    loading,
    error,
    deleteEntry,
    refreshEntries: loadGroupedEntries,
    addEntryToState
  };
}