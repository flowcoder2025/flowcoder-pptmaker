'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

const typeLabels: Record<string, { label: string; color: string }> = {
  FREE: { label: '무료', color: 'bg-blue-100 text-blue-800' },
  EVENT: { label: '이벤트', color: 'bg-purple-100 text-purple-800' },
  SUBSCRIPTION: { label: '구독', color: 'bg-green-100 text-green-800' },
  PURCHASE: { label: '구매', color: 'bg-green-100 text-green-800' },
  USAGE: { label: '사용', color: 'bg-red-100 text-red-800' },
  REFUND: { label: '환불', color: 'bg-orange-100 text-orange-800' },
  EXPIRED: { label: '만료', color: 'bg-gray-100 text-gray-800' },
}

const sourceTypeLabels: Record<string, string> = {
  FREE: '무료',
  EVENT: '이벤트',
  SUBSCRIPTION: '구독',
  PURCHASE: '구매',
}

interface Transaction {
  id: string
  userId: string
  userName: string
  type: string
  sourceType: string | null
  amount: number
  balance: number
  description: string | null
  expiresAt: string | null
  createdAt: string
}

interface Stats {
  purchase: number
  usage: number
  refund: number
  bonus: number
}

export default function AdminCreditsPage() {
  const [stats, setStats] = useState<Stats>({
    purchase: 0,
    usage: 0,
    refund: 0,
    bonus: 0,
  })
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // 필터 상태
  const [search, setSearch] = useState('')
  const [sourceType, setSourceType] = useState('')
  const [includeExpired, setIncludeExpired] = useState(false)

  // 데이터 가져오기
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      if (sourceType) params.append('sourceType', sourceType)
      params.append('includeExpired', String(includeExpired))

      const res = await fetch(`/api/admin/credits?${params}`)
      if (!res.ok) throw new Error('데이터 로드 실패')

      const data = await res.json()
      setStats(data.stats)
      setTransactions(data.transactions)
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }, [search, sourceType, includeExpired])

  // 초기 로드 및 필터 변경 시 재로드
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // 유효기간 표시 헬퍼
  const getExpirationDisplay = (expiresAt: string | null) => {
    if (!expiresAt) {
      return { text: '영구', color: 'text-green-600', days: null }
    }

    const now = new Date()
    const expiry = new Date(expiresAt)
    const diffMs = expiry.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: '만료됨', color: 'text-red-600', days: diffDays }
    } else if (diffDays === 0) {
      return { text: '오늘 만료', color: 'text-orange-600', days: diffDays }
    } else if (diffDays <= 7) {
      return { text: `${diffDays}일 남음`, color: 'text-orange-600', days: diffDays }
    } else {
      return { text: `${diffDays}일 남음`, color: 'text-gray-600', days: diffDays }
    }
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
              {stats.purchase.toLocaleString()}
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
              {stats.usage.toLocaleString()}
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
              {stats.refund.toLocaleString()}
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
              {stats.bonus.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">총 지급 보너스</p>
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
                placeholder="이메일 또는 이름으로 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* 소스 타입 필터 */}
            <div style={{ minWidth: '240px' }}>
              <Label className="text-gray-700 font-medium">소스 타입</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <Button
                  size="sm"
                  variant={sourceType === '' ? 'default' : 'outline'}
                  onClick={() => setSourceType('')}
                >
                  전체
                </Button>
                {Object.entries(sourceTypeLabels).map(([key, label]) => (
                  <Button
                    key={key}
                    size="sm"
                    variant={sourceType === key ? 'default' : 'outline'}
                    onClick={() => setSourceType(key)}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            {/* 만료 포함 여부 */}
            <div style={{ minWidth: '160px' }}>
              <Label className="text-gray-700 font-medium">표시 옵션</Label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <input
                  type="checkbox"
                  id="includeExpired"
                  checked={includeExpired}
                  onChange={(e) => setIncludeExpired(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <label htmlFor="includeExpired" style={{ fontSize: '14px', cursor: 'pointer' }}>
                  만료 포함
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 거래 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>거래 내역 ({transactions.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              불러오고 있어요...
            </div>
          ) : transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
              거래 내역이 없어요.
            </div>
          ) : (
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
                      소스
                    </th>
                    <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                      금액
                    </th>
                    <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                      잔액
                    </th>
                    <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                      유효기간
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
                    const sourceInfo = tx.sourceType ? sourceTypeLabels[tx.sourceType] : '-'
                    const expiration = getExpirationDisplay(tx.expiresAt)

                    return (
                      <tr
                        key={tx.id}
                        style={{
                          borderBottom: '1px solid #F3F4F6',
                        }}
                      >
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                          {tx.userName}
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <Badge variant="outline" className={typeInfo.color}>
                            {typeInfo.label}
                          </Badge>
                        </td>
                        <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6B7280' }}>
                          {sourceInfo}
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
                        <td style={{ padding: '12px 8px', fontSize: '14px' }}>
                          <span className={expiration.color}>
                            {expiration.text}
                          </span>
                          {tx.expiresAt && (
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                              {new Date(tx.expiresAt).toLocaleDateString('ko-KR')}
                            </div>
                          )}
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
