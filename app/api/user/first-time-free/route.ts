import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

/**
 * GET: 무료 카운트 조회
 *
 * @description
 * 현재 로그인한 사용자의 무료 카운트 상태를 Supabase에서 조회합니다.
 *
 * @returns {
 *   firstTimeDeepResearchUsed: boolean,
 *   firstTimeQualityGenerationUsed: boolean
 * }
 */
export async function GET() {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '로그인이 필요해요' },
      { status: 401 }
    );
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        firstTimeDeepResearchUsed: true,
        firstTimeQualityGenerationUsed: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: '사용자를 찾을 수 없어요' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('❌ 무료 카운트 조회 실패:', error);
    return NextResponse.json(
      { error: '무료 카운트 조회에 실패했어요' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: 무료 카운트 사용 처리
 *
 * @description
 * 사용자가 무료 카운트를 사용했을 때 Supabase에 기록합니다.
 *
 * @param {Request} req - { type: 'deepResearch' | 'qualityGeneration' }
 * @returns { success: true }
 */
export async function PATCH(req: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json(
      { error: '로그인이 필요해요' },
      { status: 401 }
    );
  }

  try {
    const { type } = await req.json();

    // 타입 검증
    if (type !== 'deepResearch' && type !== 'qualityGeneration') {
      return NextResponse.json(
        { error: '잘못된 타입이에요' },
        { status: 400 }
      );
    }

    // 업데이트할 필드 결정
    const updateData =
      type === 'deepResearch'
        ? { firstTimeDeepResearchUsed: true }
        : { firstTimeQualityGenerationUsed: true };

    // Supabase 업데이트
    await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
    });

    console.log(`✅ 무료 카운트 사용 기록: ${type} (사용자: ${session.user.email})`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ 무료 카운트 업데이트 실패:', error);
    return NextResponse.json(
      { error: '무료 카운트 업데이트에 실패했어요' },
      { status: 500 }
    );
  }
}
