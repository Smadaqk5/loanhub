import { supabase } from './supabase'
import { mockAuth } from './mock-auth'

export async function signUp(email: string, password: string, userData: {
  full_name: string
  national_id: string
  phone_number: string
  kra_pin: string
}) {
  // Use mock auth for development
  const session = await mockAuth.signUp(email, password, userData)
  return { data: { session, user: session.user }, error: null }
}

export async function signIn(email: string, password: string) {
  try {
    // Use mock auth for development
    const session = await mockAuth.signIn(email, password)
    return { data: { session, user: session.user }, error: null }
  } catch (error: any) {
    return { data: null, error: error }
  }
}

export async function signOut() {
  // Use mock auth for development
  await mockAuth.signOut()
  return { error: null }
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
