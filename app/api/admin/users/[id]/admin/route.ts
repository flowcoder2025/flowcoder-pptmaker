import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { requireAdmin, grantSystemAdmin, revoke } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

/**
 * Admin 권한 부여 API
 * POST /api/admin/users/[id]/admin
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 및 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // params await (Next.js 16)
    const { id } = await params

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

    // 관리자 권한 부여
    await grantSystemAdmin(id)

    return NextResponse.json({
      success: true,
      message: '관리자 권한을 부여했어요.',
    })
  } catch (error) {
    console.error('Grant admin permission error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: '관리자 권한 부여에 실패했어요.' },
      { status: 500 }
    )
  }
}

/**
 * Admin 권한 제거 API
 * DELETE /api/admin/users/[id]/admin
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 인증 및 권한 체크
    const session = await auth()
    await requireAdmin(session?.user?.id)

    // params await (Next.js 16)
    const { id } = await params

    // 자기 자신의 관리자 권한 제거 방지
    if (session?.user?.id === id) {
      return NextResponse.json(
        { error: '자신의 관리자 권한은 제거할 수 없어요.' },
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

    // 관리자 권한 제거
    await revoke('system', 'global', 'admin', 'user', id)

    return NextResponse.json({
      success: true,
      message: '관리자 권한을 제거했어요.',
    })
  } catch (error) {
    console.error('Revoke admin permission error:', error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.message.includes('Unauthorized') ? 401 : 403 }
      )
    }

    return NextResponse.json(
      { error: '관리자 권한 제거에 실패했어요.' },
      { status: 500 }
    )
  }
}
