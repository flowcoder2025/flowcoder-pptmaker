/**
 * 크레딧 정보 조회 API
 *
 * GET /api/credits
 * 현재 로그인한 사용자의 크레딧 잔액과 최초 무료 사용 여부를 반환해요
 *
 * v2.0: 유효기간 관리 및 타입별 잔액 추가
 */

import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  calculateBalance,
  getExpiringCredits,
} from '@/lib/credits'

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

    // 3. 크레딧 잔액 계산 (만료되지 않은 크레딧만, 타입별 분리)
    const { balance, balanceByType } = await calculateBalance(session.user.id)

    // 4. 곧 만료될 크레딧 조회 (7일 이내)
    const expiringCredits = await getExpiringCredits(session.user.id)

    // 5. 응답 반환
    return NextResponse.json({
      balance, // 총 잔액
      balanceByType, // 타입별 잔액 (FREE, EVENT, SUBSCRIPTION, PURCHASE)
      firstTimeDeepResearchUsed: user.firstTimeDeepResearchUsed,
      firstTimeQualityGenerationUsed: user.firstTimeQualityGenerationUsed,
      expiringCredits, // 만료 예정 크레딧 목록
    })
  } catch (error) {
    console.error('[API] 크레딧 정보 조회 실패:', error)
    return NextResponse.json(
      { error: '크레딧 정보를 가져올 수 없어요' },
      { status: 500 }
    )
  }
}
