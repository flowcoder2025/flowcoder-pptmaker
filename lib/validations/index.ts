/**
 * Zod 스키마 정의
 *
 * API 입력 검증을 위한 스키마 모음
 * Zod v4 사용
 */

import { z } from 'zod'

// ============================================
// 공통 타입
// ============================================

export const aspectRatioSchema = z.enum(['16:9', '4:3', 'A4-portrait'])
export const pageFormatSchema = z.enum(['slides', 'one-page'])
export const planSchema = z.enum(['free', 'pro', 'premium'])
export const researchModeSchema = z.enum(['none', 'fast', 'deep', 'sonar', 'sonar-reasoning'])
export const modelSchema = z.enum(['flash', 'pro'])
export const perplexityModelSchema = z.enum(['sonar', 'sonar-reasoning', 'sonar-deep-research'])

// ============================================
// POST /api/generate - 멀티모달 슬라이드 생성
// ============================================

export const attachmentFileSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  mimeType: z.string().min(1),
  size: z.number().min(0),
  data: z.string().min(1),
})

export const generateRequestSchema = z.object({
  topic: z.string().min(1).max(10000),
  attachments: z.array(attachmentFileSchema).optional().default([]),
  researchMode: researchModeSchema.optional().default('none'),
  model: modelSchema.optional().default('flash'),
  slideCount: z.number().int().min(1).max(30).optional().default(10),
  plan: planSchema.optional().default('free'),
  aspectRatio: aspectRatioSchema.optional().default('16:9'),
  pageFormat: pageFormatSchema.optional().default('slides'),
})

export type GenerateRequest = z.infer<typeof generateRequestSchema>

// ============================================
// POST /api/gemini/generate - Gemini API 프록시
// ============================================

export const geminiGenerateRequestSchema = z.object({
  prompt: z.string().min(1).max(100000),
  useProModel: z.boolean().optional().default(false),
  maxTokens: z.number().int().min(1).max(100000).optional(),
})

export type GeminiGenerateRequest = z.infer<typeof geminiGenerateRequestSchema>

// ============================================
// POST /api/presentations - 프레젠테이션 생성
// ============================================

// Prisma JSON 호환을 위한 타입
const jsonValueSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.null(),
    z.array(jsonValueSchema),
    z.record(z.string(), jsonValueSchema),
  ])
)

export const presentationCreateRequestSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional().nullable(),
  slideData: z.record(z.string(), jsonValueSchema),
  slides: z.array(z.record(z.string(), jsonValueSchema)).optional().nullable(),
  metadata: z.record(z.string(), jsonValueSchema).optional().nullable(),
})

export type PresentationCreateRequest = z.infer<typeof presentationCreateRequestSchema>

// ============================================
// POST /api/research - Perplexity 자료 조사
// ============================================

export const researchRequestSchema = z.object({
  topic: z.string().min(1).max(5000),
  model: perplexityModelSchema.optional().default('sonar'),
})

export type ResearchRequest = z.infer<typeof researchRequestSchema>

// ============================================
// POST /api/credits/grant - 크레딧 지급
// ============================================

export const creditGrantRequestSchema = z.object({
  userId: z.string().min(1),
  sourceType: z.enum(['FREE', 'EVENT', 'SUBSCRIPTION', 'PURCHASE']),
  amount: z.number().int().min(1).max(100000),
  description: z.string().min(1).max(500),
  expiresInDays: z.number().int().min(1).max(365).optional(),
})

export type CreditGrantRequest = z.infer<typeof creditGrantRequestSchema>

// ============================================
// POST /api/drafts - 임시저장
// ============================================

export const draftSaveRequestSchema = z.object({
  content: z.string().min(1).max(50000),
  type: z.enum(['presentation', 'slide']).optional().default('presentation'),
})

export type DraftSaveRequest = z.infer<typeof draftSaveRequestSchema>

// ============================================
// POST /api/auth/signup - 회원가입
// ============================================

export const signupRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
  name: z.string().min(1).max(50).optional(),
})

export type SignupRequest = z.infer<typeof signupRequestSchema>

// ============================================
// PATCH /api/presentations/[id] - 프레젠테이션 수정
// ============================================

export const presentationUpdateRequestSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(1000).optional().nullable(),
  slideData: z.record(z.string(), jsonValueSchema).optional(),
  slides: z.array(z.record(z.string(), jsonValueSchema)).optional().nullable(),
  metadata: z.record(z.string(), jsonValueSchema).optional().nullable(),
  isPublic: z.boolean().optional(),
})

export type PresentationUpdateRequest = z.infer<typeof presentationUpdateRequestSchema>

// ============================================
// 공통 유틸리티
// ============================================

/**
 * Zod 스키마 검증 헬퍼
 *
 * @example
 * const result = validateRequest(geminiGenerateRequestSchema, body)
 * if (!result.success) {
 *   return NextResponse.json({ error: result.error }, { status: 400 })
 * }
 * const validatedData = result.data
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)

  if (!result.success) {
    // Zod v4: issues 프로퍼티 사용
    const firstIssue = result.error.issues[0]
    const errorMessage = firstIssue?.message || '입력 데이터가 올바르지 않아요'
    return { success: false, error: errorMessage }
  }

  return { success: true, data: result.data }
}

/**
 * Zod 에러 메시지 포맷팅
 */
export function formatZodError(error: z.ZodError): string {
  const firstIssue = error.issues[0]
  if (!firstIssue) return '입력 데이터가 올바르지 않아요'

  const path = firstIssue.path.join('.')
  const message = firstIssue.message

  // 경로가 있으면 포함, 없으면 메시지만
  return path ? `${path}: ${message}` : message
}
