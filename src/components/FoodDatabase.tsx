import { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
  CircularProgress,
  Chip,
  TablePagination,
  useTheme,
  useMediaQuery,
  Card,
  CardContent,
  Grid,
  Alert,
  Button,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import {
  Search as SearchIcon,
  FoodBank as FoodBankIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Delete as DeleteIcon
} from '@mui/icons-material'
import { DatabaseService } from '../services/database'
import AddCustomFoodDialog from './AddCustomFoodDialog'
import type { DatabaseFood } from '../types'

interface Food extends DatabaseFood {
  isCustom?: boolean // Identifier for custom vs database foods
  user_id?: string // For custom foods
}

export default function FoodDatabase() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'all' | 'database' | 'custom'>('all')
  const [addCustomDialogOpen, setAddCustomDialogOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [foodToDelete, setFoodToDelete] = useState<Food | null>(null)
  
  const handleDeleteFood = async (food: Food) => {
    if (!food.isCustom) return // Only allow deleting custom foods
    setFoodToDelete(food)
    setDeleteConfirmOpen(true)
  }
  
  const handleDeleteConfirm = async () => {
    if (!foodToDelete?.isCustom) return
    
    try {
      await DatabaseService.deleteCustomFood(foodToDelete.id)
      await loadFoods() // Reload foods after deletion
      setDeleteConfirmOpen(false)
      setFoodToDelete(null)
    } catch (err) {
      setError('Failed to delete custom food')
    }
  }
  
  const handleCustomFoodAdded = async () => {
    setAddCustomDialogOpen(false)
    await loadFoods() // Reload foods after adding
  }
  
  const handleViewModeChange = (newMode: 'all' | 'database' | 'custom') => {
    setViewMode(newMode)
    setPage(0) // Reset to first page when changing view
  }
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const loadFoods = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading foods...', { searchTerm, page, rowsPerPage, viewMode })
      
      let allFoods: Food[] = []
      
      if (searchTerm.trim()) {
        // Use search based on view mode
        console.log('Searching for:', searchTerm)
        if (viewMode === 'all') {
          const searchResults = await DatabaseService.searchAllFoods(searchTerm)
          allFoods = searchResults.map(food => ({ ...food, isCustom: food.isCustom || false }))
        } else if (viewMode === 'database') {
          const searchResults = await DatabaseService.searchFoods(searchTerm)
          allFoods = searchResults.map(food => ({ ...food, isCustom: false }))
        } else if (viewMode === 'custom') {
          const searchResults = await DatabaseService.searchCustomFoods(searchTerm)
          allFoods = searchResults.map(food => ({ ...food, isCustom: true }))
        }
        console.log('Search results:', allFoods)
        setFoods(allFoods)
        setTotalCount(allFoods.length)
      } else {
        // Load foods based on view mode with pagination
        console.log('Loading foods with pagination...')
        if (viewMode === 'all') {
          // Load both database and custom foods
          const [databaseResult, customFoods] = await Promise.all([
            DatabaseService.getAllFoods(page, rowsPerPage),
            DatabaseService.getCustomFoods()
          ])
          const combinedFoods = [
            ...databaseResult.data.map(food => ({ ...food, isCustom: false })),
            ...(customFoods || []).map(food => ({
              ...food,
              id: food.id.toString(),
              // Convert per-serving to per-100g for consistency
              calories_per_100g: (food.calories_per_serving || 0) * 100 / (food.serving_size || 100),
              protein_per_100g: (food.protein_per_serving || 0) * 100 / (food.serving_size || 100),
              carbs_per_100g: (food.carbs_per_serving || 0) * 100 / (food.serving_size || 100),
              fat_per_100g: (food.fat_per_serving || 0) * 100 / (food.serving_size || 100),
              fiber_per_100g: (food.fiber_per_serving || 0) * 100 / (food.serving_size || 100),
              sugar_per_100g: (food.sugar_per_serving || 0) * 100 / (food.serving_size || 100),
              sodium_per_100g: (food.sodium_per_serving || 0) * 100 / (food.serving_size || 100),
              cholesterol_per_100g: 0,
              potassium_per_100g: 0,
              iron_per_100g: 0,
              calcium_per_100g: 0,
              vitamin_c_per_100g: 0,
              vitamin_d_per_100g: 0,
              glycemic_index: null,
              glycemic_load: null,
              preparation_state: 'raw',
              isCustom: true
            }))
          ]
          setFoods(combinedFoods)
          setTotalCount(databaseResult.count + (customFoods?.length || 0))
        } else if (viewMode === 'database') {
          const result = await DatabaseService.getAllFoods(page, rowsPerPage)
          setFoods(result.data.map(food => ({ ...food, isCustom: false })))
          setTotalCount(result.count)
        } else if (viewMode === 'custom') {
          const customFoods = await DatabaseService.getCustomFoods()
          const formattedCustomFoods = (customFoods || []).map(food => ({
            ...food,
            id: food.id.toString(),
            // Convert per-serving to per-100g for consistency
            calories_per_100g: (food.calories_per_serving || 0) * 100 / (food.serving_size || 100),
            protein_per_100g: (food.protein_per_serving || 0) * 100 / (food.serving_size || 100),
            carbs_per_100g: (food.carbs_per_serving || 0) * 100 / (food.serving_size || 100),
            fat_per_100g: (food.fat_per_serving || 0) * 100 / (food.serving_size || 100),
            fiber_per_100g: (food.fiber_per_serving || 0) * 100 / (food.serving_size || 100),
            sugar_per_100g: (food.sugar_per_serving || 0) * 100 / (food.serving_size || 100),
            sodium_per_100g: (food.sodium_per_serving || 0) * 100 / (food.serving_size || 100),
            cholesterol_per_100g: 0,
            potassium_per_100g: 0,
            iron_per_100g: 0,
            calcium_per_100g: 0,
            vitamin_c_per_100g: 0,
            vitamin_d_per_100g: 0,
            glycemic_index: null,
            glycemic_load: null,
            preparation_state: 'raw',
            isCustom: true
          }))
          setFoods(formattedCustomFoods)
          setTotalCount(formattedCustomFoods.length)
        }
      }
    } catch (err) {
      console.error('Error loading foods:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(`Failed to load foods: ${errorMessage}. The 'foods' table might not exist or be empty.`)
      setFoods([])
      setTotalCount(0)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Debug: Check database schema on component mount
    if (page === 0 && !searchTerm) {
      DatabaseService.checkDatabaseSchema().then(result => {
        console.log('Database schema check:', result)
      })
    }
    loadFoods()
  }, [page, rowsPerPage])

  useEffect(() => {
    // Debounced search
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setPage(0) // Reset to first page when searching
        loadFoods()
      } else if (searchTerm === '') {
        setPage(0)
        loadFoods()
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchTerm])
  
  useEffect(() => {
    // Reload foods when view mode changes
    loadFoods()
  }, [viewMode])

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const getCategoryColor = (category: string): string => {
    const colorMap: { [key: string]: string } = {
      'Fruits': '#FF6B6B',
      'Vegetables': '#4ECDC4',
      'Proteins': '#45B7D1',
      'Grains': '#FFA07A',
      'Starches': '#DDA0DD',
      'Legumes': '#98D8C8',
      'Nuts': '#F7DC6F',
      'Dairy': '#87CEEB',
      'Beverages': '#FFB6C1',
      'Spices': '#DEB887',
      'Other': '#D3D3D3'
    }
    return colorMap[category] || colorMap['Other']
  }

  const getCookingStateColor = (cookingState: string): string => {
    const colorMap: { [key: string]: string } = {
      'raw': '#4CAF50',      // Green
      'cooked': '#FF9800',   // Orange
      'boiled': '#2196F3',   // Blue
      'steamed': '#9C27B0',  // Purple
      'fried': '#F44336',    // Red
      'baked': '#795548',    // Brown
      'grilled': '#607D8B',  // Blue Grey
      'roasted': '#FF5722'   // Deep Orange
    };
    return colorMap[cookingState] || colorMap['raw'];
  }

  const formatNumber = (value: number | null | undefined): string => {
    if (value === null || value === undefined) return 'N/A'
    return value.toFixed(1)
  }

  if (loading && foods.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading food database...
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 3, color: 'primary.main' }}>
        Food Database
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Browse the complete nutrition database. All values are per 100g unless otherwise specified.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* View Mode Toggle and Add Custom Food Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, newMode) => newMode && handleViewModeChange(newMode)}
          aria-label="food view mode"
          size="small"
        >
          <ToggleButton value="all" aria-label="all foods">
            <FoodBankIcon sx={{ mr: 1 }} />
            All Foods
          </ToggleButton>
          <ToggleButton value="database" aria-label="database foods">
            <FoodBankIcon sx={{ mr: 1 }} />
            Database
          </ToggleButton>
          <ToggleButton value="custom" aria-label="custom foods">
            <PersonIcon sx={{ mr: 1 }} />
            Custom
          </ToggleButton>
        </ToggleButtonGroup>
        
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddCustomDialogOpen(true)}
          sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
        >
          Add Custom Food
        </Button>
      </Box>

      {/* Search Bar */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search foods, brands, or categories..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <FoodBankIcon color="primary" />
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Loading...' : `${totalCount} food${totalCount !== 1 ? 's' : ''} found`}
          {searchTerm && ` matching "${searchTerm}"`}
        </Typography>
      </Box>

      {/* Mobile View - Cards */}
      {isMobile ? (
        <Box>
          {foods.map((food) => (
            <Card key={food.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
                    {food.isCustom ? (
                      <PersonIcon color="primary" fontSize="small" title="Custom Food" />
                    ) : (
                      <FoodBankIcon color="action" fontSize="small" title="Database Food" />
                    )}
                    <Typography variant="h6" component="h3">
                      {food.name}
                    </Typography>
                    {food.isCustom && (
                      <Chip
                        label="Custom"
                        size="small"
                        color="primary"
                        sx={{ fontSize: '0.7rem', height: '20px' }}
                      />
                    )}
                  </Box>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                    {food.category && (
                      <Chip
                        label={food.category}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(food.category),
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      />
                    )}
                    <Chip
                      label={food.preparation_state ? food.preparation_state.charAt(0).toUpperCase() + food.preparation_state.slice(1) : 'Raw'}
                      size="small"
                      sx={{
                        backgroundColor: getCookingStateColor(food.preparation_state || 'raw'),
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                    {food.isCustom && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteFood(food)}
                        title="Delete custom food"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                
                {food.brand && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Brand: {food.brand}
                  </Typography>
                )}
                
                <Grid container spacing={1}>
                  {/* Macronutrients */}
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Calories:</strong> {formatNumber(food.calories_per_100g)}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Protein:</strong> {formatNumber(food.protein_per_100g)}g
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Carbs:</strong> {formatNumber(food.carbs_per_100g)}g
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Fat:</strong> {formatNumber(food.fat_per_100g)}g
                    </Typography>
                  </Grid>
                  
                  {/* Fiber and Sugar */}
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Fiber:</strong> {formatNumber(food.fiber_per_100g)}g
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2">
                      <strong>Sugar:</strong> {formatNumber(food.sugar_per_100g)}g
                    </Typography>
                  </Grid>
                  
                  {/* Key Micronutrients */}
                  {food.vitamin_c_per_100g > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="success.main">
                        <strong>Vitamin C:</strong> {formatNumber(food.vitamin_c_per_100g)}mg
                      </Typography>
                    </Grid>
                  )}
                  {food.iron_per_100g > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="success.main">
                        <strong>Iron:</strong> {formatNumber(food.iron_per_100g)}mg
                      </Typography>
                    </Grid>
                  )}
                  {food.calcium_per_100g > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="success.main">
                        <strong>Calcium:</strong> {formatNumber(food.calcium_per_100g)}mg
                      </Typography>
                    </Grid>
                  )}
                  {food.potassium_per_100g > 0 && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="success.main">
                        <strong>Potassium:</strong> {formatNumber(food.potassium_per_100g)}mg
                      </Typography>
                    </Grid>
                  )}
                  
                  {/* Glycemic Data for Diabetes Support */}
                  {food.glycemic_index > 0 && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="info.main">
                        <strong>Glycemic Index:</strong> {food.glycemic_index} 
                        {food.glycemic_load > 0 && ` | Load: ${food.glycemic_load}`}
                        <Typography component="span" variant="caption" sx={{ ml: 1 }}>
                          ({food.glycemic_index <= 55 ? 'Low' : food.glycemic_index <= 70 ? 'Medium' : 'High'} GI)
                        </Typography>
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        /* Desktop View - Table */
        <TableContainer component={Paper} elevation={2}>
          <Table sx={{ minWidth: 750 }}>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Food Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Brand</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Cooking State</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Calories</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Protein (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Carbs (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Fat (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Fiber (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Sugar (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Sodium (mg)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Vit C (mg)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Iron (mg)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Calcium (mg)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">GI</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {foods.map((food) => (
                <TableRow
                  key={food.id}
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:hover': { backgroundColor: 'action.selected' }
                  }}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {food.isCustom ? (
                        <PersonIcon color="primary" fontSize="small" title="Custom Food" />
                      ) : (
                        <FoodBankIcon color="action" fontSize="small" title="Database Food" />
                      )}
                      <Typography variant="body2" fontWeight="medium">
                        {food.name}
                      </Typography>
                      {food.isCustom && (
                        <Chip
                          label="Custom"
                          size="small"
                          color="primary"
                          sx={{ fontSize: '0.7rem', height: '20px' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {food.brand || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {food.category ? (
                      <Chip
                        label={food.category}
                        size="small"
                        sx={{
                          backgroundColor: getCategoryColor(food.category),
                          color: 'white',
                          fontSize: '0.75rem'
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">N/A</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={food.preparation_state ? food.preparation_state.charAt(0).toUpperCase() + food.preparation_state.slice(1) : 'Raw'}
                      size="small"
                      sx={{
                        backgroundColor: getCookingStateColor(food.preparation_state || 'raw'),
                        color: 'white',
                        fontSize: '0.75rem'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">{formatNumber(food.calories_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.protein_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.carbs_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.fat_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.fiber_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.sugar_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.sodium_per_100g)}</TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      color={food.vitamin_c_per_100g > 10 ? 'success.main' : 'text.primary'}
                      fontWeight={food.vitamin_c_per_100g > 10 ? 'bold' : 'normal'}
                    >
                      {formatNumber(food.vitamin_c_per_100g)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      color={food.iron_per_100g > 2 ? 'success.main' : 'text.primary'}
                      fontWeight={food.iron_per_100g > 2 ? 'bold' : 'normal'}
                    >
                      {formatNumber(food.iron_per_100g)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      color={food.calcium_per_100g > 100 ? 'success.main' : 'text.primary'}
                      fontWeight={food.calcium_per_100g > 100 ? 'bold' : 'normal'}
                    >
                      {formatNumber(food.calcium_per_100g)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {food.glycemic_index > 0 ? (
                      <Typography 
                        variant="body2" 
                        color={
                          food.glycemic_index <= 55 ? 'success.main' : 
                          food.glycemic_index <= 70 ? 'warning.main' : 'error.main'
                        }
                        fontWeight="bold"
                      >
                        {food.glycemic_index}
                      </Typography>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {food.isCustom && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteFood(food)}
                        title="Delete custom food"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {!searchTerm && (
        <TablePagination
          rowsPerPageOptions={[25, 50, 100]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ mt: 2 }}
        />
      )}

      {foods.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <FoodBankIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            {searchTerm ? 'No foods found matching your search' : 
           viewMode === 'custom' ? 'No custom foods created yet' :
           viewMode === 'database' ? 'No database foods available' :
           'No foods available'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try different search terms' : 
             viewMode === 'custom' ? 'Create your first custom food using the button above' :
             viewMode === 'database' ? 'The food database appears to be empty' :
             'No foods found in database or custom foods'}
          </Typography>
        </Box>
      )}
      
      {/* Add Custom Food Dialog */}
      <AddCustomFoodDialog
        open={addCustomDialogOpen}
        onClose={() => setAddCustomDialogOpen(false)}
        onSuccess={handleCustomFoodAdded}
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

export { FoodDatabase }