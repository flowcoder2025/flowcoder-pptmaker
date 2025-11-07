# PPT Maker 트러블슈팅 가이드

## 문제: 토스 앱 환경에서 슬라이드 생성 시 빈 화면

### 증상
- 광고는 정상 작동
- 슬라이드 생성 시 빈 페이지로 생성됨
- 결제 기능도 작동하지 않음

### 근본 원인

#### 1. Next.js Static Export 모드의 환경 변수 처리 방식
```typescript
// ❌ 문제가 되는 코드
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
```

**Static Export 모드**에서 `process.env`는 **빌드 타임에만** 값이 주입됩니다. 프로덕션 환경(토스 앱)에서는 런타임에 `process.env`가 `undefined`일 가능성이 있습니다.

#### 2. 에러 표시 부족
- 에러 발생 시 사용자에게 명확한 메시지 없이 조용히 실패
- 빈 화면만 표시되어 원인 파악 어려움

### 해결 방법

#### ✅ 1. 환경 변수 명시적 주입 (next.config.ts)
```typescript
const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  env: {
    // 환경 변수 명시적 주입 (Static Export 모드 대응)
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    NEXT_PUBLIC_AD_GROUP_ID: process.env.NEXT_PUBLIC_AD_GROUP_ID,
  },
};
```

**효과**: 빌드 타임에 환경 변수가 명시적으로 번들에 포함됩니다.

#### ✅ 2. API 키 검증 강화 (services/gemini/config.ts)
```typescript
const getApiKey = (): string => {
  const key = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

  if (!key) {
    console.error('🚨 CRITICAL: NEXT_PUBLIC_GEMINI_API_KEY가 설정되지 않았습니다!');
    throw new Error('Gemini API 키가 설정되지 않았어요. 앱을 재배포해야 해요.');
  }

  return key;
};
```

**효과**: API 키 누락 시 즉시 에러 발생하여 원인 파악 가능

#### ✅ 3. 상세 에러 로깅 (store/presentationStore.ts)
```typescript
catch (error) {
  console.error('🔍 에러 상세 정보:', {
    message: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
    geminiApiKeyExists: !!process.env.NEXT_PUBLIC_GEMINI_API_KEY,
    userInput: text.substring(0, 100),
  });

  set({
    generationError: `슬라이드 생성에 실패했어요. 다시 시도해주세요.\n\n오류: ${errorMessage}`,
    isGenerating: false,
    generationStep: 'error'
  });
}
```

**효과**: 프로덕션 환경에서도 상세한 디버깅 정보 확인 가능

#### ✅ 4. 환경 변수 진단 도구 (utils/env-validator.ts)
```typescript
export function logEnvironmentDiagnostics(): void {
  console.log('🔍 환경 변수 진단 정보:');
  console.log('  환경:', process.env.NODE_ENV || 'development');
  console.log('  API 키 존재:', !!process.env.NEXT_PUBLIC_GEMINI_API_KEY);
  console.log('  광고 ID 존재:', !!process.env.NEXT_PUBLIC_AD_GROUP_ID);
}
```

**효과**: 앱 시작 시 환경 변수 상태 자동 로깅

#### ✅ 5. 앱 진입점에서 검증 (app/layout.tsx)
```typescript
// 환경 변수 진단 (프로덕션 디버깅용)
if (typeof window === 'undefined') {
  logEnvironmentDiagnostics();
}
```

**효과**: 서버 렌더링 시점에 환경 변수 상태 확인

### 배포 전 체크리스트

#### 1. 환경 변수 확인
```bash
# .env.production 파일 확인
cat .env.production

# 필수 값 확인:
# - NEXT_PUBLIC_GEMINI_API_KEY
# - NEXT_PUBLIC_AD_GROUP_ID
```

#### 2. 빌드 및 검증
```bash
# 빌드 실행
npm run build

# 환경 변수가 번들에 포함되었는지 확인
grep -r "AIzaSyDx9nR2fIm" out/ | head -1
```

#### 3. 로컬 테스트
```bash
# 프로덕션 빌드 로컬 실행
npm run start

# http://localhost:3000에서 테스트:
# 1. 슬라이드 생성 테스트
# 2. 광고 시청 테스트
# 3. 에러 메시지 확인
```

#### 4. 토스 앱 배포
```bash
# out/ 디렉토리를 토스 앱 콘솔에 업로드
# 배포 후 앱 실행하여 동작 확인
```

### 디버깅 방법

#### 토스 앱 환경에서 로그 확인
1. **Chrome Remote Debugging** 사용
   - 토스 앱을 디버그 모드로 실행
   - Chrome DevTools Console 열기
   - 환경 변수 진단 로그 확인

2. **로그 확인 포인트**
   ```
   ✅ 정상: "🔍 환경 변수 진단 정보: API 키 존재: true"
   ❌ 문제: "🚨 CRITICAL: NEXT_PUBLIC_GEMINI_API_KEY가 설정되지 않았습니다!"
   ```

3. **에러 발생 시 확인**
   - `generationError` 상태 확인
   - Console에서 `🔍 에러 상세 정보` 로그 확인
   - API 키 존재 여부 확인

### 자주 묻는 질문

#### Q1. 빌드는 성공했는데 토스 앱에서 작동하지 않아요
**A**: 환경 변수가 빌드에 포함되었는지 확인하세요.
```bash
# 빌드 출력 확인
grep -r "NEXT_PUBLIC_GEMINI_API_KEY" out/
```

#### Q2. 로컬에서는 되는데 프로덕션에서 안 돼요
**A**: `.env.production` 파일이 올바르게 설정되었는지 확인하세요.
```bash
# .env.production 내용 확인
cat .env.production

# Next.js가 올바른 환경 파일을 읽는지 확인
npm run build 2>&1 | grep "Environments:"
```

#### Q3. 에러 메시지가 표시되지 않아요
**A**: `app/input/page.tsx`의 에러 표시 섹션을 확인하세요.
```tsx
{generationError && (
  <div style={{
    marginTop: '16px',
    padding: '12px 16px',
    background: '#FEE2E2',
    borderRadius: '8px',
    color: TOSS_COLORS.error,
  }}>
    {generationError}
  </div>
)}
```

### 예방 조치

#### 1. CI/CD 파이프라인에 환경 변수 검증 추가
```bash
# .github/workflows/deploy.yml (예시)
- name: Validate Environment Variables
  run: |
    if [ -z "$NEXT_PUBLIC_GEMINI_API_KEY" ]; then
      echo "Error: NEXT_PUBLIC_GEMINI_API_KEY is not set"
      exit 1
    fi
```

#### 2. 빌드 후 자동 검증
```bash
# package.json
{
  "scripts": {
    "build": "next build",
    "validate": "grep -q 'AIzaSyDx' out/_next/static/chunks/*.js && echo '✅ API key included' || echo '❌ API key missing'"
  }
}
```

#### 3. 환경별 설정 파일 분리
```
.env.local          # 로컬 개발
.env.production     # 프로덕션 배포
.env.staging        # 스테이징 테스트
```

### 추가 참고 자료

- [Next.js Environment Variables](https://nextjs.org/docs/pages/building-your-application/configuring/environment-variables)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Apps in Toss 개발 가이드](../../docs/04-development/)

---

**마지막 업데이트**: 2025-11-06
**문서 버전**: 1.0
**작성자**: Root Cause Analyst
