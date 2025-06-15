import React, { useState, useEffect } from 'react';
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
  Collapse,
  TextField,
  InputAdornment,
  TableSortLabel,
  Checkbox,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormGroup,
  FormControlLabel,
  ListItemText
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsIcon from '@mui/icons-material/Settings';
import { getUserGroupedFoodEntries, deleteGroupedFoodEntry } from '../services/groupedFoodDatabaseUtils';
import type { GroupedFoodEntry } from '../types/food';
import { supabase } from '../config/supabase';
import { getTimeOfDayLabel, getTimeOfDayIcon, getTimeOfDayColor } from '../utils/timeOfDay';

interface FoodHistoryProps {
  refreshTrigger?: number;
}

// Available nutrients for selection
const AVAILABLE_NUTRIENTS = [
  { key: 'total_calories', label: 'Calories', unit: 'kcal', default: true },
  { key: 'total_protein', label: 'Protein', unit: 'g', default: true },
  { key: 'total_carbs', label: 'Carbs', unit: 'g', default: true },
  { key: 'total_fat', label: 'Fat', unit: 'g', default: true },
  { key: 'total_fiber', label: 'Fiber', unit: 'g', default: false },
  { key: 'total_sugar', label: 'Sugar', unit: 'g', default: false },
  { key: 'total_sodium', label: 'Sodium', unit: 'mg', default: false },
  { key: 'total_calcium', label: 'Calcium', unit: 'mg', default: false },
  { key: 'total_iron', label: 'Iron', unit: 'mg', default: false },
  { key: 'total_vitamin_c', label: 'Vitamin C', unit: 'mg', default: false },
  { key: 'total_vitamin_d', label: 'Vitamin D', unit: 'mg', default: false },
  { key: 'total_potassium', label: 'Potassium', unit: 'mg', default: false }
];

const DEFAULT_VISIBLE_NUTRIENTS = AVAILABLE_NUTRIENTS.filter(n => n.default).map(n => n.key);

export default function FoodHistory({ refreshTrigger }: FoodHistoryProps) {
  const [groupedEntries, setGroupedEntries] = useState<GroupedFoodEntry[]>([]);
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; entry: GroupedFoodEntry | null }>({
    open: false,
    entry: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'description' | 'date' | 'calories'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // Nutrient selection state
  const [visibleNutrients, setVisibleNutrients] = useState<string[]>(DEFAULT_VISIBLE_NUTRIENTS);
  const [nutrientSettingsOpen, setNutrientSettingsOpen] = useState(false);
  
  useEffect(() => {
    loadGroupedEntries();
  }, [refreshTrigger]);

  const loadGroupedEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data: entries, error } = await getUserGroupedFoodEntries();
      if (error) {
        throw error;
      }
      // Ensure entries is always an array
      setGroupedEntries(Array.isArray(entries) ? entries : []);
    } catch (err) {
      console.error('Error loading grouped entries:', err);
      setError('Failed to load food history');
      setGroupedEntries([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (entry: GroupedFoodEntry) => {
    setDeleteDialog({ open: true, entry });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.entry) {
      try {
        const { error } = await deleteGroupedFoodEntry(deleteDialog.entry.id!);
        
        if (error) throw error;
        
        await loadGroupedEntries();
      } catch (err) {
        console.error('Error deleting entry:', err);
        setError('Failed to delete entry');
      }
    }
    setDeleteDialog({ open: false, entry: null });
  };

  const toggleRowExpansion = (entryId: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedRows(newExpanded);
  };

  const handleSort = (column: 'description' | 'date' | 'calories') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectEntry = (entryId: string) => {
    const newSelected = new Set(selectedEntries);
    if (newSelected.has(entryId)) {
      newSelected.delete(entryId);
    } else {
      newSelected.add(entryId);
    }
    setSelectedEntries(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedEntries.size === filteredAndSortedEntries.length) {
      setSelectedEntries(new Set());
    } else {
      setSelectedEntries(new Set(filteredAndSortedEntries.map(entry => entry.id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.size > 0) {
      try {
        // Delete each entry individually using our function
        const deletePromises = Array.from(selectedEntries).map(id => deleteGroupedFoodEntry(id));
        const results = await Promise.all(deletePromises);
        
        // Check if any deletions failed
        const errors = results.filter(result => result.error);
        if (errors.length > 0) {
          throw new Error(`Failed to delete ${errors.length} entries`);
        }
        
        setSelectedEntries(new Set());
        await loadGroupedEntries();
      } catch (err) {
        console.error('Error deleting entries:', err);
        setError('Failed to delete entries');
      }
    }
  };

  const handleNutrientToggle = (nutrientKey: string) => {
    setVisibleNutrients(prev => {
      if (prev.includes(nutrientKey)) {
        // Don't allow removing all nutrients
        if (prev.length <= 1) return prev;
        return prev.filter(key => key !== nutrientKey);
      } else {
        return [...prev, nutrientKey];
      }
    });
  };

  const resetToDefaults = () => {
    setVisibleNutrients(DEFAULT_VISIBLE_NUTRIENTS);
  };

  const getNutrientValue = (entry: GroupedFoodEntry, nutrientKey: string): number => {
    switch (nutrientKey) {
      case 'total_calories':
        return entry.totalCalories || 0;
      case 'total_protein':
        return entry.totalNutrients.protein || 0;
      case 'total_carbs':
        return entry.totalNutrients.carbohydrates || 0;
      case 'total_fat':
        return entry.totalNutrients.fat || 0;
      case 'total_fiber':
        return entry.totalNutrients.fiber || 0;
      case 'total_sugar':
        return entry.totalNutrients.sugar || 0;
      case 'total_sodium':
        return entry.totalNutrients.sodium || 0;
      case 'total_calcium':
        return entry.totalNutrients.calcium || 0;
      case 'total_iron':
        return entry.totalNutrients.iron || 0;
      case 'total_vitamin_c':
        return entry.totalNutrients.vitamin_c || 0;
      case 'total_vitamin_d':
        return entry.totalNutrients.vitamin_d || 0;
      case 'total_potassium':
        return entry.totalNutrients.potassium || 0;
      default:
        return 0;
    }
  };

  const formatNutrientValue = (value: number, unit: string): string => {
    if (unit === 'kcal') return Math.round(value).toString();
    if (unit === 'mg') return value < 1 ? value.toFixed(2) : Math.round(value).toString();
    return Math.round(value).toString();
  };

  // Filter and sort grouped entries
  const filteredAndSortedEntries = groupedEntries
    .filter(entry => {
      const matchesSearch = entry.combinedName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'description':
          comparison = a.combinedName.localeCompare(b.combinedName);
          break;
        case 'date':
          comparison = new Date(a.dateAdded).getTime() - new Date(b.dateAdded).getTime();
          break;
        case 'calories':
          comparison = a.totalCalories - b.totalCalories;
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            Loading food history...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="error">
            {error}
          </Typography>
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Button onClick={loadGroupedEntries} variant="outlined">
              Retry
            </Button>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (groupedEntries.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" align="center" color="text.secondary">
            No food entries yet
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
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Customize Nutrients">
              <IconButton onClick={() => setNutrientSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filters">
              <IconButton onClick={() => setShowFilters(!showFilters)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        <Collapse in={showFilters}>
          <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <TextField
              fullWidth
              placeholder="Search meal descriptions..."
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
            />
          </Box>
        </Collapse>

        {selectedEntries.size > 0 && (
          <Box sx={{ mb: 2, p: 2, bgcolor: 'primary.light', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="primary.contrastText">
                {selectedEntries.size} meal(s) selected
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
                    indeterminate={selectedEntries.size > 0 && selectedEntries.size < filteredAndSortedEntries.length}
                    checked={filteredAndSortedEntries.length > 0 && selectedEntries.size === filteredAndSortedEntries.length}
                    onChange={handleSelectAll}
                  />
                </TableCell>
                <TableCell></TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortBy === 'description'}
                    direction={sortBy === 'description' ? sortOrder : 'asc'}
                    onClick={() => handleSort('description')}
                  >
                    Meal Description
                  </TableSortLabel>
                </TableCell>
                {visibleNutrients.map(nutrientKey => {
                  const nutrient = AVAILABLE_NUTRIENTS.find(n => n.key === nutrientKey);
                  if (!nutrient) return null;
                  
                  return (
                    <TableCell key={nutrientKey} align="right">
                      <TableSortLabel
                        active={sortBy === nutrientKey}
                        direction={sortBy === nutrientKey ? sortOrder : 'asc'}
                        onClick={() => handleSort(nutrientKey as any)}
                      >
                        {nutrient.label} ({nutrient.unit})
                      </TableSortLabel>
                    </TableCell>
                  );
                })}
                <TableCell align="center">Time of Day</TableCell>
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
              {filteredAndSortedEntries.map((entry) => (
                <React.Fragment key={entry.id}>
                  <TableRow hover selected={selectedEntries.has(entry.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedEntries.has(entry.id)}
                        onChange={() => handleSelectEntry(entry.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => toggleRowExpansion(entry.id)}
                        sx={{ mr: 1 }}
                      >
                        {expandedRows.has(entry.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Typography variant="body2" fontWeight="medium">
                        {entry.combinedName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.individualItems.length} item{entry.individualItems.length !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    {visibleNutrients.map(nutrientKey => {
                      const nutrient = AVAILABLE_NUTRIENTS.find(n => n.key === nutrientKey);
                      if (!nutrient) return null;
                      
                      const value = getNutrientValue(entry, nutrientKey);
                      const isFirstNutrient = nutrientKey === visibleNutrients[0];
                      
                      return (
                        <TableCell key={nutrientKey} align="right">
                          <Typography 
                            variant="body2" 
                            fontWeight={isFirstNutrient ? "medium" : "normal"}
                          >
                            {formatNutrientValue(value, nutrient.unit)}
                          </Typography>
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      {entry.timeOfDay ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography component="span">{getTimeOfDayIcon(entry.timeOfDay)}</Typography>
                          <Chip
                            label={getTimeOfDayLabel(entry.timeOfDay)}
                            size="small"
                            sx={{
                              backgroundColor: getTimeOfDayColor(entry.timeOfDay),
                              color: 'white',
                              fontSize: '0.75rem'
                            }}
                          />
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary">-</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(entry.dateAdded).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Delete entry">
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(entry)}
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded row showing individual items */}
                  <TableRow>
                    <TableCell colSpan={visibleNutrients.length + 5} sx={{ py: 0, borderBottom: expandedRows.has(entry.id) ? 1 : 0 }}>
                      <Collapse in={expandedRows.has(entry.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>Individual Food Items:</Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Food Item</TableCell>
                                {visibleNutrients.map(nutrientKey => {
                                  const nutrient = AVAILABLE_NUTRIENTS.find(n => n.key === nutrientKey);
                                  if (!nutrient) return null;
                                  
                                  return (
                                    <TableCell key={nutrientKey} align="right">
                                      {nutrient.label} ({nutrient.unit})
                                    </TableCell>
                                  );
                                })}
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {entry.individualItems.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {item.name}
                                    </Typography>
                                  </TableCell>
                                  {visibleNutrients.map(nutrientKey => {
                                    const nutrient = AVAILABLE_NUTRIENTS.find(n => n.key === nutrientKey);
                                    if (!nutrient) return null;
                                    
                                    // Map nutrient keys to item properties
                                    const itemKey = nutrientKey.replace('total_', '');
                                    const value = (item as any)[itemKey] || 0;
                                    
                                    return (
                                      <TableCell key={nutrientKey} align="right">
                                        {formatNutrientValue(value, nutrient.unit)}
                                      </TableCell>
                                    );
                                  })}
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box mt={2}>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredAndSortedEntries.length} of {groupedEntries.length} meals
            {searchTerm && ` (filtered by "${searchTerm}")`}
          </Typography>
        </Box>


        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialog.open}
          onClose={() => setDeleteDialog({ open: false, entry: null })}
        >
          <DialogTitle>Delete Meal Entry</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete "{deleteDialog.entry?.combinedName}"? 
              This will remove all {deleteDialog.entry?.individualItems.length || 0} food items in this meal.
              This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button 
              onClick={() => setDeleteDialog({ open: false, entry: null })}
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

        {/* Nutrient Settings Dialog */}
        <Dialog
          open={nutrientSettingsOpen}
          onClose={() => setNutrientSettingsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Customize Visible Nutrients
              <Chip 
                label={`${visibleNutrients.length} selected`} 
                size="small" 
                color="primary"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Choose which nutrients to display in the food history table. The 4 main nutrients (Calories, Protein, Carbs, Fat) are shown by default.
            </Typography>
            
            <FormGroup>
              {AVAILABLE_NUTRIENTS.map((nutrient) => (
                <FormControlLabel
                  key={nutrient.key}
                  control={
                    <Checkbox
                      checked={visibleNutrients.includes(nutrient.key)}
                      onChange={() => handleNutrientToggle(nutrient.key)}
                      disabled={nutrient.default && visibleNutrients.length <= 1}
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <span>{nutrient.label}</span>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Chip 
                          label={nutrient.unit} 
                          size="small" 
                          variant="outlined"
                        />
                        {nutrient.default && (
                          <Chip 
                            label="default" 
                            size="small" 
                            color="primary"
                          />
                        )}
                      </Box>
                    </Box>
                  }
                  sx={{ 
                    mb: 1,
                    '& .MuiFormControlLabel-label': { width: '100%' },
                    opacity: nutrient.default && visibleNutrients.length <= 1 ? 0.5 : 1
                  }}
                />
              ))}
            </FormGroup>
          </DialogContent>
          <DialogActions>
            <Button onClick={resetToDefaults}>
              Reset to Defaults
            </Button>
            <Button onClick={() => setNutrientSettingsOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => setNutrientSettingsOpen(false)}
              variant="contained"
            >
              Apply Changes
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}