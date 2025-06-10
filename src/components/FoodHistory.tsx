import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  TableSortLabel,
  Checkbox,
  Fab,
  Collapse
} from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import SearchIcon from '@mui/icons-material/Search'
import FilterListIcon from '@mui/icons-material/FilterList'
import ClearIcon from '@mui/icons-material/Clear'
import { FoodItem } from '../types'
import { foodCategories } from '../utils/foodCategories'
import { useState } from 'react'
import EditFoodDialog from './EditFoodDialog'

interface FoodHistoryProps {
  foods: FoodItem[];
  onUpdateFood?: (id: string, updates: Partial<FoodItem>) => void;
  onDeleteFood?: (id: string) => void;
}

export default function FoodHistory({ foods, onUpdateFood, onDeleteFood }: FoodHistoryProps) {
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; food: FoodItem | null }>({
    open: false,
    food: null
  });
  const [menuAnchor, setMenuAnchor] = useState<{ element: HTMLElement | null; food: FoodItem | null }>({
    element: null,
    food: null
  });
  const [editDialog, setEditDialog] = useState<{ open: boolean; food: FoodItem | null }>({
    open: false,
    food: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'calories' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedFoods, setSelectedFoods] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const handleDeleteClick = (food: FoodItem) => {
    setDeleteDialog({ open: true, food });
    setMenuAnchor({ element: null, food: null });
  };

  const handleDeleteConfirm = () => {
    if (deleteDialog.food && onDeleteFood) {
      onDeleteFood(deleteDialog.food.id);
    }
    setDeleteDialog({ open: false, food: null });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, food: FoodItem) => {
    setMenuAnchor({ element: event.currentTarget, food });
  };

  const handleMenuClose = () => {
    setMenuAnchor({ element: null, food: null });
  };

  const handleEditClick = (food: FoodItem) => {
    setEditDialog({ open: true, food });
    setMenuAnchor({ element: null, food: null });
  };

  const handleEditSave = (id: string, updates: Partial<FoodItem>) => {
    if (onUpdateFood) {
      onUpdateFood(id, updates);
    }
    setEditDialog({ open: false, food: null });
  };

  const handleSort = (column: 'name' | 'date' | 'calories' | 'category') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectFood = (foodId: string) => {
    const newSelected = new Set(selectedFoods);
    if (newSelected.has(foodId)) {
      newSelected.delete(foodId);
    } else {
      newSelected.add(foodId);
    }
    setSelectedFoods(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFoods.size === filteredAndSortedFoods.length) {
      setSelectedFoods(new Set());
    } else {
      setSelectedFoods(new Set(filteredAndSortedFoods.map(food => food.id)));
    }
  };

  const handleBulkDelete = () => {
    if (onDeleteFood && selectedFoods.size > 0) {
      selectedFoods.forEach(foodId => {
        onDeleteFood(foodId);
      });
      setSelectedFoods(new Set());
    }
  };

  // Filter and sort foods
  const filteredAndSortedFoods = foods
    .filter(food => {
      const matchesSearch = food.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || food.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'date':
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        case 'calories':
          comparison = a.calories - b.calories;
          break;
        case 'category':
          const aCategoryName = foodCategories[a.category]?.name || a.category;
          const bCategoryName = foodCategories[b.category]?.name || b.category;
          comparison = aCategoryName.localeCompare(bCategoryName);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  if (foods.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            No foods added yet
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5">
            Food History
          </Typography>
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterListIcon />
          </IconButton>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <TextField
              fullWidth
              placeholder="Search foods..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setSearchTerm('')} size="small">
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              sx={{ mb: 2 }}
            />
            
            <TextField
              select
              label="Filter by Category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              sx={{ minWidth: 200 }}
            >
              <MenuItem value="all">All Categories</MenuItem>
              {Object.entries(foodCategories).map(([id, category]) => (
                <MenuItem key={id} value={id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{category.icon}</span>
                    <span>{category.name}</span>
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Collapse>

        {selectedFoods.size > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="primary.contrastText">
                {selectedFoods.size} item(s) selected
              </Typography>
              <Button
                variant="contained"
                color="error"
                size="small"
                startIcon={<DeleteIcon />}
                onClick={handleBulkDelete}
              >
                Delete Selected
              </Button>
            </Box>
          </Box>
        )}
        
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedFoods.size > 0 && selectedFoods.size < filteredAndSortedFoods.length}
                    checked={filteredAndSortedFoods.length > 0 && selectedFoods.size === filteredAndSortedFoods.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'name'}
                    direction={sortBy === 'name' ? sortOrder : 'asc'}
                    onClick={() => handleSort('name')}
                  >
                    Food
                  </TableSortLabel>
                </TableCell>
                <TableCell>Quantity</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'category'}
                    direction={sortBy === 'category' ? sortOrder : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    Category
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortBy === 'calories'}
                    direction={sortBy === 'calories' ? sortOrder : 'asc'}
                    onClick={() => handleSort('calories')}
                  >
                    Calories
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Protein (g)</TableCell>
                <TableCell align="right">Carbs (g)</TableCell>
                <TableCell align="right">Fat (g)</TableCell>
                <TableCell align="center">Pre-Glucose</TableCell>
                <TableCell align="center">Post-Glucose</TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'date'}
                    direction={sortBy === 'date' ? sortOrder : 'asc'}
                    onClick={() => handleSort('date')}
                  >
                    Added
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAndSortedFoods.map((food) => (
                <TableRow key={food.id} hover selected={selectedFoods.has(food.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedFoods.has(food.id)}
                      onChange={() => handleSelectFood(food.id)}
                    />
                  </TableCell>
                  <TableCell component="th" scope="row">
                    <Typography variant="body2" fontWeight="medium">
                      {food.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {food.quantity} {food.unit}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={foodCategories[food.category]?.name || food.category} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                      icon={<span>{foodCategories[food.category]?.icon}</span>}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(food.calories)}
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(food.nutrients.find(n => n.name === 'Protein')?.amount || 0)}
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(food.nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0)}
                  </TableCell>
                  <TableCell align="right">
                    {Math.round(food.nutrients.find(n => n.name === 'Fat')?.amount || 0)}
                  </TableCell>
                  <TableCell align="center">
                    {food.glucoseData?.preGlucose ? (
                      <Chip 
                        label={`${food.glucoseData.preGlucose} mg/dL`}
                        size="small"
                        color={
                          food.glucoseData.preGlucose <= 100 ? 'success' :
                          food.glucoseData.preGlucose <= 125 ? 'warning' : 'error'
                        }
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {food.glucoseData?.postGlucose ? (
                      <Chip 
                        label={`${food.glucoseData.postGlucose} mg/dL`}
                        size="small"
                        color={
                          food.glucoseData.postGlucose <= 140 ? 'success' :
                          food.glucoseData.postGlucose <= 199 ? 'warning' : 'error'
                        }
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(food.dateAdded).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="More actions">
                      <IconButton 
                        size="small" 
                        onClick={(e) => handleMenuClick(e, food)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredAndSortedFoods.length} of {foods.length} items
            {searchTerm && ` (filtered by "${searchTerm}")`}
            {filterCategory !== 'all' && ` (${foodCategories[filterCategory]?.name})`}
          </Typography>
        </Box>

        {/* Action Menu */}
        <Menu
          anchorEl={menuAnchor.element}
          open={Boolean(menuAnchor.element)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={() => menuAnchor.food && handleEditClick(menuAnchor.food)}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit</ListItemText>
          </MenuItem>
          <MenuItem 
            onClick={() => menuAnchor.food && handleDeleteClick(menuAnchor.food)}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete</ListItemText>
          </MenuItem>
        </Menu>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, food: null })}
        >
          <DialogTitle>Delete Food Item</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{deleteDialog.food?.name}"? 
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, food: null })}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* Edit Food Dialog */}
        <EditFoodDialog
          open={editDialog.open}
          food={editDialog.food}
          onClose={() => setEditDialog({ open: false, food: null })}
          onSave={handleEditSave}
        />
      </CardContent>
    </Card>
  );
}