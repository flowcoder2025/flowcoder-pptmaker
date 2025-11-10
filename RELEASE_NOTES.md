# Release Notes - FlowCoder PPT Maker (웹 서비스)

프로젝트의 버전별 변경사항을 추적합니다.

---

## 📋 작성 규칙

### 커밋 타입별 분류
- ✨ **Features**: 새로운 기능 추가 (`feat:`)
- 🐛 **Fixes**: 버그 수정 (`fix:`)
- 🎨 **UI/UX**: 사용자 인터페이스 개선 (`style:`, `ui:`)
- 📝 **Documentation**: 문서 업데이트 (`docs:`)
- 🔧 **Technical**: 리팩토링, 빌드, 의존성 업데이트 (`refactor:`, `chore:`, `build:`)

### 버전 관리
- **[Unreleased]**: 아직 릴리즈되지 않은 변경사항
- **[Version] - YYYY-MM-DD**: 릴리즈 버전 및 날짜

---

## [Unreleased]

### ✨ Features

#### 2025-11-08
- **프로필 페이지 통계 연결 및 히스토리 다운로드 개선** (be1a329)
  - 프로필 페이지 통계 실제 데이터 연결 (총 슬라이드 수, 사용한 크레딧)
  - `/api/user/stats`: 모든 프리젠테이션 메타데이터 집계 로직 추가
  - 히스토리 페이지 다운로드 포맷 선택 다이얼로그 구현 (PDF/PPTX)
  - 뷰어 페이지와 동일한 UX 적용

### 🔧 Technical

#### 2025-11-08
- **Supabase Transaction pooler 설정 및 Prisma 최적화** (be1a329)
  - Transaction pooler (port 6543) + pgbouncer 모드 설정
  - Prisma schema에 directUrl 추가 (마이그레이션용)
  - DATABASE_URL: Transaction pooler (pgbouncer=true)
  - DIRECT_URL: Session pooler (마이그레이션용)
  - prisma.config.ts 제거 (환경 변수 로딩 간섭 해결)

### 📝 Documentation

#### 2025-11-08
- **웹 서비스 전환 전체 문서 업데이트** (19d20ee)
  - Apps in Toss 독점 앱 → 독립 웹 서비스 전환 문서화
  - CLAUDE.md: 프로젝트 타입 및 기술 스택 업데이트
  - app/: NextAuth 라우트 및 API Routes 추가
  - components/: TDS Mobile → shadcn/ui 전환 가이드
  - services/: Bedrock SDK → Supabase 데이터베이스 연동 문서
  - SPECIFICATION.md: 아키텍처 설계 업데이트
  - 불필요한 Phase Task 문서 및 iOS 테스트 가이드 제거

### 🐛 Fixes

#### 2025-11-08
- **Vercel 빌드 에러 수정 (Prisma Client 생성)** (eef7b34)
  - package.json에 postinstall 스크립트 추가
  - build 스크립트에 prisma generate 추가
  - Vercel 빌드 환경에서 Prisma Client 자동 생성

#### 2025-11-07
- **TypeScript 타입 에러 수정** (ff086b5)
  - `lib/permissions.ts`: tuples.map() 파라미터에 명시적 타입 지정
  - Vercel 빌드 에러 해결
  - 타입 안정성 개선

### ✨ Features

#### 2025-11-07
- **Phase 4-4: Zustand Store API 연동 완료** (4b570a3)

  **Subscription Store**:
  - setPlan(): API POST /api/subscriptions 연동
  - fetchSubscription(): GET /api/subscriptions로 초기 로드
  - 로컬 fallback 지원

  **Credit Store**:
  - addCredits(): API POST /api/credits 연동
  - useCredits(): API POST /api/credits/consume 연동
  - fetchBalance(): GET /api/credits로 잔액 조회
  - 서버 잔액과 동기화

  **Presentation Store**:
  - savePresentation(): POST/PUT /api/presentations 연동
  - fetchPresentations(): GET /api/presentations로 목록 조회
  - fetchPresentation(): GET /api/presentations/:id로 단일 조회
  - 로컬 저장 fallback 유지

  **History Store**:
  - 로컬 Undo/Redo 기능으로 API 연동 불필요

  ✅ 빌드 테스트 통과
  ✅ TypeScript 타입 체크 통과

---

## 과거 버전

### [1.0.0] - 2025-11-07
웹 서비스 전환 첫 릴리즈

#### ✨ Features
- AI 3단계 파이프라인 구현 (Perplexity + Gemini + 템플릿 엔진)
- 21개 슬라이드 타입 지원
- 클라이언트 템플릿 시스템 (98% 비용 절감)
- 무제한 편집 기능
- NextAuth.js 인증 (GitHub, Google OAuth)
- Supabase PostgreSQL + Prisma 데이터베이스
- Zanzibar ReBAC 권한 시스템
- 구독 시스템 (Free/Pro/Premium)
- 크레딧 시스템

#### 🎨 UI/UX
- shadcn/ui + Radix UI 기반 컴포넌트
- 반응형 디자인
- 다크 모드 지원 (향후)

#### 🔧 Technical
- Next.js 16 + React 19 + TypeScript 기반
- Zustand 상태 관리
- Vercel 배포
- Supabase 관리형 데이터베이스
- Prisma ORM

---

**문서 버전**: 1.0
**최종 수정**: 2025-11-08
