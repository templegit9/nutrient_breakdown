import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  InputAdornment,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Paper,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  IconButton
} from '@mui/material';
import {
  Person as PersonIcon,
  FitnessCenter as FitnessIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon,
  NavigateNext as NextIcon,
  NavigateBefore as BackIcon,
  LocalHospital as HealthIcon,
  MedicalServices as SupplementIcon,
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { DatabaseService } from '../services/database';
import { 
  EXPANDED_HEALTH_CONDITIONS, 
  HEALTH_CONDITION_CATEGORIES,
  type HealthConditionData 
} from '../utils/healthConditionsExpanded';
import type { UserProfile } from '../types';

interface OnboardingWizardProps {
  open: boolean;
  onClose: () => void;
  onComplete: (profile: UserProfile) => void;
}

// Activity level descriptions
const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentary', description: 'Little to no exercise', multiplier: 1.2 },
  light: { label: 'Light', description: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  moderate: { label: 'Moderate', description: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  active: { label: 'Active', description: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
  very_active: { label: 'Very Active', description: 'Physical job + exercise', multiplier: 1.9 }
};

const STEPS = [
  { label: 'Basic Profile', icon: PersonIcon },
  { label: 'Health Conditions', icon: HealthIcon },
  { label: 'Supplements', icon: SupplementIcon }
];

interface SupplementData {
  name: string;
  brand: string;
  dosage: string;
  frequency: string;
  notes: string;
}

export default function OnboardingWizard({ open, onClose, onComplete }: OnboardingWizardProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    name: '',
    age: 25,
    gender: 'other',
    height: 170, // cm
    weight: 70, // kg
    activityLevel: 'moderate',
    healthConditions: [],
    dietaryRestrictions: [],
    targetCalories: 2000,
    targetProtein: 150,
    targetCarbs: 250,
    targetFat: 65,
    targetFiber: 25,
    preferredNutrients: ['calories', 'protein', 'carbs', 'fat', 'fiber']
  });

  // Health conditions state
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Metabolic']);

  // Supplements state
  const [supplements, setSupplements] = useState<SupplementData[]>([]);

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    bmr: 0,
    tdee: 0,
    bmi: 0,
    bmiCategory: ''
  });

  useEffect(() => {
    if (open) {
      loadExistingProfile();
    }
  }, [open]);

  useEffect(() => {
    calculateMetrics();
  }, [profile.age, profile.gender, profile.height, profile.weight, profile.activityLevel]);

  const loadExistingProfile = async () => {
    try {
      setLoading(true);
      const existingProfile = await DatabaseService.getUserProfile();
      if (existingProfile) {
        setProfile(existingProfile);
        setSelectedConditions(existingProfile.healthConditions || []);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate BMR using Mifflin-St Jeor Equation
  const calculateBMR = () => {
    const { age, gender, height, weight } = profile;
    if (!age || !height || !weight) return 0;

    let bmr = 10 * weight + 6.25 * height - 5 * age;
    
    if (gender === 'male') {
      bmr += 5;
    } else if (gender === 'female') {
      bmr -= 161;
    } else {
      bmr -= 78; // Average for other
    }

    return Math.round(bmr);
  };

  // Calculate TDEE and other metrics
  const calculateMetrics = () => {
    const bmr = calculateBMR();
    const activityMultiplier = ACTIVITY_LEVELS[profile.activityLevel as keyof typeof ACTIVITY_LEVELS]?.multiplier || 1.55;
    const tdee = Math.round(bmr * activityMultiplier);
    
    // Calculate BMI
    const heightInM = (profile.height || 170) / 100;
    const bmi = (profile.weight || 70) / (heightInM * heightInM);
    
    let bmiCategory = '';
    if (bmi < 18.5) bmiCategory = 'Underweight';
    else if (bmi < 25) bmiCategory = 'Normal';
    else if (bmi < 30) bmiCategory = 'Overweight';
    else bmiCategory = 'Obese';

    setCalculatedValues({
      bmr,
      tdee,
      bmi: Math.round(bmi * 10) / 10,
      bmiCategory
    });

    // Auto-update calorie target based on TDEE
    if (tdee > 0) {
      setProfile(prev => ({
        ...prev,
        targetCalories: tdee
      }));
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Health conditions handlers
  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  // Supplement handlers
  const addSupplement = () => {
    setSupplements(prev => [...prev, {
      name: '',
      brand: '',
      dosage: '',
      frequency: '',
      notes: ''
    }]);
  };

  const updateSupplement = (index: number, field: keyof SupplementData, value: string) => {
    setSupplements(prev => prev.map((sup, i) => 
      i === index ? { ...sup, [field]: value } : sup
    ));
  };

  const removeSupplement = (index: number) => {
    setSupplements(prev => prev.filter((_, i) => i !== index));
  };

  const handleNext = () => {
    if (activeStep === 0) {
      // Validate basic profile
      if (!profile.name || profile.name.trim() === '') {
        setError('Please enter your name');
        return;
      }
      if (!profile.age || !profile.height || !profile.weight) {
        setError('Please fill in all required fields (age, height, weight)');
        return;
      }
    }
    
    setError(null);
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleComplete = async () => {
    try {
      setSaving(true);
      setError(null);

      // Prepare final profile data
      const finalProfile = {
        ...profile,
        healthConditions: selectedConditions
      };

      // Save profile
      const { id, ...profileWithoutId } = finalProfile as UserProfile;
      const savedProfile = await DatabaseService.saveUserProfile(profileWithoutId);
      
      // Save supplements if any
      if (supplements.length > 0) {
        const validSupplements = supplements.filter(sup => sup.name.trim() !== '');
        for (const supplement of validSupplements) {
          await DatabaseService.addSupplement({
            name: supplement.name,
            brand: supplement.brand || null,
            dosage: supplement.dosage || null,
            frequency: supplement.frequency || null,
            notes: supplement.notes || null,
            isActive: true
          });
        }
      }
      
      onComplete(savedProfile);
    } catch (err) {
      console.error('Error completing onboarding:', err);
      setError('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getConditionsByCategory = (category: string): HealthConditionData[] => {
    return EXPANDED_HEALTH_CONDITIONS.filter(condition => condition.category === category);
  };

  if (loading) {
    return (
      <Dialog open={open} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  const renderBasicProfile = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Welcome to Nutrient Tracker!</strong> Let's set up your profile to get personalized nutrition recommendations.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <PersonIcon /> Basic Information
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Name"
            value={profile.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            required
            placeholder="Enter your name"
            helperText="This helps personalize your experience"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Age"
            type="number"
            value={profile.age || ''}
            onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">years</InputAdornment>
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Gender</InputLabel>
            <Select
              value={profile.gender || 'other'}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              label="Gender"
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Activity Level</InputLabel>
            <Select
              value={profile.activityLevel || 'moderate'}
              onChange={(e) => handleInputChange('activityLevel', e.target.value)}
              label="Activity Level"
            >
              {Object.entries(ACTIVITY_LEVELS).map(([key, level]) => (
                <MenuItem key={key} value={key}>
                  <Box>
                    <Typography variant="body2">{level.label}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {level.description}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        {/* Physical Measurements */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FitnessIcon /> Physical Measurements
          </Typography>
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Height"
            type="number"
            value={profile.height || ''}
            onChange={(e) => handleInputChange('height', parseFloat(e.target.value) || 0)}
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">cm</InputAdornment>
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Weight"
            type="number"
            value={profile.weight || ''}
            onChange={(e) => handleInputChange('weight', parseFloat(e.target.value) || 0)}
            required
            InputProps={{
              endAdornment: <InputAdornment position="end">kg</InputAdornment>
            }}
          />
        </Grid>

        {/* Calculated Metrics */}
        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <CalculateIcon /> Calculated Metrics
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="primary">
                    {calculatedValues.bmr}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    BMR (kcal/day)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="primary">
                    {calculatedValues.tdee}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    TDEE (kcal/day)
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="h6" color="primary">
                    {calculatedValues.bmi}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    BMI
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={6} sm={3}>
              <Card variant="outlined">
                <CardContent sx={{ textAlign: 'center', py: 2 }}>
                  <Chip 
                    label={calculatedValues.bmiCategory}
                    color={
                      calculatedValues.bmiCategory === 'Normal' ? 'success' :
                      calculatedValues.bmiCategory === 'Underweight' ? 'warning' :
                      calculatedValues.bmiCategory === 'Overweight' ? 'warning' : 'error'
                    }
                    size="small"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                    Category
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        {/* Info Alert */}
        <Grid item xs={12}>
          <Alert severity="info" icon={<InfoIcon />}>
            <Typography variant="body2">
              <strong>BMR:</strong> Calories needed at rest. <strong>TDEE:</strong> Total daily energy expenditure including activity. 
              Your calorie target is automatically set to your TDEE for weight maintenance.
            </Typography>
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );

  const renderHealthConditions = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Select any health conditions you have. This helps us provide personalized nutrition recommendations and track relevant nutrients.
        </Typography>
      </Alert>

      <Box mb={2}>
        <Chip
          label={`${selectedConditions.length} condition${selectedConditions.length !== 1 ? 's' : ''} selected`}
          color="primary"
          variant="outlined"
        />
      </Box>

      {HEALTH_CONDITION_CATEGORIES.map(category => {
        const categoryConditions = getConditionsByCategory(category);
        if (categoryConditions.length === 0) return null;

        const isExpanded = expandedCategories.includes(category);
        const selectedInCategory = categoryConditions.filter(c => selectedConditions.includes(c.id)).length;

        return (
          <Accordion 
            key={category} 
            expanded={isExpanded}
            onChange={() => handleCategoryToggle(category)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box display="flex" alignItems="center" width="100%">
                <Badge 
                  badgeContent={selectedInCategory || categoryConditions.length}
                  color={selectedInCategory > 0 ? "primary" : "default"}
                  sx={{ mr: 2 }}
                >
                  <Box 
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: selectedInCategory > 0 ? 'primary.main' : 'grey.300',
                      color: selectedInCategory > 0 ? 'white' : 'text.secondary',
                      fontWeight: 'medium',
                      fontSize: '0.875rem'
                    }}
                  >
                    {selectedInCategory || categoryConditions.length}
                  </Box>
                </Badge>
                <Box>
                  <Typography variant="h6" fontWeight="semibold">{category}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedInCategory > 0 ? `${selectedInCategory} selected` : `${categoryConditions.length} available`}
                  </Typography>
                </Box>
              </Box>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={2}>
                {categoryConditions.map(condition => {
                  const isSelected = selectedConditions.includes(condition.id);
                  
                  return (
                    <Grid item xs={12} md={6} key={condition.id}>
                      <Paper
                        sx={{
                          p: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          border: 1,
                          borderColor: isSelected ? 'primary.main' : 'grey.300',
                          bgcolor: isSelected ? 'primary.light' : 'background.paper',
                          '&:hover': {
                            borderColor: isSelected ? 'primary.dark' : 'grey.400',
                            boxShadow: 1
                          }
                        }}
                        onClick={() => handleConditionToggle(condition.id)}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleConditionToggle(condition.id)}
                              icon={<Box sx={{ width: 20, height: 20, border: 2, borderColor: 'grey.400', borderRadius: 0.5 }} />}
                              checkedIcon={<CheckIcon sx={{ color: 'primary.main' }} />}
                            />
                          }
                          label={
                            <Box>
                              <Typography 
                                variant="body2" 
                                fontWeight="medium"
                                sx={{ color: isSelected ? 'primary.dark' : 'text.primary' }}
                              >
                                {condition.name}
                              </Typography>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  display: 'block',
                                  color: isSelected ? 'primary.dark' : 'text.secondary',
                                  mt: 0.5
                                }}
                              >
                                {condition.description}
                              </Typography>
                              
                              {/* Key Nutrients Preview */}
                              {condition.keyNutrients.length > 0 && (
                                <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                                  {condition.keyNutrients.slice(0, 3).map((nutrient, index) => (
                                    <Chip
                                      key={index}
                                      label={nutrient.nutrient.replace('_', ' ')}
                                      size="small"
                                      sx={{
                                        fontSize: '0.65rem',
                                        height: 20,
                                        bgcolor: isSelected ? 'primary.main' : 'grey.200',
                                        color: isSelected ? 'white' : 'text.secondary'
                                      }}
                                    />
                                  ))}
                                  {condition.keyNutrients.length > 3 && (
                                    <Chip
                                      label={`+${condition.keyNutrients.length - 3} more`}
                                      size="small"
                                      sx={{
                                        fontSize: '0.65rem',
                                        height: 20,
                                        bgcolor: isSelected ? 'primary.main' : 'grey.200',
                                        color: isSelected ? 'white' : 'text.secondary'
                                      }}
                                    />
                                  )}
                                </Box>
                              )}
                            </Box>
                          }
                          sx={{ margin: 0, width: '100%', alignItems: 'flex-start' }}
                        />
                      </Paper>
                    </Grid>
                  );
                })}
              </Grid>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );

  const renderSupplements = () => (
    <Box>
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          Add any supplements, vitamins, or medications you take regularly. This helps track your complete nutrition intake.
        </Typography>
      </Alert>

      {supplements.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <SupplementIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            No supplements added yet
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2}>
            You can skip this step or add supplements to track your complete nutrition intake.
          </Typography>
          <Button variant="outlined" onClick={addSupplement} startIcon={<SupplementIcon />}>
            Add Your First Supplement
          </Button>
        </Paper>
      ) : (
        <Box>
          {supplements.map((supplement, index) => (
            <Paper key={index} sx={{ p: 3, mb: 2 }}>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h6">Supplement #{index + 1}</Typography>
                <IconButton onClick={() => removeSupplement(index)} size="small">
                  <CloseIcon />
                </IconButton>
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Supplement Name"
                    value={supplement.name}
                    onChange={(e) => updateSupplement(index, 'name', e.target.value)}
                    placeholder="e.g., Vitamin D3, Omega-3"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Brand (Optional)"
                    value={supplement.brand}
                    onChange={(e) => updateSupplement(index, 'brand', e.target.value)}
                    placeholder="e.g., Nature Made, NOW Foods"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dosage"
                    value={supplement.dosage}
                    onChange={(e) => updateSupplement(index, 'dosage', e.target.value)}
                    placeholder="e.g., 1000mg, 2 capsules"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Frequency"
                    value={supplement.frequency}
                    onChange={(e) => updateSupplement(index, 'frequency', e.target.value)}
                    placeholder="e.g., Daily, Twice daily"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes (Optional)"
                    value={supplement.notes}
                    onChange={(e) => updateSupplement(index, 'notes', e.target.value)}
                    placeholder="e.g., Take with food, Doctor recommended"
                    multiline
                    rows={2}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
          
          <Button 
            variant="outlined" 
            onClick={addSupplement} 
            startIcon={<SupplementIcon />}
            sx={{ mb: 2 }}
          >
            Add Another Supplement
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return renderBasicProfile();
      case 1:
        return renderHealthConditions();
      case 2:
        return renderSupplements();
      default:
        return null;
    }
  };

  return (
    <Dialog 
      open={open} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h5" fontWeight="bold">
            Welcome to Nutrient Tracker
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Step {activeStep + 1} of {STEPS.length}
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mt: 2 }}>
          {STEPS.map((step, index) => (
            <Step key={step.label}>
              <StepLabel 
                icon={<step.icon />}
                sx={{
                  '& .MuiStepLabel-iconContainer': {
                    color: index === activeStep ? 'primary.main' : 
                           index < activeStep ? 'success.main' : 'text.disabled'
                  }
                }}
              >
                {step.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </DialogTitle>
      
      <DialogContent sx={{ minHeight: 400 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button 
          onClick={handleBack} 
          disabled={activeStep === 0}
          startIcon={<BackIcon />}
        >
          Back
        </Button>
        
        <Box sx={{ flex: 1 }} />
        
        {activeStep === STEPS.length - 1 ? (
          <Button 
            onClick={handleComplete} 
            variant="contained" 
            disabled={saving}
            startIcon={saving ? <CircularProgress size={16} /> : <CheckIcon />}
          >
            {saving ? 'Setting Up...' : 'Complete Setup'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            variant="contained"
            endIcon={<NextIcon />}
          >
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}