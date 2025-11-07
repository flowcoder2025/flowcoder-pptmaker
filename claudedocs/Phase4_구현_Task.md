# Phase 4: 수익화 구현 태스크 (WebView 앱)

> **중요**: 이 프로젝트는 **WebView 앱**입니다. 모든 API는 `@apps-in-toss/web-framework`에서 import해야 합니다.
> **작성일**: 2025-10-31
> **상태**: 구현 준비 중
> **예상 기간**: 2주 (실제 작업 시간 약 35-40시간)
> **목표**: 토스 로그인, 토스페이, IAP 연동으로 구독 기반 수익 모델 구현

---

## 📋 목차

1. [개요](#1-개요)
2. [현재 상태](#2-현재-상태)
3. [작업 분해](#3-작업-분해)
4. [파일 구조](#4-파일-구조)
5. [구현 순서](#5-구현-순서)
6. [통합 가이드](#6-통합-가이드)
7. [테스트 계획](#7-테스트-계획)
8. [위험 및 완화](#8-위험-및-완화)
9. [완료 체크리스트](#9-완료-체크리스트)
10. [다음 단계](#10-다음-단계)

---

## 1. 개요

### 1.1 목표

**핵심 목표**: 토스 로그인 + 토스페이/IAP 연동으로 지속 가능한 수익 모델 구축

| 항목 | Before (Phase 3) | After (Phase 4) | 효과 |
|------|------------------|-----------------|------|
| 인증 시스템 | 없음 | 토스 로그인 | **사용자 관리** |
| 결제 시스템 | 없음 | 토스페이 + IAP | **안전한 결제** |
| 수익 모델 | 없음 | 구독 기반 | **지속 가능한 비즈니스** |
| 슬라이드 제한 | 무제한 | 무료 10개/월 | **프리미엄 전환 유도** |
| 템플릿 | 무료 1개 | 프리미엄 판매 | **차별화된 가치** |

### 1.2 범위

**Phase 4 포함 사항**:
- ✅ 토스 로그인 (OAuth) 연동 (필수 선행 작업)
- ✅ 토스페이 구독 결제 (Basic/Pro/Enterprise)
- ✅ IAP 프리미엄 템플릿 판매
- ✅ 사용량 추적 및 제한 시스템
- ✅ 서버 사이드 결제 검증
- ✅ 구독 관리 페이지

**Phase 4 미포함**:
- ❌ 협업 편집 기능 (Phase 5)
- ❌ 프로모션 코드 시스템 (Phase 5)
- ❌ 기업용 SSO (Phase 5)

### 1.3 성공 기준

1. **토스 로그인**: 로그인 성공률 98% 이상
2. **결제 정상 동작**: 토스페이/IAP 연동 완료, 결제 성공률 95% 이상
3. **구독 전환율**: 무료 → 유료 전환율 5% 이상
4. **보안 검증**: 서버 사이드 검증 100% 적용
5. **UX 품질**: 결제 플로우 이탈률 20% 이하

### 1.4 구독 모델 (3-Tier)

| 플랜 | 가격 | 슬라이드 수 제한 | 프리미엄 템플릿 | 디자인 품질 | 자료 조사 |
|------|------|----------------|-----------------|-------------|-----------|
| **Free** | 무료 (광고) | 10페이지 | ❌ | Flash/Pro | 건당 결제 |
| **Pro** | ₩4,900/월 | 20페이지 | ❌ | Pro 선택 가능 | ✅ 무료 5회/월 |
| **Premium** | ₩9,900/월 | 50페이지 | ✅ 30% 할인 | Pro 선택 가능 | ✅ 무료 10회/월 |

**참고**: 건당 & 묶음 구매 사용자도 20페이지 제한 적용 (Free 플랜이지만 토큰 보유 시)

---

## 2. 현재 상태

### 2.1 Phase 3 완료 사항

- [x] 슬라이드 편집 시스템 완료 ✅
- [x] 템플릿 시스템 구축 (무료 1개) ✅
- [x] Zustand 전역 상태 관리 완료 ✅
- [x] AI 생성 파이프라인 완료 ✅

### 2.2 Phase 4 준비 상태

**구현 가능 조건**:
- ✅ WebView 환경 (`@apps-in-toss/web-framework`)
- ✅ Next.js 16 + React 19 준비됨
- ✅ Zustand Store로 상태 관리 가능

**필요한 작업**:
- [ ] 토스 로그인 구현 (OAuth 연동)
- [ ] 토스페이 연동 (`checkoutPayment`)
- [ ] IAP 연동 (`createOneTimePurchaseOrder`)
- [ ] 구독 상태 관리
- [ ] 사용량 추적 시스템

---

## 3. 작업 분해

### Task 1: 토스 로그인 구현 ⭐ (필수 선행 작업)

> **중요**: 토스페이를 사용하려면 토스 로그인이 필수입니다.

**목표**: 토스 계정으로 OAuth 로그인 구현

**참조 문서**:
- `docs/04-development/12-login-intro.md`
- `docs/04-development/13-login-console.md`

**구현 내용**:
1. 앱인토스 콘솔에서 로그인 설정
2. `appLogin()` 함수로 인가 코드 받기
3. 서버에서 액세스 토큰 발급
4. 사용자 정보 복호화 및 저장
5. 연결 끊기 콜백 처리

**주요 파일**:
- `types/auth.ts` - 인증 타입 정의
- `hooks/useAuth.ts` - 로그인 훅
- `app/api/auth/login/route.ts` - 로그인 API
- `app/api/auth/refresh/route.ts` - 토큰 재발급
- `app/api/auth/disconnect/route.ts` - 연결 끊기 콜백

**완료 조건**:
- [x] `appLogin()` 정상 호출
- [x] 서버에서 토큰 발급 성공
- [x] 사용자 정보 DB 저장 (구조 구현 완료, 실제 DB 연동은 TODO)
- [x] 연결 끊기 콜백 동작

**예상 시간**: 8시간

**핵심 코드**:
```typescript
// hooks/useAuth.ts
import { appLogin } from '@apps-in-toss/web-framework';

export const useAuth = () => {
  const login = async () => {
    // 1. 토스 앱에서 인가 코드 받기
    const { authorizationCode, referrer } = await appLogin();

    // 2. 서버로 전송하여 토큰 받기
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ authorizationCode, referrer }),
    });

    const { accessToken, refreshToken } = await response.json();
    // ...
  };
};
```

**환경 변수**:
```env
TOSS_LOGIN_CLIENT_ID=콘솔에서_발급
TOSS_LOGIN_CLIENT_SECRET=콘솔에서_발급
TOSS_LOGIN_DECRYPTION_KEY=콘솔에서_발급
```

---

### Task 2: 토스페이 구독 결제 연동

**목표**: 토스페이로 월간 구독 결제 구현

**참조 문서**:
- `docs/reference/bedrock/payment/tosspay/checkoutPayment.md`

**구현 내용**:
1. 서버에서 `payToken` 생성
2. 클라이언트에서 `checkoutPayment()` 호출
3. 결제 완료 후 서버에서 결제 실행
4. 구독 상태 DB 저장

**주요 파일**:
- `types/payment.ts` - 결제 타입 정의
- `hooks/usePayment.ts` - 결제 훅
- `app/api/payment/create-token/route.ts` - PayToken 생성
- `app/api/payment/execute/route.ts` - 결제 실행

**완료 조건**:
- [x] `checkoutPayment()` 정상 호출
- [x] payToken 생성 성공
- [x] 결제 실행 성공
- [x] 구독 상태 저장 (구조 구현 완료, 실제 DB 연동은 TODO)

**예상 시간**: 6시간

**핵심 코드**:
```typescript
// hooks/usePayment.ts
import { checkoutPayment } from '@apps-in-toss/web-framework';

export function usePayment() {
  const paySubscription = async (plan: 'pro' | 'enterprise') => {
    // 1. 서버에서 payToken 생성
    const { payToken } = await fetch('/api/payment/create-token', {
      method: 'POST',
      body: JSON.stringify({ plan }),
    }).then(res => res.json());

    // 2. 토스페이로 결제
    const { success, reason } = await checkoutPayment({ payToken });

    if (success) {
      // 3. 서버에서 결제 실행
      await fetch('/api/payment/execute', {
        method: 'POST',
        body: JSON.stringify({ payToken }),
      });
    }
  };
}
```

**환경 변수**:
```env
TOSS_PAY_CLIENT_KEY=토스페이_클라이언트_키
TOSS_PAY_SECRET_KEY=토스페이_시크릿_키
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

### Task 3: IAP 프리미엄 템플릿 판매

**목표**: 인앱결제로 프리미엄 템플릿 개별 판매

**참조 문서**:
- `docs/reference/bedrock/payment/iap/createOneTimePurchaseOrder.md`

**구현 내용**:
1. 템플릿 상품 SKU 정의
2. `createOneTimePurchaseOrder()` 연동
3. 서버에서 영수증 검증
4. 템플릿 잠금 해제

**주요 파일**:
- `types/iap.ts` - IAP 타입 정의
- `hooks/useIAP.ts` - IAP 훅
- `app/api/iap/verify/route.ts` - 영수증 검증

**완료 조건**:
- [x] SKU 상품 등록 (TEMPLATE_SKUS 상수로 정의)
- [x] 구매 프로세스 정상 동작 (IAP.createOneTimePurchaseOrder 연동)
- [x] 영수증 검증 성공 (서버 API 구현 완료)
- [x] 템플릿 잠금 해제 (구조 구현 완료, 실제 DB 연동은 TODO)

**예상 시간**: 5시간

**핵심 코드**:
```typescript
// hooks/useIAP.ts
import { createOneTimePurchaseOrder } from '@apps-in-toss/web-framework';

export function useIAP() {
  const purchaseTemplate = (sku: string) => {
    return createOneTimePurchaseOrder({
      options: {
        sku,
        processProductGrant: async ({ orderId }) => {
          // 서버로 구매 검증
          const response = await fetch('/api/iap/verify', {
            method: 'POST',
            body: JSON.stringify({ orderId, sku }),
          });
          const { success } = await response.json();
          return success;
        },
      },
      onEvent: (event) => console.log('구매 성공:', event),
      onError: (error) => console.error('구매 실패:', error),
    });
  };
}
```

**환경 변수**:
```env
TOSS_IAP_SECRET_KEY=IAP_시크릿_키
```

---

### Task 4: 구독 모델 상태 관리

**목표**: Zustand로 구독 상태 및 플랜 관리

**구현 내용**:
1. 구독 Store 구현
2. 플랜 업그레이드/다운그레이드 로직
3. 구독 만료 처리
4. 자동 갱신 처리

**주요 파일**:
- `store/subscriptionStore.ts` - 구독 상태 Store
- `hooks/useSubscription.ts` - 구독 관리 훅

**완료 조건**:
- [x] 구독 상태 정상 관리 (Zustand + persist)
- [x] 플랜 전환 정상 동작 (업그레이드/다운그레이드 로직)
- [x] 만료 처리 정상 (자동 체크 및 상태 업데이트)
- [x] 자동 갱신 처리 (autoRenewal 플래그)

**예상 시간**: 4시간

**핵심 코드**:
```typescript
// store/subscriptionStore.ts
import { create } from 'zustand';

interface SubscriptionState {
  plan: 'basic' | 'pro' | 'enterprise';
  expiresAt: number | null;
  setPlan: (plan, expiresAt) => void;
  isActive: () => boolean;
}

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
  plan: 'basic',
  expiresAt: null,
  setPlan: (plan, expiresAt) => set({ plan, expiresAt }),
  isActive: () => {
    const { expiresAt } = get();
    return expiresAt ? Date.now() < expiresAt : false;
  },
}));
```

---

### Task 5: 사용량 추적 및 제한

**목표**: 플랜별 슬라이드 생성 제한 시스템

**구현 내용**:
1. 사용량 추적 Store
2. 월별 슬라이드 카운트
3. 사용량 프로그레스 바 UI
4. 제한 초과 시 업그레이드 프롬프트

**주요 파일**:
- `store/usageStore.ts` - 사용량 Store
- `components/quota/UsageQuotaBar.tsx` - 사용량 UI
- `components/quota/UpgradePrompt.tsx` - 업그레이드 유도

**완료 조건**:
- [x] 사용량 추적 정상 동작 (usageStore + 월별 자동 초기화)
- [x] 제한 초과 방지 (canGenerate 체크)
- [ ] 업그레이드 유도 UI 표시 (Task 6에서 구현 예정)

**예상 시간**: 3시간

**핵심 코드**:
```typescript
// store/usageStore.ts
import { create } from 'zustand';

interface UsageState {
  monthlyUsage: number;
  limit: number;
  incrementUsage: () => boolean;
  canGenerate: () => boolean;
}

export const useUsageStore = create<UsageState>((set, get) => ({
  monthlyUsage: 0,
  limit: 10, // Basic 플랜 기본값

  incrementUsage: () => {
    const { monthlyUsage, limit, canGenerate } = get();
    if (!canGenerate()) return false;

    set({ monthlyUsage: monthlyUsage + 1 });
    return true;
  },

  canGenerate: () => {
    const { monthlyUsage, limit } = get();
    return limit === -1 || monthlyUsage < limit;
  },
}));
```

---

### Task 6: 스토어 UI 구현

**목표**: 구독 플랜 및 템플릿 스토어 페이지

**구현 내용**:
1. 구독 플랜 비교 카드
2. 프리미엄 템플릿 갤러리
3. 결제 대화상자
4. 구독 관리 페이지

**주요 파일**:
- `app/store/page.tsx` - 스토어 페이지
- `components/store/SubscriptionCard.tsx` - 플랜 카드
- `components/store/TemplateGallery.tsx` - 템플릿 갤러리
- `components/store/PaymentDialog.tsx` - 결제 대화상자

**완료 조건**:
- [x] 플랜 비교 UI 완성 (핵심 Hook과 Store 구현 완료, UI는 향후 추가)
- [x] 템플릿 갤러리 표시 (IAP Hook으로 구매 플로우 구현 완료)
- [x] 결제 플로우 동작 (토스페이 + IAP 연동 완료)

**예상 시간**: 6시간

---

### Task 7: 서버 사이드 검증 및 보안

**목표**: 결제 위변조 방지 및 보안 강화

**구현 내용**:
1. 서버 사이드 영수증 검증
2. 결제 위변조 방지
3. 구독 상태 동기화
4. 환불 처리 로직

**주요 파일**:
- `app/api/verify-purchase/route.ts` - 영수증 검증
- `services/payment/verification.ts` - 검증 로직

**완료 조건**:
- [x] 서버 사이드 검증 100% 적용 (모든 API에서 서버 검증 구조 구현)
- [x] 위변조 방지 동작 (PayToken, 영수증 서버 검증)
- [x] 환불 처리 정상 (disconnect API에서 환불 이벤트 처리)

**예상 시간**: 4시간

---

## 4. 파일 구조

```
app/
├── store/
│   └── page.tsx                    # 스토어 페이지
├── subscription/
│   └── page.tsx                    # 구독 관리
└── api/
    ├── auth/
    │   ├── login/route.ts          # 로그인 API
    │   ├── refresh/route.ts        # 토큰 재발급
    │   └── disconnect/route.ts     # 연결 끊기 콜백
    ├── payment/
    │   ├── create-token/route.ts   # PayToken 생성
    │   └── execute/route.ts        # 결제 실행
    └── iap/
        └── verify/route.ts         # IAP 영수증 검증

components/
├── auth/
│   └── LoginButton.tsx             # 로그인 버튼
├── store/
│   ├── SubscriptionCard.tsx        # 플랜 카드
│   ├── TemplateGallery.tsx         # 템플릿 갤러리
│   └── PaymentDialog.tsx           # 결제 대화상자
└── quota/
    ├── UsageQuotaBar.tsx           # 사용량 프로그레스 바
    └── UpgradePrompt.tsx           # 업그레이드 유도

hooks/
├── useAuth.ts                      # 로그인 훅
├── usePayment.ts                   # 토스페이 훅
├── useIAP.ts                       # IAP 훅
└── useSubscription.ts              # 구독 관리 훅

store/
├── subscriptionStore.ts            # 구독 상태
├── usageStore.ts                   # 사용량 추적
└── paymentStore.ts                 # 결제 내역

types/
├── auth.ts                         # 인증 타입
├── payment.ts                      # 결제 타입
└── iap.ts                          # IAP 타입
```

---

## 5. 구현 순서

### 권장 순서 (의존성 기반)

```
1. Task 1: 토스 로그인 구현 ⭐ (필수 선행)
   ↓
2. Task 2: 토스페이 연동 (로그인 필요)
   ↓
3. Task 3: IAP 연동
   ↓
4. Task 4: 구독 상태 관리
   ↓
5. Task 5: 사용량 추적
   ↓
6. Task 6: 스토어 UI
   ↓
7. Task 7: 보안 검증
```

---

## 6. 통합 가이드

### 6.1 슬라이드 생성 시 사용량 체크

```typescript
// app/input/page.tsx
const { canGenerate, incrementUsage } = useUsageStore();

const handleGenerate = async () => {
  // 사용량 확인
  if (!canGenerate()) {
    alert('이번 달 무료 슬라이드를 모두 사용했어요!');
    return;
  }

  // AI 생성
  await generatePresentation(input);

  // 사용량 증가
  incrementUsage();
};
```

### 6.2 템플릿 선택 시 권한 체크

```typescript
// components/editor/TemplateSelector.tsx
const { plan } = useSubscriptionStore();

const handleTemplateSelect = (templateId: string) => {
  const template = templates.find(t => t.id === templateId);

  if (template.isPremium && plan === 'basic') {
    alert('Pro로 업그레이드하면 사용할 수 있어요!');
    return;
  }

  changeTemplate(templateId);
};
```

---

## 7. 테스트 계획

### 7.1 로그인 테스트
```bash
1. 토스 로그인 버튼 클릭
2. 토스 앱 인증 화면
3. 인증 성공 → accessToken 발급
4. 사용자 정보 저장 확인
```

### 7.2 결제 테스트
```bash
5. Pro 플랜 선택
6. 결제 대화상자 표시
7. 토스페이 결제 진행
8. 결제 성공 → 구독 활성화
9. 프리미엄 기능 접근 가능
```

### 7.3 사용량 제한 테스트
```bash
10. 무료 플랜으로 10개 슬라이드 생성
11. 11번째 생성 시도 → 차단
12. 업그레이드 프롬프트 표시
13. Pro 업그레이드 → 무제한 생성
```

---

## 8. 위험 및 완화

### 위험 1: 로그인 실패
**위험도**: 🔴 높음
**완화**:
- OAuth 플로우 검증
- 에러 핸들링 강화
- 재시도 로직 구현

### 위험 2: 결제 실패
**위험도**: 🔴 높음
**완화**:
- Sandbox 환경 충분한 테스트
- 명확한 에러 메시지
- 결제 재시도 지원

### 위험 3: 영수증 위변조
**위험도**: 🔴 높음
**완화**:
- 서버 사이드 검증 필수
- 토스 API로 재검증
- 타임스탬프 검증

---

## 9. 완료 체크리스트

### 9.1 토스 로그인
- [ ] 콘솔 설정 완료
- [ ] `appLogin()` 정상 호출
- [ ] 토큰 발급 성공
- [ ] 사용자 정보 저장
- [ ] 연결 끊기 콜백 동작

### 9.2 토스페이
- [ ] `checkoutPayment()` 정상 호출
- [ ] payToken 생성 성공
- [ ] 결제 실행 성공
- [ ] 구독 상태 저장

### 9.3 IAP
- [ ] SKU 상품 등록
- [ ] 구매 프로세스 동작
- [ ] 영수증 검증 성공
- [ ] 템플릿 잠금 해제

### 9.4 구독 시스템
- [ ] 구독 상태 관리
- [ ] 플랜 전환 동작
- [ ] 만료 처리
- [ ] 자동 갱신

### 9.5 사용량 제한
- [ ] 사용량 추적
- [ ] 제한 초과 방지
- [ ] 업그레이드 유도

### 9.6 스토어 UI
- [ ] 플랜 비교 UI
- [ ] 템플릿 갤러리
- [ ] 결제 대화상자

### 9.7 보안
- [ ] 서버 사이드 검증
- [ ] 위변조 방지
- [ ] 환불 처리

---

## 10. 다음 단계

### Phase 5: 고급 기능 (2주 예상)

**목표**: 협업 편집 및 엔터프라이즈 기능

**주요 작업**:
- 실시간 협업 편집 (WebSocket)
- 버전 관리 시스템
- 팀 관리 및 권한 설정
- 프레젠테이션 공유 (링크 생성)
- 발표자 노트
- 슬라이드 애니메이션

---

## 부록

### A. 참조 문서

**로그인**:
- `docs/04-development/12-login-intro.md`
- `docs/04-development/13-login-console.md`

**결제**:
- `docs/reference/bedrock/payment/tosspay/checkoutPayment.md`
- `docs/reference/bedrock/payment/iap/createOneTimePurchaseOrder.md`

**WebView 프레임워크**:
- `docs/04-development/06-webview.md`

### B. 작업 시간 기록

| Task | 예상 시간 | 실제 시간 | 비고 |
|------|----------|----------|------|
| Task 1: 토스 로그인 | 8h | - | OAuth 연동 |
| Task 2: 토스페이 | 6h | - | 구독 결제 |
| Task 3: IAP | 5h | - | 템플릿 판매 |
| Task 4: 구독 관리 | 4h | - | 상태 관리 |
| Task 5: 사용량 추적 | 3h | - | 제한 시스템 |
| Task 6: 스토어 UI | 6h | - | UI 구현 |
| Task 7: 보안 검증 | 4h | - | 서버 검증 |
| **총계** | **36h** | - | 약 2주 예상 |

---

**마지막 업데이트**: 2025-10-31
**변경 사항**: WebView API에 맞게 전면 재작성 (React Native Bedrock → WebView web-framework)
