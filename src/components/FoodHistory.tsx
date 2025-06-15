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
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { GroupedFoodDatabase, GroupedFoodEntry } from '../services/groupedFoodDatabase';
import { supabase } from '../config/supabase';
import { getTimeOfDayLabel, getTimeOfDayIcon, getTimeOfDayColor } from '../utils/timeOfDay';

interface FoodHistoryProps {
  refreshTrigger?: number;
}

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
  
  const groupedFoodDatabase = new GroupedFoodDatabase();

  useEffect(() => {
    loadGroupedEntries();
  }, [refreshTrigger]);

  const loadGroupedEntries = async () => {
    try {
      setLoading(true);
      setError(null);
      const entries = await groupedFoodDatabase.getUserGroupedFoodEntries();
      setGroupedEntries(entries);
    } catch (err) {
      console.error('Error loading grouped entries:', err);
      setError('Failed to load food history');
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
        const { error } = await supabase
          .from('grouped_food_entries')
          .delete()
          .eq('id', deleteDialog.entry.id);
        
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
        const { error } = await supabase
          .from('grouped_food_entries')
          .delete()
          .in('id', Array.from(selectedEntries));
        
        if (error) throw error;
        
        setSelectedEntries(new Set());
        await loadGroupedEntries();
      } catch (err) {
        console.error('Error deleting entries:', err);
        setError('Failed to delete entries');
      }
    }
  };

  // Filter and sort grouped entries
  const filteredAndSortedEntries = groupedEntries
    .filter(entry => {
      const matchesSearch = entry.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'description':
          comparison = a.description.localeCompare(b.description);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'calories':
          comparison = a.total_calories - b.total_calories;
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
          <IconButton onClick={() => setShowFilters(!showFilters)}>
            <FilterListIcon />
          </IconButton>
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
                <TableCell align="right">
                  <TableSortLabel
                    active={sortBy === 'calories'}
                    direction={sortBy === 'calories' ? sortOrder : 'asc'}
                    onClick={() => handleSort('calories')}
                  >
                    Total Calories
                  </TableSortLabel>
                </TableCell>
                <TableCell align="right">Total Protein (g)</TableCell>
                <TableCell align="right">Total Carbs (g)</TableCell>
                <TableCell align="right">Total Fat (g)</TableCell>
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
                        {entry.description}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {entry.individual_items.length} item{entry.individual_items.length !== 1 ? 's' : ''}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2" fontWeight="medium">
                        {Math.round(entry.total_calories)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {Math.round(entry.total_protein)}
                    </TableCell>
                    <TableCell align="right">
                      {Math.round(entry.total_carbs)}
                    </TableCell>
                    <TableCell align="right">
                      {Math.round(entry.total_fat)}
                    </TableCell>
                    <TableCell align="center">
                      {entry.time_of_day ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                          <Typography component="span">{getTimeOfDayIcon(entry.time_of_day)}</Typography>
                          <Chip
                            label={getTimeOfDayLabel(entry.time_of_day)}
                            size="small"
                            sx={{
                              backgroundColor: getTimeOfDayColor(entry.time_of_day),
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
                        {new Date(entry.created_at).toLocaleDateString()}
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
                    <TableCell colSpan={10} sx={{ py: 0, borderBottom: expandedRows.has(entry.id) ? 1 : 0 }}>
                      <Collapse in={expandedRows.has(entry.id)} timeout="auto" unmountOnExit>
                        <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="subtitle2" sx={{ mb: 2 }}>Individual Food Items:</Typography>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Food Item</TableCell>
                                <TableCell align="right">Calories</TableCell>
                                <TableCell align="right">Protein (g)</TableCell>
                                <TableCell align="right">Carbs (g)</TableCell>
                                <TableCell align="right">Fat (g)</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {entry.individual_items.map((item, index) => (
                                <TableRow key={index}>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {item.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    {Math.round(item.calories)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {Math.round(item.protein)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {Math.round(item.carbs)}
                                  </TableCell>
                                  <TableCell align="right">
                                    {Math.round(item.fat)}
                                  </TableCell>
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
              Are you sure you want to delete "{deleteDialog.entry?.description}"? 
              This will remove all {deleteDialog.entry?.individual_items.length || 0} food items in this meal.
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
      </CardContent>
    </Card>
  );
}