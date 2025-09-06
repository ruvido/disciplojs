'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function createLogbookEntryAction(formData: FormData) {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Validate and sanitize input
  const groupId = formData.get('groupId') as string
  const title = (formData.get('title') as string)?.trim()
  const content = (formData.get('content') as string)?.trim()
  const meetingDate = formData.get('meetingDate') as string

  if (!groupId || !title || !content) {
    redirect(`/groups/${groupId}/logbook/new?error=missing_fields`)
  }

  if (title.length > 200) {
    redirect(`/groups/${groupId}/logbook/new?error=title_too_long`)
  }

  if (content.length > 10000) {
    redirect(`/groups/${groupId}/logbook/new?error=content_too_long`)
  }

  // Validate UUID format for groupId
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  if (!uuidRegex.test(groupId)) {
    redirect('/groups')
  }

  // Verify user is admin of this group
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

  // Sanitize HTML content to prevent XSS
  const sanitizedContent = content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')

  // Create logbook entry
  const { error } = await supabase
    .from('logbook_entries')
    .insert({
      group_id: groupId,
      author_id: user.id,
      title: title,
      content: sanitizedContent,
      meeting_date: meetingDate || null
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating logbook entry:', error)
    redirect(`/groups/${groupId}/logbook/new?error=creation_failed`)
  }

  // Optional: Notify group members via Telegram
  try {
    const { notifyGroupActivity } = await import('@/lib/telegram/notifications')
    await notifyGroupActivity(
      groupId, 
      `📝 New logbook entry: "${title}"\n\nCheck the webapp for details.`
    )
  } catch (error) {
    console.error('Could not send group notification:', error)
  }

  redirect(`/groups/${groupId}`)
}