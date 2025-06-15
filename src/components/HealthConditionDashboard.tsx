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
  Dialog
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  LocalHospital as RecommendationIcon,
  TrendingUp as TrendIcon,
  Warning as WarningIcon,
  Favorite as HeartIcon
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
import { DatabaseService } from '../services/database';
import { UserProfile } from '../types';
import HealthConditionSettings from './HealthConditionSettings';
import { roundToInteger, roundToOneDecimal } from '../utils/roundingUtils';

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
  
  // Calculate statistics for today's entries
  const totalCalories = todayEntries.reduce((sum, entry) => sum + (entry.totalNutrients.calories || 0), 0);
  const beneficialFoodCount = todayEntries.filter(entry => {
    if (!currentCondition) return false;
    const encouragedFoods = currentCondition.foodRecommendations
      .filter(rec => rec.type === 'encourage')
      .flatMap(rec => rec.foods);
    return encouragedFoods.some(food => 
      entry.foodName.toLowerCase().includes(food.toLowerCase()) ||
      food.toLowerCase().includes(entry.foodName.toLowerCase())
    );
  }).length;
  const cautionFoodCount = todayEntries.filter(entry => {
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
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Today's Adherence Score
                  </Typography>
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
                  <Typography variant="subtitle1" fontWeight="semibold" gutterBottom>
                    Key Nutrients
                  </Typography>
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
                <Typography variant="h5" fontWeight="semibold" gutterBottom>
                  Today's Recommendations
                </Typography>
                
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
                      You're meeting all recommendations for {currentCondition.name} today.
                    </Typography>
                  </Box>
                )}

                {/* Food Recommendations */}
                <Grid container spacing={2} sx={{ mt: 2 }}>
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
    </Box>
  );
};

export default HealthConditionDashboard;