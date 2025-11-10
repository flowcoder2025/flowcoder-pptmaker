'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface NavItem {
  label: string
  href: string
  icon: string
}

const navItems: NavItem[] = [
  { label: '대시보드', href: '/admin', icon: '📊' },
  { label: '사용자 관리', href: '/admin/users', icon: '👥' },
  { label: '크래딧 관리', href: '/admin/credits', icon: '💳' },
  { label: '구독 관리', href: '/admin/subscriptions', icon: '📋' },
  { label: '모니터링', href: '/admin/monitoring', icon: '📈' },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div
      style={{
        width: '240px',
        height: '100vh',
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
      }}
    >
      {/* 헤더 */}
      <div
        style={{
          padding: '20px',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Link href="/admin">
          <h1
            style={{
              fontSize: '20px',
              fontWeight: 700,
              color: '#1F2937',
              margin: 0,
            }}
          >
            🔧 Admin
          </h1>
        </Link>
      </div>

      {/* 네비게이션 */}
      <nav
        style={{
          flex: 1,
          padding: '16px',
          overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  style={{
                    width: '100%',
                    justifyContent: 'flex-start',
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <span style={{ marginRight: '8px' }}>{item.icon}</span>
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </nav>

      <Separator />

      {/* 푸터 */}
      <div
        style={{
          padding: '16px',
        }}
      >
        <Link href="/">
          <Button variant="outline" className="w-full">
            ← 메인으로
          </Button>
        </Link>
      </div>
    </div>
  )
}
