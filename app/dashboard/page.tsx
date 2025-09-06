import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { 
  Target, 
  Users, 
  Trophy, 
  Calendar,
  ArrowRight,
  Plus,
  Clock,
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react'

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

  // Get user's groups with member count
  const { data: userGroups } = await supabase
    .from('group_members')
    .select(`
      *,
      groups (
        id,
        name,
        type,
        city,
        telegram_chat_id,
        max_members
      )
    `)
    .eq('user_id', user.id)

  const activeBattleplan = battleplans?.find(bp => bp.is_active)
  
  // Calculate progress for active battleplan (mock data for now)
  const calculateProgress = (battleplan: any) => {
    if (!battleplan) return 0
    const startDate = new Date(battleplan.start_date)
    const endDate = new Date(battleplan.end_date)
    const today = new Date()
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    return Math.min(Math.max((daysElapsed / totalDays) * 100, 0), 100)
  }

  const progress = calculateProgress(activeBattleplan)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            Welcome back, {userProfile.name?.split(' ')[0]}!
          </h2>
          <p className="text-muted-foreground">
            Here's an overview of your transformation journey
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {!userProfile.telegram_id && (
            <Button variant="outline" size="sm" asChild>
              <Link href="/profile/telegram">
                <MessageSquare className="mr-2 h-4 w-4" />
                Connect Telegram
              </Link>
            </Button>
          )}
          <Button size="sm" asChild>
            <Link href="/battleplan/new">
              <Plus className="mr-2 h-4 w-4" />
              New Battleplan
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Battleplan
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeBattleplan ? '1' : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              {activeBattleplan ? `${Math.round(progress)}% complete` : 'Start your journey'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              My Groups
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userGroups?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active communities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {battleplans?.filter(bp => !bp.is_active).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Battleplans finished
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Streak
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">
              Days consistent
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Current Battleplan - Larger Card */}
        <Card className="col-span-4">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Current Battleplan</CardTitle>
                <CardDescription>
                  Your active transformation journey
                </CardDescription>
              </div>
              {activeBattleplan && (
                <Badge variant="default">
                  <Clock className="mr-1 h-3 w-3" />
                  {activeBattleplan.duration} days
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeBattleplan ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">{activeBattleplan.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Priority: {activeBattleplan.priority}
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Started {new Date(activeBattleplan.start_date).toLocaleDateString()}</span>
                    <span>Ends {new Date(activeBattleplan.end_date).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button asChild>
                    <Link href={`/battleplan/${activeBattleplan.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/battleplan/track">
                      <Activity className="mr-2 h-4 w-4" />
                      Track Today
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No active battleplan</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start your transformation journey today
                </p>
                <Button asChild>
                  <Link href="/battleplan/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Battleplan
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Groups - Sidebar */}
        <Card className="col-span-3">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Groups</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/groups">
                  View all
                  <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {userGroups && userGroups.length > 0 ? (
              <div className="space-y-3">
                {userGroups.slice(0, 3).map((membership) => (
                  <div key={membership.group_id} className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-xs">
                        {membership.groups?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {membership.groups?.name}
                      </p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          {membership.groups?.type}
                        </Badge>
                        {membership.role === 'admin' && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            Admin
                          </Badge>
                        )}
                      </div>
                    </div>
                    {membership.groups?.telegram_chat_id && (
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`https://t.me/${membership.groups.telegram_chat_id}`} target="_blank">
                          <MessageSquare className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                ))}
                {userGroups.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{userGroups.length - 3} more groups
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Users className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm font-medium mb-1">No groups yet</p>
                <p className="text-xs text-muted-foreground mb-3">
                  Join a community for accountability
                </p>
                <Button size="sm" asChild>
                  <Link href="/groups">
                    Browse Groups
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Battleplans */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Battleplan History</CardTitle>
              <CardDescription>
                Your transformation journey over time
              </CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/battleplan">
                View all
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {battleplans && battleplans.length > 0 ? (
            <div className="space-y-3">
              {battleplans.slice(0, 5).map((battleplan) => (
                <div key={battleplan.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`h-2 w-2 rounded-full ${battleplan.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                    <div>
                      <p className="text-sm font-medium">{battleplan.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {battleplan.priority} • {battleplan.duration} days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={battleplan.is_active ? 'default' : 'secondary'}>
                      {battleplan.is_active ? 'Active' : 'Completed'}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/battleplan/${battleplan.id}`}>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No battleplans created yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}