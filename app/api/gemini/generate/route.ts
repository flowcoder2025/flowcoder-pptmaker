/**
 * Gemini AI 서버 프록시 API
 *
 * POST /api/gemini/generate - 슬라이드 콘텐츠 생성
 *
 * 🔒 보안: API 키를 서버에서만 사용하여 클라이언트 노출 방지
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCurrentUserId } from '@/lib/auth'
import { logger } from '@/lib/logger'
import { geminiGenerateRequestSchema, validateRequest } from '@/lib/validations'

// ============================================
// 서버 전용 Gemini 설정
// ============================================

// 🔒 서버 전용 API 키 (NEXT_PUBLIC_ 제거)
const getServerApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았어요')
  }
  return key
}

// Gemini 모델 설정
const GEMINI_CONFIG = {
  flash: {
    model: 'gemini-2.0-flash',
    temperature: 0.3,
    maxOutputTokens: 16384,
  },
  pro: {
    model: 'gemini-2.5-pro-preview-06-05',
    temperature: 0.3,
    maxOutputTokens: 32768,
  },
} as const

// ============================================
// Rate Limiting (간단한 메모리 기반)
// ============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = {
  maxRequests: 10, // 분당 최대 요청 수
  windowMs: 60 * 1000, // 1분
}

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitMap.get(userId)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT.windowMs })
    return true
  }

  if (userLimit.count >= RATE_LIMIT.maxRequests) {
    return false
  }

  userLimit.count++
  return true
}

// ============================================
// POST /api/gemini/generate
// ============================================

interface GenerateResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // 1. 인증 체크
    const userId = await getCurrentUserId()
    if (!userId) {
      logger.warn('Gemini API 미인증 접근 시도')
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      )
    }

    // 2. Rate Limiting
    if (!checkRateLimit(userId)) {
      logger.warn('Gemini API Rate Limit 초과', { userId })
      return NextResponse.json(
        { error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    // 3. Zod 스키마 검증
    const body = await request.json()
    const validation = validateRequest(geminiGenerateRequestSchema, body)
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { prompt, useProModel, maxTokens } = validation.data

    // 5. Gemini API 호출
    const config = useProModel ? GEMINI_CONFIG.pro : GEMINI_CONFIG.flash
    const modelName = useProModel ? 'Pro' : 'Flash'

    logger.info(`Gemini ${modelName} 생성 시작`, { userId, promptLength: prompt.length })

    const genAI = new GoogleGenerativeAI(getServerApiKey())
    const model = genAI.getGenerativeModel({
      model: config.model,
      generationConfig: {
        temperature: config.temperature,
        maxOutputTokens: maxTokens || config.maxOutputTokens,
      },
    })

    // 재시도 로직
    const MAX_RETRIES = 3
    const RETRY_DELAYS = [2000, 4000, 8000]
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = RETRY_DELAYS[attempt - 1]
          logger.info(`Gemini ${modelName} 재시도`, { attempt, delay })
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const result = await model.generateContent(prompt)
        const content = result.response.text()

        // 6. 응답 처리
        const duration = Date.now() - startTime
        const usage = result.response.usageMetadata

        logger.info(`Gemini ${modelName} 생성 완료`, {
          userId,
          duration,
          contentLength: content.length,
          tokens: usage?.totalTokenCount,
        })

        const response: GenerateResponse = {
          content,
          usage: usage ? {
            promptTokens: usage.promptTokenCount || 0,
            completionTokens: usage.candidatesTokenCount || 0,
            totalTokens: usage.totalTokenCount || 0,
          } : undefined,
        }

        return NextResponse.json(response)
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        const isServerOverloaded = lastError.message.includes('503') ||
                                    lastError.message.includes('overloaded')

        if (!isServerOverloaded || attempt === MAX_RETRIES) {
          throw lastError
        }
      }
    }

    throw lastError || new Error('알 수 없는 오류')
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류'
    logger.error('Gemini API 호출 실패', error)

    // 에러 타입별 응답
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      return NextResponse.json(
        { error: 'AI 서버가 일시적으로 바빠요. 잠시 후 다시 시도해주세요.' },
        { status: 503 }
      )
    }

    if (errorMessage.includes('API_KEY')) {
      return NextResponse.json(
        { error: '서버 설정 오류가 발생했어요' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { error: '콘텐츠를 생성하지 못했어요. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
}
