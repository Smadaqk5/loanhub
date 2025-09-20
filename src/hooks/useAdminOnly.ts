// Custom hook for admin-only operations
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function useAdminOnly(redirectTo: string = '/dashboard') {
  const { user, isAdmin, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push(redirectTo)
    }
  }, [user, isAdmin, loading, router, redirectTo])

  return {
    user,
    isAdmin,
    loading,
    canAccess: !loading && user && isAdmin
  }
}

// Hook specifically for rate editing
export function useRateEditing() {
  const { user, isAdmin, loading } = useAuth()

  const canEditRates = !loading && user && isAdmin

  const editRates = async (newRates: {
    processingFeePercentage?: number
    interestRatePercentage?: number
  }) => {
    if (!canEditRates) {
      throw new Error('Only administrators can edit interest rates and processing fees')
    }

    // In a real app, this would call your backend API
    // For now, we'll just validate the admin access
    return true
  }

  return {
    canEditRates,
    editRates,
    isAdmin,
    loading
  }
}
