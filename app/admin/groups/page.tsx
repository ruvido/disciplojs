import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Shield, Users, MapPin, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminGroupsPage() {
  const supabase = await createClient()

  const { data: groups } = await supabase
    .from('groups')
    .select(`
      *,
      group_members (count)
    `)
    .order('created_at', { ascending: false })

  const { count: totalGroups } = await supabase
    .from('groups')
    .select('*', { count: 'exact' })

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Groups Management</h2>
          <p className="text-muted-foreground">
            Manage all accountability groups and their members
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/groups/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Groups</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalGroups || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Groups</CardTitle>
          <CardDescription>
            Accountability groups across all cities and types
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!groups || groups.length === 0 ? (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium">No groups found</p>
              <p className="text-sm text-muted-foreground mb-4">Create your first group to get started</p>
              <Button asChild>
                <Link href="/admin/groups/new">Create Group</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{group.name}</h4>
                      <Badge variant={group.is_default ? 'default' : 'secondary'}>
                        {group.is_default ? 'Main' : group.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {Array.isArray(group.group_members) ? group.group_members.length : 0} members
                      </span>
                      {group.city && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {group.city}
                        </span>
                      )}
                    </div>
                    {group.description && (
                      <p className="text-sm text-muted-foreground">{group.description}</p>
                    )}
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/admin/groups/${group.id}`}>View</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}