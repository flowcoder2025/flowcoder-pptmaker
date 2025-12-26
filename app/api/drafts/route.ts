import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { draftSaveRequestSchema, validateRequest } from '@/lib/validations';

/**
 * GET /api/drafts
 * 현재 사용자의 임시저장 내용 조회
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });
    }

    const draft = await prisma.draft.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ draft });
  } catch (error) {
    logger.error('임시저장 조회 실패', error);
    return NextResponse.json(
      { error: '임시저장 내용을 불러오지 못했어요' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drafts
 * 임시저장 내용 저장 (upsert)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      logger.debug('임시저장 인증 실패');
      return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });
    }

    // Zod 스키마 검증
    const body = await req.json();
    const validation = validateRequest(draftSaveRequestSchema, body);
    if (!validation.success) {
      logger.debug('임시저장 검증 실패', { error: validation.error });
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    const { content } = validation.data;

    // upsert: userId로 기존 레코드가 있으면 업데이트, 없으면 생성
    const draft = await prisma.draft.upsert({
      where: { userId: session.user.id },
      update: {
        content,
        updatedAt: new Date(),
      },
      create: {
        userId: session.user.id,
        content,
      },
      select: {
        id: true,
        content: true,
        updatedAt: true,
      },
    });

    logger.debug('임시저장 완료', { draftId: draft.id, contentLength: draft.content.length });
    return NextResponse.json({ draft });
  } catch (error) {
    logger.error('임시저장 저장 실패', error);
    return NextResponse.json(
      { error: '임시저장에 실패했어요' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drafts
 * 임시저장 내용 삭제
 */
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요해요' }, { status: 401 });
    }

    // deleteMany 사용 (레코드가 없어도 에러 안 남)
    await prisma.draft.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('임시저장 삭제 실패', error);
    return NextResponse.json(
      { error: '임시저장 삭제에 실패했어요' },
      { status: 500 }
    );
  }
}
