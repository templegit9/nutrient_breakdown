import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  LinearProgress,
  Chip,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'
import InfoIcon from '@mui/icons-material/Info'
import FavoriteIcon from '@mui/icons-material/Favorite'
import BloodtypeIcon from '@mui/icons-material/Bloodtype'
import LocalHospitalIcon from '@mui/icons-material/LocalHospital'
import { FoodItem } from '../types'
import { calculateDetailedNutrition } from '../utils/nutritionCalculator'

interface DetailedNutritionInsightsProps {
  foods: FoodItem[];
}

export default function DetailedNutritionInsights({ foods }: DetailedNutritionInsightsProps) {
  const theme = useTheme();
  const analysis = calculateDetailedNutrition(foods);

  if (foods.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            Add some foods to see detailed nutrition insights
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 60) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getGlycemicColor = (value: number) => {
    if (value < 10) return theme.palette.success.main;
    if (value < 20) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  return (
    <Box sx={{ space: 2 }}>
      {/* Nutrition Quality Score */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Nutrition Quality Score</Typography>
            <Typography 
              variant="h4" 
              sx={{ color: getScoreColor(analysis.nutritionQuality.score), fontWeight: 'bold' }}
            >
              {Math.round(analysis.nutritionQuality.score)}/100
            </Typography>
          </Box>
          
          <LinearProgress
            variant="determinate"
            value={analysis.nutritionQuality.score}
            sx={{
              height: 8,
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                backgroundColor: getScoreColor(analysis.nutritionQuality.score)
              }
            }}
          />
          
          {analysis.nutritionQuality.factors.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="success.main" gutterBottom>
                <CheckCircleIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Positive Factors:
              </Typography>
              {analysis.nutritionQuality.factors.map((factor, index) => (
                <Chip
                  key={index}
                  label={factor}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>
          )}

          {analysis.nutritionQuality.warnings.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="warning.main" gutterBottom>
                <WarningIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                Areas of Concern:
              </Typography>
              {analysis.nutritionQuality.warnings.map((warning, index) => (
                <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                  {warning}
                </Alert>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Macronutrient Distribution */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>Macronutrient Distribution</Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h5" color="primary">
                  {Math.round(analysis.macronutrientRatios.proteinPercentage)}%
                </Typography>
                <Typography variant="body2">Protein</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(analysis.macronutrients.protein)}g
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h5" color="secondary">
                  {Math.round(analysis.macronutrientRatios.carbPercentage)}%
                </Typography>
                <Typography variant="body2">Carbs</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(analysis.macronutrients.carbs)}g
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={4}>
              <Box textAlign="center">
                <Typography variant="h5" color="warning.main">
                  {Math.round(analysis.macronutrientRatios.fatPercentage)}%
                </Typography>
                <Typography variant="body2">Fat</Typography>
                <Typography variant="caption" color="text.secondary">
                  {Math.round(analysis.macronutrients.fat)}g
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Health-Specific Analysis */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/* PCOS Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FavoriteIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">PCOS Impact Analysis</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Glycemic Load</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(analysis.pcosSpecific.glycemicLoad * 5, 100)}
                    sx={{
                      flexGrow: 1,
                      mr: 2,
                      height: 6,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getGlycemicColor(analysis.pcosSpecific.glycemicLoad)
                      }
                    }}
                  />
                  <Typography variant="body2" fontWeight="bold">
                    {Math.round(analysis.pcosSpecific.glycemicLoad)}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Anti-Inflammatory Score</Typography>
                <LinearProgress
                  variant="determinate"
                  value={analysis.pcosSpecific.antiInflammatoryScore}
                  color="success"
                  sx={{ height: 6 }}
                />
                <Typography variant="caption">
                  {Math.round(analysis.pcosSpecific.antiInflammatoryScore)}/100
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Hormone Support Score</Typography>
                <LinearProgress
                  variant="determinate"
                  value={analysis.pcosSpecific.hormoneSupportScore}
                  color="primary"
                  sx={{ height: 6 }}
                />
                <Typography variant="caption">
                  {Math.round(analysis.pcosSpecific.hormoneSupportScore)}/100
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Diabetes Analysis */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BloodtypeIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="h6">Blood Sugar Impact</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Glycemic Index</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5" color="primary">
                    {Math.round(analysis.diabetesSpecific.glycemicIndex)}
                  </Typography>
                  <Chip
                    label={
                      analysis.diabetesSpecific.glycemicIndex < 55 ? 'Low' :
                      analysis.diabetesSpecific.glycemicIndex < 70 ? 'Medium' : 'High'
                    }
                    color={
                      analysis.diabetesSpecific.glycemicIndex < 55 ? 'success' :
                      analysis.diabetesSpecific.glycemicIndex < 70 ? 'warning' : 'error'
                    }
                    size="small"
                  />
                </Box>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>Carbohydrate Impact</Typography>
                <Chip
                  label={analysis.diabetesSpecific.carbImpact.toUpperCase()}
                  color={
                    analysis.diabetesSpecific.carbImpact === 'low' ? 'success' :
                    analysis.diabetesSpecific.carbImpact === 'medium' ? 'warning' : 'error'
                  }
                  variant="outlined"
                />
              </Box>

              <Typography variant="body2" color="text.secondary">
                {analysis.diabetesSpecific.bloodSugarResponse}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Micronutrients */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Detailed Micronutrient Analysis</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* Fat-Soluble Vitamins */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Fat-Soluble Vitamins</Typography>
              <List dense>
                {analysis.micronutrients.fatSolubleVitamins.map((vitamin) => (
                  <ListItem key={vitamin.id}>
                    <ListItemText
                      primary={vitamin.name}
                      secondary={`${vitamin.amount.toFixed(1)} ${vitamin.unit}`}
                    />
                    {vitamin.dailyValue && (
                      <Chip
                        label={`${Math.round((vitamin.amount / vitamin.dailyValue) * 100)}% DV`}
                        size="small"
                        color={
                          (vitamin.amount / vitamin.dailyValue) >= 1 ? 'success' :
                          (vitamin.amount / vitamin.dailyValue) >= 0.5 ? 'warning' : 'default'
                        }
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Water-Soluble Vitamins */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Water-Soluble Vitamins</Typography>
              <List dense>
                {analysis.micronutrients.waterSolubleVitamins.map((vitamin) => (
                  <ListItem key={vitamin.id}>
                    <ListItemText
                      primary={vitamin.name}
                      secondary={`${vitamin.amount.toFixed(1)} ${vitamin.unit}`}
                    />
                    {vitamin.dailyValue && (
                      <Chip
                        label={`${Math.round((vitamin.amount / vitamin.dailyValue) * 100)}% DV`}
                        size="small"
                        color={
                          (vitamin.amount / vitamin.dailyValue) >= 1 ? 'success' :
                          (vitamin.amount / vitamin.dailyValue) >= 0.5 ? 'warning' : 'default'
                        }
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Major Minerals */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Major Minerals</Typography>
              <List dense>
                {analysis.micronutrients.majorMinerals.map((mineral) => (
                  <ListItem key={mineral.id}>
                    <ListItemText
                      primary={mineral.name}
                      secondary={`${mineral.amount.toFixed(1)} ${mineral.unit}`}
                    />
                    {mineral.dailyValue && (
                      <Chip
                        label={`${Math.round((mineral.amount / mineral.dailyValue) * 100)}% DV`}
                        size="small"
                        color={
                          (mineral.amount / mineral.dailyValue) >= 1 ? 'success' :
                          (mineral.amount / mineral.dailyValue) >= 0.5 ? 'warning' : 'default'
                        }
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Grid>

            {/* Trace Minerals */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Trace Minerals</Typography>
              <List dense>
                {analysis.micronutrients.traceMinerals.map((mineral) => (
                  <ListItem key={mineral.id}>
                    <ListItemText
                      primary={mineral.name}
                      secondary={`${mineral.amount.toFixed(2)} ${mineral.unit}`}
                    />
                    {mineral.dailyValue && (
                      <Chip
                        label={`${Math.round((mineral.amount / mineral.dailyValue) * 100)}% DV`}
                        size="small"
                        color={
                          (mineral.amount / mineral.dailyValue) >= 1 ? 'success' :
                          (mineral.amount / mineral.dailyValue) >= 0.5 ? 'warning' : 'default'
                        }
                      />
                    )}
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Recommendations */}
      {(analysis.nutritionQuality.recommendations.length > 0 || 
        analysis.pcosSpecific.recommendations.length > 0 || 
        analysis.diabetesSpecific.recommendations.length > 0) && (
        <Card sx={{ mt: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              <LocalHospitalIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Personalized Recommendations
            </Typography>
            
            {analysis.nutritionQuality.recommendations.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  General Nutrition:
                </Typography>
                <List dense>
                  {analysis.nutritionQuality.recommendations.map((rec, index) => (
                    <ListItem key={`general-${index}`}>
                      <ListItemIcon>
                        <InfoIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {analysis.pcosSpecific.recommendations.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="error" gutterBottom>
                  PCOS Management:
                </Typography>
                <List dense>
                  {analysis.pcosSpecific.recommendations.map((rec, index) => (
                    <ListItem key={`pcos-${index}`}>
                      <ListItemIcon>
                        <FavoriteIcon color="error" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {analysis.diabetesSpecific.recommendations.length > 0 && (
              <Box>
                <Typography variant="subtitle2" color="primary" gutterBottom>
                  Blood Sugar Management:
                </Typography>
                <List dense>
                  {analysis.diabetesSpecific.recommendations.map((rec, index) => (
                    <ListItem key={`diabetes-${index}`}>
                      <ListItemIcon>
                        <BloodtypeIcon color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={rec} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}