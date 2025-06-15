import React, { useState, useEffect } from 'react';
import { 
  EXPANDED_HEALTH_CONDITIONS, 
  HEALTH_CONDITION_CATEGORIES,
  type HealthConditionData 
} from '../utils/healthConditionsExpanded';
import { DatabaseService } from '../services/database';
import { UserProfile } from '../types';

interface HealthConditionSettingsProps {
  userId: string;
  onClose?: () => void;
}

const HealthConditionSettings: React.FC<HealthConditionSettingsProps> = ({ userId, onClose }) => {
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Metabolic']);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      setUserProfile(profile);
      setSelectedConditions(profile?.healthConditions || []);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setSaving(true);
    try {
      const updatedProfile = {
        ...userProfile,
        healthConditions: selectedConditions
      };
      
      await DatabaseService.saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Error saving health conditions:', error);
      alert('Failed to save health conditions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getConditionsByCategory = (category: string): HealthConditionData[] => {
    return EXPANDED_HEALTH_CONDITIONS.filter(condition => condition.category === category);
  };

  const getSelectedConditionsCount = () => selectedConditions.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Health Condition Settings</h2>
              <p className="text-gray-600 mt-1">
                Select your health conditions to receive personalized nutrition recommendations.
              </p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          
          {/* Selected Count */}
          <div className="mt-4 flex items-center space-x-4">
            <div className="bg-blue-50 px-3 py-1 rounded-full">
              <span className="text-blue-700 text-sm font-medium">
                {getSelectedConditionsCount()} condition{getSelectedConditionsCount() !== 1 ? 's' : ''} selected
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {HEALTH_CONDITION_CATEGORIES.map(category => {
              const categoryConditions = getConditionsByCategory(category);
              if (categoryConditions.length === 0) return null;

              const isExpanded = expandedCategories.includes(category);
              const selectedInCategory = categoryConditions.filter(c => selectedConditions.includes(c.id)).length;

              return (
                <div key={category} className="border border-gray-200 rounded-lg">
                  {/* Category Header */}
                  <button
                    onClick={() => handleCategoryToggle(category)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        selectedInCategory > 0 ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {selectedInCategory || categoryConditions.length}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{category}</h3>
                        <p className="text-sm text-gray-500">
                          {selectedInCategory > 0 ? `${selectedInCategory} selected` : `${categoryConditions.length} available`}
                        </p>
                      </div>
                    </div>
                    <svg 
                      className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Category Conditions */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {categoryConditions.map(condition => {
                          const isSelected = selectedConditions.includes(condition.id);
                          
                          return (
                            <div
                              key={condition.id}
                              className={`border rounded-lg p-4 cursor-pointer transition-all ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50 shadow-sm' 
                                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                              }`}
                              onClick={() => handleConditionToggle(condition.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 mt-1">
                                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                                    isSelected 
                                      ? 'border-blue-500 bg-blue-500' 
                                      : 'border-gray-300'
                                  }`}>
                                    {isSelected && (
                                      <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                      </svg>
                                    )}
                                  </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className={`text-sm font-medium ${
                                    isSelected ? 'text-blue-900' : 'text-gray-900'
                                  }`}>
                                    {condition.name}
                                  </h4>
                                  <p className={`text-xs mt-1 ${
                                    isSelected ? 'text-blue-700' : 'text-gray-600'
                                  }`}>
                                    {condition.description}
                                  </p>
                                  
                                  {/* Key Nutrients Preview */}
                                  {condition.keyNutrients.length > 0 && (
                                    <div className="mt-2">
                                      <div className="flex flex-wrap gap-1">
                                        {condition.keyNutrients.slice(0, 3).map((nutrient, index) => (
                                          <span
                                            key={index}
                                            className={`inline-block px-2 py-1 text-xs rounded ${
                                              isSelected 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-gray-100 text-gray-600'
                                            }`}
                                          >
                                            {nutrient.nutrient.replace('_', ' ')}
                                          </span>
                                        ))}
                                        {condition.keyNutrients.length > 3 && (
                                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                                            isSelected 
                                              ? 'bg-blue-100 text-blue-800' 
                                              : 'bg-gray-100 text-gray-600'
                                          }`}>
                                            +{condition.keyNutrients.length - 3} more
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              <p>💡 Tip: You can select multiple conditions for comprehensive recommendations</p>
            </div>
            <div className="flex space-x-3">
              {onClose && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthConditionSettings;