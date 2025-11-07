/**
 * Zanzibar 권한 시스템
 * Google Zanzibar ReBAC (Relationship-Based Access Control) 구현
 *
 * 참고: https://research.google/pubs/pub48190/
 */

import { prisma } from './prisma'

// ============================================
// Types
// ============================================

export type Namespace = 'presentation' | 'system'

export type Relation = 'owner' | 'editor' | 'viewer' | 'admin'

export type SubjectType = 'user' | 'user_set'

// ============================================
// Permission Inheritance Map
// ============================================

/**
 * 권한 상속 관계
 * - owner는 editor, viewer 권한을 상속
 * - editor는 viewer 권한을 상속
 */
const inheritanceMap: Record<Relation, Relation[]> = {
  viewer: [],
  editor: ['viewer'],
  owner: ['editor', 'viewer'],
  admin: [], // 시스템 레벨 권한 (상속 없음)
}

// ============================================
// Check API: 권한 확인
// ============================================

/**
 * 권한 확인
 *
 * @param userId - 사용자 ID
 * @param namespace - 리소스 종류 ('presentation', 'system')
 * @param objectId - 리소스 ID
 * @param relation - 확인할 권한 ('owner', 'editor', 'viewer', 'admin')
 * @returns 권한 보유 여부
 *
 * @example
 * ```typescript
 * const canEdit = await check('alice', 'presentation', '123', 'editor')
 * // alice가 presentation:123을 editor로 접근 가능한가?
 * ```
 */
export async function check(
  userId: string,
  namespace: Namespace,
  objectId: string,
  relation: Relation
): Promise<boolean> {
  // 1단계: 직접 권한 확인
  const directPermission = await prisma.relationTuple.findFirst({
    where: {
      namespace,
      objectId,
      relation,
      subjectType: 'user',
      subjectId: userId,
    },
  })

  if (directPermission) {
    return true
  }

  // 2단계: 상속 권한 확인
  const inheritedRelations = getInheritedRelations(relation)
  if (inheritedRelations.length > 0) {
    const inheritedPermission = await prisma.relationTuple.findFirst({
      where: {
        namespace,
        objectId,
        relation: { in: inheritedRelations },
        subjectType: 'user',
        subjectId: userId,
      },
    })

    if (inheritedPermission) {
      return true
    }
  }

  // 3단계: 시스템 레벨 권한 확인
  // admin 사용자는 모든 리소스에 대한 모든 권한 보유
  const systemAdmin = await prisma.relationTuple.findFirst({
    where: {
      namespace: 'system',
      objectId: 'global',
      relation: 'admin',
      subjectType: 'user',
      subjectId: userId,
    },
  })

  if (systemAdmin) {
    return true
  }

  // 4단계: 와일드카드 확인 (공개 리소스)
  const wildcardPermission = await prisma.relationTuple.findFirst({
    where: {
      namespace,
      objectId,
      relation,
      subjectType: 'user',
      subjectId: '*',
    },
  })

  return !!wildcardPermission
}

/**
 * 여러 권한 중 하나라도 보유하면 통과
 *
 * @example
 * ```typescript
 * const canDelete = await checkAny('alice', 'presentation', '123', ['owner', 'admin'])
 * // alice가 owner 또는 admin 권한을 가지고 있는가?
 * ```
 */
export async function checkAny(
  userId: string,
  namespace: Namespace,
  objectId: string,
  relations: Relation[]
): Promise<boolean> {
  for (const relation of relations) {
    const hasPermission = await check(userId, namespace, objectId, relation)
    if (hasPermission) {
      return true
    }
  }
  return false
}

/**
 * 모든 권한을 보유해야 통과
 *
 * @example
 * ```typescript
 * const canPublish = await checkAll('alice', 'presentation', '123', ['editor', 'viewer'])
 * // alice가 editor이면서 동시에 viewer 권한을 가지고 있는가?
 * ```
 */
export async function checkAll(
  userId: string,
  namespace: Namespace,
  objectId: string,
  relations: Relation[]
): Promise<boolean> {
  for (const relation of relations) {
    const hasPermission = await check(userId, namespace, objectId, relation)
    if (!hasPermission) {
      return false
    }
  }
  return true
}

// ============================================
// Write API: 권한 부여
// ============================================

/**
 * 권한 부여
 *
 * @example
 * ```typescript
 * await grant('presentation', '123', 'owner', 'user', 'alice')
 * // alice에게 presentation:123의 owner 권한 부여
 * ```
 */
export async function grant(
  namespace: Namespace,
  objectId: string,
  relation: Relation,
  subjectType: SubjectType,
  subjectId: string
): Promise<void> {
  await prisma.relationTuple.upsert({
    where: {
      namespace_objectId_relation_subjectType_subjectId: {
        namespace,
        objectId,
        relation,
        subjectType,
        subjectId,
      },
    },
    update: {},
    create: {
      namespace,
      objectId,
      relation,
      subjectType,
      subjectId,
    },
  })
}

/**
 * 프레젠테이션 소유자 권한 부여 (헬퍼 함수)
 */
export async function grantPresentationOwnership(
  presentationId: string,
  userId: string
): Promise<void> {
  await grant('presentation', presentationId, 'owner', 'user', userId)
}

/**
 * 시스템 관리자 권한 부여 (헬퍼 함수)
 */
export async function grantSystemAdmin(userId: string): Promise<void> {
  await grant('system', 'global', 'admin', 'user', userId)
}

// ============================================
// Delete API: 권한 제거
// ============================================

/**
 * 권한 제거
 *
 * @example
 * ```typescript
 * await revoke('presentation', '123', 'editor', 'user', 'bob')
 * // bob의 presentation:123 editor 권한 제거
 * ```
 */
export async function revoke(
  namespace: Namespace,
  objectId: string,
  relation: Relation,
  subjectType: SubjectType,
  subjectId: string
): Promise<void> {
  await prisma.relationTuple.deleteMany({
    where: {
      namespace,
      objectId,
      relation,
      subjectType,
      subjectId,
    },
  })
}

/**
 * 리소스의 모든 권한 제거
 *
 * @example
 * ```typescript
 * await revokeAll('presentation', '123')
 * // presentation:123의 모든 권한 튜플 제거
 * ```
 */
export async function revokeAll(
  namespace: Namespace,
  objectId: string
): Promise<void> {
  await prisma.relationTuple.deleteMany({
    where: {
      namespace,
      objectId,
    },
  })
}

// ============================================
// List API: 접근 가능한 리소스 조회
// ============================================

/**
 * 사용자가 특정 권한을 가진 리소스 ID 목록 조회
 *
 * @example
 * ```typescript
 * const editablePresentationIds = await listAccessible('alice', 'presentation', 'editor')
 * // alice가 editor 권한을 가진 모든 프레젠테이션 ID
 * ```
 */
export async function listAccessible(
  userId: string,
  namespace: Namespace,
  relation: Relation
): Promise<string[]> {
  // 1. 직접 권한 + 상속 권한
  const inheritedRelations = [relation, ...getInheritedRelations(relation)]

  const tuples = await prisma.relationTuple.findMany({
    where: {
      namespace,
      relation: { in: inheritedRelations },
      subjectType: 'user',
      subjectId: userId,
    },
    select: {
      objectId: true,
    },
  })

  // 2. 시스템 admin 권한 확인
  const isAdmin = await check(userId, 'system', 'global', 'admin')

  if (isAdmin) {
    // admin은 모든 리소스 접근 가능
    // 실제로는 DB에서 모든 리소스 ID 조회 필요
    // 여기서는 빈 배열 반환 (호출하는 쪽에서 admin 여부 확인 후 별도 처리)
    return []
  }

  return tuples.map((t: { objectId: string }) => t.objectId)
}

// ============================================
// Utility Functions
// ============================================

/**
 * 권한 상속 관계 조회
 *
 * @param relation - 권한 종류
 * @returns 상위 권한 목록
 *
 * @example
 * ```typescript
 * getInheritedRelations('editor') // ['owner']
 * getInheritedRelations('viewer') // ['editor', 'owner']
 * ```
 */
function getInheritedRelations(relation: Relation): Relation[] {
  const result: Relation[] = []

  // inheritanceMap을 역으로 탐색
  for (const [parentRelation, inheritedRelations] of Object.entries(
    inheritanceMap
  )) {
    if (inheritedRelations.includes(relation)) {
      result.push(parentRelation as Relation)
    }
  }

  return result
}

// ============================================
// Admin Middleware
// ============================================

/**
 * 관리자 전용 미들웨어
 *
 * @throws Error - 권한 없음
 */
export async function requireAdmin(userId: string | undefined): Promise<void> {
  if (!userId) {
    throw new Error('Unauthorized: 로그인이 필요해요.')
  }

  const isAdmin = await check(userId, 'system', 'global', 'admin')

  if (!isAdmin) {
    throw new Error('Forbidden: 관리자 권한이 필요해요.')
  }
}

/**
 * 프레젠테이션 소유자 권한 확인
 *
 * @throws Error - 권한 없음
 */
export async function requirePresentationOwner(
  userId: string | undefined,
  presentationId: string
): Promise<void> {
  if (!userId) {
    throw new Error('Unauthorized: 로그인이 필요해요.')
  }

  const isOwner = await check(userId, 'presentation', presentationId, 'owner')

  if (!isOwner) {
    throw new Error('Forbidden: 프레젠테이션 소유자만 접근할 수 있어요.')
  }
}

/**
 * 프레젠테이션 편집 권한 확인
 *
 * @throws Error - 권한 없음
 */
export async function requirePresentationEditor(
  userId: string | undefined,
  presentationId: string
): Promise<void> {
  if (!userId) {
    throw new Error('Unauthorized: 로그인이 필요해요.')
  }

  const canEdit = await check(userId, 'presentation', presentationId, 'editor')

  if (!canEdit) {
    throw new Error('Forbidden: 편집 권한이 없어요.')
  }
}

/**
 * 프레젠테이션 조회 권한 확인
 *
 * @throws Error - 권한 없음
 */
export async function requirePresentationViewer(
  userId: string | undefined,
  presentationId: string
): Promise<void> {
  if (!userId) {
    throw new Error('Unauthorized: 로그인이 필요해요.')
  }

  const canView = await check(userId, 'presentation', presentationId, 'viewer')

  if (!canView) {
    throw new Error('Forbidden: 조회 권한이 없어요.')
  }
}
