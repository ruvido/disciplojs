import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save } from 'lucide-react'

export default function AdminSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">System Settings</h2>
          <p className="text-muted-foreground">
            Configure global system settings and preferences
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>General Settings</CardTitle>
            <CardDescription>
              Basic system configuration
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input id="siteName" defaultValue="Disciplo" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">Site URL</Label>
                <Input id="siteUrl" defaultValue={process.env.NEXT_PUBLIC_APP_URL || ''} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea 
                id="siteDescription" 
                defaultValue="Join a community of disciples committed to transformation through accountability, battleplans, and shared growth."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Email Settings</CardTitle>
            <CardDescription>
              Configure email notifications and templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fromEmail">From Email</Label>
                <Input id="fromEmail" defaultValue="noreply@disciplo.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromName">From Name</Label>
                <Input id="fromName" defaultValue="Disciplo" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Registration</CardTitle>
            <CardDescription>
              Control how new users can join the platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="requireApproval" defaultChecked />
              <Label htmlFor="requireApproval">Require admin approval for new users</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="autoAddToMainGroup" defaultChecked />
              <Label htmlFor="autoAddToMainGroup">Automatically add approved users to main group</Label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )
}