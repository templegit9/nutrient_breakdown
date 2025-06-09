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
  Divider
} from '@mui/material'
import GetAppIcon from '@mui/icons-material/GetApp'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import TableChartIcon from '@mui/icons-material/TableChart'
import ImageIcon from '@mui/icons-material/Image'
import MoreVertIcon from '@mui/icons-material/MoreVert'
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
import { calculateTotalNutrition } from '../utils/nutritionCalculator'
import DetailedNutritionInsights from './DetailedNutritionInsights'
import { useState } from 'react'

interface NutritionDashboardProps {
  foods: FoodItem[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

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

export default function NutritionDashboard({ foods }: NutritionDashboardProps) {
  const [tabValue, setTabValue] = useState(0);
  const [exportMenuAnchor, setExportMenuAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const analysis = calculateTotalNutrition(foods);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
    setExportMenuAnchor(event.currentTarget);
  };

  const handleExportClose = () => {
    setExportMenuAnchor(null);
  };

  const handleExportCSV = () => {
    const csvData = foods.map(food => ({
      Name: food.name,
      Quantity: food.quantity,
      Unit: food.unit,
      Calories: Math.round(food.calories),
      Protein: Math.round(food.nutrients.find(n => n.id === 'protein')?.amount || 0),
      Carbs: Math.round(food.nutrients.find(n => n.id === 'carbs')?.amount || 0),
      Fat: Math.round(food.nutrients.find(n => n.id === 'fat')?.amount || 0),
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
        totalCalories: Math.round(analysis.totalCalories),
        macronutrients: {
          protein: Math.round(analysis.macronutrients.protein),
          carbs: Math.round(analysis.macronutrients.carbs),
          fat: Math.round(analysis.macronutrients.fat),
          fiber: Math.round(analysis.macronutrients.fiber)
        },
        exportDate: new Date().toISOString(),
        foodCount: foods.length
      },
      foods: foods.map(food => ({
        name: food.name,
        quantity: food.quantity,
        unit: food.unit,
        calories: Math.round(food.calories),
        category: food.category,
        dateAdded: food.dateAdded,
        nutrients: food.nutrients.map(n => ({
          name: n.name,
          amount: Number(n.amount.toFixed(2)),
          unit: n.unit,
          category: n.category,
          dailyValuePercentage: n.dailyValue ? Math.round((n.amount / n.dailyValue) * 100) : null
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
    const percentage = vitamin.dailyValue ? Math.min((vitamin.amount / vitamin.dailyValue) * 100, 200) : 0;
    return {
      name: vitamin.name.replace('Vitamin ', '').replace(' (B1)', '').replace(' (B2)', '').replace(' (B3)', ''),
      amount: vitamin.amount,
      target: vitamin.dailyValue || 100,
      percentage,
      color: percentage >= 100 ? theme.palette.success.main : 
             percentage >= 50 ? theme.palette.warning.main : 
             theme.palette.error.main,
      unit: vitamin.unit
    };
  });

  const mineralData = analysis.minerals.slice(0, 6).map(mineral => {
    const percentage = mineral.dailyValue ? Math.min((mineral.amount / mineral.dailyValue) * 100, 200) : 0;
    return {
      name: mineral.name,
      amount: mineral.amount,
      target: mineral.dailyValue || 100,
      percentage,
      color: percentage >= 100 ? theme.palette.success.main : 
             percentage >= 50 ? theme.palette.warning.main : 
             theme.palette.error.main,
      unit: mineral.unit
    };
  });

  // Enhanced macro data for radial chart
  const macroRadialData = [
    {
      name: 'Protein',
      value: analysis.macronutrients.protein,
      target: 50, // example daily target
      percentage: Math.min((analysis.macronutrients.protein / 50) * 100, 200),
      fill: theme.palette.primary.main
    },
    {
      name: 'Carbs',
      value: analysis.macronutrients.carbs,
      target: 225,
      percentage: Math.min((analysis.macronutrients.carbs / 225) * 100, 200),
      fill: theme.palette.secondary.main
    },
    {
      name: 'Fat',
      value: analysis.macronutrients.fat,
      target: 65,
      percentage: Math.min((analysis.macronutrients.fat / 65) * 100, 200),
      fill: theme.palette.warning.main
    },
    {
      name: 'Fiber',
      value: analysis.macronutrients.fiber,
      target: 25,
      percentage: Math.min((analysis.macronutrients.fiber / 25) * 100, 200),
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
              {entry.name}: {entry.value.toFixed(1)}{entry.payload.unit || 'g'}
              {entry.payload.target && (
                <span> / {entry.payload.target}{entry.payload.unit || 'g'} ({entry.payload.percentage?.toFixed(0)}%)</span>
              )}
            </Typography>
          ))}
        </Box>
      );
    }
    return null;
  };

  if (foods.length === 0) {
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

  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2 
      }}>
        <Typography variant="h5" sx={{ fontWeight: 600, color: 'primary.main' }}>
          Nutrition Dashboard
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          <Tab label="Overview" />
          <Tab label="Detailed Analysis" />
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
            <Typography variant="h6" gutterBottom>
              Daily Calories
            </Typography>
            <Typography variant="h3" color="primary">
              {Math.round(analysis.totalCalories)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              kcal
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Macronutrient Progress vs Daily Targets
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={macroRadialData}>
                <RadialBar
                  dataKey="percentage"
                  cornerRadius={10}
                  fill="#8884d8"
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  iconSize={10}
                  wrapperStyle={{ fontSize: '12px' }}
                  formatter={(value, entry: any) => 
                    `${value}: ${entry.payload.value.toFixed(1)}g / ${entry.payload.target}g`
                  }
                />
              </RadialBarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Key Nutrients
            </Typography>
            <Grid container spacing={2}>
              {[
                { label: 'Protein', value: analysis.macronutrients.protein, unit: 'g', target: 50 },
                { label: 'Carbs', value: analysis.macronutrients.carbs, unit: 'g', target: 300 },
                { label: 'Fat', value: analysis.macronutrients.fat, unit: 'g', target: 65 },
                { label: 'Fiber', value: analysis.macronutrients.fiber, unit: 'g', target: 25 },
              ].map((nutrient) => (
                <Grid item xs={12} sm={6} md={3} key={nutrient.label}>
                  <Box>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2">{nutrient.label}</Typography>
                      <Typography variant="body2">
                        {Math.round(nutrient.value)}{nutrient.unit} / {nutrient.target}{nutrient.unit}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min((nutrient.value / nutrient.target) * 100, 100)}
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
              <Typography variant="h6" gutterBottom>
                Vitamin & Mineral Progress
              </Typography>
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
              Today's Foods
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
        <DetailedNutritionInsights foods={foods} />
      </TabPanel>
    </Box>
  );
}