import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  Container,
  CircularProgress,
  Divider,
  Link,
  Stack,
  useTheme,
  alpha
} from '@mui/material'
import { FoodBank, Lock, Email } from '@mui/icons-material'
import { useAuth } from './AuthProvider'

export function LoginForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const theme = useTheme()
  
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password)
      } else {
        await signIn(email, password)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.light, 0.1)} 0%, ${alpha(theme.palette.secondary.light, 0.1)} 100%)`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Card
          elevation={8}
          sx={{
            borderRadius: 3,
            overflow: 'hidden',
            background: alpha(theme.palette.background.paper, 0.95),
            backdropFilter: 'blur(10px)'
          }}
        >
          <Box
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              py: 4,
              textAlign: 'center',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                opacity: 0.9
              }
            }}
          >
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <FoodBank sx={{ fontSize: 48, mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Nutrient Tracker
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                {isSignUp 
                  ? 'Join thousands tracking their nutrition journey' 
                  : 'Welcome back to your nutrition journey'
                }
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: 4 }}>
            <Box sx={{ mb: 3, textAlign: 'center' }}>
              <Typography variant="h5" component="h2" gutterBottom color="text.primary">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {isSignUp 
                  ? 'Start tracking your nutrition with personalized insights' 
                  : 'Continue your nutrition tracking and achieve your health goals'
                }
              </Typography>
            </Box>

            {error && (
              <Alert 
                severity="error" 
                sx={{ mb: 3 }}
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />
                  }}
                  disabled={loading}
                />

                <TextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  variant="outlined"
                  InputProps={{
                    startAdornment: <Lock sx={{ mr: 1, color: 'action.active' }} />
                  }}
                  disabled={loading}
                  helperText={
                    isSignUp 
                      ? 'Password should be at least 6 characters long'
                      : ''
                  }
                />

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading || !email || !password}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    textTransform: 'none',
                    fontSize: '1.1rem',
                    borderRadius: 2,
                    boxShadow: theme.shadows[4],
                    '&:hover': {
                      boxShadow: theme.shadows[8]
                    }
                  }}
                >
                  {loading ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CircularProgress size={20} color="inherit" />
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </Box>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                or
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                {isSignUp 
                  ? 'Already have an account?' 
                  : "Don't have an account?"
                }
              </Typography>
              <Link
                component="button"
                type="button"
                variant="body2"
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                sx={{
                  fontWeight: 'medium',
                  textDecorationColor: 'transparent',
                  '&:hover': {
                    textDecorationColor: 'currentColor'
                  }
                }}
              >
                {isSignUp ? 'Sign in instead' : 'Create account'}
              </Link>
            </Box>

            {isSignUp && (
              <Box sx={{ mt: 3 }}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2">
                    🇳🇬 <strong>Nigerian Foods Included!</strong> Track traditional foods like Ugu, Plantain, Yam, and 80+ other local foods with accurate nutritional data.
                  </Typography>
                </Alert>
              </Box>
            )}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Secure authentication powered by Supabase
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}