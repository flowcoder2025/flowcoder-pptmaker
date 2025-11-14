/**
 * Gemini를 사용한 슬라이드 콘텐츠 생성
 * 사용자 입력 + 자료 조사 결과 → 구조화된 슬라이드 콘텐츠
 */

import { geminiFlash, geminiPro } from './config';
import type { ResearchResult } from '@/types/research';

export interface ContentGenerationOptions {
  userInput: string;
  research?: ResearchResult;
  useProModel: boolean; // true: Pro (고품질), false: Flash (빠른속도)
  maxSlides?: number; // 슬라이드 수 제한 (플랜별)
  aspectRatio?: '16:9' | '4:3' | 'A4-portrait'; // 화면 비율
  pageFormat?: 'slides' | 'one-page'; // 페이지 형식
}

/**
 * 지수 백오프를 사용한 대기 함수
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 사용자 입력과 자료 조사 결과를 바탕으로 슬라이드 콘텐츠 생성
 *
 * 재시도 정책:
 * - 최대 3회 재시도
 * - Exponential backoff: 2초, 4초, 8초
 * - 503 에러(서버 과부하)에 대해서만 재시도
 * - 모두 실패하면 명확한 에러 메시지 반환
 */
export async function generateSlideContent(options: ContentGenerationOptions): Promise<string> {
  const {
    userInput,
    research,
    useProModel,
    maxSlides = 25,
    aspectRatio = '16:9',
    pageFormat = 'slides'
  } = options;

  const model = useProModel ? geminiPro : geminiFlash;
  const modelName = useProModel ? 'Pro' : 'Flash';

  console.log(`📝 [Gemini ${modelName}] 슬라이드 콘텐츠 생성 시작`);
  console.log(`📐 AspectRatio: ${aspectRatio}, PageFormat: ${pageFormat}`);

  // 프롬프트 구성
  let prompt = `당신은 프리젠테이션 콘텐츠 전문가입니다. 주어진 정보를 바탕으로 UnifiedPPTJSON 형식의 슬라이드 데이터를 생성해주세요.

📐 **화면 비율 및 형식:**
- 화면 비율: ${aspectRatio}
- 페이지 형식: ${pageFormat === 'one-page' ? '원페이지 (1장)' : '여러 슬라이드'}

${pageFormat === 'one-page' ? `
🚨🚨🚨 **CRITICAL: 원페이지 모드 - 필수 준수사항** 🚨🚨🚨

**절대 규칙 (MANDATORY):**
1. **반드시 reportTwoColumn 또는 reportA4 타입 중 하나만 사용**
2. **반드시 1장의 슬라이드만 생성 (slides 배열에 정확히 1개)**
3. **다른 슬라이드 타입 절대 사용 금지** (title, section, content, bullet, twoColumn, chart 등 모두 금지)
4. **이 규칙을 위반하면 생성이 실패합니다**

**원페이지 모드 전용 슬라이드 타입 (이 중 하나만 선택):**

**옵션 1 - reportTwoColumn** (2단 보고서 형식):
\`\`\`json
{
  "slides": [
    {
      "type": "reportTwoColumn",
      "props": {
        "title": "보고서 제목",
        "sections": [
          {
            "subtitle": "섹션 1 제목",
            "body": "섹션 1 본문 내용 (여러 단락 가능)...",
            "bullets": ["핵심 포인트 1", "핵심 포인트 2"]
          },
          {
            "subtitle": "섹션 2 제목",
            "body": "섹션 2 본문 내용..."
          },
          {
            "subtitle": "섹션 3 제목",
            "body": "섹션 3 본문 내용...",
            "bullets": ["핵심 포인트 3"]
          }
        ],
        "image": "https://example.com/image.jpg",
        "imageCaption": "이미지 캡션"
      },
      "style": {}
    }
  ]
}
\`\`\`

**옵션 2 - reportA4** (세로 A4 보고서 형식):
\`\`\`json
{
  "slides": [
    {
      "type": "reportA4",
      "props": {
        "title": "보고서 제목",
        "subtitle": "부제목",
        "image": "https://example.com/image.jpg",
        "sections": [
          {
            "subtitle": "섹션 1 제목",
            "body": "섹션 1 본문 내용 (여러 단락 가능)...",
            "bullets": ["핵심 포인트 1", "핵심 포인트 2"]
          },
          {
            "subtitle": "섹션 2 제목",
            "body": "섹션 2 본문 내용..."
          },
          {
            "subtitle": "섹션 3 제목",
            "body": "섹션 3 본문 내용...",
            "bullets": ["핵심 포인트 3"]
          }
        ]
      },
      "style": {}
    }
  ]
}
\`\`\`

⚠️ **다시 한번 강조: 원페이지 모드에서는 위 2가지 타입 중 하나만 사용하고, 반드시 1장만 생성하세요!**
` : `
🚨 **슬라이드 수 목표 = ${maxSlides}장 (±2-3장 오차 허용)**
- 목표: ${maxSlides}장
- 허용 범위: ${maxSlides - 3} ~ ${maxSlides + 3}장
- AI 특성상 정확히 맞추기 어려울 수 있지만 최대한 목표에 맞춰주세요`}

**사용자 요청:**
${userInput}
`;

  // 자료 조사 결과가 있으면 포함
  // Perplexity API에서 이미 3000자로 제한되어 있음 (app/api/research/route.ts)
  if (research && research.content) {
    prompt += `

**조사된 자료:**
${research.content}

**출처 (${research.sources.length}개):**
${research.sources.slice(0, 5).map((s, i) => `${i + 1}. ${s.title} - ${s.url}`).join('\n')}
`;
  }

  prompt += `

**출력 형식:** UnifiedPPTJSON (JSON만 출력, 다른 텍스트 없음)

**JSON 스키마:**
\`\`\`json
{
  "slides": [
    {
      "type": "title|section|content|bullet|twoColumn|chart|table|stats|quote|comparison|timeline|thankYou|featureGrid|teamProfile|process|roadmap|pricing|imageText|agenda|testimonial|gallery",
      "props": { /* type별로 다른 구조 */ },
      "style": { /* TDS 색상 팔레트 사용 */ }
    }
  ]
}
\`\`\`

**슬라이드 타입별 props 구조:**

**⚠️ 전체 제약사항:**
- **agenda** 타입: items 배열 최대 8개 (렌더링 제한)
- **timeline** 타입: items 배열 최대 6개 (렌더링 제한)
- **featureGrid** 타입: features 배열 최대 3개 (3열 그리드 최적화)
- **teamProfile** 타입: members 배열 최대 6개 (렌더링 제한)

1. **title** (표지 슬라이드):
\`\`\`json
{
  "type": "title",
  "props": {
    "title": "프리젠테이션 메인 제목",
    "subtitle": "부제 또는 설명 (선택사항)"
  },
  "style": {"background": "#3182f6"}
}
\`\`\`

2. **section** (섹션 구분 슬라이드):
\`\`\`json
{
  "type": "section",
  "props": {
    "title": "섹션 1: 시장 현황",
    "number": 1
  },
  "style": {"background": "#333d4b"}
}
\`\`\`

3. **content** (본문 슬라이드 - 단락 형태):
\`\`\`json
{
  "type": "content",
  "props": {
    "title": "현재 시장의 문제점",
    "body": "많은 기업들이 반복적인 업무로 인해 핵심 업무에 집중하지 못하고 있습니다. 수작업 프로세스는 시간과 비용을 낭비하며 휴먼 에러의 위험도 높습니다."
  },
  "style": {}
}
\`\`\`

4. **bullet** (목록 슬라이드):
\`\`\`json
{
  "type": "bullet",
  "props": {
    "title": "주요 해결 과제",
    "bullets": [
      {"text": "반복 작업 자동화 필요성 증가", "level": 0},
      {"text": "실시간 데이터 분석 요구", "level": 0},
      {"text": "팀 협업 효율성 개선", "level": 0}
    ]
  },
  "style": {}
}
\`\`\`

5. **twoColumn** (두 컬럼 레이아웃):
\`\`\`json
{
  "type": "twoColumn",
  "props": {
    "title": "제품 아키텍처",
    "leftContent": "프론트엔드 레이어\\n- React 기반 SPA\\n- 실시간 대시보드",
    "rightContent": "백엔드 시스템\\n- Node.js 마이크로서비스\\n- GPT-4 AI 엔진"
  },
  "style": {}
}
\`\`\`

6. **stats** (통계 대시보드 - 2~4개 핵심 지표):
\`\`\`json
{
  "type": "stats",
  "props": {
    "title": "핵심 성과 지표",
    "stats": [
      {"value": "98%", "label": "고객 만족도"},
      {"value": "3배", "label": "생산성 향상"},
      {"value": "50만", "label": "누적 사용자"},
      {"value": "4.8/5", "label": "평균 평점"}
    ],
    "citation": "출처: 2024년 1분기 사용자 설문조사 (선택사항)"
  },
  "style": {}
}
\`\`\`

**중요:** 자료 조사 결과(research data)가 제공된 경우, stats 슬라이드에 \`citation\` 필드를 추가하여 데이터 출처를 명시하세요.
- 형식: "출처: [조사 기관/날짜]" 또는 "출처: 최신 시장 조사 데이터 (2024)"
- Perplexity, AI 도구 워터마크는 절대 포함하지 마세요
- 일반적인 설명이나 추정치에는 citation 불필요

7. **table** (데이터 테이블):
\`\`\`json
{
  "type": "table",
  "props": {
    "title": "경쟁사 비교",
    "headers": ["기능", "우리 제품", "경쟁사 A", "경쟁사 B"],
    "rows": [
      ["처리 속도", "0.3초", "1.2초", "0.8초"],
      ["정확도", "98%", "85%", "80%"],
      ["가격", "저렴", "보통", "비쌈"]
    ]
  },
  "style": {}
}
\`\`\`

8. **chart** (차트 - 4가지 타입 지원):
   - **bar**: 막대 그래프 (비교, 순위, 카테고리별 수치)
   - **line**: 꺾은선 그래프 (추세, 시간 흐름, 변화)
   - **pie**: 원형 그래프 (비율, 구성, 점유율) - 최대 3개 시리즈까지 나란히 표시
   - **area**: 영역 그래프 (누적 추세, 볼륨 변화)

   **✨ 다중 시리즈 지원**:
   - **bar, line, area**: 여러 데이터 시리즈를 겹쳐서 비교 (연도별, 제품별, 목표 vs 실적 등)
   - **pie**: 최대 3개 시리즈까지 나란히 표시 (각 시리즈가 별도 파이 차트로 렌더링)
   - 단일 시리즈: 하나의 데이터만 표시 (기본)

**Bar 차트 예시** (비교 데이터):
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "분기별 성장률",
    "chartType": "bar",
    "data": [{
      "name": "성장률",
      "labels": ["2024 Q1", "2024 Q2", "2024 Q3", "2024 Q4"],
      "values": [25, 40, 60, 85]
    }]
  },
  "style": {}
}
\`\`\`

**Bar 차트 (다중 시리즈 비교)** - 각 카테고리마다 여러 막대를 그룹으로 표시:
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "분기별 목표 달성률 비교",
    "chartType": "bar",
    "data": [
      {
        "name": "목표",
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "values": [80, 80, 85, 90]
      },
      {
        "name": "실적",
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "values": [75, 85, 92, 95]
      }
    ]
  },
  "style": {}
}
\`\`\`

**Line 차트 예시** (시간 추세):
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "월별 사용자 증가 추이",
    "chartType": "line",
    "data": [{
      "name": "활성 사용자",
      "labels": ["1월", "2월", "3월", "4월", "5월", "6월"],
      "values": [120, 150, 180, 220, 280, 350]
    }]
  },
  "style": {}
}
\`\`\`

**Line 차트 (다중 시리즈 비교)** - 여러 시리즈를 겹쳐서 추세 비교:
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "연도별 매출 비교",
    "chartType": "line",
    "data": [
      {
        "name": "2023년",
        "labels": ["1Q", "2Q", "3Q", "4Q"],
        "values": [120, 150, 180, 200]
      },
      {
        "name": "2024년",
        "labels": ["1Q", "2Q", "3Q", "4Q"],
        "values": [150, 190, 240, 280]
      }
    ]
  },
  "style": {}
}
\`\`\`

**Pie 차트 예시** (비율 구성):
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "시장 점유율",
    "chartType": "pie",
    "data": [{
      "name": "점유율",
      "labels": ["우리 제품", "경쟁사 A", "경쟁사 B", "기타"],
      "values": [35, 28, 22, 15]
    }]
  },
  "style": {}
}
\`\`\`

**Pie 차트 (다중 시리즈 비교)** - 최대 3개 시리즈를 나란히 표시:
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "지역별 매출 구성 비교",
    "chartType": "pie",
    "data": [
      {
        "name": "서울",
        "labels": ["제품 A", "제품 B", "제품 C"],
        "values": [45, 35, 20]
      },
      {
        "name": "경기",
        "labels": ["제품 A", "제품 B", "제품 C"],
        "values": [50, 30, 20]
      },
      {
        "name": "부산",
        "labels": ["제품 A", "제품 B", "제품 C"],
        "values": [40, 40, 20]
      }
    ]
  },
  "style": {}
}
\`\`\`

**Area 차트 예시** (누적 볼륨):
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "분기별 매출 추이",
    "chartType": "area",
    "data": [{
      "name": "매출",
      "labels": ["Q1", "Q2", "Q3", "Q4"],
      "values": [1200, 1850, 2400, 3100]
    }]
  },
  "style": {}
}
\`\`\`

**Area 차트 (다중 시리즈 비교)** - 영역을 겹쳐서 볼륨 비교:
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "제품별 매출 추이",
    "chartType": "area",
    "data": [
      {
        "name": "제품 A",
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "values": [800, 1200, 1600, 2000]
      },
      {
        "name": "제품 B",
        "labels": ["Q1", "Q2", "Q3", "Q4"],
        "values": [400, 650, 800, 1100]
      }
    ]
  },
  "style": {}
}
\`\`\`

9. **comparison** (좌우 대비):
\`\`\`json
{
  "type": "comparison",
  "props": {
    "title": "기존 도구 vs 우리 솔루션",
    "leftLabel": "기존 도구의 한계",
    "leftContent": "- 부분적 자동화만 제공\\n- 복잡한 초기 설정 필요\\n- 높은 학습 곡선",
    "rightLabel": "우리 솔루션의 강점",
    "rightContent": "- 완전 자동화 워크플로우\\n- 즉시 사용 가능한 템플릿\\n- 직관적인 UI"
  },
  "style": {}
}
\`\`\`

10. **quote** (인용문):
\`\`\`json
{
  "type": "quote",
  "props": {
    "quote": "이 도구 덕분에 우리 팀의 생산성이 3배 향상되었습니다.",
    "author": "김민준, ABC 스타트업 CEO",
    "showQuoteMark": true
  },
  "style": {}
}
\`\`\`

11. **timeline** (타임라인):
\`\`\`json
{
  "type": "timeline",
  "props": {
    "title": "개발 로드맵",
    "items": [
      {"title": "2024년 1월", "description": "알파 버전 개발 시작"},
      {"title": "2024년 4월", "description": "베타 테스트 시작"},
      {"title": "2024년 7월", "description": "정식 출시"}
    ]
  },
  "style": {}
}
\`\`\`

12. **thankYou** (마무리 슬라이드):
\`\`\`json
{
  "type": "thankYou",
  "props": {
    "message": "함께 해주셔서 감사합니다",
    "contact": "contact@example.com"
  },
  "style": {"background": "#3182f6"}
}
\`\`\`

13. **featureGrid** (기능 그리드 - 3열 기능 카드):

**아이콘 타입**:
- **iconType**: \`"emoji"\` (기본값, 이모지 문자) 또는 \`"image"\` (사용자가 업로드한 base64 이미지)
- **기본적으로 이모지 사용 권장** (사용자가 이미지로 변경 가능)

\`\`\`json
{
  "type": "featureGrid",
  "props": {
    "title": "핵심 기능",
    "features": [
      {
        "iconType": "emoji",
        "icon": "⚡",
        "title": "빠른 처리 속도",
        "description": "평균 0.3초의 응답 시간으로 실시간 분석을 제공합니다"
      },
      {
        "iconType": "emoji",
        "icon": "🔒",
        "title": "데이터 보안",
        "description": "엔터프라이즈급 보안으로 민감한 정보를 안전하게 보호합니다"
      },
      {
        "iconType": "emoji",
        "icon": "📊",
        "title": "상세한 분석",
        "description": "직관적인 대시보드로 복잡한 데이터를 쉽게 이해할 수 있습니다"
      }
    ]
  },
  "style": {}
}
\`\`\`

**참고**: iconType을 생략하면 자동으로 "emoji"로 처리됩니다. 이미지 아이콘은 사용자가 편집기에서 직접 업로드할 수 있습니다.

14. **teamProfile** (팀 프로필 - 1-6명 최적화):
\`\`\`json
{
  "type": "teamProfile",
  "props": {
    "title": "우리 팀",
    "profiles": [
      {
        "name": "김철수",
        "role": "CEO & Co-Founder",
        "bio": "10년 경력의 AI 전문가. 삼성전자 AI 연구소 출신",
        "image": "https://example.com/profile1.jpg"
      },
      {
        "name": "이영희",
        "role": "CTO",
        "bio": "풀스택 개발자. 네이버 클라우드 출신으로 8년 경력",
        "image": "https://example.com/profile2.jpg"
      }
    ]
  },
  "style": {}
}
\`\`\`

15. **process** (프로세스 플로우 - 세로 연결):
\`\`\`json
{
  "type": "process",
  "props": {
    "title": "서비스 작동 방식",
    "steps": [
      {
        "title": "데이터 연동",
        "description": "기존 시스템과 API를 통해 자동으로 연결됩니다"
      },
      {
        "title": "AI 분석",
        "description": "머신러닝 알고리즘이 데이터를 실시간으로 분석합니다"
      },
      {
        "title": "인사이트 제공",
        "description": "분석 결과를 대시보드로 시각화하여 제공합니다"
      }
    ]
  },
  "style": {}
}
\`\`\`

16. **roadmap** (로드맵 - 타임라인 형태):
\`\`\`json
{
  "type": "roadmap",
  "props": {
    "title": "개발 로드맵",
    "items": [
      {
        "period": "Q1 2025",
        "status": "Completed",
        "title": "코어 엔진 개발",
        "description": "기본 AI 엔진 개발 및 테스트 완료"
      },
      {
        "period": "Q2 2025",
        "status": "In Progress",
        "title": "베타 서비스 출시",
        "description": "초기 사용자 대상 베타 테스트 진행 중"
      },
      {
        "period": "Q3 2025",
        "status": "Planned",
        "title": "정식 출시",
        "description": "전체 기능을 갖춘 정식 서비스 출시 예정"
      }
    ]
  },
  "style": {}
}
\`\`\`

17. **pricing** (가격표 - 3단계 플랜):
\`\`\`json
{
  "type": "pricing",
  "props": {
    "title": "요금제 안내",
    "tiers": [
      {
        "name": "Basic",
        "price": "₩50,000",
        "period": "/월",
        "description": "개인 사용자를 위한 플랜",
        "features": [
          "월 100회 분석",
          "기본 대시보드",
          "이메일 지원"
        ],
        "recommended": false
      },
      {
        "name": "Pro",
        "price": "₩150,000",
        "period": "/월",
        "description": "대부분의 기업을 위한 플랜",
        "features": [
          "월 500회 분석",
          "고급 대시보드",
          "우선 지원",
          "API 접근"
        ],
        "recommended": true
      },
      {
        "name": "Enterprise",
        "price": "문의",
        "period": "",
        "description": "대규모 조직을 위한 플랜",
        "features": [
          "무제한 분석",
          "맞춤형 대시보드",
          "전담 매니저",
          "온프레미스 설치"
        ],
        "recommended": false
      }
    ]
  },
  "style": {}
}
\`\`\`

18. **imageText** (이미지+텍스트 레이아웃):
\`\`\`json
{
  "type": "imageText",
  "props": {
    "title": "제품 UI 스크린샷",
    "image": "https://example.com/dashboard.png",
    "imagePosition": "left",
    "bullets": [
      "직관적인 드래그 앤 드롭 인터페이스",
      "실시간 협업 기능",
      "모바일 최적화",
      "다크 모드 지원"
    ]
  },
  "style": {}
}
\`\`\`

19. **agenda** (아젠다 - 번호 매긴 목록):
**⚠️ 중요**: items 배열은 **최대 8개**까지만 포함하세요. 9개 이상이면 렌더링 오류가 발생해요.
\`\`\`json
{
  "type": "agenda",
  "props": {
    "title": "오늘의 안건",
    "items": [
      {
        "title": "프로젝트 개요",
        "description": "배경과 목표에 대한 소개"
      },
      {
        "title": "시장 분석",
        "description": "현재 시장 상황 및 경쟁사 분석"
      },
      {
        "title": "제품 소개",
        "description": "핵심 기능과 차별화 포인트"
      },
      {
        "title": "비즈니스 모델",
        "description": "수익 모델 및 성장 전략"
      }
    ]
  },
  "style": {}
}
\`\`\`

20. **testimonial** (추천사 - 고객 후기):
\`\`\`json
{
  "type": "testimonial",
  "props": {
    "title": "고객 후기",
    "quote": "이 도구를 사용한 후 팀의 생산성이 3배나 향상되었습니다. 특히 자동화 기능이 정말 유용했어요.",
    "author": "박지민",
    "role": "프로젝트 매니저, XYZ 스타트업",
    "image": "https://example.com/testimonial.jpg"
  },
  "style": {}
}
\`\`\`

21. **gallery** (이미지 갤러리 - 2x2 그리드):
\`\`\`json
{
  "type": "gallery",
  "props": {
    "title": "제품 스크린샷",
    "images": [
      {
        "url": "https://example.com/screenshot1.jpg",
        "caption": "메인 대시보드"
      },
      {
        "url": "https://example.com/screenshot2.jpg",
        "caption": "분석 리포트"
      },
      {
        "url": "https://example.com/screenshot3.jpg",
        "caption": "팀 협업 화면"
      },
      {
        "url": "https://example.com/screenshot4.jpg",
        "caption": "모바일 앱"
      }
    ]
  },
  "style": {}
}
\`\`\`

**필수 요구사항:**
1. 슬라이드 구성: 반드시 title로 시작하고 thankYou로 끝내기
2. 섹션 구분: 내용이 많으면 section 슬라이드로 구분
3. 시각화 필수: 최소 1개씩 포함 - stats, table, chart, comparison 중 선택
4. **🚨 슬라이드 수 제한: 정확히 최대 ${maxSlides}장까지만 생성 (CRITICAL)**
   - ❌ ${maxSlides}장을 초과하는 슬라이드 생성 절대 금지
   - ✅ title + agenda + 본문(${maxSlides - 3}장 이하) + thankYou = 총 ${maxSlides}장 이하
   - ✅ 플랜별 엄격한 제한 - 초과 시 자동 삭제됨
   - ⚠️ 핵심 내용만 간결하게 포함하여 제한 내에서 완성
5. **JSON만 출력** (마크다운 코드 블록 없이 순수 JSON만)

**작성 가이드:**
- 사용자 요청과 조사 자료를 바탕으로 풍부한 콘텐츠 구성
- 구체적인 수치, 사실, 사례 포함
- 프리젠테이션 흐름: 도입 → 본론 → 결론
- 각 슬라이드는 간결하면서도 핵심을 담기
- **Bullet 리스트는 슬라이드당 최대 5-6개** (더 많으면 별도 슬라이드로 분리)
- **Chart 데이터는 0-100 범위 값 사용** (예: 25, 40, 85 등 - 퍼센트 또는 점수)
- **다양한 슬라이드 타입 활용** (bullet만 반복하지 말고 stats, chart, comparison, timeline, featureGrid, teamProfile, process, roadmap, pricing, imageText, agenda, testimonial, gallery 등 21가지 타입을 적절히 배치)
- **출처 표시 (자료 조사 결과 있을 때):**
  * stats 슬라이드에 \`citation\` 필드 추가
  * 형식: "출처: [조사 기관/날짜]" 또는 "출처: 최신 시장 조사 (2024)"
  * 일반적 설명이나 추정치에는 출처 표시 불필요
  * Perplexity, AI 도구 워터마크 절대 포함 금지

**콘텐츠 일관성 규칙 (CRITICAL):**
- **수치 일관성**: 제목, 통계, 차트 등에서 동일한 항목에 대해 서로 다른 수치를 사용하지 말 것
  * ❌ 잘못된 예: 제목 "10배 향상" + stats 슬라이드 "3.5배 향상"
  * ✅ 올바른 예: 제목 "3.5배 향상" + stats 슬라이드 "3.5배 향상"
- **용어 일관성**: 동일한 개념을 표현할 때 일관된 용어 사용
  * 예: "AI 워크플로우 자동화 플랫폼" → 전체에서 이 표현 유지
- **단위 일관성**: 수치의 단위를 일관되게 표시
  * 예: 시간 단위는 모두 "초" 또는 모두 "밀리초"로 통일

**프레젠테이션 구조 규칙 (MANDATORY):**

1. 필수 슬라이드 순서:
   1) title (표지) - 반드시 첫 번째
   2) agenda (목차/안건) - 반드시 두 번째 ← CRITICAL
   3) section (섹션 구분, 필요시)
   4) 본문 내용 (content, bullet, stats, chart 등)
   5) thankYou (마무리) - 반드시 마지막

2. 아젠다 슬라이드 규칙:
   - **위치: 반드시 슬라이드 2번** (title 바로 다음)
   - **횟수: 프레젠테이션당 정확히 1회만**
   - **형식**: agenda 타입 사용 (번호 매긴 목록)
   - **내용**: 주요 섹션 제목 + 간단한 설명
   - ❌ 절대 금지: 슬라이드 22번이나 중간에 배치
   - ❌ 절대 금지: 아젠다 중복 생성

3. 슬라이드 수 목표:
   - 목표: ${maxSlides}개 (±2-3개 오차 허용)
   - 예상 범위: ${maxSlides - 3} ~ ${maxSlides + 3}개
   - 불필요한 중복 슬라이드 생성 금지

**수치 신뢰성 규칙 (CRITICAL):**

1. Testimonial/후기 수치 제한:
   - 효율성 향상: 100% ~ 300% (최대치)
   - 시간 절약: 30% ~ 70%
   - 비용 절감: 20% ~ 50%
   - ❌ 절대 금지: 350% 이상의 과장된 수치
   - ✅ 권장: 200~300% 범위 (신뢰성과 임팩트 균형)

2. 통계 데이터:
   - 시장 규모: 현실적 범위 (검증 가능한 출처)
   - 성장률: 업계 평균 고려 (10~50% 범위)
   - ROI: 합리적 수준 (2배~5배)
   - ❌ 절대 금지: 근거 없는 과장 수치

3. 수치 표현 원칙:
   - ✅ "300% 향상" (구체적)
   - ❌ "엄청나게 빨라짐" (모호함)
   - ✅ "평균 0.3초 응답 시간" (측정 가능)
   - ❌ "초고속 처리" (정량화 불가)

**타이포그래피 및 표현 규칙:**

1. 화폐 단위 표기:
   - 형식: "₩50,000 / 월" (슬래시 앞뒤 공백)
   - 천 단위 구분: 쉼표 사용 (₩150,000)
   - Enterprise 플랜: "문의" 또는 "맞춤 견적"

2. 퍼센트 표기:
   - 형식: "300% 향상" (숫자와 % 사이 공백 없음)
   - 소수점: 필요시만 사용 (예: 98.5%)

3. 숫자 표기:
   - 큰 숫자: 3자리마다 쉼표 (50,000명)
   - 배수 표현: "3배", "5배" (한글)
   - 점수 표기: "4.8/5" (슬래시 사용)

**톤 앤 매너 (MANDATORY):**

1. 전문적이고 신뢰감 있는 표현:
   - ✅ "검증된 AI 엔진으로 정확한 분석을 제공합니다"
   - ❌ "최고의 AI로 완벽한 결과를 보장합니다"

2. 과장 표현 절대 금지:
   - ❌ "혁명적", "완벽한", "최고의", "절대적"
   - ✅ "효율적", "신뢰할 수 있는", "검증된", "개선된"

3. 구체적이고 명확한 설명:
   - ✅ "평균 응답 시간 0.3초"
   - ❌ "매우 빠른 속도"
   - ✅ "98% 정확도 (2024년 1분기 테스트 결과)"
   - ❌ "거의 완벽한 정확도"

4. UX Writing 규칙 준수:
   - 모든 문구는 "~해요" 체 사용
   - 능동적 표현: "제공됐어요" → "제공해요"
   - 긍정적 표현: "없어요" → 대안 제시와 함께 사용`;

  // 재시도 로직
  const MAX_RETRIES = 3;
  const RETRY_DELAYS = [2000, 4000, 8000]; // 2초, 4초, 8초

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (attempt > 0) {
        const delay = RETRY_DELAYS[attempt - 1];
        console.log(`⏳ [Gemini ${modelName}] ${attempt}차 재시도 중... (${delay / 1000}초 대기 후)`);
        await sleep(delay);
      }

      const result = await model.generateContent(prompt);
      const content = result.response.text();

      console.log(`✅ [Gemini ${modelName}] 슬라이드 콘텐츠 생성 완료`);
      console.log(`📏 생성된 콘텐츠 길이: ${content.length}자`);

      // 🆕 디버깅: 응답 상세 로깅
      console.log(`📝 [Gemini ${modelName}] 응답 미리보기 (첫 500자):`, content.substring(0, 500));
      console.log(`📝 [Gemini ${modelName}] 응답 끝부분 (마지막 500자):`, content.substring(Math.max(0, content.length - 500)));

      // 🆕 검증: 응답이 비어있거나 너무 짧으면 경고
      if (content.length < 100) {
        console.warn(`⚠️ [Gemini ${modelName}] 응답이 너무 짧습니다 (${content.length}자). 재시도가 필요할 수 있습니다.`);
      }

      // 토큰 사용량 로깅
      if (result.response.usageMetadata) {
        const usage = result.response.usageMetadata;
        console.log(`💰 [Gemini ${modelName}] 토큰 사용량:`, {
          입력_토큰: usage.promptTokenCount,
          출력_토큰: usage.candidatesTokenCount,
          캐시_토큰: usage.cachedContentTokenCount || 0,
          총_토큰: usage.totalTokenCount,
          계산_검증: `${usage.promptTokenCount} + ${usage.candidatesTokenCount} + ${usage.cachedContentTokenCount || 0} = ${(usage.promptTokenCount || 0) + (usage.candidatesTokenCount || 0) + (usage.cachedContentTokenCount || 0)}`,
        });
      }

      return content;
    } catch (error: unknown) {
      const isLastAttempt = attempt === MAX_RETRIES;
      const errorMessage = error instanceof Error ? error.message : String(error);
      const isServerOverloaded = errorMessage.includes('503') ||
                                  errorMessage.includes('overloaded');

      console.error(`❌ [Gemini ${modelName}] 슬라이드 콘텐츠 생성 실패 (시도 ${attempt + 1}/${MAX_RETRIES + 1}):`, errorMessage);

      // 503 에러가 아니거나 마지막 시도인 경우 즉시 종료
      if (!isServerOverloaded || isLastAttempt) {
        if (isServerOverloaded) {
          throw new Error(
            `Gemini ${modelName} 서버가 일시적으로 과부하 상태입니다. 잠시 후 다시 시도해주세요. (${MAX_RETRIES + 1}회 시도 모두 실패)`
          );
        }
        throw error;
      }

      // 재시도 계속
      console.log(`🔄 [Gemini ${modelName}] 재시도 예정...`);
    }
  }

  // 이 코드에 도달하면 안되지만, 타입스크립트를 위한 fallback
  throw new Error(`Gemini ${modelName} 요청 실패: 알 수 없는 오류`);
}
