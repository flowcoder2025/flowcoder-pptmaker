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
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// ============================================
// NextAuth 설정
// ============================================

export const authOptions: NextAuthOptions = {
  // Credentials Provider 사용 시 Adapter 제거 (JWT 전략 필요)
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

        // 사용자 조회 (Account 정보 포함)
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: {
            accounts: {
              select: {
                provider: true,
              },
            },
          },
        })

        if (!user) {
          throw new Error('이메일 또는 비밀번호가 올바르지 않아요')
        }

        // OAuth로 가입한 사용자인 경우 (password가 없음)
        if (!user.password) {
          const providers = user.accounts.map((acc) => acc.provider)

          if (providers.length === 1) {
            // 단일 OAuth provider로 가입한 경우
            const provider = providers[0]
            const providerName = provider === 'github' ? 'GitHub' : provider === 'google' ? 'Google' : provider
            throw new Error(`${providerName} 계정으로 가입하셨어요. ${providerName}으로 로그인해주세요`)
          } else if (providers.length > 1) {
            // 여러 OAuth provider로 가입한 경우
            const providerNames = providers.map((p) => (p === 'github' ? 'GitHub' : p === 'google' ? 'Google' : p))
            const lastProvider = providerNames.pop()!
            const otherProviders = providerNames.join(', ')
            throw new Error(`${providerNames.length > 0 ? otherProviders + ' 또는 ' : ''}${lastProvider}로 가입하셨어요. ${providerNames.length > 0 ? otherProviders + ' 또는 ' : ''}${lastProvider}로 로그인해주세요`)
          } else {
            // Account는 없는데 password도 없는 예외 상황
            throw new Error('이메일 또는 비밀번호가 올바르지 않아요')
          }
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
    async signIn({ user, account, profile }) {
      // OAuth 로그인 시 사용자 생성 또는 업데이트
      if (account?.provider === 'github' || account?.provider === 'google') {
        try {
          console.log('🔐 OAuth signIn attempt:', {
            provider: account.provider,
            email: user.email,
            providerAccountId: account.providerAccountId
          })

          // 이메일로 기존 사용자 조회 (모든 Account 포함)
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email! },
            include: {
              accounts: {
                select: {
                  provider: true,
                },
              },
            },
          })
          console.log('👤 Existing user:', existingUser ? `Found (${existingUser.id})` : 'Not found')

          if (existingUser) {
            // 기존 사용자: Account 연결 확인
            const existingAccount = await prisma.account.findUnique({
              where: {
                provider_providerAccountId: {
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                },
              },
            })
            console.log('🔗 Existing account:', existingAccount ? 'Found' : 'Not found')

            if (!existingAccount) {
              // 같은 이메일에 다른 provider 연결 (새 Account 생성)
              console.log('📝 Linking new account to existing user...')
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  refresh_token: account.refresh_token,
                  access_token: account.access_token,
                  expires_at: account.expires_at,
                  token_type: account.token_type,
                  scope: account.scope,
                  id_token: account.id_token,
                  session_state: account.session_state,
                },
              })
              console.log('✅ New account linked to existing user')
            }

            // user.id를 기존 사용자 ID로 설정
            user.id = existingUser.id
          } else {
            // 새 사용자 생성
            console.log('📝 Creating new user...')
            const newUser = await prisma.user.create({
              data: {
                email: user.email!,
                name: user.name,
                image: user.image,
                emailVerified: new Date(),
              },
            })
            console.log('✅ User created:', newUser.id)

            // Account 생성
            console.log('📝 Creating account link...')
            await prisma.account.create({
              data: {
                userId: newUser.id,
                type: account.type,
                provider: account.provider,
                providerAccountId: account.providerAccountId,
                refresh_token: account.refresh_token,
                access_token: account.access_token,
                expires_at: account.expires_at,
                token_type: account.token_type,
                scope: account.scope,
                id_token: account.id_token,
                session_state: account.session_state,
              },
            })
            console.log('✅ Account link created')

            // user.id를 새 사용자 ID로 설정
            user.id = newUser.id
          }

          console.log('✅ OAuth signIn success')
          return true
        } catch (error) {
          console.error('❌ OAuth signIn error:', error)
          console.error('Error details:', {
            name: (error as Error).name,
            message: (error as Error).message,
            stack: (error as Error).stack,
          })
          return false
        }
      }

      // Credentials 로그인은 그대로 통과
      return true
    },
    async jwt({ token, user, account }) {
      // 로그인 시 user 정보를 token에 추가
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      // 세션에 userId 추가
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.image = token.picture as string
      }
      return session
    },
  },
  debug: process.env.NODE_ENV === 'development',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
