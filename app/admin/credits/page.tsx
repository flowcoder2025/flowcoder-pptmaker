import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { prisma } from '@/lib/prisma'

const typeLabels: Record<string, { label: string; color: string }> = {
  PURCHASE: { label: '구매', color: 'bg-green-100 text-green-800' },
  USAGE: { label: '사용', color: 'bg-red-100 text-red-800' },
  REFUND: { label: '환불', color: 'bg-orange-100 text-orange-800' },
  BONUS: { label: '보너스', color: 'bg-blue-100 text-blue-800' },
}

export default async function AdminCreditsPage() {
  // 병렬로 통계 및 거래 내역 조회
  const [stats, transactions] = await Promise.all([
    // type별 통계
    prisma.creditTransaction.groupBy({
      by: ['type'],
      _sum: { amount: true },
    }),

    // 최근 거래 내역 (50개)
    prisma.creditTransaction.findMany({
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

  // 통계 데이터 변환
  const statsMap = stats.reduce(
    (acc, stat) => {
      acc[stat.type] = stat._sum.amount || 0
      return acc
    },
    {} as Record<string, number>
  )

  const creditStats = {
    purchase: statsMap.PURCHASE || 0,
    usage: Math.abs(statsMap.USAGE || 0),
    refund: Math.abs(statsMap.REFUND || 0),
    bonus: statsMap.BONUS || 0,
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
          💳 크래딧 관리
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          크래딧 거래 통계 및 내역을 확인할 수 있어요.
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
              💰 구매
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {creditStats.purchase.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">총 판매 크래딧</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              📉 사용
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {creditStats.usage.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">총 소비 크래딧</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              ↩️ 환불
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {creditStats.refund.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">총 환불 크래딧</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">
              🎁 보너스
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {creditStats.bonus.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">총 지급 보너스</p>
          </CardContent>
        </Card>
      </div>

      {/* 거래 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>최근 거래 내역</CardTitle>
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
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    사용자
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    타입
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    금액
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    잔액
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    사유
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    거래 시간
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => {
                  const typeInfo = typeLabels[tx.type] || { label: tx.type, color: '' }
                  return (
                    <tr
                      key={tx.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                      }}
                    >
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                        {tx.user.name || tx.user.email || '알 수 없음'}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Badge variant="outline">{typeInfo.label}</Badge>
                      </td>
                      <td
                        style={{
                          padding: '12px 8px',
                          fontSize: '14px',
                          fontWeight: 600,
                          color: tx.amount > 0 ? '#10B981' : '#EF4444',
                        }}
                      >
                        {tx.amount > 0 ? '+' : ''}
                        {tx.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                        {tx.balance.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6B7280' }}>
                        {tx.description || '-'}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#9CA3AF' }}>
                        {new Date(tx.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
