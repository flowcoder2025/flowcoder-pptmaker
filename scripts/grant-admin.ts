/**
 * 관리자 권한 부여 스크립트
 *
 * 사용법:
 * npx tsx scripts/grant-admin.ts
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const USER_ID = 'cmhspluud0003siyxxzch1a53'

async function main() {
  console.log(`🔐 사용자 ${USER_ID}에게 관리자 권한 부여 중...`)

  // 사용자 확인
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
  })

  if (!user) {
    console.error('❌ 사용자를 찾을 수 없습니다.')
    return
  }

  console.log(`✓ 사용자 확인: ${user.name || user.email}`)

  // 관리자 권한 부여
  await prisma.relationTuple.upsert({
    where: {
      namespace_objectId_relation_subjectType_subjectId: {
        namespace: 'system',
        objectId: 'global',
        relation: 'admin',
        subjectType: 'user',
        subjectId: USER_ID,
      },
    },
    update: {},
    create: {
      namespace: 'system',
      objectId: 'global',
      relation: 'admin',
      subjectType: 'user',
      subjectId: USER_ID,
    },
  })

  console.log('✅ 관리자 권한이 부여되었습니다!')
}

main()
  .catch((error) => {
    console.error('❌ 오류 발생:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
