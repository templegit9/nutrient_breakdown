import { useState, useEffect } from 'react'
import { supabase } from '../config/supabase'
import { useAuth } from '../components/AuthProvider'

export function useConnectionStatus() {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    let mounted = true

    const checkConnection = async () => {
      if (!mounted) return
      
      setIsChecking(true)
      try {
        // Test database connection by querying a simple table
        const { data, error } = await supabase
          .from('foods')
          .select('id')
          .limit(1)

        if (mounted) {
          if (error) {
            console.error('Database connection test failed:', error)
            setIsConnected(false)
          } else {
            setIsConnected(true)
          }
        }
      } catch (error) {
        console.error('Connection check error:', error)
        if (mounted) {
          setIsConnected(false)
        }
      } finally {
        if (mounted) {
          setIsChecking(false)
        }
      }
    }

    // Check connection initially
    checkConnection()

    // Set up periodic connection checks every 30 seconds
    const interval = setInterval(checkConnection, 30000)

    // Also check when user auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkConnection()
    })

    return () => {
      mounted = false
      clearInterval(interval)
      subscription.unsubscribe()
    }
  }, [user])

  return {
    isConnected,
    isChecking
  }
}