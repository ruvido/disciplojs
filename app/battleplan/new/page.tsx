import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createBattleplanAction } from "./actions"
import Link from "next/link"

export default function NewBattleplanPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Your Battleplan</h1>
        <p className="text-gray-600">
          Design your transformation journey with a clear priority and structured approach
        </p>
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to Dashboard
        </Link>
      </div>

      <form action={createBattleplanAction} className="space-y-8">
        {/* Priority Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Priority</CardTitle>
            <CardDescription>
              What is the ONE thing you want to transform in the next 30-90 days?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Battleplan Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g., Transform My Physical Health"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority Statement *</Label>
              <Input
                id="priority"
                name="priority"
                placeholder="e.g., Lose 15 pounds and build strength"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority_description">Why is this important to you?</Label>
              <Textarea
                id="priority_description"
                name="priority_description"
                placeholder="Describe why this transformation matters to you..."
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration *</Label>
              <Select name="duration" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="60">60 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Four Pillars */}
        <Card>
          <CardHeader>
            <CardTitle>The Four Pillars</CardTitle>
            <CardDescription>
              Define your objectives across the four areas of transformation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Interiority */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-purple-700">🧘 Interiority</h3>
              <p className="text-sm text-gray-600 mb-3">Spiritual growth, mental wellness, mindfulness</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="interiority_objective">Objective *</Label>
                  <Input
                    id="interiority_objective"
                    name="interiority_objective"
                    placeholder="e.g., Develop a consistent meditation practice"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="interiority_routines">Daily Routines (one per line)</Label>
                  <Textarea
                    id="interiority_routines"
                    name="interiority_routines"
                    placeholder="e.g., 10 minutes morning meditation&#10;Gratitude journaling before bed"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Relationships */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-green-700">🤝 Relationships</h3>
              <p className="text-sm text-gray-600 mb-3">Family, friends, community, service to others</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="relationships_objective">Objective *</Label>
                  <Input
                    id="relationships_objective"
                    name="relationships_objective"
                    placeholder="e.g., Strengthen family bonds and build new friendships"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="relationships_routines">Daily Routines (one per line)</Label>
                  <Textarea
                    id="relationships_routines"
                    name="relationships_routines"
                    placeholder="e.g., Call one family member or friend&#10;Perform one act of service"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Resources */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-blue-700">💼 Resources</h3>
              <p className="text-sm text-gray-600 mb-3">Career, finances, skills, professional growth</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="resources_objective">Objective *</Label>
                  <Input
                    id="resources_objective"
                    name="resources_objective"
                    placeholder="e.g., Increase income by 20% and learn new skills"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="resources_routines">Daily Routines (one per line)</Label>
                  <Textarea
                    id="resources_routines"
                    name="resources_routines"
                    placeholder="e.g., 1 hour of skill development&#10;Track and optimize expenses"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            {/* Health */}
            <div className="border rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2 text-red-700">💪 Health</h3>
              <p className="text-sm text-gray-600 mb-3">Physical fitness, nutrition, sleep, energy</p>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="health_objective">Objective *</Label>
                  <Input
                    id="health_objective"
                    name="health_objective"
                    placeholder="e.g., Build strength and improve cardiovascular health"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="health_routines">Daily Routines (one per line)</Label>
                  <Textarea
                    id="health_routines"
                    name="health_routines"
                    placeholder="e.g., 30 minutes exercise&#10;Eat 5 servings of vegetables&#10;8 hours of sleep"
                    rows={3}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex gap-4">
          <Button type="submit" size="lg">
            Create Battleplan
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/dashboard">
              Cancel
            </Link>
          </Button>
        </div>
      </form>
    </div>
  )
}