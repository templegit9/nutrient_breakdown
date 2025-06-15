import React, { useState, useEffect } from 'react';
import { useGroupedFoodData } from '../hooks/useGroupedFoodData';
import {
  EXPANDED_HEALTH_CONDITIONS,
  HEALTH_CONDITION_CATEGORIES,
  calculateConditionScore,
  getConditionRecommendations,
  getHealthConditionById,
  getHealthConditionsByCategory,
  type HealthConditionData
} from '../utils/healthConditionsExpanded';
import { DatabaseService } from '../services/database';
import { UserProfile } from '../types';
import HealthConditionSettings from './HealthConditionSettings';

interface HealthConditionDashboardProps {
  userId: string;
}

const HealthConditionDashboard: React.FC<HealthConditionDashboardProps> = ({ userId }) => {
  const { data: entries } = useGroupedFoodData(userId);
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Metabolic');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user profile and health conditions
  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      setUserProfile(profile);
      
      // Set initial selected condition if user has any
      if (profile?.healthConditions && profile.healthConditions.length > 0) {
        setSelectedCondition(profile.healthConditions[0]);
        
        // Set category for the first condition
        const firstCondition = EXPANDED_HEALTH_CONDITIONS.find(c => c.id === profile.healthConditions[0]);
        if (firstCondition) {
          setSelectedCategory(firstCondition.category);
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const todayEntries = entries?.filter(entry => {
    const entryDate = new Date(entry.dateAdded);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  }) || [];

  const userEnabledConditions = userProfile?.healthConditions || [];
  const availableConditions = EXPANDED_HEALTH_CONDITIONS.filter(condition => 
    userEnabledConditions.includes(condition.id)
  );

  const conditionsByCategory = HEALTH_CONDITION_CATEGORIES.reduce((acc, category) => {
    acc[category] = availableConditions.filter(condition => condition.category === category);
    return acc;
  }, {} as Record<string, HealthConditionData[]>);

  const currentCondition = getHealthConditionById(selectedCondition);
  const conditionScore = currentCondition ? calculateConditionScore(currentCondition, todayEntries) : 0;
  const recommendations = currentCondition ? getConditionRecommendations(currentCondition, todayEntries) : [];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent adherence to recommendations';
    if (score >= 60) return 'Good progress with room for improvement';
    if (score >= 40) return 'Moderate adherence - consider adjustments';
    return 'Needs significant dietary modifications';
  };

  // Handle settings modal
  if (showSettings) {
    return (
      <HealthConditionSettings
        userId={userId}
        onClose={() => {
          setShowSettings(false);
          loadUserProfile(); // Reload profile after settings change
        }}
      />
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Health Condition Analysis</h2>
        <button
          onClick={() => setShowSettings(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>Manage Conditions</span>
        </button>
      </div>
      
      {/* Category Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">Condition Categories</h3>
        <div className="flex flex-wrap gap-2">
          {HEALTH_CONDITION_CATEGORIES.map(category => {
            const categoryConditions = conditionsByCategory[category];
            if (categoryConditions.length === 0) return null;
            
            return (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  if (categoryConditions.length > 0) {
                    setSelectedCondition(categoryConditions[0].id);
                  }
                }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
                <span className="ml-1 text-xs opacity-75">({categoryConditions.length})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Condition Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-3 text-gray-700">
          {selectedCategory} Conditions
        </h3>
        <div className="flex flex-wrap gap-2">
          {conditionsByCategory[selectedCategory]?.map(condition => (
            <button
              key={condition.id}
              onClick={() => setSelectedCondition(condition.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCondition === condition.id
                  ? 'bg-indigo-500 text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {condition.name}
            </button>
          ))}
        </div>
      </div>

      {currentCondition && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Condition Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-3 text-gray-800">
                {currentCondition.name}
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                {currentCondition.description}
              </p>
              
              {/* Health Score */}
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Today's Adherence Score</div>
                <div className={`text-4xl font-bold ${getScoreColor(conditionScore)} mb-2`}>
                  {conditionScore.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-500">
                  {getScoreDescription(conditionScore)}
                </div>
              </div>

              {/* Key Nutrients */}
              <div className="mt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Key Nutrients</h4>
                <div className="space-y-2">
                  {currentCondition.keyNutrients.slice(0, 3).map((nutrient, index) => (
                    <div key={index} className="text-xs bg-blue-50 p-2 rounded">
                      <div className="font-medium text-blue-800">
                        {nutrient.nutrient.replace('_', ' ').toUpperCase()}
                      </div>
                      <div className="text-blue-600">
                        Target: {nutrient.target}{nutrient.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 text-gray-800">
                Today's Recommendations
              </h3>
              
              {recommendations.length > 0 ? (
                <ul className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start">
                      <span className="inline-block w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span className="text-gray-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-lg mb-2">🎉 Great job!</div>
                  <div>You're meeting all recommendations for {currentCondition.name} today.</div>
                </div>
              )}

              {/* Food Recommendations */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentCondition.foodRecommendations.map((foodRec, index) => (
                  <div key={index} className={`p-4 rounded-lg ${
                    foodRec.type === 'encourage' ? 'bg-green-50 border border-green-200' :
                    foodRec.type === 'limit' ? 'bg-yellow-50 border border-yellow-200' :
                    'bg-red-50 border border-red-200'
                  }`}>
                    <h4 className={`font-semibold mb-2 ${
                      foodRec.type === 'encourage' ? 'text-green-800' :
                      foodRec.type === 'limit' ? 'text-yellow-800' :
                      'text-red-800'
                    }`}>
                      {foodRec.type === 'encourage' ? '✅ Encourage' :
                       foodRec.type === 'limit' ? '⚠️ Limit' : '❌ Avoid'}
                    </h4>
                    <div className="text-sm text-gray-600 mb-2">
                      {foodRec.reasoning}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {foodRec.foods.slice(0, 5).map((food, foodIndex) => (
                        <span key={foodIndex} className={`px-2 py-1 text-xs rounded ${
                          foodRec.type === 'encourage' ? 'bg-green-100 text-green-700' :
                          foodRec.type === 'limit' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {food}
                        </span>
                      ))}
                      {foodRec.foods.length > 5 && (
                        <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-600">
                          +{foodRec.foods.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Clinical Notes */}
              {currentCondition.clinicalNotes && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Clinical Notes</h4>
                  <p className="text-sm text-blue-700">{currentCondition.clinicalNotes}</p>
                </div>
              )}

              {/* Drug Interactions */}
              {currentCondition.drugInteractions && currentCondition.drugInteractions.length > 0 && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="font-semibold text-orange-800 mb-2">⚠️ Drug Interactions</h4>
                  <ul className="text-sm text-orange-700">
                    {currentCondition.drugInteractions.map((interaction, index) => (
                      <li key={index}>• {interaction}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* No conditions selected */}
      {availableConditions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Health Conditions Selected</h3>
          <p className="text-gray-600 mb-4">
            Select your health conditions to receive personalized nutrition recommendations and track your dietary adherence.
          </p>
          <button
            onClick={() => setShowSettings(true)}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
          >
            Select Health Conditions
          </button>
        </div>
      )}
    </div>
  );
};

export default HealthConditionDashboard;