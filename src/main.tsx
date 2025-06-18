import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'

const theme = createTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  palette: {
    primary: {
      main: '#2e7d32', // Deep green for health/wellness
      light: '#60ad5e',
      dark: '#005005',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#1976d2', // Blue for trust and reliability
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff',
    },
    success: {
      main: '#4caf50', // Green for positive health indicators
      light: '#80e27e',
      dark: '#087f23',
    },
    warning: {
      main: '#ff9800', // Orange for moderate warnings
      light: '#ffb74d',
      dark: '#f57c00',
    },
    error: {
      main: '#d32f2f', // Red for health concerns
      light: '#ef5350',
      dark: '#c62828',
    },
    info: {
      main: '#0288d1', // Light blue for informational content
      light: '#03dac6',
      dark: '#018786',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
      color: '#2e7d32',
    },
    h2: {
      fontWeight: 500,
      color: '#2e7d32',
    },
    h3: {
      fontWeight: 500,
      color: '#2e7d32',
    },
    h4: {
      fontWeight: 500,
      color: '#2e7d32',
    },
    h5: {
      fontWeight: 500,
      color: '#2e7d32',
    },
    h6: {
      fontWeight: 500,
      color: '#2e7d32',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#e0e0e0',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          '@media (min-width: 600px)': {
            paddingLeft: 24,
            paddingRight: 24,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px rgba(46, 125, 50, 0.3)',
          '&:hover': {
            boxShadow: '0 6px 16px rgba(46, 125, 50, 0.4)',
          },
        },
      },
    },
  },
});

// Import SLM test utility for development
if (process.env.NODE_ENV === 'development') {
  import('./utils/testSLM');
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
)