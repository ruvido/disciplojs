import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { 
  Target, 
  Users, 
  Calendar, 
  TrendingUp, 
  Plus,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default async function MemberDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.approved) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-orange-600" />
            </div>
            <CardTitle>Pending Approval</CardTitle>
            <CardDescription>
              Your account is awaiting admin approval
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              Thank you for registering! An administrator will review your application shortly. 
              You&apos;ll receive an email once your account is approved.
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <Link href="/register">Update Registration</Link>
              </Button>
              <form action="/api/auth/signout" method="post">
                <Button variant="ghost" type="submit" className="w-full">
                  Sign Out
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Welcome back, {profile.name}!</h1>
                <p className="text-muted-foreground">Ready to continue your transformation journey?</p>
              </div>
            </div>
            <Badge variant="secondary">
              Member
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Battleplans</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Current plans</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">Main group</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Streak</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">overall</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Actions */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Start Your Journey</CardTitle>
              <CardDescription>
                Create your first battleplan to begin your transformation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Target className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No Active Battleplans</p>
                <p className="text-sm text-muted-foreground mb-6">
                  A battleplan is your structured approach to transformation using the 4-pillar methodology.
                </p>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Battleplan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Groups</CardTitle>
              <CardDescription>
                Connect with your accountability groups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Main Group</p>
                    <p className="text-xs text-muted-foreground">All approved members</p>
                  </div>
                </div>
                <Badge variant="outline">Member</Badge>
              </div>
              
              <Alert>
                <Users className="h-4 w-4" />
                <AlertDescription>
                  <strong>Join More Groups:</strong> Find local or special interest groups to enhance your accountability journey.
                  <Button variant="link" className="p-0 h-auto ml-2">
                    Browse Groups
                  </Button>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest progress and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No Activity Yet</p>
              <p className="text-sm text-muted-foreground">
                Start a battleplan to begin tracking your progress
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-4">
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Target className="h-6 w-6" />
            <span className="text-sm">New Battleplan</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <Users className="h-6 w-6" />
            <span className="text-sm">Browse Groups</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <CheckCircle className="h-6 w-6" />
            <span className="text-sm">Daily Check-in</span>
          </Button>
          <Button variant="outline" className="h-20 flex-col space-y-2">
            <TrendingUp className="h-6 w-6" />
            <span className="text-sm">View Progress</span>
          </Button>
        </div>
      </main>
    </div>
  )
}