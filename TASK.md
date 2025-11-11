# UI 개선 작업 (2025-11-11)

> **작업 시작**: 2025-11-11
> **담당**: Claude Code
> **우선순위**: High
> **카테고리**: UI/UX 개선

---

## 📋 작업 개요

전체 UI 일관성 개선 작업입니다. 네비게이션 아이콘, 버튼 호버 효과, CTA 크기를 통일하여 사용자 경험을 향상시킵니다.

---

## 🎯 Phase 1: 네비게이션바 아이콘 개선

**목표**: 이모지 → outline 아이콘으로 변경, 활성화 상태에 따른 색상 적용

### 체크리스트
- [ ] lucide-react 아이콘 임포트 (Home, Sparkles, Star, Gem)
- [ ] NAV_ITEMS의 icon 속성을 lucide 아이콘 컴포넌트로 변경
- [ ] 아이콘에 stroke-width 조정 (선만 표시)
- [ ] 활성화 상태: 텍스트와 동일한 primary 색상 적용
- [ ] 비활성화 상태: textSecondary 색상으로 outline만 표시
- [ ] 호버 효과 유지

**파일**: `components/layout/NavigationBar.tsx`

**변경 사항**:
```typescript
// Before
const NAV_ITEMS: NavItem[] = [
  { label: '홈', href: '/', icon: '🏠' },
  { label: '만들기', href: '/input', icon: '✨' },
  { label: '구독', href: '/subscription', icon: '⭐' },
  { label: '크레딧', href: '/credits', icon: '💎' },
];

// After
import { Home, Sparkles, Star, Gem } from 'lucide-react';

const NAV_ITEMS: NavItem[] = [
  { label: '홈', href: '/', icon: Home },
  { label: '만들기', href: '/input', icon: Sparkles },
  { label: '구독', href: '/subscription', icon: Star },
  { label: '크레딧', href: '/credits', icon: Gem },
];

// 렌더링
{item.icon && (
  <item.icon
    size={18}
    strokeWidth={2}
    style={{ color: active ? TOSS_COLORS.primary : TOSS_COLORS.textSecondary }}
  />
)}
```

---

## 🎨 Phase 2: 버튼 호버 효과 통일

**목표**: 모든 버튼에 일관된 호버 효과 적용

### 체크리스트
- [ ] button.tsx의 buttonVariants 수정
- [ ] Primary 버튼: `hover:bg-primary/90` → `hover:bg-primary/80` (더 진하게)
- [ ] Secondary 버튼: `hover:bg-secondary/80` → `hover:border-primary hover:text-primary`
- [ ] Outline 버튼: `hover:bg-accent` → `hover:border-primary hover:text-primary`
- [ ] Ghost 버튼: 유지 (`hover:bg-accent hover:text-accent-foreground`)

**파일**: `components/ui/button.tsx`

**변경 사항**:
```typescript
// Primary 버튼
default: "bg-primary text-primary-foreground shadow hover:bg-primary/80"

// Secondary 버튼
secondary: "bg-secondary text-secondary-foreground shadow-sm hover:border-primary hover:text-primary transition-colors"

// Outline 버튼
outline: "border border-input bg-background shadow-sm hover:border-primary hover:text-primary transition-colors"
```

---

## 📐 Phase 3: CTA 버튼 크기 조정

**목표**: 높이 줄이고 너비 일관성 확보

### 체크리스트
- [ ] HomePage CTA 버튼 크기 조정
- [ ] "무료로 시작해요" 버튼: 높이 h-12 → h-10, min-w-[200px]
- [ ] "요금제 보기" 버튼: 높이 h-12 → h-10, min-w-[200px]
- [ ] NavigationBar "회원가입" 버튼: size="sm" 유지, min-w-[100px]
- [ ] NavigationBar "로그인" 버튼: size="sm" 유지, min-w-[80px]

**파일**: `app/page.tsx`, `components/layout/NavigationBar.tsx`

**변경 사항**:
```typescript
// HomePage CTA 버튼
<Button
  size="lg"
  className="h-10 min-w-[200px]"
>
  무료로 시작해요
</Button>

<Button
  variant="outline"
  size="lg"
  className="h-10 min-w-[200px]"
>
  요금제 보기
</Button>

// NavigationBar 버튼
<Button
  variant="ghost"
  size="sm"
  className="min-w-[80px]"
>
  로그인
</Button>

<Button
  size="sm"
  className="min-w-[100px]"
>
  회원가입
</Button>
```

---

## ✨ Phase 4: Input 페이지 버튼 개선

**목표**: "슬라이드 생성해요" 버튼을 Primary 버튼으로 명확하게 변경

### 체크리스트
- [ ] input/page.tsx의 생성 버튼 확인
- [ ] variant 속성 명시적으로 "default" 추가 (이미 기본값이지만 명시)
- [ ] 클래스 정리 (h-14, text-lg, font-bold 유지)

**파일**: `app/input/page.tsx`

**변경 사항**:
```typescript
// Before (variant 없음 - 기본값 사용)
<Button
  onClick={handleGenerate}
  disabled={isGenerating || !text.trim()}
  className="w-full mt-4 h-14 text-lg font-bold"
>
  {isGenerating ? '생성하고 있어요' : '✨ 슬라이드 생성해요'}
</Button>

// After (variant 명시)
<Button
  variant="default"
  onClick={handleGenerate}
  disabled={isGenerating || !text.trim()}
  className="w-full mt-4 h-14 text-lg font-bold"
>
  {isGenerating ? '생성하고 있어요' : '✨ 슬라이드 생성해요'}
</Button>
```

---

## 📝 작업 진행 상황

### Phase 1: 네비게이션바 아이콘 개선
- [ ] 시작
- [ ] 진행 중
- [ ] 완료
- [ ] 테스트 완료

### Phase 2: 버튼 호버 효과 통일
- [ ] 시작
- [ ] 진행 중
- [ ] 완료
- [ ] 테스트 완료

### Phase 3: CTA 버튼 크기 조정
- [ ] 시작
- [ ] 진행 중
- [ ] 완료
- [ ] 테스트 완료

### Phase 4: Input 페이지 버튼 개선
- [ ] 시작
- [ ] 진행 중
- [ ] 완료
- [ ] 테스트 완료

---

## 🔍 테스트 체크리스트

### 전체 페이지 테스트
- [ ] HomePage (`/`) - CTA 버튼 크기 및 호버 효과
- [ ] NavigationBar (모든 페이지) - 아이콘 및 버튼 호버 효과
- [ ] LoginPage (`/login`) - 버튼 호버 효과
- [ ] SignupPage (`/signup`) - 버튼 호버 효과
- [ ] InputPage (`/input`) - 생성 버튼 primary 스타일
- [ ] SubscriptionPage (`/subscription`) - CTA 버튼 호버 효과
- [ ] CreditsPage (`/credits`) - 버튼 호버 효과

### 반응형 테스트
- [ ] 모바일 (< 640px)
- [ ] 태블릿 (640px ~ 1024px)
- [ ] 데스크톱 (> 1024px)

### 브라우저 테스트
- [ ] Chrome
- [ ] Safari
- [ ] Firefox
- [ ] Edge

---

## 📊 예상 소요 시간

| Phase | 예상 시간 | 실제 시간 |
|-------|----------|----------|
| Phase 1 | 15분 | - |
| Phase 2 | 10분 | - |
| Phase 3 | 15분 | - |
| Phase 4 | 5분 | - |
| 테스트 | 15분 | - |
| **총계** | **60분** | - |

---

## 🎨 디자인 시스템 참조

### 색상 (TOSS_COLORS)
- **Primary**: `#3182F6` (버튼, 활성 상태)
- **Secondary**: `#8B95A1` (보조 텍스트)
- **Text**: `#191F28` (본문)
- **TextSecondary**: `#8B95A1` (보조 텍스트)

### 호버 효과
- **Primary 버튼**: `bg-primary` → `bg-primary/80` (20% 더 진함)
- **Secondary/Outline 버튼**: `border + text` → `border-primary + text-primary`
- **Ghost 버튼**: 기존 유지 (`hover:bg-accent`)

### 버튼 크기
- **sm**: `h-8` (로그인, 회원가입)
- **default**: `h-9` (일반 버튼)
- **CTA**: `h-10` (무료로 시작해요, 요금제 보기)
- **Large**: `h-14` (슬라이드 생성해요)

---

## 📋 완료 후 업데이트 항목

### CLAUDE.md 업데이트
- [ ] "작업 관리 방식" 섹션 추가
- [ ] TASK.md 사용 가이드 추가
- [ ] Phase 단위 작업 프로세스 문서화

### RELEASE_NOTES.md 업데이트
- [ ] UI/UX 개선 항목 추가
- [ ] 버튼 호버 효과 통일 기록
- [ ] 네비게이션 아이콘 개선 기록

---

**작업 시작**: 2025-11-11
**마지막 업데이트**: 2025-11-11
**다음 업데이트**: Phase 완료 시마다
