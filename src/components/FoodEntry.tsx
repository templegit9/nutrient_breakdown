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
import { units, getPortionSuggestions, safeConvertToBaseUnit } from '../utils/unitConversions'
import { foodCategories, categorizeFoodByName, getCategoryInfo } from '../utils/foodCategories'
import { adjustNutritionForCooking, getCookingStateDescription } from '../utils/cookingAdjustments'
import { getTimeOfDay } from '../utils/timeOfDay'

interface FoodEntryProps {
  onAddFood: (food: FoodItem) => Promise<void>;
}

// Remove the old static categories - we'll use the dynamic system

export default function FoodEntry({ onAddFood }: FoodEntryProps) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('grams');
  const [category, setCategory] = useState('grains');
  const [cookingState, setCookingState] = useState<'raw' | 'cooked' | 'boiled' | 'steamed' | 'fried' | 'baked' | 'grilled' | 'roasted'>('raw');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [suggestedUnit, setSuggestedUnit] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [portionSuggestions, setPortionSuggestions] = useState<Array<{unit: string, amount: number, description: string}>>([]);
  const [selectedDatabaseFood, setSelectedDatabaseFood] = useState<any>(null);
  
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
      // Create nutrition data structure
      const quantityNum = parseFloat(quantity);
      let adjustedNutrition;
      let nutrients: NutrientInfo[] = [];
      
      if (selectedDatabaseFood) {
        // Use database food data
        const dbFood = selectedDatabaseFood;
        
        // Convert units to grams for proper nutrition calculation
        const convertedAmount = safeConvertToBaseUnit(quantityNum, unit, selectedDatabaseFood.name.toLowerCase());
        const gramsAmount = convertedAmount.grams || quantityNum; // fallback to quantityNum if no conversion
        
        // Warn user if unit conversion failed
        if (!convertedAmount.isValid) {
          console.warn(`Unit conversion failed for ${unit}. Using fallback calculation which may be inaccurate.`);
        }
        
        const scaleFactor = gramsAmount / 100; // Scale from per-100g to actual amount
        
        const rawNutrition = {
          calories: dbFood.calories_per_100g * scaleFactor,
          protein: dbFood.protein_per_100g * scaleFactor,
          carbs: dbFood.carbs_per_100g * scaleFactor,
          fat: dbFood.fat_per_100g * scaleFactor,
          fiber: (dbFood.fiber_per_100g || 0) * scaleFactor,
          sugar: (dbFood.sugar_per_100g || 0) * scaleFactor,
          sodium: (dbFood.sodium_per_100g || 0) * scaleFactor,
          // Available micronutrients from database
          vitamin_c: (dbFood.vitamin_c_per_100g || 0) * scaleFactor,
          vitamin_d: (dbFood.vitamin_d_per_100g || 0) * scaleFactor,
          potassium: (dbFood.potassium_per_100g || 0) * scaleFactor,
          iron: (dbFood.iron_per_100g || 0) * scaleFactor,
          calcium: (dbFood.calcium_per_100g || 0) * scaleFactor,
          cholesterol: (dbFood.cholesterol_per_100g || 0) * scaleFactor,
          // Note: Other vitamins (thiamin, riboflavin, etc.) are not available in current database schema
          // They will default to 0 in cooking adjustments function
        };
        
        // Apply cooking state adjustments only if cooking state differs from database
        if (cookingState === dbFood.preparation_state) {
          adjustedNutrition = rawNutrition;
        } else {
          adjustedNutrition = adjustNutritionForCooking(rawNutrition, cookingState);
        }
        
        // Create comprehensive nutrient array from database
        nutrients = [
          { id: 'protein', name: 'Protein', amount: adjustedNutrition.protein, unit: 'g', category: 'macronutrient' },
          { id: 'carbs', name: 'Carbohydrates', amount: adjustedNutrition.carbs, unit: 'g', category: 'macronutrient' },
          { id: 'fat', name: 'Fat', amount: adjustedNutrition.fat, unit: 'g', category: 'macronutrient' },
          { id: 'fiber', name: 'Fiber', amount: adjustedNutrition.fiber, unit: 'g', category: 'other' },
          { id: 'sugar', name: 'Sugar', amount: adjustedNutrition.sugar, unit: 'g', category: 'other' },
          { id: 'sodium', name: 'Sodium', amount: adjustedNutrition.sodium, unit: 'mg', category: 'mineral' },
          { id: 'cholesterol', name: 'Cholesterol', amount: (dbFood.cholesterol_per_100g || 0) * scaleFactor, unit: 'mg', category: 'other' },
          { id: 'potassium', name: 'Potassium', amount: (dbFood.potassium_per_100g || 0) * scaleFactor, unit: 'mg', category: 'mineral' },
          { id: 'iron', name: 'Iron', amount: (dbFood.iron_per_100g || 0) * scaleFactor, unit: 'mg', category: 'mineral' },
          { id: 'calcium', name: 'Calcium', amount: (dbFood.calcium_per_100g || 0) * scaleFactor, unit: 'mg', category: 'mineral' },
          { id: 'vitamin_c', name: 'Vitamin C', amount: (dbFood.vitamin_c_per_100g || 0) * scaleFactor, unit: 'mg', category: 'vitamin' },
          { id: 'vitamin_d', name: 'Vitamin D', amount: (dbFood.vitamin_d_per_100g || 0) * scaleFactor, unit: 'IU', category: 'vitamin' }
        ];
      } else {
        // Fall back to estimated nutrition values
        const baseCalories = 100; // Default calories per 100g/100ml
        const rawCalories = (baseCalories * quantityNum) / 100;
        
        const rawNutrition = {
          calories: rawCalories,
          protein: rawCalories * 0.1 / 4,
          carbs: rawCalories * 0.5 / 4,
          fat: rawCalories * 0.3 / 9,
          fiber: rawCalories * 0.05 / 4,
          sugar: rawCalories * 0.2 / 4,
          sodium: rawCalories * 0.01,
          // Estimated micronutrients for fallback calculation
          vitamin_c: rawCalories * 0.0001, // Rough estimate
          vitamin_d: rawCalories * 0.00001, // Rough estimate
          potassium: rawCalories * 0.002, // Rough estimate
          iron: rawCalories * 0.0001, // Rough estimate
          calcium: rawCalories * 0.001, // Rough estimate
          cholesterol: rawCalories * 0.0005, // Rough estimate
          // Other vitamins not in database will default to 0
        };
        
        adjustedNutrition = adjustNutritionForCooking(rawNutrition, cookingState);
        
        nutrients = [
          { id: 'protein', name: 'Protein', amount: adjustedNutrition.protein, unit: 'g', category: 'macronutrient' },
          { id: 'carbs', name: 'Carbohydrates', amount: adjustedNutrition.carbs, unit: 'g', category: 'macronutrient' },
          { id: 'fat', name: 'Fat', amount: adjustedNutrition.fat, unit: 'g', category: 'macronutrient' },
          { id: 'fiber', name: 'Fiber', amount: adjustedNutrition.fiber, unit: 'g', category: 'other' },
          { id: 'sugar', name: 'Sugar', amount: adjustedNutrition.sugar, unit: 'g', category: 'other' },
          { id: 'sodium', name: 'Sodium', amount: adjustedNutrition.sodium, unit: 'mg', category: 'mineral' }
        ];
      }
      
      // Build glucose data if tracking is enabled
      const glucoseData = enableGlucoseTracking ? {
        preGlucose: preGlucose ? parseFloat(preGlucose) : undefined,
        postGlucose: postGlucose ? parseFloat(postGlucose) : undefined,
        testingTime: new Date(),
        notes: glucoseNotes.trim() || undefined
      } : undefined;

      const currentTime = new Date();
      const newFood: FoodItem = {
        id: Date.now().toString(),
        name: foodName.trim(),
        quantity: quantityNum,
        unit,
        category,
        dateAdded: currentTime,
        timeOfDay: getTimeOfDay(currentTime),
        glucoseData,
        cookingState,
        calories: adjustedNutrition.calories,
        nutrients
      };

      await onAddFood(newFood);
      setSuccess(`${foodName} added successfully!`);
      
      // Reset form
      setFoodName('');
      setQuantity('');
      setUnit('grams');
      setCategory('grains');
      setCookingState('raw');
      setSelectedDatabaseFood(null);
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
    setCookingState('raw');
    setSelectedDatabaseFood(null);
    setError('');
    setSuccess('');
    setValidationErrors({});
    setSuggestedUnit('');
    setSuggestedCategory('');
    setPortionSuggestions([]);
  };

  const handleFoodSelect = (food: any) => {
    setFoodName(food.name);
    
    // Store database food data if available
    if (food.databaseFood) {
      setSelectedDatabaseFood(food.databaseFood);
      // Use database category mapping and cooking state
      const mappedCategory = categorizeFoodByName(food.name, food.databaseFood.category);
      setCategory(mappedCategory);
      setCookingState(food.databaseFood.preparation_state as any);
    } else {
      setSelectedDatabaseFood(null);
      // Auto-categorize food
      const autoCategory = categorizeFoodByName(food.name);
      setCategory(autoCategory);
    }
    
    setSuggestedCategory(foodCategories[category]?.name || '');
    
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
    
    // Clear selected database food when manually typing
    if (selectedDatabaseFood && value !== selectedDatabaseFood.name) {
      setSelectedDatabaseFood(null);
    }
    
    // Auto-categorize as user types
    if (value.length > 2) {
      const databaseCategory = selectedDatabaseFood?.category;
      const autoCategory = categorizeFoodByName(value, databaseCategory);
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
            
            <Grid item xs={12} sm={6} md={6}>
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
            
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                fullWidth
                select
                label="Cooking State"
                value={cookingState}
                onChange={(e) => setCookingState(e.target.value as any)}
                helperText="Affects nutritional values"
              >
                <MenuItem value="raw">🥗 Raw</MenuItem>
                <MenuItem value="cooked">🍳 Cooked (general)</MenuItem>
                <MenuItem value="boiled">🫕 Boiled</MenuItem>
                <MenuItem value="steamed">🥄 Steamed</MenuItem>
                <MenuItem value="fried">🍳 Fried</MenuItem>
                <MenuItem value="pan-fried">🍳 Pan-fried</MenuItem>
                <MenuItem value="baked">🔥 Baked</MenuItem>
                <MenuItem value="grilled">🔥 Grilled</MenuItem>
                <MenuItem value="roasted">🔥 Roasted</MenuItem>
                <MenuItem value="dried">🌞 Dried</MenuItem>
                <MenuItem value="smoked">💨 Smoked</MenuItem>
                <MenuItem value="fermented">🧄 Fermented</MenuItem>
                <MenuItem value="fresh">🌿 Fresh</MenuItem>
                <MenuItem value="processed">📦 Processed</MenuItem>
              </TextField>
              
              <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {getCookingStateDescription(cookingState)}
                </Typography>
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