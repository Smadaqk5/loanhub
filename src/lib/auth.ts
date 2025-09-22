import { supabase } from './supabase'
import { mockAuth } from './mock-auth'

// Check if we're using real Supabase or mock
const isUsingRealSupabase = process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://your-project-id.supabase.co'

export async function signUp(email: string, password: string, userData: {
  full_name: string
  national_id: string
  phone_number: string
  kra_pin: string
}) {
  if (isUsingRealSupabase) {
    // Use real Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  } else {
    // Use mock auth for development
    try {
      const session = await mockAuth.signUp(email, password, userData)
      return { data: { session, user: session.user }, error: null }
    } catch (error: any) {
      return { data: { session: null, user: null }, error: { message: error.message } }
    }
  }
}

export async function signIn(email: string, password: string) {
  if (isUsingRealSupabase) {
    // Use real Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  } else {
    // Use mock auth for development
    try {
      const session = await mockAuth.signIn(email, password)
      return { data: { session, user: session.user }, error: null }
    } catch (error: any) {
      return { data: null, error: error }
    }
  }
}

export async function signOut() {
  if (isUsingRealSupabase) {
    // Use real Supabase
    const { error } = await supabase.auth.signOut()
    return { error }
  } else {
    // Use mock auth for development
    await mockAuth.signOut()
    return { error: null }
  }
}

export async function resetPassword(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`,
  })

  if (error) throw error
  return data
}

export async function updatePassword(password: string) {
  const { data, error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) throw error
  return data
}
