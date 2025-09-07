import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Shield, 
  Users, 
  MapPin,
  Plus,
  Settings,
  AlertCircle,
  MessageCircle,
  Calendar
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function AdminGroupsPage() {
  let groups = null
  let error = null
  let stats = {
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    mainGroup: null
  }

  try {
    const supabase = createAdminClient()

    // Get all groups
    const { data: groupsData, error: groupsError } = await supabase
      .from('groups')
      .select(`
        *,
        group_members (
          user_id,
          role,
          users (
            name,
            email,
            avatar_url
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (groupsError) {
      console.error('Error fetching groups:', groupsError)
      error = groupsError.message
    } else {
      groups = groupsData
      stats.totalGroups = groups?.length || 0
      stats.activeGroups = groups?.filter(g => g.group_members?.length > 0).length || 0
      stats.totalMembers = groups?.reduce((sum, g) => sum + (g.group_members?.length || 0), 0) || 0
      stats.mainGroup = groups?.find(g => g.is_default) || null
    }
  } catch (err) {
    console.error('Database error:', err)
    error = 'Failed to connect to database'
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Groups Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              Back to Dashboard
            </Link>
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <p className="text-xs text-muted-foreground">All registered groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeGroups}</div>
            <p className="text-xs text-muted-foreground">With members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Main Group</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.mainGroup ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.mainGroup ? 'Configured' : 'Not set'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Group Setup */}
      {!stats.mainGroup && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Main Group Not Configured:</strong> Set up the default group that all approved users will automatically join.
            <Button variant="link" className="p-0 h-auto ml-2">
              Configure Main Group
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Groups List */}
      <Card>
        <CardHeader>
          <CardTitle>All Groups</CardTitle>
          <CardDescription>
            Manage accountability groups and their members
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!groups || groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Shield className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No groups yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create the first group to get started
              </p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Group
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Showing {groups.length} group{groups.length !== 1 ? 's' : ''}
              </div>
              
              {groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Shield className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-medium leading-none">{group.name}</p>
                        {group.is_default && (
                          <Badge variant="default">Main Group</Badge>
                        )}
                        <Badge variant="outline" className="capitalize">
                          {group.type}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {group.description || 'No description'}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Users className="h-3 w-3 mr-1" />
                          {group.group_members?.length || 0} member{(group.group_members?.length || 0) !== 1 ? 's' : ''}
                        </span>
                        {group.city && (
                          <span className="text-xs text-muted-foreground flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {group.city}
                          </span>
                        )}
                        {group.telegram_chat_id && (
                          <Badge variant="outline" className="text-xs">
                            <MessageCircle className="w-3 h-3 mr-1" />
                            Telegram
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(group.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/groups/${group.id}`}>
                        View Details
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}