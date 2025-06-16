import React, { createContext, useContext, useEffect, useState } from 'react'
import { DatabaseService } from '../services/database'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  needsOnboarding: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  completeOnboarding: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    // Check current auth state
    DatabaseService.getCurrentUser().then(async (user) => {
      if (user) {
        setUser({ id: user.id, email: user.email! })
        // Ensure user profile exists and check if onboarding is needed
        const onboardingNeeded = await ensureUserProfileExists()
        setNeedsOnboarding(onboardingNeeded)
      } else {
        setUser(null)
        setNeedsOnboarding(false)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = DatabaseService.onAuthStateChange(async (user) => {
      if (user) {
        setUser({ id: user.id, email: user.email })
        // Ensure user profile exists when user signs in and check if onboarding is needed
        const onboardingNeeded = await ensureUserProfileExists()
        setNeedsOnboarding(onboardingNeeded)
      } else {
        setUser(null)
        setNeedsOnboarding(false)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserProfileExists = async (): Promise<boolean> => {
    try {
      // Test database connection first
      const connectionWorking = await DatabaseService.testConnection();
      if (!connectionWorking) {
        console.error('Database connection is not working');
        return false;
      }

      // Clean up any duplicate profiles first
      await DatabaseService.cleanupDuplicateProfiles()
      
      const existingProfile = await DatabaseService.getUserProfile()
      
      if (!existingProfile) {
        console.log('No user profile found, creating default profile...')
        const defaultProfile = {
          id: undefined,
          name: '',
          age: 25,
          gender: 'other' as const,
          height: 170,
          weight: 70,
          activityLevel: 'moderate' as const,
          healthConditions: [],
          dietaryRestrictions: [],
          targetCalories: 2000,
          targetProtein: 150,
          targetCarbs: 250,
          targetFat: 65,
          targetFiber: 25,
          preferredNutrients: ['calories', 'protein', 'carbs', 'fat', 'fiber']
        }
        
        // Remove id from profile before saving (saveUserProfile expects Omit<UserProfile, 'id'>)
        const { id, ...profileWithoutId } = defaultProfile;
        await DatabaseService.saveUserProfile(profileWithoutId)
        console.log('Default user profile created successfully')
        return true; // New user needs onboarding
      }

      // Check if profile is incomplete (name is empty, indicating default profile)
      const needsOnboarding = !existingProfile.name || existingProfile.name.trim() === '';
      return needsOnboarding;
    } catch (error) {
      console.error('Error ensuring user profile exists:', error)
      return false;
    }
  }

  const signIn = async (email: string, password: string) => {
    await DatabaseService.signIn(email, password)
  }

  const signUp = async (email: string, password: string) => {
    await DatabaseService.signUp(email, password)
  }

  const signOut = async () => {
    await DatabaseService.signOut()
  }

  const completeOnboarding = () => {
    setNeedsOnboarding(false)
  }

  const value = {
    user,
    loading,
    needsOnboarding,
    signIn,
    signUp,
    signOut,
    completeOnboarding
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}