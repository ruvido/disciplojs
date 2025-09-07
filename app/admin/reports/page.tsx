import { Card, CardContent } from '@/components/ui/card'
import { FileText } from 'lucide-react'

export default function AdminReportsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Generate and view system reports
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">System Reports</h3>
          <p className="text-muted-foreground">
            Reporting features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}