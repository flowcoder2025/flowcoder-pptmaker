import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

export default async function AdminSubscriptionsPage() {
  // 병렬로 통계 및 구독 목록 조회
  const [stats, subscriptions] = await Promise.all([
    // tier 및 status별 통계
    prisma.subscription.groupBy({
      by: ['tier', 'status'],
      _count: true,
    }),

    // 최근 구독 목록 (50개)
    prisma.subscription.findMany({
      take: 50,
      orderBy: { startDate: 'desc' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    }),
  ])

  // 활성 구독만 집계 (tier별)
  const tierCounts = stats.reduce(
    (acc, stat) => {
      if (stat.status === 'ACTIVE') {
        acc[stat.tier] = (acc[stat.tier] || 0) + stat._count
      }
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1
          style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#1F2937',
            marginBottom: '8px',
          }}
        >
          📋 구독 관리
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          구독 통계 및 목록을 확인할 수 있어요.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              FREE
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tierCounts.FREE || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              PRO
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tierCounts.PRO || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              PREMIUM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tierCounts.PREMIUM || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>구독 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    사용자
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    요금제
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    상태
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    시작일
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    종료일
                  </th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                      {sub.user.name || sub.user.email || '알 수 없음'}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Badge variant="default">{sub.tier}</Badge>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Badge variant={sub.status === 'ACTIVE' ? 'default' : 'outline'}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6B7280' }}>
                      {new Date(sub.startDate).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6B7280' }}>
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString('ko-KR') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
