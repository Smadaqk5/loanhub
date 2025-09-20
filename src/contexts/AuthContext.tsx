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
    // Get initial session using mock auth
    const initAuth = async () => {
      try {
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

    // Listen for auth changes using our mock auth
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
  }, [])

  const signOut = async () => {
    await mockAuth.signOut()
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
