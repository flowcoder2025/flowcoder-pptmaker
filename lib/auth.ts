/**
 * NextAuth 세션 관리 유틸리티
 *
 * 서버 컴포넌트와 API Routes에서 사용
 */

import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// ============================================
// 서버 사이드 세션 조회
// ============================================

/**
 * 현재 로그인된 사용자 ID 가져오기 (서버 전용)
 *
 * @returns userId 또는 undefined
 *
 * @example
 * ```typescript
 * // API Route에서 사용
 * const userId = await getCurrentUserId()
 * if (!userId) {
 *   return NextResponse.json({ error: '로그인이 필요해요.' }, { status: 401 })
 * }
 * ```
 */
export async function getCurrentUserId(): Promise<string | undefined> {
  const session = await getServerSession(authOptions)
  return session?.user?.id || undefined
}

/**
 * 현재 세션 가져오기 (서버 전용)
 *
 * @returns Session 객체 또는 null
 *
 * @example
 * ```typescript
 * const session = await getSession()
 * if (session) {
 *   console.log(session.user.email)
 * }
 * ```
 */
export async function getSession() {
  return await getServerSession(authOptions)
}

/**
 * 로그인 확인 (서버 전용)
 *
 * @returns boolean
 *
 * @example
 * ```typescript
 * const isLoggedIn = await isAuthenticated()
 * if (!isLoggedIn) {
 *   redirect('/login')
 * }
 * ```
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getServerSession(authOptions)
  return !!session
}

/**
 * auth 함수 (getSession의 alias)
 * Admin 페이지 및 API Routes에서 사용
 */
export const auth = getSession

// ============================================
// 타입 확장
// ============================================

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      phoneNumber?: string | null
    }
  }

  interface User {
    phoneNumber?: string | null
  }
}
