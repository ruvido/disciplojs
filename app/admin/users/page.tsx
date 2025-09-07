import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { 
  Users, 
  UserCheck, 
  UserX, 
  Calendar,
  Mail,
  MapPin,
  MoreHorizontal,
  Shield,
  Eye,
  AlertCircle
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { approveUserAction, rejectUserAction } from './actions'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function AdminUsersPage() {
  let users = null
  let error = null
  let stats = {
    totalUsers: 0,
    approvedUsers: 0,
    pendingUsers: 0
  }

  try {
    const supabase = createAdminClient()

    // Get all users with better error handling
    const { data: usersData, error: usersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (usersError) {
      console.error('Error fetching users:', usersError)
      error = usersError.message
    } else {
      users = usersData
      console.log(`✅ Fetched ${users?.length || 0} users`)
    }

    // Get stats
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })

    const { count: approvedUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('approved', true)

    const { count: pendingUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('approved', false)

    stats = {
      totalUsers: totalUsers || 0,
      approvedUsers: approvedUsers || 0,
      pendingUsers: pendingUsers || 0
    }
  } catch (err) {
    console.error('Database connection error:', err)
    error = 'Failed to connect to database. Please check your Supabase configuration.'
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              All registered users
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.approvedUsers}</div>
            <p className="text-xs text-muted-foreground">
              Active members
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingUsers}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <CardDescription>
            Manage all registered users and their permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!users || users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium">No users found</p>
              <p className="text-sm text-muted-foreground mb-4">
                {error ? 'Check your database connection' : 'Users will appear here once they register'}
              </p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Debug info:</p>
                <p>• Make sure Supabase is configured</p>
                <p>• Check SUPABASE_SERVICE_ROLE_KEY is set</p>
                <p>• Verify the users table exists</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-sm text-muted-foreground mb-4">
                Showing {users.length} user{users.length !== 1 ? 's' : ''}
              </div>
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium leading-none">{user.name || 'No name'}</p>
                        <Badge variant={user.approved ? 'default' : 'secondary'}>
                          {user.approved ? 'Approved' : 'Pending'}
                        </Badge>
                        <Badge variant="outline">
                          {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                          {user.role || 'member'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </span>
                        {user.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {user.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                      {user.bio && (
                        <p className="text-xs text-muted-foreground max-w-md truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!user.approved && (
                      <>
                        <form action={approveUserAction} className="inline">
                          <input type="hidden" name="userId" value={user.id} />
                          <Button type="submit" size="sm" variant="default">
                            <UserCheck className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                        </form>
                        <form action={rejectUserAction} className="inline">
                          <input type="hidden" name="userId" value={user.id} />
                          <Button type="submit" size="sm" variant="outline">
                            <UserX className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </form>
                      </>
                    )}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>Edit User</DropdownMenuItem>
                        <DropdownMenuItem>Send Message</DropdownMenuItem>
                        {user.approved && (
                          <DropdownMenuItem className="text-orange-600">
                            Suspend User
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem className="text-red-600">
                          Delete User
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