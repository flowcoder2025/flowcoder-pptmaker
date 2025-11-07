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
├── (auth)/                 # 인증 관련 페이지 (라우트 그룹)
│   ├── login/                 # 로그인 페이지
│   │   └── page.tsx
│   └── signup/                # 회원가입 페이지
│       └── page.tsx
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
├── history/                # 프리젠테이션 히스토리
│   └── page.tsx               # 저장된 프리젠테이션 목록
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
    ├── auth/                  # NextAuth.js 인증
    │   └── [...nextauth]/
    │       └── route.ts       # OAuth 엔드포인트 (GitHub, Google)
    │
    ├── research/              # Perplexity AI 프록시
    │   └── route.ts
    │
    ├── presentations/         # 프리젠테이션 API
    │   ├── route.ts           # POST (생성), GET (목록)
    │   └── [id]/
    │       └── route.ts       # GET, PATCH, DELETE
    │
    ├── subscriptions/         # 구독 관리 API
    │   ├── route.ts           # POST (구독 시작)
    │   ├── current/
    │   │   └── route.ts       # GET (현재 구독)
    │   └── cancel/
    │       └── route.ts       # POST (구독 취소)
    │
    └── credits/               # 크레딧 관리 API
        ├── route.ts           # GET (잔액 조회)
        ├── purchase/
        │   └── route.ts       # POST (크레딧 구매)
        ├── consume/
        │   └── route.ts       # POST (크레딧 사용)
        └── history/
            └── route.ts       # GET (사용 내역)
```

---

## 주요 페이지

### 0. 인증 페이지 (`(auth)/`)

#### 로그인 (`(auth)/login/page.tsx`)

**경로**: `/login`
**설명**: OAuth 로그인 페이지

**주요 기능**:
- GitHub 로그인 버튼
- Google 로그인 버튼
- NextAuth.js 세션 자동 생성

**NextAuth 연동**:
```typescript
import { signIn } from 'next-auth/react'

// GitHub 로그인
await signIn('github', { callbackUrl: '/' })

// Google 로그인
await signIn('google', { callbackUrl: '/' })
```

**내비게이션**:
- → `/`: 로그인 성공 후 홈으로 이동

#### 회원가입 (`(auth)/signup/page.tsx`)

**경로**: `/signup`
**설명**: 회원가입 안내 페이지

**주요 기능**:
- OAuth 기반 회원가입 안내
- GitHub/Google 계정 연결
- 자동 User/Account 생성

---

### 1. 홈 (`page.tsx`)

**경로**: `/`
**설명**: 앱 시작 화면

**인증 상태**:
- 로그인 필요: NextAuth 세션 체크
- 미로그인 시 `/login`으로 리다이렉트

**주요 기능**:
- 환영 메시지 및 서비스 소개
- "새 프레젠테이션 만들기" 버튼
- 최근 프로젝트 목록 (DB에서 가져오기)

**서버 컴포넌트 예시**:
```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function HomePage() {
  const session = await auth()
  if (!session) redirect('/login')

  const presentations = await prisma.presentation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    take: 5,
  })

  return <div>...</div>
}
```

**내비게이션**:
- → `/input`: 텍스트 입력 페이지로 이동
- → `/history`: 전체 히스토리 보기

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

### 5. 히스토리 (`history/page.tsx`)

**경로**: `/history`
**설명**: 저장된 프리젠테이션 목록

**인증 상태**:
- 로그인 필요: NextAuth 세션 체크

**주요 기능**:
- 사용자의 모든 프리젠테이션 목록
- 썸네일, 제목, 생성일 표시
- 검색 및 필터링
- 삭제 기능 (권한 체크)

**서버 컴포넌트 예시**:
```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function HistoryPage() {
  const session = await auth()
  if (!session) redirect('/login')

  const presentations = await prisma.presentation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
  })

  return <div>...</div>
}
```

**내비게이션**:
- → `/viewer?id={presentationId}`: 프리젠테이션 보기

---

### 6. 구독 관리 (`subscription/page.tsx`)

**경로**: `/subscription`
**설명**: 요금제 선택 및 관리

**주요 기능**:
- 요금제 정보 표시 (Free/Standard/Premium)
- 구독 신청 (인앱 결제 연동)
- 현재 요금제 표시
- 구독 해지

**인증 상태**:
- 로그인 필요: NextAuth 세션 체크

**클라이언트 컴포넌트 예시**:
```typescript
'use client'

import { useSession } from 'next-auth/react'

export default function SubscriptionPage() {
  const { data: session } = useSession()

  const handleSubscribe = async (plan: 'pro' | 'premium') => {
    const res = await fetch('/api/subscriptions', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    })
    // ...
  }

  return <div>...</div>
}
```

**API 연동**:
- `GET /api/subscriptions/current`: 현재 구독 조회
- `POST /api/subscriptions`: 구독 시작
- `POST /api/subscriptions/cancel`: 구독 취소

---

### 7. 크레딧 관리 (`credits/page.tsx`)

**경로**: `/credits`
**설명**: 크레딧 구매 및 잔액 확인

**인증 상태**:
- 로그인 필요: NextAuth 세션 체크

**주요 기능**:
- 현재 크레딧 잔액 표시 (DB에서 가져오기)
- 크레딧 패키지 선택 (10/50/100 크레딧)
- 결제 진행 (Stripe 또는 토스페이먼츠)
- 크레딧 사용 내역

**클라이언트 컴포넌트 예시**:
```typescript
'use client'

import { useSession } from 'next-auth/react'

export default function CreditsPage() {
  const { data: session } = useSession()

  const handlePurchase = async (amount: number) => {
    const res = await fetch('/api/credits/purchase', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    })
    // ...
  }

  return <div>...</div>
}
```

**API 연동**:
- `GET /api/credits`: 크레딧 잔액 조회
- `POST /api/credits/purchase`: 크레딧 구매
- `GET /api/credits/history`: 사용 내역 조회

---

### 8. 개발자 도구 (`dev-tools/page.tsx`)

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

### 1. 인증 API (`api/auth/[...nextauth]/route.ts`)

**엔드포인트**: `/api/auth/*`
**설명**: NextAuth.js OAuth 인증 엔드포인트

**주요 엔드포인트**:
- `GET /api/auth/signin`: 로그인 페이지
- `GET /api/auth/signout`: 로그아웃
- `GET /api/auth/session`: 현재 세션 조회
- `GET /api/auth/csrf`: CSRF 토큰 생성
- `POST /api/auth/signin/:provider`: Provider 로그인 (GitHub, Google)
- `GET /api/auth/callback/:provider`: OAuth 콜백

**NextAuth 설정**:
```typescript
import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: 'database',
    maxAge: 30 * 24 * 60 * 60,  // 30일
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

**환경 변수** (서버 전용):
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

---

### 2. 자료 조사 API (`api/research/route.ts`)

**엔드포인트**: `POST /api/research`
**설명**: Perplexity AI 프록시

**인증**: NextAuth 세션 필요

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

**보호 패턴**:
```typescript
import { auth } from '@/lib/auth'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  // Perplexity API 호출
  // ...
}
```

**환경 변수**: `PERPLEXITY_API_KEY` (서버 전용)

---

### 3. 프리젠테이션 API (`api/presentations/`)

#### `POST /api/presentations`
**설명**: 새 프리젠테이션 생성

**인증**: NextAuth 세션 필요

**Request Body**:
```typescript
{
  title: string
  slides: HTMLSlide[]
  slideData: UnifiedPPTJSON
  templateId: string
}
```

**Response**:
```typescript
{
  id: string
  userId: string
  title: string
  createdAt: string
  updatedAt: string
}
```

**보호 패턴**:
```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const body = await req.json()

  const presentation = await prisma.presentation.create({
    data: {
      userId: session.user.id,
      title: body.title,
      slides: body.slides,
      slideData: body.slideData,
      templateId: body.templateId,
    },
  })

  return Response.json(presentation)
}
```

#### `GET /api/presentations`
**설명**: 사용자의 프리젠테이션 목록 조회

**인증**: NextAuth 세션 필요

**Query Parameters**:
- `userId`: 사용자 ID (optional, admin만)
- `limit`: 결과 개수 제한
- `offset`: 페이지네이션

**Response**:
```typescript
{
  presentations: Presentation[]
  total: number
}
```

#### `GET /api/presentations/[id]`
**설명**: 특정 프리젠테이션 조회

**인증**: NextAuth 세션 + Zanzibar 권한 체크

**보호 패턴**:
```typescript
import { auth } from '@/lib/auth'
import { check } from '@/lib/permissions'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  // 권한 체크
  const canView = await check(
    session.user.id,
    'presentation',
    params.id,
    'viewer'
  )
  if (!canView) return new Response('Forbidden', { status: 403 })

  const presentation = await prisma.presentation.findUnique({
    where: { id: params.id },
  })

  return Response.json(presentation)
}
```

#### `PATCH /api/presentations/[id]`
**설명**: 프리젠테이션 업데이트

**인증**: NextAuth 세션 + Zanzibar 권한 체크 (editor 필요)

#### `DELETE /api/presentations/[id]`
**설명**: 프리젠테이션 삭제

**인증**: NextAuth 세션 + Zanzibar 권한 체크 (owner 필요)

---

### 4. 구독 API (`api/subscriptions/`)

#### `GET /api/subscriptions/current`
**설명**: 현재 구독 정보 조회

**인증**: NextAuth 세션 필요

**Response**:
```typescript
{
  plan: 'free' | 'pro' | 'premium'
  status: 'active' | 'cancelled'
  startedAt: string
  expiresAt: string | null
}
```

#### `POST /api/subscriptions`
**설명**: 구독 시작

**인증**: NextAuth 세션 필요

**Request Body**:
```typescript
{
  plan: 'pro' | 'premium'
}
```

#### `POST /api/subscriptions/cancel`
**설명**: 구독 취소

**인증**: NextAuth 세션 필요

---

### 5. 크레딧 API (`api/credits/`)

#### `GET /api/credits`
**설명**: 크레딧 잔액 조회

**인증**: NextAuth 세션 필요

**Response**:
```typescript
{
  balance: number
}
```

**구현**:
```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { credits: true },
  })

  return Response.json({ balance: user?.credits || 0 })
}
```

#### `POST /api/credits/purchase`
**설명**: 크레딧 구매

**인증**: NextAuth 세션 필요

**Request Body**:
```typescript
{
  amount: number  // 10, 50, 100 등
}
```

#### `POST /api/credits/consume`
**설명**: 크레딧 소비 (내부 API)

**인증**: NextAuth 세션 필요

**Request Body**:
```typescript
{
  amount: number
  reason: string  // 'generation', 'research' 등
}
```

#### `GET /api/credits/history`
**설명**: 크레딧 사용 내역 조회

**인증**: NextAuth 세션 필요

**Query Parameters**:
- `limit`: 결과 개수 제한
- `offset`: 페이지네이션

**Response**:
```typescript
{
  transactions: CreditTransaction[]
  total: number
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

### 2. API 라우트 보안 및 인증

**서버 전용 환경 변수**:
```bash
# ✅ 서버 전용 (노출 금지)
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI APIs
PERPLEXITY_API_KEY=xxx

# ✅ 클라이언트 노출 가능
NEXT_PUBLIC_GEMINI_API_KEY=xxx
```

**클라이언트 환경 변수 규칙**:
- `NEXT_PUBLIC_` 접두사: 브라우저에 노출됨
- 접두사 없음: 서버 전용 (안전)

**API Route 보호 패턴**:
```typescript
import { auth } from '@/lib/auth'
import { check } from '@/lib/permissions'

export async function GET(req: Request) {
  // 1. 인증 체크
  const session = await auth()
  if (!session) return new Response('Unauthorized', { status: 401 })

  // 2. 권한 체크 (필요 시)
  const canView = await check(userId, 'presentation', id, 'viewer')
  if (!canView) return new Response('Forbidden', { status: 403 })

  // 3. 로직 실행
  // ...
}
```

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
- **[SPECIFICATION.md](../docs/SPECIFICATION.md)**: 기술 명세서
- **[Database_Architecture.md](../docs/Database_Architecture.md)**: 데이터베이스 및 권한 시스템

### Next.js 공식 문서
- **[App Router](https://nextjs.org/docs/app)**: Next.js 16 App Router
- **[Routing](https://nextjs.org/docs/app/building-your-application/routing)**: 라우팅 규칙
- **[API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)**: API 라우트

### 인증 및 데이터베이스
- **[NextAuth.js](https://next-auth.js.org)**: OAuth 인증 라이브러리
- **[Prisma](https://www.prisma.io)**: TypeScript ORM
- **[Supabase](https://supabase.com)**: 관리형 PostgreSQL

### UI 라이브러리
- **[shadcn/ui](https://ui.shadcn.com)**: Radix UI 기반 컴포넌트
- **[Radix UI](https://www.radix-ui.com)**: 접근성 우선 UI 프리미티브
- **[Tailwind CSS](https://tailwindcss.com)**: 유틸리티 CSS 프레임워크

---

**마지막 업데이트**: 2025-11-07
**변경 이력**: 웹 서비스 전환 - NextAuth.js, Prisma, API Routes 추가
