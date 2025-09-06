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

  // Verify user is admin of this group AND entry exists
  const { data: entry } = await supabase
    .from('logbook_entries')
    .select(`
      id,
      group_members!inner(role)
    `)
    .eq('id', entryId)
    .eq('group_id', groupId)
    .eq('group_members.user_id', user.id)
    .single()

  if (!entry || entry.group_members.role !== 'admin') {
    console.error('Unauthorized: User is not group admin or entry not found')
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

  // Verify user is admin of this group AND entry exists
  const { data: entry } = await supabase
    .from('logbook_entries')
    .select(`
      id,
      title,
      group_members!inner(role)
    `)
    .eq('id', entryId)
    .eq('group_id', groupId)
    .eq('group_members.user_id', user.id)
    .single()

  if (!entry || entry.group_members.role !== 'admin') {
    console.error('Unauthorized: User is not group admin or entry not found')
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
      `🗑️ Logbook entry "${entry.title}" was deleted by group admin.`
    )
  } catch (error) {
    console.error('Could not send group notification:', error)
  }

  redirect(`/groups/${groupId}`)
}