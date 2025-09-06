import { createClient } from '@/lib/supabase/server'

const ADMIN_EMAIL = 'ruvido@gmail.com'
const ADMIN_PASSWORD = 'solemio77' 
const ADMIN_NAME = 'Admin'

export async function ensureAdminUser() {
  // Skip if Supabase not configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false
  }

  try {
    const supabase = await createClient()
    
    // Check if admin user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, role, approved')
      .eq('email', ADMIN_EMAIL)
      .single()

    if (existingUser) {
      // Ensure user is admin and approved
      if (existingUser.role !== 'admin' || !existingUser.approved) {
        const { error } = await supabase
          .from('users')
          .update({
            role: 'admin',
            approved: true,
            approved_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)

        if (error) {
          console.error('Failed to update admin user:', error)
          return false
        }
      }
      
      return true
    }

    // Admin user doesn't exist in profiles table
    // This might happen if auth exists but profile doesn't
    console.log('Admin user profile missing, will be created on first login')
    return false

  } catch (error) {
    console.error('Error checking admin user:', error)
    return false
  }
}

export async function createAdminUserIfMissing() {
  // This function can be called from API routes or server actions
  // when we have access to service role key for user creation
  
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log('Service role key not available, cannot create admin user')
    return false
  }

  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if user exists in auth
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const existingAuthUser = authUsers.users.find(user => user.email === ADMIN_EMAIL)

    if (!existingAuthUser) {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true
      })

      if (authError) {
        console.error('Error creating admin auth user:', authError)
        return false
      }

      // Create profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: ADMIN_EMAIL,
          name: ADMIN_NAME,
          role: 'admin',
          approved: true,
          approved_at: new Date().toISOString(),
        })

      if (profileError) {
        console.error('Error creating admin profile:', profileError)
        return false
      }

      console.log('✅ Admin user created successfully')
      return true
    }

    return true
  } catch (error) {
    console.error('Error in createAdminUserIfMissing:', error)
    return false
  }
}