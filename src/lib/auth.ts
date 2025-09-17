import { supabase } from './supabase'

export async function signUp(email: string, password: string, userData: {
  full_name: string
  national_id: string
  phone_number: string
  kra_pin: string
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData
    }
  })

  if (error) throw error

  // Create user profile in users table
  if (data.user) {
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        full_name: userData.full_name,
        national_id: userData.national_id,
        phone_number: userData.phone_number,
        email: email,
        kra_pin: userData.kra_pin,
        password_hash: '', // Supabase handles password hashing
      })

    if (profileError) throw profileError
  }

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
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
