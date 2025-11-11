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
| **app/viewer/** | 슬라이드 뷰어 페이지 (레이아웃 규칙) | [app/viewer/claude.md](app/viewer/claude.md) ⭐ |
| **components/** | React 컴포넌트 (shadcn/ui) | [components/claude.md](components/claude.md) |
| **services/** | 비즈니스 로직 (AI 파이프라인) | [services/claude.md](services/claude.md) |
| **store/** | Zustand 상태 관리 | [store/claude.md](store/claude.md) |
| **types/** | TypeScript 타입 정의 | [types/claude.md](types/claude.md) |
| **lib/** | Prisma, Supabase, Zanzibar | - |
| **prisma/** | 데이터베이스 스키마 | - |
| **docs/** | 프로젝트 문서 | [아래 참조](#-프로젝트-문서-docs) |

### 📖 작업별 문서 선택 가이드

**페이지/API 개발 시** → [app/claude.md](app/claude.md)
**뷰어 페이지 레이아웃 수정 시** → [app/viewer/claude.md](app/viewer/claude.md) ⭐ 반응형 규칙
**UI 컴포넌트 개발 시** → [components/claude.md](components/claude.md)
**AI 서비스 개발 시** → [services/claude.md](services/claude.md)
**상태 관리 개발 시** → [store/claude.md](store/claude.md)
**타입 정의 시** → [types/claude.md](types/claude.md)
**아키텍처 이해 시** → [docs/SPECIFICATION.md](docs/SPECIFICATION.md)
**데이터베이스 스키마** → [docs/Database_Architecture.md](docs/Database_Architecture.md)
**웹 서비스 전환 가이드** → [docs/DESIGN_DOC.md](docs/DESIGN_DOC.md)
**릴리즈 노트 확인 시** → [RELEASE_NOTES.md](RELEASE_NOTES.md)

---

## 🌟 프로젝트 개요

FlowCoder PPT Maker는 텍스트 입력으로 AI 기반 프리젠테이션을 생성하는 **멀티 배포 환경 지원** 웹 서비스입니다.

### 배포 환경

**독립 서비스 (Standalone)**:
- 플랫폼: Vercel 독립 배포
- UI 텍스트: 비즈니스 용어 ("로그인", "회원가입", "저장")
- 환경 변수: `NEXT_PUBLIC_DEPLOYMENT_ENV=standalone`

**앱인토스 (Apps in Toss)**:
- 플랫폼: Apps in Toss 플랫폼 배포
- UI 텍스트: 해요체 ("로그인해요", "회원가입해요", "저장해요")
- 환경 변수: `NEXT_PUBLIC_DEPLOYMENT_ENV=apps-in-toss`

**공통 사항**:
- 디자인 시스템: Tailwind CSS 4 기반 (동일)
- 비즈니스 로직: 플랫폼 독립적 (constants, services, types)
- 데이터베이스: Supabase PostgreSQL (동일)

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

### 0. 작업 범위 및 코드 보호 (최우선)

**🔒 PPT 생성 관련 코드는 읽기 전용입니다.**

현재 프로젝트에서는 **UI 시스템만 작업**합니다. 다음 영역은 **읽기 권한만** 있고 **쓰기 권한이 없습니다**:

**📖 읽기 전용 (Read-Only) 영역**:
- `services/gemini/` - Gemini API 통합
- `services/perplexity/` - Perplexity AI 통합
- `services/template/` - 템플릿 시스템 (98% 비용 절감 핵심)
- `services/slide/` - 슬라이드 변환 엔진
- `types/slide.ts` - 슬라이드 타입 정의 (21개 슬라이드 타입)

**✅ 작업 허용 영역**:
- `components/` - React UI 컴포넌트 (shadcn/ui)
- `components/ui/` - shadcn/ui 기본 컴포넌트
- `app/*/page.tsx` - Next.js 페이지 (UI 부분만)
- `app/api/` - API Routes (UI 관련만)
- 스타일링 및 레이아웃 개선
- UX/UI 개선 작업

**🚫 절대 금지 사항**:
- ❌ PPT 생성 로직 수정 (services/)
- ❌ AI 파이프라인 변경 (gemini, perplexity)
- ❌ 템플릿 시스템 수정 (template/)
- ❌ 슬라이드 타입 변경 (types/slide.ts)
- ❌ 슬라이드 변환 로직 수정 (slide/)

**이유**: PPT 생성 시스템은 완성되었으며, 비용 최적화(98% 절감)와 안정성이 검증되었습니다. 현재는 UI/UX 개선에만 집중합니다.

### 1. 한글 소통 규칙

**최우선 규칙**: 이 프로젝트에서는 **한국어로 모든 커뮤니케이션**을 진행합니다.

- 모든 응답, 설명, 코드 주석은 한국어로 작성
- 기술 용어는 필요시 영문 병기 (예: "상태 관리(State Management)")
- 커밋 메시지는 한국어로 작성

### 2. UX Writing Guidelines (배포 환경별)

**모든 사용자 대면 텍스트는 배포 환경에 따라 분기합니다.**

**환경별 텍스트 규칙**:
- **독립 서비스 (standalone)**: 비즈니스 용어 (간결하고 전문적)
  - 예: "로그인", "회원가입", "저장", "로딩 중", "생성 중"
- **앱인토스 (apps-in-toss)**: 해요체 (친근하고 대화형)
  - 예: "로그인해요", "회원가입해요", "저장해요", "불러오고 있어요", "생성하고 있어요"

**구현 방법**:
```typescript
// lib/text-config.ts에서 환경별 텍스트 관리
import { BUTTON_TEXT } from '@/lib/text-config';

// 사용 예시
<Button>{BUTTON_TEXT.login}</Button>  // standalone: "로그인", apps-in-toss: "로그인해요"
<Button>{BUTTON_TEXT.save}</Button>   // standalone: "저장", apps-in-toss: "저장해요"
```

**앱인토스 환경 추가 규칙** (NEXT_PUBLIC_DEPLOYMENT_ENV=apps-in-toss인 경우):
1. **~해요체 사용**: 모든 문구에 "~해요" 어미 사용
   - "로그인해요", "저장했어요", "불러오고 있어요"

2. **능동적 말하기**: 능동형 문장 사용
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

### 4. UI 라이브러리 및 디자인 시스템

**Tailwind CSS 4 우선 사용** (필수):
- ✅ Tailwind CSS 클래스 사용 (최우선 권장)
- ✅ shadcn/ui + Radix UI 컴포넌트 사용
- ✅ `app/globals.css`에 정의된 CSS 변수 사용
- ❌ 인라인 스타일 지양 (특수한 경우만)
- ❌ @toss/tds-colors 사용 금지 (제거됨)

**색상 시스템**:
```typescript
// ✅ 권장: Tailwind CSS 클래스
<Button className="bg-primary text-primary-foreground">버튼</Button>

// ✅ 권장: shadcn/ui variant
<Button variant="default">버튼</Button>

// ⚠️ 특수한 경우만: Arbitrary values
<div className="bg-[hsl(217_91%_60%)]">...</div>

// ❌ 지양: 인라인 스타일
<div style={{ backgroundColor: '#3182F6' }}>...</div>
```

**디자인 토큰** (app/globals.css):
- `--color-primary`: hsl(217 91% 60%) - Toss Blue #3182F6
- `--color-secondary`: hsl(210 40% 96.1%)
- `--color-background`: hsl(0 0% 100%)
- `--color-text`: hsl(222.2 84% 4.9%)

**플랫폼 독립성**:
- 색상 시스템은 독립 서비스와 앱인토스 모두 동일
- UI 텍스트만 환경별로 분기 (`lib/text-config.ts`)

### 5. 릴리즈 노트 업데이트 규칙 (필수)

**모든 커밋 시 RELEASE_NOTES.md를 업데이트해야 합니다.**

#### 워크플로우 (한 번의 푸시로 완료)

```bash
# 1. 작업 완료 후 커밋
git add [변경된 파일들]
git commit -m "fix: 문제 해결"

# 2. RELEASE_NOTES.md 수동 업데이트 (커밋 해시는 생략 또는 PENDING)
# 에디터로 RELEASE_NOTES.md 열어서 변경사항 추가

# 3. 릴리즈 노트를 같은 커밋에 포함
git add RELEASE_NOTES.md
git commit --amend --no-edit

# 4. 푸시 (한 번만)
git push origin main

# 끝! 추가 커밋/푸시 없음
```

#### 릴리즈 노트 형식

1. **커밋 타입 분류**:
   - `feat:` → ✨ Features
   - `fix:` → 🐛 Fixes
   - `style:`, `ui:` → 🎨 UI/UX
   - `docs:` → 📝 Documentation
   - `refactor:`, `chore:`, `build:` → 🔧 Technical

2. **형식** (커밋 해시는 생략 가능):
```markdown
### [카테고리 아이콘] [카테고리명]

#### YYYY-MM-DD
- **[변경사항 요약]**
  - 세부 내용 1
  - 세부 내용 2
```

3. **추가 위치**: `[Unreleased]` 섹션의 해당 카테고리
4. **날짜 헤더**: 당일 첫 커밋인 경우 `#### YYYY-MM-DD` 추가
5. **커밋 해시**: 생략 (직전 변경사항은 해시 없어도 알아볼 수 있음, 다음 작업 시 반영됨)

**예시**:
```markdown
## [Unreleased]

### ✨ Features

#### 2025-11-08
- **결제 시스템 통합**
  - Stripe 결제 연동
  - 구독 자동 갱신
```

**참조**: [RELEASE_NOTES.md](RELEASE_NOTES.md)

### 6. 공통 코드 마이그레이션 규칙 (필수)

**공통 코드 영역(`services/`, `types/`, `constants/`) 변경 시 MIGRATION_QUEUE.md를 업데이트해야 합니다.**

**대상 영역**:
- `services/gemini/`, `services/perplexity/` - AI 파이프라인
- `services/template/` - 템플릿 시스템
- `services/slide/` - 슬라이드 변환
- `types/` - TypeScript 타입 정의
- `constants/design.ts` - 디자인 시스템

**업데이트 절차**:

1. **개발 및 커밋 완료 후**:
```markdown
# ../MIGRATION_QUEUE.md의 [📋 대기 중 (Pending)] 섹션에 추가

### [카테고리] 기능명

- **소스**: ppt-maker-next
- **타겟**: ppt-maker-in-toss
- **영역**: services/gemini/
- **소스 커밋**: (7자리 해시)
- **날짜**: YYYY-MM-DD
- **설명**: 변경 내용 요약

**변경 상세**:
- 구체적인 변경 내용

**마이그레이션 체크리스트**:
- [ ] 코드 파일 복사
- [ ] 의존성 확인
- [ ] 타입 호환성 검증
- [ ] 테스트 작성 및 실행
- [ ] 문서 업데이트
- [ ] 타겟 프로젝트 커밋
```

2. **마이그레이션 완료 시**:
   - 체크리스트 모두 완료
   - 항목을 `[✅ 완료 (Completed)]` 섹션으로 이동
   - 완료 날짜 및 타겟 커밋 해시 기록

**예시**:
```bash
# 1. 공통 코드 개발 및 커밋
git commit -m "feat: 새로운 SlideType 추가"

# 2. MIGRATION_QUEUE.md에 항목 추가
vim ../MIGRATION_QUEUE.md

# 3. RELEASE_NOTES.md에도 기록
vim RELEASE_NOTES.md
```

**참조**: [../MIGRATION_QUEUE.md](../MIGRATION_QUEUE.md)

---

## 📝 작업 관리

**모든 복잡한 작업은 TASK.md를 생성하여 체계적으로 관리합니다.**

### TASK.md 사용 시나리오

**다음 경우에 TASK.md를 생성합니다**:
- 3개 이상의 Phase로 구성된 작업
- 여러 파일을 수정해야 하는 작업 (>5개)
- 단계별 검증이 필요한 작업
- 장시간 소요될 것으로 예상되는 작업 (>1시간)

### TASK.md 구조

```markdown
# [작업명] (YYYY-MM-DD)

## 📋 작업 개요
[작업에 대한 간략한 설명]

## 🎯 Phase 1: [Phase 제목]
**목표**: [이 Phase의 목표]

### 체크리스트
- [ ] 작업 1
- [ ] 작업 2
- [ ] 작업 3

**파일**: [수정할 파일 목록]
**변경 사항**: [구체적인 변경 내용]

## 📝 작업 진행 상황
### Phase 1: [제목]
- [ ] 시작
- [ ] 진행 중
- [ ] 완료
- [ ] 테스트 완료

[추가 Phase들...]

## 🔍 테스트 체크리스트
- [ ] 테스트 항목 1
- [ ] 테스트 항목 2

## 📊 예상 소요 시간
| Phase | 예상 시간 | 실제 시간 |
|-------|----------|----------|
| Phase 1 | XX분 | - |
```

### TodoWrite 도구 연동

**실시간 진행상황 추적**:
1. Phase 시작 시 TodoWrite로 todo 생성
2. Phase 완료 시 즉시 상태 업데이트
3. 항상 하나의 Phase만 `in_progress` 상태 유지

**예시**:
```typescript
TodoWrite([
  { content: "Phase 1: 네비게이션바 아이콘 개선", status: "in_progress", activeForm: "네비게이션바 아이콘 개선 중" },
  { content: "Phase 2: 버튼 호버 효과 통일", status: "pending", activeForm: "버튼 호버 효과 통일 작업 중" },
  { content: "Phase 3: CTA 버튼 크기 조정", status: "pending", activeForm: "CTA 버튼 크기 조정 중" }
])
```

### CLAUDE.md 업데이트

**작업 완료 후 필수 업데이트**:
- 새로운 규칙이나 패턴 추가
- 작업 관리 프로세스 개선사항 반영
- 참조할 만한 예시 추가

### 작업 흐름 (Workflow)

1. **계획 (Planning)**
   - 작업 요구사항 분석
   - Phase 단위로 분해
   - TASK.md 생성

2. **실행 (Execution)**
   - Phase별로 순차 진행
   - TodoWrite로 실시간 추적
   - 각 Phase 완료 시 체크리스트 업데이트

3. **검증 (Validation)**
   - Phase 완료 후 즉시 테스트
   - 에러 발생 시 즉시 수정
   - 다음 Phase로 진행 전 확인

4. **문서화 (Documentation)**
   - TASK.md 최종 업데이트
   - CLAUDE.md에 새로운 패턴 추가
   - RELEASE_NOTES.md 업데이트

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
