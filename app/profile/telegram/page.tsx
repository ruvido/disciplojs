import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function TelegramConnectionPage() {
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get user profile
  const { data: userProfile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!userProfile) {
    redirect('/login')
  }

  const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'disciplo_bot'
  const connectLink = `https://t.me/${botUsername}?start=${user.id}`

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold mt-4">Connect Telegram</h1>
        <p className="text-gray-600">Link your Telegram account to access groups and receive notifications</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Telegram Connection Status</CardTitle>
          <CardDescription>
            Connect your Telegram to join community groups and get daily reminders
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {userProfile.telegram_id ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium text-green-900">✅ Telegram Connected</p>
                  <p className="text-sm text-green-700">@{userProfile.telegram_username || 'Connected'}</p>
                </div>
                <Badge variant="outline" className="bg-green-100">Connected</Badge>
              </div>
              
              <div className="space-y-2">
                <h3 className="font-medium">What you can do now:</h3>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>• Receive daily routine reminders</li>
                  <li>• Join community Telegram groups</li>
                  <li>• Check your battleplan with /battleplan</li>
                  <li>• View your groups with /groups</li>
                  <li>• Get accountability check-ins</li>
                </ul>
              </div>

              <div className="pt-4">
                <Button asChild variant="outline">
                  <Link href={`https://t.me/${botUsername}`} target="_blank">
                    Open Disciplo Bot
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="font-medium text-yellow-900">⚠️ Telegram Not Connected</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Connect your Telegram to unlock all features
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">How to connect:</h3>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-2">
                    <span className="font-medium">1.</span>
                    <span>Click the button below to open Telegram</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">2.</span>
                    <span>Press &quot;Start&quot; in the bot chat</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">3.</span>
                    <span>Your account will be automatically linked</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="font-medium">4.</span>
                    <span>Return here to see your connection status</span>
                  </li>
                </ol>

                <div className="pt-4">
                  <Button asChild size="lg" className="w-full">
                    <Link href={connectLink} target="_blank">
                      Connect Telegram Account
                    </Link>
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Make sure you have Telegram installed on your device
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Why Connect Telegram?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">🔔 Daily Reminders</h4>
              <p className="text-sm text-gray-600">
                Get gentle reminders for your daily routines and check-ins
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">👥 Group Access</h4>
              <p className="text-sm text-gray-600">
                Automatically join your accountability groups on Telegram
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📊 Quick Updates</h4>
              <p className="text-sm text-gray-600">
                Check your battleplan progress without opening the webapp
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🤝 Community Support</h4>
              <p className="text-sm text-gray-600">
                Stay connected with your transformation community
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}