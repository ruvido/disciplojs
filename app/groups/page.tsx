import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function GroupsPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user's groups with member details
  const { data: userGroups } = await supabase
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
    .eq('user_id', user.id)

  // Get group member counts
  const groupsWithCounts = await Promise.all(
    (userGroups || []).map(async (membership) => {
      const { count } = await supabase
        .from('group_members')
        .select('*', { count: 'exact', head: true })
        .eq('group_id', membership.groups?.id)
      
      return {
        ...membership,
        memberCount: count || 0
      }
    })
  )

  const groupsByType = {
    main: groupsWithCounts.filter(g => g.groups?.type === 'main'),
    local: groupsWithCounts.filter(g => g.groups?.type === 'local'),
    online: groupsWithCounts.filter(g => g.groups?.type === 'online'),
    special: groupsWithCounts.filter(g => g.groups?.type === 'special')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">My Groups</h1>
        <p className="text-gray-600">Manage your accountability communities</p>
      </div>

      {/* Main Community Group */}
      {groupsByType.main.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🏛️ Main Community</h2>
          <div className="grid grid-cols-1 gap-4">
            {groupsByType.main.map((membership) => (
              <Card key={membership.groups?.id} className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{membership.groups?.name}</CardTitle>
                      <CardDescription>{membership.groups?.description}</CardDescription>
                    </div>
                    <Badge variant="default">Main</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>{membership.memberCount} members</p>
                      <p>Your role: {membership.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/groups/${membership.groups?.id}`}>
                          View Logbook
                        </Link>
                      </Button>
                      {membership.groups?.telegram_chat_id && (
                        <Button asChild variant="outline" size="sm">
                          <Link 
                            href={`https://t.me/${membership.groups.telegram_chat_id.replace('@', '')}`} 
                            target="_blank"
                          >
                            Telegram
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Local Groups */}
      {groupsByType.local.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🏘️ Local Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {groupsByType.local.map((membership) => (
              <Card key={membership.groups?.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{membership.groups?.name}</CardTitle>
                      <CardDescription>{membership.groups?.description}</CardDescription>
                    </div>
                    <Badge variant="outline">Local</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>{membership.memberCount} members</p>
                      <p>Your role: {membership.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/groups/${membership.groups?.id}`}>
                          View
                        </Link>
                      </Button>
                      {membership.groups?.telegram_chat_id && (
                        <Button asChild variant="outline" size="sm">
                          <Link 
                            href={`https://t.me/${membership.groups.telegram_chat_id.replace('@', '')}`} 
                            target="_blank"
                          >
                            Chat
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Online & Special Groups */}
      {(groupsByType.online.length > 0 || groupsByType.special.length > 0) && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">🌐 Online & Special Groups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...groupsByType.online, ...groupsByType.special].map((membership) => (
              <Card key={membership.groups?.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{membership.groups?.name}</CardTitle>
                      <CardDescription>{membership.groups?.description}</CardDescription>
                    </div>
                    <Badge variant="secondary">
                      {membership.groups?.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      <p>{membership.memberCount} members</p>
                      <p>Your role: {membership.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/groups/${membership.groups?.id}`}>
                          View
                        </Link>
                      </Button>
                      {membership.groups?.telegram_chat_id && (
                        <Button asChild variant="outline" size="sm">
                          <Link 
                            href={`https://t.me/${membership.groups.telegram_chat_id.replace('@', '')}`} 
                            target="_blank"
                          >
                            Chat
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Groups */}
      {!userGroups || userGroups.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <h2 className="text-xl font-semibold mb-4">No Groups Yet</h2>
            <p className="text-gray-600 mb-6">
              You haven't joined any groups yet. Wait for admin approval to access the main community group.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}