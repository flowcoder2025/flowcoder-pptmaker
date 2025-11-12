'use client'

import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Generation {
  id: string
  userId: string
  userName: string
  prompt: string
  model: string
  useResearch: boolean
  creditsUsed: number
  createdAt: string
}

interface Stats {
  today: number
  week: number
  month: number
}

export default function AdminMonitoringPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [stats, setStats] = useState<Stats>({ today: 0, week: 0, month: 0 })
  const [loading, setLoading] = useState(true)

  // 검색/필터 상태
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [modelFilter, setModelFilter] = useState<'ALL' | 'gemini-flash' | 'gemini-pro'>('ALL')
  const [researchFilter, setResearchFilter] = useState<'ALL' | 'YES' | 'NO'>('ALL')

  // 데이터 가져오기
  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      setLoading(true)
      const res = await fetch('/api/admin/monitoring')
      if (!res.ok) throw new Error('모니터링 데이터 조회 실패')
      const data = await res.json()
      setStats(data.stats)
      setGenerations(data.generations)
    } catch (error) {
      console.error(error)
      toast.error('모니터링 데이터를 불러오지 못했어요.')
    } finally {
      setLoading(false)
    }
  }

  // 필터링된 생성 내역
  const filteredGenerations = useMemo(() => {
    return generations.filter((gen) => {
      // 검색어 필터 (사용자 이름 또는 프롬프트)
      const matchesSearch =
        !searchQuery ||
        gen.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        gen.prompt.toLowerCase().includes(searchQuery.toLowerCase())

      // 모델 필터
      const matchesModel = modelFilter === 'ALL' || gen.model === modelFilter

      // 자료조사 필터
      const matchesResearch =
        researchFilter === 'ALL' ||
        (researchFilter === 'YES' && gen.useResearch) ||
        (researchFilter === 'NO' && !gen.useResearch)

      return matchesSearch && matchesModel && matchesResearch
    })
  }, [generations, searchQuery, modelFilter, researchFilter])

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
          📈 모니터링
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280' }}>
          시스템 활동 및 생성 내역을 모니터링할 수 있어요.
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
            <CardTitle className="text-sm font-medium text-gray-600">오늘 생성</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.today}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">이번 주</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.week}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium text-gray-600">이번 달</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.month}</div>
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
                placeholder="사용자 이름 또는 프롬프트로 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-2"
              />
            </div>

            {/* 모델 필터 */}
            <div style={{ minWidth: '180px' }}>
              <Label className="text-gray-700 font-medium">모델</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant={modelFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setModelFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={modelFilter === 'gemini-flash' ? 'default' : 'outline'}
                  onClick={() => setModelFilter('gemini-flash')}
                >
                  Flash
                </Button>
                <Button
                  size="sm"
                  variant={modelFilter === 'gemini-pro' ? 'default' : 'outline'}
                  onClick={() => setModelFilter('gemini-pro')}
                >
                  Pro
                </Button>
              </div>
            </div>

            {/* 자료조사 필터 */}
            <div style={{ minWidth: '160px' }}>
              <Label className="text-gray-700 font-medium">자료조사</Label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <Button
                  size="sm"
                  variant={researchFilter === 'ALL' ? 'default' : 'outline'}
                  onClick={() => setResearchFilter('ALL')}
                >
                  전체
                </Button>
                <Button
                  size="sm"
                  variant={researchFilter === 'YES' ? 'default' : 'outline'}
                  onClick={() => setResearchFilter('YES')}
                >
                  사용
                </Button>
                <Button
                  size="sm"
                  variant={researchFilter === 'NO' ? 'default' : 'outline'}
                  onClick={() => setResearchFilter('NO')}
                >
                  미사용
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 생성 내역 */}
      <Card>
        <CardHeader>
          <CardTitle>
            최근 생성 내역 ({filteredGenerations.length}/{generations.length}개)
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
                    자료조사
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
                {filteredGenerations.map((gen) => (
                  <tr key={gen.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                    <td style={{ padding: '12px 8px', fontSize: '14px', color: '#374151' }}>
                      {gen.userName}
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
                    <td
                      style={{
                        padding: '12px 8px',
                        fontSize: '14px',
                        color: '#374151',
                        fontWeight: 600,
                      }}
                    >
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
