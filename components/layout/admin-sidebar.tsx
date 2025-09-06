'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  LayoutDashboard,
  Users,
  Target,
  Settings,
  Shield,
  BookOpen,
  MessageSquare,
  BarChart,
  UserCheck,
  FileText
} from 'lucide-react'

const sidebarItems = [
  {
    title: 'Overview',
    href: '/admin/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
  },
  {
    title: 'Pending Approvals',
    href: '/admin/approvals',
    icon: UserCheck,
  },
  {
    title: 'Groups',
    href: '/admin/groups',
    icon: Shield,
  },
  {
    title: 'Battleplans',
    href: '/admin/battleplans',
    icon: Target,
  },
  {
    title: 'Logbooks',
    href: '/admin/logbooks',
    icon: BookOpen,
  },
  {
    title: 'Analytics',
    href: '/admin/analytics',
    icon: BarChart,
  },
  {
    title: 'Messages',
    href: '/admin/messages',
    icon: MessageSquare,
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="hidden lg:flex h-full w-64 flex-col fixed inset-y-0 z-50">
      <div className="flex h-full flex-col gap-y-5 overflow-y-auto border-r bg-background px-6 pb-4">
        <div className="flex h-16 shrink-0 items-center">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.href}
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={cn(
                    'w-full justify-start',
                    pathname === item.href && 'bg-secondary'
                  )}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="mr-3 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              )
            })}
          </nav>
        </ScrollArea>
      </div>
    </div>
  )
}