/**
 * Gemini 서비스 진입점
 */

import { generateSlideContent, type ContentGenerationOptions } from './content-generator'
import type { UnifiedPPTJSON } from '@/types/pptJson'
import { logger } from '@/lib/logger'

/**
 * Gemini API를 사용한 콘텐츠 생성 서비스
 */
export class GeminiService {
  /**
   * 사용자 입력을 기반으로 프리젠테이션 콘텐츠 생성
   * @param prompt 사용자 프롬프트
   * @param useResearch 자료 조사 활성화 여부
   * @param useProModel Pro 모델 사용 여부 (기본: false)
   * @returns UnifiedPPTJSON 형식의 프리젠테이션 데이터
   */
  async generateContent(
    prompt: string,
    useResearch: boolean = false,
    useProModel: boolean = false
  ): Promise<UnifiedPPTJSON> {
    // 자료 조사 기능은 현재 미구현
    const research = useResearch ? undefined : undefined

    const options: ContentGenerationOptions = {
      userInput: prompt,
      research,
      useProModel,
      maxSlides: 25, // 기본 무료 플랜
    }

    const jsonString = await generateSlideContent(options)

    // JSON 파싱
    try {
      const data = JSON.parse(jsonString) as UnifiedPPTJSON
      return data
    } catch (error) {
      logger.error('Gemini 응답 JSON 파싱 실패', error)
      throw new Error('생성된 데이터 형식이 올바르지 않아요')
    }
  }
}

// 기존 함수도 export
export { generateSlideContent, type ContentGenerationOptions }

// 프리미엄 업그레이드 서비스 export
export {
  upgradeSingleSlide,
  upgradeAllSlides,
  type PremiumUpgradeOptions,
  type PremiumUpgradeResult,
} from './premium-upgrade'
