# PPT Maker - Apps in Toss 프로젝트

> **프로젝트 타입**: WebView
> **UI 라이브러리**: TDS Mobile (v2.1.2)
> **프레임워크**: Next.js 16 (App Router) + React 19
> **상위 컨텍스트**: [APPinTOSS/CLAUDE.md](../../CLAUDE.md)

---

## 📚 문서 네비게이션 (신경망 구조)

이 문서는 **허브(Hub)** 역할을 수행합니다. 각 디렉토리는 독립적인 **노드(Node)**로 작동하며, 필요한 정보를 효율적으로 찾을 수 있습니다.

### 🎯 빠른 참조

| 디렉토리 | 역할 | 문서 |
|---------|------|------|
| **app/** | Next.js 페이지 및 라우팅 | [app/CLAUDE.md](app/CLAUDE.md) |
| **components/** | React 컴포넌트 | [components/CLAUDE.md](components/CLAUDE.md) |
| **services/** | 비즈니스 로직 (AI, Storage 등) | [services/CLAUDE.md](services/CLAUDE.md) |
| **store/** | Zustand 상태 관리 | [store/CLAUDE.md](store/CLAUDE.md) |
| **types/** | TypeScript 타입 정의 | [types/CLAUDE.md](types/CLAUDE.md) |
| **docs/** | 프로젝트 문서 | [아래 참조](#-프로젝트-문서-docs) |

### 📖 작업별 문서 선택 가이드

**페이지 개발 시** → [app/CLAUDE.md](app/CLAUDE.md)
**컴포넌트 개발 시** → [components/CLAUDE.md](components/CLAUDE.md)
**AI 서비스 개발 시** → [services/CLAUDE.md](services/CLAUDE.md)
**상태 관리 개발 시** → [store/CLAUDE.md](store/CLAUDE.md)
**타입 정의 시** → [types/CLAUDE.md](types/CLAUDE.md)
**아키텍처 이해 시** → [docs/SPECIFICATION.md](docs/SPECIFICATION.md)
**비용/수익 분석 시** → [docs/COST_AND_REVENUE.md](docs/COST_AND_REVENUE.md)
**구현 히스토리 확인 시** → [docs/IMPLEMENTATION_HISTORY.md](docs/IMPLEMENTATION_HISTORY.md)
**테스트 시** → [docs/TEST_PROMPT.md](docs/TEST_PROMPT.md)
**배포 시** → [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md)

---

## 🌟 프로젝트 개요

PPT Maker in Toss는 텍스트 입력으로 AI 기반 프리젠테이션을 생성하는 앱인토스(Apps in Toss) 미니앱입니다.

### 핵심 기술 스택
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **AI**: Google Gemini API + Perplexity AI (3단계 파이프라인)
- **State**: Zustand
- **Styling**: Tailwind CSS 4 + TDS Colors
- **Platform**: 앱인토스 Bedrock SDK (향후 연동 예정)

### AI 생성 플로우 (3단계 파이프라인)

```
사용자 입력
  → 1️⃣ 자료 조사 (Perplexity - 선택)
  → 2️⃣ 콘텐츠 생성 + JSON (Gemini Flash/Pro - Parser 제거로 8원 절감)
  → 3️⃣ 템플릿 렌더링 (클라이언트 엔진 - 0원)
```

**핵심 성과**:
- ✅ **비용 98% 절감**: Parser + HTML 생성 API 제거 (100원 → 2원)
- ✅ **Parser 통합**: 콘텐츠 생성 단계에서 UnifiedPPTJSON 직접 생성 (8원 절감)
- ✅ **무제한 편집**: 클라이언트 템플릿 엔진 (재생성 비용 0원)
- ✅ **21개 슬라이드 타입**: 완전 지원

---

## 🚀 빠른 시작

### 개발 명령어

```bash
npm run dev          # 개발 서버 실행 (http://localhost:3000)
npm run build        # 프로덕션 빌드
npm start            # 프로덕션 서버 실행
npm run lint         # ESLint 검사
npx tsc --noEmit     # TypeScript 타입 체크
```

### 환경 변수 설정

```env
# Gemini API Key (클라이언트 노출 가능)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key_here

# Perplexity API Key (서버 전용 - 노출 금지)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
```

---

## ⚠️ 필수 규칙

### 1. 한글 소통 규칙

**최우선 규칙**: 이 프로젝트에서는 **한국어로 모든 커뮤니케이션**을 진행합니다.

- 모든 응답, 설명, 코드 주석은 한국어로 작성
- 기술 용어는 필요시 영문 병기 (예: "상태 관리(State Management)")
- 커밋 메시지는 한국어로 작성

### 2. UX Writing Guidelines

**모든 사용자 대면 텍스트는 Apps in Toss UX Writing 가이드를 준수해야 합니다.**

**필수 규칙**:
1. **~해요체 사용**: 모든 문구에 "~해요" 어미 사용 (상황/맥락 불문)
   - ❌ ~습니다, ~했습니다, ~없습니다 → ✅ ~해요, ~했어요, ~없어요
   - ❌ 검색 중..., 로딩 중... → ✅ 검색하고 있어요, 불러오고 있어요

2. **능동적 말하기**: 최대한 능동형 문장 사용
   - ❌ 됐어요 → ✅ 했어요
   - ❌ 완료됐어요 → ✅ 완료했어요

3. **긍정적 말하기**: 부정형 최소화, 대안 제시
   - ❌ 검색 결과가 없어요 → ✅ ~찾지 못했어요 + 대안 제시

**참조**: [../../docs/03-design/03-ux-writing.md](../../docs/03-design/03-ux-writing.md)

### 3. 프로젝트 타입 주의사항

- ✅ **WebView 프로젝트**: TDS Mobile 사용
- ❌ **React Native 라이브러리 금지**: @toss/tds-react-native 절대 사용 금지

**중요**: WebView ↔ React Native 간 UI 라이브러리 혼용 시 런타임 오류 발생

### 4. apps-in-toss 스킬 활용 (필수)

**이 프로젝트를 개발할 때는 반드시 `apps-in-toss` 스킬을 활용해야 합니다.**

```bash
# 스킬 활성화 방법
apps-in-toss
```

**제공 내용**:
- Bedrock SDK API 가이드 (94개 API, 17개 카테고리)
- TDS Mobile 디자인 시스템 (67+ 컴포넌트)
- 공식 예제 패턴 (27개 프로젝트)
- 권한 처리, 인앱 결제, 게임 센터 연동

---

## 📂 프로젝트 구조

```
ppt-maker-in-toss/
├── CLAUDE.md                    # 📍 현재 문서 (허브)
├── docs/                        # 프로젝트 문서 (읽기/쓰기)
│   ├── SPECIFICATION.md         # 기술 명세서
│   ├── COST_AND_REVENUE.md      # 원가 분석 + 수익 모델
│   ├── IMPLEMENTATION_HISTORY.md # Phase 1~4 구현 히스토리
│   └── TEST_PROMPT.md           # 21개 타입 테스트 프롬프트
│
├── app/                         # Next.js 16 App Router
│   └── claude.md                # 페이지/라우팅 가이드
├── components/                  # React 컴포넌트
│   └── claude.md                # 컴포넌트 작성 가이드
├── services/                    # 비즈니스 로직
│   └── claude.md                # AI/Storage/템플릿 서비스 가이드
├── store/                       # Zustand 상태 관리
│   └── claude.md                # Store 패턴 가이드
├── types/                       # TypeScript 타입
│   └── claude.md                # 타입 정의 가이드
│
├── hooks/                       # 커스텀 React Hooks
├── utils/                       # 유틸리티 함수
├── constants/                   # 상수 정의
└── public/                      # 정적 파일
```

---

## 📄 프로젝트 문서 (docs/)

### 단일 참조 문서 (Single Source of Truth)

docs/ 폴더의 문서들은 **쓰기 권한이 있는 살아있는 문서**입니다. 코드 변경 시 해당 문서를 함께 업데이트해야 합니다.

#### 1. [SPECIFICATION.md](docs/SPECIFICATION.md) - 기술 명세서
**언제 업데이트**: 아키텍처, 데이터 구조, API 설계 변경 시

- 프로젝트 개요 및 기술 스택
- 시스템 아키텍처
- 템플릿 시스템 설계 (87% 비용 절감)
- API 설계 (Gemini, Perplexity, Bedrock SDK)
- 디자인 시스템 (TDS 색상 팔레트)

#### 2. [COST_AND_REVENUE.md](docs/COST_AND_REVENUE.md) - 원가 분석 + 수익 모델
**언제 업데이트**: AI 모델 변경, 가격 정책 변경 시

- AI 원가 분석 (4단계 파이프라인)
- 수익 모델 (하이브리드 5가지 채널)
- 수익성 시뮬레이션
- 비즈니스 전략

#### 3. [IMPLEMENTATION_HISTORY.md](docs/IMPLEMENTATION_HISTORY.md) - 구현 히스토리
**언제 업데이트**: Phase 완료, 주요 기능 구현 시

- Phase 1: 템플릿 시스템 (완료 ✅)
- Phase 2: 편집 기능 (완료 ✅)
- Phase 3: 고급 편집 (준비 중)
- Phase 4: 수익화 (준비 중)

#### 4. [TEST_PROMPT.md](docs/TEST_PROMPT.md) - 테스트 프롬프트
**언제 업데이트**: 슬라이드 타입 추가/변경 시

- 21개 슬라이드 타입 전체 테스트 프롬프트
- 사용 방법 및 기대 결과

### 문서 업데이트 규칙

**🔴 필수 업데이트 시점**:
- 새로운 서비스 추가 시 → `SPECIFICATION.md` 업데이트
- AI 모델 변경 시 → `COST_AND_REVENUE.md` 업데이트
- Phase 완료 시 → `IMPLEMENTATION_HISTORY.md` 업데이트
- 슬라이드 타입 변경 시 → `TEST_PROMPT.md` 업데이트

**🟡 권장 업데이트 시점**:
- 주요 리팩토링 후
- 성능 최적화 완료 후
- 새로운 디자인 패턴 도입 후

---

## 🔗 상위 문서 참조

### Apps in Toss 플랫폼 문서

1. **[상위 컨텍스트](../../CLAUDE.md)** - APPinTOSS 전체 구조 이해
2. **[빠른 참조](../../QUICK_REFERENCE.md)** - API 빠른 검색
3. **[플랫폼 이해](../../docs/01-intro/claude.md)** - Apps in Toss 플랫폼 소개
4. **[개발 환경](../../docs/04-development/claude.md)** - WebView 개발 가이드
5. **[Bedrock SDK](../../docs/reference/bedrock/claude.md)** - API 레퍼런스 (94개)
6. **[TDS Mobile](../../docs/reference/tds-mobile/claude.md)** - UI 컴포넌트 (67개)
7. **[공식 예제](../../example/claude.md)** - 예제 프로젝트 (20+개)

---

## 🎯 주요 개발 플로우

### 1. 새로운 페이지 추가
```
1. app/claude.md 참조 → 페이지 라우팅 규칙 확인
2. app/[new-page]/page.tsx 생성
3. types/claude.md 참조 → 필요한 타입 정의
4. components/claude.md 참조 → 컴포넌트 작성
5. docs/SPECIFICATION.md 업데이트
```

### 2. 새로운 AI 서비스 추가
```
1. services/claude.md 참조 → 서비스 구조 확인
2. services/[new-service]/ 생성
3. types/claude.md 참조 → API 타입 정의
4. docs/SPECIFICATION.md 업데이트
5. docs/COST_AND_REVENUE.md 비용 분석 추가
```

### 3. 새로운 상태 관리 추가
```
1. store/claude.md 참조 → Store 패턴 확인
2. store/[new-store].ts 생성
3. types/claude.md 참조 → Store 타입 정의
4. docs/SPECIFICATION.md 업데이트
```

### 4. 새로운 컴포넌트 추가
```
1. components/claude.md 참조 → 컴포넌트 규칙 확인
2. components/[category]/[Component].tsx 생성
3. UX Writing 규칙 준수
4. TDS Mobile 우선 사용
```

---

## 🧪 테스트

### 전체 슬라이드 타입 테스트
[docs/TEST_PROMPT.md](docs/TEST_PROMPT.md)의 프롬프트를 복사하여 PPT Maker에서 테스트

### 타입 체크
```bash
npx tsc --noEmit
```

---

## 🔧 트러블슈팅

### 문서를 찾을 수 없을 때
1. 이 파일(CLAUDE.md)의 [문서 네비게이션](#-문서-네비게이션-신경망-구조) 참조
2. 각 디렉토리의 claude.md로 이동
3. 필요한 정보 확인

### 규칙을 잊었을 때
- **UX Writing**: 이 파일의 [필수 규칙](#-필수-규칙) 섹션 참조
- **타입 작성**: [types/claude.md](types/claude.md) 참조
- **컴포넌트 작성**: [components/claude.md](components/claude.md) 참조
- **Store 패턴**: [store/claude.md](store/claude.md) 참조

### 아키텍처를 이해하고 싶을 때
[docs/SPECIFICATION.md](docs/SPECIFICATION.md) 참조

---

## 📊 프로젝트 현황

**완료된 Phase**:
- ✅ Phase 1: 템플릿 시스템 (87% 비용 절감)
- ✅ Phase 2: 기본 편집 (무제한 편집)

**진행 중인 Phase**:
- 🚧 Phase 3: 고급 편집 (순서 변경, Undo/Redo)
- 🚧 Phase 4: 수익화 (구독, IAP)

**상세 히스토리**: [docs/IMPLEMENTATION_HISTORY.md](docs/IMPLEMENTATION_HISTORY.md)

---

## 🔄 문서 업데이트 이력

**최근 업데이트**: 2025-11-06
- 문서 시스템을 신경망 구조로 전환
- 각 디렉토리별 claude.md 생성
- docs/ 폴더 문서 통합 및 쓰기 권한 명시
- 허브-노드 구조로 효율적인 참조 시스템 구축

**이전 업데이트**: 2025-10-28
- 표준 계층적 참조 시스템 적용
- 프로젝트 타입 명시
- 기술 스택 검증 추가

---

**문서 버전**: 2.0 (신경망 구조)
**유지보수**: 이 문서는 프로젝트와 함께 살아있는 문서입니다. 주요 변경 시 업데이트해주세요.
