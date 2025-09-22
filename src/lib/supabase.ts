import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './mock-auth'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Check if real Supabase credentials are available
const hasRealSupabase = supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project-id.supabase.co' &&
  supabaseAnonKey !== 'your-anon-key-here'

// Create real Supabase client if credentials are available
const supabaseClient = hasRealSupabase 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createClient('https://mock.supabase.co', 'mock-anon-key')

// Use real Supabase if credentials are available, otherwise use mock
export const supabase = hasRealSupabase ? supabaseClient : mockSupabase

// Log which system is being used
if (typeof window !== 'undefined') {
  console.log(`🔧 Using ${hasRealSupabase ? 'REAL Supabase' : 'MOCK system'} for authentication`)
  if (hasRealSupabase) {
    console.log('✅ Supabase URL:', supabaseUrl)
  } else {
    console.log('ℹ️ Using mock system. Set up Supabase credentials to use real database.')
  }
}

// Database types
export interface User {
  id: string
  full_name: string
  national_id: string
  phone_number: string
  email: string
  kra_pin: string
  status: 'active' | 'suspended'
  created_at: string
  updated_at?: string
}

export interface Loan {
  id: string
  user_id: string
  amount_requested: number
  amount_approved?: number
  amount_disbursed?: number
  processing_fee: number
  interest_rate: number
  net_disbursed: number
  total_repayment: number
  status: 'pending' | 'processing_fee_paid' | 'approved' | 'disbursed' | 'repaid' | 'overdue' | 'rejected'
  repayment_deadline: string
  loan_purpose: string
  repayment_period_days?: number
  payment_method?: string
  processing_fee_paid_at?: string
  approved_at?: string
  disbursed_at?: string
  created_at: string
  updated_at?: string
}

export interface Repayment {
  id: string
  loan_id: string
  amount_paid: number
  payment_reference: string
  paid_at: string
  created_at: string
}

export interface AuditLog {
  id: string
  admin_id: string
  action: string
  description: string
  created_at: string
}

export interface SystemSettings {
  id: string
  processing_fee_percentage: number
  interest_rate_percentage: number
  max_loan_amount: number
  min_loan_amount: number
  max_repayment_period_days: number
  created_at: string
  updated_at: string
}
