#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const ADMIN_EMAIL = 'ruvido@gmail.com'
const ADMIN_PASSWORD = 'solemio77'
const ADMIN_NAME = 'Admin'

async function seedAdmin() {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.log('⚠️  Supabase environment variables not configured')
    console.log('Skipping admin user creation. This will be done when Supabase is properly configured.')
    return
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  try {
    console.log('🔧 Creating default admin user...')

    // Check if admin user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', ADMIN_EMAIL)
      .single()

    if (existingUser) {
      console.log('✅ Admin user already exists:', ADMIN_EMAIL)
      
      // Update to ensure it's an admin and approved
      const { error: updateError } = await supabase
        .from('users')
        .update({
          role: 'admin',
          approved: true,
          approved_at: new Date().toISOString()
        })
        .eq('id', existingUser.id)

      if (updateError) {
        console.error('❌ Error updating admin user:', updateError)
        process.exit(1)
      }
      
      console.log('✅ Admin user updated successfully')
      return
    }

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Error creating auth user:', authError)
      process.exit(1)
    }

    // Create or update user profile
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: authData.user.id,
        email: ADMIN_EMAIL,
        name: ADMIN_NAME,
        role: 'admin',
        approved: true,
        approved_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

    if (profileError) {
      console.error('❌ Error creating user profile:', profileError)
      process.exit(1)
    }

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', ADMIN_EMAIL)
    console.log('🔑 Password:', ADMIN_PASSWORD)
    console.log('\n🚀 You can now login at: http://localhost:3000/login')

  } catch (error) {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  }
}

// Run the seed script
seedAdmin()