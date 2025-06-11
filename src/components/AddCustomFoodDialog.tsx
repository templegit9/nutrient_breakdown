import { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Typography,
  Alert,
  InputAdornment,
  Divider
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { DatabaseService } from '../services/database'
import { foodCategories } from '../utils/foodCategories'

interface AddCustomFoodDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

interface CustomFoodForm {
  name: string
  brand: string
  category: string
  servingSize: number
  servingUnit: string
  calories: number
  protein: number
  carbs: number
  fat: number
  fiber: number
  sugar: number
  sodium: number
}

const initialForm: CustomFoodForm = {
  name: '',
  brand: '',
  category: '',
  servingSize: 100,
  servingUnit: 'g',
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  fiber: 0,
  sugar: 0,
  sodium: 0
}

const servingUnits = [
  'g', 'kg', 'ml', 'l', 'oz', 'lb',
  'cup', 'cups', 'tbsp', 'tsp',
  'piece', 'pieces', 'slice', 'slices',
  'serving', 'portion'
]

export default function AddCustomFoodDialog({ open, onClose, onSuccess }: AddCustomFoodDialogProps) {
  const [form, setForm] = useState<CustomFoodForm>(initialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof CustomFoodForm) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value
    setForm(prev => ({
      ...prev,
      [field]: field === 'name' || field === 'brand' || field === 'category' || field === 'servingUnit' 
        ? value 
        : parseFloat(value) || 0
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)
      setError(null)

      // Validation
      if (!form.name.trim()) {
        throw new Error('Food name is required')
      }
      if (!form.category) {
        throw new Error('Category is required')
      }
      if (form.servingSize <= 0) {
        throw new Error('Serving size must be greater than 0')
      }
      if (form.calories < 0) {
        throw new Error('Calories cannot be negative')
      }

      await DatabaseService.addCustomFood({
        name: form.name.trim(),
        brand: form.brand.trim() || undefined,
        category: form.category,
        servingSize: form.servingSize,
        servingUnit: form.servingUnit,
        calories: form.calories,
        protein: form.protein,
        carbs: form.carbs,
        fat: form.fat,
        fiber: form.fiber,
        sugar: form.sugar,
        sodium: form.sodium
      })

      // Reset form and close dialog
      setForm(initialForm)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add custom food')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setForm(initialForm)
    setError(null)
    onClose()
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <AddIcon />
          Add Custom Food
        </Box>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
          </Grid>
          
          <Grid item xs={12} md={8}>
            <TextField
              label="Food Name"
              value={form.name}
              onChange={handleChange('name')}
              fullWidth
              required
              placeholder="e.g., Homemade Chocolate Chip Cookies"
            />
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              label="Brand (Optional)"
              value={form.brand}
              onChange={handleChange('brand')}
              fullWidth
              placeholder="e.g., Homemade"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={handleChange('category')}
              fullWidth
              required
            >
              {Object.values(foodCategories).map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Serving Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Serving Information
            </Typography>
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              label="Serving Size"
              type="number"
              value={form.servingSize}
              onChange={handleChange('servingSize')}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          
          <Grid item xs={6}>
            <TextField
              select
              label="Serving Unit"
              value={form.servingUnit}
              onChange={handleChange('servingUnit')}
              fullWidth
              required
            >
              {servingUnits.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Nutrition Information */}
          <Grid item xs={12}>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Nutrition Information (per serving)
            </Typography>
          </Grid>
          
          <Grid item xs={6} md={3}>
            <TextField
              label="Calories"
              type="number"
              value={form.calories}
              onChange={handleChange('calories')}
              fullWidth
              required
              InputProps={{
                endAdornment: <InputAdornment position="end">kcal</InputAdornment>
              }}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
          
          <Grid item xs={6} md={3}>
            <TextField
              label="Protein"
              type="number"
              value={form.protein}
              onChange={handleChange('protein')}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>
              }}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          
          <Grid item xs={6} md={3}>
            <TextField
              label="Carbohydrates"
              type="number"
              value={form.carbs}
              onChange={handleChange('carbs')}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>
              }}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          
          <Grid item xs={6} md={3}>
            <TextField
              label="Fat"
              type="number"
              value={form.fat}
              onChange={handleChange('fat')}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>
              }}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          
          <Grid item xs={6} md={4}>
            <TextField
              label="Fiber (Optional)"
              type="number"
              value={form.fiber}
              onChange={handleChange('fiber')}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>
              }}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          
          <Grid item xs={6} md={4}>
            <TextField
              label="Sugar (Optional)"
              type="number"
              value={form.sugar}
              onChange={handleChange('sugar')}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">g</InputAdornment>
              }}
              inputProps={{ min: 0, step: 0.1 }}
            />
          </Grid>
          
          <Grid item xs={6} md={4}>
            <TextField
              label="Sodium (Optional)"
              type="number"
              value={form.sodium}
              onChange={handleChange('sodium')}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="end">mg</InputAdornment>
              }}
              inputProps={{ min: 0, step: 1 }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained"
          disabled={loading || !form.name.trim() || !form.category}
          startIcon={<AddIcon />}
        >
          {loading ? 'Adding...' : 'Add Custom Food'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}