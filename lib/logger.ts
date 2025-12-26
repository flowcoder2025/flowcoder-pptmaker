/**
 * 프로덕션 안전 Logger 시스템
 *
 * 환경에 따른 로그 레벨 관리:
 * - development: 모든 로그 출력
 * - production: warn, error만 출력 (민감 정보 보호)
 *
 * @example
 * ```typescript
 * import { logger } from '@/lib/logger'
 *
 * logger.info('사용자 로그인', { userId: 'xxx' })
 * logger.error('API 호출 실패', error)
 * logger.debug('디버그 정보') // 프로덕션에서 무시됨
 * ```
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LoggerConfig {
  minLevel: LogLevel
  enableEmoji: boolean
  enableTimestamp: boolean
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const LOG_EMOJIS: Record<LogLevel, string> = {
  debug: '🔍',
  info: '✅',
  warn: '⚠️',
  error: '❌',
}

// 환경별 설정
const getConfig = (): LoggerConfig => {
  const isDev = process.env.NODE_ENV === 'development'

  return {
    minLevel: isDev ? 'debug' : 'warn', // 프로덕션에서는 warn 이상만
    enableEmoji: true,
    enableTimestamp: !isDev, // 프로덕션에서만 타임스탬프
  }
}

class Logger {
  private config: LoggerConfig

  constructor() {
    this.config = getConfig()
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel]
  }

  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = []

    if (this.config.enableTimestamp) {
      parts.push(`[${new Date().toISOString()}]`)
    }

    if (this.config.enableEmoji) {
      parts.push(LOG_EMOJIS[level])
    }

    parts.push(`[${level.toUpperCase()}]`)
    parts.push(message)

    return parts.join(' ')
  }

  /**
   * 디버그 로그 (개발 환경에서만 출력)
   */
  debug(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('debug')) return
    console.log(this.formatMessage('debug', message), ...args)
  }

  /**
   * 정보 로그 (개발 환경에서만 출력)
   */
  info(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('info')) return
    console.log(this.formatMessage('info', message), ...args)
  }

  /**
   * 경고 로그 (항상 출력)
   */
  warn(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('warn')) return
    console.warn(this.formatMessage('warn', message), ...args)
  }

  /**
   * 에러 로그 (항상 출력)
   */
  error(message: string, ...args: unknown[]): void {
    if (!this.shouldLog('error')) return
    console.error(this.formatMessage('error', message), ...args)
  }

  /**
   * 프로세스 단계 로그 (개발 환경에서만 출력)
   * AI 생성 파이프라인 등에서 사용
   */
  step(stepNumber: number, totalSteps: number, message: string): void {
    if (!this.shouldLog('info')) return
    const stepEmoji = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟']
    const emoji = stepEmoji[stepNumber - 1] || `${stepNumber}`
    console.log(`${emoji} [${stepNumber}/${totalSteps}] ${message}`)
  }

  /**
   * API 요청/응답 로그 (개발 환경에서만 출력)
   */
  api(method: string, path: string, status?: number, duration?: number): void {
    if (!this.shouldLog('debug')) return
    const statusEmoji = status && status >= 400 ? '❌' : '✅'
    const durationStr = duration ? ` (${duration}ms)` : ''
    console.log(`🌐 ${method} ${path} ${status ? `${statusEmoji} ${status}` : ''}${durationStr}`)
  }

  /**
   * 크레딧/결제 관련 로그 (항상 출력 - 감사 목적)
   */
  audit(action: string, details: Record<string, unknown>): void {
    // 감사 로그는 항상 출력 (프로덕션에서도)
    console.log(
      `🔐 [AUDIT] ${action}`,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        ...details,
      })
    )
  }

  /**
   * 성능 측정 시작
   */
  time(label: string): void {
    if (!this.shouldLog('debug')) return
    console.time(`⏱️ ${label}`)
  }

  /**
   * 성능 측정 종료
   */
  timeEnd(label: string): void {
    if (!this.shouldLog('debug')) return
    console.timeEnd(`⏱️ ${label}`)
  }

  /**
   * 그룹 시작 (개발 환경에서만)
   */
  group(label: string): void {
    if (!this.shouldLog('debug')) return
    console.group(`📁 ${label}`)
  }

  /**
   * 그룹 종료
   */
  groupEnd(): void {
    if (!this.shouldLog('debug')) return
    console.groupEnd()
  }
}

// 싱글톤 인스턴스
export const logger = new Logger()

// 하위 호환성을 위한 alias
export default logger
