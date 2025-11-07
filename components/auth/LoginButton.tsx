'use client'

/**
 * 로그인 버튼 컴포넌트 (NextAuth)
 *
 * @example
 * ```tsx
 * <LoginButton />
 * ```
 */

import { signIn, signOut, useSession } from 'next-auth/react'

export function LoginButton() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <button
        disabled
        className="px-6 py-3 bg-gray-300 text-gray-600 rounded-lg font-medium cursor-not-allowed"
      >
        로그인 확인 중...
      </button>
    )
  }

  if (session) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm">
          <p className="font-medium">{session.user.name || session.user.email}</p>
          {session.user.email && (
            <p className="text-gray-500">{session.user.email}</p>
          )}
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
        >
          로그아웃
        </button>
      </div>
    )
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => signIn('github', { callbackUrl: '/' })}
        className="px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
      >
        GitHub으로 로그인
      </button>
      <button
        onClick={() => signIn('google', { callbackUrl: '/' })}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
      >
        Google로 로그인
      </button>
    </div>
  )
}
