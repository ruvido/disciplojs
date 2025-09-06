import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Account Under Review</CardTitle>
          <CardDescription>
            Your registration has been submitted successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            Welcome to Disciplo! Your account is currently being reviewed by our team. 
            You'll receive an email once your account is approved and you can start your transformation journey.
          </p>
          <p className="text-sm text-gray-500">
            This usually takes 1-2 business days. Thank you for your patience!
          </p>
          <div className="pt-4">
            <Link href="/">
              <Button variant="outline">Back to Home</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}