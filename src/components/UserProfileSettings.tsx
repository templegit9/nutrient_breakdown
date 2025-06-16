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
  Divider
} from '@mui/material';
import {
  Person as PersonIcon,
  FitnessCenter as FitnessIcon,
  Calculate as CalculateIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { DatabaseService } from '../services/database';
import type { UserProfile } from '../types';

interface UserProfileSettingsProps {
  open: boolean;
  onClose: () => void;
  onSave?: (profile: UserProfile) => void;
  isOnboarding?: boolean;
}

// Activity level descriptions
const ACTIVITY_LEVELS = {
  sedentary: { label: 'Sedentary', description: 'Little to no exercise', multiplier: 1.2 },
  light: { label: 'Light', description: 'Light exercise 1-3 days/week', multiplier: 1.375 },
  moderate: { label: 'Moderate', description: 'Moderate exercise 3-5 days/week', multiplier: 1.55 },
  active: { label: 'Active', description: 'Hard exercise 6-7 days/week', multiplier: 1.725 },
  very_active: { label: 'Very Active', description: 'Physical job + exercise', multiplier: 1.9 }
};

export default function UserProfileSettings({ open, onClose, onSave, isOnboarding = false }: UserProfileSettingsProps) {
  const [loading, setLoading] = useState(true);
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

  // Calculated values
  const [calculatedValues, setCalculatedValues] = useState({
    bmr: 0,
    tdee: 0,
    bmi: 0,
    bmiCategory: ''
  });

  useEffect(() => {
    if (open) {
      loadProfile();
    }
  }, [open]);

  useEffect(() => {
    calculateMetrics();
  }, [profile.age, profile.gender, profile.height, profile.weight, profile.activityLevel]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const existingProfile = await DatabaseService.getUserProfile();
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile');
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      // Validate required fields - name is especially important for onboarding
      if (!profile.name || profile.name.trim() === '') {
        setError('Please enter your name');
        return;
      }
      if (!profile.age || !profile.height || !profile.weight) {
        setError('Please fill in all required fields (age, height, weight)');
        return;
      }

      const { id, ...profileWithoutId } = profile as UserProfile;
      const savedProfile = await DatabaseService.saveUserProfile(profileWithoutId);
      
      if (onSave) {
        onSave(savedProfile);
      }
      
      onClose();
    } catch (err) {
      console.error('Error saving profile:', err);
      setError('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog 
      open={open} 
      onClose={isOnboarding ? undefined : onClose} 
      maxWidth="md" 
      fullWidth
      disableEscapeKeyDown={isOnboarding}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <PersonIcon color="primary" />
        {isOnboarding ? 'Welcome! Complete Your Profile' : 'User Profile Settings'}
      </DialogTitle>
      
      <DialogContent>
        {isOnboarding && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Welcome to Nutrient Tracker!</strong> Please set up your profile to get personalized nutrition recommendations and accurate calorie calculations based on your metabolic needs.
            </Typography>
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

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
              placeholder={isOnboarding ? "Enter your name" : ""}
              helperText={isOnboarding ? "This helps personalize your experience" : ""}
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
      </DialogContent>

      <DialogActions>
        {!isOnboarding && (
          <Button onClick={onClose} disabled={saving}>
            Cancel
          </Button>
        )}
        <Button 
          onClick={handleSave} 
          variant="contained" 
          disabled={saving}
          startIcon={saving ? <CircularProgress size={16} /> : undefined}
        >
          {saving 
            ? 'Saving...' 
            : isOnboarding 
            ? 'Complete Setup' 
            : 'Save Profile'
          }
        </Button>
      </DialogActions>
    </Dialog>
  );
}