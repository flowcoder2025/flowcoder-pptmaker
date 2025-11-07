# FlowCoder PPT Maker - 웹 서비스 전환 설계서

> **버전**: 1.0.0
> **작성일**: 2025-11-07
> **목적**: Apps in Toss → 독립 웹 서비스 마이그레이션

---

## 📋 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [마이그레이션 전략](#2-마이그레이션-전략)
3. [기술 스택 변경](#3-기술-스택-변경)
4. [아키텍처 설계](#4-아키텍처-설계)
5. [데이터베이스 스키마](#5-데이터베이스-스키마)
6. [구현 계획](#6-구현-계획)
7. [배포 전략](#7-배포-전략)

---

## 1. 프로젝트 개요

### 1.1 마이그레이션 배경

기존 Apps in Toss 플랫폼 전용으로 개발된 PPT Maker를 독립적인 웹 서비스로 전환하여:
- ✅ 더 넓은 사용자층 확보
- ✅ 플랫폼 종속성 제거
- ✅ Vercel + Supabase 현대적 스택 활용
- ✅ 확장 가능한 아키텍처 구축

### 1.2 핵심 목표

| 목표 | 설명 |
|------|------|
| **100% 코어 로직 재사용** | AI 파이프라인, 템플릿 시스템 그대로 유지 |
| **토스 의존성 제거** | TDS Mobile → shadcn/ui 전환 |
| **인증 시스템 추가** | Supabase Auth 기반 사용자 관리 |
| **클라우드 저장소** | Supabase Database + Storage |
| **Vercel 배포** | 자동화된 CI/CD 파이프라인 |

---

## 2. 마이그레이션 전략

### 2.1 제거할 의존성 (4개)

```json
{
  "removed": [
    "@apps-in-toss/web-framework",  // 앱인토스 프레임워크
    "@toss/tds-mobile",              // TDS Mobile UI
    "@toss/tds-mobile-ait",          // 앱인토스 전용 TDS
    "@granite-js/plugin-env"         // Granite 플러그인
  ]
}
```

### 2.2 추가할 의존성

```json
{
  "added": [
    "@supabase/supabase-js",         // Supabase 클라이언트
    "@supabase/ssr",                 // Supabase SSR
    "@supabase/auth-ui-react",       // 인증 UI
    "@radix-ui/react-*",             // UI 컴포넌트 (shadcn/ui 기반)
    "react-hot-toast",               // 토스트 알림
    "lucide-react"                   // 아이콘
  ]
}
```

### 2.3 재사용 가능 코드 (100%)

```
✅ services/          # AI 파이프라인 전체
✅ types/             # TypeScript 타입
✅ store/             # Zustand 상태 관리
✅ constants/         # 디자인 시스템 상수
✅ utils/             # 유틸리티 함수
```

---

## 3. 기술 스택 변경

### 3.1 Before (Apps in Toss)

| 카테고리 | 기술 |
|---------|------|
| Platform | Apps in Toss (Webview) |
| Framework | Next.js 16 + React 19 |
| UI Library | TDS Mobile |
| Storage | Bedrock SDK Storage |
| Auth | 없음 |
| Deployment | 앱인토스 빌드 시스템 |

### 3.2 After (웹 서비스)

| 카테고리 | 기술 |
|---------|------|
| Platform | **Web (독립 서비스)** |
| Framework | Next.js 16 + React 19 ✅ |
| UI Library | **shadcn/ui + Radix UI** |
| Backend | **Supabase** |
| Auth | **Supabase Auth** |
| Database | **Supabase PostgreSQL** |
| Storage | **Supabase Storage** |
| Deployment | **Vercel** |

---

## 4. 아키텍처 설계

### 4.1 프로젝트 구조

```
ppt-maker-next/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 관련 페이지
│   │   ├── login/
│   │   └── signup/
│   ├── (main)/            # 메인 페이지
│   │   ├── page.tsx       # 홈
│   │   ├── input/         # 텍스트 입력
│   │   ├── viewer/        # 슬라이드 뷰어
│   │   ├── editor/        # 편집기
│   │   └── history/       # 히스토리
│   ├── api/               # API Routes
│   │   └── research/      # Perplexity 프록시
│   └── layout.tsx
│
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── auth/             # 인증 컴포넌트
│   ├── editor/           # 편집기 컴포넌트 (기존 재사용)
│   └── viewer/           # 뷰어 컴포넌트 (기존 재사용)
│
├── lib/                  # 유틸리티
│   ├── supabase/        # Supabase 클라이언트
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
│
├── services/             # 비즈니스 로직 (기존 100% 재사용)
│   ├── gemini/
│   ├── perplexity/
│   ├── template/
│   └── slide/
│
├── store/                # Zustand (기존 재사용)
├── types/                # TypeScript 타입 (기존 재사용)
├── constants/            # 상수 (기존 재사용)
└── hooks/                # 커스텀 훅 (기존 재사용)
```

### 4.2 데이터 플로우

#### 생성 플로우 (기존과 동일)
```
사용자 입력
  → Perplexity AI (선택)
  → Gemini Flash/Pro (~2원)
  → 클라이언트 템플릿 엔진 (0원)
  → Viewer 렌더링
  → Supabase 저장 (NEW)
```

#### 편집 플로우
```
Viewer
  → Edit 버튼
  → Editor
  → 실시간 미리보기
  → Supabase 업데이트 (NEW)
```

---

## 5. 데이터베이스 스키마

### 5.1 Supabase Tables

#### profiles
```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### presentations
```sql
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  slides JSONB NOT NULL,           -- HTMLSlide[]
  slide_data JSONB NOT NULL,       -- UnifiedPPTJSON
  template_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false
);
```

#### subscriptions (향후)
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  plan TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.2 Row Level Security (RLS)

```sql
-- 사용자는 자신의 프리젠테이션만 조회
CREATE POLICY "Users can view own presentations"
  ON presentations FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

-- 사용자는 자신의 프리젠테이션만 생성/수정/삭제
CREATE POLICY "Users can create own presentations"
  ON presentations FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 6. 구현 계획

### Phase 1: 기본 설정 (완료 ✅)
- [x] 프로젝트 복사
- [x] package.json 의존성 변경
- [x] 환경 변수 설정
- [x] Supabase 클라이언트 생성

### Phase 2: 코어 로직 검증
- [ ] services/, types/, store/ 동작 확인
- [ ] AI 파이프라인 테스트
- [ ] 템플릿 시스템 테스트

### Phase 3: UI 컴포넌트 변환
- [ ] shadcn/ui 초기화
- [ ] TDS 컴포넌트 → shadcn/ui 변환
- [ ] Button, Dialog, Input, Select 등

### Phase 4: Supabase 연동
- [ ] Supabase 프로젝트 생성
- [ ] Database 스키마 적용
- [ ] Auth 시스템 구현
- [ ] Storage 연동

### Phase 5: 페이지 마이그레이션
- [ ] 홈, 입력, 뷰어, 편집 페이지
- [ ] 로그인/회원가입 페이지
- [ ] Supabase API 호출로 변경

### Phase 6: 배포 및 문서
- [ ] README.md 업데이트
- [ ] Vercel 배포 설정
- [ ] 테스트 및 검증

---

## 7. 배포 전략

### 7.1 Vercel 설정

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase-url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "NEXT_PUBLIC_GEMINI_API_KEY": "@gemini-api-key",
    "PERPLEXITY_API_KEY": "@perplexity-api-key"
  }
}
```

### 7.2 CI/CD 파이프라인

```
Local Dev → GitHub → Vercel → Production
                  ↓
              Supabase (Backend)
```

---

## 부록: TDS → shadcn/ui 컴포넌트 매핑

| TDS Mobile | shadcn/ui |
|-----------|-----------|
| Button | Button |
| BottomSheet | Dialog + Sheet |
| TextField | Input |
| Select | Select |
| Toast | react-hot-toast |

---

**문서 버전**: 1.0.0
**작성일**: 2025-11-07
**상태**: 설계 완료, 구현 진행 중
