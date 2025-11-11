# 포트원 V2 결제 시스템 통합 가이드

> **버전**: PortOne V2
> **SDK**: @portone/browser-sdk
> **작성일**: 2025-11-12

---

## 개요

FlowCoder PPT Maker는 포트원 V2를 사용하여 구독 결제 및 크레딧 충전 기능을 제공합니다.

**지원 결제 방식**:
- 신용카드
- 간편결제 (토스페이, 카카오페이, 네이버페이 등)
- 가상계좌
- 계좌이체

---

## 환경 설정

### 1. 환경 변수

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```bash
# PortOne V2 API Keys
NEXT_PUBLIC_PORTONE_STORE_ID=store-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
PORTONE_API_SECRET=your_api_secret_here
PORTONE_WEBHOOK_SECRET=your_webhook_secret_here
```

**주의사항**:
- `NEXT_PUBLIC_PORTONE_STORE_ID`: 클라이언트에 노출됨 (안전)
- `PORTONE_API_SECRET`: 서버 전용 (절대 노출 금지)
- `PORTONE_WEBHOOK_SECRET`: Webhook 검증용 (서버 전용)

### 2. 포트원 계정 설정

1. [포트원 관리자 콘솔](https://admin.portone.io) 접속
2. 상점 생성 및 Store ID 확인
3. API Key 생성:
   - 설정 > API Key > API Secret 생성
   - Webhook Secret 생성
4. Webhook URL 등록:
   - `https://yourdomain.com/api/payments/webhook`

---

## 데이터베이스 스키마

### Payment 테이블

```prisma
model Payment {
  id                    String    @id @default(cuid())
  paymentId             String    @unique  // 포트원 결제 ID
  userId                String              // 사용자 ID
  amount                Int                 // 결제 금액 (원)
  currency              String    @default("KRW")
  status                String              // 'PENDING', 'PAID', 'FAILED', 'CANCELED', 'REFUNDED'
  method                String?             // 결제 방법
  purpose               String              // 'SUBSCRIPTION_UPGRADE', 'CREDIT_PURCHASE'
  subscriptionId        String?             // 구독 ID (nullable)
  creditTransactionId   String?   @unique   // 크레딧 거래 ID (nullable)
  portoneData           Json                // 포트원 응답 데이터
  receiptUrl            String?             // 영수증 URL
  failReason            String?   @db.Text  // 실패 사유

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  subscription          Subscription? @relation(fields: [subscriptionId], references: [id], onDelete: SetNull)
  creditTransaction     CreditTransaction? @relation(fields: [creditTransactionId], references: [id], onDelete: SetNull)

  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  @@index([userId, createdAt])
  @@index([status])
  @@index([purpose])
  @@map("payments")
}
```

### BillingKey 테이블 (향후)

정기 결제용 빌링키 관리 테이블 (현재는 일회성 결제만 지원)

---

## API 플로우

### 1. 결제 요청 생성

**클라이언트**:
```typescript
// 1. 결제 요청 생성 API 호출
const response = await fetch('/api/payments/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    purpose: 'SUBSCRIPTION_UPGRADE',
    amount: 5900,
    orderName: '프리미엄 구독 (1개월)',
    subscriptionId: 'sub_xxx',
  }),
});

const { success, paymentId, paymentRequest } = await response.json();

// 2. 포트원 SDK로 결제창 열기
import { requestPayment } from '@portone/browser-sdk';

const { code, message, paymentId: txPaymentId, transactionId, txId } = await requestPayment(paymentRequest);

// 3. 결제 검증 API 호출
const verifyResponse = await fetch('/api/payments/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    paymentId,
    txId,
  }),
});

const { success: verified, payment, subscription, credits } = await verifyResponse.json();

if (verified) {
  // 결제 성공 처리
} else {
  // 결제 실패 처리
}
```

**서버 (API Routes)**:
1. `POST /api/payments/request`: Payment 레코드 생성 (status: PENDING)
2. 클라이언트: 포트원 SDK로 결제창 열기
3. `POST /api/payments/verify`: 포트원 API로 결제 검증 + DB 업데이트
4. `POST /api/payments/webhook`: 포트원에서 비동기로 결제 상태 동기화

---

## API 엔드포인트

### POST /api/payments/request

**설명**: 결제 요청 생성

**인증**: NextAuth 세션 필요

**Request Body**:
```typescript
{
  purpose: 'SUBSCRIPTION_UPGRADE' | 'CREDIT_PURCHASE',
  amount: number,
  orderName: string,
  subscriptionId?: string,
  creditAmount?: number,
  payMethod?: 'CARD' | 'VIRTUAL_ACCOUNT' | 'EASY_PAY' | ...,
}
```

**Response**:
```typescript
{
  success: boolean,
  paymentId?: string,
  paymentRequest?: PortOnePaymentRequest,
  error?: string,
}
```

### POST /api/payments/verify

**설명**: 결제 검증 및 처리

**인증**: NextAuth 세션 필요

**Request Body**:
```typescript
{
  paymentId: string,
  txId: string,  // 포트원에서 반환
}
```

**Response**:
```typescript
{
  success: boolean,
  payment?: {
    id: string,
    status: 'PAID' | 'FAILED' | ...,
    amount: number,
    paidAt?: string,
    receiptUrl?: string,
  },
  subscription?: {
    id: string,
    tier: string,
    status: string,
    endDate?: string,
  },
  credits?: {
    amount: number,
    balance: number,
  },
  error?: string,
}
```

### POST /api/payments/webhook

**설명**: 포트원 Webhook 수신

**인증**: PORTONE_WEBHOOK_SECRET 검증

**Request Body**:
```typescript
{
  type: 'Transaction.Paid' | 'Transaction.Failed' | ...,
  timestamp: string,
  data: {
    paymentId?: string,
    status?: string,
    amount?: number,
    ...
  },
}
```

**Response**:
```typescript
{
  received: boolean,
}
```

---

## 테스트 가이드

### 1. 로컬 테스트 준비

**1-1. Ngrok 설치 (Webhook 테스트용)**
```bash
# macOS
brew install ngrok

# 실행
ngrok http 3000
```

**1-2. 포트원 콘솔에서 Webhook URL 등록**
```
https://your-ngrok-url.ngrok.io/api/payments/webhook
```

### 2. 테스트 시나리오

#### 시나리오 1: 구독 업그레이드

1. 로그인 (`/login`)
2. 구독 페이지 (`/subscription`)
3. "프리미엄 플랜 구독" 버튼 클릭
4. 포트원 결제창에서 테스트 카드 입력:
   - 카드번호: `4111-1111-1111-1111`
   - 만료일: `12/25`
   - CVC: `123`
5. 결제 완료 후 구독 상태 확인
6. DB 확인:
   ```sql
   SELECT * FROM payments WHERE purpose = 'SUBSCRIPTION_UPGRADE';
   SELECT * FROM subscriptions WHERE status = 'ACTIVE';
   ```

#### 시나리오 2: 크레딧 충전

1. 로그인 (`/login`)
2. 크레딧 페이지 (`/credits`)
3. "크레딧 10개 구매 (1,000원)" 버튼 클릭
4. 포트원 결제창에서 결제
5. 결제 완료 후 크레딧 잔액 확인
6. DB 확인:
   ```sql
   SELECT * FROM payments WHERE purpose = 'CREDIT_PURCHASE';
   SELECT * FROM credit_transactions WHERE type = 'PURCHASE';
   ```

### 3. API 직접 테스트 (curl)

**결제 요청 생성**:
```bash
curl -X POST http://localhost:3000/api/payments/request \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -d '{
    "purpose": "CREDIT_PURCHASE",
    "amount": 1000,
    "orderName": "크레딧 10개",
    "creditAmount": 10
  }'
```

**결제 검증**:
```bash
curl -X POST http://localhost:3000/api/payments/verify \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=your_session_token" \
  -d '{
    "paymentId": "pay_xxx",
    "txId": "tx_xxx"
  }'
```

---

## 트러블슈팅

### 1. 결제창이 열리지 않음

**원인**: `NEXT_PUBLIC_PORTONE_STORE_ID`가 설정되지 않음

**해결**:
```bash
# .env.local 확인
echo $NEXT_PUBLIC_PORTONE_STORE_ID
```

### 2. 결제 검증 실패

**원인**: `PORTONE_API_SECRET`이 잘못됨

**해결**:
1. 포트원 콘솔에서 API Secret 재확인
2. `.env.local` 업데이트
3. 개발 서버 재시작

### 3. Webhook이 호출되지 않음

**원인**: Webhook URL이 등록되지 않았거나 로컬 환경

**해결**:
1. Ngrok으로 로컬 서버 노출
2. 포트원 콘솔에서 Webhook URL 등록
3. PORTONE_WEBHOOK_SECRET 검증

### 4. 결제 상태가 PENDING에서 변하지 않음

**원인**: Webhook이 도착하지 않았거나 처리 실패

**해결**:
1. 포트원 콘솔에서 Webhook 로그 확인
2. 서버 로그 확인: `console.log('[Payment Webhook]')`
3. DB에서 Payment 레코드 확인
4. 필요시 수동으로 verify API 호출

---

## 보안 고려사항

### 1. API Secret 보호

- ❌ 클라이언트에 노출 금지
- ✅ 서버 환경 변수에만 저장
- ✅ Git에 커밋 금지 (`.gitignore`에 `.env.local` 추가)

### 2. Webhook 검증

- 모든 Webhook 요청은 PORTONE_WEBHOOK_SECRET으로 검증
- Authorization 헤더에 Secret 포함 확인

### 3. 결제 금액 검증

- 클라이언트에서 전송된 금액을 서버에서 재확인
- 포트원 API 응답의 금액과 DB의 금액 비교

### 4. 중복 결제 방지

- `paymentId`를 고유 키로 사용
- 동일한 `paymentId`로 여러 번 검증해도 한 번만 처리

---

## 참고 자료

- [포트원 V2 공식 문서](https://developers.portone.io/opi/ko?v=v2)
- [포트원 JavaScript SDK](https://developers.portone.io/opi/ko/sdk/javascript-sdk/v2?v=v2)
- [포트원 관리자 콘솔](https://admin.portone.io)
- [포트원 Webhook 가이드](https://developers.portone.io/opi/ko/webhook?v=v2)

---

**마지막 업데이트**: 2025-11-12
**작성자**: Claude Code
