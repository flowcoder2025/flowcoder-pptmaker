import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * Admin 크래딧 추가/차감 API
 * POST /api/admin/users/[id]/credits
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 및 관리자 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // params await (Next.js 16)
    const { id } = await params

    const { amount, description } = await request.json()

    // 검증
    if (typeof amount !== 'number' || amount === 0) {
      return NextResponse.json(
        { error: '유효한 크래딧 금액을 입력해주세요.' },
        { status: 400 }
      )
    }

    // 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없어요.' },
        { status: 404 }
      )
    }

    // 현재 크래딧 잔액 조회
    const latestCredit = await prisma.creditTransaction.findFirst({
      where: { userId: id },
      orderBy: { createdAt: 'desc' },
      select: { balance: true },
    })

    const currentBalance = latestCredit?.balance || 0
    const newBalance = currentBalance + amount

    // 잔액이 음수가 되지 않도록 검증
    if (newBalance < 0) {
      return NextResponse.json(
        { error: '크래딧 잔액이 부족해요.' },
        { status: 400 }
      )
    }

    // 크래딧 거래 생성
    const transaction = await prisma.creditTransaction.create({
      data: {
        userId: id,
        type: amount > 0 ? 'BONUS' : 'REFUND',
        amount,
        balance: newBalance,
        description: description || (amount > 0 ? '관리자 추가' : '관리자 차감'),
      },
    })

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        balance: transaction.balance,
        createdAt: transaction.createdAt.toISOString(),
      },
    })
  } catch (error) {
    console.error('Admin credit adjustment error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: '크래딧 조정에 실패했어요.' },
      { status: 500 }
    )
  }
}
