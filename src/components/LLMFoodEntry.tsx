import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Restaurant as FoodIcon,
  SmartToy as AIIcon,
  Check as CheckIcon,
  Download as DownloadIcon,
  Medication as SupplementIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { llmFoodBrain } from '../services/llmFoodBrain';
import type { GroupedFoodEntry } from '../types/food';
import { saveGroupedFoodEntry } from '../services/groupedFoodDatabaseUtils';
import { parseConversationalInput } from '../utils/conversationalParser';
import SupplementEntry from './SupplementEntry';
import { DatabaseService } from '../services/database';
import { UserProfile } from '../types';

// Debug logs removed for production - component loaded successfully

interface LLMFoodEntryProps {
  onFoodAdded: (entry: GroupedFoodEntry) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`intake-tabpanel-${index}`}
      aria-labelledby={`intake-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 0 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function LLMFoodEntry({ onFoodAdded }: LLMFoodEntryProps) {
  // Debug logs removed for production

  // Tab management
  const [tabValue, setTabValue] = useState(0);

  // Food entry states
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewEntry, setPreviewEntry] = useState<GroupedFoodEntry | null>(null);
  const [csvData, setCsvData] = useState<string>('');

  // Supplement schedule states
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [userSchedules, setUserSchedules] = useState<any[]>([]);

  // User profile and health conditions
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) {
      setError('Please enter what you ate');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    setPreviewEntry(null);

    try {
      // Extract timeOfDay from the input using conversational parser
      const conversationalResult = await parseConversationalInput(input.trim());
      const timeOfDay = conversationalResult.timeOfDay;

      console.log('Extracted timeOfDay from input:', timeOfDay);

      // Get user's health conditions for medical context
      const healthConditions = userProfile?.healthConditions || [];
      console.log('User health conditions for LLM:', healthConditions);

      // Pass the extracted timeOfDay and health conditions to the LLM Food Brain
      const result = await llmFoodBrain.processFoodInput(input.trim(), timeOfDay, healthConditions);

      if (result.success && result.groupedEntry) {
        setPreviewEntry(result.groupedEntry);
        setCsvData(result.csvData || '');
        setSuccess('Food analyzed successfully! Review and confirm to add to your log.');
      } else {
        setError(result.error || 'Failed to analyze food input');
      }
    } catch (err) {
      console.error('Food analysis error:', err);
      setError('An unexpected error occurred while analyzing your food');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    console.log('=== HANDLE CONFIRM CALLED ===');

    if (!previewEntry) {
      console.log('No preview entry, returning');
      return;
    }

    console.log('Setting loading state...');
    setLoading(true);
    setError('');

    try {
      console.log('=== INSIDE TRY BLOCK ===');
      console.log('previewEntry:', previewEntry);

      console.log('About to call saveGroupedFoodEntry...');
      const { data, error: dbError } = await saveGroupedFoodEntry(previewEntry);
      console.log('Database save completed:', { data, dbError });

      if (dbError) {
        setError('Failed to save food entry to database');
        console.error('Database error:', dbError);
      } else {
        console.log('Success! Setting success message...');
        setSuccess('Food entry saved successfully!');

        console.log('Calling onFoodAdded callback...');

        try {
          console.log('Step 1: About to check onFoodAdded');
          const callbackType = typeof onFoodAdded;
          console.log('Step 2: onFoodAdded type is:', callbackType);

          if (callbackType === 'function') {
            console.log('Step 3: onFoodAdded is a function, calling it...');
            onFoodAdded(previewEntry);
            console.log('Step 4: onFoodAdded called successfully');
          } else {
            console.log('Step 3: onFoodAdded is NOT a function, it is:', callbackType);
            throw new Error(`onFoodAdded is not a function, it's a ${callbackType}`);
          }
        } catch (callbackError) {
          console.error('Error in callback section:', callbackError);
          throw callbackError;
        }

        console.log('Resetting form...');

        try {
          console.log('Form reset step 1: setInput');
          setInput('');

          console.log('Form reset step 2: setPreviewEntry');
          setPreviewEntry(null);

          console.log('Form reset step 3: setCsvData');
          setCsvData('');

          console.log('Form reset step 4: setTimeout');
          setTimeout(() => {
            console.log('Timeout callback executing...');
            setSuccess('');
            console.log('Timeout callback completed');
          }, 3000);

          console.log('Form reset completed successfully');
        } catch (resetError) {
          console.error('Error during form reset:', resetError);
          throw resetError;
        }
      }
    } catch (err) {
      console.error('=== CATCH BLOCK ===');
      console.error('Save error:', err);
      console.error('Error stack:', err?.stack);
      console.error('Error name:', err?.name);
      console.error('Error message:', err?.message);
      setError('Failed to save food entry');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    if (!csvData) return;

    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `nutrition-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleAnalyze();
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSupplementAdded = () => {
    setSuccess('Supplement logged successfully!');
    setTimeout(() => setSuccess(''), 3000);
  };

  const loadUserProfile = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      console.log('LLMFoodEntry: Loaded user profile:', profile);
      setUserProfile(profile);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserSchedules = async () => {
    try {
      const currentUser = await DatabaseService.getCurrentUser();
      if (currentUser) {
        const schedules = await DatabaseService.getUserSupplementSchedules(currentUser.id);
        setUserSchedules(schedules);
      }
    } catch (error) {
      console.error('Error loading supplement schedules:', error);
    }
  };

  // Load user profile and schedules on component mount
  React.useEffect(() => {
    loadUserProfile();
    loadUserSchedules();
  }, []);

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        {/* Tab Navigation */}
        <Box sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="intake logging tabs"
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: '0.875rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'rgba(46, 125, 50, 0.04)',
                  color: 'primary.main'
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3,
                borderRadius: '3px 3px 0 0'
              }
            }}
          >
            <Tab
              icon={<FoodIcon />}
              label="Log Food"
              iconPosition="start"
            />
            <Tab
              icon={<SupplementIcon />}
              label="Log Supplements"
              iconPosition="start"
            />
            <Tab
              icon={<ScheduleIcon />}
              label="Supplement Schedule"
              iconPosition="start"
            />
          </Tabs>
        </Box>

        {/* Food Logging Tab */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Describe what you ate in natural language. The AI will analyze and break it down into individual foods with complete nutrition data.
          </Typography>

          {/* Input Section */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={3}
              label="What did you eat?"
              placeholder="e.g., I ate 4 slices of bread and scrambled eggs (3 eggs)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
              sx={{ mb: 2 }}
            />

            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={loading || !input.trim()}
              startIcon={loading ? <CircularProgress size={20} /> : <AIIcon />}
              size="large"
            >
              {loading ? 'Analyzing...' : 'Analyze Food'}
            </Button>
          </Box>

          {/* Alerts */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* Preview Section */}
          {previewEntry && (
            <Paper elevation={2} sx={{ p: 3, mb: 2, backgroundColor: 'grey.50' }}>
              <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <FoodIcon sx={{ mr: 1 }} />
                {previewEntry.combinedName}
              </Typography>

              {/* Total Nutrition Summary */}
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>Total Nutrition:</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip label={`${previewEntry.totalCalories} calories`} color="primary" />
                  <Chip label={`${previewEntry.totalNutrients.protein.toFixed(1)}g protein`} />
                  <Chip label={`${previewEntry.totalNutrients.carbohydrates.toFixed(1)}g carbs`} />
                  <Chip label={`${previewEntry.totalNutrients.fat.toFixed(1)}g fat`} />
                  <Chip label={`${previewEntry.totalNutrients.fiber.toFixed(1)}g fiber`} />
                </Stack>
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Individual Items */}
              <Typography variant="subtitle2" gutterBottom>Individual Food Items:</Typography>
              <List dense>
                {previewEntry.individualItems.map((item, index) => (
                  <ListItem key={index} sx={{ py: 1 }}>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {item.quantity} {item.unit} {item.name}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          {item.calories} cal • {item.protein.toFixed(1)}g protein • {item.carbohydrates.toFixed(1)}g carbs • {item.fat.toFixed(1)}g fat
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleConfirm}
                  disabled={loading}
                  startIcon={<CheckIcon />}
                  size="large"
                >
                  Confirm & Add to Log
                </Button>

                {csvData && (
                  <Button
                    variant="outlined"
                    onClick={handleDownloadCSV}
                    startIcon={<DownloadIcon />}
                  >
                    Download CSV
                  </Button>
                )}
              </Box>
            </Paper>
          )}

          {/* Example */}
          <Paper sx={{ p: 2, backgroundColor: 'primary.50', borderLeft: 4, borderColor: 'primary.main' }}>
            <Typography variant="subtitle2" color="primary" gutterBottom>
              💡 Example Input:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              "I ate 4 slices of bread and scrambled eggs (3 eggs)" → Returns individual nutrition for bread and eggs
            </Typography>
          </Paper>
        </TabPanel>

        {/* Supplement Logging Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SupplementIcon color="primary" />
              Log Supplements & Medications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Log supplements, vitamins, and medications you've taken today. You can also set them as recurring.
            </Typography>
            <SupplementEntry
              userId=""
              onSupplementAdded={handleSupplementAdded}
              onSave={loadUserSchedules}
            />
          </Box>
        </TabPanel>

        {/* Supplement Schedule Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ScheduleIcon color="primary" />
              Recurring Supplement Schedule
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Set up recurring supplements that you take regularly. These will automatically count towards your health condition adherence scores.
            </Typography>

            {userSchedules.length > 0 ? (
              <Stack spacing={2}>
                {userSchedules.map((schedule, index) => (
                  <Paper key={index} sx={{ p: 2, border: 1, borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {schedule.supplement?.name || 'Unknown Supplement'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {schedule.dose_amount} {schedule.dose_unit} • {schedule.frequency} • {schedule.times_per_day}x per day
                        </Typography>
                        {schedule.preferred_times && schedule.preferred_times.length > 0 && (
                          <Typography variant="caption" color="text.secondary">
                            Times: {schedule.preferred_times.join(', ')}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={schedule.is_active ? "Active" : "Inactive"}
                        color={schedule.is_active ? "success" : "default"}
                        size="small"
                      />
                    </Box>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }}>
                <ScheduleIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No recurring supplements scheduled
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Add supplements from the "Log Supplements" tab and set them as recurring to have them automatically count towards your health scores.
                </Typography>
              </Paper>
            )}

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Button
                variant="outlined"
                onClick={() => setScheduleDialogOpen(true)}
                startIcon={<ScheduleIcon />}
              >
                Add Recurring Supplement
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* Global Success/Error Messages */}
        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            {success}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}