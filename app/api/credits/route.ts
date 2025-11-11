/**
 * 크레딧 정보 조회 API
 *
 * GET /api/credits
 * 현재 로그인한 사용자의 크레딧 잔액과 최초 무료 사용 여부를 반환해요
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // 1. 인증 체크
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      )
    }

    // 2. User 테이블에서 최초 무료 사용 플래그 조회
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstTimeDeepResearchUsed: true,
        firstTimeQualityGenerationUsed: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: '사용자 정보를 찾을 수 없어요' },
        { status: 404 }
      )
    }

    // 3. CreditTransaction 테이블에서 최신 잔액 조회
    const latestTransaction = await prisma.creditTransaction.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      select: { balance: true },
    })

    // 4. 잔액이 없으면 0으로 간주
    const balance = latestTransaction?.balance ?? 0

    // 5. 응답 반환
    return NextResponse.json({
      balance,
      firstTimeDeepResearchUsed: user.firstTimeDeepResearchUsed,
      firstTimeQualityGenerationUsed: user.firstTimeQualityGenerationUsed,
    })
  } catch (error) {
    console.error('[API] 크레딧 정보 조회 실패:', error)
    return NextResponse.json(
      { error: '크레딧 정보를 가져올 수 없어요' },
      { status: 500 }
    )
  }
}
