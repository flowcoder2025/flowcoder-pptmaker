'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import MaxWidthContainer from '@/components/layout/MaxWidthContainer';
import { useSubscriptionStore } from '@/store/subscriptionStore';
import { PLAN_BENEFITS } from '@/constants/subscription';
import {
  Loader2,
  FileText,
  CreditCard,
  Receipt,
  TrendingDown,
  TrendingUp,
  Clock,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  BarChart3,
} from 'lucide-react';
import { toast } from 'sonner';
import KakaoAdBanner from '@/components/ads/KakaoAdBanner';
import KakaoAdMobileThick from '@/components/ads/KakaoAdMobileThick';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

/**
 * 사용내역 페이지 (페이지네이션, 날짜 검색, 대시보드 포함)
 *
 * @description
 * 크레딧 사용 내역, 결제 내역, 통계 대시보드를 제공합니다.
 * DB 연결: CreditTransaction, Payment 테이블
 */
export default function UsagePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { plan } = useSubscriptionStore();

  // 광고 표시 여부 결정 (유료 플랜은 광고 제거)
  const showAds = !PLAN_BENEFITS[plan].benefits.adFree;

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'credits' | 'payments' | 'dashboard'>('credits');

  // 크레딧 거래 내역
  const [creditTransactions, setCreditTransactions] = useState<any[]>([]);
  const [creditTotal, setCreditTotal] = useState(0);
  const [creditPage, setCreditPage] = useState(0);
  const [isLoadingCredits, setIsLoadingCredits] = useState(true);

  // 결제 내역
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentTotal, setPaymentTotal] = useState(0);
  const [paymentPage, setPaymentPage] = useState(0);
  const [isLoadingPayments, setIsLoadingPayments] = useState(true);

  // 날짜 필터
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });

  // 대시보드 통계
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  const ITEMS_PER_PAGE = 10;

  // 로그인 체크
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/usage');
    }
  }, [status, router]);

  // 데이터 조회
  useEffect(() => {
    if (status === 'authenticated' && session) {
      if (activeTab === 'credits') {
        fetchCreditTransactions();
      } else if (activeTab === 'payments') {
        fetchPayments();
      } else if (activeTab === 'dashboard') {
        fetchDashboardStats();
      }
    }
  }, [status, session, activeTab, creditPage, paymentPage, dateRange]);

  const fetchCreditTransactions = async () => {
    try {
      setIsLoadingCredits(true);
      const offset = creditPage * ITEMS_PER_PAGE;
      let url = `/api/credits/transactions?limit=${ITEMS_PER_PAGE}&offset=${offset}`;

      if (dateRange.from) {
        url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}`;
      }
      if (dateRange.to) {
        url += `&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch credit transactions');
      }

      const data = await res.json();
      setCreditTransactions(data.transactions || []);
      setCreditTotal(data.total || 0);
    } catch (error) {
      console.error('크레딧 거래 내역 조회 실패:', error);
      toast.error('크레딧 사용 내역을 불러오는 중 문제가 발생했어요');
    } finally {
      setIsLoadingCredits(false);
    }
  };

  const fetchPayments = async () => {
    try {
      setIsLoadingPayments(true);
      const offset = paymentPage * ITEMS_PER_PAGE;
      let url = `/api/payments/history?limit=${ITEMS_PER_PAGE}&offset=${offset}`;

      if (dateRange.from) {
        url += `&startDate=${format(dateRange.from, 'yyyy-MM-dd')}`;
      }
      if (dateRange.to) {
        url += `&endDate=${format(dateRange.to, 'yyyy-MM-dd')}`;
      }

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch payment history');
      }

      const data = await res.json();
      setPayments(data.payments || []);
      setPaymentTotal(data.total || 0);
    } catch (error) {
      console.error('결제 내역 조회 실패:', error);
      toast.error('결제 내역을 불러오는 중 문제가 발생했어요');
    } finally {
      setIsLoadingPayments(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setIsLoadingDashboard(true);
      const res = await fetch('/api/stats/usage');
      if (!res.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await res.json();
      setDashboardStats(data);
    } catch (error) {
      console.error('대시보드 통계 조회 실패:', error);
      toast.error('통계를 불러오는 중 문제가 발생했어요');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const handleDateRangeSelect = (range: { from: Date | undefined; to: Date | undefined }) => {
    setDateRange(range);
    setCreditPage(0);
    setPaymentPage(0);
  };

  const clearDateRange = () => {
    setDateRange({ from: undefined, to: undefined });
    setCreditPage(0);
    setPaymentPage(0);
  };

  // 로딩 상태
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
        <p className="text-muted-foreground text-lg">불러오고 있어요...</p>
      </div>
    );
  }

  // 미로그인 시 리다이렉트 중
  if (!session) {
    return null;
  }

  const totalCreditPages = Math.ceil(creditTotal / ITEMS_PER_PAGE);
  const totalPaymentPages = Math.ceil(paymentTotal / ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-background">
      <MaxWidthContainer className="py-8 lg:py-12">
        {/* 광고 - 상단 (무료 플랜만) */}
        {showAds && (
          <div className="mb-8">
            <KakaoAdMobileThick />
          </div>
        )}

        {/* 페이지 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-2 text-foreground">사용내역</h1>
          <p className="text-base lg:text-lg text-muted-foreground">
            크레딧 사용 내역, 결제 내역, 통계를 확인하세요
          </p>
        </div>

        {/* 날짜 필터 */}
        {activeTab !== 'dashboard' && (
          <Card className="p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">날짜 필터:</span>
              </div>

              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                      {dateRange.from ? (
                        format(dateRange.from, 'yyyy-MM-dd', { locale: ko })
                      ) : (
                        <span className="text-muted-foreground">시작일</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.from}
                      onSelect={(date: Date | undefined) => handleDateRangeSelect({ ...dateRange, from: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                <span className="text-muted-foreground">~</span>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="justify-start text-left font-normal">
                      {dateRange.to ? (
                        format(dateRange.to, 'yyyy-MM-dd', { locale: ko })
                      ) : (
                        <span className="text-muted-foreground">종료일</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateRange.to}
                      onSelect={(date: Date | undefined) => handleDateRangeSelect({ ...dateRange, to: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {(dateRange.from || dateRange.to) && (
                  <Button variant="ghost" size="sm" onClick={clearDateRange}>
                    초기화
                  </Button>
                )}
              </div>

              <div className="flex gap-2 ml-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDateRangeSelect({
                      from: startOfMonth(new Date()),
                      to: endOfMonth(new Date()),
                    })
                  }
                >
                  이번 달
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    handleDateRangeSelect({
                      from: startOfMonth(subMonths(new Date(), 1)),
                      to: endOfMonth(subMonths(new Date(), 1)),
                    })
                  }
                >
                  지난 달
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* 탭 UI */}
        <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="credits" className="flex items-center gap-2">
              <CreditCard size={18} />
              크레딧
            </TabsTrigger>
            <TabsTrigger value="payments" className="flex items-center gap-2">
              <Receipt size={18} />
              결제
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 size={18} />
              대시보드
            </TabsTrigger>
          </TabsList>

          {/* 크레딧 사용 내역 */}
          <TabsContent value="credits" className="space-y-4">
            {isLoadingCredits ? (
              <Card className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
                <span className="text-muted-foreground">불러오고 있어요...</span>
              </Card>
            ) : creditTransactions.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>조건에 맞는 크레딧 사용 내역이 없어요</p>
                </div>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {creditTransactions.map((tx) => (
                    <CreditTransactionCard key={tx.id} transaction={tx} />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalCreditPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      전체 {creditTotal}개 중 {creditPage * ITEMS_PER_PAGE + 1}-
                      {Math.min((creditPage + 1) * ITEMS_PER_PAGE, creditTotal)}개 표시
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreditPage((p) => Math.max(0, p - 1))}
                        disabled={creditPage === 0}
                      >
                        <ChevronLeft size={16} />
                        이전
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalCreditPages) }, (_, i) => {
                          const pageNum =
                            totalCreditPages <= 5
                              ? i
                              : creditPage < 3
                              ? i
                              : creditPage > totalCreditPages - 4
                              ? totalCreditPages - 5 + i
                              : creditPage - 2 + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={creditPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setCreditPage(pageNum)}
                              className="w-9 h-9"
                            >
                              {pageNum + 1}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCreditPage((p) => Math.min(totalCreditPages - 1, p + 1))}
                        disabled={creditPage === totalCreditPages - 1}
                      >
                        다음
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* 결제 내역 */}
          <TabsContent value="payments" className="space-y-4">
            {isLoadingPayments ? (
              <Card className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
                <span className="text-muted-foreground">불러오고 있어요...</span>
              </Card>
            ) : payments.length === 0 ? (
              <Card className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <Receipt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>조건에 맞는 결제 내역이 없어요</p>
                </div>
              </Card>
            ) : (
              <>
                <div className="space-y-3">
                  {payments.map((payment) => (
                    <PaymentCard key={payment.id} payment={payment} />
                  ))}
                </div>

                {/* 페이지네이션 */}
                {totalPaymentPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <p className="text-sm text-muted-foreground">
                      전체 {paymentTotal}개 중 {paymentPage * ITEMS_PER_PAGE + 1}-
                      {Math.min((paymentPage + 1) * ITEMS_PER_PAGE, paymentTotal)}개 표시
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage((p) => Math.max(0, p - 1))}
                        disabled={paymentPage === 0}
                      >
                        <ChevronLeft size={16} />
                        이전
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPaymentPages) }, (_, i) => {
                          const pageNum =
                            totalPaymentPages <= 5
                              ? i
                              : paymentPage < 3
                              ? i
                              : paymentPage > totalPaymentPages - 4
                              ? totalPaymentPages - 5 + i
                              : paymentPage - 2 + i;
                          return (
                            <Button
                              key={pageNum}
                              variant={paymentPage === pageNum ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setPaymentPage(pageNum)}
                              className="w-9 h-9"
                            >
                              {pageNum + 1}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPaymentPage((p) => Math.min(totalPaymentPages - 1, p + 1))}
                        disabled={paymentPage === totalPaymentPages - 1}
                      >
                        다음
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* 대시보드 */}
          <TabsContent value="dashboard" className="space-y-6">
            {isLoadingDashboard ? (
              <Card className="p-6 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-primary animate-spin mr-2" />
                <span className="text-muted-foreground">불러오고 있어요...</span>
              </Card>
            ) : dashboardStats ? (
              <DashboardView stats={dashboardStats} />
            ) : (
              <Card className="p-6">
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>통계 데이터를 불러오지 못했어요</p>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* 광고 - 하단 (무료 플랜만) */}
        {showAds && (
          <div className="mt-10">
            <KakaoAdBanner />
          </div>
        )}
      </MaxWidthContainer>
    </div>
  );
}

/**
 * 크레딧 거래 카드 컴포넌트
 */
interface CreditTransactionCardProps {
  transaction: any;
}

function CreditTransactionCard({ transaction }: CreditTransactionCardProps) {
  const isPositive = transaction.amount > 0;

  // 타입별 레이블
  const typeLabels: Record<string, string> = {
    FREE: '무료 지급',
    EVENT: '이벤트 지급',
    SUBSCRIPTION: '구독 지급',
    PURCHASE: '구매',
    USAGE: '사용',
    REFUND: '환불',
    EXPIRED: '만료',
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-600" />
            )}
            <span className="font-semibold text-foreground">
              {typeLabels[transaction.type] || transaction.type}
            </span>
          </div>
          {transaction.description && (
            <p className="text-sm text-muted-foreground line-clamp-1">{transaction.description}</p>
          )}
          <div className="flex items-center gap-2 mt-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(transaction.createdAt).toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? '+' : ''}
            {transaction.amount.toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">크레딧</p>
        </div>
      </div>

      {transaction.expiresAt && (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-xs text-yellow-600">
            ⏰ 만료일: {new Date(transaction.expiresAt).toLocaleDateString('ko-KR')}
          </p>
        </div>
      )}
    </Card>
  );
}

/**
 * 결제 카드 컴포넌트
 */
interface PaymentCardProps {
  payment: any;
}

function PaymentCard({ payment }: PaymentCardProps) {
  // 상태별 색상 및 레이블
  const statusConfig: Record<string, { color: string; label: string }> = {
    PENDING: { color: 'text-yellow-600', label: '대기 중' },
    PAID: { color: 'text-green-600', label: '완료' },
    FAILED: { color: 'text-red-600', label: '실패' },
    CANCELED: { color: 'text-gray-600', label: '취소' },
    REFUNDED: { color: 'text-blue-600', label: '환불' },
  };

  const status = statusConfig[payment.status] || {
    color: 'text-muted-foreground',
    label: payment.status,
  };

  // 목적별 레이블
  const purposeLabels: Record<string, string> = {
    SUBSCRIPTION_UPGRADE: '구독 업그레이드',
    CREDIT_PURCHASE: '크레딧 구매',
  };

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Receipt className="w-4 h-4 text-primary" />
            <span className="font-semibold text-foreground">
              {purposeLabels[payment.purpose] || payment.purpose}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {new Date(payment.createdAt).toLocaleString('ko-KR')}
            </span>
          </div>
        </div>

        <div className="text-right">
          <p className="text-lg font-bold text-foreground">₩{payment.amount.toLocaleString()}</p>
          <p className={`text-xs font-medium ${status.color}`}>{status.label}</p>
        </div>
      </div>

      {payment.method && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground">결제 수단: {payment.method}</p>
        </div>
      )}

      {payment.failReason && (
        <div className="mt-2 pt-2 border-t border-border">
          <p className="text-xs text-red-600">❌ 실패 사유: {payment.failReason}</p>
        </div>
      )}

      {payment.receiptUrl && payment.status === 'PAID' && (
        <div className="mt-3">
          <a
            href={payment.receiptUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-primary hover:underline"
          >
            📄 영수증 보기 →
          </a>
        </div>
      )}
    </Card>
  );
}

/**
 * 대시보드 뷰 컴포넌트
 */
interface DashboardViewProps {
  stats: any;
}

function DashboardView({ stats }: DashboardViewProps) {
  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* 요약 카드 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">총 사용 크레딧</span>
            <CreditCard className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats.summary?.totalCreditsUsed?.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">총 결제 금액</span>
            <Receipt className="w-4 h-4 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            ₩{stats.summary?.totalPaymentAmount?.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">이번 달 사용</span>
            <TrendingDown className="w-4 h-4 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {stats.summary?.currentMonthUsage?.toLocaleString() || 0}
          </p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">이번 달 결제</span>
            <TrendingUp className="w-4 h-4 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            ₩{stats.summary?.currentMonthPayment?.toLocaleString() || 0}
          </p>
        </Card>
      </div>

      {/* 월별 크레딧 사용 추이 */}
      {stats.monthlyCredits && stats.monthlyCredits.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-foreground">월별 크레딧 사용 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.monthlyCredits}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="used" stroke="#ef4444" name="사용" />
              <Line type="monotone" dataKey="purchased" stroke="#22c55e" name="구매" />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 월별 결제 추이 */}
      {stats.monthlyPayments && stats.monthlyPayments.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-foreground">월별 결제 추이</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.monthlyPayments}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="amount" fill="#3b82f6" name="결제 금액 (원)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* 크레딧 타입별 사용 분포 */}
      {stats.creditTypeDistribution && stats.creditTypeDistribution.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 text-foreground">크레딧 타입별 사용 분포</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.creditTypeDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#8b5cf6" name="사용 횟수" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
