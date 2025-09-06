import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Transform Your Life with <span className="text-blue-600">Disciplo</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join a community of disciples committed to transformation through accountability, 
          battleplans, and shared growth.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button size="lg" className="w-full sm:w-auto">
              Start Your Journey
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Your Transformation Toolkit
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Battleplans</CardTitle>
              <CardDescription>
                30-60-90 day transformation plans with 4 pillars
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Structure your growth across Interiority, Relationships, Resources, and Health 
                with daily routines and clear objectives.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Group Accountability</CardTitle>
              <CardDescription>
                Connect with local and online communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Join groups in your city or online, share your progress, and support 
                others on their transformation journey.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Telegram Integration</CardTitle>
              <CardDescription>
                Stay connected with your community
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Seamlessly connect with your groups through Telegram for daily 
                encouragement, check-ins, and community support.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Life?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of disciples committed to growth and transformation
          </p>
          <Link href="/register">
            <Button size="lg" variant="secondary">
              Join Disciplo Today
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2024 Disciplo. Built for transformation.</p>
        </div>
      </footer>
    </div>
  )
}