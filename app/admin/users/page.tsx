'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { CreditSourceType } from '@/types/credits'

interface User {
  id: string
  name: string | null
  email: string
  createdAt: string
  creditBalance: number
  subscription: {
    tier: string
    status: string
    endDate: string | null
  } | null
  isAdmin: boolean
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [creditDialogOpen, setCreditDialogOpen] = useState(false)
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [creditAmount, setCreditAmount] = useState<string>('')
  const [creditDescription, setCreditDescription] = useState<string>('')
  const [creditSourceType, setCreditSourceType] = useState<CreditSourceType>(
    CreditSourceType.EVENT
  )
  const [creditExpiresInDays, setCreditExpiresInDays] = useState<string>('')
  const [selectedTier, setSelectedTier] = useState<'FREE' | 'PRO' | 'PREMIUM'>('FREE')
  const [processing, setProcessing] = useState(false)

  // 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [subscriptionFilter, setSubscriptionFilter] = useState<
    'ALL' | 'FREE' | 'PRO' | 'PREMIUM'
  >('ALL')
  const [adminFilter, setAdminFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL')

  // 사용자 목록 조회
  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('사용자 목록 조회 실패')
      const data = await res.json()
      setUsers(data.users)
    } catch (error) {
      console.error(error)
      toast.error('사용자 목록을 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  // 필터링된 사용자 목록
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 검색어 필터 (이메일 또는 이름)
      const matchesSearch =
        !searchQuery ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchQuery.toLowerCase())

      // 구독 필터
      const matchesSubscription =
        subscriptionFilter === 'ALL' ||
        (subscriptionFilter === 'FREE' && !user.subscription) ||
        user.subscription?.tier === subscriptionFilter

      // 관리자 필터
      const matchesAdmin =
        adminFilter === 'ALL' ||
        (adminFilter === 'ADMIN' && user.isAdmin) ||
        (adminFilter === 'USER' && !user.isAdmin)

      return matchesSearch && matchesSubscription && matchesAdmin
    })
  }, [users, searchQuery, subscriptionFilter, adminFilter])

  // 크레딧 조정 처리
  async function handleCreditAdjustment() {
    if (!selectedUser) return

    const amount = parseInt(creditAmount)
    if (isNaN(amount) || amount <= 0) {
      toast.error('양수의 크레딧 금액을 입력해주세요.')
      return
    }

    // expiresInDays 검증 (제공된 경우)
    let expiresInDays: number | undefined
    if (creditExpiresInDays) {
      const days = parseInt(creditExpiresInDays)
      if (isNaN(days) || days <= 0) {
        toast.error('유효기간은 양수여야 해요.')
        return
      }
      expiresInDays = days
    }

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/users/${selectedUser.id}/credits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount,
          sourceType: creditSourceType,
          description: creditDescription,
          expiresInDays,
        }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '크레딧 지급 실패')
      }

      toast.success('크레딧을 지급했어요.')
      setCreditDialogOpen(false)
      setCreditAmount('')
      setCreditDescription('')
      setCreditSourceType(CreditSourceType.EVENT)
      setCreditExpiresInDays('')
      setSelectedUser(null)
      fetchUsers() // 목록 새로고침
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '크레딧 지급에 실패했어요.')
    } finally {
      setProcessing(false)
    }
  }

  // 관리자 권한 부여
  async function handleGrantAdmin(userId: string) {
    try {
      const res = await fetch(`/api/admin/users/${userId}/admin`, {
        method: 'POST',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '권한 부여 실패')
      }

      toast.success('관리자 권한을 부여했어요.')
      fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '권한 부여에 실패했어요.')
    }
  }

  // 관리자 권한 제거
  async function handleRevokeAdmin(userId: string) {
    if (!confirm('정말로 관리자 권한을 제거하시겠어요?')) return

    try {
      const res = await fetch(`/api/admin/users/${userId}/admin`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '권한 제거 실패')
      }

      toast.success('관리자 권한을 제거했어요.')
      fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '권한 제거에 실패했어요.')
    }
  }

  // 구독 변경 처리
  async function handleSubscriptionChange() {
    if (!selectedUser) return

    try {
      setProcessing(true)
      const res = await fetch(`/api/admin/users/${selectedUser.id}/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: selectedTier }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || '구독 변경 실패')
      }

      toast.success('구독을 변경했어요.')
      setSubscriptionDialogOpen(false)
      setSelectedUser(null)
      fetchUsers()
    } catch (error) {
      console.error(error)
      toast.error(error instanceof Error ? error.message : '구독 변경에 실패했어요.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '64px' }}>
        <div style={{ fontSize: '18px', color: '#9CA3AF' }}>
          불러오고 있어요...
        </div>
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
          👥 사용자 관리
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          사용자 목록 조회 및 크레딧, 구독, 권한을 관리할 수 있어요.
        </p>
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* 구독 필터 */}
            <div style={{ minWidth: '180px' }}>
              <Label className="text-gray-700 font-medium">구독 상태</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant={subscriptionFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setSubscriptionFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={subscriptionFilter === 'FREE' ? 'default' : 'outline'}
                  onClick={() => setSubscriptionFilter('FREE')}
                >
                  FREE
                </Button>
                <Button
                  size="sm"
                  variant={subscriptionFilter === 'PRO' ? 'default' : 'outline'}
                  onClick={() => setSubscriptionFilter('PRO')}
                >
                  PRO
                </Button>
                <Button
                  size="sm"
                  variant={subscriptionFilter === 'PREMIUM' ? 'default' : 'outline'}
                  onClick={() => setSubscriptionFilter('PREMIUM')}
                >
                  PREMIUM
                </Button>
              </div>
            </div>

            {/* 관리자 필터 */}
            <div style={{ minWidth: '160px' }}>
              <Label className="text-gray-700 font-medium">권한</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant={adminFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setAdminFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={adminFilter === 'ADMIN' ? 'default' : 'outline'}
                  onClick={() => setAdminFilter('ADMIN')}
                >
                  관리자
                </Button>
                <Button
                  size="sm"
                  variant={adminFilter === 'USER' ? 'default' : 'outline'}
                  onClick={() => setAdminFilter('USER')}
                >
                  일반
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용자 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>
            사용자 목록 ({filteredUsers.length}/{users.length}명)
          </CardTitle>
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
                    이름
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    이메일
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    크레딧
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    구독
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    관리자
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    가입일
                  </th>
                  <th style={{ padding: '12px 8px', fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>
                    작업
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                    }}
                  >
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                      {user.name || '이름 없음'}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#6B7280' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151', fontWeight: 600 }}>
                      {user.creditBalance.toLocaleString()}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {user.subscription ? (
                        <Badge variant={user.subscription.status === 'ACTIVE' ? 'default' : 'outline'}>
                          {user.subscription.tier}
                        </Badge>
                      ) : (
                        <Badge variant="outline">FREE</Badge>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      {user.isAdmin ? (
                        <Badge variant="default">✓</Badge>
                      ) : (
                        <span style={{ color: '#9CA3AF' }}>-</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#9CA3AF' }}>
                      {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </td>
                    <td style={{ padding: '12px 8px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setCreditDialogOpen(true)
                          }}
                        >
                          크레딧
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedUser(user)
                            setSelectedTier(user.subscription?.tier as any || 'FREE')
                            setSubscriptionDialogOpen(true)
                          }}
                        >
                          구독
                        </Button>
                        {user.isAdmin ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRevokeAdmin(user.id)}
                          >
                            권한제거
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleGrantAdmin(user.id)}
                          >
                            권한부여
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 크레딧 조정 Dialog */}
      <Dialog open={creditDialogOpen} onOpenChange={setCreditDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-300 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">크레딧 조정</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedUser?.name || selectedUser?.email}의 크레딧을 조정할 수 있어요.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
            <div>
              <Label htmlFor="amount" className="text-gray-700 font-medium">
                금액 (양수만 가능)
              </Label>
              <Input
                id="amount"
                type="number"
                min="1"
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
                placeholder="예: 100"
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="sourceType" className="text-gray-700 font-medium">
                크레딧 타입
              </Label>
              <Select
                value={creditSourceType}
                onValueChange={(value) => setCreditSourceType(value as CreditSourceType)}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="타입 선택" />
                </SelectTrigger>
                <SelectContent className="bg-white border-2 border-gray-300 shadow-lg">
                  <SelectItem value={CreditSourceType.FREE} className="bg-white hover:bg-gray-100 cursor-pointer">
                    FREE (영구, 무료 가입)
                  </SelectItem>
                  <SelectItem value={CreditSourceType.EVENT} className="bg-white hover:bg-gray-100 cursor-pointer">
                    EVENT (유효기간 있음, 이벤트)
                  </SelectItem>
                  <SelectItem value={CreditSourceType.SUBSCRIPTION} className="bg-white hover:bg-gray-100 cursor-pointer">
                    SUBSCRIPTION (30일, 구독)
                  </SelectItem>
                  <SelectItem value={CreditSourceType.PURCHASE} className="bg-white hover:bg-gray-100 cursor-pointer">
                    PURCHASE (영구, 결제)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(creditSourceType === CreditSourceType.EVENT ||
              creditSourceType === CreditSourceType.SUBSCRIPTION) && (
              <div>
                <Label htmlFor="expiresInDays" className="text-gray-700 font-medium">
                  유효기간 (일)
                  {creditSourceType === CreditSourceType.SUBSCRIPTION && (
                    <span style={{ fontSize: '12px', color: '#6B7280', marginLeft: '8px' }}>
                      (기본: 30일)
                    </span>
                  )}
                </Label>
                <Input
                  id="expiresInDays"
                  type="number"
                  min="1"
                  value={creditExpiresInDays}
                  onChange={(e) => setCreditExpiresInDays(e.target.value)}
                  placeholder={
                    creditSourceType === CreditSourceType.SUBSCRIPTION
                      ? '30'
                      : '예: 7'
                  }
                  className="mt-2"
                />
              </div>
            )}
            <div>
              <Label htmlFor="description" className="text-gray-700 font-medium">
                사유 (선택)
              </Label>
              <Input
                id="description"
                value={creditDescription}
                onChange={(e) => setCreditDescription(e.target.value)}
                placeholder="예: 프로모션 지급"
                className="mt-2"
              />
            </div>
            <div style={{ padding: '16px', background: '#F3F4F6', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                현재 잔액
              </div>
              <div style={{ fontSize: '28px', fontWeight: 700, color: '#1F2937' }}>
                {selectedUser?.creditBalance.toLocaleString()}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreditDialogOpen(false)
                setCreditAmount('')
                setCreditDescription('')
                setCreditSourceType(CreditSourceType.EVENT)
                setCreditExpiresInDays('')
                setSelectedUser(null)
              }}
              disabled={processing}
            >
              취소
            </Button>
            <Button onClick={handleCreditAdjustment} disabled={processing}>
              {processing ? '처리 중...' : '적용'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 구독 관리 Dialog */}
      <Dialog open={subscriptionDialogOpen} onOpenChange={setSubscriptionDialogOpen}>
        <DialogContent className="bg-white border-2 border-gray-300 shadow-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">구독 관리</DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedUser?.name || selectedUser?.email}의 구독을 변경할 수 있어요.
            </DialogDescription>
          </DialogHeader>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
            <div>
              <Label className="text-gray-700 font-medium">요금제 선택</Label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: selectedTier === 'FREE' ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedTier === 'FREE' ? '#EFF6FF' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="tier"
                    value="FREE"
                    checked={selectedTier === 'FREE'}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>FREE</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>무료 플랜</div>
                  </div>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: selectedTier === 'PRO' ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedTier === 'PRO' ? '#EFF6FF' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="tier"
                    value="PRO"
                    checked={selectedTier === 'PRO'}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>PRO</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>프로 플랜</div>
                  </div>
                </label>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '12px',
                    border: selectedTier === 'PREMIUM' ? '2px solid #3B82F6' : '1px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedTier === 'PREMIUM' ? '#EFF6FF' : 'white',
                  }}
                >
                  <input
                    type="radio"
                    name="tier"
                    value="PREMIUM"
                    checked={selectedTier === 'PREMIUM'}
                    onChange={(e) => setSelectedTier(e.target.value as any)}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <div>
                    <div style={{ fontWeight: 600, color: '#1F2937' }}>PREMIUM</div>
                    <div style={{ fontSize: '12px', color: '#6B7280' }}>프리미엄 플랜</div>
                  </div>
                </label>
              </div>
            </div>
            {selectedUser?.subscription && (
              <div style={{ padding: '16px', background: '#F3F4F6', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', fontWeight: 500 }}>
                  현재 구독
                </div>
                <div style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937' }}>
                  {selectedUser.subscription.tier}
                  <Badge
                    variant={selectedUser.subscription.status === 'ACTIVE' ? 'default' : 'outline'}
                    style={{ marginLeft: '8px' }}
                  >
                    {selectedUser.subscription.status}
                  </Badge>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSubscriptionDialogOpen(false)
                setSelectedUser(null)
              }}
              disabled={processing}
            >
              취소
            </Button>
            <Button onClick={handleSubscriptionChange} disabled={processing}>
              {processing ? '처리 중...' : '변경'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
