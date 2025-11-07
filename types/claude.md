# types/ - TypeScript 타입 정의

> **역할**: 프로젝트 전역에서 사용되는 TypeScript 타입 및 인터페이스 정의
> **상위 문서**: [../CLAUDE.md](../CLAUDE.md)

---

## 개요

이 디렉토리는 PPT Maker 프로젝트의 모든 TypeScript 타입 정의를 중앙화하여 관리합니다.

**설계 원칙**:
- **단일 진실 원천**: 모든 타입은 이곳에서 정의되고 export
- **도메인 분리**: 비즈니스 도메인별로 파일 분리
- **재사용성**: 공통 타입은 한 곳에서 정의
- **타입 안정성**: `strict: true` 준수, `any` 사용 금지

---

## 타입 파일 목록

### 🎨 슬라이드 및 프리젠테이션

#### `slide.ts`
슬라이드 및 템플릿 관련 타입 정의

**주요 타입**:
- `Slide`: 개별 슬라이드 데이터 구조
- `SlideType`: 슬라이드 유형 (title, content, image, etc.)
- `SlideContent`: 슬라이드 콘텐츠 (텍스트, 이미지, 레이아웃 등)
- `SlideStyle`: 슬라이드 스타일링 (배경, 폰트, 색상 등)

**사용 예시**:
```typescript
import type { Slide, SlideType } from '@/types/slide'

const titleSlide: Slide = {
  type: 'title',
  content: { title: '제목', subtitle: '부제목' },
  style: { background: '#ffffff' }
}
```

#### `presentation.ts`
프리젠테이션 전체 구조 및 메타데이터

**주요 타입**:
- `Presentation`: 프리젠테이션 전체 데이터
- `PresentationMetadata`: 제목, 작성자, 생성일 등
- `PresentationSettings`: 화면 비율, 테마 설정 등

**사용 예시**:
```typescript
import type { Presentation } from '@/types/presentation'

const ppt: Presentation = {
  id: 'ppt-123',
  metadata: { title: '나의 발표', author: 'user' },
  slides: [/* Slide[] */],
  settings: { aspectRatio: '16:9', theme: 'light' }
}
```

---

### 🤖 AI 서비스

#### `gemini.ts`
Google Gemini API 요청/응답 타입

**주요 타입**:
- `GeminiModel`: 모델 종류 (flash-lite, flash, pro)
- `GeminiRequest`: API 요청 파라미터
- `GeminiResponse`: API 응답 구조
- `GeminiError`: 에러 코드 및 메시지

**사용 예시**:
```typescript
import type { GeminiModel, GeminiRequest } from '@/types/gemini'

const request: GeminiRequest = {
  model: 'gemini-flash',
  prompt: '프리젠테이션 생성해줘',
  temperature: 0.7
}
```

#### `research.ts`
Perplexity AI 자료 조사 타입

**주요 타입**:
- `ResearchRequest`: 조사 요청 (키워드, 깊이 등)
- `ResearchResponse`: 조사 결과 (출처, 인용, 요약)
- `ResearchSource`: 개별 출처 정보

**사용 예시**:
```typescript
import type { ResearchRequest } from '@/types/research'

const research: ResearchRequest = {
  query: '인공지능 최신 동향',
  depth: 'detailed', // 'quick' | 'detailed'
  sources: 5
}
```

---

### 💰 수익화 (Monetization)

#### `monetization.ts`
수익화 전반의 공통 타입 및 설정

**주요 타입**:
- `SubscriptionPlan`: 구독 플랜 (Free, Premium 등)
- `PaymentStatus`: 결제 상태 (pending, completed, failed 등)
- `FeatureGate`: 기능별 접근 제어 설정

**사용 예시**:
```typescript
import type { SubscriptionPlan, FeatureGate } from '@/types/monetization'

const plan: SubscriptionPlan = {
  id: 'premium',
  name: '프리미엄',
  price: 5900,
  features: ['unlimited-slides', 'advanced-templates']
}

const gate: FeatureGate = {
  feature: 'advanced-templates',
  requiredPlan: 'premium'
}
```

#### `payment.ts`
결제 처리 관련 타입

**주요 타입**:
- `PaymentMethod`: 결제 수단 (토스페이, 카드, 간편결제 등)
- `PaymentRequest`: 결제 요청 데이터
- `PaymentResult`: 결제 완료 결과

**사용 예시**:
```typescript
import type { PaymentRequest } from '@/types/payment'

const paymentReq: PaymentRequest = {
  amount: 5900,
  method: 'toss-pay',
  planId: 'premium',
  userId: 'user-123'
}
```

#### `iap.ts`
앱 내 구매(In-App Purchase) 타입

**주요 타입**:
- `IAPProduct`: 구매 가능한 상품 정보
- `IAPReceipt`: 영수증 검증 데이터
- `IAPStatus`: 구매 진행 상태

**사용 예시**:
```typescript
import type { IAPProduct } from '@/types/iap'

const product: IAPProduct = {
  productId: 'premium-monthly',
  price: 5900,
  currency: 'KRW',
  type: 'subscription'
}
```

---

### 👤 사용자 및 인증

#### `auth.ts`
사용자 인증 및 세션 관련 타입

**주요 타입**:
- `User`: 사용자 프로필 (ID, 이름, 이메일 등)
- `AuthSession`: 인증 세션 (토큰, 만료 시간 등)
- `AuthProvider`: 인증 제공자 (토스, 카카오 등)

**사용 예시**:
```typescript
import type { User, AuthSession } from '@/types/auth'

const user: User = {
  id: 'user-123',
  name: '홍길동',
  email: 'hong@example.com',
  plan: 'premium'
}

const session: AuthSession = {
  token: 'jwt-token',
  userId: 'user-123',
  expiresAt: new Date('2025-12-31')
}
```

---

## 타입 작성 규칙

### 1. 네이밍 컨벤션

**타입/인터페이스**: PascalCase
```typescript
type SlideContent = { /* ... */ }
interface PresentationMetadata { /* ... */ }
```

**유니온 타입**: camelCase (값은 kebab-case)
```typescript
type SlideType = 'title' | 'content' | 'image' | 'two-column'
type PaymentStatus = 'pending' | 'completed' | 'failed'
```

**Enum**: PascalCase (키 PascalCase, 값 UPPER_SNAKE_CASE)
```typescript
enum GeminiModel {
  FlashLite = 'FLASH_LITE',
  Flash = 'FLASH',
  Pro = 'PRO'
}
```

### 2. 타입 vs 인터페이스

**Type 사용 (권장)**:
- 유니온, 교차 타입
- 유틸리티 타입 조합
- 프리미티브 alias

```typescript
type SlideType = 'title' | 'content' | 'image'
type ReadonlySlide = Readonly<Slide>
```

**Interface 사용**:
- 객체 구조 정의
- 확장 가능성 필요
- 외부 라이브러리 타입 확장

```typescript
interface Slide {
  id: string
  type: SlideType
  content: SlideContent
}

// 확장 예시
interface AdvancedSlide extends Slide {
  animation?: string
  transition?: string
}
```

### 3. 타입 안정성 규칙

#### ❌ 금지 사항
```typescript
// any 사용 금지
const data: any = fetchData()

// 암묵적 any 금지
function process(value) { /* ... */ }

// 타입 단언 남용 금지
const user = data as User // 검증 없이 단언
```

#### ✅ 권장 사항
```typescript
// 명시적 타입 정의
const data: SlideContent = fetchSlideContent()

// 제네릭 사용
function process<T>(value: T): T { /* ... */ }

// 타입 가드 사용
function isSlide(data: unknown): data is Slide {
  return typeof data === 'object' && data !== null && 'id' in data
}
```

### 4. Optional vs Nullable

**Optional 속성**: 존재하지 않을 수 있음
```typescript
interface Slide {
  id: string
  subtitle?: string  // 부제목은 없을 수 있음
}
```

**Nullable 속성**: 명시적 null 가능
```typescript
interface User {
  profileImage: string | null  // 프로필 이미지는 명시적으로 없음 표시
}
```

### 5. 주석 작성

**JSDoc 스타일** (공개 API):
```typescript
/**
 * 슬라이드 데이터 구조
 *
 * @example
 * ```typescript
 * const slide: Slide = {
 *   id: 'slide-1',
 *   type: 'title',
 *   content: { title: '제목' }
 * }
 * ```
 */
export interface Slide {
  /** 고유 식별자 */
  id: string
  /** 슬라이드 유형 */
  type: SlideType
  /** 슬라이드 콘텐츠 */
  content: SlideContent
}
```

**인라인 주석** (복잡한 타입):
```typescript
type PaymentMethod =
  | 'toss-pay'      // 토스페이 간편결제
  | 'credit-card'   // 신용카드
  | 'bank-transfer' // 계좌이체
```

---

## 타입 import 패턴

### 1. 명시적 타입 import (권장)
```typescript
import type { Slide, SlideType } from '@/types/slide'
import type { User } from '@/types/auth'
```

### 2. 전체 타입 import (대량 사용 시)
```typescript
import * as SlideTypes from '@/types/slide'

const slide: SlideTypes.Slide = { /* ... */ }
```

### 3. 타입과 값 혼용 (필요시)
```typescript
// Enum은 타입이자 값
import { GeminiModel } from '@/types/gemini'

const model = GeminiModel.Flash // 값 사용
type Model = GeminiModel         // 타입 사용
```

---

## 타입 테스트 (선택)

복잡한 타입은 타입 레벨 테스트 고려:

```typescript
// types/__tests__/slide.test-d.ts
import { expectType } from 'tsd'
import type { Slide } from '@/types/slide'

// 타입 검증
expectType<Slide>({
  id: 'slide-1',
  type: 'title',
  content: { title: 'Hello' }
})

// 타입 오류 검증
// @ts-expect-error - type 필드는 필수
const invalidSlide: Slide = { id: 'slide-1' }
```

---

## 상위 문서 참조

- **[프로젝트 루트](../CLAUDE.md)**: PPT Maker 프로젝트 개요
- **[아키텍처](../ARCHITECTURE.md)**: 전체 시스템 설계
- **[서비스 레이어](../services/claude.md)**: 타입 사용 컨텍스트

---

## 확장 가이드

### 새 타입 파일 추가 시

1. **도메인 확인**: 기존 파일에 포함 가능한지 검토
2. **파일 생성**: `types/[domain].ts` 형식
3. **Export**: 명시적 export 사용
4. **문서화**: JSDoc 주석 추가
5. **이 문서 업데이트**: 새 파일 설명 추가

**예시**: 알림(Notification) 타입 추가
```typescript
// types/notification.ts

/**
 * 사용자 알림 타입
 */
export interface Notification {
  id: string
  type: NotificationType
  message: string
  createdAt: Date
}

export type NotificationType = 'info' | 'warning' | 'error' | 'success'
```

그 후 이 문서의 "타입 파일 목록"에 추가.

---

**마지막 업데이트**: 2025-11-06
**변경 이력**: types/ 디렉토리 가이드 문서 생성
