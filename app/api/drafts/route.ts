import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/drafts
 * 현재 사용자의 임시저장 내용 조회
 */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Draft GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch draft' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/drafts
 * 임시저장 내용 저장 (upsert)
 */
export async function POST(req: NextRequest) {
  console.log('[API] POST /api/drafts 요청 받음');

  try {
    const session = await auth();
    console.log('[API] 세션 확인:', session?.user?.id ? `userId: ${session.user.id}` : '세션 없음');

    if (!session?.user?.id) {
      console.log('[API] 인증 실패 - 401 반환');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { content } = body;
    console.log('[API] 저장할 내용 길이:', content?.length || 0);

    if (typeof content !== 'string') {
      console.log('[API] 잘못된 content 타입 - 400 반환');
      return NextResponse.json(
        { error: 'Invalid content type' },
        { status: 400 }
      );
    }

    console.log('[API] Prisma upsert 시작...');
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

    console.log('[API] 저장 완료:', { draftId: draft.id, contentLength: draft.content.length });
    return NextResponse.json({ draft });
  } catch (error) {
    console.error('[API] Draft POST error:', error);
    return NextResponse.json(
      { error: 'Failed to save draft' },
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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // deleteMany 사용 (레코드가 없어도 에러 안 남)
    await prisma.draft.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Draft DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
