import { useState, useEffect } from 'react'
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  InputAdornment,
  CircularProgress
} from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import FoodBankIcon from '@mui/icons-material/FoodBank'
import { DatabaseService } from '../services/database'
import { getUnitsForFood } from '../utils/unitConversions'

interface FoodOption {
  name: string;
  category: string;
  calories: number;
  commonUnits: string[];
}

interface FoodSearchProps {
  value: string;
  onChange: (value: string) => void;
  onFoodSelect?: (food: FoodOption) => void;
  placeholder?: string;
  disabled?: boolean;
}

export default function FoodSearch({ 
  value, 
  onChange, 
  onFoodSelect, 
  placeholder = "Search for foods...",
  disabled = false 
}: FoodSearchProps) {
  const [options, setOptions] = useState<FoodOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  // Fallback suggestions when database is not available or empty
  const getFallbackSuggestions = (searchTerm: string): FoodOption[] => {
    const commonFoods: FoodOption[] = [
      // Common international foods
      { name: 'Apple', category: 'Fruits', calories: 52, commonUnits: ['medium', 'grams', 'cups'] },
      { name: 'Banana', category: 'Fruits', calories: 89, commonUnits: ['medium', 'grams', 'cups'] },
      { name: 'Orange', category: 'Fruits', calories: 47, commonUnits: ['medium', 'grams', 'cups'] },
      { name: 'Rice (White)', category: 'Grains', calories: 130, commonUnits: ['cups', 'grams'] },
      { name: 'Rice (Brown)', category: 'Grains', calories: 123, commonUnits: ['cups', 'grams'] },
      { name: 'Chicken Breast', category: 'Proteins', calories: 165, commonUnits: ['grams', 'ounces'] },
      { name: 'Eggs', category: 'Proteins', calories: 155, commonUnits: ['large', 'medium', 'grams'] },
      { name: 'Bread (White)', category: 'Grains', calories: 265, commonUnits: ['slices', 'grams'] },
      { name: 'Bread (Whole Wheat)', category: 'Grains', calories: 247, commonUnits: ['slices', 'grams'] },
      { name: 'Milk', category: 'Dairy', calories: 50, commonUnits: ['cups', 'ml'] },
      { name: 'Spinach', category: 'Vegetables', calories: 23, commonUnits: ['cups', 'grams'] },
      
      // Nigerian/African foods
      { name: 'Yam', category: 'Starches', calories: 118, commonUnits: ['medium', 'grams', 'cups'] },
      { name: 'Plantain', category: 'Starches', calories: 122, commonUnits: ['medium', 'grams', 'cups'] },
      { name: 'Cassava', category: 'Starches', calories: 160, commonUnits: ['cups', 'grams'] },
      { name: 'Ugu (Fluted Pumpkin)', category: 'Vegetables', calories: 35, commonUnits: ['cups', 'grams'] },
      { name: 'Waterleaf', category: 'Vegetables', calories: 22, commonUnits: ['cups', 'grams'] },
      { name: 'Bitter Leaf', category: 'Vegetables', calories: 30, commonUnits: ['cups', 'grams'] },
      { name: 'Cocoyam', category: 'Starches', calories: 112, commonUnits: ['medium', 'grams', 'cups'] },
      { name: 'Sweet Potato', category: 'Starches', calories: 86, commonUnits: ['medium', 'grams', 'cups'] },
      { name: 'Okra', category: 'Vegetables', calories: 33, commonUnits: ['cups', 'grams'] },
      { name: 'Palm Oil', category: 'Fats', calories: 884, commonUnits: ['tablespoons', 'ml'] },
      { name: 'Groundnut (Peanuts)', category: 'Nuts', calories: 567, commonUnits: ['grams', 'cups'] },
      { name: 'Beans (Black-eyed Peas)', category: 'Legumes', calories: 336, commonUnits: ['cups', 'grams'] },
      { name: 'Jollof Rice', category: 'Dishes', calories: 150, commonUnits: ['cups', 'grams'] },
      { name: 'Fufu', category: 'Starches', calories: 267, commonUnits: ['cups', 'grams'] },
    ];

    return commonFoods.filter(food => 
      food.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  // Search foods from Supabase database
  const searchFoods = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const results = await DatabaseService.searchFoods(searchTerm);
      const foodOptions: FoodOption[] = results.map(food => ({
        name: food.name,
        category: food.category || 'Other',
        calories: food.calories_per_100g || 0,
        commonUnits: getUnitsForFood(food.name)
      }));
      
      // Always include fallback suggestions alongside database results
      const fallbackOptions = getFallbackSuggestions(searchTerm);
      
      // Combine database results with fallback suggestions, removing duplicates
      const combinedOptions = [...foodOptions];
      
      fallbackOptions.forEach(fallback => {
        const isDuplicate = foodOptions.some(dbFood => 
          dbFood.name.toLowerCase() === fallback.name.toLowerCase()
        );
        if (!isDuplicate) {
          combinedOptions.push(fallback);
        }
      });
      
      setOptions(combinedOptions);
    } catch (error) {
      console.error('Error searching foods:', error);
      // Show fallback suggestions on error
      const fallbackOptions = getFallbackSuggestions(searchTerm);
      setOptions(fallbackOptions);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      searchFoods(inputValue);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [inputValue]);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const filteredOptions = options.filter(option =>
    option.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  function getCategoryColor(category: string): string {
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
    };
    return colorMap[category] || colorMap['Other'];
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Autocomplete
        freeSolo
        options={filteredOptions}
        loading={loading}
        disabled={disabled}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          setInputValue(newInputValue);
          onChange(newInputValue);
        }}
        onChange={(_, newValue) => {
          if (typeof newValue === 'object' && newValue !== null) {
            onChange(newValue.name);
            onFoodSelect?.(newValue);
          }
        }}
        getOptionLabel={(option) => 
          typeof option === 'string' ? option : option.name
        }
        renderInput={(params) => (
          <TextField
            {...params}
            placeholder={placeholder}
            variant="outlined"
            fullWidth
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <>
                  {loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
            helperText={
              inputValue.length > 1 && filteredOptions.length === 0 && !loading
                ? "No foods found. Make sure your database is seeded with food data."
                : inputValue.length === 1
                ? "Type at least 2 characters to search..."
                : filteredOptions.length > 0
                ? `Found ${filteredOptions.length} food${filteredOptions.length !== 1 ? 's' : ''}`
                : ""
            }
          />
        )}
        renderOption={(props, option) => (
          <Box component="li" {...props}>
            <ListItemIcon>
              <FoodBankIcon />
            </ListItemIcon>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body1">{option.name}</Typography>
                  <Chip
                    label={option.category}
                    size="small"
                    sx={{
                      backgroundColor: getCategoryColor(option.category),
                      color: 'white',
                      fontSize: '0.75rem'
                    }}
                  />
                </Box>
              }
              secondary={`${option.calories} cal/100g • Units: ${option.commonUnits.join(', ')}`}
            />
          </Box>
        )}
        renderTags={(value, getTagProps) =>
          value.map((option, index) => (
            <Chip
              variant="outlined"
              label={typeof option === 'string' ? option : option.name}
              {...getTagProps({ index })}
              key={index}
            />
          ))
        }
        PaperComponent={({ children, ...props }) => (
          <Paper {...props} elevation={8}>
            {children}
            {filteredOptions.length > 0 && (
              <Box sx={{ p: 1, borderTop: 1, borderColor: 'divider', backgroundColor: 'grey.50' }}>
                <Typography variant="caption" color="text.secondary">
                  Found {filteredOptions.length} food{filteredOptions.length !== 1 ? 's' : ''} 
                  {inputValue.length > 1 && ` matching "${inputValue}"`}
                </Typography>
              </Box>
            )}
          </Paper>
        )}
        sx={{
          '& .MuiAutocomplete-popup': {
            maxHeight: '400px',
            overflow: 'auto'
          }
        }}
      />
    </Box>
  );
}

export { FoodSearch };