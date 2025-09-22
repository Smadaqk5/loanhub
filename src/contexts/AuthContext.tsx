'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { mockAuth, MockUser } from '@/lib/mock-auth'

interface AuthContextType {
  user: User | MockUser | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  isAdmin: boolean
  refreshAuth: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | MockUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    // Get initial session
    const initAuth = async () => {
      try {
        // Check if we're using real Supabase
        const isUsingRealSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
          process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co'

        if (isUsingRealSupabase) {
          // Use real Supabase
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            setSession(session)
            setUser(session.user)
            setIsAdmin(session.user.user_metadata?.role === 'admin')
          } else {
            setSession(null)
            setUser(null)
            setIsAdmin(false)
          }
        } else {
          // Use mock auth for development
          await mockAuth.initializeSession()
          const session = await mockAuth.getSession()
          if (session) {
            setSession(session as any)
            setUser(session.user)
            setIsAdmin(session.user.role === 'admin')
          } else {
            setSession(null)
            setUser(null)
            setIsAdmin(false)
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        setSession(null)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Listen for auth changes
    const isUsingRealSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co'

    if (isUsingRealSupabase) {
      // Listen for real Supabase auth changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (session) {
            setSession(session)
            setUser(session.user)
            setIsAdmin(session.user.user_metadata?.role === 'admin')
          } else {
            setSession(null)
            setUser(null)
            setIsAdmin(false)
          }
        }
      )

      return () => subscription.unsubscribe()
    } else {
      // Listen for mock auth changes
      const checkAuthState = () => {
        const currentUser = mockAuth.getUser()
        if (currentUser) {
          const currentSession = {
            user: currentUser,
            access_token: 'mock-token',
            expires_at: Date.now() + (24 * 60 * 60 * 1000)
          }
          setSession(currentSession as any)
          setUser(currentUser)
          setIsAdmin(currentUser.role === 'admin')
        } else {
          setSession(null)
          setUser(null)
          setIsAdmin(false)
        }
      }

      // Check auth state more frequently to catch login changes
      const interval = setInterval(checkAuthState, 500)
      return () => clearInterval(interval)
    }
  }, [])

  const signOut = async () => {
    const isUsingRealSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
      process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co'

    if (isUsingRealSupabase) {
      // Use real Supabase
      await supabase.auth.signOut()
    } else {
      // Use mock auth
      await mockAuth.signOut()
    }
    
    setSession(null)
    setUser(null)
    setIsAdmin(false)
  }

  const refreshAuth = () => {
    const currentUser = mockAuth.getUser()
    if (currentUser) {
      const currentSession = {
        user: currentUser,
        access_token: 'mock-token',
        expires_at: Date.now() + (24 * 60 * 60 * 1000)
      }
      setSession(currentSession as any)
      setUser(currentUser)
      setIsAdmin(currentUser.role === 'admin')
    } else {
      setSession(null)
      setUser(null)
      setIsAdmin(false)
    }
  }

  const value = {
    user,
    session,
    loading,
    signOut,
    isAdmin,
    refreshAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
