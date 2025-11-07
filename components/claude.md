# Components - React 컴포넌트 가이드

> **상위 문서**: [../CLAUDE.md](../CLAUDE.md)
> **프레임워크**: Next.js 16 + React 19
> **UI 라이브러리**: TDS Mobile (v2.1.2)

---

## 개요

이 디렉토리는 PPT Maker 프로젝트의 모든 React 컴포넌트를 포함합니다.
Next.js 16 App Router 아키텍처에 맞춰 재사용 가능한 컴포넌트를 체계적으로 관리합니다.

---

## 디렉토리 구조

```
components/
├── claude.md              # 현재 파일 - 컴포넌트 가이드
├── ui/                    # 공통 UI 컴포넌트
│   └── Button.tsx         # 기본 버튼 컴포넌트
├── editor/                # 슬라이드 편집 컴포넌트
│   ├── ConfirmDialog.tsx  # 확인 다이얼로그
│   ├── ImageUploader.tsx  # 이미지 업로드
│   └── forms/             # 슬라이드 타입별 편집 폼
│       ├── TitleSlideForm.tsx        # 타이틀 슬라이드
│       ├── ContentSlideForm.tsx      # 콘텐츠 슬라이드
│       ├── BulletSlideForm.tsx       # 불릿 포인트
│       ├── ImageSlideForm.tsx        # 이미지 슬라이드
│       ├── ImageTextSlideForm.tsx    # 이미지+텍스트
│       ├── TwoColumnSlideForm.tsx    # 2단 레이아웃
│       ├── ComparisonSlideForm.tsx   # 비교 슬라이드
│       ├── TimelineSlideForm.tsx     # 타임라인
│       ├── AgendaSlideForm.tsx       # 아젠다
│       ├── FeatureGridSlideForm.tsx  # 기능 그리드
│       ├── StatsSlideForm.tsx        # 통계
│       ├── ChartSlideForm.tsx        # 차트
│       ├── GallerySlideForm.tsx      # 갤러리
│       ├── TeamProfileSlideForm.tsx  # 팀 소개
│       └── ThankYouSlideForm.tsx     # 감사 슬라이드
├── auth/                  # 인증 관련 컴포넌트
│   └── LoginButton.tsx    # 로그인 버튼
└── providers/             # Context 프로바이더
    └── TDSProvider.tsx    # TDS Mobile 테마 프로바이더
```

---

## 컴포넌트 카테고리

### 1. ui/ - 공통 UI 컴포넌트

**목적**: 프로젝트 전반에서 재사용되는 기본 UI 요소

**현재 컴포넌트**:
- `Button.tsx`: 기본 버튼 컴포넌트 (TDS Mobile 버튼 래핑)

**작성 규칙**:
- TDS Mobile 컴포넌트를 우선 사용
- 커스텀 스타일은 Tailwind CSS 사용
- Props 인터페이스는 명시적으로 정의
- 접근성(Accessibility) 고려 필수

### 2. editor/ - 슬라이드 편집 컴포넌트

**목적**: 슬라이드 생성 및 편집 기능 제공

**하위 구조**:
- **루트 레벨**: 공통 편집 유틸리티 (`ConfirmDialog`, `ImageUploader`)
- **forms/**: 슬라이드 타입별 편집 폼 (15개 타입)

**슬라이드 타입 분류**:
1. **기본 타입** (3개)
   - Title: 타이틀 슬라이드
   - Content: 일반 콘텐츠
   - Bullet: 불릿 포인트 목록

2. **시각 자료** (5개)
   - Image: 이미지 단독
   - ImageText: 이미지+텍스트 조합
   - Gallery: 이미지 갤러리
   - Chart: 차트/그래프
   - Stats: 통계 카드

3. **구조형 레이아웃** (4개)
   - TwoColumn: 2단 레이아웃
   - Comparison: 비교 테이블
   - FeatureGrid: 기능 그리드
   - Timeline: 타임라인

4. **특수 목적** (3개)
   - Agenda: 발표 아젠다
   - TeamProfile: 팀원 소개
   - ThankYou: 감사 슬라이드

### 3. auth/ - 인증 컴포넌트

**목적**: 사용자 인증 및 로그인 관련 UI

**현재 컴포넌트**:
- `LoginButton.tsx`: 토스 로그인 버튼 (Bedrock SDK 연동)

**향후 추가 예정**:
- 프로필 카드
- 로그아웃 버튼
- 사용자 정보 표시

### 4. providers/ - Context 프로바이더

**목적**: 전역 상태 및 테마 관리

**현재 컴포넌트**:
- `TDSProvider.tsx`: TDS Mobile 테마 설정 프로바이더

**사용 패턴**:
```typescript
// app/layout.tsx에서 사용
import { TDSProvider } from '@/components/providers/TDSProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <TDSProvider>
          {children}
        </TDSProvider>
      </body>
    </html>
  )
}
```

---

## 컴포넌트 작성 규칙

### 🔴 필수 규칙

#### 1. Client vs Server 컴포넌트
```typescript
// 클라이언트 컴포넌트 (상태, 이벤트 핸들러 사용 시 필수)
'use client'

import { useState } from 'react'

export default function MyComponent() {
  const [state, setState] = useState()
  return <div onClick={...}>...</div>
}
```

```typescript
// 서버 컴포넌트 (기본값 - 'use client' 없음)
export default function MyStaticComponent() {
  return <div>정적 콘텐츠</div>
}
```

#### 2. UX Writing 규칙
모든 사용자 대면 텍스트는 **~해요체** 사용:

```typescript
// ❌ 잘못된 예
<Button>저장</Button>
<p>완료됐습니다</p>
<span>검색 중...</span>

// ✅ 올바른 예
<Button>저장해요</Button>
<p>완료했어요</p>
<span>검색하고 있어요</span>
```

**참조**: [../../docs/03-design/03-ux-writing.md](../../docs/03-design/03-ux-writing.md)

#### 3. TypeScript 타입 정의
```typescript
// Props 인터페이스는 명시적으로 정의
interface ButtonProps {
  /** 버튼 텍스트 */
  label: string
  /** 클릭 핸들러 */
  onClick: () => void
  /** 비활성화 여부 (기본값: false) */
  disabled?: boolean
}

export default function Button({ label, onClick, disabled = false }: ButtonProps) {
  // 구현
}
```

#### 4. 파일명 규칙
- **컴포넌트**: PascalCase (예: `SlideEditor.tsx`)
- **유틸리티/훅**: camelCase (예: `useSlideData.ts`)
- **타입 정의**: camelCase (예: `slideTypes.ts`)

### 🟡 권장 사항

#### 1. TDS Mobile 컴포넌트 우선 사용
```typescript
// ✅ 권장: TDS Mobile 컴포넌트 사용
import { Button } from '@toss/tds-mobile'

export default function MyComponent() {
  return <Button variant="primary">클릭해요</Button>
}
```

```typescript
// ⚠️ 최소화: 커스텀 스타일
// 불가피한 경우에만 사용
import { Button } from '@toss/tds-mobile'

export default function MyComponent() {
  return (
    <Button
      variant="primary"
      className="custom-override" // 최소한만 오버라이드
    >
      클릭해요
    </Button>
  )
}
```

#### 2. 경로 임포트
```typescript
// ✅ 권장: @ alias 사용
import { SlideData } from '@/types/slide'
import { usePresentationStore } from '@/store/presentationStore'

// ❌ 지양: 상대 경로
import { SlideData } from '../../types/slide'
import { usePresentationStore } from '../../store/presentationStore'
```

#### 3. 컴포넌트 문서화
```typescript
/**
 * 슬라이드 편집 폼 컴포넌트
 *
 * @description
 * 주어진 슬라이드 데이터를 편집할 수 있는 폼을 렌더링합니다.
 *
 * @example
 * ```tsx
 * <SlideEditForm
 *   slide={currentSlide}
 *   onSave={(updated) => saveSlide(updated)}
 *   onCancel={() => closeEditor()}
 * />
 * ```
 */
export default function SlideEditForm({ slide, onSave, onCancel }: Props) {
  // 구현
}
```

### 🟢 선택 사항

#### 1. 컴포넌트 구조화
```typescript
// 작은 컴포넌트: 단일 파일
// SlideCard.tsx
export default function SlideCard() { ... }

// 큰 컴포넌트: 디렉토리 구조
// SlideEditor/
// ├── index.tsx       (메인 컴포넌트)
// ├── Toolbar.tsx     (서브 컴포넌트)
// ├── Canvas.tsx      (서브 컴포넌트)
// └── useEditor.ts    (전용 훅)
```

#### 2. 성능 최적화
```typescript
import { memo, useMemo, useCallback } from 'react'

// 무거운 컴포넌트는 memo 사용
export default memo(function HeavyComponent({ data }: Props) {
  // 계산 비용이 큰 값은 useMemo
  const processedData = useMemo(() =>
    expensiveCalculation(data),
    [data]
  )

  // 콜백은 useCallback
  const handleClick = useCallback(() => {
    doSomething(data)
  }, [data])

  return <div onClick={handleClick}>{processedData}</div>
})
```

---

## 참조 문서

### 프로젝트 문서
- **[../CLAUDE.md](../CLAUDE.md)**: 프로젝트 전체 가이드
- **[../types/slide.ts](../types/slide.ts)**: 슬라이드 타입 정의

### Apps in Toss 문서
- **[TDS Mobile 컴포넌트](../../docs/reference/tds-mobile/)**: UI 컴포넌트 레퍼런스
- **[UX Writing 가이드](../../docs/03-design/03-ux-writing.md)**: 텍스트 작성 규칙
- **[디자인 가이드](../../docs/03-design/claude.md)**: 디자인 시스템

### 외부 문서
- **[TDS Mobile 공식 문서](https://tossmini-docs.toss.im/tds-mobile/)**: 최신 컴포넌트 API
- **[React 19 문서](https://react.dev/)**: React 공식 문서

---

## 새 컴포넌트 추가 시

### 1. 카테고리 선택
- 공통 UI 요소 → `ui/`
- 슬라이드 편집 관련 → `editor/` (또는 `editor/forms/`)
- 인증 관련 → `auth/`
- 전역 프로바이더 → `providers/`

### 2. 파일 생성
```bash
# 예: 새로운 공통 버튼 추가
touch components/ui/IconButton.tsx
```

### 3. 기본 템플릿
```typescript
'use client'

import { ReactNode } from 'react'

/**
 * [컴포넌트 설명]
 *
 * @example
 * ```tsx
 * <MyComponent prop="value" />
 * ```
 */
interface MyComponentProps {
  /** Props 설명 */
  children: ReactNode
}

export default function MyComponent({ children }: MyComponentProps) {
  return (
    <div>
      {children}
    </div>
  )
}
```

### 4. 체크리스트
- [ ] `'use client'` 지시문 필요 여부 확인
- [ ] Props 인터페이스 정의
- [ ] JSDoc 주석 작성
- [ ] UX Writing 규칙 준수 (사용자 대면 텍스트)
- [ ] TypeScript strict mode 통과
- [ ] TDS Mobile 컴포넌트 우선 검토

---

## 문제 해결

### TDS Mobile 컴포넌트가 작동하지 않음
```bash
# 1. TDS Mobile 설치 확인
npm list @toss/tds-mobile

# 2. 미설치 시 설치
npm install @toss/tds-mobile

# 3. TDSProvider 확인
# app/layout.tsx에서 TDSProvider로 감싸져 있는지 확인
```

### 'use client' 없이 상태 사용 시 오류
```
Error: useState can only be used in Client Components
```

**해결**: 파일 상단에 `'use client'` 추가

### 임포트 경로 오류
```
Module not found: Can't resolve '@/components/...'
```

**해결**: `tsconfig.json`의 `paths` 설정 확인
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

**마지막 업데이트**: 2025-11-06
**변경 이력**: 초기 작성 - components 디렉토리 가이드 및 작성 규칙
