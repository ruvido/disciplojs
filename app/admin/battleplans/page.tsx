import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Target, Plus } from 'lucide-react'
import Link from 'next/link'

export default function AdminBattleplansPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Battleplan Templates</h2>
          <p className="text-muted-foreground">
            Manage battleplan templates for members to use
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/battleplans/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Target className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Battleplan Templates</h3>
          <p className="text-muted-foreground mb-4">
            Create and manage battleplan templates to help members get started with their transformation journey.
          </p>
          <Button asChild>
            <Link href="/admin/battleplans/new">Create First Template</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}