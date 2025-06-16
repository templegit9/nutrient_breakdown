import React, { useState } from 'react';
import {
  Box,
  FormControl,
  Select,
  MenuItem,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  useTheme,
  useMediaQuery,
  Chip,
  SelectChangeEvent
} from '@mui/material';
import {
  DateRange as DateRangeIcon,
  Today as TodayIcon,
  CalendarMonth as CalendarIcon
} from '@mui/icons-material';
import { DateRangeType } from '../services/dashboardAggregation';

interface DateRangeSelectorProps {
  selectedRange: DateRangeType;
  onRangeChange: (rangeType: DateRangeType, customStart?: Date, customEnd?: Date) => void;
  entriesCount?: number;
}

export default function DateRangeSelector({ 
  selectedRange, 
  onRangeChange, 
  entriesCount = 0 
}: DateRangeSelectorProps) {
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const dateRangeOptions: { value: DateRangeType; label: string; icon: React.ReactNode }[] = [
    { value: 'today', label: 'Today', icon: <TodayIcon fontSize="small" /> },
    { value: 'yesterday', label: 'Yesterday', icon: <CalendarIcon fontSize="small" /> },
    { value: 'thisWeek', label: 'This Week', icon: <CalendarIcon fontSize="small" /> },
    { value: 'last7days', label: 'Last 7 Days', icon: <DateRangeIcon fontSize="small" /> },
    { value: 'thisMonth', label: 'This Month', icon: <CalendarIcon fontSize="small" /> },
    { value: 'last30days', label: 'Last 30 Days', icon: <DateRangeIcon fontSize="small" /> },
    { value: 'custom', label: 'Custom Range', icon: <DateRangeIcon fontSize="small" /> }
  ];

  const handleRangeChange = (event: SelectChangeEvent<DateRangeType>) => {
    const newRange = event.target.value as DateRangeType;
    
    if (newRange === 'custom') {
      setCustomDialogOpen(true);
    } else {
      onRangeChange(newRange);
    }
  };

  const handleCustomRangeApply = () => {
    if (customStartDate && customEndDate) {
      const startDate = new Date(customStartDate);
      const endDate = new Date(customEndDate);
      
      // Ensure end date is end of day
      endDate.setHours(23, 59, 59, 999);
      
      if (startDate <= endDate) {
        onRangeChange('custom', startDate, endDate);
        setCustomDialogOpen(false);
      }
    }
  };

  const handleCustomDialogClose = () => {
    setCustomDialogOpen(false);
    // Reset to today if custom was cancelled
    if (selectedRange === 'custom') {
      onRangeChange('today');
    }
  };

  const getCurrentRangeLabel = () => {
    const option = dateRangeOptions.find(opt => opt.value === selectedRange);
    if (selectedRange === 'custom' && customStartDate && customEndDate) {
      return `${new Date(customStartDate).toLocaleDateString()} - ${new Date(customEndDate).toLocaleDateString()}`;
    }
    return option?.label || 'Today';
  };

  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  // Initialize custom dates when dialog opens
  React.useEffect(() => {
    if (customDialogOpen) {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      setCustomStartDate(formatDateForInput(weekAgo));
      setCustomEndDate(formatDateForInput(today));
    }
  }, [customDialogOpen]);

  return (
    <>
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 2,
        flexDirection: isMobile ? 'column' : 'row',
        mb: 2 
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DateRangeIcon color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 'fit-content' }}>
            Date Range:
          </Typography>
        </Box>
        
        <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 180 }}>
          <Select
            value={selectedRange}
            onChange={handleRangeChange}
            displayEmpty
            renderValue={() => (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {dateRangeOptions.find(opt => opt.value === selectedRange)?.icon}
                <Typography variant="body2">
                  {getCurrentRangeLabel()}
                </Typography>
              </Box>
            )}
          >
            {dateRangeOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {option.icon}
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {entriesCount > 0 && (
          <Chip
            size="small"
            label={`${entriesCount} ${entriesCount === 1 ? 'entry' : 'entries'}`}
            color="primary"
            variant="outlined"
          />
        )}
      </Box>

      {/* Custom Date Range Dialog */}
      <Dialog 
        open={customDialogOpen} 
        onClose={handleCustomDialogClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DateRangeIcon />
            Select Custom Date Range
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Start Date"
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="End Date"
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: customStartDate }}
              fullWidth
            />
            {customStartDate && customEndDate && (
              <Typography variant="body2" color="text.secondary">
                Selected: {new Date(customStartDate).toLocaleDateString()} - {new Date(customEndDate).toLocaleDateString()}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCustomDialogClose} color="secondary">
            Cancel
          </Button>
          <Button 
            onClick={handleCustomRangeApply} 
            color="primary" 
            variant="contained"
            disabled={!customStartDate || !customEndDate || new Date(customStartDate) > new Date(customEndDate)}
          >
            Apply Range
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}