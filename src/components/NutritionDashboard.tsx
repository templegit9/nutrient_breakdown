import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert
} from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableChartIcon from '@mui/icons-material/TableChart'
import ImageIcon from '@mui/icons-material/Image'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import InfoIcon from '@mui/icons-material/Info'
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
  RadialBarChart,
  RadialBar,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { FoodItem, NutritionAnalysis } from '../types'
import { GroupedFoodEntry } from '../types/food'
import { calculateTotalNutrition } from '../utils/nutritionCalculator'
import { 
  convertGroupedEntriesToFoodItems, 
  calculateNutritionFromGroupedEntries,
  filterEntriesByDateRangeType,
  DateRangeType,
  calculateMealTimingInsights 
} from '../services/dashboardAggregation'
import DateRangeSelector from './DateRangeSelector'
import DetailedNutritionInsights from './DetailedNutritionInsights'
import MealTimingAnalysis from './MealTimingAnalysis'
import { roundToInteger, calculatePercentage, formatNutritionValue, roundToOneDecimal, roundToPercentage } from '../utils/roundingUtils'
import { DatabaseService } from '../services/database'
import type { UserProfile } from '../types'
import { useState, useEffect } from 'react'
import FloatingAssistant from './FloatingAssistant'

interface NutritionDashboardProps {
  groupedEntries: GroupedFoodEntry[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

// Help content for each component
const HELP_CONTENT = {
  calorieProgress: {
    title: "Daily Calorie Progress",
    description: "Shows how many calories you've consumed today versus your daily target based on your personalized TDEE (Total Daily Energy Expenditure).",
    importance: "Tracking calories helps you maintain a healthy weight. Your target is calculated from your age, gender, height, weight, and activity level.",
    ranges: "🎯 Target Range: 90-110% of your TDEE • 🟢 Good: Within 100-200 calories of target • 🟡 Caution: 200-500 calories over/under • 🔴 Concern: >500 calories over/under target"
  },
  macroProgress: {
    title: "Macronutrient Progress vs Daily Targets", 
    description: "Displays your intake of protein, carbohydrates, fat, and fiber as percentages of your personalized daily targets.",
    importance: "Each macronutrient has a specific role: Protein builds muscle, carbs provide energy, fat supports hormone production, and fiber aids digestion.",
    ranges: "🎯 Optimal: 90-110% of target • 🟢 Good: 80-120% • 🟡 Adequate: 70-130% • 🔴 Concern: <70% or >150% • Protein: 0.8-2.2g/kg body weight • Fiber: 25-35g daily"
  },
  macroBreakdown: {
    title: "Macronutrient Breakdown",
    description: "Shows the proportion of calories coming from protein, carbs, and fat in your diet.",
    importance: "A balanced macro split helps optimize energy levels, satiety, and body composition.",
    ranges: "🎯 Balanced Diet: Protein 15-25%, Carbs 45-65%, Fat 20-35% • 🟢 Athletic: Protein 20-30%, Carbs 40-60%, Fat 20-30% • 🟡 Low-Carb: Protein 20-30%, Carbs 20-40%, Fat 35-50%"
  },
  keyNutrients: {
    title: "Key Nutrients",
    description: "Progress bars showing your intake of essential nutrients compared to recommended daily values.",
    importance: "These nutrients are critical for health. Consistent intake helps prevent deficiencies and supports optimal body function.",
    ranges: "🎯 Target: 100% DV • 🟢 Excellent: 80-200% DV • 🟡 Adequate: 50-80% DV • 🔴 Deficient: <50% DV • ⚠️ Excess: >300% DV (except water-soluble vitamins)"
  },
  vitaminMinerals: {
    title: "Vitamin & Mineral Progress",
    description: "Charts showing your vitamin and mineral intake as percentages of Daily Values (DV).",
    importance: "Vitamins and minerals support immune function, energy production, and disease prevention.",
    ranges: "🎯 Optimal: 100-200% DV • 🟢 Good: 80-150% DV • 🟡 Low: 50-80% DV • 🔴 Deficient: <50% DV • ⚠️ Very High: >300% DV (monitor fat-soluble vitamins A,D,E,K)"
  },
  mealTiming: {
    title: "Meal Timing Analysis",
    description: "Shows when you eat throughout the day and how calories are distributed across meals.",
    importance: "Meal timing can affect metabolism, sleep quality, and energy levels. Regular meal patterns often support better health outcomes.",
    ranges: "🎯 Balanced: 25% breakfast, 35% lunch, 30% dinner, 10% snacks • 🟢 Good: Even distribution without >40% in one meal • 🟡 Acceptable: Slight irregularity • 🔴 Concern: >50% calories in one meal or eating >2hrs before bed"
  },
  detailedInsights: {
    title: "Detailed Nutrition Insights",
    description: "Comprehensive breakdown of all nutrients, health condition analysis, and food recommendations.",
    importance: "Advanced metrics help identify specific nutritional gaps and provide personalized recommendations for your health goals.",
    ranges: "🎯 Comprehensive: Meeting 90%+ of micronutrient targets • 🟢 Good: 80-90% targets met • 🟡 Improving: 70-80% targets met • 🔴 Gaps: <70% targets met • Focus on consistent variety over perfect numbers"
  }
};

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      {...other}
    >
      {value === index && children}
    </div>
  );
}

export default function NutritionDashboard({ groupedEntries }: NutritionDashboardProps) {
  const [tabValue, setTabValue] = useState(0);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedDateRange, setSelectedDateRange] = useState<DateRangeType>('today');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>();
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>();
  
  // Help dialog state
  const [helpDialogOpen, setHelpDialogOpen] = useState(false);
  const [activeHelpContent, setActiveHelpContent] = useState<keyof typeof HELP_CONTENT | null>(null);
  
  // User profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Load user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await DatabaseService.getUserProfile();
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
        setUserProfile(null);
      } finally {
        setProfileLoading(false);
      }
    };

    loadUserProfile();
  }, []);

  // Get nutrition targets from user profile with fallbacks
  const getNutritionTargets = () => {
    if (userProfile) {
      return {
        calories: userProfile.targetCalories || 2000,
        protein: userProfile.targetProtein || 150,
        carbs: userProfile.targetCarbs || 250,
        fat: userProfile.targetFat || 65,
        fiber: userProfile.targetFiber || 25
      };
    }
    
    // Fallback defaults if no profile
    return {
      calories: 2000,
      protein: 150,
      carbs: 250,
      fat: 65,
      fiber: 25
    };
  };

  const nutritionTargets = getNutritionTargets();

  // Defensive programming for data safety
  const safeGroupedEntries = groupedEntries || [];
  
  // Filter entries by selected date range
  const { filteredEntries, dateRange } = filterEntriesByDateRangeType(
    safeGroupedEntries, 
    selectedDateRange,
    customStartDate,
    customEndDate
  );
  
  // Convert filtered entries to analysis format
  const foods = convertGroupedEntriesToFoodItems(filteredEntries);
  const analysis = filteredEntries.length > 0 
    ? calculateNutritionFromGroupedEntries(filteredEntries)
    : calculateTotalNutrition([]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  // Help dialog handlers
  const handleHelpClick = (contentKey: keyof typeof HELP_CONTENT) => {
    setActiveHelpContent(contentKey);
    setHelpDialogOpen(true);
  };

  const handleHelpClose = () => {
    setHelpDialogOpen(false);
    setActiveHelpContent(null);
  };

  // Reusable help button component
  const HelpButton = ({ contentKey, size = 'small' }: { contentKey: keyof typeof HELP_CONTENT; size?: 'small' | 'medium' }) => (
    <IconButton
      size={size}
      onClick={() => handleHelpClick(contentKey)}
      sx={{ 
        color: theme.palette.text.secondary,
        '&:hover': { color: theme.palette.primary.main }
      }}
      title={`Learn about ${HELP_CONTENT[contentKey].title}`}
    >
      <HelpOutlineIcon fontSize={size} />
    </IconButton>
  );

  const handleExportCSV = () => {
    const csvData = foods.map(food => ({
      Name: food.name,
      Quantity: food.quantity,
      Unit: food.unit,
      Calories: formatNutritionValue(food.calories, 'calorie'),
      Protein: formatNutritionValue(food.nutrients.find(n => n.id === 'protein')?.amount || 0, 'macro'),
      Carbs: formatNutritionValue(food.nutrients.find(n => n.id === 'carbs')?.amount || 0, 'macro'),
      Fat: formatNutritionValue(food.nutrients.find(n => n.id === 'fat')?.amount || 0, 'macro'),
      Category: food.category,
      Date: new Date(food.dateAdded).toLocaleDateString()
    }));

    const csvContent = [
      Object.keys(csvData[0] || {}).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    handleExportClose();
  };

  const handleExportJSON = () => {
    const exportData = {
      summary: {
        totalCalories: formatNutritionValue(analysis.totalCalories, 'calorie'),
        macronutrients: {
          protein: formatNutritionValue(analysis.macronutrients.protein, 'macro'),
          carbs: formatNutritionValue(analysis.macronutrients.carbs, 'macro'),
          fat: formatNutritionValue(analysis.macronutrients.fat, 'macro'),
          fiber: formatNutritionValue(analysis.macronutrients.fiber, 'macro')
        },
        exportDate: new Date().toISOString(),
        foodCount: foods.length
      },
      foods: foods.map(food => ({
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: formatNutritionValue(food.calories, 'calorie'),
        category: food.category,
        dateAdded: food.dateAdded,
        nutrients: food.nutrients.map(n => ({
          name: n.name,
          amount: formatNutritionValue(n.amount, n.category === 'vitamin' || n.category === 'mineral' ? 'micro' : 'macro'),
          unit: n.unit,
          category: n.category,
          dailyValuePercentage: n.dailyValue ? calculatePercentage(n.amount, n.dailyValue) : null
        }))
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    handleExportClose();
  };

  const macroData = [
    { name: 'Protein', value: analysis.macronutrients.protein, color: '#0088FE' },
    { name: 'Carbs', value: analysis.macronutrients.carbs, color: '#00C49F' },
    { name: 'Fat', value: analysis.macronutrients.fat, color: '#FFBB28' },
  ];

  const vitaminData = analysis.vitamins.slice(0, 6).map(vitamin => {
    const percentage = vitamin.dailyValue ? calculatePercentage(vitamin.amount, vitamin.dailyValue) : 0;
    // Remove 200% cap as recommended in verification document, but keep visual cap
    const visualPercentage = Math.min(percentage, 200);
    return {
      name: vitamin.name.replace('Vitamin ', '').replace(' (B1)', '').replace(' (B2)', '').replace(' (B3)', ''),
      amount: formatNutritionValue(vitamin.amount, 'micro'),
      target: vitamin.dailyValue || 100,
      percentage: visualPercentage,
      actualPercentage: percentage, // Keep raw percentage for monitoring
      color: percentage >= 100 ? theme.palette.success.main : 
             percentage >= 50 ? theme.palette.warning.main : 
             theme.palette.error.main,
      unit: vitamin.unit
    };
  });

  const mineralData = analysis.minerals.slice(0, 6).map(mineral => {
    const percentage = mineral.dailyValue ? calculatePercentage(mineral.amount, mineral.dailyValue) : 0;
    const visualPercentage = Math.min(percentage, 200);
    return {
      name: mineral.name,
      amount: formatNutritionValue(mineral.amount, 'micro'),
      target: mineral.dailyValue || 100,
      percentage: visualPercentage,
      actualPercentage: percentage, // Keep raw percentage for monitoring
      color: percentage >= 100 ? theme.palette.success.main : 
             percentage >= 50 ? theme.palette.warning.main : 
             theme.palette.error.main,
      unit: mineral.unit
    };
  });

  // Enhanced macro data for radial chart using user-specific targets
  const macroRadialData = [
    {
      name: 'Protein',
      value: formatNutritionValue(analysis.macronutrients.protein, 'macro'),
      target: nutritionTargets.protein,
      percentage: Math.min(calculatePercentage(analysis.macronutrients.protein, nutritionTargets.protein), 200),
      fill: theme.palette.primary.main
    },
    {
      name: 'Carbs',
      value: formatNutritionValue(analysis.macronutrients.carbs, 'macro'),
      target: nutritionTargets.carbs,
      percentage: Math.min(calculatePercentage(analysis.macronutrients.carbs, nutritionTargets.carbs), 200),
      fill: theme.palette.secondary.main
    },
    {
      name: 'Fat',
      value: formatNutritionValue(analysis.macronutrients.fat, 'macro'),
      target: nutritionTargets.fat,
      percentage: Math.min(calculatePercentage(analysis.macronutrients.fat, nutritionTargets.fat), 200),
      fill: theme.palette.warning.main
    },
    {
      name: 'Fiber',
      value: formatNutritionValue(analysis.macronutrients.fiber, 'macro'),
      target: nutritionTargets.fiber,
      percentage: Math.min(calculatePercentage(analysis.macronutrients.fiber, nutritionTargets.fiber), 200),
      fill: theme.palette.success.main
    }
  ];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 1, 
          border: 1, 
          borderColor: 'divider',
          borderRadius: 1,
          boxShadow: 2
        }}>
          <Typography variant="body2" fontWeight="bold">{label}</Typography>
          {payload.map((entry: any, index: number) => (
            <Typography key={index} variant="caption" sx={{ color: entry.color }}>
              {entry.name}: {roundToOneDecimal(entry.value)}{entry.payload.unit || 'g'}
              {entry.payload.target && (
                <span> / {entry.payload.target}{entry.payload.unit || 'g'} ({roundToInteger(entry.payload.percentage || 0)}%)</span>
              )}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  const handleDateRangeChange = (rangeType: DateRangeType, customStart?: Date, customEnd?: Date) => {
    setSelectedDateRange(rangeType);
    setCustomStartDate(customStart);
    setCustomEndDate(customEnd);
  };

  if (safeGroupedEntries.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            Add some foods to see your nutrition breakdown
          </Typography>
        </CardContent>
      </Card>
    );
  }
  
  if (filteredEntries.length === 0) {
    return (
      <Box>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          mb: 2 
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
            Nutrition Dashboard - {dateRange.label}
          </Typography>
          <IconButton
            onClick={handleExportClick}
            sx={{ 
              bgcolor: 'primary.main', 
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' }
            }}
          >
            <GetAppIcon />
          </IconButton>
        </Box>
        
        <DateRangeSelector 
          selectedRange={selectedDateRange}
          onRangeChange={handleDateRangeChange}
          entriesCount={filteredEntries.length}
        />
        
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No food entries found for {dateRange.label.toLowerCase()}
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
              Try selecting a different date range or add some food entries
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Nutrition Dashboard - {dateRange.label}
        </Typography>
        <IconButton
          onClick={handleExportClick}
          sx={{ 
            bgcolor: 'primary.main', 
            color: 'white',
            '&:hover': { bgcolor: 'primary.dark' }
          }}
        >
          <GetAppIcon />
        </IconButton>
      </Box>
      
      <DateRangeSelector 
        selectedRange={selectedDateRange}
        onRangeChange={handleDateRangeChange}
        entriesCount={filteredEntries.length}
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Overview" />
          <Tab label="Detailed Analysis" />
          <Tab label="Meal Timing" />
        </Tabs>
      </Box>

      {/* Export Menu */}
      <Menu
        anchorEl={exportMenuAnchor}
        open={Boolean(exportMenuAnchor)}
        onClose={handleExportClose}
      >
        <MenuItem onClick={handleExportCSV}>
          <ListItemIcon>
            <TableChartIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportJSON}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as JSON</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem disabled>
          <ListItemIcon>
            <PictureAsPdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF (Coming Soon)</ListItemText>
        </MenuItem>
      </Menu>

      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6">
                Daily Calories
              </Typography>
              <HelpButton contentKey="calorieProgress" />
            </Box>
            <Typography variant="h3" color="primary">
              {formatNutritionValue(analysis.totalCalories, 'calorie')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              of {nutritionTargets.calories} kcal target
            </Typography>
            <LinearProgress
              variant="determinate"
              value={Math.min(calculatePercentage(analysis.totalCalories, nutritionTargets.calories), 100)}
              sx={{ 
                height: 8, 
                borderRadius: 4,
                bgcolor: theme.palette.grey[200],
                '& .MuiLinearProgress-bar': {
                  bgcolor: analysis.totalCalories > nutritionTargets.calories 
                    ? theme.palette.warning.main 
                    : theme.palette.primary.main
                }
              }}
            />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              {calculatePercentage(analysis.totalCalories, nutritionTargets.calories).toFixed(1)}% of daily target
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Macronutrient Progress vs Daily Targets
              </Typography>
              <HelpButton contentKey="macroProgress" />
            </Box>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={macroRadialData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" />
                <YAxis label={{ value: '% of Target', angle: -90, position: 'insideLeft' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar 
                  dataKey="percentage" 
                  fill={theme.palette.primary.main}
                  name="% of Daily Target"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6">
                Key Nutrients
              </Typography>
              <HelpButton contentKey="keyNutrients" />
            </Box>
            <Grid container spacing={2}>
              {[
                { label: 'Protein', value: analysis.macronutrients.protein, unit: 'g', target: nutritionTargets.protein },
                { label: 'Carbs', value: analysis.macronutrients.carbs, unit: 'g', target: nutritionTargets.carbs },
                { label: 'Fat', value: analysis.macronutrients.fat, unit: 'g', target: nutritionTargets.fat },
                { label: 'Fiber', value: analysis.macronutrients.fiber, unit: 'g', target: nutritionTargets.fiber },
              ].map((nutrient) => (
                <Grid item xs={12} sm={6} md={3} key={nutrient.label}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{nutrient.label}</Typography>
                      <Typography variant="body2">
                        {formatNutritionValue(nutrient.value, 'macro')}{nutrient.unit} / {nutrient.target}{nutrient.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(calculatePercentage(nutrient.value, nutrient.target), 100)}
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {vitaminData.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Vitamin & Mineral Progress
                </Typography>
                <HelpButton contentKey="vitaminMinerals" />
              </Box>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={vitaminData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis 
                    label={{ value: '% Daily Value', angle: -90, position: 'insideLeft' }}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar 
                    dataKey="percentage" 
                    fill={theme.palette.info.main}
                    name="% Daily Value"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: 'success.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">≥100% DV</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: 'warning.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">50-99% DV</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Box sx={{ width: 16, height: 16, bgcolor: 'error.main', borderRadius: 0.5 }} />
                  <Typography variant="caption">&lt;50% DV</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {mineralData.length > 0 && (
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Essential Mineral Intake
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={mineralData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    angle={-30}
                    textAnchor="end"
                    height={60}
                    fontSize={12}
                  />
                  <YAxis 
                    label={{ value: '% Daily Value', angle: -90, position: 'insideLeft' }}
                    fontSize={12}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="percentage" 
                    stroke={theme.palette.secondary.main}
                    fill={theme.palette.secondary.light}
                    fillOpacity={0.6}
                    name="% Daily Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      )}

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              {dateRange.label} Foods
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {foods.map((food) => (
                <Chip
                  key={food.id}
                  label={`${food.name} (${food.quantity}${food.unit})`}
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Detailed Nutrition Insights
          </Typography>
          <HelpButton contentKey="detailedInsights" />
        </Box>
        <DetailedNutritionInsights foods={foods} />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Meal Timing Analysis
          </Typography>
          <HelpButton contentKey="mealTiming" />
        </Box>
        <MealTimingAnalysis entries={filteredEntries} />
      </TabPanel>
      
      {/* Help Dialog */}
      <Dialog 
        open={helpDialogOpen} 
        onClose={handleHelpClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <InfoIcon color="primary" />
          {activeHelpContent && HELP_CONTENT[activeHelpContent].title}
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
                <strong>Why it matters:</strong> {HELP_CONTENT[activeHelpContent].importance}
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
          <Button onClick={handleHelpClose} variant="contained">
            Got it!
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating AI Assistant */}
      <FloatingAssistant
        contextData={{
          dateRange: dateRange.label,
          totalCalories: analysis.calories,
          targetCalories: userProfile?.targetCalories || 2000,
          macroBreakdown: {
            protein: analysis.protein,
            carbohydrates: analysis.carbohydrates,
            fat: analysis.fat,
            fiber: analysis.fiber
          },
          targetMacros: {
            protein: userProfile?.targetProtein || 150,
            carbohydrates: userProfile?.targetCarbs || 250,
            fat: userProfile?.targetFat || 65,
            fiber: userProfile?.targetFiber || 25
          },
          keyNutrients: analysis,
          entriesCount: filteredEntries.length,
          userProfile
        }}
        contextType="dashboard"
      />
    </Box>
  );
}