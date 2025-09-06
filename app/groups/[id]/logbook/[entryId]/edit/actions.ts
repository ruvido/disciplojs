'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function updateLogbookEntryAction(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Validate and sanitize input
  const groupId = formData.get('groupId') as string
  const entryId = formData.get('entryId') as string
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const meetingDate = formData.get('meetingDate') as string

  if (!groupId || !entryId || !title || !content) {
    redirect(`/groups/${groupId}/logbook/${entryId}/edit?error=missing_fields`)
  }

  if (title.length > 200) {
    redirect(`/groups/${groupId}/logbook/${entryId}/edit?error=title_too_long`)
  }

  if (content.length > 10000) {
    redirect(`/groups/${groupId}/logbook/${entryId}/edit?error=content_too_long`)
  }

  // Validate UUID formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(groupId) || !uuidRegex.test(entryId)) {
    redirect('/groups')
  }

  // First verify entry exists and belongs to group
  const { data: entry } = await supabase
    .from('logbook_entries')
    .select('id, group_id')
    .eq('id', entryId)
    .eq('group_id', groupId)
    .single()

  if (!entry) {
    console.error('Logbook entry not found')
    redirect(`/groups/${groupId}`)
  }

  // Then verify user is admin of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    console.error('Unauthorized: User is not group admin')
    redirect(`/groups/${groupId}`)
  }

  // Sanitize HTML content
  const sanitizedContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')

  // Update logbook entry
  const { error } = await supabase
    .from('logbook_entries')
    .update({
      title: title,
      content: sanitizedContent,
      meeting_date: meetingDate || null
    })
    .eq('id', entryId)

  if (error) {
    console.error('Error updating logbook entry:', error)
    redirect(`/groups/${groupId}/logbook/${entryId}/edit?error=update_failed`)
  }

  redirect(`/groups/${groupId}`)
}

export async function deleteLogbookEntryAction(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const groupId = formData.get('groupId') as string
  const entryId = formData.get('entryId') as string

  if (!groupId || !entryId) {
    redirect(`/groups/${groupId}`)
  }

  // Validate UUID formats
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(groupId) || !uuidRegex.test(entryId)) {
    redirect('/groups')
  }

  // Verify entry exists and user is admin (same check as before)
  const { data: entryCheck } = await supabase
    .from('logbook_entries')
    .select('id, group_id, title')
    .eq('id', entryId)
    .eq('group_id', groupId)
    .single()

  if (!entryCheck) {
    console.error('Logbook entry not found')
    redirect(`/groups/${groupId}`)
  }

  const { data: membershipCheck } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', user.id)
    .single()

  if (!membershipCheck || membershipCheck.role !== 'admin') {
    console.error('Unauthorized: User is not group admin')
    redirect(`/groups/${groupId}`)
  }

  // Delete logbook entry
  const { error } = await supabase
    .from('logbook_entries')
    .delete()
    .eq('id', entryId)

  if (error) {
    console.error('Error deleting logbook entry:', error)
    redirect(`/groups/${groupId}?error=delete_failed`)
  }

  // Optional: Notify group via Telegram
  try {
    const { notifyGroupActivity } = await import('@/lib/telegram/notifications')
    await notifyGroupActivity(
      groupId, 
      `🗑️ Logbook entry "${entryCheck.title}" was deleted by group admin.`
    )
  } catch (error) {
    console.error('Could not send group notification:', error)
  }

  redirect(`/groups/${groupId}`)
}