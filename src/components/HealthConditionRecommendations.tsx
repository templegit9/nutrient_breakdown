import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useTheme
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as BeneficialIcon,
  Cancel as AvoidIcon,
  AccessTime as TimingIcon,
  FitnessCenter as ExerciseIcon,
  Restaurant as MealIcon,
  LocalHospital as SupplementIcon
} from '@mui/icons-material'

interface HealthConditionRecommendationsProps {
  condition: 'pcos' | 'diabetes' | 'both';
}

export default function HealthConditionRecommendations({ condition }: HealthConditionRecommendationsProps) {
  const theme = useTheme();

  const pcosRecommendations = {
    beneficial: [
      { food: 'Leafy Greens', reason: 'High in folate and magnesium for hormone balance', gi: 'Low (15)' },
      { food: 'Fatty Fish', reason: 'Omega-3 fats reduce inflammation', gi: 'None (0)' },
      { food: 'Berries', reason: 'Antioxidants and fiber with moderate sugar', gi: 'Low (40)' },
      { food: 'Nuts & Seeds', reason: 'Healthy fats and protein for satiety', gi: 'Low (15)' },
      { food: 'Quinoa', reason: 'Complete protein and fiber', gi: 'Medium (53)' },
      { food: 'Avocado', reason: 'Monounsaturated fats support hormones', gi: 'Low (10)' },
      { food: 'Lentils', reason: 'Plant protein and fiber for blood sugar', gi: 'Low (32)' },
      { food: 'Greek Yogurt', reason: 'Probiotics and protein', gi: 'Low (35)' }
    ],
    avoid: [
      { food: 'White Bread', reason: 'Spikes blood sugar and insulin', gi: 'High (75)' },
      { food: 'Sugary Drinks', reason: 'Pure sugar causes insulin resistance', gi: 'High (85)' },
      { food: 'Processed Snacks', reason: 'Trans fats increase inflammation', gi: 'High (70)' },
      { food: 'White Rice', reason: 'High glycemic index affects hormones', gi: 'High (73)' },
      { food: 'Pastries', reason: 'Refined carbs and added sugars', gi: 'High (80)' },
      { food: 'Fried Foods', reason: 'Inflammatory oils worsen PCOS', gi: 'Variable' }
    ],
    supplements: [
      'Inositol (2-4g daily) - Improves insulin sensitivity',
      'Vitamin D (1000-2000 IU) - Supports hormone balance',
      'Omega-3 (1-2g daily) - Reduces inflammation',
      'Magnesium (200-400mg) - Helps with insulin function',
      'Chromium (200-400mcg) - May improve glucose metabolism'
    ],
    mealTiming: [
      'Eat every 3-4 hours to maintain stable blood sugar',
      'Have protein with every meal and snack',
      'Limit carbs in evening meals',
      'Consider intermittent fasting (consult healthcare provider)',
      'Eat the largest meal earlier in the day'
    ]
  };

  const diabetesRecommendations = {
    beneficial: [
      { food: 'Non-starchy Vegetables', reason: 'Low carbs, high nutrients', gi: 'Very Low (10-15)' },
      { food: 'Lean Proteins', reason: 'No effect on blood sugar', gi: 'None (0)' },
      { food: 'Whole Grains', reason: 'Fiber slows glucose absorption', gi: 'Medium (45-65)' },
      { food: 'Beans & Legumes', reason: 'Protein and fiber combination', gi: 'Low (25-35)' },
      { food: 'Cinnamon', reason: 'May improve insulin sensitivity', gi: 'Very Low (5)' },
      { food: 'Apple Cider Vinegar', reason: 'May reduce post-meal glucose spike', gi: 'None' },
      { food: 'Chia Seeds', reason: 'Fiber and healthy fats', gi: 'Very Low (1)' },
      { food: 'Broccoli', reason: 'Chromium supports glucose metabolism', gi: 'Very Low (10)' }
    ],
    avoid: [
      { food: 'Candy & Sweets', reason: 'Rapid blood sugar spikes', gi: 'Very High (85+)' },
      { food: 'Fruit Juices', reason: 'Concentrated sugars without fiber', gi: 'High (70+)' },
      { food: 'White Potatoes', reason: 'High starch content', gi: 'High (78)' },
      { food: 'Refined Cereals', reason: 'Processed carbs digest quickly', gi: 'High (80+)' },
      { food: 'Honey & Syrups', reason: 'Natural but still high in sugar', gi: 'High (75)' },
      { food: 'Dried Fruits', reason: 'Concentrated sugars', gi: 'Medium-High (60-70)' }
    ],
    portionControl: [
      'Use the plate method: 1/2 vegetables, 1/4 protein, 1/4 starch',
      'Measure carbohydrates: 45-60g per meal',
      'Read nutrition labels for total carbs',
      'Use smaller plates to control portions',
      'Fill up on non-starchy vegetables first'
    ],
    monitoring: [
      'Check blood glucose 2 hours after meals',
      'Target: <140 mg/dL 2 hours post-meal',
      'Keep a food and glucose log',
      'Test new foods to see individual response',
      'Monitor for patterns and triggers'
    ]
  };

  const combinedTips = {
    exercise: [
      'Walk for 10-15 minutes after meals to lower blood sugar',
      'Aim for 150 minutes of moderate exercise per week',
      'Include both cardio and strength training',
      'High-intensity interval training (HIIT) can be beneficial',
      'Even light activity helps with insulin sensitivity'
    ],
    stress: [
      'Practice stress reduction techniques (meditation, yoga)',
      'Chronic stress raises cortisol and blood sugar',
      'Ensure adequate sleep (7-9 hours)',
      'Consider counseling for emotional eating',
      'Find healthy stress outlets (hobbies, social support)'
    ]
  };

  return (
    <Box sx={{ space: 2 }}>
      {condition === 'pcos' || condition === 'both' ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="error.main">
              PCOS-Specific Food Recommendations
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  <BeneficialIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Beneficial Foods
                </Typography>
                <List dense>
                  {pcosRecommendations.beneficial.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {item.food}
                            </Typography>
                            <Chip label={`GI: ${item.gi}`} size="small" color="success" variant="outlined" />
                          </Box>
                        }
                        secondary={item.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  <AvoidIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Foods to Limit/Avoid
                </Typography>
                <List dense>
                  {pcosRecommendations.avoid.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {item.food}
                            </Typography>
                            <Chip label={`GI: ${item.gi}`} size="small" color="error" variant="outlined" />
                          </Box>
                        }
                        secondary={item.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    <SupplementIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Helpful Supplements for PCOS
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {pcosRecommendations.supplements.map((supplement, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <SupplementIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={supplement} />
                      </ListItem>
                    ))}
                  </List>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Always consult with your healthcare provider before starting any supplements.
                  </Alert>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    <TimingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    PCOS Meal Timing Strategies
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {pcosRecommendations.mealTiming.map((tip, index) => (
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
            </Box>
          </CardContent>
        </Card>
      ) : null}

      {condition === 'diabetes' || condition === 'both' ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom color="primary.main">
              Diabetes Management Food Guide
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'success.main', fontWeight: 'bold' }}>
                  <BeneficialIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  Blood Sugar Friendly Foods
                </Typography>
                <List dense>
                  {diabetesRecommendations.beneficial.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {item.food}
                            </Typography>
                            <Chip label={`GI: ${item.gi}`} size="small" color="success" variant="outlined" />
                          </Box>
                        }
                        secondary={item.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ color: 'error.main', fontWeight: 'bold' }}>
                  <AvoidIcon sx={{ verticalAlign: 'middle', mr: 1 }} />
                  High Blood Sugar Risk Foods
                </Typography>
                <List dense>
                  {diabetesRecommendations.avoid.map((item, index) => (
                    <ListItem key={index} sx={{ py: 0.5 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                            <Typography variant="body2" fontWeight="medium">
                              {item.food}
                            </Typography>
                            <Chip label={`GI: ${item.gi}`} size="small" color="error" variant="outlined" />
                          </Box>
                        }
                        secondary={item.reason}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>

            <Box sx={{ mt: 3 }}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    <MealIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Portion Control for Diabetes
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {diabetesRecommendations.portionControl.map((tip, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <MealIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    <TimingIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Blood Sugar Monitoring Tips
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {diabetesRecommendations.monitoring.map((tip, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <TimingIcon color="info" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Individual responses vary. Work with your healthcare team to determine your target ranges.
                  </Alert>
                </AccordionDetails>
              </Accordion>
            </Box>
          </CardContent>
        </Card>
      ) : null}

      {/* Universal Health Tips */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Universal Health & Lifestyle Tips
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    <ExerciseIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Exercise & Movement
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {combinedTips.exercise.map((tip, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <ExerciseIcon color="primary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>

            <Grid item xs={12} md={6}>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">
                    Stress & Sleep Management
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List dense>
                    {combinedTips.stress.map((tip, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={tip} />
                      </ListItem>
                    ))}
                  </List>
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}