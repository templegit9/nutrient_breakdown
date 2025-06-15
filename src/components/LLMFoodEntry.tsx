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
  Paper
} from '@mui/material';
import {
  Restaurant as FoodIcon,
  SmartToy as AIIcon,
  Check as CheckIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { llmFoodBrain } from '../services/llmFoodBrain';
import type { GroupedFoodEntry } from '../types/food';
import { GroupedFoodDatabase } from '../services/groupedFoodDatabase';

interface LLMFoodEntryProps {
  onFoodAdded: (entry: GroupedFoodEntry) => void;
}

export default function LLMFoodEntry({ onFoodAdded }: LLMFoodEntryProps) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewEntry, setPreviewEntry] = useState<GroupedFoodEntry | null>(null);
  const [csvData, setCsvData] = useState<string>('');

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
      const result = await llmFoodBrain.processFoodInput(input.trim());
      
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
    if (!previewEntry) return;

    setLoading(true);
    setError('');

    try {
      console.log('GroupedFoodDatabase:', GroupedFoodDatabase);
      console.log('saveGroupedFoodEntry method:', GroupedFoodDatabase.saveGroupedFoodEntry);
      console.log('Preview entry to save:', previewEntry);
      
      // Try to bind the method properly
      const saveMethod = GroupedFoodDatabase.saveGroupedFoodEntry.bind(GroupedFoodDatabase);
      console.log('Bound method:', saveMethod);
      
      const { data, error: dbError } = await saveMethod(previewEntry);
      
      if (dbError) {
        setError('Failed to save food entry to database');
        console.error('Database error:', dbError);
      } else {
        setSuccess('Food entry saved successfully!');
        onFoodAdded(previewEntry);
        
        // Reset form
        setInput('');
        setPreviewEntry(null);
        setCsvData('');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Save error:', err);
      console.error('Error details:', err);
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

  return (
    <Card sx={{ maxWidth: 800, mx: 'auto', mt: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AIIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
          <Typography variant="h5" component="h2" color="primary" fontWeight={600}>
            AI Food Analysis
          </Typography>
        </Box>

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
      </CardContent>
    </Card>
  );
}