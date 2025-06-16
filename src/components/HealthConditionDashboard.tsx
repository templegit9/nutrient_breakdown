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
  Alert
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
  Info as InfoIcon
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
import HealthConditionSettings from './HealthConditionSettings';
import DateRangeSelector from './DateRangeSelector';
import { roundToInteger, roundToOneDecimal } from '../utils/roundingUtils';

interface HealthConditionDashboardProps {
  userId: string;
}

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
  const [loading, setLoading] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  
  // Help dialog state
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [activeHelpContent, setActiveHelpContent] = useState<keyof typeof HELP_CONTENT | null>(null);
  
  const theme = useTheme();

  // Load user profile and health conditions
  useEffect(() => {
    loadUserProfile();
  }, []);

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
  const conditionScore = currentCondition ? calculateConditionScore(currentCondition, dateFilteredEntries, userProfile) : 0;
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
    </Box>
  );
};

export default HealthConditionDashboard;