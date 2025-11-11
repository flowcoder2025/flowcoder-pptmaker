import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'
import { grantCredits } from '@/lib/credits'
import { CreditSourceType } from '@/types/credits'

/**
 * Admin 크레딧 지급 API (v2.0)
 *
 * POST /api/admin/users/[id]/credits
 *
 * @auth Required (Admin only)
 * @body {
 *   amount: number (양수만 가능, 음수는 consumeCredits 사용)
 *   sourceType: 'FREE' | 'EVENT' | 'SUBSCRIPTION' | 'PURCHASE'
 *   description?: string
 *   expiresInDays?: number (EVENT/SUBSCRIPTION에만 적용)
 * }
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. 인증 및 관리자 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // 2. params await (Next.js 16)
    const { id } = await params

    // 3. Request body 파싱
    const { amount, sourceType, description, expiresInDays } =
      await request.json()

    // 4. 검증
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: '양수의 크레딧 금액을 입력해주세요.' },
        { status: 400 }
      )
    }

    if (!sourceType || !Object.values(CreditSourceType).includes(sourceType)) {
      return NextResponse.json(
        {
          error: '유효한 크레딧 타입을 선택해주세요.',
          validTypes: Object.values(CreditSourceType),
        },
        { status: 400 }
      )
    }

    // expiresInDays 검증
    if (expiresInDays !== undefined) {
      if (typeof expiresInDays !== 'number' || expiresInDays <= 0) {
        return NextResponse.json(
          { error: '유효기간은 양수여야 해요.' },
          { status: 400 }
        )
      }

      // FREE/PURCHASE는 영구 크레딧이므로 expiresInDays 무시 (경고만)
      if (
        sourceType === CreditSourceType.FREE ||
        sourceType === CreditSourceType.PURCHASE
      ) {
        console.warn(
          `[WARN] ${sourceType} 타입은 영구 크레딧이므로 expiresInDays가 무시됩니다.`
        )
      }
    }

    // 5. 사용자 확인
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없어요.' },
        { status: 404 }
      )
    }

    // 6. 크레딧 지급 (새로운 시스템)
    const transaction = await grantCredits(
      id,
      sourceType as CreditSourceType,
      amount,
      description || `관리자 크레딧 지급 (${sourceType})`,
      expiresInDays
    )

    console.log(
      `[ADMIN] 크레딧 지급: ${user.email} - ${amount} 크레딧 (${sourceType})`
    )

    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        userId: transaction.userId,
        type: transaction.type,
        sourceType: transaction.sourceType,
        amount: transaction.amount,
        description: transaction.description,
        expiresAt: transaction.expiresAt?.toISOString() || null,
        createdAt: transaction.createdAt.toISOString(),
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('❌ [ADMIN] 크레딧 지급 실패:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: '크레딧 지급에 실패했어요.' },
      { status: 500 }
    )
  }
}
