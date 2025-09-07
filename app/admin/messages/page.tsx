import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'

export default function AdminMessagesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Messages</h2>
        <p className="text-muted-foreground">
          Messaging system and notifications
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Messaging System</h3>
          <p className="text-muted-foreground">
            Messaging features will be implemented here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}