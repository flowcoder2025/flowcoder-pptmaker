import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { redirect } from 'next/navigation'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

export const metadata = {
  title: 'Admin - FlowCoder PPT Maker',
  description: '관리자 페이지',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // 인증 체크
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  // 관리자 권한 체크
  try {
    await requireAdmin(session.user.id)
  } catch {
    // 관리자 권한이 없으면 메인 페이지로 리다이렉트
    redirect('/')
  }

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        background: '#F9FAFB',
      }}
    >
      {/* 사이드바 */}
      <AdminSidebar />

      {/* 메인 컨텐츠 */}
      <main
        style={{
          marginLeft: '240px',
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
        }}
      >
        {children}
      </main>
    </div>
  )
}
