import { useState, useCallback } from 'react'
import { Container, Typography, Box, Tab, Tabs, useTheme, useMediaQuery, AppBar, Toolbar, Button, IconButton } from '@mui/material'
import { AccountCircle as AccountIcon } from '@mui/icons-material'
import LLMFoodEntry from './components/LLMFoodEntry'
import NutritionDashboard from './components/NutritionDashboard'
import FoodHistory from './components/FoodHistory'
import HealthConditionDashboard from './components/HealthConditionDashboard'
import OnboardingWizard from './components/OnboardingWizard'
import UserProfileSettings from './components/UserProfileSettings'
import { AuthProvider, useAuth } from './components/AuthProvider'
import { LoginForm } from './components/LoginForm'
import { useFoodData } from './hooks/useFoodData'
import { useGroupedFoodData } from './hooks/useGroupedFoodData'
import { useConnectionStatus } from './hooks/useConnectionStatus'
import type { GroupedFoodEntry } from './types/food'

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
        <Box sx={{
          p: { xs: 2, sm: 3 },
          animation: 'fadeIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function AppContent() {
  const [tabValue, setTabValue] = useState(0);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, signOut, needsOnboarding, completeOnboarding } = useAuth();
  const { loading } = useFoodData();
  const { groupedEntries, loading: groupedLoading, addEntryToState } = useGroupedFoodData();
  const { isConnected, isChecking } = useConnectionStatus();

  const handleFoodEntrySuccess = useCallback((entry: GroupedFoodEntry) => {
    addEntryToState(entry);
    setRefreshTrigger(prev => prev + 1);
  }, [addEntryToState]);

  const handleTabChange = useCallback((_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  }, []);

  if (loading || groupedLoading) {
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
      <AppBar position="static" elevation={0} sx={{
        backgroundColor: 'white',
        color: 'text.primary',
        borderBottom: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 1px 3px rgba(46, 125, 50, 0.1)'
      }}>
        <Toolbar sx={{ minHeight: '70px !important' }}>
          <Typography variant="h5" component="div" sx={{
            flexGrow: 1,
            color: 'primary.main',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            🥗 Nutrient Tracker
          </Typography>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {user.email}
              </Typography>
              <IconButton
                color="inherit"
                onClick={() => setProfileOpen(true)}
                sx={{ color: 'text.secondary' }}
                title="User Profile Settings"
              >
                <AccountIcon />
              </IconButton>
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
          flex: 1,
          position: 'relative'
        }}>
          <Typography
            variant={isMobile ? "h4" : "h3"}
            component="h1"
            gutterBottom
            align="center"
            color="primary"
            sx={{
              mb: { xs: 2, sm: 3, md: 4 },
              fontSize: { xs: '1.75rem', sm: '2.125rem', md: '3rem' },
              // Connection status glow effect
              textShadow: isConnected
                ? '0 0 10px rgba(76, 175, 80, 0.6), 0 0 20px rgba(76, 175, 80, 0.4), 0 0 30px rgba(76, 175, 80, 0.2)'
                : isChecking
                  ? '0 0 10px rgba(255, 193, 7, 0.6), 0 0 20px rgba(255, 193, 7, 0.4)'
                  : '0 0 10px rgba(244, 67, 54, 0.6), 0 0 20px rgba(244, 67, 54, 0.4)',
              transition: 'text-shadow 0.3s ease-in-out'
            }}
          >
            Nutrient Breakdown Tracker
            {/* Connection status indicator */}
            {user && (
              <Box
                component="span"
                sx={{
                  ml: 2,
                  display: 'inline-block',
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: isConnected
                    ? 'success.main'
                    : isChecking
                      ? 'warning.main'
                      : 'error.main',
                  boxShadow: isConnected
                    ? '0 0 8px rgba(76, 175, 80, 0.8)'
                    : isChecking
                      ? '0 0 8px rgba(255, 193, 7, 0.8)'
                      : '0 0 8px rgba(244, 67, 54, 0.8)',
                  animation: 'none'
                }}
                title={
                  isChecking
                    ? 'Checking database connection...'
                    : isConnected
                      ? 'Connected to Supabase'
                      : 'Database connection failed'
                }
              />
            )}
          </Typography>

          <Box sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: { xs: 1, sm: 2, md: 3 },
            boxShadow: '0 2px 4px rgba(46, 125, 50, 0.05)',
            backgroundColor: 'background.paper',
            borderRadius: '8px 8px 0 0'
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
                  fontWeight: 600,
                  minWidth: { xs: 'auto', md: 120 },
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
              <Tab label={isMobile ? "Log" : "Log Intake"} />
              <Tab label="Dashboard" />
              <Tab label={isMobile ? "Health" : "Health Conditions"} />
              <Tab label="History" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <LLMFoodEntry onFoodAdded={handleFoodEntrySuccess} />
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <NutritionDashboard groupedEntries={groupedEntries} />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <HealthConditionDashboard userId={user?.id || ''} />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <FoodHistory refreshTrigger={refreshTrigger} />
          </TabPanel>
        </Box>
      </Container>

      {/* User Profile Settings Dialog */}
      <UserProfileSettings
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={(profile: any) => {
          console.log('Profile saved:', profile);
          // Refresh dashboards if needed
          setRefreshTrigger(prev => prev + 1);
        }}
      />

      {/* Onboarding Wizard */}
      <OnboardingWizard
        open={needsOnboarding}
        onClose={() => {
          // Don't allow closing during onboarding - user must complete it
        }}
        onComplete={(profile) => {
          console.log('Onboarding completed:', profile);
          completeOnboarding();
          setRefreshTrigger(prev => prev + 1);
        }}
      />
    </>
  )
}

// Removed unused App function

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