import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { EditLogbookForm } from './edit-logbook-form'

interface EditLogbookPageProps {
  params: Promise<{ id: string; entryId: string }>
}

export default async function EditLogbookPage({ params }: EditLogbookPageProps) {
  const { id, entryId } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is admin of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select(`
      role,
      groups (
        id,
        name
      )
    `)
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    redirect(`/groups/${id}`)
  }

  // Get the logbook entry
  const { data: entry } = await supabase
    .from('logbook_entries')
    .select('*')
    .eq('id', entryId)
    .eq('group_id', id)
    .single()

  if (!entry) {
    redirect(`/groups/${id}`)
  }

  const group = membership.groups!

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link href={`/groups/${id}`} className="text-blue-600 hover:underline">
          ← Back to {group.name}
        </Link>
        <h1 className="text-3xl font-bold mt-4">Edit Logbook Entry</h1>
        <p className="text-gray-600">
          Update your group&apos;s meeting summary and progress
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit: {entry.title}</CardTitle>
          <CardDescription>
            Make changes to this logbook entry. All group members will see the updated version.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EditLogbookForm 
            groupId={id} 
            entryId={entryId}
            initialTitle={entry.title}
            initialContent={entry.content}
            initialMeetingDate={entry.meeting_date}
          />
        </CardContent>
      </Card>
    </div>
  )
}