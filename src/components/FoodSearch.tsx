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
import { nutritionDatabase } from '../data/nutritionDatabase'
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

  const foodOptions: FoodOption[] = nutritionDatabase.map(food => ({
    name: food.name,
    category: getCategoryFromFood(food.name),
    calories: food.calories,
    commonUnits: getUnitsForFood(food.name)
  }));

  // Add common foods not in database
  const commonFoods: FoodOption[] = [
    { name: 'Banana', category: 'Fruits', calories: 89, commonUnits: getUnitsForFood('Banana') },
    { name: 'Orange', category: 'Fruits', calories: 47, commonUnits: getUnitsForFood('Orange') },
    { name: 'Bread', category: 'Grains', calories: 79, commonUnits: getUnitsForFood('Bread') },
    { name: 'Rice', category: 'Grains', calories: 130, commonUnits: getUnitsForFood('Rice') },
    { name: 'Pasta', category: 'Grains', calories: 131, commonUnits: getUnitsForFood('Pasta') },
    { name: 'Milk', category: 'Dairy', calories: 42, commonUnits: getUnitsForFood('Milk') },
    { name: 'Cheese', category: 'Dairy', calories: 113, commonUnits: getUnitsForFood('Cheese') },
    { name: 'Eggs', category: 'Protein', calories: 70, commonUnits: getUnitsForFood('Egg') },
    { name: 'Almonds', category: 'Nuts & Seeds', calories: 579, commonUnits: getUnitsForFood('Almonds') },
    { name: 'Avocado', category: 'Fruits', calories: 160, commonUnits: getUnitsForFood('Avocado') }
  ];

  const allFoodOptions = [...foodOptions, ...commonFoods];

  function getCategoryFromFood(foodName: string): string {
    const fruits = ['apple', 'banana', 'orange', 'avocado'];
    const proteins = ['chicken', 'salmon', 'egg'];
    const vegetables = ['broccoli', 'spinach'];
    const grains = ['rice', 'quinoa', 'bread', 'pasta'];
    const dairy = ['yogurt', 'milk', 'cheese'];
    
    const name = foodName.toLowerCase();
    
    if (fruits.some(fruit => name.includes(fruit))) return 'Fruits';
    if (proteins.some(protein => name.includes(protein))) return 'Protein';
    if (vegetables.some(veg => name.includes(veg))) return 'Vegetables';
    if (grains.some(grain => name.includes(grain))) return 'Grains';
    if (dairy.some(d => name.includes(d))) return 'Dairy';
    
    return 'Other';
  }

  useEffect(() => {
    if (inputValue.length > 1) {
      setLoading(true);
      
      // Simulate API delay
      const timeoutId = setTimeout(() => {
        const filtered = allFoodOptions.filter(food =>
          food.name.toLowerCase().includes(inputValue.toLowerCase())
        );
        setOptions(filtered.slice(0, 10)); // Limit to 10 results
        setLoading(false);
      }, 300);

      return () => clearTimeout(timeoutId);
    } else {
      setOptions([]);
      setLoading(false);
    }
  }, [inputValue]);

  const handleChange = (event: any, newValue: string | FoodOption | null) => {
    if (typeof newValue === 'string') {
      onChange(newValue);
      setInputValue(newValue);
    } else if (newValue && typeof newValue === 'object') {
      onChange(newValue.name);
      setInputValue(newValue.name);
      onFoodSelect?.(newValue);
    } else {
      onChange('');
      setInputValue('');
    }
  };

  const handleInputChange = (event: any, newInputValue: string) => {
    setInputValue(newInputValue);
    onChange(newInputValue);
  };

  return (
    <Autocomplete
      freeSolo
      options={options}
      getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
      value={value}
      inputValue={inputValue}
      onChange={handleChange}
      onInputChange={handleInputChange}
      loading={loading}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Food Name"
          placeholder={placeholder}
          required
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
          sx={{
            '& .MuiOutlinedInput-root': {
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <ListItemIcon sx={{ minWidth: 40 }}>
            <FoodBankIcon color="primary" />
          </ListItemIcon>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {option.name}
                </Typography>
                <Chip 
                  label={option.category} 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                />
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {option.calories} cal/100g • Common units: {option.commonUnits.join(', ')}
              </Typography>
            }
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
      PaperComponent={({ children, ...other }) => (
        <Paper {...other} sx={{ mt: 1, maxHeight: 300, overflow: 'auto' }}>
          {children}
        </Paper>
      )}
      noOptionsText={
        inputValue.length > 1 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No foods found. Try a different search term.
            </Typography>
            <Typography variant="caption" color="text.secondary">
              You can still add "{inputValue}" manually
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Start typing to search foods...
            </Typography>
          </Box>
        )
      }
    />
  );
}