'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function loginAction(formData: FormData) {
  const supabase = await createClient()
  
  // Validate input
  const rawCredentials = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { loginSchema } = await import('@/lib/validation/schemas')
  
  try {
    const credentials = loginSchema.parse(rawCredentials)
  } catch (error) {
    console.error('Login validation failed:', error)
    redirect('/login?error=invalid_input')
  }

  const { error, data } = await supabase.auth.signInWithPassword(credentials)
  
  if (error) {
    console.error('Login error:', error)
    redirect('/login?error=invalid_credentials')
  }

  // Check user role and redirect appropriately
  const { data: userData } = await supabase
    .from('users')
    .select('role, approved')
    .eq('id', data.user.id)
    .single()

  if (!userData?.approved) {
    redirect('/pending-approval')
  }

  if (userData?.role === 'admin') {
    redirect('/admin/dashboard')
  } else {
    redirect('/dashboard')
  }
}