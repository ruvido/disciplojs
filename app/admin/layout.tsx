import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/layout/admin-sidebar'
import { Header } from '@/components/layout/header'

export default async function AdminLayout({
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
  
  // Check if user is admin
  if (profile?.role !== 'admin') {
    redirect('/dashboard')
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
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 lg:pl-64">
          {children}
        </main>
      </div>
    </div>
  )
}