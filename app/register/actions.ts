'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function registerAction(formData: FormData) {
  const supabase = await createClient()
  
  // Validate and sanitize input
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    city: formData.get('city') as string,
    bio: formData.get('bio') as string,
  }

  const { registrationSchema } = await import('@/lib/validation/schemas')
  
  try {
    const { email, password, name, city, bio } = registrationSchema.parse(rawData)
  } catch (error) {
    console.error('Registration validation failed:', error)
    redirect('/register?error=invalid_input')
  }

  // Sign up user
  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) {
    console.error('Sign up error:', signUpError)
    redirect('/register?error=signup_failed')
  }

  if (!data.user) {
    redirect('/register?error=signup_failed')
  }

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email,
      name,
      city: city || null,
      bio: bio || null,
      role: 'member',
      approved: false
    })

  if (profileError) {
    console.error('Profile creation error:', profileError)
    // Note: We should ideally clean up the auth user here
    redirect('/register?error=profile_creation_failed')
  }

  // Sign out user (they need approval first)
  await supabase.auth.signOut()

  // Send welcome email
  try {
    const { sendWelcomeEmail } = await import('@/lib/email/notifications')
    await sendWelcomeEmail(email, name)
  } catch (error) {
    console.error('Could not send welcome email:', error)
  }

  redirect('/pending-approval')
}