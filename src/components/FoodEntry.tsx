import { useState } from 'react'
import {
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Grid,
  MenuItem,
  Box,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Switch,
  Divider,
  Chip
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import { FoodItem } from '../types'
import { NutrientInfo } from '../types'
import FoodSearch from './FoodSearch'
import { units, getPortionSuggestions } from '../utils/unitConversions'
import { foodCategories, categorizeFoodByName, getCategoryInfo } from '../utils/foodCategories'

interface FoodEntryProps {
  onAddFood: (food: FoodItem) => void;
}

// Remove the old static categories - we'll use the dynamic system

export default function FoodEntry({ onAddFood }: FoodEntryProps) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('grams');
  const [category, setCategory] = useState('grains');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [suggestedUnit, setSuggestedUnit] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [portionSuggestions, setPortionSuggestions] = useState<Array<{unit: string, amount: number, description: string}>>([]);
  
  // Glucose tracking states
  const [enableGlucoseTracking, setEnableGlucoseTracking] = useState(false);
  const [preGlucose, setPreGlucose] = useState('');
  const [postGlucose, setPostGlucose] = useState('');
  const [glucoseNotes, setGlucoseNotes] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!foodName.trim()) {
      errors.foodName = 'Food name is required';
    } else if (foodName.trim().length < 2) {
      errors.foodName = 'Food name must be at least 2 characters';
    }
    
    if (!quantity) {
      errors.quantity = 'Quantity is required';
    } else {
      const numQuantity = parseFloat(quantity);
      if (isNaN(numQuantity) || numQuantity <= 0) {
        errors.quantity = 'Quantity must be a positive number';
      } else if (numQuantity > 10000) {
        errors.quantity = 'Quantity seems too large';
      }
    }
    
    // Validate glucose readings if tracking is enabled
    if (enableGlucoseTracking) {
      if (preGlucose) {
        const preGlucoseNum = parseFloat(preGlucose);
        if (isNaN(preGlucoseNum) || preGlucoseNum < 50 || preGlucoseNum > 500) {
          errors.preGlucose = 'Pre-meal glucose must be between 50-500 mg/dL';
        }
      }
      
      if (postGlucose) {
        const postGlucoseNum = parseFloat(postGlucose);
        if (isNaN(postGlucoseNum) || postGlucoseNum < 50 || postGlucoseNum > 500) {
          errors.postGlucose = 'Post-meal glucose must be between 50-500 mg/dL';
        }
      }
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      // Create basic nutrition data structure
      const quantityNum = parseFloat(quantity);
      const baseCalories = 100; // Default calories per 100g/100ml
      const calories = (baseCalories * quantityNum) / 100;
      
      const nutrients: NutrientInfo[] = [
        { id: 'protein', name: 'Protein', amount: calories * 0.1 / 4, unit: 'g', category: 'macronutrient' },
        { id: 'carbs', name: 'Carbohydrates', amount: calories * 0.5 / 4, unit: 'g', category: 'macronutrient' },
        { id: 'fat', name: 'Fat', amount: calories * 0.3 / 9, unit: 'g', category: 'macronutrient' },
        { id: 'fiber', name: 'Fiber', amount: calories * 0.05 / 4, unit: 'g', category: 'other' },
        { id: 'sugar', name: 'Sugar', amount: calories * 0.2 / 4, unit: 'g', category: 'other' },
        { id: 'sodium', name: 'Sodium', amount: calories * 0.01, unit: 'mg', category: 'mineral' }
      ];
      
      // Build glucose data if tracking is enabled
      const glucoseData = enableGlucoseTracking ? {
        preGlucose: preGlucose ? parseFloat(preGlucose) : undefined,
        postGlucose: postGlucose ? parseFloat(postGlucose) : undefined,
        testingTime: new Date(),
        notes: glucoseNotes.trim() || undefined
      } : undefined;

      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: foodName.trim(),
        quantity: quantityNum,
        unit,
        category,
        dateAdded: new Date(),
        glucoseData,
        calories,
        nutrients
      };

      onAddFood(newFood);
      setSuccess(`${foodName} added successfully!`);
      
      // Reset form
      setFoodName('');
      setQuantity('');
      setUnit('grams');
      setCategory('grains');
      setValidationErrors({});
      setSuggestedUnit('');
      setSuggestedCategory('');
      setPortionSuggestions([]);
      
      // Reset glucose tracking fields
      setPreGlucose('');
      setPostGlucose('');
      setGlucoseNotes('');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to analyze food nutrition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFoodName('');
    setQuantity('');
    setUnit('grams');
    setCategory('grains');
    setError('');
    setSuccess('');
    setValidationErrors({});
    setSuggestedUnit('');
    setSuggestedCategory('');
    setPortionSuggestions([]);
  };

  const handleFoodSelect = (food: any) => {
    setFoodName(food.name);
    
    // Auto-categorize food
    const autoCategory = categorizeFoodByName(food.name);
    setCategory(autoCategory);
    setSuggestedCategory(foodCategories[autoCategory]?.name || '');
    
    // Auto-suggest unit based on food type
    if (food.commonUnits && food.commonUnits.length > 0) {
      const bestUnit = food.commonUnits[0];
      setUnit(bestUnit);
      setSuggestedUnit(bestUnit);
    }
    
    // Get portion suggestions
    const suggestions = getPortionSuggestions(food.name);
    setPortionSuggestions(suggestions);
    
    // Clear any validation errors
    setValidationErrors(prev => ({ ...prev, foodName: '' }));
  };

  const handleFoodNameChange = (value: string) => {
    setFoodName(value);
    
    // Auto-categorize as user types
    if (value.length > 2) {
      const autoCategory = categorizeFoodByName(value);
      if (autoCategory !== category) {
        setCategory(autoCategory);
        setSuggestedCategory(foodCategories[autoCategory]?.name || '');
      }
    }
    
    if (validationErrors.foodName) {
      setValidationErrors(prev => ({ ...prev, foodName: '' }));
    }
  };

  const handlePortionSuggestionClick = (suggestion: {unit: string, amount: number, description: string}) => {
    setQuantity(suggestion.amount.toString());
    setUnit(suggestion.unit);
  };

  return (
    <Card sx={{ 
      maxWidth: { xs: '100%', md: 800 }, 
      mx: 'auto',
      boxShadow: { xs: 1, md: 3 }
    }}>
      <CardContent sx={{ p: { xs: 2, md: 3 } }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          gutterBottom 
          color="primary"
          sx={{ 
            fontWeight: 600,
            mb: { xs: 2, md: 3 }
          }}
        >
          Add Food Item
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={{ xs: 2, md: 3 }}>
            <Grid item xs={12} md={6}>
              <Box>
                <FoodSearch
                  value={foodName}
                  onChange={handleFoodNameChange}
                  onFoodSelect={handleFoodSelect}
                  placeholder="e.g., Apple, Chicken breast, Brown rice"
                  disabled={loading}
                />
                {validationErrors.foodName && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {validationErrors.foodName}
                  </Typography>
                )}
                {suggestedCategory && (
                  <Typography variant="caption" color="primary" sx={{ mt: 0.5, display: 'block' }}>
                    Suggested category: {suggestedCategory}
                  </Typography>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  if (validationErrors.quantity) {
                    setValidationErrors(prev => ({ ...prev, quantity: '' }));
                  }
                }}
                required
                inputProps={{ 
                  min: 0, 
                  step: 0.1,
                  'aria-label': 'quantity'
                }}
                error={!!validationErrors.quantity}
                helperText={validationErrors.quantity}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <TextField
                  fullWidth
                  select
                  label="Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  helperText={suggestedUnit ? `Suggested for this food` : undefined}
                >
                  {Object.entries(units).map(([key, unitInfo]) => (
                    <MenuItem key={key} value={key}>
                      {unitInfo.name} ({unitInfo.abbreviation})
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box>
                <TextField
                  fullWidth
                  select
                  label="Food Category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  helperText={suggestedCategory ? `Auto-detected: ${suggestedCategory}` : "Helps with nutritional analysis"}
                >
                  {Object.entries(foodCategories).map(([id, categoryInfo]) => (
                    <MenuItem key={id} value={id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <span style={{ fontSize: '1.2em' }}>{categoryInfo.icon}</span>
                        <span>{categoryInfo.name}</span>
                        {categoryInfo.pcosRecommendation === 'excellent' && (
                          <Typography variant="caption" color="success.main" sx={{ ml: 1 }}>
                            PCOS-friendly
                          </Typography>
                        )}
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>
                
                {category && (
                  <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {getCategoryInfo(category)?.description}
                    </Typography>
                    {getCategoryInfo(category)?.pcosRecommendation && (
                      <Typography 
                        variant="caption" 
                        color={
                          getCategoryInfo(category)?.pcosRecommendation === 'excellent' ? 'success.main' :
                          getCategoryInfo(category)?.pcosRecommendation === 'good' ? 'primary.main' :
                          getCategoryInfo(category)?.pcosRecommendation === 'moderate' ? 'warning.main' :
                          'error.main'
                        }
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        PCOS recommendation: {getCategoryInfo(category)?.pcosRecommendation}
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            </Grid>
            
            {portionSuggestions.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ mt: 1 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Common portion sizes:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {portionSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outlined"
                        size="small"
                        onClick={() => handlePortionSuggestionClick(suggestion)}
                        sx={{ 
                          borderRadius: 2,
                          textTransform: 'none',
                          fontSize: '0.75rem'
                        }}
                      >
                        {suggestion.amount} {units[suggestion.unit]?.abbreviation || suggestion.unit}
                        <Typography variant="caption" sx={{ ml: 0.5, opacity: 0.7 }}>
                          ({suggestion.description})
                        </Typography>
                      </Button>
                    ))}
                  </Box>
                </Box>
              </Grid>
            )}

            {/* Glucose Tracking Section */}
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Switch
                    checked={enableGlucoseTracking}
                    onChange={(e) => setEnableGlucoseTracking(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body1">Track Blood Glucose</Typography>
                    <Chip 
                      label="PCOS/Diabetes" 
                      size="small" 
                      color="secondary" 
                      variant="outlined"
                    />
                  </Box>
                }
              />
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                Optional: Track pre and post-meal glucose levels for better health insights
              </Typography>
            </Grid>

            {enableGlucoseTracking && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Pre-meal Glucose"
                    value={preGlucose}
                    onChange={(e) => setPreGlucose(e.target.value)}
                    error={!!validationErrors.preGlucose}
                    helperText={validationErrors.preGlucose || "Blood sugar before eating (mg/dL)"}
                    type="number"
                    inputProps={{ min: 50, max: 500, step: 1 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">mg/dL</InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Post-meal Glucose (2hrs)"
                    value={postGlucose}
                    onChange={(e) => setPostGlucose(e.target.value)}
                    error={!!validationErrors.postGlucose}
                    helperText={validationErrors.postGlucose || "Blood sugar 2 hours after eating (mg/dL)"}
                    type="number"
                    inputProps={{ min: 50, max: 500, step: 1 }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">mg/dL</InputAdornment>
                    }}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Glucose Notes (Optional)"
                    value={glucoseNotes}
                    onChange={(e) => setGlucoseNotes(e.target.value)}
                    placeholder="e.g., feeling tired, activity level, medication timing..."
                    multiline
                    rows={2}
                    helperText="Add any relevant notes about your glucose readings"
                  />
                </Grid>

                {(preGlucose || postGlucose) && (
                  <Grid item xs={12}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>Normal ranges:</strong> Pre-meal: 80-130 mg/dL | Post-meal: &lt;180 mg/dL
                        <br />
                        <em>Consult your healthcare provider for personalized target ranges.</em>
                      </Typography>
                    </Alert>
                  </Grid>
                )}
              </>
            )}

            <Grid item xs={12}>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 2, 
                  mt: { xs: 1, md: 2 },
                  flexDirection: { xs: 'column', sm: 'row' }
                }}
              >
                <Button
                  type="submit"
                  variant="contained"
                  size={isMobile ? "medium" : "large"}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : <SearchIcon />}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 200 },
                    py: { xs: 1.5, md: 2 }
                  }}
                >
                  {loading ? 'Analyzing Nutrition...' : 'Add Food'}
                </Button>
                
                <Button
                  type="button"
                  variant="outlined"
                  size={isMobile ? "medium" : "large"}
                  onClick={handleClearForm}
                  disabled={loading}
                  sx={{ 
                    minWidth: { xs: '100%', sm: 120 },
                    py: { xs: 1.5, md: 2 }
                  }}
                >
                  Clear
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
}