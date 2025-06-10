import { useState, useEffect } from 'react'
import { Container, Typography, Box, Tab, Tabs, useTheme, useMediaQuery, AppBar, Toolbar, Button } from '@mui/material'
import FoodEntry from './components/FoodEntry'
import NutritionDashboard from './components/NutritionDashboard'
import FoodHistory from './components/FoodHistory'
import HealthConditionDashboard from './components/HealthConditionDashboard'
import { AuthProvider, useAuth } from './components/AuthProvider'
import { LoginForm } from './components/LoginForm'
import { FoodItem } from './types'
import { storageManager } from './utils/localStorage'

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AppContent() {
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut } = useAuth();

  // Load food history from localStorage on component mount
  useEffect(() => {
    try {
      const storedFoods = storageManager.getFoodHistory();
      setFoods(storedFoods);
    } catch (error) {
      console.error('Error loading food history:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddFood = (food: FoodItem) => {
    // Add to state
    setFoods(prev => [...prev, food]);
    
    // Persist to localStorage
    try {
      storageManager.addFoodItem(food);
    } catch (error) {
      console.error('Error saving food to localStorage:', error);
    }
  };

  const handleUpdateFood = (id: string, updates: Partial<FoodItem>) => {
    // Update state
    setFoods(prev => prev.map(food => 
      food.id === id ? { ...food, ...updates } : food
    ));
    
    // Persist to localStorage
    try {
      storageManager.updateFoodItem(id, updates);
    } catch (error) {
      console.error('Error updating food in localStorage:', error);
    }
  };

  const handleDeleteFood = (id: string) => {
    // Update state
    setFoods(prev => prev.filter(food => food.id !== id));
    
    // Remove from localStorage
    try {
      storageManager.deleteFoodItem(id);
    } catch (error) {
      console.error('Error deleting food from localStorage:', error);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <Typography variant="h6" color="text.secondary">
            Loading your nutrition data...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static" elevation={1} sx={{ backgroundColor: 'white', color: 'text.primary' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 'bold' }}>
            Nutrient Tracker
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <Button
                color="inherit"
                onClick={signOut}
                sx={{ color: 'text.secondary' }}
              >
                Sign Out
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      
      <Container 
        maxWidth="lg" 
        sx={{ 
          px: { xs: 1, sm: 2, md: 3 },
          minHeight: 'calc(100vh - 64px)',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ 
          my: { xs: 2, sm: 3, md: 4 },
          flex: 1
        }}>
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            gutterBottom 
            align="center" 
            color="primary"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' }
            }}
          >
            Nutrient Breakdown Tracker
          </Typography>
        
        <Box sx={{ 
          borderBottom: 1, 
          borderColor: 'divider',
          mb: { xs: 1, sm: 2, md: 3 }
        }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange} 
            aria-label="nutrition tracker tabs"
            variant={isMobile ? "fullWidth" : "scrollable"}
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minHeight: { xs: 48, sm: 48, md: 48 },
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                fontWeight: 500,
                minWidth: { xs: 'auto', md: 120 }
              }
            }}
          >
            <Tab label={isMobile ? "Add" : "Add Food"} />
            <Tab label="Dashboard" />
            <Tab label={isMobile ? "Health" : "Health Conditions"} />
            <Tab label="History" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <FoodEntry onAddFood={handleAddFood} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <NutritionDashboard foods={foods} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          <HealthConditionDashboard foods={foods} />
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          <FoodHistory 
            foods={foods} 
            onUpdateFood={handleUpdateFood}
            onDeleteFood={handleDeleteFood}
          />
        </TabPanel>
        </Box>
      </Container>
    </>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

function AppWithAuth() {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh' 
        }}>
          <Typography variant="h6" color="text.secondary">
            Loading...
          </Typography>
        </Box>
      </Container>
    )
  }
  
  if (!user) {
    return <LoginForm />
  }
  
  return <AppContent />
}

export default function MainApp() {
  return (
    <AuthProvider>
      <AppWithAuth />
    </AuthProvider>
  )
}