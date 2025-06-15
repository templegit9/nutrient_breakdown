import React, { createContext, useContext, useEffect, useState } from 'react'
import { DatabaseService } from '../services/database'

interface User {
  id: string
  email: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
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

  useEffect(() => {
    // Check current auth state
    DatabaseService.getCurrentUser().then(async (user) => {
      if (user) {
        setUser({ id: user.id, email: user.email! })
        // Ensure user profile exists
        await ensureUserProfileExists()
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = DatabaseService.onAuthStateChange(async (user) => {
      if (user) {
        setUser({ id: user.id, email: user.email })
        // Ensure user profile exists when user signs in
        await ensureUserProfileExists()
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const ensureUserProfileExists = async () => {
    try {
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
          targetFiber: 25
        }
        
        // Remove id from profile before saving (saveUserProfile expects Omit<UserProfile, 'id'>)
        const { id, ...profileWithoutId } = defaultProfile;
        await DatabaseService.saveUserProfile(profileWithoutId)
        console.log('Default user profile created successfully')
      }
    } catch (error) {
      console.error('Error ensuring user profile exists:', error)
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

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}