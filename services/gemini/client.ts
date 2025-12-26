/**
 * Gemini API 서버 프록시 클라이언트
 *
 * 🔒 보안: API 키가 서버에서만 사용되도록 프록시 통신
 * 클라이언트 → /api/gemini/generate → Gemini API
 */

import { logger } from '@/lib/logger'

// ============================================
// 타입 정의
// ============================================

export interface GeminiClientOptions {
  prompt: string
  useProModel?: boolean
  maxTokens?: number
}

export interface GeminiClientResponse {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface GeminiClientError {
  error: string
  status: number
}

// ============================================
// 클라이언트 함수
// ============================================

/**
 * 서버 프록시를 통해 Gemini API 호출
 *
 * @example
 * ```typescript
 * const result = await callGeminiProxy({
 *   prompt: '슬라이드 생성 프롬프트...',
 *   useProModel: false,
 * })
 * console.log(result.content)
 * ```
 */
export async function callGeminiProxy(
  options: GeminiClientOptions
): Promise<GeminiClientResponse> {
  const { prompt, useProModel = false, maxTokens } = options
  const modelName = useProModel ? 'Pro' : 'Flash'

  logger.info(`Gemini ${modelName} 프록시 호출 시작`, { promptLength: prompt.length })

  try {
    const response = await fetch('/api/gemini/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        useProModel,
        maxTokens,
      }),
    })

    // 에러 응답 처리
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: '알 수 없는 오류' }))
      const error = errorData as GeminiClientError

      logger.error(`Gemini ${modelName} 프록시 오류`, { status: response.status, error: error.error })

      // 상태 코드별 사용자 친화적 메시지
      if (response.status === 401) {
        throw new Error('로그인이 필요해요')
      }
      if (response.status === 429) {
        throw new Error('요청이 너무 많아요. 잠시 후 다시 시도해주세요.')
      }
      if (response.status === 503) {
        throw new Error('AI 서버가 일시적으로 바빠요. 잠시 후 다시 시도해주세요.')
      }

      throw new Error(error.error || '콘텐츠를 생성하지 못했어요. 다시 시도해주세요.')
    }

    const data: GeminiClientResponse = await response.json()

    logger.info(`Gemini ${modelName} 프록시 호출 완료`, {
      contentLength: data.content.length,
      tokens: data.usage?.totalTokens,
    })

    return data
  } catch (error) {
    // fetch 자체 실패 (네트워크 오류 등)
    if (error instanceof TypeError && error.message.includes('fetch')) {
      logger.error('Gemini 프록시 네트워크 오류', error)
      throw new Error('네트워크 연결을 확인해주세요')
    }

    // 이미 처리된 에러는 그대로 전달
    if (error instanceof Error) {
      throw error
    }

    throw new Error('콘텐츠를 생성하지 못했어요. 다시 시도해주세요.')
  }
}
