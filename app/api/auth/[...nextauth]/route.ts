/**
 * NextAuth.js API Route Handler
 *
 * OAuth Provider: GitHub, Google
 * Database: Prisma + Supabase
 * Adapter: @next-auth/prisma-adapter
 */

import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

// ============================================
// NextAuth 설정
// ============================================

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간마다 세션 갱신
  },
  pages: {
    signIn: '/', // 로그인 페이지 (홈으로 리디렉션)
    error: '/', // 에러 페이지
  },
  callbacks: {
    async session({ session, user }) {
      // 세션에 userId 추가
      if (session.user) {
        session.user.id = user.id
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
