/**
 * GET /api/profile
 *
 * 현재 사용자 프로필 정보 조회
 */
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: '사용자를 찾을 수 없어요' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (error) {
    logger.error('프로필 조회 오류', error);
    return NextResponse.json(
      {
        success: false,
        error: '프로필 조회 중 오류가 발생했어요',
      },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile
 *
 * 사용자 프로필 정보 업데이트
 *
 * @description
 * 1. NextAuth 세션 확인
 * 2. 요청 본문 검증 (name, phoneNumber)
 * 3. Prisma로 User 업데이트
 * 4. 성공 응답 반환
 */

import { NextRequest } from 'next/server';

export async function PATCH(request: NextRequest) {
  try {
    // 1. 인증 체크
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '로그인이 필요해요' },
        { status: 401 }
      );
    }

    // 2. 요청 본문 파싱 및 검증
    const body = await request.json();
    const { name, phoneNumber } = body;

    // 3. 사용자 정보 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: name || null,
        phoneNumber: phoneNumber || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        image: true,
      },
    });

    // 4. 성공 응답 반환
    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    logger.error('프로필 업데이트 오류', error);

    return NextResponse.json(
      {
        success: false,
        error: '프로필 업데이트 중 오류가 발생했어요',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}
