import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { 
  UserCheck, 
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  AlertCircle,
  Users
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from '@/components/ui/alert'
import { approveUserAction, rejectUserAction } from '../users/actions'

export default async function PendingApprovalsPage() {
  let pendingUsers = null
  let error = null

  try {
    const supabase = createAdminClient()

    // Get all pending users
    const { data, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('approved', false)
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching pending users:', fetchError)
      error = fetchError.message
    } else {
      pendingUsers = data
    }
  } catch (err) {
    console.error('Database error:', err)
    error = 'Failed to connect to database'
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              Back to Dashboard
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              All Users
            </Link>
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
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingUsers?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingUsers?.filter(u => 
                u.created_at && new Date(u.created_at).toDateString() === new Date().toDateString()
              ).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              New today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingUsers?.filter(u => {
                if (!u.created_at) return false
                const created = new Date(u.created_at)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return created >= weekAgo
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              New this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Oldest</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {pendingUsers && pendingUsers.length > 0 && pendingUsers[pendingUsers.length - 1]?.created_at
                ? Math.ceil((Date.now() - new Date(pendingUsers[pendingUsers.length - 1].created_at!).getTime()) / (1000 * 60 * 60 * 24))
                : 0}d
            </div>
            <p className="text-xs text-muted-foreground">
              Days waiting
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Review Queue</CardTitle>
          <CardDescription>
            New user registrations requiring approval
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!pendingUsers || pendingUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground mb-4">
                No pending user approvals at the moment
              </p>
              <Button variant="outline" asChild>
                <Link href="/admin/users">
                  <Users className="mr-2 h-4 w-4" />
                  View All Users
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                {pendingUsers.length} user{pendingUsers.length !== 1 ? 's' : ''} waiting for approval
              </div>
              
              {pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-6 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-base font-medium leading-none">{user.name || 'No name'}</p>
                        <Badge variant="secondary">
                          Pending
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                      <div className="flex items-center gap-4 mt-2">
                        {user.city && (
                          <Badge variant="outline" className="text-xs">
                            📍 {user.city}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'} at {user.created_at ? new Date(user.created_at).toLocaleTimeString() : 'Unknown'}
                        </span>
                      </div>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground max-w-md mt-2 p-2 bg-muted rounded">
                          &quot;{user.bio}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <form action={approveUserAction} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <Button type="submit" size="default" className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </form>
                    <form action={rejectUserAction} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <Button type="submit" size="default" variant="outline" className="border-red-200 text-red-600 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </form>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            View Full Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Send Message
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Request More Info
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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