/**
 * 환경 변수 검증 유틸리티
 * 프로덕션 환경에서 필수 환경 변수 누락 시 즉시 에러 발생
 */

/**
 * Apps in Toss WebView 환경을 위한 Window 인터페이스 확장
 */
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export interface EnvValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * 환경 변수 검증 실행
 * @returns 검증 결과
 */
export function validateEnvironmentVariables(): EnvValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  // Gemini API 키 검증 (필수)
  const geminiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY
  if (!geminiKey) {
    errors.push('Gemini API 키가 설정되지 않았어요 (NEXT_PUBLIC_GEMINI_API_KEY)')
  } else if (geminiKey.length < 30) {
    warnings.push('Gemini API 키 형식이 올바르지 않을 수 있어요')
  }

  // 광고 그룹 ID 검증 (선택)
  const adGroupId = process.env.NEXT_PUBLIC_AD_GROUP_ID
  if (!adGroupId) {
    warnings.push('광고 그룹 ID가 설정되지 않았어요 (NEXT_PUBLIC_AD_GROUP_ID)')
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 환경 변수 검증 후 결과 로깅
 */
export function validateAndLogEnvironment(): void {
  const result = validateEnvironmentVariables()

  if (!result.isValid) {
    console.error('🚨 환경 변수 검증 실패!')
    result.errors.forEach(error => console.error(`  ❌ ${error}`))
    throw new Error('필수 환경 변수가 설정되지 않았어요')
  }

  if (result.warnings.length > 0) {
    console.warn('⚠️ 환경 변수 경고:')
    result.warnings.forEach(warning => console.warn(`  ⚠️ ${warning}`))
  }

  console.log('✅ 환경 변수 검증 완료')
  console.log(`  📝 Gemini API 키: ${process.env.NEXT_PUBLIC_GEMINI_API_KEY?.substring(0, 10)}...`)
  console.log(`  📺 광고 그룹 ID: ${process.env.NEXT_PUBLIC_AD_GROUP_ID || '미설정'}`)
}

/**
 * 진단 정보 출력 (디버깅용)
 */
export function logEnvironmentDiagnostics(): void {
  console.log('🔍 환경 변수 진단 정보:')
  console.log('  환경:', process.env.NODE_ENV || 'development')
  console.log('  빌드 타임:', new Date().toISOString())
  console.log('  API 키 존재:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY)
  console.log('  광고 ID 존재:', !!process.env.NEXT_PUBLIC_AD_GROUP_ID)

  // 빌드 시 값이 주입되었는지 확인
  if (typeof window !== 'undefined') {
    console.log('  클라이언트 환경 감지')
  } else {
    console.log('  서버 환경 감지')
  }
}

/**
 * 앱인토스 WebView 환경인지 확인
 * @returns 앱인토스 환경이면 true, 브라우저 환경이면 false
 */
export function isAppsInToss(): boolean {
  // 서버 환경에서는 false
  if (typeof window === 'undefined') return false

  try {
    // ReactNativeWebView가 존재하면 앱인토스 환경
    return !!window.ReactNativeWebView
  } catch {
    return false
  }
}
