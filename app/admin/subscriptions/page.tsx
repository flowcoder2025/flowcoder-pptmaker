'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { logger } from '@/lib/logger'

interface Subscription {
  id: string
  userId: string
  userName: string
  tier: string
  status: string
  startDate: string
  endDate: string | null
}

interface TierStat {
  tier: string
  status: string
  _count: number
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<TierStat[]>([])
  const [loading, setLoading] = useState(true)

  // 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [tierFilter, setTierFilter] = useState<'ALL' | 'FREE' | 'PRO' | 'PREMIUM'>('ALL')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CANCELLED' | 'EXPIRED'>(
    'ALL'
  )

  // 데이터 가져오기
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/subscriptions')
      if (!res.ok) throw new Error('구독 목록 조회 실패')
      const data = await res.json()
      setStats(data.stats)
      setSubscriptions(data.subscriptions)
    } catch (error) {
      logger.error('구독 목록 조회 실패', error)
      toast.error('구독 목록을 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  // 필터링된 구독 목록
  const filteredSubscriptions = useMemo(() => {
    return subscriptions.filter((sub) => {
      // 검색어 필터 (사용자 이름)
      const matchesSearch =
        !searchQuery || sub.userName.toLowerCase().includes(searchQuery.toLowerCase())

      // Tier 필터
      const matchesTier = tierFilter === 'ALL' || sub.tier === tierFilter

      // Status 필터
      const matchesStatus = statusFilter === 'ALL' || sub.status === statusFilter

      return matchesSearch && matchesTier && matchesStatus
    })
  }, [subscriptions, searchQuery, tierFilter, statusFilter])

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

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <div style={{ fontSize: '18px', color: '#9CA3AF' }}>불러오고 있어요...</div>
      </div>
    )
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
          📋 구독 관리
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          구독 통계 및 목록을 확인할 수 있어요.
        </p>
      </div>

      {/* 통계 카드 */}
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
            <CardTitle className="text-sm font-medium text-gray-600">FREE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tierCounts.FREE || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">PRO</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tierCounts.PRO || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">PREMIUM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{tierCounts.PREMIUM || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* 검색 및 필터 */}
      <Card style={{ marginBottom: '24px' }}>
        <CardContent style={{ paddingTop: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'end' }}>
            {/* 검색 */}
            <div style={{ flex: '1', minWidth: '240px' }}>
              <Label htmlFor="search" className="text-gray-700 font-medium">
                검색
              </Label>
              <Input
                id="search"
                placeholder="사용자 이름 또는 이메일로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* Tier 필터 */}
            <div style={{ minWidth: '200px' }}>
              <Label className="text-gray-700 font-medium">요금제</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant={tierFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setTierFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={tierFilter === 'FREE' ? 'default' : 'outline'}
                  onClick={() => setTierFilter('FREE')}
                >
                  FREE
                </Button>
                <Button
                  size="sm"
                  variant={tierFilter === 'PRO' ? 'default' : 'outline'}
                  onClick={() => setTierFilter('PRO')}
                >
                  PRO
                </Button>
                <Button
                  size="sm"
                  variant={tierFilter === 'PREMIUM' ? 'default' : 'outline'}
                  onClick={() => setTierFilter('PREMIUM')}
                >
                  PREMIUM
                </Button>
              </div>
            </div>

            {/* Status 필터 */}
            <div style={{ minWidth: '200px' }}>
              <Label className="text-gray-700 font-medium">상태</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'ACTIVE' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ACTIVE')}
                >
                  활성
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'CANCELLED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('CANCELLED')}
                >
                  취소
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'EXPIRED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('EXPIRED')}
                >
                  만료
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 구독 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>
            구독 목록 ({filteredSubscriptions.length}/{subscriptions.length}개)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #E5E7EB', textAlign: 'left' }}>
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
                    요금제
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    상태
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    시작일
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    종료일
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSubscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                      {sub.userName}
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
