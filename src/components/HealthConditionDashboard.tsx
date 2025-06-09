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
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  Divider,
  Paper
} from '@mui/material'
import {
  Favorite as PCOSIcon,
  Bloodtype as DiabetesIcon,
  ExpandMore as ExpandMoreIcon,
  Schedule as TimingIcon,
  Warning as WarningIcon,
  CheckCircle as SuccessIcon,
  LocalHospital as RecommendationIcon,
  TrendingUp as TrendIcon,
  Restaurant as PortionIcon
} from '@mui/icons-material'
import { useState } from 'react'
import { FoodItem } from '../types'
import { healthAnalyzer } from '../utils/healthConditions'
import HealthConditionRecommendations from './HealthConditionRecommendations'

interface HealthConditionDashboardProps {
  foods: FoodItem[];
}

export default function HealthConditionDashboard({ foods }: HealthConditionDashboardProps) {
  const [pcosMode, setPcosMode] = useState(true);
  const [diabetesMode, setDiabetesMode] = useState(true);
  const theme = useTheme();

  const pcosAnalysis = healthAnalyzer.analyzePCOS(foods);
  const diabetesAnalysis = healthAnalyzer.analyzeDiabetes(foods);
  const generalHealth = healthAnalyzer.analyzeGeneralHealth(foods);

  if (foods.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            Add foods to see health condition insights
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

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'low':
      case 'minimal':
        return theme.palette.success.main;
      case 'moderate':
        return theme.palette.warning.main;
      case 'high':
      case 'significant':
        return theme.palette.error.main;
      default:
        return theme.palette.info.main;
    }
  };

  return (
    <Box sx={{ space: 2 }}>
      {/* Health Mode Toggles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Health Condition Tracking
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={pcosMode}
                  onChange={(e) => setPcosMode(e.target.checked)}
                  color="error"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PCOSIcon color="error" />
                  <Typography>PCOS Management</Typography>
                </Box>
              }
            />
            <FormControlLabel
              control={
                <Switch
                  checked={diabetesMode}
                  onChange={(e) => setDiabetesMode(e.target.checked)}
                  color="primary"
                />
              }
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DiabetesIcon color="primary" />
                  <Typography>Diabetes Management</Typography>
                </Box>
              }
            />
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* PCOS Analysis */}
        {pcosMode && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PCOSIcon color="error" />
                  <Typography variant="h6">PCOS Management Score</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Overall Score</Typography>
                    <Typography variant="h5" sx={{ color: getScoreColor(pcosAnalysis.score), fontWeight: 'bold' }}>
                      {Math.round(pcosAnalysis.score)}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={pcosAnalysis.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(pcosAnalysis.score)
                      }
                    }}
                  />
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" color={getImpactColor(pcosAnalysis.insulinImpact)}>
                        {Math.round(pcosAnalysis.glycemicLoad)}
                      </Typography>
                      <Typography variant="caption">Glycemic Load</Typography>
                      <Chip
                        label={`${pcosAnalysis.insulinImpact} insulin impact`}
                        size="small"
                        color={pcosAnalysis.insulinImpact === 'low' ? 'success' : 
                               pcosAnalysis.insulinImpact === 'moderate' ? 'warning' : 'error'}
                        sx={{ mt: 1, display: 'block' }}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={6}>
                    <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" color="success.main">
                        {Math.round(pcosAnalysis.antiInflammatoryScore)}
                      </Typography>
                      <Typography variant="caption">Anti-Inflammatory</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Score
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Warnings */}
                {pcosAnalysis.warnings.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {pcosAnalysis.warnings.map((warning, index) => (
                      <Alert key={index} severity="warning" sx={{ mb: 1 }}>
                        {warning}
                      </Alert>
                    ))}
                  </Box>
                )}

                {/* Expandable Sections */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RecommendationIcon color="primary" />
                      <Typography>PCOS Recommendations</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {pcosAnalysis.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <SuccessIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TimingIcon color="secondary" />
                      <Typography>Meal Timing Tips</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {pcosAnalysis.mealTiming.map((tip, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <TimingIcon color="secondary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={tip} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Diabetes Analysis */}
        {diabetesMode && (
          <Grid item xs={12} lg={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <DiabetesIcon color="primary" />
                  <Typography variant="h6">Blood Sugar Management</Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2">Diabetes Score</Typography>
                    <Typography variant="h5" sx={{ color: getScoreColor(diabetesAnalysis.score), fontWeight: 'bold' }}>
                      {Math.round(diabetesAnalysis.score)}/100
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={diabetesAnalysis.score}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getScoreColor(diabetesAnalysis.score)
                      }
                    }}
                  />
                </Box>

                {/* Key Metrics */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" color={getImpactColor(
                        diabetesAnalysis.glycemicIndex < 55 ? 'low' :
                        diabetesAnalysis.glycemicIndex < 70 ? 'moderate' : 'high'
                      )}>
                        {Math.round(diabetesAnalysis.glycemicIndex)}
                      </Typography>
                      <Typography variant="caption">Glycemic Index</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Typography variant="h6" color="primary">
                        {Math.round(diabetesAnalysis.carbLoad)}g
                      </Typography>
                      <Typography variant="caption">Total Carbs</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={4}>
                    <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'grey.50' }}>
                      <Chip
                        label={diabetesAnalysis.bloodSugarImpact}
                        size="small"
                        color={
                          diabetesAnalysis.bloodSugarImpact === 'minimal' ? 'success' :
                          diabetesAnalysis.bloodSugarImpact === 'moderate' ? 'warning' : 'error'
                        }
                      />
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                        Blood Sugar Impact
                      </Typography>
                    </Paper>
                  </Grid>
                </Grid>

                {/* Warnings */}
                {diabetesAnalysis.warnings.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    {diabetesAnalysis.warnings.map((warning, index) => (
                      <Alert key={index} severity="error" sx={{ mb: 1 }}>
                        {warning}
                      </Alert>
                    ))}
                  </Box>
                )}

                {/* Expandable Sections */}
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <RecommendationIcon color="primary" />
                      <Typography>Diabetes Recommendations</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {diabetesAnalysis.recommendations.map((rec, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <SuccessIcon color="success" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={rec} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>

                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PortionIcon color="secondary" />
                      <Typography>Portion Control Tips</Typography>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <List dense>
                      {diabetesAnalysis.portionAdvice.map((advice, index) => (
                        <ListItem key={index}>
                          <ListItemIcon>
                            <PortionIcon color="secondary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={advice} />
                        </ListItem>
                      ))}
                    </List>
                  </AccordionDetails>
                </Accordion>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* General Health Insights */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <TrendIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Overall Health Insights
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h5" sx={{ color: getImpactColor(generalHealth.inflammationLevel) }}>
                      {generalHealth.inflammationLevel.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Inflammation Level
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h5" sx={{ color: getImpactColor(generalHealth.oxidativeStress) }}>
                      {generalHealth.oxidativeStress.toUpperCase()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Oxidative Stress
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box textAlign="center">
                    <Typography variant="h5" sx={{ color: getScoreColor(generalHealth.metabolicHealth) }}>
                      {Math.round(generalHealth.metabolicHealth)}/100
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Metabolic Health
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {generalHealth.recommendations.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    General Health Recommendations:
                  </Typography>
                  <List dense>
                    {generalHealth.recommendations.map((rec, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <RecommendationIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={rec} />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Food Recommendations */}
        <Grid item xs={12}>
          <HealthConditionRecommendations 
            condition={
              pcosMode && diabetesMode ? 'both' :
              pcosMode ? 'pcos' : 
              diabetesMode ? 'diabetes' : 'both'
            } 
          />
        </Grid>
      </Grid>
    </Box>
  );
}