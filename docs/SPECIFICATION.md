# FlowCoder PPT Maker - 기술 명세서

> **버전**: 2.0.0
> **최종 수정**: 2025-11-07
> **상태**: 웹 서비스 전환 완료, 구현 진행 중

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [시스템 아키텍처](#3-시스템-아키텍처)
4. [인증 시스템](#4-인증-시스템)
5. [데이터베이스 스키마](#5-데이터베이스-스키마)
6. [권한 시스템](#6-권한-시스템)
7. [구독 및 크레딧 시스템](#7-구독-및-크레딧-시스템)
8. [템플릿 시스템 설계](#8-템플릿-시스템-설계)
9. [데이터 구조](#9-데이터-구조)
10. [API 설계](#10-api-설계)
11. [AI 파이프라인](#11-ai-파이프라인)
12. [디자인 시스템](#12-디자인-시스템)
13. [성능 최적화](#13-성능-최적화)
14. [보안 및 에러 처리](#14-보안-및-에러-처리)
15. [향후 개선사항](#15-향후-개선사항)
16. [부록](#16-부록)

---

## 1. 프로젝트 개요

### 1.1 개요

FlowCoder PPT Maker는 텍스트 입력으로 AI 기반 프리젠테이션을 생성하는 독립 웹 서비스입니다. 기존 Apps in Toss 플랫폼 전용에서 Vercel + Supabase 기반의 현대적인 풀스택 웹 애플리케이션으로 전환하였습니다.

### 1.2 핵심 기능

- **자연어 입력**: 텍스트 입력만으로 프리젠테이션 구조 자동 생성
- **AI 3단계 파이프라인**: Perplexity 자료 조사 → Gemini 콘텐츠+JSON 생성 → 템플릿 렌더링
- **클라이언트 템플릿 시스템**: API 비용 98% 절감 (100원 → 2원)
- **실시간 편집**: 무료 무제한 편집 및 미리보기
- **템플릿 갤러리**: 기본 템플릿 + 프리미엄 템플릿 판매

### 1.3 핵심 가치 제안

| 항목 | 현재 | 개선 후 | 효과 |
|------|------|---------|------|
| 원가 | 77-100원/회 | 2원/회 | **98% 절감** |
| 편집 | 불가능 | 무제한 편집 | **사용자 경험 향상** |
| 템플릿 | 1개 | 기본 4개 + 프리미엄 N개 | **수익화 가능** |
| 미리보기 | API 호출 필요 | 즉시 | **UX 개선** |

---

## 2. 기술 스택

### 2.1 Frontend

| 카테고리 | 기술 | 버전 | 용도 |
|---------|------|------|------|
| Framework | Next.js | 16 | App Router 기반 SSR |
| UI Library | React | 19 | 컴포넌트 시스템 |
| Language | TypeScript | 5 | 타입 안정성 |
| State | Zustand | 5 | 클라이언트 상태 관리 |
| Styling | Tailwind CSS | 4 | 유틸리티 CSS |
| UI Components | shadcn/ui | - | Radix UI 기반 컴포넌트 |
| Radix UI | @radix-ui/* | - | 접근성 우선 UI 프리미티브 |
| Icons | lucide-react | - | 아이콘 라이브러리 |
| Toast | react-hot-toast | - | 알림 메시지 |
| Build Tool | Turbopack | - | Next.js 내장 빌드 도구 |

### 2.2 Backend

| 카테고리 | 기술 | 용도 |
|---------|------|------|
| Database | Supabase PostgreSQL | 관리형 PostgreSQL |
| ORM | Prisma | Type-safe DB 클라이언트 |
| Auth | NextAuth.js v4 | OAuth 인증 (GitHub, Google) |
| Auth Adapter | @next-auth/prisma-adapter | Prisma 연동 |
| Permissions | Zanzibar (자체 구현) | Relationship-Based Access Control |
| Deployment | Vercel | 서버리스 배포 |

### 2.3 AI Services

| 카테고리 | 기술 | 용도 | 비용 |
|---------|------|------|------|
| AI - 자료 조사 | Perplexity Sonar | 빠른 웹 조사 | ~160원 (선택) |
| AI - 자료 조사 | Perplexity Sonar Reasoning | 깊은 분석 | ~200원 (선택) |
| AI - 콘텐츠+JSON | Gemini 2.5 Flash/Pro | 콘텐츠+JSON 생성 | ~2원 ⭐ |
| AI - 파싱 | ~~Gemini 2.5 Flash-Lite~~ | ~~JSON 파싱~~ | ~~8원~~ (통합) |
| AI - HTML | ~~Gemini 2.5 Pro~~ | ~~HTML 생성~~ | ~~82원~~ (제거) |
| 템플릿 | 클라이언트 엔진 | HTML 생성 | 0원 ⭐ |

### 2.4 개발 도구

- **패키지 관리**: npm
- **코드 품질**: ESLint
- **타입 체크**: TypeScript Compiler
- **데이터베이스 마이그레이션**: Prisma Migrate
- **테스트**: Jest, React Testing Library (향후)
- **E2E 테스트**: Playwright (향후)

---

## 3. 시스템 아키텍처

### 3.1 프로젝트 구조

```
ppt-maker-next/
├── app/                       # Next.js App Router
│   ├── page.tsx               # 홈 화면
│   ├── input/page.tsx         # 텍스트 입력
│   ├── viewer/page.tsx        # 슬라이드 뷰어
│   ├── editor/page.tsx        # 슬라이드 편집
│   ├── subscription/page.tsx  # 구독 관리
│   ├── credits/page.tsx       # 크레딧 관리
│   ├── layout.tsx             # 루트 레이아웃
│   ├── globals.css            # 전역 스타일
│   │
│   └── api/                   # API Routes
│       ├── auth/[...nextauth]/route.ts  # NextAuth API
│       ├── presentations/     # 프리젠테이션 CRUD
│       ├── subscriptions/     # 구독 관리
│       ├── credits/           # 크레딧 관리
│       ├── history/           # 생성 이력
│       └── admin/             # 관리자 API
│
├── components/                # React 컴포넌트
│   ├── ui/                    # shadcn/ui 컴포넌트
│   ├── auth/                  # 인증 컴포넌트
│   ├── editor/                # 편집기 컴포넌트
│   └── viewer/                # 뷰어 컴포넌트
│
├── lib/                       # 유틸리티 라이브러리
│   ├── prisma.ts              # Prisma Client 인스턴스
│   ├── permissions.ts         # Zanzibar 권한 시스템
│   ├── supabase/              # Supabase 클라이언트
│   │   └── client.ts
│   └── utils.ts               # 유틸리티 함수
│
├── prisma/                    # Prisma ORM
│   └── schema.prisma          # 데이터베이스 스키마
│
├── services/                  # 비즈니스 로직 (AI 파이프라인)
│   ├── gemini/                # Gemini API 연동
│   │   ├── config.ts
│   │   ├── content-generator.ts
│   │   └── parser.ts
│   ├── perplexity/            # Perplexity AI 연동
│   │   └── researcher.ts
│   ├── template/              # 템플릿 시스템 ⭐
│   │   ├── engine/            # 템플릿 엔진 코어
│   │   ├── base/              # 기본 템플릿
│   │   └── premium/           # 프리미엄 템플릿
│   └── slide/                 # 슬라이드 변환
│       └── converter.ts
│
├── store/                     # Zustand 상태 (클라이언트)
│   ├── presentationStore.ts
│   ├── subscriptionStore.ts
│   └── creditStore.ts
│
├── types/                     # TypeScript 타입
│   ├── slide.ts
│   ├── research.ts
│   ├── auth.ts
│   └── database.ts
│
└── constants/                 # 상수
    └── design.ts              # 디자인 시스템
```

### 3.2 컴포넌트 계층 구조

```
App
├── Layout
│   ├── Header
│   └── BottomNav
│
├── HomePage
│   └── TemplateGallery (향후)
│
├── InputPage
│   ├── TextInput
│   ├── TemplateSelector (향후)
│   └── GenerateButton
│
├── ViewerPage
│   ├── SlideViewer
│   ├── SlideList
│   └── ActionButtons
│
└── EditorPage (향후)
    ├── SlideEditor
    ├── PropertyPanel
    └── PreviewPane
```

### 3.2 기술 아키텍처 다이어그램

```
┌────────────────────────────────────────────────────────┐
│                   Next.js 16 Frontend                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   React 19  │  │  Zustand     │  │ shadcn/ui    │ │
│  │  Components │  │  State Mgmt  │  │  (Radix UI)  │ │
│  └─────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│                  Next.js API Routes                    │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ NextAuth.js  │  │ Presentations│  │   Admin     │ │
│  │     API      │  │  CRUD API    │  │    API      │ │
│  └──────────────┘  └──────────────┘  └─────────────┘ │
└────────────────────────────────────────────────────────┘
         │                   │                   │
         ↓                   ↓                   ↓
┌────────────────────────────────────────────────────────┐
│                    Prisma ORM Layer                    │
│  ┌──────────────────────────────────────────────────┐ │
│  │       Type-safe Database Access Layer            │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
                          ↓
┌────────────────────────────────────────────────────────┐
│              Supabase PostgreSQL Database              │
│  ┌─────────┐ ┌──────────────┐ ┌────────────────────┐ │
│  │  Users  │ │Presentations │ │ Subscriptions      │ │
│  │Accounts │ │    (JSON)    │ │ CreditTransactions │ │
│  └─────────┘ └──────────────┘ └────────────────────┘ │
└────────────────────────────────────────────────────────┘

            External Services (AI 파이프라인)
┌──────────────────┐  ┌────────────────────────────┐
│   Gemini API     │  │   Perplexity AI (선택)     │
│  (콘텐츠+JSON)   │  │   (웹 자료 조사)           │
└──────────────────┘  └────────────────────────────┘
```

### 3.3 데이터 플로우

#### 3.3.1 생성 플로우

```
[사용자 입력] (로그인 필요)
    ↓
[InputPage]
    ↓
[크레딧/구독 확인] - API: /api/subscriptions/current
    ↓
① Perplexity AI (선택)
    → 웹 자료 조사 (~160-200원)
    → API: POST /api/research
    ↓
② Gemini Flash/Pro ⭐
    → 콘텐츠+JSON 생성 (~2원)
    → UnifiedPPTJSON 직접 생성 (Parser 통합 - 8원 절감)
    ↓
③ 클라이언트 템플릿 엔진 ⭐
    → HTML 생성 (0원)
    ↓
[Supabase 저장]
    → API: POST /api/presentations
    → Prisma: presentations.create()
    → GenerationHistory 기록
    ↓
[ViewerPage]
━━━━━━━━━━━━━━━━━━━━
총 원가: ~2원 (98% 절감!)
```

#### 3.3.2 편집 플로우

```
[ViewerPage]
    ↓
[Edit 버튼 클릭]
    ↓
[EditorPage]
    ↓
[slideData 수정]
    ↓
[클라이언트 템플릿 엔진]
    → HTML 재생성 (0원, 즉시)
    ↓
[실시간 미리보기]
    ↓
[저장]
    → API: PATCH /api/presentations/{id}
    → Prisma: presentations.update()
    → Zanzibar 권한 체크 (owner/editor)
━━━━━━━━━━━━━━━━━━━━
비용: 0원 (무제한 편집 가능)
```

#### 3.3.3 저장/불러오기 플로우

```
[저장]
ViewerPage
    → API: POST /api/presentations
    → Prisma ORM
        → presentations.create({
            userId: session.user.id,
            title: string,
            slideData: UnifiedPPTJSON,
            metadata: { ... }
          })
    → Zanzibar grant('presentation', id, 'owner', 'user', userId)
    → Toast: "저장했어요"

[불러오기]
HistoryPage
    → API: GET /api/presentations
    → Prisma: presentations.findMany({ where: { userId } })
    → Zanzibar 권한 필터링
    → Presentation 목록 표시
    → 클릭 → ViewerPage로 이동
```

#### 3.3.4 인증 플로우

```
[로그인]
HomePage
    → 로그인 버튼 클릭
    → NextAuth signIn('github' | 'google')
    → OAuth Provider 인증
    → Callback: /api/auth/callback
    → Prisma Adapter
        → users.upsert()
        → accounts.create()
        → sessions.create()
    → 자동 Free 구독 생성
        → subscriptions.create({ tier: 'FREE', status: 'ACTIVE' })
    → 홈으로 리디렉션

[로그아웃]
    → NextAuth signOut()
    → Session 삭제
    → 홈으로 리디렉션
```

---

## 4. 인증 시스템

### 4.1 NextAuth.js 설정

**인증 제공자**:
- GitHub OAuth
- Google OAuth

**인증 전략**:
```typescript
{
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'database',  // 데이터베이스 세션 (JWT 아님)
    maxAge: 30 * 24 * 60 * 60,  // 30일
  },
  providers: [
    GithubProvider({ ... }),
    GoogleProvider({ ... }),
  ],
}
```

### 4.2 인증 플로우

```mermaid
sequenceDiagram
    User->>+HomePage: 로그인 버튼 클릭
    HomePage->>+NextAuth: signIn('github')
    NextAuth->>+GitHub: OAuth 요청
    GitHub->>-User: 권한 승인 요청
    User->>+GitHub: 승인
    GitHub->>-NextAuth: authorization code
    NextAuth->>+GitHub: access token 교환
    GitHub->>-NextAuth: user info
    NextAuth->>+Prisma: users.upsert()
    Prisma->>-Database: User 생성/업데이트
    NextAuth->>+Prisma: sessions.create()
    Prisma->>-Database: Session 생성
    NextAuth->>+Prisma: subscriptions.create(FREE)
    Prisma->>-Database: Free 구독 생성
    NextAuth->>-HomePage: 로그인 완료
```

### 4.3 세션 관리

**세션 저장**: Database (Prisma)
```typescript
model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

**세션 조회** (Server Component):
```typescript
import { auth } from '@/lib/auth'

export default async function Page() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  return <div>Hello {session.user.email}</div>
}
```

**세션 조회** (Client Component):
```typescript
'use client'
import { useSession } from 'next-auth/react'

export function UserInfo() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>불러오고 있어요...</div>
  if (status === 'unauthenticated') return <div>로그인이 필요해요</div>

  return <div>{session.user.name}</div>
}
```

### 4.4 보호된 라우트

**페이지 보호** (Server Component):
```typescript
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) {
    redirect('/')
  }

  // 인증된 사용자만 접근 가능
  return <div>...</div>
}
```

**API 라우트 보호**:
```typescript
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 인증된 사용자만 접근 가능
  return NextResponse.json({ data: '...' })
}
```

---

## 5. 데이터베이스 스키마

### 5.1 Prisma Schema 개요

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 5.2 User & Auth Tables

#### User (사용자)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?

  // Relations
  accounts         Account[]
  presentations    Presentation[]
  subscription     Subscription?
  creditTransactions CreditTransaction[]
  generationHistory  GenerationHistory[]

  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@map("users")
}
```

#### Account (OAuth 계정)
```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String  // 'github', 'google'
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}
```

### 5.3 Presentation Table

```prisma
model Presentation {
  id          String   @id @default(cuid())
  userId      String
  title       String
  description String?

  // SlideData JSON (UnifiedPPTJSON)
  slideData   Json

  // 메타데이터
  metadata    Json?    // { totalSlides, createdWith, version, ... }
  isPublic    Boolean  @default(false)

  // 소프트 삭제
  deletedAt   DateTime?

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  history     GenerationHistory[]

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
  @@index([isPublic])
  @@index([deletedAt])
  @@map("presentations")
}
```

**UnifiedPPTJSON 구조**:
```json
{
  "slides": [
    {
      "type": "title",
      "data": {
        "title": "프레젠테이션 제목",
        "subtitle": "부제목"
      }
    },
    {
      "type": "bullet",
      "data": {
        "title": "슬라이드 제목",
        "bullets": ["항목 1", "항목 2"]
      }
    }
  ]
}
```

### 5.4 Subscription & Credit Tables

#### Subscription (구독)
```prisma
model Subscription {
  id        String   @id @default(cuid())
  userId    String   @unique
  tier      String   // 'FREE', 'PRO', 'PREMIUM'
  status    String   // 'ACTIVE', 'CANCELED', 'EXPIRED'

  startDate DateTime
  endDate   DateTime?

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([tier])
  @@index([status])
  @@map("subscriptions")
}
```

#### CreditTransaction (크레딧 거래)
```prisma
model CreditTransaction {
  id          String   @id @default(cuid())
  userId      String
  type        String   // 'PURCHASE', 'USAGE', 'REFUND', 'BONUS'
  amount      Int      // 증가(+) 또는 감소(-) 크레딧
  balance     Int      // 거래 후 잔액
  description String?

  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([type])
  @@map("credit_transactions")
}
```

### 5.5 Generation History Table

```prisma
model GenerationHistory {
  id              String   @id @default(cuid())
  userId          String
  presentationId  String?

  // 입력
  prompt          String   @db.Text

  // AI 설정
  model           String   // 'gemini-flash', 'gemini-pro'
  useResearch     Boolean  @default(false)

  // 비용
  creditsUsed     Int      @default(0)

  // 결과
  result          Json?    // 생성된 SlideData JSON + metadata

  // Relations
  user            User         @relation(fields: [userId], references: [id], onDelete: Cascade)
  presentation    Presentation? @relation(fields: [presentationId], references: [id], onDelete: SetNull)

  createdAt       DateTime @default(now())

  @@index([userId, createdAt])
  @@index([presentationId])
  @@map("generation_history")
}
```

---

## 6. 권한 시스템

### 6.1 Zanzibar 개요

Google Zanzibar는 **Relationship-Based Access Control (ReBAC)** 패턴을 사용하는 분산 권한 시스템입니다.

**핵심 개념**:
- **Tuple**: `(namespace:objectId, relation, subjectType:subjectId)` 형태의 권한 관계
- **Check API**: 권한 확인
- **Write API**: 권한 부여
- **Delete API**: 권한 제거

### 6.2 Schema

#### RelationTuple (권한 튜플)
```prisma
model RelationTuple {
  id          String   @id @default(cuid())

  namespace   String   // 'presentation', 'system'
  objectId    String   // 리소스 ID
  relation    String   // 'owner', 'editor', 'viewer', 'admin'
  subjectType String   // 'user', 'user_set'
  subjectId   String   // User ID 또는 '*' (와일드카드)

  createdAt   DateTime @default(now())

  @@unique([namespace, objectId, relation, subjectType, subjectId])
  @@index([namespace, objectId, relation])
  @@index([subjectType, subjectId])
  @@map("relation_tuples")
}
```

### 6.3 권한 체계

**Namespace**: `presentation`, `system`
**Relation**: `owner`, `editor`, `viewer`, `admin`

**상속 구조**:
- `owner` → `editor` → `viewer`
- `admin` (시스템 레벨, 모든 권한)

### 6.4 권한 API (`lib/permissions.ts`)

**권한 확인**:
```typescript
export async function check(
  userId: string,
  namespace: 'presentation' | 'system',
  objectId: string,
  relation: 'owner' | 'editor' | 'viewer' | 'admin'
): Promise<boolean>

// 예시
const canEdit = await check('alice', 'presentation', '123', 'editor')
```

**권한 부여**:
```typescript
export async function grant(
  namespace: string,
  objectId: string,
  relation: string,
  subjectType: 'user',
  subjectId: string
): Promise<RelationTuple | null>

// 예시
await grant('presentation', '123', 'owner', 'user', 'alice')
```

**권한 제거**:
```typescript
export async function revoke(
  namespace: string,
  objectId: string,
  relation: string,
  subjectType: 'user',
  subjectId: string
): Promise<void>
```

### 6.5 권한 체크 흐름

```
1. 직접 권한 확인: (namespace, objectId, relation, user, userId) 튜플 조회
2. 상속 권한 확인: owner → editor → viewer 계층
3. 시스템 권한 확인: (system, global, admin, user, userId) 조회
4. 와일드카드 확인: (namespace, objectId, relation, user, *) 조회
```

**예시**:
```
(presentation:123, owner, user:alice)   → alice는 owner
(presentation:123, editor, user:bob)    → bob은 editor
(presentation:456, viewer, user:*)      → 모든 사용자가 조회 가능
(system:global, admin, user:admin_user) → admin_user는 시스템 관리자
```

---

## 7. 구독 및 크레딧 시스템

### 7.1 구독 티어 비교

| 기능 | Free | Pro (월 9,900원) | Premium (미정) |
|------|------|------------------|----------------|
| **AI 모델** | Gemini Flash | Gemini Flash | Gemini Pro |
| **Deep Research** | ❌ | 크레딧 사용 | 크레딧 사용 |
| **슬라이드 제한** | 5개 | 무제한 | 무제한 |
| **워터마크** | ✅ 있음 | ❌ 없음 | ❌ 없음 |
| **광고** | ✅ 있음 | ❌ 없음 | ❌ 없음 |
| **저장 개수** | 무제한 | 무제한 | 무제한 |
| **다운로드** | HTML, PDF | HTML, PDF, PPTX | HTML, PDF, PPTX |
| **협업 (향후)** | ❌ | ✅ | ✅ |

### 7.2 크레딧 시스템

**크레딧 사용**:
- **Pro 모델 사용**: 1 크레딧
- **Deep Research 기능**: 2 크레딧

**크레딧 구매** (예시):
- 100 크레딧: 10,000원
- 500 크레딧: 45,000원 (10% 할인)
- 1,000 크레딧: 80,000원 (20% 할인)

**크레딧 잔액 조회**:
```typescript
// API: GET /api/credits
const latestTransaction = await prisma.creditTransaction.findFirst({
  where: { userId },
  orderBy: { createdAt: 'desc' },
  select: { balance: true },
})

const currentBalance = latestTransaction?.balance ?? 0
```

### 7.3 구독 API

| Endpoint | Method | 설명 |
|----------|--------|------|
| `/api/subscriptions/current` | GET | 내 구독 정보 조회 |
| `/api/subscriptions` | POST | 구독 생성/업그레이드 |
| `/api/subscriptions/cancel` | POST | 구독 취소 |

### 7.4 크레딧 API

| Endpoint | Method | 설명 |
|----------|--------|------|
| `/api/credits` | GET | 크레딧 잔액 조회 |
| `/api/credits/purchase` | POST | 크레딧 구매 |
| `/api/credits/history` | GET | 크레딧 거래 이력 조회 |
| `/api/credits/consume` | POST | 크레딧 차감 (내부 API) |

---

## 8. 템플릿 시스템 설계

### 8.1 시스템 개요

클라이언트 HTML 템플릿 시스템은 기존 Gemini API 호출을 클라이언트 엔진으로 대체하여 **비용 87% 절감** 및 **실시간 편집 기능**을 구현합니다.

#### 설계 원칙

1. **Gemini HTML 패턴 완벽 복제**: 픽셀 단위 동일 구현
2. **구조화된 데이터 저장**: UnifiedPPTJSON 기반 편집 가능 데이터
3. **플러그인 아키텍처**: 템플릿 추가/제거 용이

### 8.2 아키텍처 다이어그램

```
┌─────────────────────────────────────────┐
│      Template Engine (Core)             │
├─────────────────────────────────────────┤
│  ┌─────────────┐  ┌──────────────────┐ │
│  │   Base      │  │  Template        │ │
│  │  Templates  │  │  Registry        │ │
│  └─────────────┘  └──────────────────┘ │
│         │                  │            │
│         ↓                  ↓            │
│  ┌────────────────────────────────┐    │
│  │    Template Generator          │    │
│  │  - generateSlideHTML()         │    │
│  │  - applyTemplate()             │    │
│  │  - renderSlide()               │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
            ↓                  ↑
┌────────────────────┐  ┌──────────────────┐
│  Built-in Templates│  │ Premium Templates│
│  - toss-default    │  │ - elegant-business│
│  (4 types)         │  │ - modern-tech    │
└────────────────────┘  │ - creative-studio│
                        └──────────────────┘
```

### 8.3 템플릿 디렉토리 구조

```
services/template/
├── engine/
│   ├── TemplateEngine.ts          # 템플릿 엔진 코어
│   ├── TemplateRegistry.ts        # 템플릿 레지스트리
│   └── types.ts                   # 템플릿 타입 정의
│
├── base/
│   ├── toss-default/
│   │   ├── index.ts               # Export
│   │   ├── TitleSlide.ts
│   │   ├── ContentSlide.ts
│   │   ├── BulletSlide.ts
│   │   └── SectionSlide.ts
│   └── config.ts
│
└── premium/
    ├── loader.ts                  # 동적 로더
    ├── elegant-business/
    └── modern-tech/
```

### 8.4 기본 템플릿 (toss-default)

#### MVP 범위 (4개 슬라이드 타입)

Phase 1에서 구현하는 핵심 타입:

1. **TitleSlide** - 표지 슬라이드
2. **ContentSlide** - 본문 슬라이드
3. **BulletSlide** - 불릿 포인트 슬라이드
4. **SectionSlide** - 섹션 구분 슬라이드

**선정 이유**:
- 프리젠테이션의 80% 커버
- 구현 복잡도 낮음
- 텍스트 편집 핵심 타입

#### Gemini HTML 패턴 분석

**기본 스펙**:
- 슬라이드 크기: `1200px × 675px` (16:9 비율)
- padding: `60px`
- font-family: `Arial`
- 색상: TDS Colors 기반 (#3182f6 primary, #333d4b dark 등)

**공통 구조**:
```html
<div class="slide" id="slide-{n}">
  <style>.slide { width: 1200px; height: 675px; }</style>
  <div class="slide" style="...">
    <!-- 슬라이드 내용 -->
  </div>
</div>
```

### 8.5 프리미엄 템플릿 시스템

#### 동적 로딩 메커니즘

- **플러그인 아키텍처**: 런타임 동적 로드
- **템플릿 추가**: 디렉토리 생성 + config.ts 등록
- **템플릿 제거**: 디렉토리 삭제 + config.ts 제거

#### 템플릿 카테고리

- **무료**: toss-default
- **프리미엄**: elegant-business, modern-tech, creative-studio 등
- **커스텀**: Enterprise 요금제 전용 (향후)

---

## 9. 데이터 구조

### 9.1 Presentation 타입

#### 기존 구조 (Phase 0)

```typescript
interface Presentation {
  id: string;
  title: string;
  slides: HTMLSlide[];        // HTML 문자열만 저장
  createdAt: number;
}
```

**문제점**:
- HTML 문자열만 저장 → 편집 불가능
- 구조화된 데이터 없음
- 템플릿 정보 없음

#### 새 구조 (Phase 1+)

```typescript
interface Presentation {
  id: string;
  title: string;
  slides: HTMLSlide[];        // 렌더링용 (기존 호환성)
  slideData: UnifiedPPTJSON;  // 편집 가능 데이터 ⭐
  templateId: string;         // 사용된 템플릿 ID ⭐
  createdAt: number;
  updatedAt?: number;         // 수정 시간 ⭐
}
```

**개선 효과**:
- 편집 가능한 구조화된 데이터 저장
- 템플릿 재적용 가능
- 하위 호환성 유지 (slides 필드)

### 9.2 UnifiedPPTJSON 규격

```typescript
interface UnifiedPPTJSON {
  slides: Slide[];
}

type Slide =
  | TitleSlide
  | ContentSlide
  | BulletSlide
  | SectionSlide
  | TableSlide
  | ChartSlide
  | StatsSlide
  | ComparisonSlide
  | TimelineSlide
  | QuoteSlide
  | ThankYouSlide
  | TwoColumnSlide;

interface BaseSlide {
  type: string;
  props: Record<string, any>;
  style?: Record<string, any>;
}
```

**예시**:
```typescript
{
  "slides": [
    {
      "type": "title",
      "props": {
        "title": "AI 워크플로우 자동화",
        "subtitle": "업무 혁신의 시작"
      },
      "style": {
        "background": "#3182f6",
        "titleColor": "#FFFFFF"
      }
    },
    {
      "type": "bullet",
      "props": {
        "title": "핵심 기능",
        "bullets": ["자동화", "통합", "분석"]
      }
    }
  ]
}
```

### 9.3 HTMLSlide 타입

```typescript
interface HTMLSlide {
  html: string;  // 렌더링용 HTML 문자열
  css?: string;  // 슬라이드별 CSS (선택)
}
```

---

## 10. API 설계

### 10.1 Gemini API 연동

#### content-generator.ts

**역할**: 텍스트 → 구조화된 콘텐츠 생성

**입력**:
```typescript
{
  text: string;              // 사용자 입력 텍스트
  researchData?: string;     // Perplexity 조사 결과 (선택)
  useFlash?: boolean;        // Flash(2원) vs Pro(10원)
}
```

**출력**:
```typescript
{
  slides: ParsedSlide[];     // 파싱된 슬라이드 배열
}
```

**비용**: ~2원 (Flash) / ~10원 (Pro)

#### parser.ts

**역할**: 파싱된 콘텐츠 → UnifiedPPTJSON 변환

**입력**:
```typescript
{
  slides: ParsedSlide[];
}
```

**출력**:
```typescript
UnifiedPPTJSON
```

**비용**: ~8원 (Flash-Lite)

### 10.2 Perplexity API 연동

#### researcher.ts

**역할**: 웹 자료 조사 및 정보 수집

**입력**:
```typescript
{
  query: string;             // 조사 주제
  depth: 'fast' | 'deep';    // Sonar(160원) vs Reasoning(200원)
}
```

**출력**:
```typescript
{
  summary: string;           // 조사 요약
  sources: string[];         // 출처 URL
  content: string;           // 상세 내용
}
```

**비용**: ~160원 (Sonar) / ~200원 (Reasoning)

### 10.3 템플릿 엔진 API

#### TemplateEngine

**generateSlide()**:
```typescript
// 단일 슬라이드 HTML 생성
generateSlide(
  slide: Slide,
  templateId: string
): HTMLSlide
```

**generateAll()**:
```typescript
// 전체 프리젠테이션 HTML 생성
generateAll(
  slideData: UnifiedPPTJSON,
  templateId: string
): HTMLSlide[]
```

**비용**: 0원 (클라이언트 처리)

### 10.4 웹 서비스 API

#### Presentations API

**엔드포인트**: `/api/presentations`

**CREATE** - `POST /api/presentations`
```typescript
// Request
{
  title: string
  slideData: UnifiedPPTJSON
  metadata?: {
    totalSlides: number
    createdWith: 'gemini-flash' | 'gemini-pro'
    version: string
  }
}

// Response
{
  id: string
  userId: string
  title: string
  slideData: UnifiedPPTJSON
  metadata: object
  createdAt: string
}
```

**READ** - `GET /api/presentations?userId={userId}`
```typescript
// Response
{
  presentations: Presentation[]
}
```

**UPDATE** - `PATCH /api/presentations/{id}`
```typescript
// Request
{
  title?: string
  slideData?: UnifiedPPTJSON
  metadata?: object
}

// Response
{
  updated: Presentation
}
```

**DELETE** - `DELETE /api/presentations/{id}`
```typescript
// Response (Soft Delete)
{
  success: boolean
  deletedAt: string
}
```

#### Subscriptions API

**엔드포인트**: `/api/subscriptions`

**현재 구독 조회** - `GET /api/subscriptions/current`
```typescript
// Response
{
  tier: 'FREE' | 'PRO' | 'PREMIUM'
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED'
  startDate: string
  endDate?: string
}
```

**구독 생성/업그레이드** - `POST /api/subscriptions`
```typescript
// Request
{
  tier: 'PRO' | 'PREMIUM'
  paymentMethod: string
}

// Response
{
  subscription: Subscription
  paymentUrl?: string  // 결제 페이지 URL
}
```

**구독 취소** - `POST /api/subscriptions/cancel`
```typescript
// Response
{
  subscription: Subscription  // status: 'CANCELED'
  effectiveDate: string       // 구독 종료 예정일
}
```

#### Credits API

**엔드포인트**: `/api/credits`

**잔액 조회** - `GET /api/credits`
```typescript
// Response
{
  balance: number
  transactions: CreditTransaction[]  // 최근 10개
}
```

**크레딧 구매** - `POST /api/credits/purchase`
```typescript
// Request
{
  packageId: '100' | '500' | '1000'
  paymentMethod: string
}

// Response
{
  transaction: CreditTransaction
  newBalance: number
  paymentUrl?: string
}
```

**크레딧 거래 이력** - `GET /api/credits/history?limit={n}&offset={n}`
```typescript
// Response
{
  transactions: CreditTransaction[]
  total: number
  hasMore: boolean
}
```

**크레딧 차감 (내부 API)** - `POST /api/credits/consume`
```typescript
// Request
{
  amount: number
  description: string
}

// Response
{
  transaction: CreditTransaction
  newBalance: number
}
```

#### History API

**엔드포인트**: `/api/history`

**생성 이력 조회** - `GET /api/history?userId={userId}&limit={n}`
```typescript
// Response
{
  history: GenerationHistory[]
  total: number
}
```

**생성 이력 상세** - `GET /api/history/{id}`
```typescript
// Response
{
  id: string
  prompt: string
  model: string
  useResearch: boolean
  creditsUsed: number
  result: UnifiedPPTJSON
  createdAt: string
}
```

---

## 11. AI 파이프라인

### 11.1 현재 아키텍처 (Phase 0)

```
텍스트 입력
  → Gemini Pro/Flash: 콘텐츠 생성 (~10원)
  → Gemini Flash: JSON 파싱 (~8원)
  → Gemini Pro/Flash: HTML 생성 (~82원) ⚠️
  → Viewer 렌더링
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 원가: ~100원
```

**문제점**:
- HTML 생성이 전체 비용의 82-97% 차지
- 편집 시마다 API 재호출 → 비용 중복
- 규모 확장 시 원가 급증 위험

### 11.2 개선 아키텍처 (Phase 1+)

```
텍스트 입력
  → (선택) Perplexity: 자료 조사 (~160-200원)
  → Gemini Flash/Pro: 콘텐츠+JSON 생성 (~2원) ✨
      ↳ UnifiedPPTJSON 형식 직접 생성 (Parser 제거로 8원 절감)
  → 클라이언트 템플릿 엔진: HTML 생성 (0원) ✨
  → Viewer 렌더링
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
총 원가: ~2원 (98% 절감!)
```

**개선 효과**:
- Parser 통합으로 8원 절감 (Flash-Lite API 호출 제거)
- HTML 생성 비용 100% 제거
- 편집 무제한 (0원)
- 즉시 미리보기 가능

### 11.3 비용 분석

#### 기본 생성 비용

| 단계 | 현재 Pro | 현재 Flash | 템플릿 시스템 | 절감율 |
|------|----------|-----------|-------------|--------|
| 콘텐츠+JSON 생성 | 10원 | 2원 | 2원 | - |
| 파싱 | 8원 | 8원 | 0원 (통합) | **100%** |
| HTML 생성 | 82원 | 75원 | 0원 | **100%** |
| **총 원가** | **100원** | **77원** | **2원** | **98%** |

**핵심 개선점**:
- Parser 단계 제거: 콘텐츠 생성 시 UnifiedPPTJSON 형식 직접 생성 (8원 절감)
- HTML 생성 클라이언트 처리: 템플릿 엔진 활용 (75-82원 절감)

#### 편집 시나리오

```
[현재]
편집 1회 = 77-100원 (HTML 재생성)
편집 10회 = 770-1,000원 ❌

[템플릿 시스템]
편집 무제한 = 0원 ✅
```

#### 월간 비용 예측

**시나리오**: 월 1,000명 × 평균 5회 생성

```
현재 비용: 1,000명 × 5회 × 77원 = ₩385,000
새 비용:   1,000명 × 5회 × 2원  = ₩10,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
월 절감액: ₩375,000 (98% 절감)
연 절감액: ₩4,500,000
```

---

## 12. 디자인 시스템

### 12.1 색상 팔레트 (TDS Colors)

```typescript
export const TOSS_COLORS = {
  // 브랜드 색상
  primary: '#5ec9a7',      // 토스 민트 (새 팔레트)
  secondary: '#1c3f57',    // 토스 네이비

  // Gemini 템플릿 색상
  geminiPrimary: '#3182f6',      // 토스 블루
  geminiDark: '#333d4b',         // 다크 배경
  geminiText: '#191f28',         // 텍스트
  geminiTextSecondary: '#333d4b',
  geminiGray: '#d1d6db',         // 보조 텍스트
  geminiBg: '#f2f4f6',           // 배경

  // 기본 색상
  background: '#FFFFFF',
  surface: '#F9FAFB',
  text: '#0f1419',
  textSecondary: '#6B7280',
  muted: '#e5e5e6',

  // 상태 색상
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B'
};
```

### 12.2 타이포그래피

```typescript
export const TYPOGRAPHY = {
  fontFamily: 'Arial',
  fontSize: {
    // 슬라이드 제목
    title: 48,           // TitleSlide
    subtitle: 24,        // TitleSlide subtitle
    sectionTitle: 44,    // SectionSlide

    // 본문
    heading: 32,         // Content/Bullet heading
    body: 18,            // 본문 텍스트
    quote: 22,           // QuoteSlide

    // 특수
    stats: 56,           // StatsSlide 값
  },
  fontWeight: {
    normal: 400,
    bold: 700
  },
  lineHeight: {
    normal: 1.4,
    relaxed: 1.7
  }
};
```

### 12.3 레이아웃 스펙

```typescript
export const LAYOUT = {
  // 슬라이드 크기
  slideWidth: 1200,
  slideHeight: 675,      // 16:9 비율

  // 간격
  spacing: {
    padding: 60,         // 슬라이드 내부 패딩
    gap: 40,             // 그리드 간격
    margin: 30,          // 요소 간 마진
  },

  // Accent Bar
  accentBar: {
    width: 60,
    height: 4
  },

  // Border Radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16
  }
};
```

### 12.4 슬라이드 타입별 스타일

#### TitleSlide
- 배경: `geminiPrimary` (#3182f6)
- 제목: 48px, bold, white
- 부제목: 24px, gray
- 정렬: 중앙 (flex center)

#### ContentSlide / BulletSlide
- 배경: white
- Accent Bar: 60×4px, primary
- 제목: 32px, bold, dark
- 본문: 18px, regular

#### SectionSlide
- 배경: `geminiDark` (#333d4b)
- 제목: 44px, bold, white
- 정렬: 중앙

#### StatsSlide
- 레이아웃: 2×2 Grid
- 카드: primary border, bg 연한 회색
- 값: 56px, bold, primary
- 라벨: 18px

---

## 13. 성능 최적화

### 13.1 API 호출 최적화

#### 비용 절감 전략
- **Gemini Flash 우선**: Pro 대비 5배 저렴
- **Flash-Lite 파싱**: 저단가 모델 활용
- **템플릿 엔진**: HTML 생성 비용 100% 제거

#### 응답 캐싱
```typescript
// 동일 텍스트 재생성 방지
const cache = new Map<string, UnifiedPPTJSON>();

function getCachedResult(text: string) {
  const hash = hashText(text);
  return cache.get(hash);
}
```

### 13.2 렌더링 최적화

#### Lazy Loading
```typescript
// 현재 슬라이드만 렌더링
const visibleSlides = slides.slice(
  currentIndex - 1,
  currentIndex + 2
);
```

#### Intersection Observer
```typescript
// 뷰포트 진입 시 로드
useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          loadSlide(entry.target.dataset.index);
        }
      });
    }
  );
  // ...
}, []);
```

### 13.3 저장소 최적화

#### 썸네일 압축
```typescript
// Canvas → WebP 압축
const thumbnail = canvas.toDataURL('image/webp', 0.7);
```

#### 자동 정리
```typescript
// 30일 이상 미사용 프리젠테이션 삭제
function cleanupOldPresentations() {
  const threshold = Date.now() - 30 * 24 * 60 * 60 * 1000;
  // ...
}
```

### 13.4 번들 최적화

#### Dynamic Import
```typescript
// 프리미엄 템플릿 동적 로드
const template = await import(
  `./premium/${templateId}/index.ts`
);
```

#### Tree Shaking
- 사용하지 않는 템플릿 제거
- TDS Mobile 컴포넌트 선택적 import

---

## 14. 보안 및 에러 처리

### 14.1 환경 변수 관리

```env
# Database (서버 전용)
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase (서버 전용)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # 서버 전용

# NextAuth (서버 전용)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Services
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key  # 클라이언트 노출 가능
PERPLEXITY_API_KEY=your_perplexity_key      # 서버 전용
```

**주의사항**:
- `NEXT_PUBLIC_` 접두사: 브라우저에 노출되는 환경 변수
- `SUPABASE_SERVICE_ROLE_KEY`: 서버 전용, 절대 클라이언트 노출 금지
- `NEXTAUTH_SECRET`: 프로덕션 환경에서는 강력한 랜덤 문자열 사용
- `DATABASE_URL`: Supabase PostgreSQL 연결 문자열 (Prisma 사용)

### 14.2 API 에러 처리

#### Gemini API 에러

```typescript
try {
  const result = await generateHTML(request);
} catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    showError('일일 생성 한도를 초과했어요.');
  } else if (error.code === 'INVALID_REQUEST') {
    showError('입력 텍스트를 다시 확인해주세요.');
  } else {
    showError('슬라이드 생성에 실패했어요. 다시 시도해주세요.');
  }
}
```

#### Storage 에러

```typescript
try {
  await savePresentation(presentation);
} catch (error) {
  if (error.code === 'STORAGE_FULL') {
    showError('저장 공간이 부족해요. 이전 프리젠테이션을 삭제해주세요.');
  } else {
    showError('저장에 실패했어요.');
  }
}
```

### 14.3 입력 검증

#### 텍스트 입력 검증

```typescript
function validateInput(text: string): ValidationResult {
  if (text.length < 10) {
    return { valid: false, error: '최소 10자 이상 입력해주세요.' };
  }
  if (text.length > 10000) {
    return { valid: false, error: '최대 10,000자까지 입력 가능해요.' };
  }
  return { valid: true };
}
```

#### XSS 방지

```typescript
// HTML 생성 시 escape 처리
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
```

### 14.4 UX Writing 규칙

**모든 사용자 대면 텍스트는 Apps in Toss UX Writing 가이드 준수**

1. **~해요체 사용**: 모든 문구에 "~해요" 어미
   - ❌ "검색 중...", "로딩 중..."
   - ✅ "검색하고 있어요", "불러오고 있어요"

2. **능동적 말하기**: 능동형 문장 사용
   - ❌ "됐어요", "완료됐어요"
   - ✅ "했어요", "완료했어요"

3. **긍정적 말하기**: 부정형 최소화, 대안 제시
   - ❌ "검색 결과가 없어요" (단독)
   - ✅ "검색 결과를 찾지 못했어요. 다른 키워드로 시도해보세요."

---

## 15. 향후 개선사항

### 15.1 Phase 1: 기본 템플릿 시스템 (완료)

- ✅ 템플릿 엔진 코어 구현
- ✅ Gemini HTML 패턴 분석 완료
- ✅ 4개 기본 타입 템플릿 구현
- ✅ Presentation 타입 확장
- ✅ 생성 플로우 통합

### 15.2 Phase 2: 편집 기능 (1주)

- 📝 Editor 페이지 구축
- 📝 슬라이드 타입별 편집 폼
- 📝 실시간 미리보기
- 📝 저장 및 업데이트 로직

### 15.3 Phase 3: 나머지 템플릿 (1주)

- 📝 8개 추가 슬라이드 타입
  - TableSlide
  - ChartSlide
  - StatsSlide
  - ComparisonSlide
  - TimelineSlide
  - QuoteSlide
  - ThankYouSlide
  - TwoColumnSlide

### 15.4 Phase 4: 프리미엄 템플릿 (2주)

- 📝 동적 템플릿 로더
- 📝 템플릿 레지스트리
- 📝 템플릿 선택 UI
- 📝 10개 프리미엄 템플릿 제작

### 15.5 Phase 5: 수익화 (1주)

- 📝 인앱 결제 연동 (Apps in Toss IAP)
- 📝 템플릿 스토어 UI
- 📝 구독 모델 구현

### 15.6 Long-term (Phase 6+)

- 📝 협업 기능 (공동 편집)
- 📝 클라우드 동기화
- 📝 PDF 내보내기
- 📝 발표자 노트
- 📝 애니메이션 효과
- 📝 차트 데이터 시각화
- 📝 이미지 업로드 및 삽입

---

## 16. 부록

### 16.1 용어 정리

| 용어 | 설명 |
|------|------|
| UnifiedPPTJSON | 구조화된 슬라이드 데이터 (편집 가능) |
| HTMLSlide | 렌더링용 HTML 문자열 |
| SlideTemplate | 슬라이드 타입별 HTML 생성 템플릿 |
| TemplateEngine | 템플릿 기반 HTML 생성 엔진 |
| TemplateRegistry | 템플릿 등록 및 관리 시스템 |
| Bedrock SDK | Apps in Toss 플랫폼 API |
| TDS Mobile | 토스 디자인 시스템 (WebView 전용) |

### 16.2 참조 문서

#### 내부 문서
- [ARCHITECTURE.md](../ARCHITECTURE.md) - 상세 아키텍처
- [템플릿_시스템_설계서.md](../claudedocs/템플릿_시스템_설계서.md) - 템플릿 시스템 상세
- [원가 분석.md](../원가 분석.md) - AI 비용 분석
- [수익 모델.md](../수익 모델.md) - 비즈니스 모델

#### 외부 문서
- [Apps in Toss 공식](https://developers-apps-in-toss.toss.im)
- [TDS Mobile 공식](https://tossmini-docs.toss.im/tds-mobile/)
- [Bedrock SDK 레퍼런스](../../docs/reference/bedrock/)
- [공식 예제](../../example/)

### 16.3 수익 시뮬레이션

#### 시나리오 A: 템플릿 판매 중심

```
월 활성 사용자: 1,000명
템플릿 구매 (20%): 200명 × ₩1,990 = ₩398,000
구독 Pro (10%): 100명 × ₩4,900 = ₩490,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
월 매출: ₩888,000
월 원가: ₩51,000 (API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
순이익: ₩837,000 (94% 마진)
```

#### 시나리오 B: 구독 모델 중심

```
월 활성 사용자: 5,000명
구독 Pro (16%): 800명 × ₩4,900 = ₩3,920,000
구독 Enterprise (4%): 200명 × ₩49,000 = ₩9,800,000
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
월 매출: ₩13,720,000
월 원가: ₩420,000 (API)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
순이익: ₩13,300,000 (97% 마진)
```

---

**문서 버전**: 1.0.0
**작성자**: Claude Code
**최종 수정**: 2025-10-30
**검토 상태**: 승인 완료
