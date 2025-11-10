/**
 * Prisma Client Singleton
 *
 * 개발 환경에서 Hot Reload 시 인스턴스 재생성 방지
 * Vercel 배포 시 기본 바이너리 엔진 사용 (WASM 문제 해결)
 */

import { PrismaClient } from '@prisma/client'

// Singleton 패턴
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
