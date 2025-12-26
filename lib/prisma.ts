/**
 * Prisma Client Singleton
 *
 * 개발 환경에서 Hot Reload 시 인스턴스 재생성 방지
 * Vercel 배포 시 기본 바이너리 엔진 사용 (WASM 문제 해결)
 * Supabase 연결 최적화 (P1017 에러 방지)
 */

import { PrismaClient } from '@prisma/client'
import { logger } from '@/lib/logger'

// Singleton 패턴
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Supabase 연결 최적화 (P1017 에러 방지)
const databaseUrl = process.env.DATABASE_URL

// Supabase Pooler 모드 사용 + 연결 타임아웃 설정
let connectionString = databaseUrl
if (databaseUrl) {
  const url = new URL(databaseUrl)

  // pgbouncer 파라미터 추가 (Supabase Pooler 모드)
  if (!url.searchParams.has('pgbouncer')) {
    url.searchParams.set('pgbouncer', 'true')
  }

  // 연결 타임아웃 설정
  if (!url.searchParams.has('connect_timeout')) {
    url.searchParams.set('connect_timeout', '10')
  }

  // Pool 타임아웃 설정
  if (!url.searchParams.has('pool_timeout')) {
    url.searchParams.set('pool_timeout', '10')
  }

  connectionString = url.toString()
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: connectionString
      }
    }
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// 연결 해제 시 재연결 (P1017 에러 복구)
prisma.$connect().catch((error) => {
  logger.error('Prisma 초기 연결 실패', error);
  logger.info('Prisma 재연결 시도 중');
})
