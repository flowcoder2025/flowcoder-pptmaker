# app/ - Next.js 16 App Router 디렉토리

> **상위 문서**: [../CLAUDE.md](../CLAUDE.md)
> **라우팅 방식**: Next.js 16 App Router
> **React 버전**: React 19

---

## 개요

이 디렉토리는 Next.js 16 App Router 기반의 페이지와 API 라우트를 포함합니다.

**App Router 특징**:
- 파일 시스템 기반 라우팅
- `page.tsx`: 공개 페이지 정의
- `layout.tsx`: 레이아웃 공유
- `route.ts`: API 엔드포인트
- 서버/클라이언트 컴포넌트 구분 (`'use client'`)

---

## 디렉토리 구조

```
app/
├── page.tsx                # 홈 - 시작 화면
├── layout.tsx              # 루트 레이아웃
├── globals.css             # 전역 스타일
│
├── input/                  # 텍스트 입력 페이지
│   └── page.tsx               # 주제 입력 및 옵션 설정
│
├── viewer/                 # 슬라이드 뷰어
│   └── page.tsx               # 생성된 슬라이드 보기
│
├── editor/                 # 슬라이드 편집
│   └── page.tsx               # 개별 슬라이드 편집
│
├── subscription/           # 구독 관리
│   └── page.tsx               # 요금제 선택 및 관리
│
├── credits/                # 크레딧 관리
│   └── page.tsx               # 크레딧 구매 및 잔액 확인
│
├── dev-tools/              # 개발자 도구
│   └── page.tsx               # 디버깅 및 테스트 도구
│
└── api/                    # API 라우트
    ├── research/              # Perplexity AI 프록시
    │   └── route.ts
    ├── auth/                  # 앱인토스 인증
    │   ├── login/route.ts
    │   ├── refresh/route.ts
    │   └── disconnect/route.ts
    ├── payment/               # 토스페이먼츠 연동
    │   ├── create-token/route.ts
    │   └── execute/route.ts
    └── iap/                   # 인앱 결제 검증
        └── verify/route.ts
```

---

## 주요 페이지

### 1. 홈 (`page.tsx`)

**경로**: `/`
**설명**: 앱 시작 화면

**주요 기능**:
- 환영 메시지 및 서비스 소개
- "새 프레젠테이션 만들기" 버튼
- 최근 프로젝트 목록 (향후 구현)

**내비게이션**:
- → `/input`: 텍스트 입력 페이지로 이동

---

### 2. 텍스트 입력 (`input/page.tsx`)

**경로**: `/input`
**설명**: 프리젠테이션 주제 및 옵션 입력

**주요 기능**:
- 주제 텍스트 입력
- 슬라이드 수 선택 (5~20)
- 품질 선택 (Flash/Pro)
- 자료 조사 옵션 (Perplexity 사용 여부)
- 요금제별 슬라이드 수 제한 안내

**클라이언트 상태**:
```typescript
'use client' // 필수: 사용자 입력 처리

import { usePresentationStore } from '@/store/presentationStore'
```

**내비게이션**:
- → `/viewer`: AI 생성 완료 후 자동 이동

---

### 3. 슬라이드 뷰어 (`viewer/page.tsx`)

**경로**: `/viewer`
**설명**: 생성된 슬라이드 보기 및 네비게이션

**주요 기능**:
- 슬라이드 렌더링 (HTML 기반)
- 이전/다음 슬라이드 이동
- 페이지 표시 (1/10 등)
- "편집" 버튼

**Zustand 스토어 사용**:
```typescript
const { slides, currentSlideIndex, setCurrentSlideIndex } = usePresentationStore()
```

**내비게이션**:
- → `/editor`: 슬라이드 편집 페이지로 이동

---

### 4. 슬라이드 편집 (`editor/page.tsx`)

**경로**: `/editor?slideIndex=0`
**설명**: 개별 슬라이드 편집 인터페이스

**주요 기능**:
- 슬라이드 제목/내용 편집
- 이미지 URL 변경
- 레이아웃 변경 (향후)
- 저장 및 되돌리기

**Query 파라미터**:
- `slideIndex`: 편집할 슬라이드 인덱스

**내비게이션**:
- ← `/viewer`: 뷰어로 돌아가기

---

### 5. 구독 관리 (`subscription/page.tsx`)

**경로**: `/subscription`
**설명**: 요금제 선택 및 관리

**주요 기능**:
- 요금제 정보 표시 (Free/Standard/Premium)
- 구독 신청 (인앱 결제 연동)
- 현재 요금제 표시
- 구독 해지

**연동 서비스**:
- 앱인토스 인앱 결제 (향후)
- Bedrock SDK `@toss/bedrock-payment`

---

### 6. 크레딧 관리 (`credits/page.tsx`)

**경로**: `/credits`
**설명**: 크레딧 구매 및 잔액 확인

**주요 기능**:
- 현재 크레딧 잔액 표시
- 크레딧 패키지 선택 (10/50/100 크레딧)
- 결제 진행 (토스페이먼츠)
- 크레딧 사용 내역 (향후)

**결제 연동**:
- API: `/api/payment/create-token`
- API: `/api/payment/execute`

---

### 7. 개발자 도구 (`dev-tools/page.tsx`)

**경로**: `/dev-tools`
**설명**: 디버깅 및 테스트 도구

**주요 기능**:
- 현재 요금제 표시
- 슬라이드 수 제한 확인
- 스토어 상태 확인
- 테스트 데이터 생성

**⚠️ 주의**:
- 개발 환경 전용
- 프로덕션 빌드에서 제외 권장

---

## API 라우트

### 1. 자료 조사 (`api/research/route.ts`)

**엔드포인트**: `POST /api/research`
**설명**: Perplexity AI 프록시

**Request Body**:
```typescript
{
  query: string           // 조사 주제
  model?: 'sonar' | 'sonar-reasoning'  // 모델 선택
}
```

**Response**:
```typescript
{
  result: string          // 조사 결과
  citations: Citation[]   // 출처 정보
}
```

**환경 변수**: `PERPLEXITY_API_KEY` (서버 전용)

---

### 2. 인증 API (`api/auth/`)

**엔드포인트**:
- `POST /api/auth/login`: 앱인토스 로그인
- `POST /api/auth/refresh`: 토큰 갱신
- `POST /api/auth/disconnect`: 로그아웃

**설명**: 앱인토스 Bedrock SDK 인증 연동

**환경 변수**:
- `APPS_IN_TOSS_CLIENT_ID`
- `APPS_IN_TOSS_CLIENT_SECRET`

---

### 3. 결제 API (`api/payment/`)

**엔드포인트**:
- `POST /api/payment/create-token`: 결제 토큰 생성
- `POST /api/payment/execute`: 결제 실행

**설명**: 토스페이먼츠 연동 (크레딧 구매)

**환경 변수**:
- `TOSS_PAYMENTS_SECRET_KEY`

---

### 4. 인앱 결제 검증 (`api/iap/verify/route.ts`)

**엔드포인트**: `POST /api/iap/verify`
**설명**: 앱인토스 인앱 결제 영수증 검증 (구독)

**Request Body**:
```typescript
{
  receiptData: string     // 결제 영수증
  productId: string       // 상품 ID
}
```

**Response**:
```typescript
{
  valid: boolean          // 검증 성공 여부
  subscription: {
    plan: 'free' | 'standard' | 'premium'
    expiresAt: string
  }
}
```

---

## App Router 규칙

### 1. 클라이언트 컴포넌트

**필수 지시문**: `'use client'`

```typescript
'use client'  // 상호작용이 필요한 컴포넌트

import { useState } from 'react'
```

**사용 시나리오**:
- 사용자 입력 처리 (`useState`, `useEffect`)
- 브라우저 API 사용 (`window`, `localStorage`)
- Zustand 스토어 사용
- 이벤트 핸들러 (`onClick`, `onChange`)

---

### 2. 서버 컴포넌트 (기본값)

**특징**: `'use client'` 없음 (기본 동작)

```typescript
// 서버에서만 실행됨
export default async function Page() {
  const data = await fetchData()  // 서버에서 데이터 가져오기
  return <div>{data}</div>
}
```

**사용 시나리오**:
- 정적 콘텐츠 렌더링
- SEO 최적화
- 서버 전용 로직 (DB 쿼리 등)

---

### 3. 경로 임포트

**절대 경로 사용**: `@/` 별칭 (`tsconfig.json` 설정)

```typescript
// ✅ 권장
import { TOSS_COLORS } from '@/constants/design'
import { usePresentationStore } from '@/store/presentationStore'

// ❌ 비권장
import { TOSS_COLORS } from '../../constants/design'
```

---

### 4. 메타데이터 설정

**페이지별 메타데이터**:

```typescript
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'PPT Maker - 프리젠테이션 입력',
  description: 'AI 기반 프리젠테이션 주제 입력',
}
```

---

### 5. 에러 처리

**에러 바운더리**: `error.tsx` (향후 구현 권장)

```typescript
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>문제가 발생했어요</h2>
      <button onClick={reset}>다시 시도하기</button>
    </div>
  )
}
```

---

## UX Writing 규칙 (필수)

**모든 페이지의 사용자 대면 텍스트는 Apps in Toss UX Writing 가이드를 준수해야 합니다.**

### 필수 규칙

1. **~해요체 사용** (모든 상황/맥락에 적용)
   - ✅ "슬라이드를 생성하고 있어요"
   - ❌ "슬라이드 생성 중..."

2. **능동적 말하기**
   - ✅ "저장했어요"
   - ❌ "저장됐어요"

3. **긍정적 말하기** (부정형 최소화 + 대안 제시)
   - ✅ "슬라이드를 찾지 못했어요. 새로 만들어볼까요?"
   - ❌ "슬라이드가 없어요"

**참조**: [../../docs/03-design/03-ux-writing.md](../../docs/03-design/03-ux-writing.md)

---

## 개발 시 주의사항

### 1. 클라이언트 vs 서버 컴포넌트 선택

**클라이언트 컴포넌트 필요 조건**:
- Zustand 스토어 사용
- 브라우저 API 사용 (`window`, `localStorage`)
- 사용자 상호작용 (버튼 클릭, 입력 등)

**서버 컴포넌트 사용 권장**:
- 정적 콘텐츠
- 데이터 페칭 (서버에서만)
- SEO 최적화 필요 시

---

### 2. API 라우트 보안

**서버 전용 환경 변수**:
```bash
# ✅ 서버 전용 (노출 금지)
PERPLEXITY_API_KEY=xxx
TOSS_PAYMENTS_SECRET_KEY=xxx

# ✅ 클라이언트 노출 가능
NEXT_PUBLIC_GEMINI_API_KEY=xxx
```

**클라이언트 환경 변수 규칙**:
- `NEXT_PUBLIC_` 접두사: 브라우저에 노출됨
- 접두사 없음: 서버 전용 (안전)

---

### 3. 타입 안정성

**페이지 Props 타입 정의**:

```typescript
interface PageProps {
  params: { id: string }
  searchParams: { slideIndex?: string }
}

export default function Page({ params, searchParams }: PageProps) {
  // ...
}
```

---

### 4. 성능 최적화

**Dynamic Import**:

```typescript
import dynamic from 'next/dynamic'

const SlideEditor = dynamic(() => import('@/components/SlideEditor'), {
  loading: () => <div>불러오고 있어요...</div>,
})
```

---

## 참고 문서

### 프로젝트 문서
- **[상위 컨텍스트](../CLAUDE.md)**: 프로젝트 전체 구조
- **[ARCHITECTURE.md](../ARCHITECTURE.md)**: 상세 아키텍처 설계

### Next.js 공식 문서
- **[App Router](https://nextjs.org/docs/app)**: Next.js 16 App Router
- **[Routing](https://nextjs.org/docs/app/building-your-application/routing)**: 라우팅 규칙
- **[API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)**: API 라우트

### 상위 문서
- **[WebView 개발 가이드](../../docs/04-development/06-webview.md)**: WebView 앱 개발
- **[UX Writing](../../docs/03-design/03-ux-writing.md)**: 텍스트 작성 규칙

---

**마지막 업데이트**: 2025-11-06
**변경 이력**: 초기 작성 - Next.js 16 App Router 구조 문서화
