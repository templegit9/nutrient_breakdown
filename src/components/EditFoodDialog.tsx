import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  MenuItem,
  Box,
  Typography,
  Alert
} from '@mui/material'
import { FoodItem } from '../types'
import { foodCategories } from '../utils/foodCategories'
import { units } from '../utils/unitConversions'
import { NutrientInfo } from '../types'

interface EditFoodDialogProps {
  open: boolean;
  food: FoodItem | null;
  onClose: () => void;
  onSave: (id: string, updates: Partial<FoodItem>) => void;
}

export default function EditFoodDialog({ open, food, onClose, onSave }: EditFoodDialogProps) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('grams');
  const [category, setCategory] = useState('grains');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Initialize form with food data when dialog opens
  useEffect(() => {
    if (food && open) {
      setFoodName(food.name);
      setQuantity(food.quantity.toString());
      setUnit(food.unit);
      setCategory(food.category);
      setError('');
      setValidationErrors({});
    }
  }, [food, open]);

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
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async () => {
    if (!food || !validateForm()) return;

    setLoading(true);
    setError('');

    try {
      // Re-analyze nutrition if food name, quantity, or unit changed
      const nameChanged = foodName.trim() !== food.name;
      const quantityChanged = parseFloat(quantity) !== food.quantity;
      const unitChanged = unit !== food.unit;

      let updates: Partial<FoodItem> = {
        name: foodName.trim(),
        quantity: parseFloat(quantity),
        unit,
        category
      };

      if (nameChanged || quantityChanged || unitChanged) {
        // Create updated nutrition data
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
        
        updates = {
          ...updates,
          calories,
          nutrients
        };
      }

      onSave(food.id, updates);
      onClose();
    } catch (err) {
      setError('Failed to update food nutrition. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!food) return null;

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h6" component="div">
          Edit Food Item
        </Typography>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Food Name"
                value={foodName}
                onChange={(e) => {
                  setFoodName(e.target.value);
                  if (validationErrors.foodName) {
                    setValidationErrors(prev => ({ ...prev, foodName: '' }));
                  }
                }}
                required
                error={!!validationErrors.foodName}
                helperText={validationErrors.foodName}
                disabled={loading}
              />
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
                inputProps={{ min: 0, step: 0.1 }}
                error={!!validationErrors.quantity}
                helperText={validationErrors.quantity}
                disabled={loading}
              />
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                select
                label="Unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                disabled={loading}
              >
                {Object.entries(units).map(([key, unitInfo]) => (
                  <MenuItem key={key} value={key}>
                    {unitInfo.name} ({unitInfo.abbreviation})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Food Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                {Object.entries(foodCategories).map(([id, categoryInfo]) => (
                  <MenuItem key={id} value={id}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <span style={{ fontSize: '1.2em' }}>{categoryInfo.icon}</span>
                      <span>{categoryInfo.name}</span>
                    </Box>
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ mt: 1, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  <strong>Current nutrition info:</strong> {Math.round(food.calories)} calories
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Note: Nutrition information will be recalculated if you change the food name, quantity, or unit.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={handleClose} 
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}