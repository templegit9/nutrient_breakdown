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
import type { DatabaseFood } from '../types'

interface FoodOption {
  name: string;
  category: string;
  calories: number;
  commonUnits: string[];
  cookingState?: string;
  databaseFood?: DatabaseFood; // Include full database food info
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


  // Search foods from Supabase database
  const searchFoods = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      console.log('Searching for foods with term:', searchTerm);
      const results = await DatabaseService.searchFoods(searchTerm);
      console.log('Food search results:', results);
      
      const foodOptions: FoodOption[] = results.map(food => ({
        name: food.name,
        category: food.category || 'Other',
        calories: food.calories_per_100g || 0,
        commonUnits: getUnitsForFood(food.name),
        cookingState: food.preparation_state || 'raw',
        databaseFood: food // Include full database food data
      }));
      
      setOptions(foodOptions);
    } catch (error) {
      console.error('Error searching foods:', error);
      setOptions([]);
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
                ? "No foods found in database. Check your search terms or ensure the database contains food data."
                : inputValue.length === 1
                ? "Type at least 2 characters to search..."
                : filteredOptions.length > 0
                ? `Found ${filteredOptions.length} food${filteredOptions.length !== 1 ? 's' : ''} in database`
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
              secondary={`${option.calories} cal/100g • ${option.cookingState || 'Raw'} • Units: ${option.commonUnits.join(', ')}`}
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