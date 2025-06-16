import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Restaurant as FoodIcon
} from '@mui/icons-material'
import { DatabaseService } from '../services/database'
import AddCustomFoodDialog from './AddCustomFoodDialog'

interface CustomFood {
  id: string
  name: string
  brand?: string
  category: string
  serving_size: number
  serving_unit: string
  calories_per_serving: number
  protein_per_serving: number
  carbs_per_serving: number
  fat_per_serving: number
  fiber_per_serving?: number
  sugar_per_serving?: number
  sodium_per_serving?: number
  created_at: string
}

export default function CustomFoodsManager() {
  const [customFoods, setCustomFoods] = useState<CustomFood[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [foodToDelete, setFoodToDelete] = useState<CustomFood | null>(null)

  const loadCustomFoods = async () => {
    try {
      setLoading(true)
      setError(null)
      const foods = await DatabaseService.getCustomFoods()
      setCustomFoods(foods || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load custom foods')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCustomFoods()
  }, [])

  const handleDeleteClick = (food: CustomFood) => {
    setFoodToDelete(food)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!foodToDelete) return

    try {
      await DatabaseService.deleteCustomFood(foodToDelete.id)
      await loadCustomFoods()
      setDeleteConfirmOpen(false)
      setFoodToDelete(null)
    } catch (err) {
      setError('Failed to delete custom food')
    }
  }

  const getCategoryColor = (category: string) => {
    const colorMap: { [key: string]: string } = {
      'Fruits': '#FF6B6B',
      'Vegetables': '#4ECDC4',
      'Grains': '#45B7D1',
      'Proteins': '#F9CA24',
      'Dairy': '#87CEEB',
      'Snacks': '#FFA07A',
      'Beverages': '#FFB6C1',
      'Other': '#D3D3D3'
    }
    return colorMap[category] || colorMap['Other']
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          My Custom Foods
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddDialogOpen(true)}
        >
          Add Custom Food
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {customFoods.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <FoodIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No custom foods yet
            </Typography>
            <Typography variant="body2" color="text.secondary" mb={3}>
              Create your own food items with custom nutrition information
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Your First Custom Food
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {customFoods.map((food) => (
            <Grid item xs={12} md={6} lg={4} key={food.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography variant="h6" component="div" noWrap>
                      {food.name}
                    </Typography>
                    <Box>
                      <IconButton size="small" onClick={() => handleDeleteClick(food)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {food.brand && (
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Brand: {food.brand}
                    </Typography>
                  )}

                  <Box display="flex" gap={1} mb={2}>
                    <Chip
                      label={food.category}
                      size="small"
                      sx={{
                        backgroundColor: getCategoryColor(food.category),
                        color: 'white'
                      }}
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Serving: {food.serving_size} {food.serving_unit}
                  </Typography>

                  <Box mt={2}>
                    <Typography variant="body2" color="text.secondary">
                      Per serving:
                    </Typography>
                    <Typography variant="body2">
                      • {food.calories_per_serving} calories
                    </Typography>
                    <Typography variant="body2">
                      • {food.protein_per_serving}g protein
                    </Typography>
                    <Typography variant="body2">
                      • {food.carbs_per_serving}g carbs
                    </Typography>
                    <Typography variant="body2">
                      • {food.fat_per_serving}g fat
                    </Typography>
                    {food.fiber_per_serving && food.fiber_per_serving > 0 && (
                      <Typography variant="body2">
                        • {food.fiber_per_serving}g fiber
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for mobile */}
      <Fab
        color="primary"
        aria-label="add custom food"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', md: 'none' }
        }}
        onClick={() => setAddDialogOpen(true)}
      >
        <AddIcon />
      </Fab>

      {/* Add Custom Food Dialog */}
      <AddCustomFoodDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSuccess={loadCustomFoods}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Delete Custom Food</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{foodToDelete?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}