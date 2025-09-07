import { Card, CardContent } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function AdminLogbooksPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Logbooks</h2>
        <p className="text-muted-foreground">
          Manage group logbooks and meeting records
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Logbook Management</h3>
          <p className="text-muted-foreground">
            Logbook features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}