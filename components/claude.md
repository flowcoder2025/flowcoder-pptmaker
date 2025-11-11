# Components - React 컴포넌트 가이드

> **상위 문서**: [../CLAUDE.md](../CLAUDE.md)
> **프레임워크**: Next.js 16 + React 19
> **UI 라이브러리**: shadcn/ui + Radix UI + Tailwind CSS 4

---

## 개요

이 디렉토리는 PPT Maker 프로젝트의 모든 React 컴포넌트를 포함합니다.
Next.js 16 App Router 아키텍처에 맞춰 재사용 가능한 컴포넌트를 체계적으로 관리하며, shadcn/ui와 Radix UI를 기반으로 한 접근성 우선 UI를 제공합니다.

---

## 디렉토리 구조

```
components/
├── claude.md              # 현재 파일 - 컴포넌트 가이드
├── ui/                    # shadcn/ui 기반 공통 UI 컴포넌트
│   ├── button.tsx         # 버튼 (Radix UI 기반)
│   ├── input.tsx          # 입력 필드
│   ├── dialog.tsx         # 다이얼로그/모달
│   ├── card.tsx           # 카드 레이아웃
│   ├── select.tsx         # 선택 드롭다운
│   └── ...                # 기타 shadcn/ui 컴포넌트
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
│   ├── SignInButton.tsx   # OAuth 로그인 버튼
│   ├── UserMenu.tsx       # 사용자 메뉴
│   └── ProtectedRoute.tsx # 인증 보호 래퍼
└── providers/             # Context 프로바이더
    └── SessionProvider.tsx # NextAuth 세션 프로바이더
```

---

## 컴포넌트 카테고리

### 1. ui/ - 공통 UI 컴포넌트

**목적**: 프로젝트 전반에서 재사용되는 기본 UI 요소 (shadcn/ui 기반)

**주요 컴포넌트**:
- `button.tsx`: 기본 버튼 (Radix UI `Button` 기반)
- `input.tsx`: 입력 필드
- `dialog.tsx`: 모달/다이얼로그 (Radix UI `Dialog` 기반)
- `card.tsx`: 카드 레이아웃
- `select.tsx`: 드롭다운 선택 (Radix UI `Select` 기반)
- `toast.tsx`: 토스트 알림

**작성 규칙**:
- shadcn/ui CLI로 컴포넌트 추가: `npx shadcn-ui@latest add [component]`
- Tailwind CSS로 스타일 커스터마이징
- Props 인터페이스는 명시적으로 정의
- 접근성(Accessibility) 기본 제공 (Radix UI 기반)

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

**목적**: NextAuth.js 기반 사용자 인증 UI

**주요 컴포넌트**:
- `SignInButton.tsx`: OAuth 로그인 버튼 (GitHub, Google)
- `UserMenu.tsx`: 사용자 정보 및 메뉴 (드롭다운)
- `ProtectedRoute.tsx`: 인증 필요 페이지 래퍼

**구현 예시**:
```typescript
'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export function SignInButton() {
  const { data: session } = useSession()

  if (session) {
    return (
      <Button onClick={() => signOut()}>
        로그아웃
      </Button>
    )
  }

  return (
    <Button onClick={() => signIn('github')}>
      GitHub으로 로그인해요
    </Button>
  )
}
```

### 4. providers/ - Context 프로바이더

**목적**: 전역 상태 및 세션 관리

**주요 컴포넌트**:
- `SessionProvider.tsx`: NextAuth 세션 프로바이더 래퍼

**사용 패턴**:
```typescript
// app/layout.tsx에서 사용
import { SessionProvider } from '@/components/providers/SessionProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

**SessionProvider 구현**:
```typescript
'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
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

#### 2. UX Writing 규칙 및 환경별 텍스트 분기

**기본 규칙**: 모든 사용자 대면 텍스트는 **~해요체** 사용 (단, 환경별 분기 필요)

**환경별 텍스트 분기** (멀티 배포 환경 지원):

모든 버튼 텍스트는 `lib/text-config.ts`의 `BUTTON_TEXT` 상수를 사용하여 배포 환경에 따라 자동으로 분기됩니다:

```typescript
// ✅ 올바른 예: BUTTON_TEXT 사용
import { BUTTON_TEXT, STATUS_TEXT } from '@/lib/text-config'

export default function MyComponent() {
  return (
    <>
      <Button>{BUTTON_TEXT.login}</Button>
      <Button>{BUTTON_TEXT.signup}</Button>
      <Button>{BUTTON_TEXT.purchaseCredits}</Button>
      <span>{STATUS_TEXT.loading}</span>
    </>
  )
}

// 환경별 출력:
// - standalone: "로그인", "회원가입", "크레딧 구매" (비즈니스 용어)
// - apps-in-toss: "로그인해요", "회원가입해요", "크레딧 구매해요" (해요체)
```

```typescript
// ❌ 잘못된 예: 하드코딩 (환경 분기 없음)
<Button>로그인해요</Button>
<Button>회원가입해요</Button>
```

**특수 케이스**: 일부 버튼은 context-specific하므로 하드코딩이 허용됩니다:
- 프로필 수정, 전체 보기 등의 기능 버튼
- 특정 페이지나 섹션 내부의 네비게이션 버튼
- "첫 프리젠테이션 만들기" 같은 특수한 CTA 버튼

**참조**:
- UX Writing 가이드: [../../docs/03-design/03-ux-writing.md](../../docs/03-design/03-ux-writing.md)
- 텍스트 설정 파일: [../lib/text-config.ts](../lib/text-config.ts)

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

#### 1. shadcn/ui 컴포넌트 우선 사용
```typescript
// ✅ 권장: shadcn/ui 컴포넌트 사용
import { Button } from '@/components/ui/button'

export default function MyComponent() {
  return <Button variant="default">클릭해요</Button>
}
```

**shadcn/ui 컴포넌트 추가**:
```bash
# CLI로 필요한 컴포넌트 추가
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input

# 여러 컴포넌트 한 번에 추가
npx shadcn-ui@latest add button dialog input card
```

**커스텀 스타일링**:
```typescript
// ✅ Tailwind CSS로 스타일 확장
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export default function MyComponent() {
  return (
    <Button
      variant="default"
      className={cn("custom-class", "hover:bg-primary/90")}
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

### UI 라이브러리
- **[shadcn/ui](https://ui.shadcn.com)**: shadcn/ui 공식 문서
- **[Radix UI](https://www.radix-ui.com)**: Radix UI 프리미티브 문서
- **[Tailwind CSS](https://tailwindcss.com)**: Tailwind CSS 공식 문서

### 인증
- **[NextAuth.js](https://next-auth.js.org)**: NextAuth.js 공식 문서
- **[NextAuth React Hooks](https://next-auth.js.org/getting-started/client)**: useSession, signIn, signOut

### 외부 문서
- **[React 19 문서](https://react.dev/)**: React 공식 문서
- **[Next.js App Router](https://nextjs.org/docs/app)**: Next.js 16 App Router

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
- [ ] shadcn/ui 컴포넌트 우선 검토

---

## 문제 해결

### shadcn/ui 컴포넌트 추가 오류
```bash
# 1. shadcn/ui 설정 확인
cat components.json

# 2. 미설정 시 초기화
npx shadcn-ui@latest init

# 3. 컴포넌트 추가
npx shadcn-ui@latest add button
```

### NextAuth 세션이 undefined
```typescript
// ❌ 잘못된 사용: SessionProvider 없음
export default function Page() {
  const { data: session } = useSession()  // undefined
  // ...
}
```

**해결**: `app/layout.tsx`에 SessionProvider 추가 확인
```typescript
import { SessionProvider } from '@/components/providers/SessionProvider'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

### 'use client' 없이 상태 사용 시 오류
```
Error: useState can only be used in Client Components
```

**해결**: 파일 상단에 `'use client'` 추가

### Radix UI 스타일이 적용되지 않음
```bash
# Tailwind CSS 설정 확인
# tailwind.config.js에 components/ui 경로 추가
```

```javascript
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  // ...
}
```

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

**마지막 업데이트**: 2025-11-07
**변경 이력**: 웹 서비스 전환 - shadcn/ui, NextAuth.js 기반으로 업데이트
