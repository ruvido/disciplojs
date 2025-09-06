import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { registerAction } from "./actions"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Join Disciplo</CardTitle>
          <CardDescription>
            Start your transformation journey with our community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={registerAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Choose a strong password"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Your city (for local groups)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Tell us about yourself</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="What brings you to Disciplo? What are your goals?"
                rows={4}
              />
            </div>
            <Button type="submit" className="w-full">
              Create Account
            </Button>
            <div className="text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Your account will be reviewed and approved by an admin before you can access the community.
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}