import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { RichTextEditor } from '@/components/rich-text-editor'

interface GroupPageProps {
  params: Promise<{ id: string }>
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user is member of this group
  const { data: membership } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      groups (
        id,
        name,
        description,
        type,
        telegram_chat_id,
        created_at
      )
    `)
    .eq('group_id', id)
    .eq('user_id', user.id)
    .single()

  if (!membership) {
    redirect('/groups')
  }

  const group = membership.groups!
  const isGroupAdmin = membership.role === 'admin'

  // Get group members
  const { data: members } = await supabase
    .from('group_members')
    .select(`
      role,
      joined_at,
      users (
        id,
        name,
        city,
        avatar_url
      )
    `)
    .eq('group_id', id)
    .order('joined_at', { ascending: true })

  // Get logbook entries
  const { data: logbookEntries } = await supabase
    .from('logbook_entries')
    .select(`
      id,
      title,
      content,
      meeting_date,
      created_at,
      author:users (
        name,
        avatar_url
      )
    `)
    .eq('group_id', id)
    .order('meeting_date', { ascending: false })

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link href="/groups" className="text-blue-600 hover:underline">
          ← Back to Groups
        </Link>
        <div className="flex justify-between items-start mt-4">
          <div>
            <h1 className="text-3xl font-bold">{group.name}</h1>
            <p className="text-gray-600">{group.description}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant={group.type === 'main' ? 'default' : 'outline'}>
                {group.type}
              </Badge>
              <Badge variant={isGroupAdmin ? 'default' : 'secondary'}>
                {membership.role}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            {group.telegram_chat_id && (
              <Button asChild variant="outline">
                <Link 
                  href={`https://t.me/${group.telegram_chat_id.replace('@', '')}`} 
                  target="_blank"
                >
                  Telegram Group
                </Link>
              </Button>
            )}
            {isGroupAdmin && (
              <Button asChild>
                <Link href={`/groups/${id}/logbook/new`}>
                  New Logbook Entry
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="logbook" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="logbook">Logbook</TabsTrigger>
          <TabsTrigger value="members">Members ({members?.length || 0})</TabsTrigger>
        </TabsList>

        {/* Logbook Tab */}
        <TabsContent value="logbook" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Meeting Logbook</h2>
            <p className="text-sm text-gray-500">
              Monthly meeting summaries and progress updates
            </p>
          </div>

          {logbookEntries && logbookEntries.length > 0 ? (
            <div className="space-y-6">
              {logbookEntries.map((entry) => (
                <Card key={entry.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{entry.title}</CardTitle>
                        <CardDescription>
                          {entry.meeting_date && (
                            <>Meeting: {new Date(entry.meeting_date).toLocaleDateString()}</>
                          )}
                          {entry.meeting_date && entry.author && ' • '}
                          {entry.author && (
                            <>By {entry.author.name}</>
                          )}
                        </CardDescription>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(entry.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RichTextEditor
                      content={entry.content}
                      onChange={() => {}} // Read-only
                      readOnly={true}
                    />
                    {isGroupAdmin && (
                      <div className="mt-4 pt-4 border-t">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/groups/${id}/logbook/${entry.id}/edit`}>
                            Edit Entry
                          </Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-medium mb-2">No Logbook Entries Yet</h3>
                <p className="text-gray-600 mb-6">
                  {isGroupAdmin 
                    ? "Create the first logbook entry to track your group's progress and meetings."
                    : "Group admins will add meeting summaries and progress updates here."
                  }
                </p>
                {isGroupAdmin && (
                  <Button asChild>
                    <Link href={`/groups/${id}/logbook/new`}>
                      Create First Entry
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Members Tab */}
        <TabsContent value="members" className="space-y-6">
          <h2 className="text-xl font-semibold">Group Members</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members?.map((member) => (
              <Card key={member.users?.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {member.users?.avatar_url ? (
                        <img 
                          src={member.users.avatar_url} 
                          alt={member.users.name || 'Member'} 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-sm font-medium">
                          {member.users?.name?.charAt(0) || '?'}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{member.users?.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={member.role === 'admin' ? 'default' : 'outline'} className="text-xs">
                          {member.role}
                        </Badge>
                        {member.users?.city && (
                          <span className="text-xs text-gray-500">{member.users.city}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">
                        Joined {new Date(member.joined_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}