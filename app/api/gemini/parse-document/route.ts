/**
 * Gemini 문서 파싱 API
 *
 * POST /api/gemini/parse-document - 첨부 파일에서 텍스트 추출
 *
 * 🔒 보안: API 키를 서버에서만 사용하여 클라이언트 노출 방지
 */

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getCurrentUserId } from '@/lib/auth'
import { logger } from '@/lib/logger'

// ============================================
// 서버 전용 Gemini 설정
// ============================================

const getServerApiKey = (): string => {
  const key = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!key) {
    throw new Error('GEMINI_API_KEY가 설정되지 않았어요')
  }
  return key
}

// ============================================
// Rate Limiting (간단한 메모리 기반)
// ============================================

const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const RATE_LIMIT = {
  maxRequests: 20, // 분당 최대 요청 수 (파일 파싱은 더 많이 허용)
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
// 타입 정의
// ============================================

interface FileAttachment {
  name: string
  mimeType: string
  data: string // Base64 인코딩된 데이터
  size: number
}

interface ParseDocumentRequest {
  file: FileAttachment
}

interface ParseDocumentResponse {
  fileName: string
  content: string
  sections: string[]
  success: boolean
  error?: string
}

// ============================================
// POST /api/gemini/parse-document
// ============================================

export async function POST(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()

  try {
    // 1. 인증 체크
    const userId = await getCurrentUserId()
    if (!userId) {
      logger.warn('Gemini 문서 파싱 미인증 접근 시도')
      return NextResponse.json(
        { error: '로그인이 필요해요' },
        { status: 401 }
      )
    }

    // 2. Rate Limiting
    if (!checkRateLimit(userId)) {
      logger.warn('Gemini 문서 파싱 Rate Limit 초과', { userId })
      return NextResponse.json(
        { error: '요청이 너무 많아요. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      )
    }

    // 3. 요청 파싱
    const body: ParseDocumentRequest = await request.json()
    const { file } = body

    if (!file || !file.data || !file.mimeType) {
      return NextResponse.json(
        { error: '파일 정보가 올바르지 않아요' },
        { status: 400 }
      )
    }

    // 4. 파일 크기 제한 (10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: '파일이 너무 커요. 10MB 이하 파일만 업로드할 수 있어요.' },
        { status: 400 }
      )
    }

    logger.info('문서 파싱 시작', { userId, fileName: file.name, mimeType: file.mimeType })

    // 5. Gemini API 호출
    const genAI = new GoogleGenerativeAI(getServerApiKey())
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    // 문서 파싱 프롬프트
    const prompt = `이 파일의 모든 내용을 정확하고 상세하게 추출해주세요.

**추출 규칙:**
1. **모든 텍스트를 빠짐없이 추출**하세요 (제목, 본문, 캡션, 주석 등 모두 포함)
2. **원본의 순서와 흐름을 유지**하세요 (섹션, 단락, 목록의 순서 그대로)
3. **데이터와 숫자를 정확하게 추출**하세요 (표, 차트, 통계 등)
4. **핵심 인사이트를 명확하게 표현**하세요
5. **자연스러운 문장**으로 작성하세요

**금지 사항:**
- 마크다운 문법 사용 절대 금지 (#, ##, *, **, _, -, >, 백틱 등)
- 플레이스홀더 사용 금지 ("[제목]", "[내용]", "[설명]" 같은 표현 절대 금지)
- 의미 없는 예시 금지 ("항목 1", "포인트 1" 같은 일반적인 표현 금지)
- 빈 섹션 금지 (모든 섹션은 실제 내용을 포함해야 함)

**출력 방식:**
- 추출된 모든 내용을 자연스러운 문장으로 작성하세요
- 원본 문서의 흐름을 유지하면서 모든 정보를 포함하세요
- 구조는 자연스럽게 표현하세요 (강제된 형식 없음)
- 중요한 내용은 명확하게 강조하세요 (일반 텍스트로)
- 일반 텍스트만 사용하세요 (슬라이드 생성 단계와 형식 통일)

**중요**: 실제 문서의 내용만 출력하세요. 템플릿이나 형식 예시를 출력하지 마세요.`

    // API 요청 구성
    const parts = [
      { text: prompt },
      {
        inlineData: {
          mimeType: file.mimeType,
          data: file.data,
        },
      },
    ]

    // 재시도 로직
    const MAX_RETRIES = 3
    const RETRY_DELAYS = [2000, 4000, 8000]
    let lastError: Error | null = null

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          const delay = RETRY_DELAYS[attempt - 1]
          logger.info('문서 파싱 재시도', { attempt, delay })
          await new Promise(resolve => setTimeout(resolve, delay))
        }

        const result = await model.generateContent(parts)
        const extractedText = result.response.text()

        // 섹션 목록 추출 ("섹션 N:" 패턴 찾기)
        const sections = extractedText
          .split('\n')
          .filter((line: string) => /^섹션 \d+:/.test(line.trim()))
          .map((line: string) => line.trim())

        const duration = Date.now() - startTime

        logger.info('문서 파싱 완료', {
          userId,
          fileName: file.name,
          duration,
          contentLength: extractedText.length,
          sections: sections.length,
        })

        const response: ParseDocumentResponse = {
          fileName: file.name,
          content: extractedText,
          sections,
          success: true,
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
    logger.error('문서 파싱 실패', error)

    // 에러 타입별 응답
    if (errorMessage.includes('503') || errorMessage.includes('overloaded')) {
      return NextResponse.json(
        {
          fileName: '',
          content: '',
          sections: [],
          success: false,
          error: 'AI 서버가 일시적으로 바빠요. 잠시 후 다시 시도해주세요.',
        } as ParseDocumentResponse,
        { status: 503 }
      )
    }

    if (errorMessage.includes('API_KEY')) {
      return NextResponse.json(
        {
          fileName: '',
          content: '',
          sections: [],
          success: false,
          error: '서버 설정 오류가 발생했어요',
        } as ParseDocumentResponse,
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        fileName: '',
        content: '',
        sections: [],
        success: false,
        error: '파일을 파싱하지 못했어요. 다시 시도해주세요.',
      } as ParseDocumentResponse,
      { status: 500 }
    )
  }
}
