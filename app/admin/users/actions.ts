'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveUserAction(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  if (!userId) {
    throw new Error('User ID is required')
  }

  console.log('✅ Approving user:', userId)

  // Update user status
  const { error: updateError } = await supabase
    .from('users')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (updateError) {
    console.error('❌ Error approving user:', updateError)
    throw new Error('Failed to approve user')
  }

  // Send approval email (non-blocking)
  try {
    console.log('📧 Sending approval email...')
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email')
    } else {
      const { sendApprovalEmail } = await import('@/lib/email/notifications')
      await sendApprovalEmail(userId)
      console.log('✅ Approval email sent')
    }
  } catch (error) {
    console.error('⚠️ Could not send approval email (non-critical):', error)
  }

  console.log('🎉 User approved successfully!')
  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}

export async function rejectUserAction(formData: FormData) {
  const supabase = await createClient()
  const userId = formData.get('userId') as string

  if (!userId) {
    throw new Error('User ID is required')
  }

  console.log('❌ Rejecting user:', userId)

  // Get user details before deletion
  const { data: user } = await supabase
    .from('users')
    .select('email, name')
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  // Delete user from users table
  const { error: deleteUserError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)

  if (deleteUserError) {
    console.error('❌ Error deleting user profile:', deleteUserError)
    throw new Error('Failed to delete user profile')
  }

  // Delete auth user
  try {
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteAuthError) {
      console.error('❌ Error deleting auth user:', deleteAuthError)
    } else {
      console.log('✅ Auth user deleted')
    }
  } catch (error) {
    console.error('⚠️ Could not delete auth user:', error)
  }

  // Send rejection email (non-blocking)
  try {
    console.log('📧 Sending rejection email...')
    if (!process.env.RESEND_API_KEY) {
      console.log('⚠️ RESEND_API_KEY not configured, skipping email')
    } else {
      // TODO: Implement rejection email
      console.log('⚠️ Rejection email not implemented yet')
    }
  } catch (error) {
    console.error('⚠️ Could not send rejection email:', error)
  }

  console.log('🗑️ User rejected and deleted')
  revalidatePath('/admin/users')
  revalidatePath('/admin/dashboard')
}