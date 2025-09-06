import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Header } from '@/components/layout/header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()
  
  if (!profile?.approved) {
    redirect('/pending-approval')
  }
  
  return (
    <div className="min-h-screen bg-background">
      <Header user={profile ? {
        id: profile.id,
        email: profile.email,
        name: profile.name || undefined,
        role: profile.role || undefined,
        avatar_url: profile.avatar_url || undefined
      } : undefined} />
      <main className="container mx-auto">
        {children}
      </main>
    </div>
  )
}