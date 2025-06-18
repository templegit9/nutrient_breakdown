import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  Chip,
  Alert,
  Grid,
  Switch,
  FormControlLabel,
  Rating,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Add as AddIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon,
  Medication as MedicationIcon,
  Search as SearchIcon,
  History as HistoryIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
// Note: Using TextField for date/time input to avoid additional dependencies
import { 
  Supplement, 
  CreateSupplementEntryData, 
  SupplementEntry,
  SupplementSearchFilters 
} from '../types/supplements';
import { DatabaseService } from '../services/database';

interface SupplementEntryProps {
  onSupplementAdded?: (entry: SupplementEntry) => void;
  onClose?: () => void;
  onSave?: () => void;
  userId: string;
}

const SupplementEntry: React.FC<SupplementEntryProps> = ({
  onSupplementAdded,
  onClose,
  onSave,
  userId
}) => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [selectedSupplement, setSelectedSupplement] = useState<Supplement | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [recentEntries, setRecentEntries] = useState<SupplementEntry[]>([]);
  const [showAddCustom, setShowAddCustom] = useState(false);

  // Form state
  const [formData, setFormData] = useState<CreateSupplementEntryData>({
    supplement_id: '',
    amount_taken: 1,
    unit_taken: '',
    time_taken: new Date(),
    time_of_day: 'morning',
    taken_with_food: false,
    meal_context: 'none',
    notes: '',
    side_effects: '',
    effectiveness_rating: undefined
  });

  // Validation and UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    loadSupplements();
    loadRecentEntries();
  }, []);

  const loadSupplements = async () => {
    setSearchLoading(true);
    try {
      // This would be implemented in DatabaseService
      const data = await DatabaseService.searchSupplements({});
      setSupplements(data);
    } catch (error) {
      console.error('Error loading supplements:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const loadRecentEntries = async () => {
    try {
      const entries = await DatabaseService.getRecentSupplementEntries(userId, 5);
      setRecentEntries(entries);
    } catch (error) {
      console.error('Error loading recent entries:', error);
    }
  };

  const handleSupplementSelect = (supplement: Supplement | null) => {
    setSelectedSupplement(supplement);
    if (supplement) {
      setFormData(prev => ({
        ...prev,
        supplement_id: supplement.id,
        unit_taken: supplement.serving_unit,
        amount_taken: supplement.serving_size
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedSupplement) {
      newErrors.supplement = 'Please select a supplement';
    }

    if (!formData.amount_taken || formData.amount_taken <= 0) {
      newErrors.amount_taken = 'Amount must be greater than 0';
    }

    if (!formData.unit_taken.trim()) {
      newErrors.unit_taken = 'Unit is required';
    }

    // Check for overdose warnings
    if (selectedSupplement?.max_daily_dose && formData.amount_taken > selectedSupplement.max_daily_dose) {
      newErrors.amount_taken = `Amount exceeds maximum daily dose of ${selectedSupplement.max_daily_dose} ${selectedSupplement.max_daily_unit}`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setErrors({});
    setSuccess('');

    try {
      const entry = await DatabaseService.createSupplementEntry(formData);
      setSuccess('Supplement entry logged successfully!');
      
      // Reset form
      setFormData({
        supplement_id: '',
        amount_taken: 1,
        unit_taken: '',
        time_taken: new Date(),
        time_of_day: 'morning',
        taken_with_food: false,
        meal_context: 'none',
        notes: '',
        side_effects: '',
        effectiveness_rating: undefined
      });
      setSelectedSupplement(null);

      // Reload recent entries
      loadRecentEntries();

      // Notify parent component
      if (onSupplementAdded) {
        onSupplementAdded(entry);
      }
      
      if (onSave) {
        onSave();
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);

    } catch (error) {
      console.error('Error creating supplement entry:', error);
      setErrors({ submit: 'Failed to log supplement entry. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = async (supplement: Supplement) => {
    const quickEntry: CreateSupplementEntryData = {
      supplement_id: supplement.id,
      amount_taken: supplement.serving_size,
      unit_taken: supplement.serving_unit,
      time_taken: new Date(),
      time_of_day: 'morning',
      taken_with_food: false,
      meal_context: 'none'
    };

    try {
      const entry = await DatabaseService.createSupplementEntry(quickEntry);
      setSuccess(`${supplement.name} logged successfully!`);
      loadRecentEntries();
      if (onSupplementAdded) {
        onSupplementAdded(entry);
      }
      if (onSave) {
        onSave();
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      console.error('Error with quick add:', error);
      setErrors({ submit: 'Failed to log supplement. Please try again.' });
    }
  };

  return (
    <Box maxWidth="lg" sx={{ mx: 'auto', p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h4" component="h1" sx={{ display: 'flex', alignItems: 'center' }}>
            <MedicationIcon sx={{ mr: 2 }} />
            Log Supplements & Medications
          </Typography>
          {onClose && (
            <IconButton onClick={onClose} size="large">
              <CloseIcon />
            </IconButton>
          )}
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {errors.submit && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.submit}
          </Alert>
        )}

        <Grid container spacing={3}>
          {/* Main Entry Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Add Supplement/Medication
                </Typography>

                {/* Supplement Selection */}
                <Box sx={{ mb: 3 }}>
                  <Autocomplete
                    options={supplements}
                    getOptionLabel={(option) => `${option.name} ${option.brand ? `(${option.brand})` : ''}`}
                    renderOption={(props, option) => (
                      <Box component="li" {...props}>
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                          <MedicationIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body1">{option.name}</Typography>
                            {option.brand && (
                              <Typography variant="caption" color="text.secondary">
                                {option.brand} • {option.serving_size} {option.serving_unit}
                              </Typography>
                            )}
                          </Box>
                          <Chip
                            label={option.type.replace('_', ' ')}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    )}
                    value={selectedSupplement}
                    onChange={(_, value) => handleSupplementSelect(value)}
                    loading={searchLoading}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search supplements/medications"
                        placeholder="Type to search..."
                        error={!!errors.supplement}
                        helperText={errors.supplement}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              {searchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                              {params.InputProps.endAdornment}
                            </>
                          ),
                        }}
                      />
                    )}
                  />

                  <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setShowAddCustom(true)}
                      startIcon={<AddIcon />}
                    >
                      Add Custom
                    </Button>
                  </Box>
                </Box>

                {/* Dosage Information */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Amount Taken"
                      type="number"
                      value={formData.amount_taken}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount_taken: parseFloat(e.target.value) || 0 }))}
                      error={!!errors.amount_taken}
                      helperText={errors.amount_taken}
                      InputProps={{ inputProps: { min: 0, step: 0.1 } }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      label="Unit"
                      value={formData.unit_taken}
                      onChange={(e) => setFormData(prev => ({ ...prev, unit_taken: e.target.value }))}
                      error={!!errors.unit_taken}
                      helperText={errors.unit_taken}
                      placeholder="mg, mcg, tablets, etc."
                    />
                  </Grid>
                </Grid>

                {/* Timing Information */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Time Taken"
                      type="datetime-local"
                      value={formData.time_taken ? formData.time_taken.toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, time_taken: new Date(e.target.value) }))}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Time of Day</InputLabel>
                      <Select
                        value={formData.time_of_day}
                        onChange={(e) => setFormData(prev => ({ ...prev, time_of_day: e.target.value as any }))}
                        label="Time of Day"
                      >
                        <MenuItem value="morning">Morning</MenuItem>
                        <MenuItem value="afternoon">Afternoon</MenuItem>
                        <MenuItem value="evening">Evening</MenuItem>
                        <MenuItem value="night">Night</MenuItem>
                        <MenuItem value="with_meal">With Meal</MenuItem>
                        <MenuItem value="empty_stomach">Empty Stomach</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                {/* Context Information */}
                <Box sx={{ mb: 3 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.taken_with_food}
                        onChange={(e) => setFormData(prev => ({ ...prev, taken_with_food: e.target.checked }))}
                      />
                    }
                    label="Taken with food"
                  />

                  {formData.taken_with_food && (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                      <InputLabel>Meal Context</InputLabel>
                      <Select
                        value={formData.meal_context}
                        onChange={(e) => setFormData(prev => ({ ...prev, meal_context: e.target.value as any }))}
                        label="Meal Context"
                      >
                        <MenuItem value="breakfast">Breakfast</MenuItem>
                        <MenuItem value="lunch">Lunch</MenuItem>
                        <MenuItem value="dinner">Dinner</MenuItem>
                        <MenuItem value="snack">Snack</MenuItem>
                        <MenuItem value="none">None</MenuItem>
                      </Select>
                    </FormControl>
                  )}
                </Box>

                {/* Notes and Feedback */}
                <Box sx={{ mb: 3 }}>
                  <TextField
                    fullWidth
                    label="Notes (optional)"
                    multiline
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    fullWidth
                    label="Side Effects (optional)"
                    multiline
                    rows={2}
                    value={formData.side_effects}
                    onChange={(e) => setFormData(prev => ({ ...prev, side_effects: e.target.value }))}
                    placeholder="Report any side effects..."
                    sx={{ mb: 2 }}
                  />

                  <Box>
                    <Typography component="legend" variant="body2" gutterBottom>
                      Effectiveness Rating (optional)
                    </Typography>
                    <Rating
                      value={formData.effectiveness_rating || 0}
                      onChange={(_, value) => setFormData(prev => ({ ...prev, effectiveness_rating: value || undefined }))}
                      size="large"
                    />
                  </Box>
                </Box>

                {/* Safety Warnings */}
                {selectedSupplement && (selectedSupplement.warnings.length > 0 || selectedSupplement.drug_interactions.length > 0) && (
                  <Alert severity="warning" sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Important Safety Information
                    </Typography>
                    {selectedSupplement.warnings.length > 0 && (
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="body2" fontWeight="medium">Warnings:</Typography>
                        <ul>
                          {selectedSupplement.warnings.map((warning, index) => (
                            <li key={index}>
                              <Typography variant="body2">{warning}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                    {selectedSupplement.drug_interactions.length > 0 && (
                      <Box>
                        <Typography variant="body2" fontWeight="medium">Drug Interactions:</Typography>
                        <ul>
                          {selectedSupplement.drug_interactions.map((interaction, index) => (
                            <li key={index}>
                              <Typography variant="body2">{interaction}</Typography>
                            </li>
                          ))}
                        </ul>
                      </Box>
                    )}
                  </Alert>
                )}

                {/* Submit Button */}
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleSubmit}
                  disabled={loading || !selectedSupplement}
                  startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                  fullWidth
                >
                  {loading ? 'Logging...' : 'Log Supplement'}
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Sidebar - Recent Entries & Quick Actions */}
          <Grid item xs={12} md={4}>
            {/* Recent Entries */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  <HistoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Recent Entries
                </Typography>
                {recentEntries.length > 0 ? (
                  <Box>
                    {recentEntries.map((entry, index) => (
                      <Box key={entry.id}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {entry.supplement?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {entry.amount_taken} {entry.unit_taken} • {new Date(entry.time_taken).toLocaleString()}
                            </Typography>
                          </Box>
                          {entry.supplement && (
                            <IconButton
                              size="small"
                              onClick={() => handleQuickAdd(entry.supplement!)}
                              title="Quick add same supplement"
                            >
                              <AddIcon />
                            </IconButton>
                          )}
                        </Box>
                        {index < recentEntries.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent entries
                  </Typography>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Quick Actions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Button
                    variant="outlined"
                    startIcon={<ScheduleIcon />}
                    onClick={() => {/* Navigate to schedules */}}
                  >
                    Manage Schedules
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<SearchIcon />}
                    onClick={() => {/* Navigate to supplement database */}}
                  >
                    Browse Supplements
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={() => setShowAddCustom(true)}
                  >
                    Add Custom Supplement
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Add Custom Supplement Dialog */}
        <Dialog
          open={showAddCustom}
          onClose={() => setShowAddCustom(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Add Custom Supplement</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Can't find your supplement? Add it to your personal database.
            </Typography>
            {/* This would contain a form for adding custom supplements */}
            <Alert severity="info">
              Custom supplement form would be implemented here
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAddCustom(false)}>Cancel</Button>
            <Button variant="contained">Add Supplement</Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};

export default SupplementEntry;