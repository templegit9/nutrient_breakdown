import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Grid,
  IconButton,
  CircularProgress,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Badge,
  Paper
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Close as CloseIcon,
  Check as CheckIcon
} from '@mui/icons-material';
import { 
  EXPANDED_HEALTH_CONDITIONS, 
  HEALTH_CONDITION_CATEGORIES,
  type HealthConditionData 
} from '../utils/healthConditionsExpanded';
import { DatabaseService } from '../services/database';
import { UserProfile } from '../types';

interface HealthConditionSettingsProps {
  userId: string;
  onClose?: () => void;
  onSave?: () => void;
}

const HealthConditionSettings: React.FC<HealthConditionSettingsProps> = (props) => {
  const { userId, onClose } = props;
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Metabolic']);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const profile = await DatabaseService.getUserProfile();
      setUserProfile(profile);
      setSelectedConditions(profile?.healthConditions || []);
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConditionToggle = (conditionId: string) => {
    setSelectedConditions(prev => 
      prev.includes(conditionId)
        ? prev.filter(id => id !== conditionId)
        : [...prev, conditionId]
    );
  };

  const handleCategoryToggle = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(cat => cat !== category)
        : [...prev, category]
    );
  };

  const handleSave = async () => {
    if (!userProfile) return;

    setSaving(true);
    try {
      const updatedProfile = {
        ...userProfile,
        healthConditions: selectedConditions
      };
      
      await DatabaseService.saveUserProfile(updatedProfile);
      setUserProfile(updatedProfile);
      
      if (onClose) {
        onClose();
      }
      if (props.onSave) {
        props.onSave();
      }
    } catch (error) {
      console.error('Error saving health conditions:', error);
      alert('Failed to save health conditions. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getConditionsByCategory = (category: string): HealthConditionData[] => {
    return EXPANDED_HEALTH_CONDITIONS.filter(condition => condition.category === category);
  };

  const getSelectedConditionsCount = () => selectedConditions.length;

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" p={4}>
        <CircularProgress size={24} />
        <Typography variant="body2" sx={{ ml: 2 }}>Loading health conditions...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h4" component="h2" fontWeight="bold">
              Health Condition Settings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Select your health conditions to receive personalized nutrition recommendations.
            </Typography>
          </Box>
          {onClose && (
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        
        {/* Selected Count */}
        <Box mt={2}>
          <Chip
            label={`${getSelectedConditionsCount()} condition${getSelectedConditionsCount() !== 1 ? 's' : ''} selected`}
            color="primary"
            variant="outlined"
          />
        </Box>
      </DialogTitle>

      {/* Content */}
      <DialogContent>
        <Box>
          {HEALTH_CONDITION_CATEGORIES.map(category => {
            const categoryConditions = getConditionsByCategory(category);
            if (categoryConditions.length === 0) return null;

            const isExpanded = expandedCategories.includes(category);
            const selectedInCategory = categoryConditions.filter(c => selectedConditions.includes(c.id)).length;

            return (
              <Accordion 
                key={category} 
                expanded={isExpanded}
                onChange={() => handleCategoryToggle(category)}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center" width="100%">
                    <Badge 
                      badgeContent={selectedInCategory || categoryConditions.length}
                      color={selectedInCategory > 0 ? "primary" : "default"}
                      sx={{ mr: 2 }}
                    >
                      <Box 
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: selectedInCategory > 0 ? 'primary.main' : 'grey.300',
                          color: selectedInCategory > 0 ? 'white' : 'text.secondary',
                          fontWeight: 'medium',
                          fontSize: '0.875rem'
                        }}
                      >
                        {selectedInCategory || categoryConditions.length}
                      </Box>
                    </Badge>
                    <Box>
                      <Typography variant="h6" fontWeight="semibold">{category}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedInCategory > 0 ? `${selectedInCategory} selected` : `${categoryConditions.length} available`}
                      </Typography>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Grid container spacing={2}>
                    {categoryConditions.map(condition => {
                      const isSelected = selectedConditions.includes(condition.id);
                      
                      return (
                        <Grid item xs={12} md={6} key={condition.id}>
                          <Paper
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              border: 1,
                              borderColor: isSelected ? 'primary.main' : 'grey.300',
                              bgcolor: isSelected ? 'primary.light' : 'background.paper',
                              '&:hover': {
                                borderColor: isSelected ? 'primary.dark' : 'grey.400',
                                boxShadow: 1
                              }
                            }}
                            onClick={() => handleConditionToggle(condition.id)}
                          >
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => handleConditionToggle(condition.id)}
                                  icon={<Box sx={{ width: 20, height: 20, border: 2, borderColor: 'grey.400', borderRadius: 0.5 }} />}
                                  checkedIcon={<CheckIcon sx={{ color: 'primary.main' }} />}
                                />
                              }
                              label={
                                <Box>
                                  <Typography 
                                    variant="body2" 
                                    fontWeight="medium"
                                    sx={{ color: isSelected ? 'primary.dark' : 'text.primary' }}
                                  >
                                    {condition.name}
                                  </Typography>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      display: 'block',
                                      color: isSelected ? 'primary.dark' : 'text.secondary',
                                      mt: 0.5
                                    }}
                                  >
                                    {condition.description}
                                  </Typography>
                                  
                                  {/* Key Nutrients Preview */}
                                  {condition.keyNutrients.length > 0 && (
                                    <Box mt={1} display="flex" flexWrap="wrap" gap={0.5}>
                                      {condition.keyNutrients.slice(0, 3).map((nutrient, index) => (
                                        <Chip
                                          key={index}
                                          label={nutrient.nutrient.replace('_', ' ')}
                                          size="small"
                                          sx={{
                                            fontSize: '0.65rem',
                                            height: 20,
                                            bgcolor: isSelected ? 'primary.main' : 'grey.200',
                                            color: isSelected ? 'white' : 'text.secondary'
                                          }}
                                        />
                                      ))}
                                      {condition.keyNutrients.length > 3 && (
                                        <Chip
                                          label={`+${condition.keyNutrients.length - 3} more`}
                                          size="small"
                                          sx={{
                                            fontSize: '0.65rem',
                                            height: 20,
                                            bgcolor: isSelected ? 'primary.main' : 'grey.200',
                                            color: isSelected ? 'white' : 'text.secondary'
                                          }}
                                        />
                                      )}
                                    </Box>
                                  )}
                                </Box>
                              }
                              sx={{ margin: 0, width: '100%', alignItems: 'flex-start' }}
                            />
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
            );
          })}
        </Box>
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ bgcolor: 'grey.50', px: 3, py: 2 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" width="100%">
          <Alert severity="info" sx={{ flexGrow: 1, mr: 2 }}>
            💡 Tip: You can select multiple conditions for comprehensive recommendations
          </Alert>
          <Box display="flex" gap={1}>
            {onClose && (
              <Button
                onClick={onClose}
                variant="outlined"
                color="inherit"
              >
                Cancel
              </Button>
            )}
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="contained"
              startIcon={saving && <CircularProgress size={16} />}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Box>
      </DialogActions>
    </Box>
  );
};

export default HealthConditionSettings;