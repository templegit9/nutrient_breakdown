import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Alert,
  LinearProgress,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material';
import {
  Schedule as TimeIcon,
  Restaurant as MealIcon,
  TrendingUp as TrendIcon,
  Insights as InsightIcon,
  CheckCircle as GoodIcon,
  Warning as CautionIcon,
  Info as NeutralIcon
} from '@mui/icons-material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line
} from 'recharts';
import { GroupedFoodEntry } from '../types/food';
import { 
  calculateMealTimingInsights, 
  aggregateNutritionByMealType,
  aggregateNutritionByTimeOfDay,
  getHourlyNutritionDistribution,
  MEAL_TYPE_MAPPINGS 
} from '../services/dashboardAggregation';
import { formatNutritionValue } from '../utils/roundingUtils';

interface MealTimingAnalysisProps {
  entries: GroupedFoodEntry[];
}

export default function MealTimingAnalysis({ entries }: MealTimingAnalysisProps) {
  const theme = useTheme();
  const timingInsights = calculateMealTimingInsights(entries);
  const hourlyData = getHourlyNutritionDistribution(entries);

  if (entries.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            No meal timing data available
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
            Add some food entries to see meal timing analysis
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getPatternScoreIcon = (score: string) => {
    switch (score) {
      case 'good':
        return <GoodIcon sx={{ color: theme.palette.success.main }} />;
      case 'caution':
        return <CautionIcon sx={{ color: theme.palette.warning.main }} />;
      default:
        return <NeutralIcon sx={{ color: theme.palette.info.main }} />;
    }
  };

  const getPatternScoreColor = (score: string) => {
    switch (score) {
      case 'good':
        return 'success';
      case 'caution':
        return 'warning';
      default:
        return 'info';
    }
  };

  // Prepare data for charts
  const mealTypeChartData = timingInsights.calorieDistribution.map(meal => ({
    name: meal.label,
    calories: meal.totalCalories,
    percentage: meal.percentage,
    count: meal.count,
    color: meal.color
  }));

  const timeOfDayChartData = timingInsights.mealsByTime.map(timeSlot => ({
    name: timeSlot.label,
    calories: timeSlot.totalCalories,
    count: timeSlot.count,
    color: timeSlot.color
  }));

  // Filter hourly data to only show hours with activity
  const activeHourlyData = hourlyData.filter(hour => hour.count > 0);

  return (
    <Box>
      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MealIcon color="primary" />
                <Box>
                  <Typography variant="h4" color="primary">
                    {timingInsights.totalMeals}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Meals
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendIcon color="secondary" />
                <Box>
                  <Typography variant="h4" color="secondary">
                    {formatNutritionValue(timingInsights.totalCalories, 'calorie')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Calories
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TimeIcon sx={{ color: timingInsights.peakTimeSlot.color }} />
                <Box>
                  <Typography variant="h6" sx={{ color: timingInsights.peakTimeSlot.color }}>
                    {timingInsights.peakTimeSlot.label}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Peak Eating Time
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {getPatternScoreIcon(timingInsights.eatingPattern.score)}
                <Box>
                  <Typography variant="body1" fontWeight="bold">
                    {timingInsights.eatingPattern.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Eating Pattern
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Meal Type Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Calorie Distribution by Meal Type
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mealTypeChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="calories"
                    label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
                  >
                    {mealTypeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [
                      `${formatNutritionValue(value, 'calorie')} kcal`,
                      'Calories'
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Time of Day Distribution */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Eating Times Throughout Day
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={timeOfDayChartData}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => [
                      `${formatNutritionValue(value, 'calorie')} kcal`,
                      'Calories'
                    ]}
                  />
                  <Bar dataKey="calories" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Hourly Eating Pattern */}
        {activeHourlyData.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Hourly Eating Pattern
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={activeHourlyData}>
                    <XAxis 
                      dataKey="label" 
                      fontSize={12}
                    />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${formatNutritionValue(value, 'calorie')} kcal`,
                        'Calories'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalCalories" 
                      stroke={theme.palette.secondary.main}
                      strokeWidth={2}
                      dot={{ fill: theme.palette.secondary.main, strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Meal Breakdown */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Meal Breakdown
              </Typography>
              <Grid container spacing={2}>
                {timingInsights.mealsByType.map((meal) => (
                  <Grid item xs={12} key={meal.mealType}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 2,
                      p: 2,
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1
                    }}>
                      <Avatar sx={{ bgcolor: meal.color }}>
                        {meal.icon}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body1" fontWeight="bold">
                            {meal.label}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {formatNutritionValue(meal.totalCalories, 'calorie')} kcal
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min((meal.totalCalories / timingInsights.totalCalories) * 100, 100)}
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: meal.color
                            }
                          }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          {meal.count} {meal.count === 1 ? 'entry' : 'entries'} • {((meal.totalCalories / timingInsights.totalCalories) * 100).toFixed(1)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Insights and Recommendations */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <InsightIcon />
                Meal Timing Insights
              </Typography>
              
              {/* Eating Pattern Alert */}
              <Alert 
                severity={getPatternScoreColor(timingInsights.eatingPattern.score) as any}
                sx={{ mb: 2 }}
              >
                <Typography variant="body2">
                  <strong>Pattern:</strong> {timingInsights.eatingPattern.description}
                </Typography>
              </Alert>

              {/* Insights List */}
              {timingInsights.insights.length > 0 ? (
                <List dense>
                  {timingInsights.insights.map((insight, index) => (
                    <ListItem key={index}>
                      <ListItemIcon>
                        <InsightIcon fontSize="small" color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={insight}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Your meal timing looks good! Keep up the consistent eating pattern.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}