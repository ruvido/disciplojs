import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function MemberDashboard() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userProfile?.approved) {
    redirect('/pending-approval')
  }

  // Get user's battleplans
  const { data: battleplans } = await supabase
    .from('battleplans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Get user's groups
  const { data: userGroups } = await supabase
    .from('group_members')
    .select(`
      *,
      groups (
        id,
        name,
        type,
        telegram_chat_id
      )
    `)
    .eq('user_id', user.id)

  const activeBattleplan = battleplans?.find(bp => bp.is_active)

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {userProfile.name}</h1>
          <p className="text-gray-600">Continue your transformation journey</p>
        </div>
        <div className="flex gap-2">
          {!userProfile.telegram_id && (
            <Button asChild variant="outline">
              <Link href="/profile/telegram">Connect Telegram</Link>
            </Button>
          )}
          <Button asChild>
            <Link href="/logout">Sign Out</Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Battleplan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeBattleplan ? '1' : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeBattleplan ? activeBattleplan.title : 'No active battleplan'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Groups</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Community groups
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Battleplans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{battleplans?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Transformation journeys
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Battleplan */}
        <Card>
          <CardHeader>
            <CardTitle>Current Battleplan</CardTitle>
            <CardDescription>
              Your active transformation journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeBattleplan ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{activeBattleplan.title}</h3>
                <p className="text-gray-600">{activeBattleplan.priority}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{activeBattleplan.duration} days</Badge>
                  <Badge variant={activeBattleplan.is_active ? 'default' : 'secondary'}>
                    {activeBattleplan.is_active ? 'Active' : 'Completed'}
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/battleplan/${activeBattleplan.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/battleplan/track">
                      Track Today
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No active battleplan</p>
                <Button asChild>
                  <Link href="/battleplan/new">
                    Create Your First Battleplan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Groups */}
        <Card>
          <CardHeader>
            <CardTitle>My Groups</CardTitle>
            <CardDescription>
              Your accountability communities
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userGroups && userGroups.length > 0 ? (
              <div className="space-y-4">
                {userGroups.map((membership) => (
                  <div key={membership.group_id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{membership.groups?.name}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {membership.groups?.type}
                        </Badge>
                        <Badge variant={membership.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                          {membership.role}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/groups/${membership.group_id}`}>
                          Logbook
                        </Link>
                      </Button>
                      {membership.groups?.telegram_chat_id && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`https://t.me/${membership.groups.telegram_chat_id}`} target="_blank">
                            Telegram
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button asChild variant="outline" className="w-full">
                  <Link href="/groups">
                    Browse All Groups
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Not in any groups yet</p>
                <Button asChild>
                  <Link href="/groups">
                    Join Groups
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Recent Battleplans</CardTitle>
          <CardDescription>
            Your transformation journey history
          </CardDescription>
        </CardHeader>
        <CardContent>
          {battleplans && battleplans.length > 0 ? (
            <div className="space-y-4">
              {battleplans.slice(0, 5).map((battleplan) => (
                <div key={battleplan.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h4 className="font-medium">{battleplan.title}</h4>
                    <p className="text-sm text-gray-500">{battleplan.priority}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{battleplan.duration} days</Badge>
                    <Badge variant={battleplan.is_active ? 'default' : 'secondary'}>
                      {battleplan.is_active ? 'Active' : 'Completed'}
                    </Badge>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/battleplan/${battleplan.id}`}>
                        View
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
              <Button asChild variant="outline" className="w-full">
                <Link href="/battleplan">
                  View All Battleplans
                </Link>
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No battleplans created yet</p>
              <Button asChild>
                <Link href="/battleplan/new">
                  Create Your First Battleplan
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}