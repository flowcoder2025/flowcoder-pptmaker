import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  // 오늘 날짜 (00:00:00)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 병렬로 통계 데이터 조회
  const [
    totalUsers,
    activeSubscriptions,
    creditStats,
    todayGenerations,
    recentActivities,
  ] = await Promise.all([
    // 1. 전체 사용자 수
    prisma.user.count(),

    // 2. 활성 구독 수
    prisma.subscription.count({
      where: { status: 'ACTIVE' },
    }),

    // 3. 크래딧 통계
    prisma.creditTransaction.aggregate({
      where: { type: 'PURCHASE' },
      _sum: { amount: true },
    }),

    // 4. 오늘의 생성 횟수
    prisma.generationHistory.count({
      where: {
        createdAt: { gte: today },
      },
    }),

    // 5. 최근 활동 내역 (최근 10개)
    prisma.generationHistory.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ])

  const stats = {
    totalUsers,
    activeSubscriptions,
    totalCreditsPurchased: creditStats._sum.amount || 0,
    todayGenerations,
    recentActivities: recentActivities.map((activity) => ({
      id: activity.id,
      userId: activity.userId,
      userName: activity.user.name || activity.user.email || '알 수 없음',
      prompt: activity.prompt.substring(0, 50) + (activity.prompt.length > 50 ? '...' : ''),
      model: activity.model,
      creditsUsed: activity.creditsUsed,
      createdAt: activity.createdAt.toISOString(),
    })),
  }

  return (
    <div>
      {/* 페이지 헤더 */}
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '8px',
          }}
        >
          📊 대시보드
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          전체 통계 및 시스템 현황을 확인할 수 있어요.
        </p>
      </div>

      {/* 통계 카드 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              👥 전체 사용자
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-gray-500 mt-1">등록된 사용자 수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              📋 활성 구독
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeSubscriptions}</div>
            <p className="text-xs text-gray-500 mt-1">활성 상태의 구독</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              💳 크래딧 판매
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {stats.totalCreditsPurchased.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">총 판매된 크래딧</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              📈 오늘의 생성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.todayGenerations}</div>
            <p className="text-xs text-gray-500 mt-1">오늘 생성된 프레젠테이션</p>
          </CardContent>
        </Card>
      </div>

      {/* 최근 활동 */}
      <Card>
        <CardHeader>
          <CardTitle>🕒 최근 활동</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #E5E7EB',
                    textAlign: 'left',
                  }}
                >
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    사용자
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    프롬프트
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    모델
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    크래딧
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    생성 시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentActivities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      style={{
                        padding: '32px',
                        textAlign: 'center',
                        color: '#9CA3AF',
                      }}
                    >
                      아직 활동 내역이 없어요.
                    </td>
                  </tr>
                ) : (
                  stats.recentActivities.map((activity) => (
                    <tr
                      key={activity.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                      }}
                    >
                      <td
                        style={{
                          padding: '12px 8px',
                          fontSize: '14px',
                          color: '#374151',
                        }}
                      >
                        {activity.userName}
                      </td>
                      <td
                        style={{
                          padding: '12px 8px',
                          fontSize: '14px',
                          color: '#6B7280',
                          maxWidth: '300px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activity.prompt}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Badge variant="outline">{activity.model}</Badge>
                      </td>
                      <td
                        style={{
                          padding: '12px 8px',
                          fontSize: '14px',
                          color: '#374151',
                          fontWeight: 600,
                        }}
                      >
                        {activity.creditsUsed}
                      </td>
                      <td
                        style={{
                          padding: '12px 8px',
                          fontSize: '14px',
                          color: '#9CA3AF',
                        }}
                      >
                        {new Date(activity.createdAt).toLocaleString('ko-KR', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
