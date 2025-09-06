'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { registerAction } from "./actions"
import Link from "next/link"
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, CheckCircle } from "lucide-react"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const searchParams = useSearchParams()
  const urlError = searchParams.get('error')
  const urlSuccess = searchParams.get('success')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    
    try {
      await registerAction(formData)
      setSuccess(true)
    } catch (err) {
      setError('Registration failed. Please check your information and try again.')
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'email_exists':
        return 'This email is already registered. Please sign in instead.'
      case 'invalid_input':
        return 'Please check your information. Password must be at least 8 characters with uppercase, lowercase, and numbers.'
      case 'registration_failed':
        return 'Registration failed. Please try again later.'
      default:
        return error
    }
  }

  if (success || urlSuccess === 'registered') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center">Registration Successful!</CardTitle>
            <CardDescription className="text-center">
              Your account has been created and is pending admin approval.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600 text-center">
              We&apos;ll notify you by email once your account is approved. This usually takes 24-48 hours.
            </p>
            <Button asChild className="w-full">
              <Link href="/login">Return to Sign In</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          {(error || urlError) && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                {getErrorMessage(error || urlError)}
              </AlertDescription>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your@email.com"
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Min 8 chars, uppercase, lowercase, number"
                required
                disabled={isLoading}
                autoComplete="new-password"
                minLength={8}
              />
              <p className="text-xs text-gray-500">
                Must contain uppercase, lowercase, and numbers
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Your full name"
                required
                disabled={isLoading}
                autoComplete="name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                type="text"
                placeholder="Your city (for local groups)"
                disabled={isLoading}
                autoComplete="address-level2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Tell us about yourself</Label>
              <Textarea
                id="bio"
                name="bio"
                placeholder="What brings you to Disciplo? What are your goals?"
                rows={4}
                disabled={isLoading}
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
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