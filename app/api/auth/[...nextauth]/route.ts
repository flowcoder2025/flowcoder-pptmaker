/**
 * NextAuth.js API Route Handler
 *
 * OAuth Provider: GitHub, Google
 * Credentials Provider: Email + Password
 * Database: Prisma + Supabase
 */

import NextAuth, { NextAuthOptions } from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// ============================================
// NextAuth 설정
// ============================================

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // GitHub OAuth
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    // Google OAuth
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // Email + Password
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: '이메일', type: 'email', placeholder: 'email@example.com' },
        password: { label: '비밀번호', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('이메일과 비밀번호를 입력해주세요')
        }

        // 사용자 조회
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않아요')
        }

        // 비밀번호 검증
        const isValidPassword = await bcrypt.compare(credentials.password, user.password)

        if (!isValidPassword) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않아요')
        }

        // 인증 성공
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Credentials Provider는 JWT 필요
    maxAge: 30 * 24 * 60 * 60, // 30일
  },
  pages: {
    signIn: '/login', // 로그인 페이지
    error: '/login', // 에러 페이지
  },
  callbacks: {
    async jwt({ token, user }) {
      // 로그인 시 user 정보를 token에 추가
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // 세션에 userId 추가
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
