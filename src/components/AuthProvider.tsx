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
    DatabaseService.getCurrentUser().then((user) => {
      setUser(user ? { id: user.id, email: user.email! } : null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = DatabaseService.onAuthStateChange((user) => {
      setUser(user ? { id: user.id, email: user.email } : null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

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