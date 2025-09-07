import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart } from 'lucide-react'

export default function AdminAnalyticsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analytics</h2>
        <p className="text-muted-foreground">
          System usage statistics and insights
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <BarChart className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Analytics Dashboard</h3>
          <p className="text-muted-foreground">
            Analytics and reporting features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}