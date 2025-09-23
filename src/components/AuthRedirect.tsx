'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface AuthRedirectProps {
  redirectTo?: string
  requireAuth?: boolean
  requireAdmin?: boolean
  fallbackTo?: string
}

export function AuthRedirect({ 
  redirectTo, 
  requireAuth = true, 
  requireAdmin = false, 
  fallbackTo = '/auth/signin' 
}: AuthRedirectProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return // Still loading, wait

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      console.log('User not authenticated, redirecting to sign in')
      router.push(fallbackTo)
      return
    }

    // If admin is required but user is not admin
    if (requireAdmin && !isAdmin) {
      console.log('User is not admin, redirecting to dashboard')
      router.push('/dashboard')
      return
    }

    // If user is authenticated and we have a redirect target
    if (user && redirectTo) {
      console.log('User authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
      return
    }

    // If user is admin and no specific redirect, go to admin dashboard
    if (user && isAdmin && !redirectTo) {
      console.log('Admin user, redirecting to admin dashboard')
      router.push('/admin')
      return
    }

    // If user is regular user and no specific redirect, go to user dashboard
    if (user && !isAdmin && !redirectTo) {
      console.log('Regular user, redirecting to user dashboard')
      router.push('/dashboard')
      return
    }
  }, [user, loading, isAdmin, redirectTo, requireAuth, requireAdmin, fallbackTo, router])

  // Show loading while determining redirect
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Checking authentication..." />
        </div>
      </div>
    )
  }

  return null
}
