# Draft 모델 마이그레이션 가이드

## 개요

텍스트 입력 페이지에서 임시저장 기능을 추가하기 위해 `Draft` 모델을 Prisma 스키마에 추가했습니다.

## 변경사항

### 1. Prisma 스키마 업데이트

**파일**: `prisma/schema.prisma`

**추가된 모델**:
```prisma
model Draft {
  id        String   @id @default(cuid())
  userId    String   @unique
  content   String   @db.Text

  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("drafts")
}
```

**User 모델 수정**:
```prisma
model User {
  // ... 기존 필드 ...

  // Relations
  accounts         Account[]
  presentations    Presentation[]
  subscription     Subscription?
  creditTransactions CreditTransaction[]
  generationHistory  GenerationHistory[]
  draft            Draft?  // 추가됨

  // ... 나머지 ...
}
```

### 2. API 엔드포인트 추가

**파일**: `app/api/drafts/route.ts`

- `GET /api/drafts`: 현재 사용자의 임시저장 조회
- `POST /api/drafts`: 임시저장 내용 저장 (upsert)
- `DELETE /api/drafts`: 임시저장 내용 삭제

### 3. 타입 정의 추가

**파일**: `types/draft.ts`

### 4. input/page.tsx 수정

- 페이지 로드 시 임시저장 복원
- 텍스트 변경 시 1초 디바운스 자동 저장
- 생성 완료 시 임시저장 삭제
- 복원 모달 UI 추가

## 마이그레이션 실행

### 1단계: Prisma Client 재생성

```bash
cd /Users/jerome/dev/APP_in_TOSS/projects/ppt-maker-next
npx prisma generate
```

### 2단계: 마이그레이션 실행

```bash
npx prisma migrate dev --name add_draft_model
```

**출력 예시**:
```
Applying migration `20251108000000_add_draft_model`

The following migration(s) have been created and applied from new schema changes:

migrations/
  └─ 20251108000000_add_draft_model/
    └─ migration.sql

Your database is now in sync with your schema.

✔ Generated Prisma Client (v5.x.x) to ./node_modules/@prisma/client
```

### 3단계: 개발 서버 재시작

```bash
npm run dev
```

## 검증

### 1. 타입스크립트 타입 체크

```bash
npx tsc --noEmit
```

**예상 결과**: 에러 없음

### 2. API 테스트

**GET /api/drafts**:
```bash
curl -X GET http://localhost:3000/api/drafts \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

**POST /api/drafts**:
```bash
curl -X POST http://localhost:3000/api/drafts \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN" \
  -d '{"content":"테스트 임시저장"}'
```

**DELETE /api/drafts**:
```bash
curl -X DELETE http://localhost:3000/api/drafts \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

### 3. UI 테스트

1. `/input` 페이지 접속
2. 텍스트 입력 후 1초 대기 → 자동 저장 확인
3. 페이지 새로고침 → 복원 모달 표시 확인
4. "불러오기" 버튼 클릭 → 텍스트 복원 확인
5. 슬라이드 생성 완료 후 페이지 재방문 → 임시저장 없음 확인

## 롤백 (필요 시)

마이그레이션을 되돌리려면:

```bash
npx prisma migrate dev --name revert_draft_model
```

그리고 `prisma/schema.prisma`에서 Draft 모델과 User.draft 관계를 제거한 후:

```bash
npx prisma generate
```

## 주의사항

1. **프로덕션 배포 전**:
   - Supabase 프로덕션 데이터베이스에서도 마이그레이션 실행 필요
   - `DATABASE_URL` 환경 변수를 프로덕션 DB로 변경 후 `npx prisma migrate deploy`

2. **기존 사용자**:
   - 기존 사용자는 임시저장이 없으므로 복원 모달이 표시되지 않음

3. **디바운스 시간**:
   - 현재 1초로 설정되어 있음
   - 필요 시 조정 가능 (`app/input/page.tsx:101`)

## 문제 해결

### Prisma Client 타입 에러

```bash
npx prisma generate
npm run dev
```

### 마이그레이션 충돌

```bash
npx prisma migrate resolve --rolled-back "20251108000000_add_draft_model"
npx prisma migrate dev --name add_draft_model
```

### 데이터베이스 연결 실패

```bash
# .env.local 확인
cat .env.local | grep DATABASE_URL

# Supabase 대시보드에서 연결 문자열 확인
```

## 완료 체크리스트

- [x] Prisma 스키마 업데이트
- [x] API 엔드포인트 생성
- [x] 타입 정의 추가
- [x] input/page.tsx 수정
- [ ] Prisma 마이그레이션 실행 (`npx prisma migrate dev`)
- [ ] 타입 체크 (`npx tsc --noEmit`)
- [ ] UI 테스트 (로컬)
- [ ] 프로덕션 배포 (Vercel + Supabase)

---

**작성일**: 2025-11-08
**작성자**: Claude Code
