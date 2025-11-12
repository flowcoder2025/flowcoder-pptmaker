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

#### 2025-11-12
- **PortOne V2 결제 시스템 통합 완료 (Phase 5)** (1c8b542)
  - Phase 5-1: usePortOnePayment 커스텀 훅 생성
    - PortOne Browser SDK V2 통합
    - 5개 결제 채널 지원 (토스페이, 카카오페이 2종, 이니시스 2종)
    - 결제 요청 → SDK 팝업 → 검증 플로우 구현
  - Phase 5-2: 구독 페이지 결제 버튼 추가
    - 채널 선택 다이얼로그 구현
    - 결제 플로우 통합 (Pro/Premium 요금제)
    - 결제 결과 페이지로 리다이렉트
  - Phase 5-3: 크레딧 페이지 충전 버튼 추가
    - 채널 선택 다이얼로그 구현
    - 크레딧 구매 플로우 통합 (10/50/100/500 크레딧)
    - 결제 결과 페이지로 리다이렉트
  - Phase 5-4: 결제 결과 페이지 생성
    - 성공/실패 상태별 UI 구현
    - 결제 정보 조회 API (GET /api/payments/[id])
    - 구독/크레딧 정보 표시
    - 영수증 링크 제공

- **구독 취소 기능에 커스텀 모달 적용** (3774360)
  - browser confirm() 팝업을 자체 모달로 교체
  - AlertTriangle 아이콘으로 경고 표시 (노란색 테마)
  - 구독 취소 정책 안내 문구 추가 (현재 기간까지 사용 가능)
  - 히스토리 페이지 삭제 모달 패턴 참조
  - 일관된 UX: 백드롭 클릭 닫기, X 버튼, 2-button 레이아웃

#### 2025-11-11
- **히스토리 페이지에 슬라이드 썸네일 미리보기 추가**
  - Intersection Observer로 lazy loading 구현
  - iframe으로 첫 슬라이드 실시간 렌더링
  - 0.237 scale로 카드 크기에 최적화
  - sandbox 및 pointerEvents로 보안 강화
  - 슬라이드 없으면 이모지 placeholder 표시
  - 성능 최적화: 카드가 화면에 보일 때만 렌더링

### 🎨 UI/UX

#### 2025-11-12
- **결제 채널 선택 UI를 modern grid card 레이아웃으로 개선** (2ea8b51)
  - 구독/크레딧 페이지 Dialog 디자인 전면 개선
  - 레이아웃: 세로 Button 리스트 → 2-column responsive grid
  - 브랜드 색상 gradient 배경 적용 (토스: blue, 카카오: yellow, 이니시스: gray)
  - 대형 emoji 아이콘 추가 (💳, 💛, 🔄, 🏦)
  - Hover 효과: scale-105, border 색상 변경, shadow 강화
  - 정기 결제 옵션에 배지 추가
  - 불필요한 기술 정보 제거 (PG provider, MID)
  - Dialog description 단순화
  - 사용자 피드백 반영: 심플하고 모던한 디자인으로 변경

#### 2025-11-11
- **네비게이션 바 재구성으로 사용자 경험 개선**
  - 메인 nav 바: 핵심 기능 중심 재배치
    - 구독, 크레딧 링크 제거
    - 히스토리 링크 추가 (내 프리젠테이션 → 히스토리로 이름 변경)
  - 프로필 드롭다운 메뉴: 계정 관련 기능 그룹화
    - 내 프리젠테이션 링크 제거
    - 구독 링크 추가 (Star 아이콘)
    - 크레딧 링크 추가 (Gem 아이콘)
  - UX Writing 규칙 적용: 동작 버튼에 ~해요체 사용
    - 로그인, 회원가입, 로그아웃 버튼 텍스트 개선
  - 더 나은 정보 아키텍처: 자주 사용하는 기능(히스토리)은 메인 nav, 계정 설정(구독, 크레딧)은 드롭다운

### 🐛 Fixes

#### 2025-11-12
- **Prisma 연결 풀 설정 추가로 P1017 에러 해결** (0af4141)
  - lib/prisma.ts에 connection_limit=20, pool_timeout=20 설정
  - 프로필 페이지 /api/user/stats의 6개 병렬 쿼리 에러 해결
  - H1 브랜치 머지 후 데이터베이스 스키마 동기화 완료
  - "Server has closed the connection" 에러 완전히 해결

- **Profile 페이지 stats API 쿼리 최적화** (a632c88)
  - 병렬 쿼리 수 6개 → 4개로 감소 (33% 연결 풀 부담 감소)
  - Promise.all → Promise.allSettled로 변경 (부분 실패 허용)
  - 제거된 쿼리: allPresentations (전체 프리젠테이션), creditTransactions (전체 크레딧 거래)
  - totalSlides 계산 변경: 최근 3개 프리젠테이션 슬라이드 수만 집계
  - creditsUsed 반환값: 0 (placeholder, 향후 구현 예정)
  - 실패한 쿼리 로깅 추가 (디버깅 용이성 개선)
  - 안정성 개선: 부분 실패 시에도 페이지 표시 가능

#### 2025-11-11
- **Geist 폰트 로딩 에러 해결**
  - Geist, Geist_Mono 폰트 제거
  - 시스템 폰트 사용으로 변경
  - 빌드 에러 해결 및 테스트 통과 확인

- **GET /api/presentations에서 slideData 반환 누락 수정**
  - select에 slideData 추가
  - 히스토리 페이지 썸네일 렌더링 문제 해결
  - 빌드 테스트 통과 확인

- **크레딧 정책 완전 적용 및 차감 로직 개선**
  - Flash 모델 + 조사 안함 = 0 크레딧 (무료)
  - Flash 모델 + 빠른 조사 = 0 크레딧 (무료)
  - Flash 모델 + 심층 조사 = 40 크레딧
  - Pro 모델 + 조사 안함 = 50 크레딧
  - Pro 모델 + 빠른 조사 = 50 크레딧
  - Pro 모델 + 심층 조사 = 90 크레딧 (50 + 40)
  - 크레딧 차감 금액 동적 계산 (useProContentModel + researchMode)
  - GenerationHistory에 실제 사용한 크레딧 기록
  - 상세한 설명 메시지 추가 (어떤 옵션으로 몇 크레딧 사용했는지)
  - 크레딧 부족 시 필요한 크레딧 수 명확히 표시

### ✨ Features

#### 2025-11-11
- **크레딧 시스템 유효기간 관리 및 우선순위 기반 소모 로직 구현**
  - 크레딧 타입별 유효기간 설정:
    - FREE/PURCHASE: 영구 (expiresAt = null)
    - SUBSCRIPTION: 30일 자동 설정
    - EVENT: 설정 가능 (expiresInDays 파라미터)
  - 우선순위 기반 크레딧 소모: FREE → EVENT → SUBSCRIPTION → PURCHASE
  - 만료된 크레딧 실시간 필터링 (자동 제외)
  - 타입별 크레딧 잔액 조회 (balanceByType)
  - 7일 이내 만료 예정 크레딧 조회 (expiringCredits)
  - 구독 생성 시 자동 크레딧 지급 (PRO 플랜: 490 크레딧, 30일 유효)
  - 프리젠테이션 생성 시 크레딧 차감 (1 크레딧)
  - Prisma 스키마 업데이트: sourceType, expiresAt 필드 추가
  - TypeScript 타입 정의 (types/credits.ts)
  - 크레딧 유틸리티 함수 (lib/credits.ts)
  - API 엔드포인트:
    - GET /api/credits: 타입별 잔액 및 만료 예정 크레딧 조회
    - POST /api/credits/consume: 우선순위 기반 크레딧 사용
    - POST /api/credits/grant: 크레딧 지급 (유효기간 설정)
    - POST /api/subscriptions: 구독 생성 및 크레딧 자동 지급

- **사용자 지정 슬라이드 분량 설정 기능**
  - 슬라이더로 원하는 슬라이드 수 조절 가능 (10-40장 범위)
  - Flash 모델: 예상 슬라이드 수 자동 표시 (~목표 * 1.2)
  - Pro 모델: 예상 슬라이드 수 자동 표시 (~목표)
  - ±2-3장 오차 경고 문구 추가
  - Gemini 프롬프트에 사용자 설정값 동적 반영
  - 슬라이더 가시성 개선 (더 큰 손잡이, 진한 색상, 호버 효과)
  - shadcn/ui Slider 컴포넌트 통합
  - **플랜별 슬라이드 분량 제한 적용**:
    - Free: 5-10장, Pro: 5-20장, Premium: 5-50장
    - 플랜 변경 시 슬라이더 값 자동 조정
    - UI 레벨에서 플랜별 검증 처리 (useEffect)

- **멀티모달 슬라이드 생성 기능 (PDF 및 이미지 첨부)**
  - PDF와 이미지 파일을 첨부하여 슬라이드 생성 가능
  - 플랜별 파일 개수 제한: Free(1개), Pro(3개), Premium(5개)
  - 플랜별 파일 크기 제한: Free(5MB), Pro(10MB), Premium(20MB)
  - 지원 파일 형식: PDF, JPG, PNG, GIF, WebP
  - Base64 인코딩으로 파일 전송
  - Gemini Multimodal API와 통합하여 첨부 파일 내용 분석
  - FileUploader 컴포넌트: 파일 선택, 검증, 미리보기, 제거 기능
  - 실시간 파일 크기 표시 (KB/MB 자동 변환)
  - 에러 메시지: UX Writing 가이드 준수 (~해요체)
  - API 엔드포인트: POST /api/generate (멀티모달 생성)

- **Perplexity AI 비용 최적화 (3000자 제한)**
  - System prompt에 구조화된 3000자 제한 추가
  - 5가지 섹션 구조: 개요(300자), 트렌드(800자), 통계(800자), 사례(800자), 요약(300자)
  - max_tokens 4000 → 2000으로 감소
  - **Sonar 비용 27% 절감**: ₩4 → ₩3 (₩1 절감)
  - **Reasoning 비용 44% 절감**: ₩28.6 → ₩15.9 (₩12.7 절감)
  - 빠른 조사 조합: ₩4 → ₩3
  - 깊은 조사 조합: ₩53 → ₩41
  - services/gemini/content-generator.ts에서 5000자 축약 로직 제거

- **텍스트 입력 임시저장 기능 (서버 기반)**
  - 사용자가 입력 페이지에서 작성 중인 텍스트가 페이지 이탈 시에도 보존돼요
  - Prisma Draft 모델 추가 (userId @unique, content @db.Text)
  - API 엔드포인트: GET /api/drafts (조회), POST /api/drafts (저장), DELETE /api/drafts (삭제)
  - 실시간 자동 저장: 텍스트 변경 1초 후 서버에 자동 저장 (디바운스)
  - 페이지 로드 시 복원 모달: "이전에 작성하던 내용이 있어요. 불러올까요?"
  - 생성 완료 시 임시저장 자동 삭제
  - 디바이스 간 동기화: 서버 저장으로 다른 디바이스에서도 접근 가능
  - UX Writing 가이드 준수 (~해요체, 능동적 말하기)

#### 2025-11-10
- **모바일 카카오 애드핏 광고 통합**
  - 얇은 모바일 광고 (320x50): 하단 고정 위치 배치 (PC 가로 배너와 동일 위치)
  - 굵은 모바일 광고 (320x100): 홈화면/인풋 페이지 중간 최적 위치 배치
  - 홈화면: "How It Works" 섹션 아래에 굵은 광고 표시
  - 인풋 페이지: 색상 테마 섹션 아래에 굵은 광고 표시
  - 반응형: 모바일(모바일 광고), 데스크톱(기존 광고 유지)
  - Next.js Script 컴포넌트 id로 중복 로드 방지

- **홈화면에 카카오 애드핏 광고 추가**
  - 오른쪽 여백 세로 광고 (160x600) 추가
  - 하단 고정 가로 배너 (728x90) 추가
  - 인풋 페이지와 동일한 광고 구조 적용
  - 반응형: 모바일(광고 없음), 태블릿(가로 배너만), 데스크톱(둘 다 표시)

- **회원가입 및 로그인 시 기존 가입 경로 안내 기능 추가**
  - **회원가입 API**: 이메일 중복 시 Account 테이블 조회하여 가입 경로 확인
  - **OAuth 로그인**: 다른 provider로 로그인 시도 시 기존 가입 경로 안내
  - **Email 로그인**: OAuth로 가입한 사용자가 이메일/패스워드 로그인 시도 시 안내
  - GitHub, Google, Email 등 기존 가입 방법을 사용자에게 안내
  - 복수 OAuth provider로 가입한 경우도 모두 안내
  - 로그인 페이지에서 에러 메시지를 toast로 표시 (URL 파라미터 활용)
  - 사용자에게 올바른 로그인 방법 제시로 UX 개선
  - 예시: "Google 계정으로 가입하셨어요. Google로 로그인해주세요"

- **같은 이메일로 여러 제공자 계정 통합 지원**
  - OAuth → OAuth (다른 provider) 연결 허용
  - OAuth → Email 회원가입 허용
  - Email → OAuth 연결 허용
  - 이메일 로그인 시 password 없으면 OAuth 안내
  - 하나의 User 계정으로 모든 로그인 방식 사용 가능
  - 예시: 구글 로그인 → 깃헙 로그인 → 이메일 회원가입 모두 같은 계정으로 통합

- **전역 푸터 컴포넌트 추가**
  - MIT 라이센스, 회사명(FlowCoder), 문의메일 정보 포함
  - MaxWidthContainer를 활용한 반응형 디자인
  - 개인정보 처리방침, 서비스 이용약관 링크 포함
  - 모든 페이지 하단에 자동 표시 (LayoutWrapper 통합)

### 🎨 UI/UX

#### 2025-11-10
- **광고 오버플로우 완전 해결 및 영역 명확 분리**
  - **모든 광고 컴포넌트에 오버플로우 방지 적용**:
    - KakaoAdBanner (728x90): `maxWidth: '728px'` + 내부 컨테이너 래핑
    - KakaoAdMobileThick (320x100): `maxWidth: '320px'` + 내부 컨테이너 래핑
  - **viewer 페이지 광고 영역 강화**:
    - 상단 광고 컨테이너: `maxWidth: '100%'`, `overflow: 'hidden'` 추가
    - 하단 광고 컨테이너: `maxWidth: '100%'`, `overflow: 'hidden'` 추가
  - **결과**:
    - 광고가 절대 화면 밖으로 나가지 않음 ✅
    - 네비게이션과 푸터가 광고에 가리지 않음 ✅
    - 모바일/데스크톱 모두 안전 ✅

- **viewer 페이지 네비게이션 화면 밖 오버플로우 완전 해결**
  - 2단계 컨테이너 구조로 변경:
    - 외부: 중앙 정렬 + 좌우 padding
    - 내부: `maxWidth: 1200px` (슬라이드와 동일) + 버튼 레이아웃
  - 화면 넓을 때: 1200px로 제한되어 슬라이드와 정렬
  - 화면 좁아질 때: `width: 100%`로 화면에 맞춤, 버튼 크기 유지
  - 네비게이션이 절대 화면 밖으로 나가지 않음 ✅
  - 슬라이드와 네비게이션 너비 일치 (일관성) ✅

- **viewer 페이지 데스크톱 레이아웃 완전 개선 (광고 절대 겹침 방지 + 슬라이드 고정 크기)**
  - **슬라이드 뷰어 섹션 최소 높이 보장**: minHeight: '715px' (슬라이드 675px + padding 40px)
  - **슬라이드 고정 크기**: width: '1200px', height: '675px' (16:9 비율)
  - **반응형 축소**: maxWidth: '90vw', maxHeight: '90vh' (화면보다 크면 비율 유지하며 축소)
  - **동작 원리**:
    - 화면 충분히 클 때: 슬라이드 1200×675px 고정 크기 표시
    - 화면 좁아질 때: maxWidth/maxHeight가 슬라이드 비율 유지하며 축소
    - 전체 페이지 높이 부족 시: 페이지 전체 스크롤 (광고는 슬라이드 안 가림)
  - **슬라이드 뷰어 섹션은 항상 최소 715px 확보** ← 핵심!
  - **광고가 슬라이드를 절대 가리지 않음** ✅
  - **항상 16:9 비율 유지** ✅

- **viewer 페이지 모바일 레이아웃 완전 개선**
  - 세로 스크롤 방식 → 페이지네이션 방식 변경
  - 광고 아래 슬라이드가 화면에 딱 맞게 반응형 표시
  - overflow: 'hidden'으로 스크롤 완전 제거
  - 모바일 네비게이션 버튼 추가 (← / →)
  - aspectRatio: '16/9'로 슬라이드 비율 유지
  - 모바일/데스크톱 통합 레이아웃 (코드 간소화)
  - height: '100vh' → minHeight: '100vh' 변경 (하단 짤림 방지)
  - 슬라이드 뷰어 최소 높이 설정 (모바일 300px, 데스크톱 400px)
  - 모든 해상도에서 네비게이션 및 광고 영역 정상 표시

- **viewer 페이지 광고와 슬라이드 간격 개선**
  - 광고 컨테이너와 슬라이드 뷰어 사이에 별도 간격 div 추가
  - 간격: 모바일 20px, 데스크톱 32px
  - paddingBottom 방식에서 독립 간격 div로 변경
  - 슬라이드가 광고에 가려지는 문제 완전 해결

- **로고 크기 증가 (40px -> 48px)**
  - 모바일에서 로고 가독성 개선
  - 모든 화면에서 동일한 크기 적용

- **Nav 바 모바일 최적화 - 텍스트 로고 완전 숨김**
  - 모바일에서 로고 아이콘만 표시 (텍스트 완전 제거)
  - sm(640px) 이상에서 전체 텍스트 표시
  - 화면 공간 효율성 극대화

- **홈화면 모바일 최적화**
  - Nav 바 로고: 모바일에서 "by FlowCoder" 텍스트 숨김 (sm 이상에서만 표시)
  - '사용 방법' 섹션: 모바일에서 2x2 그리드 레이아웃 적용
  - 반응형: 640px 이상에서는 기존 레이아웃 유지

### 📝 Documentation

#### 2025-11-10
- **Google OAuth 로그인 오류 해결 가이드 추가**
  - redirect_uri_mismatch 오류 원인 분석 및 해결 방법 문서화
  - Google Cloud Console에 Vercel 도메인 추가 가이드
  - Vercel 환경 변수 설정 가이드 (NEXTAUTH_URL)
  - 커스텀 도메인 리다이렉트 구현 가이드 (선택 사항)
  - docs/GOOGLE_OAUTH_FIX.md 파일 추가

- **릴리즈 노트 워크플로우 개선**
  - CLAUDE.md 릴리즈 노트 업데이트 규칙 단순화
  - 커밋 해시 반복 업데이트 제거 (한 번의 푸시로 완료)
  - 직전 변경사항은 커밋 해시 없이도 식별 가능
  - 다음 작업 시 자연스럽게 반영되는 워크플로우로 변경

### 🐛 Fixes

#### 2025-11-11
- **멀티모달 파일 첨부 시 빈 슬라이드 생성 버그 수정** (25bffed)
  - Document Parser 모델 업데이트: gemini-1.5-flash-latest → gemini-2.5-flash
  - 404 Not Found 에러 해결
  - AgendaSlideForm 방어 코딩 추가: `slide.props.items || []`
  - AgendaSlideForm 빈 상태 UI 추가 (항목 없을 때 안내 표시)
  - AgendaSlide 최대 항목: 3개 → 8개로 확장
  - AgendaSlide 레이아웃: 1-4개(1열), 5-8개(2열 그리드)
  - AgendaSlide 1열 제목 간격 개선: 50px (2열과 비슷한 시각적 균형)
  - Gemini 프롬프트 업데이트: agenda items 최대 8개 제약사항 명시
  - JSON 파싱 개선: 마크다운 코드 블록 제거 로직 추가
  - 결과: PDF 25,320자 추출 성공, 슬라이드 정상 생성 확인

#### 2025-11-10
- **viewer 페이지 무한 API 호출 버그 수정**
  - useEffect 의존성 배열에서 currentPresentation 제거
  - fetchPresentation 호출 시 currentPresentation 업데이트로 인한 무한 루프 해결
  - 불필요한 DB 쿼리 (relation_tuples, presentations, users) 반복 호출 제거
  - 페이지 성능 및 DB 부하 대폭 개선

- **카카오 애드핏 스크립트 중복 로드 방지**
  - 모든 광고 컴포넌트에서 Script 제거
  - layout.tsx에 스크립트를 한 번만 로드하도록 변경
  - 429 Too Many Requests 에러 해결
  - 각 광고 컴포넌트는 광고 영역(ins 태그)만 렌더링
  - 모바일 광고 정상 작동

- **로고 이미지를 일반 img 태그로 변경**
  - Next.js Image 컴포넌트 캐시 문제로 일반 img 태그로 변경
  - object-contain 클래스 추가 (비율 유지)
  - 로고 크기 32px -> 40px로 증가 (가독성 개선)
  - 이미지 깨짐 현상 해결

#### 2025-11-10 (이전)
- **무료 크레딧 차감 타이밍 및 저장 오류 수정**
  - 무료 크레딧 차감 시점을 생성 완료 시점에서 저장 성공 후로 변경
  - 저장 실패 시 무료 크레딧이 차감되지 않도록 보장
  - 임시 ID 형식 변경: `Date.now().toString()` → `temp_${Date.now()}`
  - 임시 ID 감지 로직 추가: `id.startsWith('temp_')` 체크
  - 새 프리젠테이션 저장 시 항상 POST 사용 (403 에러 해결)
  - 기존 프리젠테이션 편집 시 PATCH 사용 유지
  - Fallback 모드 완전 제거: 에러를 사용자에게 명확히 표시
  - presentationStore.ts: savePresentation 함수 완전 재작성
  - presentationStore.ts: generatePresentation에서 무료 크레딧 차감 로직 제거
  - presentationStore.ts: 사용하지 않는 import 제거 (savePresentationToStorage)

- **편집 모드에서 저장 시 새 파일 생성되는 버그 수정**
  - presentationStore.ts의 isUpdate 판별 로직 수정
  - UUID를 Number로 변환 시도하던 잘못된 로직 제거
  - 단순 ID 존재 여부로 업데이트/생성 판별
  - 편집 후 저장 시 기존 프리젠테이션 업데이트 (PATCH) 정상 작동

- **Next.js outputFileTracingIncludes로 Prisma 바이너리 포함**
  - next.config.ts에 outputFileTracingIncludes 설정 추가
  - API Routes에서 Prisma Client 바이너리 파일 명시적 포함
  - Vercel serverless function에 libquery_engine-rhel-openssl-3.0.x.so.node 포함 보장
  - 이메일, GitHub, Google 로그인 정상 작동

- **Vercel 빌드 명령어 최적화로 Prisma 바이너리 배포 수정**
  - vercel.json의 buildCommand에서 `rm -rf node_modules/.prisma` 제거
  - 불필요한 Prisma Client 삭제가 바이너리 파일 트레이싱 방해하는 문제 해결
  - package.json의 기본 build 스크립트 사용 (`prisma generate && next build`)
  - Vercel의 자동 파일 트레이싱으로 바이너리 파일 정상 포함 보장

- **Vercel용 Prisma 바이너리 타겟 추가**
  - binaryTargets에 rhel-openssl-3.0.x 추가
  - Vercel serverless 환경에서 Query Engine 바이너리 찾기 실패 해결
  - 이메일, GitHub, Google 로그인 정상 작동 보장

- **Vercel 배포 Prisma WASM 에러 수정** (31f6fb1)
  - engineType=client 제거 (WASM 파일 의존성 제거)
  - PrismaPg adapter 제거 (기본 PostgreSQL 드라이버 사용)
  - 이메일, GitHub, Google 로그인 정상화
  - Vercel serverless 환경에서 Prisma 안정적 작동

### ✨ Features

#### 2025-11-10
- **Perplexity API 프록시 엔드포인트 구현**
  - /api/research 엔드포인트 추가
  - 클라이언트에서 서버의 PERPLEXITY_API_KEY를 통해 자료 조사 가능
  - API 키 검증 및 에러 처리 추가
  - 토큰 사용량 로깅 (비용 추적용)
  - UX Writing 준수 (한글 에러 메시지)

### 🎨 UI/UX

#### 2025-11-10
- **여러 OAuth 프로바이더 로그인 안내 메시지 개선**
  - 복수 OAuth로 가입한 경우 모호한 표현 제거
  - "해당 방법으로" → "Google 또는 GitHub으로" 등 구체적 프로바이더 명시
  - 2개: "Google 또는 GitHub으로 로그인해주세요"
  - 3개 이상: "Google, GitHub 또는 Facebook으로 로그인해주세요"
  - 사용자가 정확히 어떤 방법으로 로그인해야 하는지 명확하게 안내

- **홈페이지 문구 개선**
  - "Gemini + Perplexity AI로" → "최적의 Gen AI로"
  - "2원에 고품질 슬라이드를" → "비용 없이 고품질 슬라이드를"
  - 서비스 핵심 가치 강조

### ✨ Features

#### 2025-11-08
- **프로필 페이지 통계 연결 및 히스토리 다운로드 개선** (be1a329)
  - 프로필 페이지 통계 실제 데이터 연결 (총 슬라이드 수, 사용한 크레딧)
  - `/api/user/stats`: 모든 프리젠테이션 메타데이터 집계 로직 추가
  - 히스토리 페이지 다운로드 포맷 선택 다이얼로그 구현 (PDF/PPTX)
  - 뷰어 페이지와 동일한 UX 적용

### 🔧 Technical

#### 2025-11-12
- **프로필 페이지 버튼 텍스트를 환경별 분기로 변경** (3de43b1)
  - lib/text-config.ts에 editProfile, changePlan 키 추가
  - app/profile/page.tsx에서 하드코딩된 텍스트 제거
  - 독립 서비스: "프로필 수정", "플랜 변경"
  - 앱인토스: "프로필 수정해요", "플랜 변경해요"
  - UX Writing 가이드 준수

- **디자인 시스템 통합 및 멀티 배포 환경 지원**
  - @toss/tds-colors 패키지 제거
  - constants/design.ts에서 HSL 색상 값 직접 정의 (플랫폼 독립적)
  - Tailwind CSS 4로 완전 통일 (19개 파일 영향)
  - 340개 인라인 스타일 → Tailwind 클래스 변환 (14개 파일)
  - lib/text-config.ts 추가: 배포 환경별 텍스트 분기 시스템
  - NEXT_PUBLIC_DEPLOYMENT_ENV 환경 변수 지원 (standalone | apps-in-toss)
  - 버튼 텍스트 23개 환경별 분기 적용 (8개 파일)
  - 독립 서비스 환경: 비즈니스 용어 ("로그인", "회원가입", "크레딧 구매")
  - 앱인토스 환경: 해요체 ("로그인해요", "회원가입해요", "크레딧 구매해요")
  - TypeScript 타입 체크 및 환경별 빌드 검증 완료 (standalone, apps-in-toss)
  - TASK.md, MIGRATION_QUEUE.md 업데이트: 9단계 Phase 완료 추적

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

#### 2025-11-10
- **Vercel 빌드 에러 수정 (viewer useSearchParams Suspense 요구사항)** (9a3635f)
  - /viewer 페이지를 page.tsx + ViewerContent.tsx로 분리
  - Suspense 경계로 ViewerContent 감싸기
  - Next.js 16 클라이언트 컴포넌트 useSearchParams() 요구사항 해결
  - /editor와 동일한 패턴 적용

#### 2025-11-08
- **Vercel 빌드 에러 수정 (useSearchParams Suspense 경계 추가)** (f2c8dcf)
  - /editor 페이지를 page.tsx + EditorContent.tsx로 분리
  - Suspense 경계로 EditorContent 감싸기
  - Next.js 16 클라이언트 컴포넌트 useSearchParams() 요구사항 해결
  - 프리렌더링 에러 완전 해결

- **Vercel 빌드 에러 수정 (useSearchParams Suspense 요구사항)** (432c1e2)
  - /editor 페이지에 `export const dynamic = 'force-dynamic'` 추가 (작동하지 않음)
  - 클라이언트 컴포넌트에서는 Suspense 필요

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
