# services/ - 비즈니스 로직 레이어

> **상위 컨텍스트**: [../CLAUDE.md](../CLAUDE.md)

---

## 개요

`services/` 디렉토리는 PPT Maker의 핵심 비즈니스 로직을 담당하는 레이어입니다. AI 연동, 템플릿 엔진, 저장소 관리, 플랫폼 SDK 연동 등 앱의 주요 기능을 모듈화하여 제공합니다.

**설계 원칙**:
- 각 서비스는 독립적이고 재사용 가능해야 합니다
- UI 레이어와 명확히 분리합니다
- TypeScript 타입 안정성을 보장합니다
- 에러 처리는 명시적이고 사용자 친화적이어야 합니다

---

## 디렉토리 구조

```
services/
├── gemini/              # Gemini AI API 연동
│   ├── config.ts           # API 설정 및 모델 선택
│   └── content-generator.ts # 콘텐츠 생성 서비스
│
├── perplexity/          # Perplexity AI 연동
│   ├── config.ts           # API 설정
│   └── researcher.ts       # 자료 조사 서비스
│
├── template/            # 템플릿 엔진
│   ├── index.ts            # 템플릿 서비스 진입점
│   ├── engine/             # 템플릿 엔진 구현
│   │   ├── TemplateEngine.ts  # 엔진 코어
│   │   ├── TemplateRegistry.ts # 템플릿 등록 관리
│   │   └── types.ts           # 템플릿 타입 정의
│   └── base/               # 기본 템플릿
│       └── toss-default/   # 토스 기본 템플릿
│
├── database/            # Supabase 데이터베이스 연동
│   ├── presentation.ts     # 프리젠테이션 CRUD
│   ├── subscription.ts     # 구독 관리
│   └── credits.ts          # 크레딧 관리
│
└── permissions/         # Zanzibar 권한 체크
    └── check.ts            # 권한 검증 서비스
```

---

## 서비스별 역할

### 1. gemini/ - Gemini AI API 연동

**역할**: Google Gemini API를 활용한 콘텐츠+JSON 생성

**주요 파일**:
- `config.ts`: API 키 관리, 모델 선택 (Flash, Pro)
- `content-generator.ts`: 프롬프트 기반 슬라이드 콘텐츠+JSON 생성

**사용 시나리오**:
- 사용자 입력 → Gemini API → UnifiedPPTJSON 형식 직접 생성
- **Parser 통합**: 프롬프트에 JSON 스키마 포함하여 직접 생성 (8원 절감)
- 품질 vs 비용 선택 가능 (Flash ~2원 / Pro ~10원)
- 재시도 로직: 생성 실패 시 자동 재시도

**핵심 개선점**:
- ✅ **Parser 단계 제거**: Flash-Lite API 호출 불필요 (8원 절감)
- ✅ **단일 API 호출**: 콘텐츠 생성과 JSON 파싱을 하나로 통합
- ✅ **비용 효율**: Flash 모델 사용 시 전체 비용 ~2원

**참조**:
- [Gemini API 공식 문서](https://ai.google.dev/gemini-api/docs)
- [ARCHITECTURE.md - Gemini 서비스](../ARCHITECTURE.md)
- [COST_AND_REVENUE.md - 비용 분석](../docs/COST_AND_REVENUE.md)

---

### 2. perplexity/ - Perplexity AI 연동

**역할**: 웹 기반 자료 조사 및 정보 수집

**주요 파일**:
- `config.ts`: API 설정
- `researcher.ts`: 자료 조사 서비스 (Sonar/Sonar Reasoning)

**사용 시나리오**:
- 주제 입력 → Perplexity API → 최신 정보 수집
- 선택적 사용 (사용자 설정에 따라 활성화)
- 조사 결과를 Gemini 콘텐츠 생성에 활용

**비용**:
- Sonar: ~160원/요청
- Sonar Reasoning: ~200원/요청

**참조**:
- [Perplexity API 공식 문서](https://docs.perplexity.ai/)
- [원가 분석.md](../원가 분석.md)

---

### 3. template/ - 템플릿 엔진

**역할**: 슬라이드 템플릿 관리 및 렌더링

**구조**:
```
template/
├── index.ts                 # 템플릿 서비스 진입점
├── engine/                  # 템플릿 엔진 코어
│   ├── TemplateEngine.ts      # 템플릿 렌더링 엔진
│   ├── TemplateRegistry.ts    # 템플릿 등록 및 관리
│   └── types.ts               # 템플릿 인터페이스 정의
└── base/                    # 기본 템플릿 구현
    └── toss-default/        # 토스 기본 템플릿
        └── TossDefaultTemplate.ts
```

**주요 기능**:
- 템플릿 등록 및 선택
- 슬라이드 데이터 → HTML 변환
- 커스텀 템플릿 추가 지원

**템플릿 인터페이스**:
```typescript
interface Template {
  id: string
  name: string
  render(slide: SlideData): string
}
```

**참조**:
- [ARCHITECTURE.md - 템플릿 엔진](../ARCHITECTURE.md)

---

### 4. database/ - Supabase 데이터베이스 연동

**역할**: Supabase PostgreSQL 데이터베이스 CRUD 작업

**주요 파일**:
- `presentation.ts`: 프리젠테이션 생성/조회/수정/삭제
- `subscription.ts`: 구독 관리 (시작/취소/조회)
- `credits.ts`: 크레딧 관리 (잔액 조회, 차감, 충전)

**구현 예시** (`presentation.ts`):
```typescript
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { check } from '@/services/permissions/check'

export async function createPresentation(data: CreatePresentationData) {
  const session = await auth()
  if (!session) throw new Error('인증이 필요해요')

  const presentation = await prisma.presentation.create({
    data: {
      userId: session.user.id,
      title: data.title,
      slides: data.slides,
      slideData: data.slideData,
      templateId: data.templateId,
    },
  })

  // Zanzibar: owner 관계 생성
  await prisma.relationTuple.create({
    data: {
      namespace: 'presentation',
      objectId: presentation.id,
      relation: 'owner',
      userId: session.user.id,
    },
  })

  return presentation
}

export async function getPresentation(id: string) {
  const session = await auth()
  if (!session) throw new Error('인증이 필요해요')

  // 권한 체크
  const canView = await check(session.user.id, 'presentation', id, 'viewer')
  if (!canView) throw new Error('권한이 없어요')

  return await prisma.presentation.findUnique({
    where: { id },
  })
}
```

**데이터 구조** (Prisma 모델):
```typescript
model Presentation {
  id          String   @id @default(uuid())
  userId      String
  title       String
  slides      Json     // HTMLSlide[]
  slideData   Json     // UnifiedPPTJSON
  templateId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  thumbnailUrl String?
  isPublic    Boolean  @default(false)

  user        User     @relation(fields: [userId], references: [id])
}
```

**참조**:
- [Database_Architecture.md](../docs/Database_Architecture.md)
- [Prisma 공식 문서](https://www.prisma.io)

---

### 5. permissions/ - Zanzibar 권한 체크

**역할**: Relationship-Based Access Control (ReBAC) 권한 검증

**주요 파일**:
- `check.ts`: 권한 검증 서비스

**구현 예시**:
```typescript
import { prisma } from '@/lib/prisma'

export async function check(
  userId: string,
  namespace: 'presentation' | 'system',
  objectId: string,
  relation: 'owner' | 'editor' | 'viewer' | 'admin'
): Promise<boolean> {
  // 직접 권한 체크
  const directRelation = await prisma.relationTuple.findFirst({
    where: {
      namespace,
      objectId,
      userId,
      relation,
    },
  })

  if (directRelation) return true

  // 권한 상속 체크 (owner > editor > viewer)
  if (relation === 'viewer') {
    const inherited = await prisma.relationTuple.findFirst({
      where: {
        namespace,
        objectId,
        userId,
        relation: { in: ['owner', 'editor'] },
      },
    })
    if (inherited) return true
  }

  if (relation === 'editor') {
    const inherited = await prisma.relationTuple.findFirst({
      where: {
        namespace,
        objectId,
        userId,
        relation: 'owner',
      },
    })
    if (inherited) return true
  }

  return false
}
```

**권한 레벨**:
- `owner`: 소유자 (모든 권한)
- `editor`: 편집자 (수정 가능, 삭제 불가)
- `viewer`: 조회자 (읽기만 가능)
- `admin`: 시스템 관리자

**참조**:
- [Database_Architecture.md - Zanzibar 권한 시스템](../docs/Database_Architecture.md)
- [Google Zanzibar 논문](https://research.google/pubs/pub48190/)

---

## 작업 시 주의사항

### ⚠️ 필수 규칙

#### 1. UX Writing 준수
모든 사용자 대면 메시지는 Apps in Toss UX Writing 가이드를 따릅니다:
- ~해요체 사용 (상황/맥락 불문)
- 능동적 말하기 (됐어요 → 했어요)
- 긍정적 말하기 (실패했어요 → 실패했어요 + 대안 제시)

**참조**: [../../docs/03-design/03-ux-writing.md](../../docs/03-design/03-ux-writing.md)

#### 2. 에러 처리 원칙
```typescript
// ❌ 나쁜 예
throw new Error('API call failed')

// ✅ 좋은 예
throw new Error('콘텐츠를 생성하지 못했어요. 다시 시도해주세요.')
```

#### 3. 환경 변수 관리
- 클라이언트 노출 가능: `NEXT_PUBLIC_*` (Gemini API 키)
- 서버 전용: 일반 환경 변수 (Perplexity API 키)

#### 4. TypeScript 타입 안정성
- `any` 타입 사용 금지
- 모든 함수는 반환 타입 명시
- 에러 타입도 명시적으로 정의

---

## 개발 워크플로우

### 새 서비스 추가 시

1. **디렉토리 생성**
```bash
mkdir services/my-service
```

2. **타입 정의** (`types.ts`)
```typescript
export interface MyServiceConfig {
  apiKey: string
  options?: Record<string, unknown>
}

export interface MyServiceResult {
  data: unknown
  error?: string
}
```

3. **서비스 구현**
```typescript
// my-service/index.ts
export class MyService {
  constructor(private config: MyServiceConfig) {}

  async execute(): Promise<MyServiceResult> {
    // 구현
  }
}
```

4. **에러 처리 추가**
```typescript
try {
  const result = await myService.execute()
} catch (error) {
  throw new Error('작업을 완료하지 못했어요. 다시 시도해주세요.')
}
```

---

## 테스트 가이드 (향후)

각 서비스는 단위 테스트를 포함해야 합니다:

```typescript
// __tests__/gemini/content-generator.test.ts
describe('ContentGenerator', () => {
  it('should generate slide content from prompt', async () => {
    const generator = new ContentGenerator(mockConfig)
    const result = await generator.generate('테스트 주제')
    expect(result.slides).toHaveLength(5)
  })
})
```

---

## 참조 문서

### 프로젝트 문서
- **[../CLAUDE.md](../CLAUDE.md)**: 프로젝트 루트 컨텍스트
- **[../docs/SPECIFICATION.md](../docs/SPECIFICATION.md)**: 기술 명세서
- **[../docs/Database_Architecture.md](../docs/Database_Architecture.md)**: 데이터베이스 및 권한 시스템
- **[../docs/COST_AND_REVENUE.md](../docs/COST_AND_REVENUE.md)**: AI 비용 분석

### 데이터베이스 및 인증
- **[Prisma 공식 문서](https://www.prisma.io)**: Prisma ORM
- **[Supabase 공식 문서](https://supabase.com)**: Supabase PostgreSQL
- **[NextAuth.js](https://next-auth.js.org)**: OAuth 인증

### AI API
- **[Gemini API](https://ai.google.dev/gemini-api/docs)**: Gemini API 공식 문서
- **[Perplexity API](https://docs.perplexity.ai/)**: Perplexity API 공식 문서

### 권한 시스템
- **[Google Zanzibar 논문](https://research.google/pubs/pub48190/)**: Zanzibar ReBAC 원문

---

**마지막 업데이트**: 2025-11-07
**변경 이력**: 웹 서비스 전환 - Supabase 데이터베이스 및 Zanzibar 권한 시스템 추가
