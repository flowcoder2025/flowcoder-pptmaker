-- ========================================
-- FlowCoder PPT Maker - Supabase Migration SQL
-- ========================================
--
-- Project: PPT Maker (Web Service)
-- Database: Supabase PostgreSQL
-- ORM: Prisma
-- Auth: NextAuth.js (OAuth + Email/Password)
--
-- 목적: 백지 상태의 Supabase 데이터베이스에 전체 스키마 생성
--
-- 테이블:
--   1. users (User)
--   2. accounts (Account - NextAuth OAuth)
--   3. sessions (Session - NextAuth)
--   4. verification_tokens (VerificationToken - NextAuth)
--   5. presentations (Presentation)
--   6. subscriptions (Subscription)
--   7. credit_transactions (CreditTransaction)
--   8. generation_history (GenerationHistory)
--   9. relation_tuples (RelationTuple - Zanzibar)
--  10. relation_definitions (RelationDefinition - Zanzibar)
--
-- 실행 방법:
--   1. Supabase Dashboard > SQL Editor 접속
--   2. 이 파일 전체 내용 복사
--   3. "Run" 버튼 클릭
--
-- ========================================

-- ========================================
-- 1. Extension 활성화
-- ========================================

-- pgcrypto extension (UUID 생성용)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================
-- 2. 테이블 생성 (의존성 순서)
-- ========================================

-- ----------------------------------------
-- 2.1 users (User)
-- ----------------------------------------
-- NextAuth.js 사용자 정보 + 이메일 로그인 지원

CREATE TABLE IF NOT EXISTS "users" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP(3),
  "image" TEXT,
  "password" TEXT,  -- Nullable: OAuth 사용자는 null, 이메일 로그인 사용자는 bcrypt 해시
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 이메일 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

COMMENT ON TABLE "users" IS 'NextAuth.js 사용자 테이블 (OAuth + Email 로그인)';
COMMENT ON COLUMN "users"."password" IS 'bcrypt 해시 패스워드 (이메일 로그인용, OAuth는 null)';

-- ----------------------------------------
-- 2.2 accounts (Account)
-- ----------------------------------------
-- NextAuth.js OAuth 계정 정보 (GitHub, Google)

CREATE TABLE IF NOT EXISTS "accounts" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "provider" TEXT NOT NULL,
  "providerAccountId" TEXT NOT NULL,
  "refresh_token" TEXT,
  "access_token" TEXT,
  "expires_at" INTEGER,
  "token_type" TEXT,
  "scope" TEXT,
  "id_token" TEXT,
  "session_state" TEXT,

  CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Unique constraint: provider + providerAccountId
CREATE UNIQUE INDEX IF NOT EXISTS "accounts_provider_providerAccountId_key"
  ON "accounts"("provider", "providerAccountId");

COMMENT ON TABLE "accounts" IS 'NextAuth.js OAuth 계정 테이블 (GitHub, Google)';

-- ----------------------------------------
-- 2.3 sessions (Session)
-- ----------------------------------------
-- NextAuth.js 세션 (JWT 전략 사용 시 실제로는 미사용)

CREATE TABLE IF NOT EXISTS "sessions" (
  "id" TEXT PRIMARY KEY,
  "sessionToken" TEXT UNIQUE NOT NULL,
  "userId" TEXT NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Session token 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS "sessions_sessionToken_key" ON "sessions"("sessionToken");

COMMENT ON TABLE "sessions" IS 'NextAuth.js 세션 테이블 (JWT 전략 사용 시 미사용)';

-- ----------------------------------------
-- 2.4 verification_tokens (VerificationToken)
-- ----------------------------------------
-- NextAuth.js 이메일 인증 토큰

CREATE TABLE IF NOT EXISTS "verification_tokens" (
  "identifier" TEXT NOT NULL,
  "token" TEXT UNIQUE NOT NULL,
  "expires" TIMESTAMP(3) NOT NULL
);

-- Unique constraint: identifier + token
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_identifier_token_key"
  ON "verification_tokens"("identifier", "token");

-- Token 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS "verification_tokens_token_key" ON "verification_tokens"("token");

COMMENT ON TABLE "verification_tokens" IS 'NextAuth.js 이메일 인증 토큰';

-- ----------------------------------------
-- 2.5 presentations (Presentation)
-- ----------------------------------------
-- 사용자가 생성한 프리젠테이션

CREATE TABLE IF NOT EXISTS "presentations" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "slideData" JSONB NOT NULL,  -- UnifiedPPTJSON 구조 (21개 슬라이드 타입)
  "metadata" JSONB,  -- { totalSlides, createdWith, version, researchUsed, generationTime }
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "deletedAt" TIMESTAMP(3),  -- 소프트 삭제
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "presentations_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS "presentations_userId_idx" ON "presentations"("userId");
CREATE INDEX IF NOT EXISTS "presentations_isPublic_idx" ON "presentations"("isPublic");
CREATE INDEX IF NOT EXISTS "presentations_deletedAt_idx" ON "presentations"("deletedAt");

COMMENT ON TABLE "presentations" IS '사용자 프리젠테이션 테이블';
COMMENT ON COLUMN "presentations"."slideData" IS 'UnifiedPPTJSON 형식의 슬라이드 데이터';
COMMENT ON COLUMN "presentations"."metadata" IS '프리젠테이션 메타데이터 (총 슬라이드 수, 모델, 생성 시간 등)';

-- ----------------------------------------
-- 2.6 subscriptions (Subscription)
-- ----------------------------------------
-- 사용자 구독 정보

CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,  -- 1명당 1개 구독
  "tier" TEXT NOT NULL,  -- 'FREE', 'PRO', 'PREMIUM'
  "status" TEXT NOT NULL,  -- 'ACTIVE', 'CANCELED', 'EXPIRED'
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 인덱스
CREATE UNIQUE INDEX IF NOT EXISTS "subscriptions_userId_key" ON "subscriptions"("userId");
CREATE INDEX IF NOT EXISTS "subscriptions_tier_idx" ON "subscriptions"("tier");
CREATE INDEX IF NOT EXISTS "subscriptions_status_idx" ON "subscriptions"("status");

COMMENT ON TABLE "subscriptions" IS '사용자 구독 정보 (FREE/PRO/PREMIUM)';
COMMENT ON COLUMN "subscriptions"."tier" IS '구독 등급: FREE, PRO, PREMIUM';
COMMENT ON COLUMN "subscriptions"."status" IS '구독 상태: ACTIVE, CANCELED, EXPIRED';

-- ----------------------------------------
-- 2.7 credit_transactions (CreditTransaction)
-- ----------------------------------------
-- 크레딧 충전 및 사용 이력

CREATE TABLE IF NOT EXISTS "credit_transactions" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,  -- 'PURCHASE', 'USAGE', 'REFUND', 'BONUS'
  "amount" INTEGER NOT NULL,  -- 증가(+) 또는 감소(-)
  "balance" INTEGER NOT NULL,  -- 거래 후 잔액
  "description" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "credit_transactions_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS "credit_transactions_userId_createdAt_idx"
  ON "credit_transactions"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "credit_transactions_type_idx" ON "credit_transactions"("type");

COMMENT ON TABLE "credit_transactions" IS '크레딧 거래 이력 (충전, 사용, 환불, 보너스)';
COMMENT ON COLUMN "credit_transactions"."type" IS '거래 유형: PURCHASE(충전), USAGE(사용), REFUND(환불), BONUS(보너스)';
COMMENT ON COLUMN "credit_transactions"."amount" IS '증가(+) 또는 감소(-) 크레딧';
COMMENT ON COLUMN "credit_transactions"."balance" IS '거래 후 크레딧 잔액';

-- ----------------------------------------
-- 2.8 generation_history (GenerationHistory)
-- ----------------------------------------
-- AI 프리젠테이션 생성 이력

CREATE TABLE IF NOT EXISTS "generation_history" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "presentationId" TEXT,
  "prompt" TEXT NOT NULL,  -- 사용자 입력 프롬프트
  "model" TEXT NOT NULL,  -- 'gemini-flash', 'gemini-pro'
  "useResearch" BOOLEAN NOT NULL DEFAULT false,  -- Perplexity 사용 여부
  "creditsUsed" INTEGER NOT NULL DEFAULT 0,
  "result" JSONB,  -- 생성 결과 JSON
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "generation_history_userId_fkey" FOREIGN KEY ("userId")
    REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "generation_history_presentationId_fkey" FOREIGN KEY ("presentationId")
    REFERENCES "presentations"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS "generation_history_userId_createdAt_idx"
  ON "generation_history"("userId", "createdAt");
CREATE INDEX IF NOT EXISTS "generation_history_presentationId_idx"
  ON "generation_history"("presentationId");

COMMENT ON TABLE "generation_history" IS 'AI 프리젠테이션 생성 이력';
COMMENT ON COLUMN "generation_history"."model" IS 'AI 모델: gemini-flash, gemini-pro';
COMMENT ON COLUMN "generation_history"."useResearch" IS 'Perplexity Deep Research 사용 여부';
COMMENT ON COLUMN "generation_history"."creditsUsed" IS '사용한 크레딧 (Pro 모델: 1, Deep Research: 2)';

-- ----------------------------------------
-- 2.9 relation_tuples (RelationTuple)
-- ----------------------------------------
-- Zanzibar 권한 시스템 - 권한 튜플

CREATE TABLE IF NOT EXISTS "relation_tuples" (
  "id" TEXT PRIMARY KEY,
  "namespace" TEXT NOT NULL,  -- 'presentation', 'system'
  "objectId" TEXT NOT NULL,  -- 리소스 ID
  "relation" TEXT NOT NULL,  -- 'owner', 'editor', 'viewer', 'admin'
  "subjectType" TEXT NOT NULL,  -- 'user', 'user_set'
  "subjectId" TEXT NOT NULL,  -- User ID 또는 '*' (와일드카드)
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint: namespace + objectId + relation + subjectType + subjectId
CREATE UNIQUE INDEX IF NOT EXISTS "relation_tuples_unique_key"
  ON "relation_tuples"("namespace", "objectId", "relation", "subjectType", "subjectId");

-- 검색 인덱스
CREATE INDEX IF NOT EXISTS "relation_tuples_namespace_objectId_relation_idx"
  ON "relation_tuples"("namespace", "objectId", "relation");
CREATE INDEX IF NOT EXISTS "relation_tuples_subjectType_subjectId_idx"
  ON "relation_tuples"("subjectType", "subjectId");
CREATE INDEX IF NOT EXISTS "relation_tuples_namespace_relation_subjectId_idx"
  ON "relation_tuples"("namespace", "relation", "subjectId");

COMMENT ON TABLE "relation_tuples" IS 'Zanzibar 권한 시스템 - 권한 튜플';
COMMENT ON COLUMN "relation_tuples"."namespace" IS '리소스 타입: presentation, system';
COMMENT ON COLUMN "relation_tuples"."objectId" IS '리소스 ID';
COMMENT ON COLUMN "relation_tuples"."relation" IS '권한: owner, editor, viewer, admin';
COMMENT ON COLUMN "relation_tuples"."subjectType" IS '주체 타입: user, user_set';
COMMENT ON COLUMN "relation_tuples"."subjectId" IS '주체 ID (User ID 또는 *)';

-- ----------------------------------------
-- 2.10 relation_definitions (RelationDefinition)
-- ----------------------------------------
-- Zanzibar 권한 시스템 - 권한 정의 및 상속 관계

CREATE TABLE IF NOT EXISTS "relation_definitions" (
  "id" TEXT PRIMARY KEY,
  "namespace" TEXT NOT NULL,  -- 'presentation', 'system'
  "relation" TEXT NOT NULL,  -- 'owner', 'editor', 'viewer', 'admin'
  "inheritsFrom" TEXT,  -- 상속 관계 (예: 'editor' → 'viewer')
  "description" TEXT
);

-- Unique constraint: namespace + relation
CREATE UNIQUE INDEX IF NOT EXISTS "relation_definitions_namespace_relation_key"
  ON "relation_definitions"("namespace", "relation");

COMMENT ON TABLE "relation_definitions" IS 'Zanzibar 권한 시스템 - 권한 정의 메타데이터';
COMMENT ON COLUMN "relation_definitions"."inheritsFrom" IS '상속 관계 (owner → editor → viewer)';

-- ========================================
-- 3. 초기 데이터 삽입
-- ========================================

-- ----------------------------------------
-- 3.1 RelationDefinition 초기 데이터
-- ----------------------------------------
-- Zanzibar 권한 상속 구조 정의

INSERT INTO "relation_definitions" ("id", "namespace", "relation", "inheritsFrom", "description")
VALUES
  (gen_random_uuid()::text, 'presentation', 'owner', 'editor', '프레젠테이션 소유자 (생성/읽기/수정/삭제)'),
  (gen_random_uuid()::text, 'presentation', 'editor', 'viewer', '프레젠테이션 편집자 (읽기/수정)'),
  (gen_random_uuid()::text, 'presentation', 'viewer', NULL, '프레젠테이션 열람자 (읽기)'),
  (gen_random_uuid()::text, 'system', 'admin', NULL, '시스템 관리자 (모든 권한)')
ON CONFLICT ("namespace", "relation") DO NOTHING;

-- ========================================
-- 4. 마이그레이션 완료 확인
-- ========================================

-- 생성된 테이블 목록 확인
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
  AND table_name IN (
    'users',
    'accounts',
    'sessions',
    'verification_tokens',
    'presentations',
    'subscriptions',
    'credit_transactions',
    'generation_history',
    'relation_tuples',
    'relation_definitions'
  )
ORDER BY table_name;

-- ========================================
-- 마이그레이션 완료!
-- ========================================
--
-- 다음 단계:
--   1. Prisma Client 생성: npx prisma generate
--   2. 타입 체크: npx tsc --noEmit
--   3. 개발 서버 실행: npm run dev
--
-- ========================================
