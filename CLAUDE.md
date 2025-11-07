# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

# FlowCoder PPT Maker - 웹 서비스 프로젝트

> **프로젝트 타입**: 독립 웹 서비스
> **UI 라이브러리**: shadcn/ui + Radix UI
> **프레임워크**: Next.js 16 (App Router) + React 19
> **백엔드**: Supabase + Prisma + NextAuth.js
> **배포**: Vercel

---

## 📚 문서 네비게이션

이 문서는 **허브(Hub)** 역할을 수행합니다. 각 디렉토리는 독립적인 **노드(Node)**로 작동합니다.

### 🎯 빠른 참조

| 디렉토리 | 역할 | 문서 |
|---------|------|------|
| **app/** | Next.js 페이지 및 API Routes | [app/claude.md](app/claude.md) |
| **components/** | React 컴포넌트 (shadcn/ui) | [components/claude.md](components/claude.md) |
| **services/** | 비즈니스 로직 (AI 파이프라인) | [services/claude.md](services/claude.md) |
| **store/** | Zustand 상태 관리 | [store/claude.md](store/claude.md) |
| **types/** | TypeScript 타입 정의 | [types/claude.md](types/claude.md) |
| **lib/** | Prisma, Supabase, Zanzibar | - |
| **prisma/** | 데이터베이스 스키마 | - |
| **docs/** | 프로젝트 문서 | [아래 참조](#-프로젝트-문서-docs) |

### 📖 작업별 문서 선택 가이드

**페이지/API 개발 시** → [app/claude.md](app/claude.md)
**UI 컴포넌트 개발 시** → [components/claude.md](components/claude.md)
**AI 서비스 개발 시** → [services/claude.md](services/claude.md)
**상태 관리 개발 시** → [store/claude.md](store/claude.md)
**타입 정의 시** → [types/claude.md](types/claude.md)
**아키텍처 이해 시** → [docs/SPECIFICATION.md](docs/SPECIFICATION.md)
**데이터베이스 스키마** → [docs/Database_Architecture.md](docs/Database_Architecture.md)
**웹 서비스 전환 가이드** → [docs/DESIGN_DOC.md](docs/DESIGN_DOC.md)

---

## 🌟 프로젝트 개요

FlowCoder PPT Maker는 텍스트 입력으로 AI 기반 프리젠테이션을 생성하는 독립 웹 서비스입니다.

### 핵심 기술 스택

**Frontend**:
- Next.js 16 (App Router) + React 19 + TypeScript
- shadcn/ui + Radix UI (Tailwind CSS 4)
- Zustand (클라이언트 상태)

**Backend**:
- Supabase PostgreSQL (Database)
- Prisma ORM (Type-safe client)
- NextAuth.js v4 (OAuth 인증)
- Zanzibar ReBAC (권한 시스템)

**AI Services**:
- Google Gemini API (콘텐츠 생성)
- Perplexity AI (자료 조사)

**Deployment**:
- Vercel (Frontend + API Routes)
- Supabase (Managed Database)

### AI 생성 플로우 (3단계 파이프라인)

```
사용자 입력 (로그인 필요)
  → 1️⃣ 자료 조사 (Perplexity - 선택)
  → 2️⃣ 콘텐츠 + JSON 생성 (Gemini Flash/Pro - 2원)
  → 3️⃣ 템플릿 렌더링 (클라이언트 엔진 - 0원)
  → Supabase 저장
```

**핵심 성과**:
- ✅ **비용 98% 절감**: 100원 → 2원
- ✅ **무제한 편집**: 클라이언트 템플릿 엔진
- ✅ **21개 슬라이드 타입**: 완전 지원
- ✅ **구독 + 크레딧 시스템**: Free/Pro/Premium

---

## 🚀 빠른 시작

### 개발 명령어

```bash
npm run dev          # 개발 서버 실행 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 검사
npx tsc --noEmit     # TypeScript 타입 체크

# Prisma
npx prisma generate         # Prisma Client 생성
npx prisma migrate dev      # 개발 마이그레이션
npx prisma studio           # Prisma Studio (DB GUI)
```

### 환경 변수 설정

```env
# Database (Prisma)
DATABASE_URL=postgresql://user:password@host:5432/database

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...  # 서버 전용

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_here
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# AI Services
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
PERPLEXITY_API_KEY=your_perplexity_key  # 서버 전용
```

---

## ⚠️ 필수 규칙

### 1. 한글 소통 규칙

**최우선 규칙**: 이 프로젝트에서는 **한국어로 모든 커뮤니케이션**을 진행합니다.

- 모든 응답, 설명, 코드 주석은 한국어로 작성
- 기술 용어는 필요시 영문 병기 (예: "상태 관리(State Management)")
- 커밋 메시지는 한국어로 작성

### 2. UX Writing Guidelines

**모든 사용자 대면 텍스트는 UX Writing 가이드를 준수해야 합니다.**

**필수 규칙**:
1. **~해요체 사용**: 모든 문구에 "~해요" 어미 사용 (상황/맥락 불문)
   - ❌ ~습니다, ~했습니다, ~없습니다 → ✅ ~해요, ~했어요, ~없어요
   - ❌ 검색 중..., 로딩 중... → ✅ 검색하고 있어요, 불러오고 있어요

2. **능동적 말하기**: 최대한 능동형 문장 사용
   - ❌ 됐어요 → ✅ 했어요
   - ❌ 완료됐어요 → ✅ 완료했어요

3. **긍정적 말하기**: 부정형 최소화, 대안 제시
   - ❌ 검색 결과가 없어요 → ✅ ~찾지 못했어요 + 대안 제시

### 3. 데이터베이스 및 권한 시스템

**Prisma ORM**:
- 모든 데이터베이스 작업은 Prisma Client 사용
- 타입 안정성 보장
- `lib/prisma.ts`에서 singleton 인스턴스 사용

**Zanzibar 권한 시스템**:
- 모든 리소스 접근은 `lib/permissions.ts` 사용
- `check()`: 권한 확인
- `grant()`: 권한 부여
- `revoke()`: 권한 제거

**API Routes 보호**:
```typescript
import { auth } from '@/lib/auth'
import { check } from '@/lib/permissions'

// 1. 인증 체크
const session = await auth()
if (!session) return 401

// 2. 권한 체크
const canEdit = await check(userId, 'presentation', id, 'editor')
if (!canEdit) return 403
```

### 4. UI 라이브러리

**shadcn/ui 우선 사용**:
- TDS Mobile 제거됨
- shadcn/ui + Radix UI 사용
- Tailwind CSS 4로 스타일링
- `components/ui/` 디렉토리

---

## 📂 프로젝트 구조

```
ppt-maker-next/
├── CLAUDE.md                    # 📍 현재 문서 (허브)
├── docs/                        # 프로젝트 문서
│   ├── SPECIFICATION.md         # 기술 명세서
│   ├── Database_Architecture.md # 데이터베이스 + Zanzibar
│   ├── DESIGN_DOC.md            # 웹 서비스 전환 설계
│   ├── COST_AND_REVENUE.md      # 원가 분석 + 수익 모델
│   └── IMPLEMENTATION_HISTORY.md
│
├── app/                         # Next.js 16 App Router
│   ├── (auth)/                  # 인증 페이지
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx
│   ├── page.tsx                 # 홈
│   ├── input/page.tsx           # 텍스트 입력
│   ├── viewer/page.tsx          # 슬라이드 뷰어
│   ├── editor/page.tsx          # 편집기
│   ├── subscription/page.tsx    # 구독 관리
│   ├── credits/page.tsx         # 크레딧 관리
│   └── api/                     # API Routes
│       ├── auth/[...nextauth]/route.ts
│       ├── presentations/
│       ├── subscriptions/
│       ├── credits/
│       └── research/route.ts
│
├── components/                  # React 컴포넌트
│   ├── ui/                      # shadcn/ui 컴포넌트
│   ├── auth/                    # 인증 컴포넌트
│   ├── editor/                  # 편집기 컴포넌트
│   └── viewer/                  # 뷰어 컴포넌트
│
├── lib/                         # 유틸리티 라이브러리
│   ├── prisma.ts                # Prisma Client 싱글톤
│   ├── permissions.ts           # Zanzibar 권한 시스템
│   ├── supabase/                # Supabase 클라이언트
│   └── utils.ts
│
├── prisma/                      # Prisma ORM
│   └── schema.prisma            # 데이터베이스 스키마
│
├── services/                    # 비즈니스 로직 (AI 파이프라인)
│   ├── gemini/                  # Gemini API
│   ├── perplexity/              # Perplexity AI
│   ├── template/                # 템플릿 시스템 ⭐
│   └── slide/                   # 슬라이드 변환
│
├── store/                       # Zustand 상태
├── types/                       # TypeScript 타입
├── hooks/                       # 커스텀 Hooks
├── utils/                       # 유틸리티 함수
└── constants/                   # 상수
```

---

## 📄 프로젝트 문서 (docs/)

### 단일 참조 문서 (Single Source of Truth)

#### 1. [SPECIFICATION.md](docs/SPECIFICATION.md) - 기술 명세서
**언제 업데이트**: 아키텍처, API 설계 변경 시

- 프로젝트 개요 및 기술 스택
- 시스템 아키텍처 (웹 서비스)
- 인증 시스템 (NextAuth.js)
- 데이터베이스 스키마 (Prisma)
- 권한 시스템 (Zanzibar)
- 구독 및 크레딧 시스템
- API 설계 (웹 서비스 API)

#### 2. [Database_Architecture.md](docs/Database_Architecture.md) - 데이터베이스 & 권한
**언제 업데이트**: 데이터베이스 스키마, 권한 정책 변경 시

- 데이터베이스 스키마 (8개 테이블)
- Zanzibar 권한 시스템 구조
- 구독 및 크레딧 시스템
- API Routes & 권한 보호
- 권한 시나리오 (4가지)

#### 3. [DESIGN_DOC.md](docs/DESIGN_DOC.md) - 웹 서비스 전환 설계
**언제 업데이트**: 마이그레이션 전략 변경 시

- Apps in Toss → 웹 서비스 전환
- 기술 스택 변경 매핑
- 재사용 가능 코드 (100%)
- Phase별 구현 계획

#### 4. [COST_AND_REVENUE.md](docs/COST_AND_REVENUE.md) - 원가 분석 + 수익 모델
**언제 업데이트**: AI 모델 변경, 가격 정책 변경 시

- AI 원가 분석 (3단계 파이프라인)
- 수익 모델 (하이브리드 5가지 채널)
- 수익성 시뮬레이션

---

## 🎯 주요 개발 플로우

### 1. 새로운 API Route 추가
```
1. app/api/[endpoint]/route.ts 생성
2. NextAuth 세션 확인
3. Zanzibar 권한 체크
4. Prisma로 데이터베이스 작업
5. types/claude.md 참조 → API 타입 정의
6. docs/SPECIFICATION.md 업데이트
```

### 2. 새로운 페이지 추가
```
1. app/[page]/page.tsx 생성
2. 클라이언트 컴포넌트 여부 결정 ('use client')
3. useSession()으로 인증 상태 확인
4. components/claude.md 참조 → UI 컴포넌트 작성
5. docs/SPECIFICATION.md 업데이트
```

### 3. 데이터베이스 스키마 변경
```
1. prisma/schema.prisma 수정
2. npx prisma migrate dev --name [migration_name]
3. npx prisma generate
4. lib/permissions.ts 권한 정책 업데이트 (필요시)
5. docs/Database_Architecture.md 업데이트
```

### 4. 새로운 권한 추가
```
1. lib/permissions.ts에 relation 추가
2. prisma/schema.prisma RelationDefinition 업데이트
3. 권한 상속 구조 정의 (inheritanceMap)
4. API Routes에 권한 체크 적용
5. docs/Database_Architecture.md 업데이트
```

---

## 🧪 테스트

### 타입 체크
```bash
npx tsc --noEmit
```

### Prisma Studio (DB GUI)
```bash
npx prisma studio
```

### 전체 슬라이드 타입 테스트
[docs/TEST_PROMPT.md](docs/TEST_PROMPT.md) 참조

---

## 🔧 트러블슈팅

### Prisma Client 에러
```bash
npx prisma generate  # Prisma Client 재생성
```

### 데이터베이스 연결 실패
```bash
# DATABASE_URL 환경 변수 확인
echo $DATABASE_URL

# Supabase 대시보드에서 연결 문자열 확인
```

### NextAuth 세션 에러
```bash
# NEXTAUTH_SECRET 생성
openssl rand -base64 32

# .env.local에 추가
NEXTAUTH_SECRET=생성된값
```

### 권한 체크 실패
```typescript
// lib/permissions.ts의 check() 함수 디버깅
const canEdit = await check(userId, 'presentation', id, 'editor')
console.log('Permission check:', { userId, id, canEdit })
```

---

## 📊 프로젝트 현황

**완료된 Phase**:
- ✅ Phase 1: 템플릿 시스템 (98% 비용 절감)
- ✅ Phase 2: 기본 편집 (무제한 편집)
- ✅ Phase 3: 웹 서비스 전환 (Vercel + Supabase)
- ✅ Phase 4: 데이터베이스 & 인증 시스템

**진행 중인 Phase**:
- 🚧 Phase 5: 구독 및 크레딧 시스템 구현
- 🚧 Phase 6: 고급 편집 (순서 변경, Undo/Redo)

**상세 히스토리**: [docs/IMPLEMENTATION_HISTORY.md](docs/IMPLEMENTATION_HISTORY.md)

---

## 🔄 문서 업데이트 이력

**최근 업데이트**: 2025-11-07
- 웹 서비스 아키텍처로 전환
- NextAuth.js + Prisma + Supabase 통합
- Zanzibar 권한 시스템 구현
- 구독 및 크레딧 시스템 설계

**이전 업데이트**: 2025-11-06
- 문서 시스템을 신경망 구조로 전환
- 각 디렉토리별 claude.md 생성

---

**문서 버전**: 3.0 (웹 서비스)
**유지보수**: 이 문서는 프로젝트와 함께 살아있는 문서입니다. 주요 변경 시 업데이트해주세요.
