import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

export default async function AdminMonitoringPage() {
  // 날짜 계산
  const now = new Date()
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)

  const weekAgo = new Date(now)
  weekAgo.setDate(now.getDate() - 7)
  weekAgo.setHours(0, 0, 0, 0)

  const monthAgo = new Date(now)
  monthAgo.setMonth(now.getMonth() - 1)
  monthAgo.setHours(0, 0, 0, 0)

  // 병렬로 통계 및 생성 내역 조회
  const [todayCount, weekCount, monthCount, generations] = await Promise.all([
    // 오늘 생성 횟수
    prisma.generationHistory.count({
      where: { createdAt: { gte: today } },
    }),

    // 이번 주 생성 횟수
    prisma.generationHistory.count({
      where: { createdAt: { gte: weekAgo } },
    }),

    // 이번 달 생성 횟수
    prisma.generationHistory.count({
      where: { createdAt: { gte: monthAgo } },
    }),

    // 최근 생성 내역 (50개)
    prisma.generationHistory.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
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

  const stats = {
    today: todayCount,
    week: weekCount,
    month: monthCount,
  }

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
          📈 모니터링
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          시스템 활동 및 생성 내역을 모니터링할 수 있어요.
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
              오늘 생성
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              이번 주
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.week}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              이번 달
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.month}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>최근 생성 내역</CardTitle>
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
                    프롬프트
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    모델
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    자료조사
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    크래딧
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    생성 시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {generations.map((gen) => (
                  <tr key={gen.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                      {gen.user.name || gen.user.email || '알 수 없음'}
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
                      {gen.prompt}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <Badge variant="outline">{gen.model}</Badge>
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {gen.useResearch ? (
                        <Badge variant="default">✓</Badge>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151', fontWeight: 600 }}>
                      {gen.creditsUsed}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#9CA3AF' }}>
                      {new Date(gen.createdAt).toLocaleString('ko-KR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
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
