# 샌드박스 페이지 가이드

> **경로**: `/sandbox`
> **목적**: PPT Maker의 기능을 독립적으로 테스트할 수 있는 환경
> **상위 문서**: [app/claude.md](../claude.md)

---

## 📋 개요

샌드박스 페이지는 개발자가 PPT Maker의 핵심 기능을 독립적으로 테스트할 수 있는 환경입니다.

### 주요 기능

1. **AI 생성 테스트**
   - Gemini API를 사용한 프리젠테이션 생성
   - 테스트 프롬프트 또는 커스텀 프롬프트 입력
   - Perplexity 자료 조사 옵션
   - 생성 시간 측정
   - 결과 메타데이터 표시
   - JSON 다운로드

2. **템플릿 렌더링 테스트**
   - 전체 프리젠테이션 또는 단일 슬라이드 타입 렌더링
   - 렌더링 시간 측정
   - HTML 소스 미리보기
   - 새 창에서 결과 미리보기

3. **시스템 정보**
   - API 키 상태 확인
   - 로컬 스토리지 사용량
   - 브라우저 환경 정보

---

## 📂 파일 구조

```
app/sandbox/
├── page.tsx              # 메인 샌드박스 페이지
└── claude.md             # 현재 문서

components/sandbox/
├── AIGenerationTest.tsx  # AI 생성 테스트 컴포넌트
└── TemplateRenderTest.tsx # 템플릿 렌더링 테스트 컴포넌트

utils/sandbox/
├── testData.ts           # 테스트용 샘플 데이터
└── testHelpers.ts        # 테스트 헬퍼 함수
```

---

## 🚀 사용 방법

### 1. 개발 서버 실행

```bash
npm run dev
```

### 2. 샌드박스 페이지 접속

브라우저에서 http://localhost:3000/sandbox 접속

### 3. AI 생성 테스트

1. **프롬프트 선택**: 미리 정의된 테스트 프롬프트 선택
2. **커스텀 입력** (선택): 직접 프롬프트 입력
3. **자료 조사 옵션** (선택): Perplexity API 사용
4. **생성 버튼 클릭**: 프리젠테이션 생성 시작
5. **결과 확인**:
   - 생성 시간
   - 슬라이드 수 및 타입
   - JSON 다운로드
   - 데이터 미리보기

### 4. 템플릿 렌더링 테스트

1. **테스트 타입 선택**:
   - 전체 프리젠테이션 (9개 슬라이드)
   - 단일 슬라이드 타입
2. **슬라이드 타입 선택** (단일 테스트 시)
3. **렌더링 버튼 클릭**
4. **결과 확인**:
   - 렌더링 시간
   - HTML 크기
   - 새 창에서 미리보기
   - HTML 소스 확인

---

## 🔧 테스트 데이터

### 미리 정의된 프롬프트

`utils/sandbox/testData.ts`에서 확인 가능:

- **simple**: 간단한 프리젠테이션 (기본 슬라이드)
- **detailed**: 상세한 프리젠테이션 (여러 타입)
- **technical**: 기술 프리젠테이션 (코드 및 기술 내용)
- **business**: 비즈니스 프리젠테이션 (차트 및 통계)

### 샘플 프리젠테이션

`SAMPLE_PPT_DATA`: 9개 슬라이드를 포함한 완전한 프리젠테이션

### 슬라이드 타입별 샘플

`SAMPLE_SLIDES_BY_TYPE`: 12개 슬라이드 타입의 개별 샘플

---

## 🛠️ 테스트 헬퍼 함수

### PerformanceTimer

성능 측정을 위한 타이머 클래스:

```typescript
const timer = new PerformanceTimer()
timer.start()
// 작업 수행
timer.stop()
console.log(timer.getFormattedDuration()) // "1.23초" 또는 "123ms"
```

### validatePPTData

프리젠테이션 데이터 유효성 검증:

```typescript
if (validatePPTData(data)) {
  // 유효한 데이터
}
```

### extractMetadata

프리젠테이션 메타데이터 추출:

```typescript
const metadata = extractMetadata(pptData)
// { title, totalSlides, slideTypes, ... }
```

### storageTest

로컬 스토리지 테스트:

```typescript
storageTest.isAvailable() // true/false
storageTest.getFormattedUsage() // "12.34KB"
```

### apiKeyTest

API 키 상태 확인:

```typescript
apiKeyTest.hasGeminiKey() // true/false
apiKeyTest.getStatus() // { gemini: true, perplexity: false }
```

---

## ⚠️ 주의사항

### 1. 프로덕션 환경

**샌드박스 페이지는 개발 환경 전용입니다.**

프로덕션 배포 시 다음 중 하나를 선택:

**옵션 A: 완전 제거**
```bash
rm -rf app/sandbox
```

**옵션 B: 조건부 접근**
```typescript
// app/sandbox/page.tsx
export default function SandboxPage() {
  if (process.env.NODE_ENV === "production") {
    redirect("/")
  }
  // ...
}
```

**옵션 C: 인증 추가**
```typescript
// 개발자만 접근 가능하도록 인증 추가
```

### 2. API 키 관리

- **Gemini API 키**: `.env.local`에서 `NEXT_PUBLIC_GEMINI_API_KEY` 확인
- **Perplexity API 키**: 서버 사이드 전용, 클라이언트에서 접근 불가
- API 키가 없으면 해당 기능 사용 불가

### 3. 로컬 스토리지

- 샌드박스는 실제 Store를 사용하지 않음
- 테스트 결과는 저장되지 않음
- 생성된 데이터를 저장하려면 JSON 다운로드 사용

---

## 🐛 트러블슈팅

### API 호출 실패

**증상**: AI 생성 테스트 실패
**원인**: API 키 미설정 또는 네트워크 오류
**해결**:
1. `.env.local` 파일에서 API 키 확인
2. 개발 서버 재시작
3. 브라우저 콘솔에서 에러 메시지 확인

### 템플릿 렌더링 오류

**증상**: HTML 생성 실패
**원인**: 템플릿 엔진 오류 또는 잘못된 슬라이드 데이터
**해결**:
1. 브라우저 콘솔에서 에러 확인
2. 샘플 데이터가 올바른지 확인
3. `services/template` 디렉토리 확인

### 미리보기 창이 열리지 않음

**증상**: 새 창에서 미리보기 실패
**원인**: 팝업 차단
**해결**:
1. 브라우저 팝업 차단 해제
2. localhost에 대한 팝업 허용

---

## 📊 성능 기준

### AI 생성

- **목표**: < 3초 (Gemini Flash)
- **조사 포함**: < 10초 (Perplexity + Gemini)

### 템플릿 렌더링

- **목표**: < 100ms (12개 슬라이드)
- **단일 슬라이드**: < 10ms

### HTML 크기

- **전체 프리젠테이션**: 약 20-30KB
- **단일 슬라이드**: 약 2-3KB

---

## 🔄 확장 가능성

### 추가할 수 있는 테스트

1. **편집 기능 테스트**
   - 슬라이드 수정
   - 저장/로드 테스트

2. **Export 기능 테스트**
   - PDF 생성
   - PPTX 생성

3. **성능 벤치마크**
   - 대량 슬라이드 생성
   - 렌더링 성능 측정

4. **통합 테스트**
   - 전체 워크플로우
   - E2E 시나리오

---

## 📚 관련 문서

- [SPECIFICATION.md](../../docs/SPECIFICATION.md) - 시스템 아키텍처
- [services/claude.md](../../services/claude.md) - AI 서비스 가이드
- [TEST_PROMPT.md](../../docs/TEST_PROMPT.md) - 슬라이드 타입별 테스트 프롬프트

---

**문서 버전**: 1.0
**최종 업데이트**: 2025-11-06
**관리자**: 개발 팀
