# Google OAuth 로그인 오류 해결 가이드

> **문제**: `redirect_uri_mismatch` 오류로 Google 로그인 실패
> **원인**: Vercel 자동 생성 도메인이 Google Cloud Console에 미등록
> **해결**: Google Console에 URI 추가 + Vercel 환경 변수 설정

---

## 🚨 문제 상황

### 에러 메시지
```
액세스 차단됨: PPT Maker의 요청이 잘못되었습니다
400 오류: redirect_uri_mismatch
```

### 에러 URL
```
https://accounts.google.com/signin/oauth/error?authError=...
redirect_uri=https://flowcoder-pptmaker.vercel.app/api/auth/callback/google
```

### 원인 분석
1. **사용자 접근 도메인**: `flowcoder-pptmaker.vercel.app` (Vercel 자동 생성)
2. **Google에 등록된 도메인**:
   - ✅ `https://pptmaker.flow-coder.com` (커스텀 도메인)
   - ✅ `http://localhost:3000` (로컬 개발)
   - ❌ `https://flowcoder-pptmaker.vercel.app` (미등록)

3. **문제**: Vercel 도메인으로 접근 시 Google OAuth 콜백 URL 불일치

---

## ✅ 해결 방법

### 방법 1: Google Cloud Console에 URI 추가 (즉시 해결) ⭐

**소요 시간**: 5분
**효과**: 즉시 적용

#### 1단계: Google Cloud Console 접속

1. https://console.cloud.google.com/apis/credentials 접속
2. 프로젝트 선택: **PPT Maker**

#### 2단계: OAuth 2.0 Client ID 편집

1. **OAuth 2.0 Client IDs** 섹션에서 다음 Client ID 찾기:
   ```
   94687581715-dcm4ourccr08icmfi8m0r2uv3rctfoq3.apps.googleusercontent.com
   ```

2. **편집 버튼** (연필 아이콘) 클릭

#### 3단계: 승인된 리디렉션 URI 추가

1. **승인된 리디렉션 URI** 섹션에서 **+ URI 추가** 클릭

2. 다음 URI 추가:
   ```
   https://flowcoder-pptmaker.vercel.app/api/auth/callback/google
   ```

3. **저장** 버튼 클릭

#### 4단계: 결과 확인

**등록된 URI 목록** (3개):
- ✅ `https://pptmaker.flow-coder.com/api/auth/callback/google`
- ✅ `http://localhost:3000/api/auth/callback/google`
- ✅ `https://flowcoder-pptmaker.vercel.app/api/auth/callback/google` ⭐ 새로 추가

**테스트**:
1. https://flowcoder-pptmaker.vercel.app 접속
2. Google 로그인 버튼 클릭
3. 정상 로그인 확인 ✅

---

### 방법 2: Vercel 환경 변수 설정 (근본 해결) 🔧

**소요 시간**: 10분 (재배포 포함)
**효과**: 커스텀 도메인으로 통일, SEO 및 브랜딩 개선

#### 목적
- Vercel 자동 생성 도메인 사용 방지
- 커스텀 도메인(`pptmaker.flow-coder.com`)으로 통일
- OAuth 콜백 URL 일관성 유지

#### 1단계: Vercel Dashboard 접속

1. https://vercel.com/dashboard 접속
2. 프로젝트 선택: **flowcoder-pptmaker**
3. **Settings** 탭 이동

#### 2단계: 환경 변수 추가

1. 왼쪽 메뉴에서 **Environment Variables** 선택
2. 다음 환경 변수 추가:

**Production (프로덕션)**:
```
Name: NEXTAUTH_URL
Value: https://pptmaker.flow-coder.com
Environment: Production ✅
```

**Preview (프리뷰 배포)**:
```
Name: NEXTAUTH_URL
Value: https://flowcoder-pptmaker.vercel.app
Environment: Preview ✅
```

**Development (로컬 개발)**:
```
Name: NEXTAUTH_URL
Value: http://localhost:3000
Environment: Development ✅
```

3. **Save** 버튼 클릭

#### 3단계: 프로젝트 재배포

1. **Deployments** 탭 이동
2. 최근 배포 선택 (첫 번째 항목)
3. **⋯** 메뉴 → **Redeploy** 클릭
4. **Redeploy** 확인

**중요**: 환경 변수 변경은 재배포 후 적용됩니다.

#### 4단계: 결과 확인

**Production 배포 후**:
- `https://pptmaker.flow-coder.com` → Google 로그인 정상 ✅
- `https://flowcoder-pptmaker.vercel.app` → 커스텀 도메인으로 리다이렉트 (권장)

**Preview 배포**:
- `https://flowcoder-pptmaker-*.vercel.app` → Google 로그인 정상 ✅

---

### 방법 3: 커스텀 도메인 리다이렉트 (선택 사항) 💡

**목적**: Vercel 도메인 접근 시 커스텀 도메인으로 자동 리다이렉트

#### 구현 예시

**`middleware.ts` 추가** (프로젝트 루트):

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''

  // Vercel 도메인에서 접근 시 커스텀 도메인으로 리다이렉트
  if (
    hostname.includes('flowcoder-pptmaker.vercel.app') &&
    process.env.NODE_ENV === 'production'
  ) {
    const customDomain = 'https://pptmaker.flow-coder.com'
    const pathname = request.nextUrl.pathname
    const search = request.nextUrl.search

    return NextResponse.redirect(`${customDomain}${pathname}${search}`)
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/((?!api|_next/static|_next/image|favicon.ico).*)',
}
```

**장점**:
- SEO 개선 (단일 도메인 유지)
- 브랜딩 일관성
- 사용자 혼란 방지

**단점**:
- Preview 배포에는 적용하지 않아야 함
- 환경 분기 처리 필요

---

## 📋 체크리스트

### 즉시 해결 (방법 1)
- [ ] Google Cloud Console 접속
- [ ] OAuth 2.0 Client ID 편집
- [ ] Vercel 도메인 URI 추가: `https://flowcoder-pptmaker.vercel.app/api/auth/callback/google`
- [ ] 저장 및 테스트

### 근본 해결 (방법 2)
- [ ] Vercel Dashboard 접속
- [ ] 환경 변수 추가: `NEXTAUTH_URL`
  - [ ] Production: `https://pptmaker.flow-coder.com`
  - [ ] Preview: `https://flowcoder-pptmaker.vercel.app`
  - [ ] Development: `http://localhost:3000`
- [ ] 프로젝트 재배포
- [ ] 테스트: 커스텀 도메인 및 Vercel 도메인

### 선택 사항 (방법 3)
- [ ] `middleware.ts` 추가
- [ ] Vercel → 커스텀 도메인 리다이렉트 구현
- [ ] 배포 및 테스트

---

## 🧪 테스트 방법

### 1. Vercel 도메인 테스트
```bash
# 브라우저에서 접속
https://flowcoder-pptmaker.vercel.app

# Google 로그인 버튼 클릭
# 정상 로그인 확인 (에러 없음)
```

### 2. 커스텀 도메인 테스트
```bash
# 브라우저에서 접속
https://pptmaker.flow-coder.com

# Google 로그인 버튼 클릭
# 정상 로그인 확인 (에러 없음)
```

### 3. 로컬 개발 환경 테스트
```bash
# 로컬 서버 실행
npm run dev

# 브라우저에서 접속
http://localhost:3000

# Google 로그인 버튼 클릭
# 정상 로그인 확인 (에러 없음)
```

---

## 🚀 권장 설정

### 최종 권장 구성

**Google Cloud Console** (승인된 리디렉션 URI):
- ✅ `https://pptmaker.flow-coder.com/api/auth/callback/google` (프로덕션)
- ✅ `https://flowcoder-pptmaker.vercel.app/api/auth/callback/google` (프리뷰)
- ✅ `http://localhost:3000/api/auth/callback/google` (로컬)

**Vercel 환경 변수**:
- Production: `NEXTAUTH_URL=https://pptmaker.flow-coder.com`
- Preview: `NEXTAUTH_URL=https://flowcoder-pptmaker.vercel.app`
- Development: `NEXTAUTH_URL=http://localhost:3000`

**장점**:
- 모든 환경에서 Google 로그인 정상 작동 ✅
- 커스텀 도메인 우선 사용 (SEO, 브랜딩) ✅
- Preview 배포에서도 테스트 가능 ✅

---

## 📚 참고 문서

### Google OAuth 문서
- [OAuth 2.0 Web Server](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Authorization Errors - redirect_uri_mismatch](https://developers.google.com/identity/protocols/oauth2/web-server#authorization-errors-redirect-uri-mismatch)

### NextAuth.js 문서
- [NextAuth.js Configuration](https://next-auth.js.org/configuration/options)
- [OAuth Providers - Google](https://next-auth.js.org/providers/google)

### Vercel 문서
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/custom-domains)

---

## 🔄 변경 이력

### 2025-11-10
- 초기 문서 작성
- Google OAuth redirect_uri_mismatch 오류 해결 가이드
- Vercel 환경 변수 설정 가이드 추가

---

**작성자**: Claude Code
**최종 업데이트**: 2025-11-10
