import { FAKE_CREDENTIALS } from './fake-credentials'

// Mock user interface
export interface MockUser {
  id: string
  email: string
  full_name: string
  national_id: string
  phone_number: string
  kra_pin: string
  role: 'admin' | 'user'
  created_at: string
}

// Mock session interface
export interface MockSession {
  user: MockUser
  access_token: string
  expires_at: number
}

// In-memory storage for mock authentication
let currentUser: MockUser | null = null
let currentSession: MockSession | null = null

// Persistent storage for users (simulates database)
const USERS_STORAGE_KEY = 'mock_users'
const SESSION_STORAGE_KEY = 'mock_session'

// Load users from localStorage
function loadUsers(): MockUser[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(USERS_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Save users to localStorage
function saveUsers(users: MockUser[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users))
  } catch (error) {
    console.error('Failed to save users:', error)
  }
}

// Load session from localStorage
function loadSession(): MockSession | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(SESSION_STORAGE_KEY)
    if (stored) {
      const session = JSON.parse(stored)
      // Check if session is still valid
      if (session.expires_at > Date.now()) {
        return session
      } else {
        // Session expired, remove it
        localStorage.removeItem(SESSION_STORAGE_KEY)
      }
    }
    return null
  } catch {
    return null
  }
}

// Save session to localStorage
function saveSession(session: MockSession | null): void {
  if (typeof window === 'undefined') return
  try {
    if (session) {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEY)
    }
  } catch (error) {
    console.error('Failed to save session:', error)
  }
}

// Generate a mock user ID
function generateMockId(): string {
  return 'mock-' + Math.random().toString(36).substr(2, 9)
}

// Mock authentication functions
export const mockAuth = {
  // Sign in with email and password
  signIn: async (email: string, password: string): Promise<MockSession> => {
    // Check admin credentials
    if (email === FAKE_CREDENTIALS.admin.email && password === FAKE_CREDENTIALS.admin.password) {
      const user: MockUser = {
        id: 'admin-1', // Fixed ID for admin
        email: FAKE_CREDENTIALS.admin.email,
        full_name: FAKE_CREDENTIALS.admin.full_name,
        national_id: FAKE_CREDENTIALS.admin.national_id,
        phone_number: FAKE_CREDENTIALS.admin.phone_number,
        kra_pin: FAKE_CREDENTIALS.admin.kra_pin,
        role: 'admin',
        created_at: new Date().toISOString()
      }
      
      currentUser = user
      currentSession = {
        user,
        access_token: 'mock-admin-token-' + Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }
      
      saveSession(currentSession)
      return currentSession
    }
    
    // Check user credentials from localStorage
    const users = loadUsers()
    const userCreds = users.find(u => u.email === email)
    if (userCreds) {
      // For mock purposes, we'll accept any password for existing users
      // In a real app, you'd verify the password hash
      currentUser = userCreds
      currentSession = {
        user: userCreds,
        access_token: 'mock-user-token-' + Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }
      
      saveSession(currentSession)
      return currentSession
    }
    
    // Check fake credentials for demo users
    const fakeUserCreds = FAKE_CREDENTIALS.users.find(u => u.email === email && u.password === password)
    if (fakeUserCreds) {
      const user: MockUser = {
        id: 'user-1', // Fixed ID for first user to match sample loans
        email: fakeUserCreds.email,
        full_name: fakeUserCreds.full_name,
        national_id: fakeUserCreds.national_id,
        phone_number: fakeUserCreds.phone_number,
        kra_pin: fakeUserCreds.kra_pin,
        role: 'user',
        created_at: new Date().toISOString()
      }
      
      currentUser = user
      currentSession = {
        user,
        access_token: 'mock-user-token-' + Date.now(),
        expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }
      
      saveSession(currentSession)
      return currentSession
    }
    
    throw new Error('Invalid email or password')
  },

  // Sign up new user
  signUp: async (email: string, password: string, userData: {
    full_name: string
    national_id: string
    phone_number: string
    kra_pin: string
  }): Promise<MockSession> => {
    // Load existing users
    const users = loadUsers()
    
    // Check if email already exists
    if (email === FAKE_CREDENTIALS.admin.email || 
        FAKE_CREDENTIALS.users.some(u => u.email === email) ||
        users.some(u => u.email === email)) {
      throw new Error('Email already exists')
    }
    
    const user: MockUser = {
      id: generateMockId(),
      email,
      full_name: userData.full_name,
      national_id: userData.national_id,
      phone_number: userData.phone_number,
      kra_pin: userData.kra_pin,
      role: 'user',
      created_at: new Date().toISOString()
    }
    
    // Save user to localStorage
    users.push(user)
    saveUsers(users)
    
    currentUser = user
    currentSession = {
      user,
      access_token: 'mock-new-user-token-' + Date.now(),
      expires_at: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
    }
    
    saveSession(currentSession)
    return currentSession
  },

  // Sign out
  signOut: async (): Promise<void> => {
    currentUser = null
    currentSession = null
    saveSession(null)
  },

  // Get current session
  getSession: async (): Promise<MockSession | null> => {
    // First check if we have a valid session in memory
    if (currentSession && currentSession.expires_at > Date.now()) {
      return currentSession
    }
    
    // Try to load session from localStorage
    const storedSession = loadSession()
    if (storedSession) {
      currentSession = storedSession
      currentUser = storedSession.user
      return storedSession
    }
    
    // No valid session
    currentUser = null
    currentSession = null
    return null
  },

  // Get current user
  getUser: (): MockUser | null => {
    return currentUser
  },

  // Check if user is admin
  isAdmin: (): boolean => {
    return currentUser?.role === 'admin'
  },

  // Initialize session from localStorage (call this on app startup)
  initializeSession: async (): Promise<void> => {
    const session = await loadSession()
    if (session) {
      currentSession = session
      currentUser = session.user
    }
  }
}

// Mock database tables
const mockTables = {
  users: [] as MockUser[],
  loans: [
    {
      id: 'loan-1',
      user_id: 'user-1',
      amount_requested: 25000,
      processing_fee: 1250,
      interest_rate: 15.0,
      net_disbursed: 23750,
      total_repayment: 25937.5,
      status: 'pending',
      repayment_deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      loan_purpose: 'Business expansion - purchasing new equipment',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'loan-2',
      user_id: 'user-1',
      amount_requested: 15000,
      processing_fee: 750,
      interest_rate: 15.0,
      net_disbursed: 14250,
      total_repayment: 15562.5,
      status: 'approved',
      repayment_deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      loan_purpose: 'Emergency medical expenses',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ] as any[],
  repayments: [] as any[],
  audit_logs: [] as any[],
  system_settings: [{
    id: '1',
    processing_fee_percentage: 5.0,
    interest_rate_percentage: 15.0,
    max_loan_amount: 100000,
    min_loan_amount: 1000,
    max_repayment_period_days: 365,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }]
}

// Mock query builder with proper TypeScript types
const createMockQuery = (tableName: string) => ({
  select: (columns: string = '*') => ({
    eq: (column: string, value: any) => ({
      single: async () => {
        const table = mockTables[tableName as keyof typeof mockTables]
        if (Array.isArray(table)) {
          const item = table.find((item: any) => item[column] === value)
          return { data: item || null, error: item ? null : new Error('Not found') }
        }
        return { data: null, error: new Error('Table not found') }
      },
      order: (column: string, options: any = {}) => ({
        then: async (callback: any) => {
          const table = mockTables[tableName as keyof typeof mockTables]
          if (Array.isArray(table)) {
            const items = table.filter((item: any) => item[column] === value)
            const sorted = items.sort((a: any, b: any) => {
              const aVal = a[column]
              const bVal = b[column]
              if (options.ascending === false) {
                return bVal > aVal ? 1 : -1
              }
              return aVal > bVal ? 1 : -1
            })
            return callback({ data: sorted, error: null })
          }
          return callback({ data: [], error: new Error('Table not found') })
        }
      })
    }),
    order: (column: string, options: any = {}) => ({
      then: async (callback: any) => {
        const table = mockTables[tableName as keyof typeof mockTables]
        if (Array.isArray(table)) {
          const sorted = [...table].sort((a: any, b: any) => {
            const aVal = a[column]
            const bVal = b[column]
            if (options.ascending === false) {
              return bVal > aVal ? 1 : -1
            }
            return aVal > bVal ? 1 : -1
          })
          return callback({ data: sorted, error: null })
        }
        return callback({ data: [], error: new Error('Table not found') })
      }
    }),
    then: async (callback: any) => {
      const table = mockTables[tableName as keyof typeof mockTables]
      if (Array.isArray(table)) {
        return callback({ data: table, error: null })
      }
      return callback({ data: [], error: new Error('Table not found') })
    }
  }),
  insert: (data: any) => {
    return new Promise((resolve) => {
      const table = mockTables[tableName as keyof typeof mockTables]
      if (Array.isArray(table)) {
        const newItem = {
          id: generateMockId(),
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        table.push(newItem)
        resolve({ data: newItem, error: null })
      } else {
        resolve({ data: null, error: new Error('Table not found') })
      }
    })
  },
  update: (data: any) => ({
    eq: (column: string, value: any) => {
      return new Promise((resolve) => {
        const table = mockTables[tableName as keyof typeof mockTables]
        if (Array.isArray(table)) {
          const index = table.findIndex((item: any) => item[column] === value)
          if (index !== -1) {
            table[index] = { ...table[index], ...data, updated_at: new Date().toISOString() }
            resolve({ data: table[index], error: null })
          } else {
            resolve({ data: null, error: new Error('Not found') })
          }
        } else {
          resolve({ data: null, error: new Error('Table not found') })
        }
      })
    }
  }),
  delete: () => ({
    eq: (column: string, value: any) => {
      return new Promise((resolve) => {
        const table = mockTables[tableName as keyof typeof mockTables]
        if (Array.isArray(table)) {
          const index = table.findIndex((item: any) => item[column] === value)
          if (index !== -1) {
            table.splice(index, 1)
            resolve({ data: null, error: null })
          } else {
            resolve({ data: null, error: new Error('Not found') })
          }
        } else {
          resolve({ data: null, error: new Error('Table not found') })
        }
      })
    }
  })
})

// Mock Supabase client with proper TypeScript types
export const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const session = await mockAuth.signIn(email, password)
      return {
        data: { session, user: session.user },
        error: null
      }
    },

    signUp: async ({ email, password, options }: { 
      email: string; 
      password: string; 
      options?: { data: any } 
    }) => {
      const session = await mockAuth.signUp(email, password, options?.data || {})
      return {
        data: { session, user: session.user },
        error: null
      }
    },

    signOut: async () => {
      await mockAuth.signOut()
      return { error: null }
    },

    getSession: async () => {
      const session = await mockAuth.getSession()
      return {
        data: { session },
        error: null
      }
    },

    onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
      // Mock auth state change listener
      const checkAuth = () => {
        const session = mockAuth.getUser() ? currentSession : null
        callback('SIGNED_IN', session)
      }
      
      // Check immediately
      checkAuth()
      
      // Return a mock subscription
      return {
        data: {
          subscription: {
            unsubscribe: () => {}
          }
        }
      }
    }
  },
  
  from: (tableName: string) => createMockQuery(tableName)
} as any
