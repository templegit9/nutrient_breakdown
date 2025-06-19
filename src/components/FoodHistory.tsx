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
  FormGroup,
  FormControlLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import SettingsIcon from '@mui/icons-material/Settings';
import MedicationIcon from '@mui/icons-material/Medication';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import type { GroupedFoodEntry } from '../types/food';
import { SupplementEntry } from '../types/supplements';
import { getTimeOfDayLabel, getTimeOfDayIcon, getTimeOfDayColor } from '../utils/timeOfDay';
import { DatabaseService } from '../services/database';
import { useGroupedFoodData } from '../hooks/useGroupedFoodData';
import FloatingAssistant from './FloatingAssistant';

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
  // Use global hook instead of local state for food entries
  const { groupedEntries, loading, error, deleteEntry, refreshEntries } = useGroupedFoodData();
  
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; entry: any | null }>({
    open: false,
    entry: null
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'description' | 'date' | 'calories'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  
  // View mode: 'foods', 'supplements', or 'all'
  const [viewMode, setViewMode] = useState<'foods' | 'supplements' | 'all'>('all');
  
  // Supplement state
  const [supplementEntries, setSupplementEntries] = useState<SupplementEntry[]>([]);
  
  // Nutrient selection state
  const [visibleNutrients, setVisibleNutrients] = useState<string[]>(DEFAULT_VISIBLE_NUTRIENTS);
  const [nutrientSettingsOpen, setNutrientSettingsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  
  useEffect(() => {
    loadUserPreferences();
    if (refreshTrigger) {
      refreshEntries(); // Use global refresh when refreshTrigger changes
    }
  }, [refreshTrigger, refreshEntries]);

  const loadSupplementData = async () => {
    try {
      // Get current authenticated user
      const currentUser = await DatabaseService.getCurrentUser();
      if (!currentUser) {
        console.log('No authenticated user found');
        return;
      }
      
      // Get last 30 days of supplement entries
      const dateFrom = new Date();
      dateFrom.setDate(dateFrom.getDate() - 30);
      
      const entries = await DatabaseService.getSupplementEntries(currentUser.id, {
        date_from: dateFrom,
        date_to: new Date()
      });
      
      setSupplementEntries(entries);
    } catch (error) {
      console.error('Error loading supplement data:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      setUserProfile(profile);
      
      if (profile?.preferredNutrients && profile.preferredNutrients.length > 0) {
        // Map stored nutrient names to available nutrients
        const validNutrients = profile.preferredNutrients.filter(nutrient => 
          AVAILABLE_NUTRIENTS.find(n => n.key === nutrient)
        );
        if (validNutrients.length > 0) {
          setVisibleNutrients(validNutrients);
        }
      }

      // Load supplement data
      loadSupplementData();
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const saveNutrientPreferences = async (nutrients: string[]) => {
    try {
      if (userProfile) {
        const updatedProfile = {
          ...userProfile,
          preferredNutrients: nutrients
        };
        const { id, ...profileWithoutId } = updatedProfile;
        await DatabaseService.saveUserProfile(profileWithoutId);
        setUserProfile(updatedProfile);
      }
    } catch (error) {
      console.error('Error saving nutrient preferences:', error);
    }
  };

  const handleDeleteClick = (entry: any) => {
    setDeleteDialog({ open: true, entry });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.entry) {
      try {
        const entry = deleteDialog.entry;
        
        if (entry.type === 'supplement') {
          // Delete supplement entry using DatabaseService
          await DatabaseService.deleteSupplementEntry(entry.id);
          // Remove from local state
          setSupplementEntries(prev => prev.filter(e => e.id !== entry.id));
        } else {
          // Delete food entry using global hook function
          await deleteEntry(entry.id!);
        }
      } catch (err) {
        console.error('Error deleting entry:', err);
        // Could add user notification here
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
      const validIds = filteredAndSortedEntries
        .map(entry => entry.id)
        .filter((id): id is string => id !== undefined);
      setSelectedEntries(new Set(validIds));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEntries.size > 0) {
      try {
        // Separate food and supplement entries for deletion
        const entriesToDelete = Array.from(selectedEntries).map(id => 
          filteredAndSortedEntries.find(entry => entry.id === id)
        ).filter(entry => entry !== undefined);
        
        const foodEntries = entriesToDelete.filter(entry => entry.type === 'food');
        const supplementEntries = entriesToDelete.filter(entry => entry.type === 'supplement');
        
        // Delete food entries using global hook function
        const foodDeletePromises = foodEntries.map(entry => deleteEntry(entry.id!));
        
        // Delete supplement entries using DatabaseService
        const supplementDeletePromises = supplementEntries.map(entry => 
          DatabaseService.deleteSupplementEntry(entry.id)
        );
        
        await Promise.all([...foodDeletePromises, ...supplementDeletePromises]);
        
        // Update local supplement state
        if (supplementEntries.length > 0) {
          const deletedSupplementIds = supplementEntries.map(e => e.id);
          setSupplementEntries(prev => prev.filter(e => !deletedSupplementIds.includes(e.id)));
        }
        
        setSelectedEntries(new Set());
      } catch (err) {
        console.error('Error deleting entries:', err);
      }
    }
  };

  const handleNutrientToggle = (nutrientKey: string) => {
    setVisibleNutrients(prev => {
      let newNutrients: string[];
      if (prev.includes(nutrientKey)) {
        // Don't allow removing all nutrients
        if (prev.length <= 1) return prev;
        newNutrients = prev.filter(key => key !== nutrientKey);
      } else {
        newNutrients = [...prev, nutrientKey];
      }
      
      // Save preferences
      saveNutrientPreferences(newNutrients);
      return newNutrients;
    });
  };

  const selectAllNutrients = () => {
    const allNutrients = AVAILABLE_NUTRIENTS.map(n => n.key);
    setVisibleNutrients(allNutrients);
    saveNutrientPreferences(allNutrients);
  };

  const resetToDefaults = () => {
    setVisibleNutrients(DEFAULT_VISIBLE_NUTRIENTS);
    saveNutrientPreferences(DEFAULT_VISIBLE_NUTRIENTS);
  };

  const getNutrientValue = (entry: any, nutrientKey: string): number => {
    // Handle supplements which don't have nutrition data
    if (entry.type === 'supplement') {
      return 0; // Supplements don't contribute to food nutrition metrics
    }
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

  // Create combined entries based on view mode
  const allEntries = viewMode === 'foods' ? groupedEntries.map(entry => ({ ...entry, type: 'food' as const })) :
                     viewMode === 'supplements' ? supplementEntries.map(entry => ({ 
                       ...entry, 
                       type: 'supplement' as const,
                       combinedName: entry.supplement?.name || 'Unknown Supplement',
                       dateAdded: new Date(entry.time_taken),
                       totalCalories: 0 // Supplements don't have calories in food context
                     })) :
                     [
                       ...groupedEntries.map(entry => ({ ...entry, type: 'food' as const })),
                       ...supplementEntries.map(entry => ({ 
                         ...entry, 
                         type: 'supplement' as const,
                         combinedName: entry.supplement?.name || 'Unknown Supplement',
                         dateAdded: new Date(entry.time_taken),
                         totalCalories: 0
                       }))
                     ];

  // Filter and sort entries
  const filteredAndSortedEntries = allEntries
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
            <Button onClick={refreshEntries} variant="outlined">
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

        {/* View Mode Toggle */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newValue) => newValue && setViewMode(newValue)}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="all" aria-label="all entries">
              All
            </ToggleButton>
            <ToggleButton value="foods" aria-label="food entries">
              Foods
            </ToggleButton>
            <ToggleButton value="supplements" aria-label="supplement entries">
              <MedicationIcon sx={{ mr: 1 }} />
              Supplements
            </ToggleButton>
          </ToggleButtonGroup>
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
                <React.Fragment key={entry.id || 'no-id'}>
                  <TableRow hover selected={entry.id ? selectedEntries.has(entry.id) : false}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={entry.id ? selectedEntries.has(entry.id) : false}
                        onChange={() => entry.id && handleSelectEntry(entry.id)}
                        disabled={!entry.id}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton 
                        size="small" 
                        onClick={() => entry.id && toggleRowExpansion(entry.id)}
                        sx={{ mr: 1 }}
                        disabled={!entry.id}
                      >
                        {entry.id && expandedRows.has(entry.id) ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {(entry as any).type === 'supplement' && <MedicationIcon color="primary" />}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {entry.combinedName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {(entry as any).type === 'supplement' 
                              ? `${(entry as any).amount_taken} ${(entry as any).unit_taken}`
                              : `${(entry as any).individualItems?.length || 0} item${(entry as any).individualItems?.length !== 1 ? 's' : ''}`
                            }
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    {visibleNutrients.map(nutrientKey => {
                      const nutrient = AVAILABLE_NUTRIENTS.find(n => n.key === nutrientKey);
                      if (!nutrient) return null;
                      
                      // Supplements don't have nutrition data, show N/A
                      if ((entry as any).type === 'supplement') {
                        return (
                          <TableCell key={nutrientKey} align="right">
                            <Typography variant="body2" color="text.secondary">
                              N/A
                            </Typography>
                          </TableCell>
                        );
                      }
                      
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
                      {(() => {
                        const timeOfDay = (entry as any).type === 'supplement' 
                          ? (entry as any).time_of_day 
                          : (entry as any).timeOfDay;
                        
                        return timeOfDay ? (
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                            <Typography component="span">{getTimeOfDayIcon(timeOfDay)}</Typography>
                            <Chip
                              label={getTimeOfDayLabel(timeOfDay)}
                              size="small"
                              sx={{
                                backgroundColor: getTimeOfDayColor(timeOfDay),
                                color: 'white',
                                fontSize: '0.75rem'
                              }}
                            />
                          </Box>
                        ) : (
                          <Typography variant="body2" color="text.secondary">-</Typography>
                        );
                      })()}
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
                  
                  {/* Expanded row showing individual items or supplement details */}
                  <TableRow>
                    <TableCell colSpan={visibleNutrients.length + 5} sx={{ py: 0, borderBottom: entry.id && expandedRows.has(entry.id) ? 1 : 0 }}>
                      <Collapse in={entry.id ? expandedRows.has(entry.id) : false} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                          {(entry as any).type === 'supplement' ? (
                            <>
                              <Typography variant="subtitle2" sx={{ mb: 2 }}>Supplement Details:</Typography>
                              <Box sx={{ display: 'grid', gap: 1, gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                                <Typography variant="body2"><strong>Brand:</strong> {(entry as any).supplement?.brand || 'N/A'}</Typography>
                                <Typography variant="body2"><strong>Type:</strong> {(entry as any).supplement?.type?.replace('_', ' ') || 'N/A'}</Typography>
                                <Typography variant="body2"><strong>Form:</strong> {(entry as any).supplement?.form || 'N/A'}</Typography>
                                <Typography variant="body2"><strong>Time of Day:</strong> {(entry as any).time_of_day?.replace('_', ' ') || 'N/A'}</Typography>
                                <Typography variant="body2"><strong>With Food:</strong> {(entry as any).taken_with_food ? 'Yes' : 'No'}</Typography>
                                {(entry as any).meal_context && (
                                  <Typography variant="body2"><strong>Meal:</strong> {(entry as any).meal_context}</Typography>
                                )}
                                {(entry as any).effectiveness_rating && (
                                  <Typography variant="body2"><strong>Effectiveness:</strong> {(entry as any).effectiveness_rating}/5</Typography>
                                )}
                              </Box>
                              {(entry as any).notes && (
                                <Box sx={{ mt: 2 }}>
                                  <Typography variant="body2"><strong>Notes:</strong> {(entry as any).notes}</Typography>
                                </Box>
                              )}
                              {(entry as any).side_effects && (
                                <Box sx={{ mt: 1 }}>
                                  <Typography variant="body2" color="warning.main"><strong>Side Effects:</strong> {(entry as any).side_effects}</Typography>
                                </Box>
                              )}
                            </>
                          ) : (
                            <>
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
                              {(entry as any).individualItems?.map((item: any, index: number) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {item.name}
                                    </Typography>
                                  </TableCell>
                                  {visibleNutrients.map(nutrientKey => {
                                    const nutrient = AVAILABLE_NUTRIENTS.find(n => n.key === nutrientKey);
                                    if (!nutrient) return null;
                                    
                                    // Map nutrient keys to item properties with correct mapping
                                    let value: number;
                                    
                                    switch (nutrientKey) {
                                      case 'total_calories':
                                        value = item.calories || 0;
                                        break;
                                      case 'total_protein':
                                        value = item.protein || 0;
                                        break;
                                      case 'total_carbs':
                                        value = item.carbohydrates || 0; // Note: carbohydrates, not carbs
                                        break;
                                      case 'total_fat':
                                        value = item.fat || 0;
                                        break;
                                      case 'total_fiber':
                                        value = item.fiber || 0;
                                        break;
                                      case 'total_sugar':
                                        value = item.sugar || 0;
                                        break;
                                      case 'total_sodium':
                                        value = item.sodium || 0;
                                        break;
                                      case 'total_calcium':
                                        value = item.calcium || 0;
                                        break;
                                      case 'total_iron':
                                        value = item.iron || 0;
                                        break;
                                      case 'total_vitamin_c':
                                        value = item.vitamin_c || 0;
                                        break;
                                      case 'total_vitamin_d':
                                        value = item.vitamin_d || 0;
                                        break;
                                      case 'total_potassium':
                                        value = item.potassium || 0;
                                        break;
                                      default:
                                        value = 0;
                                    }
                                    
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
                            </>
                          )}
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
            <Button onClick={selectAllNutrients}>
              Select All
            </Button>
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

      {/* Floating AI Assistant */}
      <FloatingAssistant
        contextData={{
          totalEntries: groupedEntries.length,
          totalSupplements: supplementEntries.length,
          filteredEntries: filteredAndSortedEntries.length,
          viewMode: viewMode,
          recentEntries: filteredAndSortedEntries.slice(0, 10).map(entry => ({
            name: entry.combinedName,
            type: (entry as any).type,
            calories: entry.totalCalories,
            date: entry.dateAdded,
            timeOfDay: (entry as any).type === 'supplement' ? (entry as any).time_of_day : (entry as any).timeOfDay,
            mealType: (entry as any).type === 'supplement' ? (entry as any).meal_context : (entry as any).mealType,
            amount: (entry as any).type === 'supplement' ? `${(entry as any).amount_taken} ${(entry as any).unit_taken}` : undefined
          })),
          searchTerm: searchTerm,
          sortBy: sortBy,
          sortOrder: sortOrder,
          selectedEntriesCount: selectedEntries.size,
          visibleNutrients: visibleNutrients,
          supplementData: {
            totalSupplements: supplementEntries.length,
            recentSupplements: supplementEntries.slice(0, 5).map(entry => ({
              name: entry.supplement?.name || 'Unknown',
              amount: `${entry.amount_taken} ${entry.unit_taken}`,
              date: entry.time_taken,
              effectiveness: entry.effectiveness_rating
            }))
          }
        }}
        contextType="food_history"
      />
    </Card>
  );
}