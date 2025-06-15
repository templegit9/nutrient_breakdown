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

interface HealthConditionDashboardProps {
  userId: string;
  enabledConditions?: string[];
}

const HealthConditionDashboard: React.FC<HealthConditionDashboardProps> = ({ 
  userId, 
  enabledConditions = ['type2_diabetes', 'pcos'] 
}) => {
  const { data: entries } = useGroupedFoodData(userId);
  const [selectedCondition, setSelectedCondition] = useState<string>(enabledConditions[0] || 'type2_diabetes');
  const [selectedCategory, setSelectedCategory] = useState<string>('Metabolic');

  const todayEntries = entries?.filter(entry => {
    const entryDate = new Date(entry.date);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  }) || [];

  const availableConditions = EXPANDED_HEALTH_CONDITIONS.filter(condition => 
    enabledConditions.includes(condition.id)
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Health Condition Analysis</h2>
      
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

      {/* No conditions enabled */}
      {availableConditions.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <div className="text-gray-500 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">No Health Conditions Selected</h3>
          <p className="text-gray-600">
            Configure your health conditions in the settings to see personalized recommendations.
          </p>
        </div>
      )}
    </div>
  );
};

export default HealthConditionDashboard;