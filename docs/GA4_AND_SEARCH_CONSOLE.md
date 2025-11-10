# Google Analytics 4 & Search Console 연동 가이드

> **작성일**: 2025-11-10
> **상위 문서**: [../CLAUDE.md](../CLAUDE.md)

이 문서는 FlowCoder PPT Maker에 Google Analytics 4 (GA4)와 Google Search Console을 연동하는 방법을 설명합니다.

---

## 📋 목차

1. [개요](#개요)
2. [GA4 설정](#ga4-설정)
3. [Search Console 설정](#search-console-설정)
4. [환경 변수 설정](#환경-변수-설정)
5. [이벤트 추적 사용법](#이벤트-추적-사용법)
6. [로컬 테스트](#로컬-테스트)
7. [배포 및 확인](#배포-및-확인)

---

## 개요

### 구현된 기능

✅ **Google Analytics 4 (GA4)**:
- 페이지뷰 자동 추적
- 커스텀 이벤트 추적 (12개 비즈니스 이벤트)
- 전환 추적 (구독, 크레딧 구매)
- Next.js Script 컴포넌트로 최적화

✅ **Google Search Console**:
- 소유권 인증 메타 태그
- 자동 사이트맵 생성 (/sitemap.xml)
- robots.txt 설정 (/robots.txt)
- SEO 최적화

### 파일 구조

```
ppt-maker-next/
├── app/
│   ├── layout.tsx          # GA4 스크립트, Search Console 메타 태그
│   ├── sitemap.ts          # 자동 사이트맵 (7개 페이지)
│   └── robots.ts           # robots.txt 설정
├── lib/
│   └── analytics.ts        # GA4 이벤트 추적 유틸리티
└── .env.local              # 환경 변수 (GA ID, 인증 코드)
```

---

## GA4 설정

### 1단계: Google Analytics 속성 생성

1. **[Google Analytics](https://analytics.google.com) 접속**
2. **관리 > 속성 만들기**
   - 속성 이름: FlowCoder PPT Maker
   - 시간대: 대한민국
   - 통화: KRW (₩)
3. **데이터 스트림 추가**
   - 플랫폼: 웹
   - 웹사이트 URL: https://your-domain.com
   - 스트림 이름: PPT Maker Web
4. **측정 ID 복사**
   - 형식: `G-XXXXXXXXXX`
   - 예시: `G-1A2B3C4D5E`

### 2단계: 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# Google Analytics 4 (GA4)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**⚠️ 주의**:
- `NEXT_PUBLIC_` 접두사 필수 (클라이언트 접근 필요)
- 실제 측정 ID로 교체

### 3단계: 로컬 테스트

```bash
# 개발 서버 재시작
npm run dev

# 브라우저 열기
open http://localhost:3000
```

**확인 방법**:
1. Chrome DevTools → Network 탭
2. `gtag/js?id=G-XXXXXXXXXX` 요청 확인
3. 콘솔에 에러가 없는지 확인

### 4단계: GA4 실시간 보고서 확인

1. [Google Analytics](https://analytics.google.com) → 보고서 → 실시간
2. 사이트 방문 시 실시간 이벤트 확인
3. 페이지뷰가 자동으로 추적되는지 확인

---

## Search Console 설정

### 1단계: 속성 추가

1. **[Google Search Console](https://search.google.com/search-console) 접속**
2. **속성 추가**
   - URL 접두어: `https://your-domain.com`
3. **소유권 확인 방법 선택**
   - **HTML 태그** 방법 선택 (가장 간단)

### 2단계: 인증 코드 복사

HTML 태그 예시:
```html
<meta name="google-site-verification" content="1234567890abcdefghijklmnopqrstuvwxyz123456" />
```

**content 값만 복사**:
```
1234567890abcdefghijklmnopqrstuvwxyz123456
```

### 3단계: 환경 변수 설정

`.env.local` 파일에 추가:

```bash
# Google Search Console
NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION=1234567890abcdefghijklmnopqrstuvwxyz123456
```

### 4단계: 배포 및 인증

1. **Vercel에 배포**:
```bash
git add .
git commit -m "feat: GA4 및 Search Console 연동"
git push origin main
```

2. **Search Console에서 인증 확인**:
   - "확인" 버튼 클릭
   - 성공 메시지 확인

### 5단계: 사이트맵 제출

1. **Search Console → Sitemaps**
2. **새 사이트맵 추가**:
   ```
   https://your-domain.com/sitemap.xml
   ```
3. **제출** 버튼 클릭

---

## 환경 변수 설정

### 로컬 개발 (.env.local)

```bash
# ========================================
# Google Analytics 4 (GA4)
# ========================================

# GA4 Measurement ID
# Get from: Google Analytics > Admin > Data Streams > Web > Measurement ID
# Format: G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# ========================================
# Google Search Console
# ========================================

# Search Console Verification Code
# Get from: Google Search Console > Settings > Ownership verification > HTML tag method
# Copy only the 'content' value from the meta tag
NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION=your_verification_code_here
```

### Vercel 배포 환경

1. **Vercel Dashboard → Settings → Environment Variables**
2. **환경 변수 추가**:
   - `NEXT_PUBLIC_GA_MEASUREMENT_ID`: `G-XXXXXXXXXX`
   - `NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION`: `your_code`
3. **All Environments** 선택
4. **Save** 클릭

---

## 이벤트 추적 사용법

### 기본 이벤트 추적

```typescript
import { trackEvent, trackButtonClick } from '@/lib/analytics'

// 커스텀 이벤트
trackEvent('button_click', {
  button_name: '프리젠테이션 생성',
  page: '/input'
})

// 버튼 클릭 이벤트
trackButtonClick({
  buttonName: '프리젠테이션 생성',
  page: '/input'
})
```

### 비즈니스 이벤트 추적

#### 1. 프리젠테이션 생성 완료

```typescript
import { trackPresentationCreated } from '@/lib/analytics'

trackPresentationCreated({
  slideCount: 10,
  quality: 'pro',
  withResearch: true,
  templateId: 'toss-default'
})
```

**GA4 이벤트명**: `presentation_created`

#### 2. 프리젠테이션 편집

```typescript
import { trackPresentationEdited } from '@/lib/analytics'

trackPresentationEdited({
  presentationId: 'pres_123',
  editType: 'content'  // 'content' | 'layout' | 'image'
})
```

**GA4 이벤트명**: `presentation_edited`

#### 3. 프리젠테이션 저장

```typescript
import { trackPresentationSaved } from '@/lib/analytics'

trackPresentationSaved({
  presentationId: 'pres_123',
  slideCount: 10
})
```

**GA4 이벤트명**: `presentation_saved`

#### 4. 구독 시작 (전환 추적)

```typescript
import { trackSubscriptionStarted } from '@/lib/analytics'

trackSubscriptionStarted({
  plan: 'pro',
  price: 9900
})
```

**GA4 이벤트명**: `subscription_started`
**전환 값**: `value`, `currency` 파라미터 자동 포함

#### 5. 크레딧 구매 (전환 추적)

```typescript
import { trackCreditsPurchased } from '@/lib/analytics'

trackCreditsPurchased({
  amount: 100,
  price: 9900
})
```

**GA4 이벤트명**: `credits_purchased`
**전환 값**: `value`, `currency` 파라미터 자동 포함

#### 6. 사용자 로그인

```typescript
import { trackLogin } from '@/lib/analytics'

trackLogin({
  method: 'github'  // 'github' | 'google' | 'email'
})
```

**GA4 이벤트명**: `login`

#### 7. 사용자 회원가입

```typescript
import { trackSignUp } from '@/lib/analytics'

trackSignUp({
  method: 'google'
})
```

**GA4 이벤트명**: `sign_up`

#### 8. 에러 추적

```typescript
import { trackError } from '@/lib/analytics'

trackError({
  errorMessage: 'Failed to generate slides',
  errorCode: 'GEMINI_API_ERROR',
  page: '/input'
})
```

**GA4 이벤트명**: `error`

### 실제 사용 예시

**app/input/page.tsx**:
```typescript
'use client'

import { trackPresentationCreated } from '@/lib/analytics'

export default function InputPage() {
  const handleSubmit = async () => {
    try {
      // AI 생성 로직
      const result = await generatePresentation(...)

      // GA4 이벤트 추적
      trackPresentationCreated({
        slideCount: result.slides.length,
        quality: selectedQuality,
        withResearch: useResearch,
        templateId: 'toss-default'
      })

      router.push('/viewer')
    } catch (error) {
      trackError({
        errorMessage: error.message,
        page: '/input'
      })
    }
  }

  return <form onSubmit={handleSubmit}>...</form>
}
```

---

## 로컬 테스트

### 1. 개발 서버 실행

```bash
npm run dev
```

### 2. GA4 디버깅

#### Chrome Extension 사용

1. **[Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) 설치**
2. Extension 활성화
3. Chrome DevTools → Console 탭
4. GA 이벤트 로그 확인

#### 실시간 보고서 확인

1. [Google Analytics](https://analytics.google.com) → 보고서 → 실시간
2. 사이트 방문
3. 이벤트 실시간 확인

### 3. 사이트맵 확인

```bash
# 로컬 개발 서버
open http://localhost:3000/sitemap.xml
```

**예상 출력**:
```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:3000</loc>
    <lastmod>2025-11-10T...</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  ...
</urlset>
```

### 4. robots.txt 확인

```bash
open http://localhost:3000/robots.txt
```

**예상 출력**:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /dev-tools/

Sitemap: http://localhost:3000/sitemap.xml
```

---

## 배포 및 확인

### 1. Vercel 배포

```bash
# 변경사항 커밋
git add .
git commit -m "feat: GA4 및 Search Console 연동"
git push origin main

# Vercel 자동 배포 (약 1-2분 소요)
```

### 2. 환경 변수 확인

**Vercel Dashboard**:
1. Settings → Environment Variables
2. `NEXT_PUBLIC_GA_MEASUREMENT_ID` 확인
3. `NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION` 확인

### 3. 프로덕션 테스트

```bash
# 배포된 사이트 접속
open https://your-domain.com

# 사이트맵 확인
open https://your-domain.com/sitemap.xml

# robots.txt 확인
open https://your-domain.com/robots.txt
```

### 4. GA4 실시간 보고서

1. [Google Analytics](https://analytics.google.com) → 실시간
2. 프로덕션 사이트 방문
3. 페이지뷰 및 이벤트 확인

### 5. Search Console 인증

1. [Google Search Console](https://search.google.com/search-console)
2. 속성 선택
3. 설정 → 소유권 확인 → "확인" 클릭
4. 성공 메시지 확인

### 6. 사이트맵 제출

1. Search Console → Sitemaps
2. 새 사이트맵 추가: `https://your-domain.com/sitemap.xml`
3. 제출 버튼 클릭
4. 상태: "성공" 확인 (최대 1-2일 소요)

---

## 고급 설정 (선택사항)

### 전환 이벤트 설정

GA4에서 중요한 이벤트를 전환으로 표시:

1. **Google Analytics → 관리 → 이벤트**
2. **전환으로 표시할 이벤트 선택**:
   - `subscription_started` (구독 시작)
   - `credits_purchased` (크레딧 구매)
   - `presentation_created` (프리젠테이션 생성)
3. **"전환으로 표시" 토글 활성화**

### 맞춤 측정기준 추가

GA4에서 맞춤 측정기준 추가 (선택):

1. **Google Analytics → 관리 → 맞춤 정의**
2. **맞춤 측정기준 만들기**:
   - 이름: Slide Count
   - 범위: 이벤트
   - 파라미터: slide_count
3. **저장**

### 보고서 설정

GA4 보고서 맞춤화:

1. **보고서 → 라이브러리**
2. **맞춤 보고서 만들기**:
   - 프리젠테이션 생성 분석
   - 구독 전환율 분석
   - 크레딧 구매 분석

---

## 트러블슈팅

### GA4 이벤트가 추적되지 않아요

**원인 1**: 환경 변수 누락
```bash
# .env.local 확인
cat .env.local | grep NEXT_PUBLIC_GA_MEASUREMENT_ID
```

**원인 2**: 개발 서버 재시작 필요
```bash
# Ctrl+C로 서버 중지 후 재시작
npm run dev
```

**원인 3**: 브라우저 캐시
```bash
# Chrome DevTools → Application → Clear storage → Clear site data
```

### Search Console 인증 실패

**원인 1**: 환경 변수 오타
```bash
# .env.local 확인
cat .env.local | grep NEXT_PUBLIC_SEARCH_CONSOLE_VERIFICATION
```

**원인 2**: 배포 누락
```bash
# Vercel 환경 변수 확인
# Dashboard → Settings → Environment Variables
```

**원인 3**: 메타 태그 누락
```bash
# 소스 보기 (View Source)에서 확인
# <meta name="google-site-verification" content="..."> 존재 확인
```

### 사이트맵이 보이지 않아요

**원인**: 타입 체크 에러

```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 에러 수정 후 재배포
```

### robots.txt가 작동하지 않아요

**확인 방법**:
```bash
curl https://your-domain.com/robots.txt
```

**public/robots.txt 파일 삭제** (충돌 방지):
```bash
rm public/robots.txt  # 있다면 삭제
```

---

## 다음 단계

### 추천 작업

1. **전환 목표 설정** (GA4)
   - 구독 시작 전환율 추적
   - 크레딧 구매 전환율 추적

2. **Search Console 모니터링**
   - 검색 성능 분석 (1-2주 후)
   - 크롤링 오류 확인
   - 모바일 사용성 확인

3. **A/B 테스트** (선택)
   - Google Optimize 연동
   - 전환율 최적화 (CRO)

4. **광고 연동** (선택)
   - Google Ads 연결
   - 리마케팅 캠페인 설정

---

## 참고 문서

### Google 공식 문서

- [Google Analytics 4 시작 가이드](https://support.google.com/analytics/answer/9304153)
- [GA4 이벤트 수집](https://developers.google.com/analytics/devguides/collection/ga4/events)
- [Search Console 시작 가이드](https://support.google.com/webmasters/answer/9128668)
- [사이트맵 제출 방법](https://support.google.com/webmasters/answer/183668)

### Next.js 공식 문서

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)
- [Next.js Script Component](https://nextjs.org/docs/app/api-reference/components/script)
- [Next.js Sitemap](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Next.js Robots](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)

### 내부 문서

- [프로젝트 메인 가이드](../CLAUDE.md)
- [기술 명세서](SPECIFICATION.md)
- [API 설계](SPECIFICATION.md#api-routes)

---

**문서 버전**: 1.0
**최종 수정**: 2025-11-10
**작성자**: Claude Code
