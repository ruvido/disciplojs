import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogbookForm } from './logbook-form'

interface NewLogbookPageProps {
  params: Promise<{ id: string }>
}

export default async function NewLogbookPage({ params }: NewLogbookPageProps) {
  const { id } = await params
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
        name,
        description,
        type
      )
    `)
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership || membership.role !== 'admin') {
    redirect(`/groups/${id}`)
  }

  const group = membership.groups!

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <Link href={`/groups/${id}`} className="text-blue-600 hover:underline">
          ← Back to {group.name}
        </Link>
        <h1 className="text-3xl font-bold mt-4">New Logbook Entry</h1>
        <p className="text-gray-600">
          Document your group's meeting summary and progress updates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Meeting Logbook Entry</CardTitle>
          <CardDescription>
            Create a detailed record of your group meeting, including discussions, 
            progress updates, and action items for next time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogbookForm groupId={id} />
        </CardContent>
      </Card>
    </div>
  )
}