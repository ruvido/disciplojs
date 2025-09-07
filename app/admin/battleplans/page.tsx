import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { Target, Plus, BookOpen, TrendingUp } from 'lucide-react'

export default function AdminBattleplansPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Battleplan Templates</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/dashboard">Back to Dashboard</Link>
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Currently running</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Finished plans</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Battleplan Management</CardTitle>
          <CardDescription>Manage templates and monitor active battleplans</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Target className="h-16 w-16 text-muted-foreground mb-6" />
            <p className="text-xl font-medium mb-2">Battleplan System</p>
            <p className="text-sm text-muted-foreground mb-6 max-w-md">
              Create and manage battleplan templates based on the 4-pillar methodology. 
              Monitor user progress and provide guidance for transformation journeys.
            </p>
            <div className="space-y-4 w-full max-w-sm">
              <Button className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Create First Template
              </Button>
              <Button variant="outline" className="w-full">
                <BookOpen className="mr-2 h-4 w-4" />
                View Documentation
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}