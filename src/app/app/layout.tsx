'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, BarChart2, Users, Bell, Settings } from 'lucide-react'

const navItems = [
  { href: '/app', icon: Home, label: 'Home' },
  { href: '/app/daily', icon: Calendar, label: 'Daily' },
  { href: '/app/monthly', icon: BarChart2, label: 'Monthly' },
  { href: '/app/split', icon: Users, label: 'Split' },
  { href: '/app/reminders', icon: Bell, label: 'Reminders' },
  { href: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="app-container">
      <main style={{ paddingBottom: '80px' }}>
        {children}
      </main>

      <nav className="bottom-nav">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={active ? 'active' : ''}>
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
