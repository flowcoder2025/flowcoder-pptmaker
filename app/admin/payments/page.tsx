'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Payment {
  id: string
  paymentId: string
  userId: string
  userName: string
  amount: number
  currency: string
  status: string
  method: string | null
  purpose: string
  receiptUrl: string | null
  failReason: string | null
  createdAt: string
  updatedAt: string
}

interface Stats {
  totalAmount: number
  totalCount: number
  paidCount: number
  failedCount: number
  refundedCount: number
}

const statusLabels: Record<string, { label: string; variant: 'default' | 'outline' | 'destructive' }> = {
  PAID: { label: '결제완료', variant: 'default' },
  PENDING: { label: '대기중', variant: 'outline' },
  FAILED: { label: '실패', variant: 'destructive' },
  CANCELED: { label: '취소', variant: 'outline' },
  REFUNDED: { label: '환불', variant: 'outline' },
}

const purposeLabels: Record<string, string> = {
  SUBSCRIPTION_UPGRADE: '구독',
  CREDIT_PURCHASE: '크레딧',
}

const methodLabels: Record<string, string> = {
  CARD: '카드',
  TRANSFER: '계좌이체',
  VIRTUAL_ACCOUNT: '가상계좌',
  MOBILE: '휴대폰',
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [stats, setStats] = useState<Stats>({
    totalAmount: 0,
    totalCount: 0,
    paidCount: 0,
    failedCount: 0,
    refundedCount: 0,
  })
  const [loading, setLoading] = useState(true)

  // 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'FAILED' | 'CANCELED' | 'REFUNDED'>('ALL')
  const [purposeFilter, setPurposeFilter] = useState<'ALL' | 'SUBSCRIPTION_UPGRADE' | 'CREDIT_PURCHASE'>('ALL')
  const [methodFilter, setMethodFilter] = useState<'ALL' | 'CARD' | 'TRANSFER' | 'VIRTUAL_ACCOUNT' | 'MOBILE'>('ALL')

  // 데이터 가져오기
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/payments')
      if (!res.ok) throw new Error('결제 목록 조회 실패')
      const data = await res.json()
      setStats(data.stats)
      setPayments(data.payments)
    } catch (error) {
      console.error(error)
      toast.error('결제 목록을 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  // 필터링된 결제 목록
  const filteredPayments = useMemo(() => {
    return payments.filter((payment) => {
      // 검색어 필터 (사용자 이름 또는 결제 ID)
      const matchesSearch =
        !searchQuery ||
        payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payment.paymentId.toLowerCase().includes(searchQuery.toLowerCase())

      // 상태 필터
      const matchesStatus = statusFilter === 'ALL' || payment.status === statusFilter

      // 목적 필터
      const matchesPurpose = purposeFilter === 'ALL' || payment.purpose === purposeFilter

      // 결제수단 필터
      const matchesMethod = methodFilter === 'ALL' || payment.method === methodFilter

      return matchesSearch && matchesStatus && matchesPurpose && matchesMethod
    })
  }, [payments, searchQuery, statusFilter, purposeFilter, methodFilter])

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
          💳 결제 관리
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          결제 통계 및 내역을 확인할 수 있어요.
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
            <CardTitle className="text-sm font-medium text-gray-600">총 결제액</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {stats.totalAmount.toLocaleString()}원
            </div>
            <p className="text-xs text-gray-500 mt-1">전체 결제 금액</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">결제 건수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCount.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">전체 결제 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">성공</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.paidCount}</div>
            <p className="text-xs text-gray-500 mt-1">결제 완료 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">실패</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.failedCount}</div>
            <p className="text-xs text-gray-500 mt-1">결제 실패 건수</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">환불</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.refundedCount}</div>
            <p className="text-xs text-gray-500 mt-1">환불 건수</p>
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
                placeholder="사용자 이름 또는 결제 ID로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* 상태 필터 */}
            <div style={{ minWidth: '240px' }}>
              <Label className="text-gray-700 font-medium">상태</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <Button
                  size="sm"
                  variant={statusFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'PAID' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('PAID')}
                >
                  완료
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'PENDING' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('PENDING')}
                >
                  대기
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'FAILED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('FAILED')}
                >
                  실패
                </Button>
                <Button
                  size="sm"
                  variant={statusFilter === 'REFUNDED' ? 'default' : 'outline'}
                  onClick={() => setStatusFilter('REFUNDED')}
                >
                  환불
                </Button>
              </div>
            </div>

            {/* 목적 필터 */}
            <div style={{ minWidth: '160px' }}>
              <Label className="text-gray-700 font-medium">목적</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant={purposeFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setPurposeFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={purposeFilter === 'SUBSCRIPTION_UPGRADE' ? 'default' : 'outline'}
                  onClick={() => setPurposeFilter('SUBSCRIPTION_UPGRADE')}
                >
                  구독
                </Button>
                <Button
                  size="sm"
                  variant={purposeFilter === 'CREDIT_PURCHASE' ? 'default' : 'outline'}
                  onClick={() => setPurposeFilter('CREDIT_PURCHASE')}
                >
                  크레딧
                </Button>
              </div>
            </div>

            {/* 결제수단 필터 */}
            <div style={{ minWidth: '200px' }}>
              <Label className="text-gray-700 font-medium">결제수단</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
                <Button
                  size="sm"
                  variant={methodFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setMethodFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={methodFilter === 'CARD' ? 'default' : 'outline'}
                  onClick={() => setMethodFilter('CARD')}
                >
                  카드
                </Button>
                <Button
                  size="sm"
                  variant={methodFilter === 'TRANSFER' ? 'default' : 'outline'}
                  onClick={() => setMethodFilter('TRANSFER')}
                >
                  계좌이체
                </Button>
                <Button
                  size="sm"
                  variant={methodFilter === 'VIRTUAL_ACCOUNT' ? 'default' : 'outline'}
                  onClick={() => setMethodFilter('VIRTUAL_ACCOUNT')}
                >
                  가상계좌
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 결제 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>
            결제 내역 ({filteredPayments.length}/{payments.length}개)
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
                    결제 ID
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    금액
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
                    목적
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    결제수단
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    결제일
                  </th>
                  <th
                    style={{
                      padding: '12px 8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      color: '#6B7280',
                    }}
                  >
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment) => {
                  const statusInfo = statusLabels[payment.status] || { label: payment.status, variant: 'outline' as const }
                  const purposeLabel = purposeLabels[payment.purpose] || payment.purpose
                  const methodLabel = payment.method ? (methodLabels[payment.method] || payment.method) : '-'

                  return (
                    <tr key={payment.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                        {payment.userName}
                      </td>
                      <td
                        style={{
                          padding: '12px 8px',
                          fontSize: '12px',
                          color: '#6B7280',
                          fontFamily: 'monospace',
                        }}
                      >
                        {payment.paymentId.substring(0, 20)}...
                      </td>
                      <td
                        style={{
                          padding: '12px 8px',
                          fontSize: '14px',
                          color: '#374151',
                          fontWeight: 600,
                        }}
                      >
                        {payment.amount.toLocaleString()}원
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <Badge variant="outline">{purposeLabel}</Badge>
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6B7280' }}>
                        {methodLabel}
                      </td>
                      <td style={{ padding: '12px 8px', fontSize: '14px', color: '#9CA3AF' }}>
                        {new Date(payment.createdAt).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        {payment.receiptUrl && (
                          <a
                            href={payment.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              fontSize: '12px',
                              color: '#3B82F6',
                              textDecoration: 'underline',
                            }}
                          >
                            영수증
                          </a>
                        )}
                        {payment.failReason && (
                          <span
                            style={{
                              fontSize: '12px',
                              color: '#EF4444',
                              marginLeft: '8px',
                            }}
                            title={payment.failReason}
                          >
                            실패사유
                          </span>
                        )}
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
