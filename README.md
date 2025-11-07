# FlowCoder PPT Maker

> AI 기반 프리젠테이션 생성 웹 서비스

텍스트 입력만으로 전문적인 프리젠테이션을 자동 생성하는 웹 애플리케이션입니다.

---

## 🌟 주요 기능

- ✅ **AI 3단계 파이프라인**: Perplexity 자료 조사 → Gemini 콘텐츠 생성 → 클라이언트 템플릿 렌더링
- ✅ **비용 효율성**: API 비용 98% 절감 (100원 → 2원)
- ✅ **무제한 편집**: 클라이언트 템플릿 엔진으로 재생성 비용 0원
- ✅ **21개 슬라이드 타입**: 완전 지원
- ✅ **사용자 인증**: Supabase Auth 기반
- ✅ **클라우드 저장**: Supabase Database + Storage

---

## 🚀 기술 스택

### Frontend
- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript
- **State**: Zustand
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui + Radix UI

### Backend
- **BaaS**: Supabase
  - Database (PostgreSQL)
  - Authentication
  - Storage
  - Row Level Security (RLS)

### AI Services
- **Gemini**: 콘텐츠 + JSON 생성 (~2원)
- **Perplexity**: 웹 자료 조사 (선택, ~160-200원)

### Deployment
- **Platform**: Vercel
- **CI/CD**: GitHub Actions

---

## 📦 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone https://github.com/your-username/ppt-maker-next.git
cd ppt-maker-next
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 환경 변수 설정

`.env.local` 파일 생성:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI APIs
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key  # 선택사항

# App Config
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=FlowCoder PPT Maker
```

### 4. Supabase 설정

#### 4.1 Supabase 프로젝트 생성
1. [Supabase](https://supabase.com) 회원가입
2. 새 프로젝트 생성
3. API Keys 복사

#### 4.2 데이터베이스 스키마 적용

Supabase SQL Editor에서 실행:

```sql
-- profiles 테이블
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- presentations 테이블
CREATE TABLE presentations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users NOT NULL,
  title TEXT NOT NULL,
  slides JSONB NOT NULL,
  slide_data JSONB NOT NULL,
  template_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false
);

-- RLS 정책
ALTER TABLE presentations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own presentations"
  ON presentations FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own presentations"
  ON presentations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presentations"
  ON presentations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presentations"
  ON presentations FOR DELETE
  USING (auth.uid() = user_id);
```

#### 4.3 Storage Buckets 생성

Supabase Dashboard → Storage에서:
- `thumbnails` 버킷 생성 (Public)
- `exports` 버킷 생성 (Private)

### 5. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

---

## 📁 프로젝트 구조

```
ppt-maker-next/
├── app/                    # Next.js App Router
│   ├── (auth)/            # 인증 페이지
│   ├── (main)/            # 메인 페이지
│   └── api/               # API Routes
│
├── components/            # React 컴포넌트
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── auth/             # 인증 컴포넌트
│   ├── editor/           # 편집기 컴포넌트
│   └── viewer/           # 뷰어 컴포넌트
│
├── lib/                  # 유틸리티
│   └── supabase/        # Supabase 클라이언트
│
├── services/             # 비즈니스 로직
│   ├── gemini/          # Gemini API
│   ├── perplexity/      # Perplexity API
│   ├── template/        # 템플릿 엔진
│   └── slide/           # 슬라이드 변환
│
├── store/                # Zustand 상태 관리
├── types/                # TypeScript 타입
└── constants/            # 상수
```

---

## 🎯 주요 플로우

### AI 생성 플로우

```
사용자 입력
  ↓
1️⃣ Perplexity: 웹 자료 조사 (선택)
  ↓
2️⃣ Gemini: 콘텐츠 + JSON 생성 (~2원)
  ↓
3️⃣ 클라이언트: 템플릿 렌더링 (0원)
  ↓
4️⃣ Supabase: 저장
```

### 편집 플로우

```
Viewer
  ↓
Edit 버튼
  ↓
Editor
  ↓
실시간 미리보기 (0원)
  ↓
Supabase 업데이트
```

---

## 🔧 개발 명령어

```bash
# 개발 서버
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버
npm start

# Lint
npm run lint

# TypeScript 타입 체크
npx tsc --noEmit
```

---

## 🚢 배포

### Vercel 배포

1. GitHub 저장소 연결
2. Vercel에서 프로젝트 import
3. 환경 변수 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `PERPLEXITY_API_KEY`
4. Deploy 버튼 클릭

### 자동 배포

GitHub `main` 브랜치에 푸시하면 자동으로 배포됩니다.

---

## 📚 문서

- [설계 문서](docs/DESIGN_DOC.md) - 전체 아키텍처 및 마이그레이션 전략
- [원가 분석](docs/COST_AND_REVENUE.md) - AI 비용 분석 및 수익 모델
- [구현 히스토리](docs/IMPLEMENTATION_HISTORY.md) - Phase별 구현 내용

---

## 🤝 기여

기여는 언제나 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

---

## 📧 문의

프로젝트 관련 문의: [이메일]

프로젝트 링크: [https://github.com/your-username/ppt-maker-next](https://github.com/your-username/ppt-maker-next)

---

**Built with ❤️ by FlowCoder Team**
