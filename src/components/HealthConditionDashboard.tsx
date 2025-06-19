import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Divider,
  Paper,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Collapse,
  Tooltip
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  LocalHospital as RecommendationIcon,
  TrendingUp as TrendIcon,
  Warning as WarningIcon,
  Favorite as HeartIcon,
  HelpOutline as HelpOutlineIcon,
  Info as InfoIcon,
  Medication as MedicationIcon,
  Add as AddIcon,
  ExpandLess as ExpandLessIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
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
import { filterEntriesByDateRangeType, DateRangeType } from '../services/dashboardAggregation';
import { DatabaseService } from '../services/database';
import { UserProfile } from '../types';
import FloatingAssistant from './FloatingAssistant';
import HealthConditionSettings from './HealthConditionSettings';
import SupplementEntry from './SupplementEntry';
import DateRangeSelector from './DateRangeSelector';
import { roundToInteger, roundToOneDecimal } from '../utils/roundingUtils';
import { SupplementEntry as SupplementEntryType, SupplementAnalysis } from '../types/supplements';
import { GroupedFoodEntry } from '../types';

interface HealthConditionDashboardProps {
  userId: string;
}

// Adherence Score Breakdown Component
interface ScoreBreakdownProps {
  condition: HealthConditionData;
  entries: GroupedFoodEntry[];
  userProfile?: UserProfile;
  supplementEntries?: SupplementEntryType[];
  supplementSchedules?: any[];
  totalScore: number;
}

const AdherenceScoreBreakdown: React.FC<ScoreBreakdownProps> = ({ 
  condition, 
  entries = [], 
  userProfile, 
  supplementEntries = [], 
  supplementSchedules = [],
  totalScore 
}) => {
  const [expanded, setExpanded] = useState(false);
  const theme = useTheme();

  // Add safety checks
  if (!condition || !condition.keyNutrients || !condition.foodRecommendations) {
    return null;
  }

  // Calculate breakdown components
  const calculateScoreBreakdown = () => {
    let nutrientScore = 0;
    let nutrientMaxScore = 0;
    let foodScore = 0;
    let foodMaxScore = 0;
    let supplementScore = 0;
    let supplementMaxScore = 0;
    const profileAdjustments: { description: string; multiplier: number }[] = [];
    
    // Nutrient scoring breakdown
    const nutrientBreakdown = (condition.keyNutrients || []).map(nutrient => {
      const dailyIntake = entries.reduce((sum, entry) => {
        return sum + (entry.totalNutrients[nutrient.nutrient as keyof typeof entry.totalNutrients] || 0);
      }, 0);

      nutrientMaxScore += 10;
      let points = 0;
      
      if (nutrient.nutrient === 'sodium' || nutrient.nutrient === 'saturated_fat') {
        points = dailyIntake <= nutrient.target ? 10 : Math.max(0, 10 - (dailyIntake - nutrient.target) / nutrient.target * 5);
      } else {
        const percentage = dailyIntake / nutrient.target;
        points = Math.min(10, percentage * 10);
      }
      
      nutrientScore += points;
      
      return {
        name: nutrient.nutrient.replace('_', ' ').toUpperCase(),
        current: roundToOneDecimal(dailyIntake),
        target: nutrient.target,
        unit: nutrient.unit,
        points: roundToOneDecimal(points),
        maxPoints: 10,
        isLimitNutrient: nutrient.nutrient === 'sodium' || nutrient.nutrient === 'saturated_fat'
      };
    });

    // Food recommendation scoring breakdown
    const foodBreakdown = (condition.foodRecommendations || []).map(rec => {
      foodMaxScore += 10;
      let recScore = 0;
      let matchedFoods: string[] = [];
      let totalFoodsInCategory = (rec.foods || []).length;

      (rec.foods || []).forEach(food => {
        const hasFood = entries.some(entry => 
          entry.combinedName.toLowerCase().includes(food.toLowerCase())
        );

        if (hasFood) {
          matchedFoods.push(food);
        }

        if (rec.type === 'encourage' && hasFood) {
          recScore += 2;
        } else if ((rec.type === 'limit' || rec.type === 'avoid') && !hasFood) {
          recScore += 2;
        }
      });

      const points = Math.min(10, recScore);
      foodScore += points;

      return {
        type: rec.type,
        category: rec.type === 'encourage' ? '✅ Encourage' : 
                 rec.type === 'limit' ? '⚠️ Limit' : '❌ Avoid',
        matchedFoods,
        totalFoods: totalFoodsInCategory,
        points: roundToOneDecimal(points),
        maxPoints: 10,
        reasoning: rec.reasoning
      };
    });

    // Supplement scoring breakdown (including scheduled supplements)
    supplementMaxScore = 20;
    
    // Count scheduled supplements for this condition
    const activeSchedules = supplementSchedules.filter(schedule => 
      schedule.is_active && 
      schedule.supplement?.health_conditions?.includes(condition.id)
    );
    
    // Count logged supplements
    const conditionSupplements = supplementEntries.filter(entry => 
      entry.supplement?.category // Using category as proxy for condition-specific
    );
    
    // Scheduled supplements get significant points
    if (activeSchedules.length > 0) {
      supplementScore += Math.min(15, activeSchedules.length * 5);
    }
    
    // Logged supplements get additional points
    if (conditionSupplements.length > 0) {
      supplementScore += Math.min(10, conditionSupplements.length * 3);
      
      const recentEntries = supplementEntries.filter(entry => {
        const entryDate = new Date(entry.time_taken);
        const daysDiff = (new Date().getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysDiff <= 7;
      });
      
      if (recentEntries.length > 0) {
        supplementScore += Math.min(5, recentEntries.length);
      }
    }

    // Profile adjustments
    let finalMultiplier = 1.0;
    if (userProfile) {
      const bmi = userProfile.height && userProfile.weight 
        ? userProfile.weight / Math.pow(userProfile.height / 100, 2) 
        : null;

      if (userProfile.age) {
        if (condition.id === 'type2_diabetes' && userProfile.age > 65) {
          finalMultiplier *= 0.95;
          profileAdjustments.push({ description: 'Age >65 with diabetes (stricter control)', multiplier: 0.95 });
        }
        if (condition.id === 'hypertension' && userProfile.age > 60) {
          finalMultiplier *= 0.95;
          profileAdjustments.push({ description: 'Age >60 with hypertension', multiplier: 0.95 });
        }
      }

      if (bmi) {
        if (condition.id === 'type2_diabetes' && bmi > 25) {
          finalMultiplier *= 0.9;
          profileAdjustments.push({ description: `BMI ${bmi.toFixed(1)} with diabetes`, multiplier: 0.9 });
        }
        if (condition.id === 'hypertension' && bmi > 25) {
          finalMultiplier *= 0.92;
          profileAdjustments.push({ description: `BMI ${bmi.toFixed(1)} with hypertension`, multiplier: 0.92 });
        }
        if (condition.id === 'pcos' && bmi > 25) {
          finalMultiplier *= 0.9;
          profileAdjustments.push({ description: `BMI ${bmi.toFixed(1)} with PCOS`, multiplier: 0.9 });
        }
      }
    }

    const baseScore = nutrientScore + foodScore + supplementScore;
    const maxTotalScore = nutrientMaxScore + foodMaxScore + supplementMaxScore;
    const basePercentage = (baseScore / maxTotalScore) * 100;
    const finalScore = basePercentage * finalMultiplier;

    return {
      nutrientBreakdown,
      foodBreakdown,
      activeSchedules,
      nutrientScore: roundToOneDecimal(nutrientScore),
      nutrientMaxScore,
      foodScore: roundToOneDecimal(foodScore),
      foodMaxScore,
      supplementScore: roundToOneDecimal(supplementScore),
      supplementMaxScore,
      baseScore: roundToOneDecimal(baseScore),
      maxTotalScore,
      basePercentage: roundToOneDecimal(basePercentage),
      profileAdjustments,
      finalMultiplier: roundToOneDecimal(finalMultiplier),
      finalScore: roundToOneDecimal(finalScore)
    };
  };

  const breakdown = calculateScoreBreakdown();

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 80) return theme.palette.success.main;
    if (percentage >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box>
      <Button
        onClick={() => setExpanded(!expanded)}
        startIcon={<AssessmentIcon />}
        endIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        {expanded ? 'Hide' : 'Show'} Score Breakdown
      </Button>
      
      <Collapse in={expanded}>
        <Box sx={{ mt: 2 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Your adherence score is calculated from three main components: nutrient targets, food recommendations, and supplement intake, with personal adjustments based on your profile.
            </Typography>
          </Alert>

          {/* Nutrient Scoring */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🎯 Nutrient Targets 
              <Chip 
                label={`${breakdown.nutrientScore}/${breakdown.nutrientMaxScore} points`} 
                color={breakdown.nutrientScore / breakdown.nutrientMaxScore >= 0.8 ? 'success' : 
                       breakdown.nutrientScore / breakdown.nutrientMaxScore >= 0.6 ? 'warning' : 'error'}
                size="small"
              />
            </Typography>
            <Grid container spacing={1}>
              {breakdown.nutrientBreakdown.map((nutrient, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Box sx={{ 
                    p: 1.5, 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    bgcolor: nutrient.points / nutrient.maxPoints >= 0.8 ? 'success.light' :
                             nutrient.points / nutrient.maxPoints >= 0.6 ? 'warning.light' : 'error.light'
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {nutrient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Current: {nutrient.current}{nutrient.unit} | 
                      Target: {nutrient.isLimitNutrient ? '≤' : '≥'}{nutrient.target}{nutrient.unit}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.5 }}>
                      <LinearProgress 
                        variant="determinate" 
                        value={(nutrient.points / nutrient.maxPoints) * 100}
                        sx={{ flexGrow: 1, mr: 1 }}
                        color={nutrient.points / nutrient.maxPoints >= 0.8 ? 'success' : 
                               nutrient.points / nutrient.maxPoints >= 0.6 ? 'warning' : 'error'}
                      />
                      <Typography variant="caption" fontWeight="bold">
                        {nutrient.points}/{nutrient.maxPoints}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Food Recommendations Scoring */}
          <Paper sx={{ p: 2, mb: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              🍎 Food Recommendations
              <Chip 
                label={`${breakdown.foodScore}/${breakdown.foodMaxScore} points`} 
                color={breakdown.foodScore / breakdown.foodMaxScore >= 0.8 ? 'success' : 
                       breakdown.foodScore / breakdown.foodMaxScore >= 0.6 ? 'warning' : 'error'}
                size="small"
              />
            </Typography>
            <Grid container spacing={1}>
              {breakdown.foodBreakdown.map((food, index) => (
                <Grid item xs={12} key={index}>
                  <Box sx={{ 
                    p: 1.5, 
                    border: 1, 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    bgcolor: food.points / food.maxPoints >= 0.8 ? 'success.light' :
                             food.points / food.maxPoints >= 0.6 ? 'warning.light' : 'error.light'
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {food.category}
                      </Typography>
                      <Typography variant="caption" fontWeight="bold">
                        {food.points}/{food.maxPoints} points
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {food.reasoning}
                    </Typography>
                    {food.matchedFoods.length > 0 && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        <Typography variant="caption" sx={{ mr: 1 }}>Found in your diet:</Typography>
                        {food.matchedFoods.slice(0, 3).map((matchedFood, idx) => (
                          <Chip key={idx} label={matchedFood} size="small" color="primary" />
                        ))}
                        {food.matchedFoods.length > 3 && (
                          <Chip label={`+${food.matchedFoods.length - 3} more`} size="small" />
                        )}
                      </Box>
                    )}
                    <LinearProgress 
                      variant="determinate" 
                      value={(food.points / food.maxPoints) * 100}
                      color={food.points / food.maxPoints >= 0.8 ? 'success' : 
                             food.points / food.maxPoints >= 0.6 ? 'warning' : 'error'}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Supplement Scoring */}
          {breakdown.supplementMaxScore > 0 && (
            <Paper sx={{ p: 2, mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                💊 Supplement Support
                <Chip 
                  label={`${breakdown.supplementScore}/${breakdown.supplementMaxScore} points`} 
                  color={breakdown.supplementScore / breakdown.supplementMaxScore >= 0.8 ? 'success' : 
                         breakdown.supplementScore / breakdown.supplementMaxScore >= 0.6 ? 'warning' : 'error'}
                  size="small"
                />
              </Typography>
              <Box sx={{ p: 1.5, border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'info.light' }}>
                <Typography variant="body2" color="text.secondary">
                  Points earned from supplements that support {condition.name}.
                </Typography>
                
                {breakdown.activeSchedules && breakdown.activeSchedules.length > 0 && (
                  <Typography variant="body2" color="primary.main" sx={{ mt: 1 }}>
                    📅 {breakdown.activeSchedules.length} scheduled supplement{breakdown.activeSchedules.length > 1 ? 's' : ''} 
                    ({breakdown.activeSchedules.map(s => s.supplement?.name).join(', ')})
                  </Typography>
                )}
                
                {supplementEntries && supplementEntries.length > 0 && (
                  <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
                    ✅ {supplementEntries.length} supplement{supplementEntries.length > 1 ? 's' : ''} logged this period
                  </Typography>
                )}
                
                {(!supplementEntries || supplementEntries.length === 0) && (!breakdown.activeSchedules || breakdown.activeSchedules.length === 0) && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    No supplements logged or scheduled for this condition.
                  </Typography>
                )}
                <LinearProgress 
                  variant="determinate" 
                  value={(breakdown.supplementScore / breakdown.supplementMaxScore) * 100}
                  sx={{ mt: 1 }}
                  color={breakdown.supplementScore / breakdown.supplementMaxScore >= 0.8 ? 'success' : 
                         breakdown.supplementScore / breakdown.supplementMaxScore >= 0.6 ? 'warning' : 'error'}
                />
              </Box>
            </Paper>
          )}

          {/* Score Calculation Summary */}
          <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
            <Typography variant="h6" gutterBottom color="primary.dark">
              📊 Final Score Calculation
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Base Score:</strong> {breakdown.baseScore}/{breakdown.maxTotalScore} points
                  ({breakdown.basePercentage}%)
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2">
                  <strong>Profile Adjustment:</strong> ×{breakdown.finalMultiplier}
                </Typography>
              </Grid>
            </Grid>
            
            {breakdown.profileAdjustments.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" color="text.secondary">Adjustments:</Typography>
                {breakdown.profileAdjustments.map((adj, index) => (
                  <Typography key={index} variant="caption" display="block" color="text.secondary">
                    • {adj.description}: ×{adj.multiplier}
                  </Typography>
                ))}
              </Box>
            )}
            
            <Divider sx={{ my: 1 }} />
            <Typography variant="h6" color="primary.dark">
              <strong>Final Score: {breakdown.finalScore}%</strong>
            </Typography>
          </Paper>
        </Box>
      </Collapse>
    </Box>
  );
};

// Help content for each component
const HELP_CONTENT = {
  adherenceScore: {
    title: "Adherence Score",
    description: "Shows how well your current nutrition aligns with recommendations for your selected health condition.",
    importance: "Higher scores indicate better management of your condition through nutrition. Scores are personalized based on your profile (age, BMI, gender, activity level).",
    ranges: "🎯 Excellent: 80-100% - Optimal condition management • 🟢 Good: 60-79% - Well-managed with room for improvement • 🟡 Fair: 40-59% - Moderate adherence, focus needed • 🔴 Poor: <40% - Significant dietary changes recommended • Scores adjust based on BMI, age, and gender"
  },
  keyNutrients: {
    title: "Key Nutrients",
    description: "Critical nutrients that significantly impact your selected health condition, with evidence-based target ranges.",
    importance: "Focusing on these specific nutrients can help manage symptoms and improve health outcomes for your condition.",
    ranges: "🎯 Target: Meet 90-110% of condition-specific targets • 🟢 Good: 80-120% of targets • 🟡 Adequate: 70-130% • 🔴 Concern: <70% or >150% • Example: Diabetes sodium <2300mg, PCOS omega-3 >1g daily"
  },
  recommendations: {
    title: "Personalized Recommendations",
    description: "Specific, actionable advice based on your current food intake and individual health profile.",
    importance: "These recommendations are tailored to your age, BMI, gender, and activity level for maximum effectiveness.",
    ranges: "🎯 High Priority: Address immediately for health • 🟢 Beneficial: Improve when convenient • 🟡 Maintenance: Continue current good habits • Fewer recommendations = better adherence • BMI >25 triggers weight management advice"
  },
  foodRecommendations: {
    title: "Food Recommendations",
    description: "Evidence-based food guidance categorized by encourage (beneficial), limit (moderate), and avoid (harmful) for your condition.",
    importance: "Following these food guidelines can help reduce inflammation, manage symptoms, and support overall health for your specific condition.",
    ranges: "🟢 Encourage: Eat regularly, aim for 5+ servings weekly • 🟡 Limit: 1-2 servings per week maximum • 🔴 Avoid: Eliminate or <1 serving monthly • Anti-inflammatory foods score higher • Processed foods typically limited/avoided"
  },
  healthStats: {
    title: "Health Statistics",
    description: "Key metrics about your nutrition choices and their impact on your health condition over the selected time period.",
    importance: "Track progress and identify patterns in your nutrition that correlate with better health outcomes.",
    ranges: "🎯 Beneficial Foods: Aim for >50% of entries • 🟡 Caution Foods: Keep <25% of entries • 📊 Total Entries: 3-6 per day optimal • 🔄 Consistency: Track daily for best results • Higher beneficial:caution ratio = better outcomes"
  }
};

const HealthConditionDashboard: React.FC<HealthConditionDashboardProps> = ({ userId }) => {
  const { data: entries } = useGroupedFoodData(userId);
  const [selectedCondition, setSelectedCondition] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Metabolic');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showSupplementEntry, setShowSupplementEntry] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  
  // Supplement tracking state
  const [supplementEntries, setSupplementEntries] = useState<SupplementEntry[]>([]);
  const [supplementAnalysis, setSupplementAnalysis] = useState<SupplementAnalysis | null>(null);
  const [supplementSchedules, setSupplementSchedules] = useState<any[]>([]);
  const [loadingSupplements, setLoadingSupplements] = useState(false);
  
  // Help dialog state
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [activeHelpContent, setActiveHelpContent] = useState<keyof typeof HELP_CONTENT | null>(null);
  
  const theme = useTheme();

  // Load user profile and health conditions
  useEffect(() => {
    loadUserProfile();
  }, []);

  // Load supplement data when date range changes
  useEffect(() => {
    if (userId) {
      loadSupplementData();
    }
  }, [userId, selectedDateRange, customStartDate, customEndDate]);

  const loadUserProfile = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      console.log('HealthConditionDashboard: Loaded user profile:', profile);
      setUserProfile(profile);
      
      // Set initial selected condition if user has any
      if (profile?.healthConditions && profile.healthConditions.length > 0) {
        console.log('HealthConditionDashboard: Setting health conditions:', profile.healthConditions);
        setSelectedCondition(profile.healthConditions[0]);
        
        // Set category for the first condition
        const firstCondition = EXPANDED_HEALTH_CONDITIONS.find(c => c.id === profile.healthConditions[0]);
        if (firstCondition) {
          setSelectedCategory(firstCondition.category);
        }
      } else {
        console.log('HealthConditionDashboard: No health conditions found');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSupplementData = async () => {
    setLoadingSupplements(true);
    try {
      // Calculate date range for supplement data
      const { dateRange: range } = filterEntriesByDateRangeType(
        [], // We don't need food entries here, just the date range
        selectedDateRange,
        customStartDate,
        customEndDate
      );

      const dateFrom = new Date(range.startDate);
      const dateTo = new Date(range.endDate);

      // Load supplement entries for the date range
      const entries = await DatabaseService.getSupplementEntries(userId, {
        date_from: dateFrom,
        date_to: dateTo
      });

      // Load supplement analysis
      const analysis = await DatabaseService.analyzeSupplementIntake(userId, dateFrom, dateTo);
      
      // Load supplement schedules
      const schedules = await DatabaseService.getUserSupplementSchedules(userId);

      setSupplementEntries(entries);
      setSupplementAnalysis(analysis);
      setSupplementSchedules(schedules);
    } catch (error) {
      console.error('Error loading supplement data:', error);
    } finally {
      setLoadingSupplements(false);
    }
  };

  // Help button component
  const HelpButton = ({ contentKey }: { contentKey: keyof typeof HELP_CONTENT }) => (
    <IconButton
      size="small"
      onClick={() => {
        setActiveHelpContent(contentKey);
        setHelpDialogOpen(true);
      }}
      sx={{ ml: 1 }}
    >
      <HelpOutlineIcon fontSize="small" />
    </IconButton>
  );

  const handleHelpClose = () => {
    setHelpDialogOpen(false);
    setActiveHelpContent(null);
  };

  const handleDateRangeChange = (rangeType: DateRangeType, customStart?: Date, customEnd?: Date) => {
    setSelectedDateRange(rangeType);
    setCustomStartDate(customStart);
    setCustomEndDate(customEnd);
  };

  // Filter entries by selected date range instead of just today
  const { filteredEntries: dateFilteredEntries, dateRange } = filterEntriesByDateRangeType(
    entries || [],
    selectedDateRange,
    customStartDate,
    customEndDate
  );

  const userEnabledConditions = userProfile?.healthConditions || [];
  const availableConditions = EXPANDED_HEALTH_CONDITIONS.filter(condition => 
    userEnabledConditions.includes(condition.id)
  );

  const conditionsByCategory = HEALTH_CONDITION_CATEGORIES.reduce((acc, category) => {
    acc[category] = availableConditions.filter(condition => condition.category === category);
    return acc;
  }, {} as Record<string, HealthConditionData[]>);

  const currentCondition = getHealthConditionById(selectedCondition);
  const conditionScore = currentCondition ? calculateConditionScore(currentCondition, dateFilteredEntries, userProfile, supplementEntries, supplementSchedules) : 0;
  const recommendations = currentCondition ? getConditionRecommendations(currentCondition, dateFilteredEntries, userProfile) : [];
  
  // Calculate statistics for selected date range entries
  const totalCalories = dateFilteredEntries.reduce((sum, entry) => sum + (entry.totalNutrients.calories || 0), 0);
  const beneficialFoodCount = dateFilteredEntries.filter(entry => {
    if (!currentCondition) return false;
    const encouragedFoods = currentCondition.foodRecommendations
      .filter(rec => rec.type === 'encourage')
      .flatMap(rec => rec.foods);
    return encouragedFoods.some(food => 
      entry.foodName.toLowerCase().includes(food.toLowerCase()) ||
      food.toLowerCase().includes(entry.foodName.toLowerCase())
    );
  }).length;
  const cautionFoodCount = dateFilteredEntries.filter(entry => {
    if (!currentCondition) return false;
    const limitFoods = currentCondition.foodRecommendations
      .filter(rec => rec.type === 'limit' || rec.type === 'avoid')
      .flatMap(rec => rec.foods);
    return limitFoods.some(food => 
      entry.foodName.toLowerCase().includes(food.toLowerCase()) ||
      food.toLowerCase().includes(entry.foodName.toLowerCase())
    );
  }).length;

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getScoreDescription = (score: number) => {
    if (score >= 80) return 'Excellent adherence to recommendations';
    if (score >= 60) return 'Good progress with room for improvement';
    if (score >= 40) return 'Moderate adherence - consider adjustments';
    return 'Needs significant dietary modifications';
  };


  // Loading state
  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading health analysis...</Typography>
      </Box>
    );
  }

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
        <Typography variant="h3" component="h2" fontWeight="bold">
          Health Condition Analysis
        </Typography>
        <Button
          variant="contained"
          onClick={() => setShowSettings(true)}
          startIcon={<SettingsIcon />}
        >
          Manage Conditions
        </Button>
      </Box>
      
      {/* Date Range Selector */}
      <DateRangeSelector 
        selectedRange={selectedDateRange}
        onRangeChange={handleDateRangeChange}
        entriesCount={dateFilteredEntries.length}
      />
      
      {/* Category Selection */}
      <Box mb={4}>
        <Typography variant="h5" fontWeight="semibold" gutterBottom color="text.secondary">
          Condition Categories
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {HEALTH_CONDITION_CATEGORIES.map(category => {
            const categoryConditions = conditionsByCategory[category];
            if (categoryConditions.length === 0) return null;
            
            return (
              <Chip
                key={category}
                label={`${category} (${categoryConditions.length})`}
                onClick={() => {
                  setSelectedCategory(category);
                  if (categoryConditions.length > 0) {
                    setSelectedCondition(categoryConditions[0].id);
                  }
                }}
                variant={selectedCategory === category ? "filled" : "outlined"}
                color={selectedCategory === category ? "primary" : "default"}
                sx={{ fontWeight: 'medium' }}
              />
            );
          })}
        </Box>
      </Box>

      {/* Condition Selection */}
      <Box mb={4}>
        <Typography variant="h5" fontWeight="semibold" gutterBottom color="text.secondary">
          {selectedCategory} Conditions
        </Typography>
        <Box display="flex" flexWrap="wrap" gap={1}>
          {conditionsByCategory[selectedCategory]?.map(condition => (
            <Chip
              key={condition.id}
              label={condition.name}
              onClick={() => setSelectedCondition(condition.id)}
              variant={selectedCondition === condition.id ? "filled" : "outlined"}
              color={selectedCondition === condition.id ? "secondary" : "default"}
              sx={{ fontWeight: 'medium' }}
            />
          ))}
        </Box>
      </Box>

      {currentCondition && (
        <Grid container spacing={3}>
          {/* Condition Overview */}
          <Grid item xs={12} lg={4}>
            <Card>
              <CardContent>
                <Typography variant="h5" fontWeight="semibold" gutterBottom>
                  {currentCondition.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {currentCondition.description}
                </Typography>
                
                {/* Health Score */}
                <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {dateRange.label} Adherence Score
                    </Typography>
                    <HelpButton contentKey="adherenceScore" />
                  </Box>
                  <Typography 
                    variant="h3" 
                    fontWeight="bold" 
                    sx={{ color: getScoreColor(conditionScore) }}
                    gutterBottom
                  >
                    {conditionScore.toFixed(1)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getScoreDescription(conditionScore)}
                  </Typography>
                  
                  {currentCondition && (
                    <AdherenceScoreBreakdown 
                      condition={currentCondition}
                      entries={dateFilteredEntries || []}
                      userProfile={userProfile || undefined}
                      supplementEntries={supplementEntries || []}
                      supplementSchedules={supplementSchedules || []}
                      totalScore={conditionScore}
                    />
                  )}
                </Paper>

                {/* Key Nutrients */}
                <Box mt={3}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="subtitle1" fontWeight="semibold">
                      Key Nutrients
                    </Typography>
                    <HelpButton contentKey="keyNutrients" />
                  </Box>
                  <Box>
                    {currentCondition.keyNutrients.slice(0, 3).map((nutrient, index) => (
                      <Paper key={index} sx={{ p: 1.5, mb: 1, bgcolor: 'primary.light' }}>
                        <Typography variant="caption" fontWeight="medium" color="primary.dark">
                          {nutrient.nutrient.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="caption" display="block" color="primary.main">
                          Target: {nutrient.target}{nutrient.unit}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recommendations */}
          <Grid item xs={12} lg={8}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight="semibold">
                    {dateRange.label} Recommendations
                  </Typography>
                  <HelpButton contentKey="recommendations" />
                </Box>
                
                {recommendations.length > 0 ? (
                  <List>
                    {recommendations.map((rec, index) => (
                      <ListItem key={index} alignItems="flex-start">
                        <ListItemIcon sx={{ minWidth: 24, mt: 1 }}>
                          <Box 
                            sx={{ 
                              width: 8, 
                              height: 8, 
                              bgcolor: 'primary.main', 
                              borderRadius: '50%' 
                            }} 
                          />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Box textAlign="center" py={4}>
                    <Typography variant="h6" gutterBottom>🎉 Great job!</Typography>
                    <Typography color="text.secondary">
                      You're meeting all recommendations for {currentCondition.name} for {dateRange.label.toLowerCase()}.
                    </Typography>
                  </Box>
                )}

                {/* Food Recommendations */}
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 3, mb: 2 }}>
                  <Typography variant="h6" fontWeight="semibold">
                    Food Recommendations
                  </Typography>
                  <HelpButton contentKey="foodRecommendations" />
                </Box>
                <Grid container spacing={2}>
                  {currentCondition.foodRecommendations.map((foodRec, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Paper 
                        sx={{
                          p: 2,
                          bgcolor: foodRec.type === 'encourage' ? 'success.light' :
                                 foodRec.type === 'limit' ? 'warning.light' : 'error.light',
                          border: 1,
                          borderColor: foodRec.type === 'encourage' ? 'success.main' :
                                      foodRec.type === 'limit' ? 'warning.main' : 'error.main'
                        }}
                      >
                        <Typography 
                          variant="subtitle1" 
                          fontWeight="semibold" 
                          sx={{
                            color: foodRec.type === 'encourage' ? 'success.dark' :
                                  foodRec.type === 'limit' ? 'warning.dark' : 'error.dark'
                          }}
                          gutterBottom
                        >
                          {foodRec.type === 'encourage' ? '✅ Encourage' :
                           foodRec.type === 'limit' ? '⚠️ Limit' : '❌ Avoid'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" paragraph>
                          {foodRec.reasoning}
                        </Typography>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {foodRec.foods.slice(0, 5).map((food, foodIndex) => (
                            <Chip
                              key={foodIndex}
                              label={food}
                              size="small"
                              sx={{
                                bgcolor: foodRec.type === 'encourage' ? 'success.main' :
                                        foodRec.type === 'limit' ? 'warning.main' : 'error.main',
                                color: 'white',
                                fontSize: '0.75rem'
                              }}
                            />
                          ))}
                          {foodRec.foods.length > 5 && (
                            <Chip
                              label={`+${foodRec.foods.length - 5} more`}
                              size="small"
                              sx={{ bgcolor: 'grey.200', fontSize: '0.75rem' }}
                            />
                          )}
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>

                {/* Clinical Notes */}
                {currentCondition.clinicalNotes && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="semibold" gutterBottom>
                      Clinical Notes
                    </Typography>
                    <Typography variant="body2">{currentCondition.clinicalNotes}</Typography>
                  </Alert>
                )}

                {/* Drug Interactions */}
                {currentCondition.drugInteractions && currentCondition.drugInteractions.length > 0 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" fontWeight="semibold" gutterBottom>
                      ⚠️ Drug Interactions
                    </Typography>
                    <List dense>
                      {currentCondition.drugInteractions.map((interaction, index) => (
                        <ListItem key={index} sx={{ py: 0 }}>
                          <ListItemText 
                            primary={`• ${interaction}`} 
                            primaryTypographyProps={{ variant: 'body2' }} 
                          />
                        </ListItem>
                      ))}
                    </List>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Supplement Tracking */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <MedicationIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h5" fontWeight="semibold">
                      {dateRange.label} Supplement & Medication Tracking
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowSupplementEntry(true)}
                    size="small"
                  >
                    Log Supplement
                  </Button>
                </Box>

                {loadingSupplements ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                    <CircularProgress />
                  </Box>
                ) : supplementAnalysis ? (
                  <Grid container spacing={3}>
                    {/* Supplement Overview */}
                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.light' }}>
                        <Typography variant="h4" fontWeight="bold" color="info.main">
                          {supplementAnalysis.totalSupplements}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Different Supplements
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                        <Typography variant="h4" fontWeight="bold" color="success.main">
                          {Math.round(supplementAnalysis.complianceRate)}%
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Compliance Rate
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} md={4}>
                      <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'secondary.light' }}>
                        <Typography variant="h4" fontWeight="bold" color="secondary.main">
                          {supplementEntries.length}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Entries
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Supplements by Type */}
                    {Object.keys(supplementAnalysis.supplementsByType).length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Supplements by Type
                        </Typography>
                        <Box>
                          {Object.entries(supplementAnalysis.supplementsByType).map(([type, count]) => (
                            <Box key={type} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {type.replace('_', ' ')}
                              </Typography>
                              <Chip label={count} size="small" color="primary" />
                            </Box>
                          ))}
                        </Box>
                      </Grid>
                    )}

                    {/* Condition-Specific Supplements */}
                    {currentCondition && supplementAnalysis.supplementsByCondition[selectedCondition] && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="h6" gutterBottom>
                          Supplements for {currentCondition.name}
                        </Typography>
                        <Box>
                          {supplementAnalysis.supplementsByCondition[selectedCondition].map((supplement, index) => (
                            <Chip
                              key={index}
                              label={supplement.name}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                              color="secondary"
                            />
                          ))}
                        </Box>
                      </Grid>
                    )}

                    {/* Recommendations and Warnings */}
                    {(supplementAnalysis.recommendations.length > 0 || supplementAnalysis.warnings.length > 0) && (
                      <Grid item xs={12}>
                        {supplementAnalysis.recommendations.length > 0 && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            <Typography variant="subtitle2" fontWeight="semibold" gutterBottom>
                              Supplement Recommendations
                            </Typography>
                            <List dense>
                              {supplementAnalysis.recommendations.map((rec, index) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                  <ListItemText 
                                    primary={`• ${rec}`} 
                                    primaryTypographyProps={{ variant: 'body2' }} 
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Alert>
                        )}

                        {supplementAnalysis.warnings.length > 0 && (
                          <Alert severity="warning">
                            <Typography variant="subtitle2" fontWeight="semibold" gutterBottom>
                              ⚠️ Important Warnings
                            </Typography>
                            <List dense>
                              {supplementAnalysis.warnings.map((warning, index) => (
                                <ListItem key={index} sx={{ py: 0 }}>
                                  <ListItemText 
                                    primary={`• ${warning}`} 
                                    primaryTypographyProps={{ variant: 'body2' }} 
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Alert>
                        )}
                      </Grid>
                    )}
                  </Grid>
                ) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <MedicationIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No supplement data for {dateRange.label.toLowerCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Start tracking your supplements and medications to see how they support your health conditions.
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => setShowSupplementEntry(true)}
                    >
                      Log Your First Supplement
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Health Statistics */}
          <Grid item xs={12} sx={{ mt: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" fontWeight="semibold">
                    {dateRange.label} Health Statistics
                  </Typography>
                  <HelpButton contentKey="healthStats" />
                </Box>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.light' }}>
                      <Typography variant="h4" fontWeight="bold" color="primary.main">
                        {roundToInteger(totalCalories)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Calories
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.light' }}>
                      <Typography variant="h4" fontWeight="bold" color="success.main">
                        {beneficialFoodCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Beneficial Foods
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.light' }}>
                      <Typography variant="h4" fontWeight="bold" color="warning.main">
                        {cautionFoodCount}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Caution Foods
                      </Typography>
                    </Paper>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.100' }}>
                      <Typography variant="h4" fontWeight="bold" color="text.primary">
                        {dateFilteredEntries.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Entries
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* No conditions selected */}
      {availableConditions.length === 0 && (
        <Card sx={{ textAlign: 'center', py: 6, bgcolor: 'grey.50' }}>
          <CardContent>
            <Box color="text.secondary" mb={2}>
              <SettingsIcon sx={{ fontSize: 64, mb: 2 }} />
            </Box>
            <Typography variant="h5" fontWeight="semibold" gutterBottom>
              No Health Conditions Selected
            </Typography>
            <Typography color="text.secondary" paragraph>
              Select your health conditions to receive personalized nutrition recommendations and track your dietary adherence.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => setShowSettings(true)}
              startIcon={<SettingsIcon />}
            >
              Select Health Conditions
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Settings Dialog */}
      <Dialog
        open={showSettings}
        onClose={() => setShowSettings(false)}
        maxWidth="lg"
        fullWidth
      >
        <HealthConditionSettings 
          userId={userId} 
          onClose={() => setShowSettings(false)}
          onSave={() => {
            setShowSettings(false);
            loadUserProfile();
          }}
        />
      </Dialog>

      {/* Help Dialog */}
      <Dialog
        open={helpDialogOpen}
        onClose={handleHelpClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          {activeHelpContent ? HELP_CONTENT[activeHelpContent]?.title : 'Help'}
        </DialogTitle>
        <DialogContent>
          {activeHelpContent && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  {HELP_CONTENT[activeHelpContent].description}
                </Typography>
              </Alert>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Why this matters:</strong> {HELP_CONTENT[activeHelpContent].importance}
              </Typography>
              {HELP_CONTENT[activeHelpContent].ranges && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    📊 Target Ranges & What's Normal:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                    {HELP_CONTENT[activeHelpContent].ranges.replace(/•/g, '\n•')}
                  </Typography>
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleHelpClose}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Supplement Entry Dialog */}
      <Dialog
        open={showSupplementEntry}
        onClose={() => setShowSupplementEntry(false)}
        maxWidth="md"
        fullWidth
      >
        <SupplementEntry 
          userId={userId}
          onClose={() => setShowSupplementEntry(false)}
          onSave={() => {
            setShowSupplementEntry(false);
            loadSupplementData(); // Refresh supplement data
          }}
        />
      </Dialog>

      {/* Floating AI Assistant */}
      <FloatingAssistant
        contextData={{
          selectedConditions: userProfile?.healthConditions || [],
          conditionScores: Object.fromEntries(
            (userProfile?.healthConditions || []).map(conditionId => {
              const condition = getHealthConditionById(conditionId);
              return [
                conditionId,
                condition ? {
                  name: condition.name,
                  score: calculateConditionScore(condition, dateFilteredEntries, userProfile, supplementEntries),
                  recommendations: getConditionRecommendations(condition, dateFilteredEntries, userProfile)
                } : null
              ];
            }).filter(([_, data]) => data !== null)
          ),
          dateRange: dateRange.label,
          entriesCount: dateFilteredEntries.length,
          supplementData: {
            entries: supplementEntries,
            analysis: supplementAnalysis,
            totalSupplements: supplementAnalysis?.totalSupplements || 0,
            complianceRate: supplementAnalysis?.complianceRate || 0
          },
          userProfile
        }}
        contextType="health_conditions"
      />
    </Box>
  );
};

export default HealthConditionDashboard;