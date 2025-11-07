# Phase 4-5: 환경 변수 설정 가이드

## 개요

이 문서는 Phase 4-5 (NextAuth 인증)를 위한 환경 변수 설정 방법을 안내합니다.

---

## 필수 환경 변수

### 1. Supabase Database

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**설정 방법**:
1. Supabase 프로젝트 생성 (https://supabase.com)
2. Settings → Database → Connection string 복사
3. `.env.local`에 추가

---

### 2. NextAuth 설정

#### NEXTAUTH_URL
```env
NEXTAUTH_URL="http://localhost:3000"
```

**프로덕션**:
```env
NEXTAUTH_URL="https://yourdomain.com"
```

#### NEXTAUTH_SECRET
```bash
# 생성 명령어
openssl rand -base64 32
```

```env
NEXTAUTH_SECRET="생성된_랜덤_문자열"
```

**중요**: 프로덕션에서는 반드시 안전한 랜덤 문자열 사용

---

### 3. GitHub OAuth

**설정 방법**:
1. GitHub Settings → Developer settings → OAuth Apps
   - https://github.com/settings/developers
2. "New OAuth App" 클릭
3. 정보 입력:
   - **Application name**: PPT Maker
   - **Homepage URL**: `http://localhost:3000` (로컬) 또는 프로덕션 URL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github`
4. Client ID와 Client Secret 복사

```env
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```

---

### 4. Google OAuth

**설정 방법**:
1. Google Cloud Console 접속
   - https://console.cloud.google.com/apis/credentials
2. 프로젝트 선택 또는 생성
3. "Credentials" → "Create Credentials" → "OAuth client ID"
4. Application type: "Web application"
5. Authorized redirect URIs 추가:
   - `http://localhost:3000/api/auth/callback/google` (로컬)
   - `https://yourdomain.com/api/auth/callback/google` (프로덕션)
6. Client ID와 Client secret 복사

```env
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

---

### 5. AI API Keys (기존)

```env
# Gemini API Key (클라이언트 노출 가능)
NEXT_PUBLIC_GEMINI_API_KEY="your-gemini-api-key"

# Perplexity API Key (서버 전용 - 노출 금지)
PERPLEXITY_API_KEY="your-perplexity-api-key"
```

---

## 환경 변수 파일 생성

### 1. .env.local 파일 생성

```bash
# 예제 파일 복사
cp .env.local.example .env.local
```

### 2. 값 채우기

```env
# Supabase Database
DATABASE_URL="postgresql://postgres:your-password@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxxxx"

# GitHub OAuth
GITHUB_CLIENT_ID="Iv1.xxxxxxxxxxxx"
GITHUB_CLIENT_SECRET="xxxxxxxxxxxxxxxxxxxxxxxxx"

# Google OAuth
GOOGLE_CLIENT_ID="xxxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-xxxxxxxxxxxxxxxxxxx"

# AI APIs
NEXT_PUBLIC_GEMINI_API_KEY="AIzaSyxxxxxxxxxxxxxxxxxxxxxxxx"
PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 프로덕션 설정

### Vercel 배포 시

1. Vercel 프로젝트 Settings → Environment Variables
2. 모든 환경 변수를 Production/Preview/Development에 추가
3. **주의**: `NEXTAUTH_URL`은 프로덕션 도메인으로 변경

### 환경별 설정

```env
# Development
NEXTAUTH_URL="http://localhost:3000"

# Preview
NEXTAUTH_URL="https://your-app-preview.vercel.app"

# Production
NEXTAUTH_URL="https://ppt-maker.com"
```

---

## 보안 주의사항

### 🔴 절대 금지
- `.env.local` 파일을 Git에 커밋
- Client Secret을 클라이언트 코드에 노출
- `NEXT_PUBLIC_` 접두사를 비밀 키에 사용

### ✅ 권장 사항
- `.gitignore`에 `.env.local` 추가 (이미 설정됨)
- 팀원과 환경 변수 공유 시 안전한 채널 사용
- 프로덕션과 개발 환경에 다른 OAuth 앱 사용

---

## 테스트

### 1. 데이터베이스 연결 확인

```bash
# Prisma Studio 실행
npx prisma studio
```

브라우저에서 `http://localhost:5555` 접속하여 테이블 확인

### 2. NextAuth 동작 확인

```bash
npm run dev
```

1. http://localhost:3000 접속
2. 로그인 버튼 클릭
3. GitHub 또는 Google로 로그인
4. 콜백 후 세션 확인

### 3. API 엔드포인트 테스트

```bash
# 로그인 후 테스트
curl -X GET http://localhost:3000/api/presentations \
  -H "Cookie: next-auth.session-token=YOUR_SESSION_TOKEN"
```

---

## 문제 해결

### 문제: "Invalid callback URL"

**원인**: OAuth 앱 설정의 Callback URL이 잘못됨

**해결**:
- GitHub/Google OAuth 설정에서 Redirect URI 확인
- Format: `http://localhost:3000/api/auth/callback/[provider]`

### 문제: "Database connection failed"

**원인**: DATABASE_URL이 잘못되었거나 데이터베이스 접근 불가

**해결**:
```bash
# 연결 테스트
npx prisma db pull
```

### 문제: "Session not found"

**원인**: NEXTAUTH_SECRET이 설정되지 않음

**해결**:
```bash
# 새 SECRET 생성
openssl rand -base64 32

# .env.local에 추가
NEXTAUTH_SECRET="생성된_값"
```

---

## 다음 단계

✅ **완료된 Phase 4-5**:
1. NextAuth 설정 파일 생성
2. 세션 관리 유틸리티
3. 모든 API에 세션 통합
4. 클라이언트 로그인 UI
5. 환경 변수 설정 가이드

🎯 **다음 Phase**:
- **Phase 4-4**: Zustand Store → API 호출 마이그레이션 (선택)
- **Phase 5**: 프로덕션 배포 및 최적화

---

**작성일**: 2025-11-07
**Phase**: 4-5 (NextAuth 인증)
