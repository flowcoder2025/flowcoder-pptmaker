/**
 * 샌드박스 테스트용 샘플 데이터
 */

import type { UnifiedPPTJSON } from "@/types/pptJson"

/**
 * 테스트용 프롬프트 목록
 */
export const TEST_PROMPTS = [
  {
    id: "simple",
    title: "간단한 프리젠테이션",
    prompt: "AI 워크플로우 자동화 플랫폼",
    description: "기본 슬라이드 생성 테스트",
  },
  {
    id: "detailed",
    title: "상세한 프리젠테이션",
    prompt: "앱인토스(Apps in Toss) 수익성 및 시장성 분석",
    description: "여러 슬라이드 타입 테스트",
  },
  {
    id: "technical",
    title: "기술 프리젠테이션",
    prompt: "React 19의 새로운 기능과 변경사항",
    description: "코드 및 기술 내용 테스트",
  },
  {
    id: "business",
    title: "비즈니스 프리젠테이션",
    prompt: "2024년 스타트업 투자 트렌드 분석",
    description: "차트 및 통계 테스트",
  },
]

/**
 * 테스트용 샘플 UnifiedPPTJSON 데이터
 */
export const SAMPLE_PPT_DATA = {
  title: "샌드박스 테스트 프리젠테이션",
  slides: [
    {
      id: "slide-1",
      type: "title",
      title: "샌드박스 테스트",
      subtitle: "PPT Maker in Toss 테스트 환경",
    },
    {
      id: "slide-2",
      type: "content",
      title: "테스트 목적",
      content: "이 샌드박스 환경은 PPT Maker의 기능을 독립적으로 테스트하기 위한 환경이에요.",
    },
    {
      id: "slide-3",
      type: "bullet",
      title: "테스트 항목",
      bullets: [
        "AI 생성 기능 테스트",
        "템플릿 렌더링 테스트",
        "편집 기능 테스트",
        "성능 측정",
      ],
    },
    {
      id: "slide-4",
      type: "section",
      title: "AI 생성 테스트",
    },
    {
      id: "slide-5",
      type: "table",
      title: "테스트 결과",
      headers: ["항목", "상태", "비고"],
      rows: [
        ["Gemini API", "✅ 정상", "API 키 설정됨"],
        ["Perplexity API", "✅ 정상", "자료 조사 가능"],
        ["템플릿 엔진", "✅ 정상", "12개 타입 지원"],
      ],
    },
    {
      id: "slide-6",
      type: "stats",
      title: "성능 지표",
      stats: [
        { label: "생성 시간", value: "< 3초" },
        { label: "렌더링 시간", value: "< 100ms" },
        { label: "비용 절감", value: "98%" },
        { label: "슬라이드 타입", value: "12개" },
      ],
    },
    {
      id: "slide-7",
      type: "comparison",
      title: "기존 vs 개선",
      leftTitle: "기존 방식",
      leftItems: ["API 의존", "비용 높음", "편집 제한"],
      rightTitle: "개선 방식",
      rightItems: ["클라이언트 생성", "비용 절감", "무제한 편집"],
    },
    {
      id: "slide-8",
      type: "quote",
      title: "프로젝트 철학",
      quote: "AI로 빠르게 생성하고, 사람이 자유롭게 편집한다",
      author: "PPT Maker Team",
    },
    {
      id: "slide-9",
      type: "thankyou",
      title: "테스트를 마치며",
      subtitle: "샌드박스 환경 구축 완료",
      contact: "ppt-maker@apps-in-toss.com",
    },
  ],
}

/**
 * 각 슬라이드 타입별 샘플 데이터
 */
export const SAMPLE_SLIDES_BY_TYPE = {
  title: {
    id: "test-title",
    type: "title" as const,
    title: "타이틀 슬라이드 테스트",
    subtitle: "서브타이틀입니다",
  },
  content: {
    id: "test-content",
    type: "content" as const,
    title: "콘텐츠 슬라이드 테스트",
    content: "본문 내용이 여기 들어가요. 긴 텍스트도 정상적으로 표시되는지 확인할 수 있어요.",
  },
  bullet: {
    id: "test-bullet",
    type: "bullet" as const,
    title: "불릿 슬라이드 테스트",
    bullets: ["첫 번째 항목", "두 번째 항목", "세 번째 항목"],
  },
  section: {
    id: "test-section",
    type: "section" as const,
    title: "섹션 슬라이드 테스트",
  },
  table: {
    id: "test-table",
    type: "table" as const,
    title: "테이블 슬라이드 테스트",
    headers: ["헤더1", "헤더2", "헤더3"],
    rows: [
      ["데이터1-1", "데이터1-2", "데이터1-3"],
      ["데이터2-1", "데이터2-2", "데이터2-3"],
    ],
  },
  chart: {
    id: "test-chart",
    type: "chart" as const,
    title: "차트 슬라이드 테스트",
    chartType: "bar" as const,
    dataPoints: [
      { label: "항목1", value: 30 },
      { label: "항목2", value: 50 },
      { label: "항목3", value: 70 },
    ],
  },
  stats: {
    id: "test-stats",
    type: "stats" as const,
    title: "통계 슬라이드 테스트",
    stats: [
      { label: "지표1", value: "100%" },
      { label: "지표2", value: "200개" },
      { label: "지표3", value: "₩1M" },
      { label: "지표4", value: "5년" },
    ],
  },
  comparison: {
    id: "test-comparison",
    type: "comparison" as const,
    title: "비교 슬라이드 테스트",
    leftTitle: "A 옵션",
    leftItems: ["장점1", "장점2", "장점3"],
    rightTitle: "B 옵션",
    rightItems: ["장점1", "장점2", "장점3"],
  },
  timeline: {
    id: "test-timeline",
    type: "timeline" as const,
    title: "타임라인 슬라이드 테스트",
    items: [
      { date: "2024 Q1", title: "Phase 1", description: "기획 및 설계" },
      { date: "2024 Q2", title: "Phase 2", description: "개발 진행" },
      { date: "2024 Q3", title: "Phase 3", description: "테스트 및 출시" },
    ],
  },
  quote: {
    id: "test-quote",
    type: "quote" as const,
    title: "인용 슬라이드 테스트",
    quote: "테스트는 품질의 시작이다",
    author: "익명",
  },
  thankyou: {
    id: "test-thankyou",
    type: "thankyou" as const,
    title: "감사 슬라이드 테스트",
    subtitle: "질문이 있으신가요?",
    contact: "test@example.com",
  },
  twocolumn: {
    id: "test-twocolumn",
    type: "twocolumn" as const,
    title: "2열 슬라이드 테스트",
    leftContent: "왼쪽 컬럼 내용입니다.",
    rightContent: "오른쪽 컬럼 내용입니다.",
  },
}
