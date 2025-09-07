'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'

export async function registerAction(formData: FormData) {
  const supabase = await createClient()
  const adminClient = createAdminClient()
  
  console.log('🚀 Starting registration process...')
  
  // Validate and sanitize input
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    city: formData.get('city') as string,
    bio: formData.get('bio') as string,
  }

  console.log('📧 Registration data received:', { 
    email: rawData.email, 
    name: rawData.name,
    city: rawData.city || 'No city',
    bio: rawData.bio ? 'Has bio' : 'No bio'
  })

  const { registrationSchema } = await import('@/lib/validation/schemas')
  
  let validatedData
  try {
    validatedData = registrationSchema.parse(rawData)
    console.log('✅ Validation passed')
  } catch (error) {
    console.error('❌ Registration validation failed:', error)
    redirect('/register?error=invalid_input')
  }
  
  const { email, password, name, city, bio } = validatedData

  // Sign up user using regular client
  console.log('👤 Creating auth user...')
  const { error: signUpError, data } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
      }
    }
  })

  if (signUpError) {
    console.error('❌ Sign up error:', signUpError)
    if (signUpError.message.includes('already registered')) {
      redirect('/register?error=email_exists')
    }
    redirect('/register?error=signup_failed')
  }

  if (!data.user) {
    console.error('❌ No user data returned')
    redirect('/register?error=signup_failed')
  }

  console.log('✅ Auth user created:', data.user.id)

  // Create user profile using admin client for better reliability
  console.log('👤 Creating user profile...')
  const { error: profileError } = await adminClient
    .from('users')
    .insert({
      id: data.user.id,
      email,
      name,
      city: city || null,
      bio: bio || null,
      role: 'member',
      approved: false,
      created_at: new Date().toISOString()
    })

  if (profileError) {
    console.error('❌ Profile creation error:', profileError)
    // Try to clean up the auth user
    try {
      const { error: deleteError } = await adminClient.auth.admin.deleteUser(data.user.id)
      if (deleteError) {
        console.error('❌ Could not clean up auth user:', deleteError)
      } else {
        console.log('🧹 Cleaned up orphaned auth user')
      }
    } catch (cleanupError) {
      console.error('❌ Cleanup error:', cleanupError)
    }
    redirect('/register?error=profile_creation_failed')
  }

  console.log('✅ User profile created')

  // Sign out user (they need approval first)
  console.log('🔐 Signing out user for approval process...')
  await supabase.auth.signOut()

  // Send welcome email (non-blocking)
  try {
    console.log('📧 Attempting to send welcome email...')
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email')
    } else {
      const { sendWelcomeEmail } = await import('@/lib/email/notifications')
      await sendWelcomeEmail(email, name)
      console.log('✅ Welcome email sent')
    }
  } catch (error) {
    console.error('⚠️ Could not send welcome email (non-critical):', error)
  }

  console.log('🎉 Registration completed successfully!')
  redirect('/register?success=registered')
}