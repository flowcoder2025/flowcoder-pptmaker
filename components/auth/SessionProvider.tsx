'use client'

/**
 * NextAuth SessionProvider Wrapper
 *
 * 클라이언트 컴포넌트에서 useSession 훅 사용 가능하게 함
 */

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function SessionProvider({ children }: Props) {
  return <NextAuthSessionProvider>{children}</NextAuthSessionProvider>
}
