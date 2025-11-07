# Store - Zustand 상태 관리

> **상위 문서**: [../CLAUDE.md](../CLAUDE.md)
> **역할**: 전역 상태 관리 (Zustand)

---

## 개요

PPT Maker는 **Zustand**를 사용하여 전역 상태를 관리합니다.

**주요 특징**:
- ✅ **타입 안정성**: TypeScript 완전 지원
- ✅ **Persistence**: localStorage 자동 저장 (일부 Store)
- ✅ **간결성**: Redux보다 보일러플레이트 최소화
- ✅ **성능**: 필요한 컴포넌트만 리렌더링

**설치**:
```bash
npm install zustand
```

---

## Store 목록

### 1️⃣ presentationStore.ts - 프리젠테이션 상태

**경로**: `store/presentationStore.ts`

**역할**: 프리젠테이션 생성, 편집, 저장 등 핵심 상태 관리

**주요 상태**:
- `currentPresentation`: 현재 작업 중인 프리젠테이션
- `isGenerating`: AI 생성 진행 여부
- `generationStep`: 생성 단계 (`idle` | `parsing` | `generating` | `done` | `error`)
- `selectedColorPresetId`: 선택된 색상 프리셋 ID
- `researchMode`: 자료 조사 모드 (`none` | `fast` | `deep`)
- `useProContentModel`: Pro 모델 사용 여부 (콘텐츠 생성)
- `useProHtmlModel`: Pro 모델 사용 여부 (HTML 생성)

**주요 액션**:
```typescript
// 프리젠테이션 생성
generatePresentation(text: string): Promise<void>

// 슬라이드 편집
updateSlide(index: number, updatedSlide: Slide): void
reorderSlides(startIndex: number, endIndex: number): void
addSlide(slideType: SlideType, afterIndex: number): void
deleteSlide(index: number): boolean
duplicateSlide(index: number): void

// 템플릿 변경
changeTemplate(templateId: string): void

// Undo/Redo
undo(): void
redo(): void
canUndo(): boolean
canRedo(): boolean

// 저장
savePresentation(): Promise<void>
```

**사용 예시**:
```tsx
import { usePresentationStore } from '@/store/presentationStore';

function InputPage() {
  const {
    generatePresentation,
    isGenerating,
    generationStep
  } = usePresentationStore();

  const handleGenerate = async (text: string) => {
    await generatePresentation(text);
  };

  return (
    <div>
      {isGenerating && <p>생성 중... ({generationStep})</p>}
      <button onClick={() => handleGenerate('AI 발표 자료')}>
        생성하기
      </button>
    </div>
  );
}
```

**AI 생성 플로우**:
1. 인증 체크 (NextAuth 세션)
2. 자료 조사 (선택적 - Perplexity)
3. 콘텐츠+JSON 생성 (Gemini Flash/Pro)
   - **Parser 통합**: 프롬프트에서 UnifiedPPTJSON 형식 직접 요청
   - **8원 절감**: Flash-Lite API 호출 불필요
4. JSON 자체 파싱 (마크다운 코드 블록 제거만)
   - `JSON.parse()`로 간단 파싱 (API 비용 0원)
   - 실패 시 에러 처리
5. HTML 생성 (TemplateEngine - 0원)
6. Supabase 데이터베이스에 저장

**핵심 개선점**:
- ✅ **3단계 파이프라인**: 기존 4단계에서 Parser 단계 제거
- ✅ **비용 98% 절감**: 156원 → 2원 (Flash 기준)
- ✅ **단일 API 호출**: 콘텐츠와 JSON을 한 번에 생성
- ✅ **클라우드 저장**: Supabase Database + Zanzibar 권한 관리

---

### 2️⃣ subscriptionStore.ts - 구독 상태

**경로**: `store/subscriptionStore.ts`

**역할**: 하이브리드 수익 모델의 구독 상태 관리

**주요 상태**:
- `plan`: 현재 구독 플랜 (`free` | `pro` | `premium`)
- `expiresAt`: 구독 만료 시간 (Unix timestamp)
- `status`: 구독 상태 (`active` | `canceled` | `expired`)
- `autoRenewal`: 자동 갱신 여부
- `monthlyFreeUsage`: 이번 달 무료 사용 횟수
  - `proModel`: Pro 모델 사용 횟수
  - `deepResearch`: 깊은 조사 사용 횟수

**주요 액션**:
```typescript
// 플랜 설정
setPlan(plan: SubscriptionPlan, expiresAt: number | null): void

// 상태 확인
isActive(): boolean
isExpired(): boolean
getDaysRemaining(): number

// 광고 제거 여부
isAdFree(): boolean

// 무료 할당량 사용
canUseFreePro(): boolean
canUseFreeDeep(): boolean
useFreeProModel(): boolean
useFreeDeepResearch(): boolean

// 할인율 및 제한
getPayPerUseDiscount(): number
getMaxSlides(): number
hasWatermark(): boolean
getPremiumTemplateDiscount(): number
```

**사용 예시**:
```tsx
import { useSubscriptionStore } from '@/store/subscriptionStore';

function GenerationSettings() {
  const {
    plan,
    isAdFree,
    canUseFreePro,
    getMaxSlides
  } = useSubscriptionStore();

  return (
    <div>
      <p>현재 플랜: {plan}</p>
      <p>광고 제거: {isAdFree() ? '✅' : '❌'}</p>
      <p>Pro 모델 무료: {canUseFreePro() ? '✅' : '❌'}</p>
      <p>최대 슬라이드: {getMaxSlides()}개</p>
    </div>
  );
}
```

**Persistence**: ✅ localStorage에 자동 저장 (`subscription-storage`)

**월별 초기화**: 앱 시작 시 자동 체크 + 24시간마다 체크

---

### 3️⃣ creditStore.ts - 크레딧 관리

**경로**: `store/creditStore.ts`

**역할**: 묶음 구매 크레딧 관리

**주요 상태**:
- `proModel`: Pro 모델 크레딧 수
- `deepResearch`: 깊은 조사 크레딧 수

**주요 액션**:
```typescript
// 크레딧 사용
useProModelCredit(): boolean
useDeepResearchCredit(): boolean

// 묶음 구매
purchaseBundle(bundleType: BundleType): void

// 크레딧 추가 (관리자용)
addCredits(proModel: number, deepResearch: number): void

// 초기화
reset(): void
```

**묶음 구매 타입**:
- `pro_model_10`: Pro 모델 10개
- `deep_research_10`: 깊은 조사 10개
- `combo_package_10`: 콤보 패키지 (Pro 10개 + 깊은 조사 10개)

**사용 예시**:
```tsx
import { useCreditStore } from '@/store/creditStore';

function CreditInfo() {
  const {
    proModel,
    deepResearch,
    useProModelCredit
  } = useCreditStore();

  const handleUsePro = () => {
    if (useProModelCredit()) {
      console.log('Pro 모델 크레딧 사용 완료');
    } else {
      console.log('크레딧 부족');
    }
  };

  return (
    <div>
      <p>Pro 모델 크레딧: {proModel}개</p>
      <p>깊은 조사 크레딧: {deepResearch}개</p>
      <button onClick={handleUsePro}>Pro 모델 사용</button>
    </div>
  );
}
```

**Persistence**: ✅ localStorage에 자동 저장 (`credit-storage`)

---

### 4️⃣ historyStore.ts - Undo/Redo 히스토리

**경로**: `store/historyStore.ts`

**역할**: 슬라이드 편집 히스토리 관리 (Undo/Redo 기능)

**주요 상태**:
- `past`: 과거 프리젠테이션 스택 (최대 10개)
- `future`: 미래 프리젠테이션 스택 (Redo용)

**주요 액션**:
```typescript
// 히스토리 기록
pushHistory(presentation: Presentation): void

// Undo/Redo
undo(): Presentation | null
redo(): Presentation | null

// 상태 확인
canUndo(): boolean
canRedo(): boolean

// 초기화
clearHistory(): void
```

**사용 예시**:
```tsx
import { usePresentationStore } from '@/store/presentationStore';

function EditToolbar() {
  const { undo, redo, canUndo, canRedo } = usePresentationStore();

  return (
    <div>
      <button onClick={undo} disabled={!canUndo()}>
        실행 취소 (Undo)
      </button>
      <button onClick={redo} disabled={!canRedo()}>
        다시 실행 (Redo)
      </button>
    </div>
  );
}
```

**자동 히스토리 기록**: 다음 작업 시 자동 기록
- 슬라이드 업데이트
- 슬라이드 순서 변경
- 슬라이드 추가
- 슬라이드 삭제
- 슬라이드 복제
- 템플릿 변경

**제한사항**: 최대 10개까지 히스토리 유지 (메모리 효율)

---

## Store 패턴 및 컨벤션

### 1. Store 생성 패턴

**기본 구조**:
```typescript
import { create } from 'zustand';

interface MyState {
  // 상태
  value: number;

  // 액션
  increment: () => void;
}

export const useMyStore = create<MyState>((set, get) => ({
  value: 0,

  increment: () => set((state) => ({ value: state.value + 1 })),
}));
```

**Persistence 추가**:
```typescript
import { persist } from 'zustand/middleware';

export const useMyStore = create<MyState>()(
  persist(
    (set, get) => ({
      value: 0,
      increment: () => set((state) => ({ value: state.value + 1 })),
    }),
    {
      name: 'my-storage', // localStorage key
    }
  )
);
```

### 2. 네이밍 컨벤션

**Store 파일명**: `camelCase + Store.ts`
- ✅ `presentationStore.ts`
- ✅ `subscriptionStore.ts`
- ❌ `PresentationStore.ts`
- ❌ `presentation.store.ts`

**Hook 이름**: `use + PascalCase + Store`
- ✅ `usePresentationStore`
- ✅ `useSubscriptionStore`
- ❌ `usePresentationState`
- ❌ `presentationStore`

**액션 네이밍**:
- **Setter**: `set[Property]` (예: `setPlan`)
- **Getter**: `get[Property]` (예: `getMaxSlides`)
- **Boolean**: `is[State]` / `can[Action]` / `has[Property]`
  - 예: `isActive()`, `canUseFreePro()`, `hasWatermark()`
- **동작**: 동사 (예: `generatePresentation`, `updateSlide`)

### 3. 타입 정의

**인터페이스 네이밍**: `[Name]State`
```typescript
interface PresentationState {
  // 상태
  currentPresentation: Presentation | null;

  // 액션
  setCurrentPresentation: (presentation: Presentation | null) => void;
}
```

**타입 파일 분리**: 복잡한 타입은 `types/` 디렉토리에 정의
```typescript
import type { Presentation } from '@/types/presentation';
import type { SubscriptionPlan } from '@/types/monetization';
```

### 4. 로깅 컨벤션

**성공 로그**: ✅ 이모지 사용
```typescript
console.log('✅ 프리젠테이션 생성 완료!');
console.log('💾 프리젠테이션 저장 완료!');
```

**경고 로그**: ⚠️ 이모지 사용
```typescript
console.warn('⚠️ 마지막 슬라이드는 삭제할 수 없어요');
```

**에러 로그**: ❌ 이모지 사용
```typescript
console.error('❌ 프리젠테이션 생성 실패:', error);
```

**프로세스 로그**: 단계별 이모지
```typescript
console.log('🔍 1️⃣ 자료 조사 중...');
console.log('📝 2️⃣ 슬라이드 콘텐츠 생성 중...');
console.log('🎨 3️⃣ HTML 슬라이드 생성 중...');
```

### 5. 에러 처리

**기본 패턴**:
```typescript
try {
  // 작업 수행
  await someAsyncOperation();
  console.log('✅ 작업 완료');
} catch (error) {
  const errorMessage = error instanceof Error
    ? error.message
    : '알 수 없는 오류가 발생했습니다.';

  console.error('❌ 작업 실패:', error);

  set({
    isError: true,
    errorMessage,
  });
}
```

### 6. 비동기 작업

**async/await 사용**:
```typescript
generatePresentation: async (text: string) => {
  set({ isGenerating: true });

  try {
    const result = await apiCall(text);
    set({
      currentPresentation: result,
      isGenerating: false,
    });
  } catch (error) {
    set({
      isGenerating: false,
      generationError: error.message,
    });
  }
}
```

---

## 상태 사용 패턴

### 1. 컴포넌트에서 사용

**전체 상태 가져오기** (비권장 - 불필요한 리렌더링):
```tsx
const store = usePresentationStore(); // ❌ 모든 상태 변경 시 리렌더링
```

**필요한 상태만 선택** (권장):
```tsx
const currentPresentation = usePresentationStore(
  (state) => state.currentPresentation
); // ✅ currentPresentation 변경 시만 리렌더링
```

**여러 상태 선택**:
```tsx
const { isGenerating, generationStep, generatePresentation } = usePresentationStore(
  (state) => ({
    isGenerating: state.isGenerating,
    generationStep: state.generationStep,
    generatePresentation: state.generatePresentation,
  })
);
```

### 2. Store 간 상호작용

**다른 Store 사용**:
```typescript
// presentationStore.ts
generatePresentation: async (text: string) => {
  // subscriptionStore 가져오기
  const subscriptionStore = await import('@/store/subscriptionStore')
    .then(m => m.useSubscriptionStore.getState());

  const isFreeUser = subscriptionStore.plan === 'free';

  // ...
}
```

**주의사항**: 순환 참조 방지
- ❌ A Store가 B Store import, B Store가 A Store import
- ✅ 필요한 경우 동적 import 사용

### 3. 성능 최적화

**얕은 비교 (Shallow Compare)**:
```tsx
import { shallow } from 'zustand/shallow';

const { isGenerating, generationStep } = usePresentationStore(
  (state) => ({
    isGenerating: state.isGenerating,
    generationStep: state.generationStep,
  }),
  shallow
);
```

**메모이제이션**:
```tsx
const generatePresentation = usePresentationStore(
  (state) => state.generatePresentation
); // 함수는 항상 동일한 참조 유지
```

---

## 개발 팁

### 1. DevTools 사용

**설치**:
```bash
npm install zustand-devtools
```

**적용**:
```typescript
import { devtools } from 'zustand/middleware';

export const usePresentationStore = create<PresentationState>()(
  devtools(
    (set, get) => ({
      // ...
    }),
    { name: 'Presentation Store' }
  )
);
```

### 2. 상태 초기화

**앱 종료 시 초기화**:
```typescript
// 로그아웃 시 모든 Store 초기화
usePresentationStore.getState().clearPresentation();
useSubscriptionStore.getState().reset();
useCreditStore.getState().reset();
useHistoryStore.getState().clearHistory();
```

### 3. 테스트

**Store 테스트 예시**:
```typescript
import { usePresentationStore } from '@/store/presentationStore';

describe('presentationStore', () => {
  it('should generate presentation', async () => {
    const { generatePresentation, currentPresentation } =
      usePresentationStore.getState();

    await generatePresentation('Test input');

    expect(currentPresentation).not.toBeNull();
  });
});
```

---

## 참고 자료

### 내부 문서
- **[프로젝트 루트](../CLAUDE.md)**: PPT Maker 프로젝트 개요
- **[타입 정의](../types/)**: Store에서 사용하는 타입
- **[서비스 레이어](../services/)**: Store에서 호출하는 비즈니스 로직

### 외부 문서
- **[Zustand 공식 문서](https://docs.pmnd.rs/zustand/getting-started/introduction)**: Zustand 가이드
- **[Zustand Middleware](https://docs.pmnd.rs/zustand/integrations/persisting-store-data)**: Persistence, DevTools 등

---

**마지막 업데이트**: 2025-11-06
**변경 이력**: Store 디렉토리 가이드 초안 작성 (presentationStore, subscriptionStore, creditStore, historyStore)
