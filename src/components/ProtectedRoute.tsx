'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { LoadingSpinner } from '@/components/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  fallbackTo?: string
  redirectOnAuth?: string
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  fallbackTo = '/auth/signin',
  redirectOnAuth
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth()
  const router = useRouter()
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    if (loading) return // Still loading, wait

    // If authentication is required but user is not logged in
    if (requireAuth && !user) {
      console.log('ProtectedRoute: User not authenticated, redirecting to sign in')
      setIsRedirecting(true)
      router.push(fallbackTo)
      return
    }

    // If admin is required but user is not admin
    if (requireAdmin && !isAdmin) {
      console.log('ProtectedRoute: User is not admin, redirecting to dashboard')
      setIsRedirecting(true)
      router.push('/dashboard')
      return
    }

    // If user is authenticated and we have a redirect target
    if (user && redirectOnAuth) {
      console.log('ProtectedRoute: User authenticated, redirecting to:', redirectOnAuth)
      setIsRedirecting(true)
      router.push(redirectOnAuth)
      return
    }
  }, [user, loading, isAdmin, requireAuth, requireAdmin, fallbackTo, redirectOnAuth, router])

  // Show loading while determining access
  if (loading || isRedirecting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Checking access..." />
        </div>
      </div>
    )
  }

  // If we reach here, user has proper access
  return <>{children}</>
}
