// System Settings Service
// Handles fetching and managing system-wide settings like interest rates and processing fees

export interface SystemSettings {
  id?: string
  processing_fee_percentage: number
  interest_rate_percentage: number
  max_loan_amount: number
  min_loan_amount: number
  max_repayment_period_days: number
  late_payment_fee: number
  extension_fee_percentage: number
  auto_approval_threshold: number
  maintenance_mode: boolean
  email_notifications: boolean
  sms_notifications: boolean
  created_at?: string
  updated_at?: string
}

// Default settings (fallback values)
export const DEFAULT_SETTINGS: SystemSettings = {
  processing_fee_percentage: 5.0,
  interest_rate_percentage: 15.0,
  max_loan_amount: 100000,
  min_loan_amount: 1000,
  max_repayment_period_days: 365,
  late_payment_fee: 500,
  extension_fee_percentage: 2.0,
  auto_approval_threshold: 50000,
  maintenance_mode: false,
  email_notifications: true,
  sms_notifications: true
}

class SystemSettingsService {
  private settings: SystemSettings | null = null
  private lastFetch: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get system settings with caching
   */
  async getSettings(): Promise<SystemSettings> {
    const now = Date.now()
    
    // Return cached settings if still valid
    if (this.settings && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.settings
    }

    try {
      // In a real app, this would fetch from your backend/database
      // For now, we'll use the default settings
      this.settings = { ...DEFAULT_SETTINGS }
      this.lastFetch = now
      
      return this.settings
    } catch (error) {
      console.error('Error fetching system settings:', error)
      // Return default settings as fallback
      return { ...DEFAULT_SETTINGS }
    }
  }

  /**
   * Get specific setting value
   */
  async getSetting<K extends keyof SystemSettings>(key: K): Promise<SystemSettings[K]> {
    const settings = await this.getSettings()
    return settings[key]
  }

  /**
   * Update system settings (admin only)
   */
  async updateSettings(newSettings: Partial<SystemSettings>, isAdmin: boolean = false): Promise<boolean> {
    if (!isAdmin) {
      throw new Error('Only administrators can update system settings')
    }

    try {
      // In a real app, this would update the database
      // For now, we'll update the cached settings
      if (this.settings) {
        this.settings = { ...this.settings, ...newSettings } as SystemSettings
      } else {
        this.settings = { ...DEFAULT_SETTINGS, ...newSettings } as SystemSettings
      }
      this.lastFetch = Date.now()
      
      return true
    } catch (error) {
      console.error('Error updating system settings:', error)
      return false
    }
  }

  /**
   * Clear cache (useful for testing or when settings are updated externally)
   */
  clearCache(): void {
    this.settings = null
    this.lastFetch = 0
  }

  /**
   * Get loan calculation parameters
   */
  async getLoanParameters(): Promise<{
    processingFeePercentage: number
    interestRatePercentage: number
    maxLoanAmount: number
    minLoanAmount: number
    maxRepaymentPeriodDays: number
  }> {
    const settings = await this.getSettings()
    
    return {
      processingFeePercentage: settings.processing_fee_percentage,
      interestRatePercentage: settings.interest_rate_percentage,
      maxLoanAmount: settings.max_loan_amount,
      minLoanAmount: settings.min_loan_amount,
      maxRepaymentPeriodDays: settings.max_repayment_period_days
    }
  }

  /**
   * Validate if a user can edit rates (admin only)
   */
  canEditRates(userRole: string): boolean {
    return userRole === 'admin'
  }

  /**
   * Get rate change history (for audit purposes)
   */
  async getRateHistory(): Promise<Array<{
    id: string
    field: string
    oldValue: number
    newValue: number
    changedBy: string
    changedAt: string
  }>> {
    // In a real app, this would fetch from an audit log table
    return []
  }
}

// Export singleton instance
export const systemSettingsService = new SystemSettingsService()

// Helper functions for common operations
export async function getProcessingFeeRate(): Promise<number> {
  return await systemSettingsService.getSetting('processing_fee_percentage')
}

export async function getInterestRate(): Promise<number> {
  return await systemSettingsService.getSetting('interest_rate_percentage')
}

export async function getLoanLimits(): Promise<{
  minAmount: number
  maxAmount: number
  maxPeriodDays: number
}> {
  const settings = await systemSettingsService.getSettings()
  return {
    minAmount: settings.min_loan_amount,
    maxAmount: settings.max_loan_amount,
    maxPeriodDays: settings.max_repayment_period_days
  }
}
