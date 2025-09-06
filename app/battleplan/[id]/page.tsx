import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { redirect } from 'next/navigation'

interface BattleplanPageProps {
  params: Promise<{ id: string }>
}

export default async function BattleplanPage({ params }: BattleplanPageProps) {
  const { id } = await params
  const supabase = await createClient()
  
  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Get battleplan with pillars and routines
  const { data: battleplan } = await supabase
    .from('battleplans')
    .select(`
      *,
      pillars (
        *,
        routines (*)
      )
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!battleplan) {
    redirect('/dashboard')
  }

  const daysSinceStart = Math.floor(
    (Date.now() - new Date(battleplan.start_date).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  const duration = battleplan.duration || 30  // Default to 30 days if null
  const daysRemaining = Math.max(0, duration - daysSinceStart)
  const progress = Math.min(100, (daysSinceStart / duration) * 100)

  const pillarColors = {
    interiority: 'text-purple-700',
    relationships: 'text-green-700', 
    resources: 'text-blue-700',
    health: 'text-red-700'
  }

  const pillarEmojis = {
    interiority: '🧘',
    relationships: '🤝',
    resources: '💼',
    health: '💪'
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{battleplan.title}</h1>
            <p className="text-xl text-gray-600 mb-4">{battleplan.priority}</p>
            {battleplan.priority_description && (
              <p className="text-gray-600 mb-4">{battleplan.priority_description}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Badge variant={battleplan.is_active ? 'default' : 'secondary'}>
              {battleplan.is_active ? 'Active' : 'Completed'}
            </Badge>
            <Badge variant="outline">
              {battleplan.duration} days
            </Badge>
          </div>
        </div>

        {/* Progress */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600">
                Day {Math.max(0, daysSinceStart)} of {battleplan.duration}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Started: {new Date(battleplan.start_date).toLocaleDateString()}</span>
              <span>
                {daysRemaining > 0 
                  ? `${daysRemaining} days remaining`
                  : 'Completed'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pillars */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Pillars</TabsTrigger>
          <TabsTrigger value="interiority">🧘 Interiority</TabsTrigger>
          <TabsTrigger value="relationships">🤝 Relationships</TabsTrigger>
          <TabsTrigger value="resources">💼 Resources</TabsTrigger>
          <TabsTrigger value="health">💪 Health</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {battleplan.pillars?.map((pillar) => (
              <Card key={pillar.id}>
                <CardHeader>
                  <CardTitle className={`flex items-center gap-2 ${pillarColors[pillar.type]}`}>
                    <span className="text-2xl">{pillarEmojis[pillar.type]}</span>
                    {pillar.type.charAt(0).toUpperCase() + pillar.type.slice(1)}
                  </CardTitle>
                  <CardDescription>{pillar.objective}</CardDescription>
                </CardHeader>
                {pillar.routines && pillar.routines.length > 0 && (
                  <CardContent>
                    <h4 className="font-medium mb-3">Daily Routines:</h4>
                    <ul className="space-y-2">
                      {pillar.routines
                        .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                        .map((routine) => (
                        <li key={routine.id} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                          <span className="text-sm">{routine.title}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        {battleplan.pillars?.map((pillar) => (
          <TabsContent key={pillar.type} value={pillar.type} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className={`flex items-center gap-2 ${pillarColors[pillar.type]}`}>
                  <span className="text-3xl">{pillarEmojis[pillar.type]}</span>
                  {pillar.type.charAt(0).toUpperCase() + pillar.type.slice(1)}
                </CardTitle>
                <CardDescription className="text-lg">{pillar.objective}</CardDescription>
              </CardHeader>
              {pillar.routines && pillar.routines.length > 0 && (
                <CardContent>
                  <h4 className="font-medium mb-4">Daily Routines:</h4>
                  <div className="space-y-3">
                    {pillar.routines
                      .sort((a, b) => (a.order_index || 0) - (b.order_index || 0))
                      .map((routine) => (
                      <div key={routine.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{routine.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {routine.frequency}
                          </Badge>
                        </div>
                        {routine.description && (
                          <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <Button asChild>
          <Link href="/battleplan/track">
            Track Today&apos;s Progress
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/battleplan/new">
            Create New Battleplan
          </Link>
        </Button>
        {!battleplan.is_active && (
          <Button variant="outline">
            Restart Battleplan
          </Button>
        )}
      </div>
    </div>
  )
}