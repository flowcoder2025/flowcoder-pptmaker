/**
 * 샌드박스 테스트용 헬퍼 함수
 */

import type { UnifiedPPTJSON } from "@/types/pptJson"

/**
 * 성능 측정 헬퍼
 */
export class PerformanceTimer {
  private startTime: number = 0
  private endTime: number = 0

  start() {
    this.startTime = performance.now()
  }

  stop() {
    this.endTime = performance.now()
  }

  getDuration(): number {
    return this.endTime - this.startTime
  }

  getFormattedDuration(): string {
    const duration = this.getDuration()
    if (duration < 1000) {
      return `${duration.toFixed(0)}ms`
    }
    return `${(duration / 1000).toFixed(2)}초`
  }
}

/**
 * 프리젠테이션 데이터 검증
 */
export function validatePPTData(data: unknown): data is UnifiedPPTJSON {
  if (typeof data !== "object" || data === null) {
    return false
  }

  const ppt = data as Partial<UnifiedPPTJSON>

  // 필수 필드 확인
  if (typeof ppt.title !== "string" || !Array.isArray(ppt.slides)) {
    return false
  }

  // 슬라이드 최소 개수 확인
  if (ppt.slides.length === 0) {
    return false
  }

  // 각 슬라이드 검증
  return ppt.slides.every((slide) => {
    if (typeof slide.id !== "string" || typeof slide.type !== "string") {
      return false
    }
    return true
  })
}

/**
 * 슬라이드 타입별 통계
 */
export function getSlideTypeStats(data: UnifiedPPTJSON) {
  const stats: Record<string, number> = {}

  data.slides.forEach((slide) => {
    stats[slide.type] = (stats[slide.type] || 0) + 1
  })

  return stats
}

/**
 * 프리젠테이션 메타데이터 추출
 */
export function extractMetadata(data: UnifiedPPTJSON) {
  return {
    title: data.title,
    totalSlides: data.slides.length,
    slideTypes: getSlideTypeStats(data),
    firstSlideType: data.slides[0]?.type,
    lastSlideType: data.slides[data.slides.length - 1]?.type,
  }
}

/**
 * 테스트 결과 포맷팅
 */
export interface TestResult {
  success: boolean
  duration: string
  error?: string
  metadata?: ReturnType<typeof extractMetadata>
}

export function formatTestResult(result: TestResult): string {
  if (!result.success) {
    return `❌ 실패 (${result.duration}): ${result.error}`
  }

  if (result.metadata) {
    return `✅ 성공 (${result.duration})\n  - 제목: ${result.metadata.title}\n  - 슬라이드 수: ${result.metadata.totalSlides}개`
  }

  return `✅ 성공 (${result.duration})`
}

/**
 * 로컬 스토리지 테스트 헬퍼
 */
export const storageTest = {
  /**
   * 스토리지 사용 가능 여부 확인
   */
  isAvailable(): boolean {
    if (typeof window === "undefined") return false
    try {
      const test = "__storage_test__"
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },

  /**
   * 사용 중인 스토리지 용량 계산
   */
  getUsage(): number {
    if (typeof window === "undefined") return 0
    let total = 0
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length
      }
    }
    return total
  },

  /**
   * 포맷팅된 용량 문자열
   */
  getFormattedUsage(): string {
    const bytes = this.getUsage()
    if (bytes < 1024) return `${bytes}B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`
  },
}

/**
 * API 키 검증
 */
export const apiKeyTest = {
  /**
   * Gemini API 키 확인
   */
  hasGeminiKey(): boolean {
    return !!process.env.NEXT_PUBLIC_GEMINI_API_KEY
  },

  /**
   * Perplexity API 키 확인
   */
  hasPerplexityKey(): boolean {
    // 서버 사이드에서만 확인 가능
    return typeof window === "undefined"
  },

  /**
   * 전체 API 상태 확인
   */
  getStatus() {
    return {
      gemini: this.hasGeminiKey(),
      perplexity: this.hasPerplexityKey(),
    }
  },
}

/**
 * 디버그 로그 헬퍼
 */
export class DebugLogger {
  private logs: Array<{
    timestamp: number
    level: "info" | "warn" | "error"
    message: string
    data?: unknown
  }> = []

  info(message: string, data?: unknown) {
    this.log("info", message, data)
  }

  warn(message: string, data?: unknown) {
    this.log("warn", message, data)
  }

  error(message: string, data?: unknown) {
    this.log("error", message, data)
  }

  private log(level: "info" | "warn" | "error", message: string, data?: unknown) {
    const entry = {
      timestamp: Date.now(),
      level,
      message,
      data,
    }
    this.logs.push(entry)
    console[level](`[Sandbox ${level.toUpperCase()}]`, message, data || "")
  }

  getLogs() {
    return this.logs
  }

  clear() {
    this.logs = []
  }

  export() {
    return JSON.stringify(this.logs, null, 2)
  }
}
