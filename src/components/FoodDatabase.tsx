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
  Alert
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FoodBankIcon from '@mui/icons-material/FoodBank'
import { DatabaseService } from '../services/database'

interface Food {
  id: string
  name: string
  brand?: string
  category?: string
  calories_per_100g?: number
  protein_per_100g?: number
  carbs_per_100g?: number
  fat_per_100g?: number
  fiber_per_100g?: number
  sugar_per_100g?: number
  sodium_per_100g?: number
}

export default function FoodDatabase() {
  const [foods, setFoods] = useState<Food[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(25)
  const [totalCount, setTotalCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isFallbackData, setIsFallbackData] = useState(false)
  
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const loadFoods = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Loading foods...', { searchTerm, page, rowsPerPage })
      
      if (searchTerm.trim()) {
        // Use search if there's a search term
        console.log('Searching for:', searchTerm)
        const searchResults = await DatabaseService.searchFoods(searchTerm)
        console.log('Search results:', searchResults)
        setFoods(searchResults)
        setTotalCount(searchResults.length)
      } else {
        // Load all foods with pagination
        console.log('Loading all foods with pagination...')
        const result = await DatabaseService.getAllFoods(page, rowsPerPage)
        console.log('Loaded foods:', result)
        setFoods(result.data)
        setTotalCount(result.count)
        setIsFallbackData(result.isFallback || false)
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

      {isFallbackData && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Showing sample food data. The main food database appears to be empty or unavailable. 
          This includes common foods and Nigerian cuisine options for demonstration.
        </Alert>
      )}

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
                  <Typography variant="h6" component="h3">
                    {food.name}
                  </Typography>
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
                </Box>
                
                {food.brand && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Brand: {food.brand}
                  </Typography>
                )}
                
                <Grid container spacing={1}>
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
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Calories</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Protein (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Carbs (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Fat (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Fiber (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Sugar (g)</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }} align="right">Sodium (mg)</TableCell>
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
                    <Typography variant="body2" fontWeight="medium">
                      {food.name}
                    </Typography>
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
                  <TableCell align="right">{formatNumber(food.calories_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.protein_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.carbs_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.fat_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.fiber_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.sugar_per_100g)}</TableCell>
                  <TableCell align="right">{formatNumber(food.sodium_per_100g)}</TableCell>
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
            {searchTerm ? 'No foods found matching your search' : 'No foods available in the database'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Try different search terms' : 'The food database appears to be empty'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

export { FoodDatabase }