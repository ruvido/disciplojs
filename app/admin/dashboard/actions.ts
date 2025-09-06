'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function approveUserAction(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user (admin)
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  
  if (!currentUser) {
    redirect('/login')
  }

  // CRITICAL SECURITY: Verify admin role
  const { data: currentUserData } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single()

  if (!currentUserData || currentUserData.role !== 'admin') {
    console.error('Unauthorized: User is not an admin')
    redirect('/dashboard')
  }

  const userId = formData.get('userId') as string
  
  // Validate userId format
  if (!userId || typeof userId !== 'string' || userId.length !== 36) {
    console.error('Invalid userId format')
    return
  }

  const { error } = await supabase
    .from('users')
    .update({
      approved: true,
      approved_at: new Date().toISOString(),
      approved_by: currentUser.id
    })
    .eq('id', userId)

  if (error) {
    console.error('Error approving user:', error)
    return
  }

  // Send notifications (Email + Telegram)
  try {
    // Send email notification
    const { sendApprovalEmail } = await import('@/lib/email/notifications')
    await sendApprovalEmail(userId)
    
    // Send Telegram notification if connected
    const { notifyUserApproval } = await import('@/lib/telegram/notifications')
    await notifyUserApproval(userId)
  } catch (error) {
    console.error('Could not send notifications:', error)
  }

  revalidatePath('/admin/dashboard')
}