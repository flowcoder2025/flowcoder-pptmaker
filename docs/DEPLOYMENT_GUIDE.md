# PPT Maker - Apps in Toss 배포 가이드

> **최종 업데이트**: 2025-11-06
> **빌드 버전**: Next.js 16 (Turbopack)
> **타겟 플랫폼**: Apps in Toss (WebView)

---

## 📋 목차

1. [빌드 준비사항](#-빌드-준비사항)
2. [프로덕션 빌드](#-프로덕션-빌드)
3. [환경 변수 설정](#-환경-변수-설정)
4. [배포 전 체크리스트](#-배포-전-체크리스트)
5. [Apps in Toss 플랫폼 배포](#-apps-in-toss-플랫폼-배포)
6. [문제 해결](#-문제-해결)

---

## ✅ 빌드 준비사항

### 1. 개발 환경 확인

```bash
# Node.js 버전 확인 (18.17 이상 권장)
node --version

# npm 버전 확인
npm --version

# 의존성 설치 확인
npm install
```

### 2. TypeScript 타입 체크

```bash
# 타입 오류 확인
npx tsc --noEmit

# 예상 결과: 오류 없이 완료
```

### 3. ESLint 검사

```bash
# 코드 품질 검사
npm run lint

# 자동 수정 가능한 문제 해결
npm run lint -- --fix
```

---

## 🏗️ 프로덕션 빌드

### 1. 빌드 실행

```bash
# 프로덕션 빌드
npm run build
```

**예상 출력**:
```
✓ Compiled successfully in 1922.9ms
✓ Running TypeScript ...
✓ Collecting page data ...
✓ Generating static pages (17/17) in 314.6ms
✓ Finalizing page optimization ...
```

### 2. 빌드 결과 확인

```bash
# 빌드 디렉토리 크기 확인
du -sh .next/

# 예상 결과: 약 18MB
```

**생성된 페이지**:
- `/` - 홈 페이지
- `/input` - 텍스트 입력 페이지
- `/viewer` - 슬라이드 뷰어
- `/editor` - 슬라이드 편집기
- `/credits` - 크레딧 관리
- `/subscription` - 구독 관리
- `/dev-tools` - 개발자 도구
- API Routes - 7개 (auth, payment, iap, research)

### 3. 로컬 프로덕션 테스트

```bash
# 프로덕션 서버 실행 (포트 3000)
npm start

# 브라우저에서 접속
# http://localhost:3000
```

---

## 🔐 환경 변수 설정

### 1. 필수 환경 변수

프로덕션 배포 시 다음 환경 변수가 **반드시** 설정되어야 합니다:

#### AI 서비스

```bash
# Gemini API Key (필수)
# 클라이언트에 노출됨 (NEXT_PUBLIC_ 접두사)
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key

# Perplexity API Key (선택 - 자료 조사 기능용)
# 서버 전용 (NEXT_PUBLIC_ 없음 - 안전)
PERPLEXITY_API_KEY=your_actual_perplexity_api_key
```

**API 키 발급**:
- Gemini: https://aistudio.google.com/app/apikey
- Perplexity: https://www.perplexity.ai/settings/api

#### 광고 (Apps in Toss)

```bash
# AdMob Ad Group ID
# 테스트용 기본값: ait-ad-test-interstitial-id
NEXT_PUBLIC_AD_GROUP_ID=ait-ad-test-interstitial-id

# 프로덕션에서는 Apps in Toss 콘솔에서 발급받은 실제 ID 사용
```

**발급 방법**: Apps in Toss 개발자 콘솔 → 광고 설정

#### 결제 (향후 구현)

```bash
# Toss Payments (현재 미구현)
# TOSS_PAYMENTS_CLIENT_KEY=your_client_key
# TOSS_PAYMENTS_SECRET_KEY=your_secret_key
```

### 2. 환경 변수 파일 구조

```
.env.local          # 로컬 개발용 (Git 제외)
.env.example        # 템플릿 (Git 포함)
```

**⚠️ 중요**: `.env.local`은 절대 Git에 커밋하지 마세요!

### 3. Apps in Toss 플랫폼 환경 변수 설정

Apps in Toss 개발자 콘솔에서 환경 변수 설정:

1. **개발자 콘솔 접속**: https://developers-apps-in-toss.toss.im
2. **앱 선택**: flowcoder-pptmaker
3. **설정 → 환경 변수**
4. **추가**:
   - `NEXT_PUBLIC_GEMINI_API_KEY`
   - `PERPLEXITY_API_KEY`
   - `NEXT_PUBLIC_AD_GROUP_ID`

---

## ✅ 배포 전 체크리스트

### 코드 품질

- [ ] TypeScript 타입 체크 통과 (`npx tsc --noEmit`)
- [ ] ESLint 검사 통과 (`npm run lint`)
- [ ] 프로덕션 빌드 성공 (`npm run build`)
- [ ] 로컬 프로덕션 서버 실행 확인 (`npm start`)

### 환경 변수

- [ ] Gemini API Key 설정됨
- [ ] Perplexity API Key 설정됨 (자료 조사 기능 사용 시)
- [ ] Ad Group ID 설정됨
- [ ] `.env.local` Git 제외 확인 (`.gitignore` 확인)

### UX Writing

- [ ] 모든 사용자 대면 텍스트가 "~해요체" 사용
- [ ] 에러 메시지가 긍정적이고 대안 제시
- [ ] 로딩 상태 텍스트가 "~하고 있어요" 형태

**참조**: [../../docs/03-design/03-ux-writing.md](../../docs/03-design/03-ux-writing.md)

### 성능

- [ ] 번들 크기 확인 (18MB 이하)
- [ ] 이미지 최적화 확인
- [ ] API 응답 시간 테스트

### 보안

- [ ] API 키가 클라이언트에 노출되지 않는지 확인 (NEXT_PUBLIC_ 제외)
- [ ] CORS 설정 확인
- [ ] HTTPS 설정 (Apps in Toss 필수)

---

## 🚀 Apps in Toss 플랫폼 배포

### 1. .ait 번들 파일 생성

**⚠️ 중요**: .ait 파일은 **ZIP 형식**이어야 합니다 (tar.gz가 아님!)

```bash
# 1. Next.js Static Export 빌드
npm run build

# 2. 빌드 결과 확인 (out/ 디렉토리)
ls -lh out/

# 3. ZIP 형식으로 .ait 번들 생성
cd out
zip -r ../flowcoder-pptmaker.ait .
cd ..

# 4. .ait 파일 검증
file flowcoder-pptmaker.ait
# 출력: Zip archive data ✓

unzip -t flowcoder-pptmaker.ait
# 출력: No errors detected ✓

# 5. 최종 파일 확인
ls -lh flowcoder-pptmaker.ait
# 예상 크기: 약 900KB~1MB
```

**생성된 파일**:
- 파일명: `flowcoder-pptmaker.ait`
- 형식: ZIP archive
- 크기: 약 916KB
- 위치: 프로젝트 루트 디렉토리

### 2. Apps in Toss 개발자 콘솔 배포

#### 방법 1: Git 연동 (권장)

1. **Git 저장소 연결**
   - 개발자 콘솔 → 앱 설정 → Git 연동
   - GitHub/GitLab 저장소 URL 입력

2. **자동 배포 설정**
   - 브랜치: `main` 또는 `production`
   - 빌드 명령어: `npm run build`
   - 배포 디렉토리: `.next`

3. **환경 변수 설정**
   - 콘솔에서 환경 변수 추가 (위 [환경 변수 설정](#-환경-변수-설정) 참조)

#### 방법 2: .ait 파일 수동 업로드 (WebView 앱)

1. **.ait 번들 파일 생성** (위 1번 섹션 참조)
   ```bash
   npm run build
   cd out && zip -r ../flowcoder-pptmaker.ait . && cd ..
   ```

2. **Apps in Toss 콘솔에서 업로드**
   - 개발자 콘솔 접속: https://developers-apps-in-toss.toss.im
   - 앱 선택: flowcoder-pptmaker
   - **출시하기** → **번들 업로드**
   - `flowcoder-pptmaker.ait` 파일 선택
   - 업로드 완료 대기

3. **환경 변수 설정**
   - 콘솔 → 설정 → 환경 변수
   - 위 [환경 변수 설정](#-환경-변수-설정) 섹션 참조

4. **QR 코드로 테스트**
   - 업로드 완료 후 QR 코드 자동 생성
   - 토스앱에서 QR 코드 스캔
   - 앱 실행 및 기능 테스트

### 3. 배포 확인

1. **빌드 로그 확인**
   - 콘솔에서 빌드 진행 상황 모니터링
   - 에러 발생 시 로그 확인

2. **앱 테스트**
   - Apps in Toss 앱에서 실행
   - 주요 기능 테스트:
     - AI 생성 (Gemini)
     - 자료 조사 (Perplexity - 선택)
     - 슬라이드 편집
     - 템플릿 렌더링

3. **성능 모니터링**
   - 콘솔 → 분석 → 성능 지표 확인
   - API 응답 시간, 오류율 모니터링

---

## 🛠️ 문제 해결

### 빌드 실패

#### 문제 1: TypeScript 타입 오류

```
Error: Type '...' is not assignable to type '...'
```

**해결**:
```bash
# 1. 타입 오류 확인
npx tsc --noEmit

# 2. types/ 디렉토리의 타입 정의 확인
# 3. 필요시 타입 수정
```

#### 문제 2: ESLint 오류

```
Error: ... is assigned a value but never used
```

**해결**:
```bash
# 자동 수정 시도
npm run lint -- --fix

# 수동 수정 필요한 경우 코드 검토
```

#### 문제 3: 모듈 해석 실패

```
Module not found: Can't resolve '@/...'
```

**해결**:
```bash
# 1. tsconfig.json paths 확인
# 2. 파일 경로 확인
# 3. 의존성 재설치
rm -rf node_modules package-lock.json
npm install
```

### 런타임 오류

#### 문제 1: 환경 변수 누락

```
Error: NEXT_PUBLIC_GEMINI_API_KEY is not defined
```

**해결**:
1. `.env.local` 파일 확인
2. Apps in Toss 콘솔에서 환경 변수 설정 확인
3. 빌드 재실행

#### 문제 2: API 요청 실패

```
Error: Failed to fetch
```

**해결**:
1. **CORS 확인**: Apps in Toss는 HTTPS 필수
2. **API 키 확인**: Gemini/Perplexity 키 유효성 검증
3. **네트워크**: 앱인토스 앱에서 네트워크 권한 확인

#### 문제 3: 서버 사이드 렌더링 오류

```
ReferenceError: window is not defined
```

**해결**:
```typescript
// 클라이언트 전용 코드는 'use client' 추가
'use client'

// 또는 dynamic import 사용
import dynamic from 'next/dynamic'

const Component = dynamic(() => import('./Component'), {
  ssr: false
})
```

### 배포 문제

#### 문제 1: 빌드 크기 초과

```
Warning: Bundle size exceeds recommended limit
```

**해결**:
```bash
# 1. 번들 분석
npm run build

# 2. 불필요한 의존성 제거
npm uninstall [unused-package]

# 3. Dynamic imports 사용
# components에서 필요할 때만 로드
```

#### 문제 2: 환경 변수가 앱에 반영 안 됨

**해결**:
1. Apps in Toss 콘솔에서 환경 변수 재확인
2. 앱 재빌드 및 재배포
3. `NEXT_PUBLIC_` 접두사 확인 (클라이언트 노출용)

---

## 📚 참고 자료

### 프로젝트 문서
- **[../CLAUDE.md](../CLAUDE.md)**: 프로젝트 전체 가이드
- **[SPECIFICATION.md](./SPECIFICATION.md)**: 기술 명세서
- **[COST_AND_REVENUE.md](./COST_AND_REVENUE.md)**: 비용 및 수익 분석

### Apps in Toss 문서
- **[개발 가이드](../../docs/04-development/06-webview.md)**: WebView 앱 개발
- **[배포 체크리스트](../../docs/05-checklist/claude.md)**: 출시 전 검수
- **[Bedrock SDK](../../docs/reference/bedrock/claude.md)**: API 레퍼런스

### 외부 문서
- **[Next.js 배포](https://nextjs.org/docs/deployment)**: Next.js 공식 배포 가이드
- **[Apps in Toss 개발자 센터](https://developers-apps-in-toss.toss.im)**: 플랫폼 문서

---

## 📊 배포 체크리스트 요약

### 빌드 전
- [ ] 코드 품질 검사 완료
- [ ] 환경 변수 설정 완료
- [ ] UX Writing 규칙 준수

### 빌드
- [ ] `npm run build` 성공
- [ ] 번들 크기 확인 (18MB 이하)
- [ ] 로컬 프로덕션 서버 테스트

### 배포
- [ ] Apps in Toss 콘솔 설정
- [ ] Git 연동 또는 수동 업로드
- [ ] 환경 변수 플랫폼에 설정

### 배포 후
- [ ] 앱 실행 확인
- [ ] 주요 기능 테스트
- [ ] 성능 모니터링

---

**배포 완료 기준**: 모든 체크리스트 항목이 ✅로 표시되어야 합니다.

**문제 발생 시**: [문제 해결](#-문제-해결) 섹션 참조 또는 Apps in Toss 개발자 지원팀 문의

---

**작성자**: Claude (AI Assistant)
**최종 검토**: 2025-11-06
