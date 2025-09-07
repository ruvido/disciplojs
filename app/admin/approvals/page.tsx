import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  UserCheck, 
  UserX, 
  Clock,
  Mail,
  MapPin,
  Calendar,
  FileText,
  CheckCircle
} from 'lucide-react'
import { approveUserAction, rejectUserAction } from '../users/actions'

export default async function AdminApprovalsPage() {
  const supabase = await createClient()

  // Get pending users
  const { data: pendingUsers } = await supabase
    .from('users')
    .select('*')
    .eq('approved', false)
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pending Approvals</h2>
          <p className="text-muted-foreground">
            Review and approve new member registrations
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-sm">
            <Clock className="mr-2 h-4 w-4" />
            {pendingUsers?.length || 0} pending
          </Badge>
        </div>
      </div>

      {!pendingUsers || pendingUsers.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
            <p className="text-muted-foreground">No pending user approvals at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {pendingUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback className="text-lg">
                        {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">{user.name}</CardTitle>
                      <CardDescription className="text-base">
                        {user.email}
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        {user.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {user.city}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Registered {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Clock className="mr-1 h-3 w-3" />
                    Pending
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {user.bio && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      About
                    </h4>
                    <p className="text-sm text-muted-foreground bg-accent/50 p-3 rounded-md">
                      {user.bio}
                    </p>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      User ID: {user.id.slice(0, 8)}...
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <form action={rejectUserAction} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <Button type="submit" variant="outline" size="sm">
                        <UserX className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </form>
                    
                    <form action={approveUserAction} className="inline">
                      <input type="hidden" name="userId" value={user.id} />
                      <Button type="submit" size="sm">
                        <UserCheck className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}