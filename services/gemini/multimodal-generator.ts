/**
 * Gemini 멀티모달 API를 사용한 슬라이드 콘텐츠 생성
 * 텍스트 + PDF/이미지 첨부 파일 → 구조화된 슬라이드 콘텐츠
 */

import { geminiFlash, geminiPro } from './config';
import type { ResearchResult, AttachmentFile } from '@/types/research';

export interface MultimodalGenerationOptions {
  userInput: string;
  attachments: AttachmentFile[];
  research?: ResearchResult;
  useProModel: boolean; // true: Pro (고품질), false: Flash (빠른속도)
  maxSlides?: number; // 슬라이드 수 제한 (플랜별)
}

/**
 * 지수 백오프를 사용한 대기 함수
 */
async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 사용자 입력, 첨부 파일, 자료 조사 결과를 바탕으로 슬라이드 콘텐츠 생성
 *
 * 멀티모달 모드:
 * - PDF: 텍스트 및 이미지 추출
 * - 이미지: 시각적 컨텍스트 분석
 *
 * 재시도 정책:
 * - 최대 3회 재시도
 * - Exponential backoff: 2초, 4초, 8초
 * - 503 에러(서버 과부하)에 대해서만 재시도
 */
export async function generateMultimodalSlideContent(
  options: MultimodalGenerationOptions
): Promise<string> {
  const { userInput, attachments, research, useProModel, maxSlides = 25 } = options;

  const model = useProModel ? geminiPro : geminiFlash;
  const modelName = useProModel ? 'Pro' : 'Flash';

  console.log(`📝 [Gemini ${modelName} Multimodal] 슬라이드 콘텐츠 생성 시작`);
  console.log(`📎 첨부 파일: ${attachments.length}개`);

  // 프롬프트 구성
  let prompt = `당신은 프리젠테이션 콘텐츠 전문가입니다. 주어진 텍스트와 첨부 파일(PDF, 이미지)을 분석하여 UnifiedPPTJSON 형식의 슬라이드 데이터를 생성해주세요.

🚨 **중요: 슬라이드 수 제한 = 최대 ${maxSlides}장** (플랜별 엄격한 제한)
- 절대 ${maxSlides}장을 초과하지 마세요
- 초과 시 자동으로 삭제됩니다
- 핵심 내용만 간결하게 구성하세요

**사용자 요청:**
${userInput}

📎 **첨부된 파일 ${attachments.length}개:**
${attachments.map((file, i) => `${i + 1}. ${file.name} (${file.mimeType}, ${(file.size / 1024).toFixed(1)} KB)`).join('\n')}

**첨부 파일 활용 지침:**
- PDF: 문서의 핵심 내용, 데이터, 인사이트를 추출하여 슬라이드에 반영하세요
- 이미지: 시각적 맥락을 분석하고, 필요 시 이미지 설명을 슬라이드에 포함하세요
- 첨부 파일의 정보를 최대한 활용하여 풍부한 콘텐츠를 생성하세요
`;

  // 자료 조사 결과가 있으면 포함
  if (research && research.content) {
    prompt += `

**웹 조사 자료:**
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

**슬라이드 타입별 props 구조:** (content-generator.ts와 동일한 스키마 사용)

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
    "title": "섹션 제목"
  },
  "style": {"background": "#f2f4f6"}
}
\`\`\`

3. **content** (일반 콘텐츠):
\`\`\`json
{
  "type": "content",
  "props": {
    "title": "슬라이드 제목",
    "content": "본문 내용 (여러 줄 가능)"
  }
}
\`\`\`

4. **bullet** (불릿 리스트):
\`\`\`json
{
  "type": "bullet",
  "props": {
    "title": "제목",
    "items": ["항목 1", "항목 2", "항목 3"]
  }
}
\`\`\`

5. **twoColumn** (2단 레이아웃):
\`\`\`json
{
  "type": "twoColumn",
  "props": {
    "title": "제목",
    "left": ["왼쪽 내용 1", "왼쪽 내용 2"],
    "right": ["오른쪽 내용 1", "오른쪽 내용 2"]
  }
}
\`\`\`

6. **chart** (차트/그래프):
\`\`\`json
{
  "type": "chart",
  "props": {
    "title": "차트 제목",
    "chartType": "bar|line|pie",
    "data": [
      {"label": "항목 1", "value": 30},
      {"label": "항목 2", "value": 50}
    ]
  }
}
\`\`\`

7. **table** (표):
\`\`\`json
{
  "type": "table",
  "props": {
    "title": "표 제목",
    "headers": ["열1", "열2", "열3"],
    "rows": [
      ["데이터1-1", "데이터1-2", "데이터1-3"],
      ["데이터2-1", "데이터2-2", "데이터2-3"]
    ]
  }
}
\`\`\`

8. **stats** (통계/수치 강조):
\`\`\`json
{
  "type": "stats",
  "props": {
    "title": "제목",
    "stats": [
      {"value": "95%", "label": "고객 만족도"},
      {"value": "10M+", "label": "사용자"}
    ]
  }
}
\`\`\`

9. **quote** (인용문):
\`\`\`json
{
  "type": "quote",
  "props": {
    "quote": "인용할 문장",
    "author": "작성자 또는 출처"
  }
}
\`\`\`

10. **comparison** (비교):
\`\`\`json
{
  "type": "comparison",
  "props": {
    "title": "비교 제목",
    "left": {
      "title": "A 방식",
      "items": ["장점 1", "장점 2"]
    },
    "right": {
      "title": "B 방식",
      "items": ["장점 1", "장점 2"]
    }
  }
}
\`\`\`

11. **timeline** (타임라인):
\`\`\`json
{
  "type": "timeline",
  "props": {
    "title": "프로젝트 일정",
    "events": [
      {"date": "2024-01", "title": "킥오프"},
      {"date": "2024-06", "title": "베타 출시"}
    ]
  }
}
\`\`\`

12. **thankYou** (마지막 슬라이드):
\`\`\`json
{
  "type": "thankYou",
  "props": {
    "message": "감사합니다",
    "contact": "contact@example.com (선택사항)"
  },
  "style": {"background": "#3182f6"}
}
\`\`\`

**추가 슬라이드 타입 (선택적 사용):**

13. **featureGrid** (기능 그리드):
\`\`\`json
{
  "type": "featureGrid",
  "props": {
    "title": "주요 기능",
    "features": [
      {"icon": "⚡", "title": "빠른 속도", "description": "설명"},
      {"icon": "🔒", "title": "보안", "description": "설명"}
    ]
  }
}
\`\`\`

14. **teamProfile** (팀 소개):
\`\`\`json
{
  "type": "teamProfile",
  "props": {
    "title": "우리 팀",
    "members": [
      {"name": "홍길동", "role": "CEO", "photo": "url (선택)"},
      {"name": "김철수", "role": "CTO", "photo": "url (선택)"}
    ]
  }
}
\`\`\`

15. **process** (프로세스/단계):
\`\`\`json
{
  "type": "process",
  "props": {
    "title": "작업 프로세스",
    "steps": [
      {"number": "01", "title": "분석", "description": "시장 조사"},
      {"number": "02", "title": "설계", "description": "UI/UX 설계"}
    ]
  }
}
\`\`\`

16. **roadmap** (로드맵):
\`\`\`json
{
  "type": "roadmap",
  "props": {
    "title": "제품 로드맵",
    "milestones": [
      {"quarter": "Q1 2024", "goal": "베타 출시"},
      {"quarter": "Q2 2024", "goal": "정식 출시"}
    ]
  }
}
\`\`\`

17. **pricing** (가격표):
\`\`\`json
{
  "type": "pricing",
  "props": {
    "title": "요금제",
    "plans": [
      {"name": "Free", "price": "0원/월", "features": ["기능 1", "기능 2"]},
      {"name": "Pro", "price": "9,900원/월", "features": ["기능 1", "기능 2", "기능 3"]}
    ]
  }
}
\`\`\`

18. **imageText** (이미지+텍스트):
\`\`\`json
{
  "type": "imageText",
  "props": {
    "title": "제목",
    "image": "https://example.com/image.jpg",
    "text": "이미지 설명"
  }
}
\`\`\`

19. **agenda** (목차/어젠다):
\`\`\`json
{
  "type": "agenda",
  "props": {
    "title": "오늘의 주제",
    "items": ["1. 소개", "2. 본론", "3. 결론"]
  }
}
\`\`\`

20. **testimonial** (고객 후기):
\`\`\`json
{
  "type": "testimonial",
  "props": {
    "quote": "정말 좋은 서비스예요!",
    "author": "고객명",
    "company": "회사명 (선택)",
    "photo": "url (선택)"
  }
}
\`\`\`

21. **gallery** (이미지 갤러리):
\`\`\`json
{
  "type": "gallery",
  "props": {
    "title": "갤러리",
    "images": [
      {"url": "https://example.com/1.jpg", "caption": "설명 1"},
      {"url": "https://example.com/2.jpg", "caption": "설명 2"}
    ]
  }
}
\`\`\`

**TDS 색상 팔레트 (style.background):**
- 메인 블루: #3182f6
- 회색: #f2f4f6, #e5e8eb, #b0b8c1
- 흰색: #ffffff
- 검정: #000000

**중요:**
1. JSON만 출력 (마크다운 코드 블록 없음)
2. 슬라이드 수 ${maxSlides}장 엄수
3. 첨부 파일 정보를 최대한 활용
4. 모든 텍스트는 한글로 작성
5. 구조화된 데이터 제공
`;

  // Gemini Multimodal API Parts 구성
  const parts: any[] = [{ text: prompt }];

  // 첨부 파일을 inlineData 형식으로 추가
  for (const file of attachments) {
    parts.push({
      inlineData: {
        mimeType: file.mimeType,
        data: file.data, // Base64 인코딩된 데이터
      },
    });
  }

  // 재시도 로직
  const maxRetries = 3;
  const retryDelays = [2000, 4000, 8000]; // 2초, 4초, 8초

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 시도 ${attempt + 1}/${maxRetries + 1}`);

      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts,
          },
        ],
      });

      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Gemini API가 빈 응답을 반환했어요');
      }

      console.log(`✅ [Gemini ${modelName} Multimodal] 생성 완료 (${text.length}자)`);

      // 마크다운 코드 블록 제거
      let cleanedText = text.trim();
      if (cleanedText.startsWith('```json')) {
        cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
      } else if (cleanedText.startsWith('```')) {
        cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
      }

      // JSON 유효성 검증
      try {
        const parsed = JSON.parse(cleanedText);
        if (!parsed.slides || !Array.isArray(parsed.slides)) {
          throw new Error('slides 배열이 없어요');
        }

        // 슬라이드 수 제한 (플랜별 엄격한 제한)
        if (parsed.slides.length > maxSlides) {
          console.warn(`⚠️ 슬라이드 ${parsed.slides.length}장 → ${maxSlides}장으로 자동 조정`);
          parsed.slides = parsed.slides.slice(0, maxSlides);
        }

        return JSON.stringify(parsed);
      } catch (parseError) {
        console.error('❌ JSON 파싱 실패:', parseError);
        console.error('응답 내용:', cleanedText.substring(0, 500));
        throw new Error('유효한 JSON이 아니에요. 다시 시도해주세요.');
      }

    } catch (error: any) {
      const isRetryable = error?.status === 503 || error?.message?.includes('503');
      const isLastAttempt = attempt === maxRetries;

      if (!isRetryable || isLastAttempt) {
        console.error(`❌ [Gemini ${modelName} Multimodal] 생성 실패:`, error);
        throw new Error(
          error?.message || '슬라이드를 생성하지 못했어요. 다시 시도해주세요.'
        );
      }

      // 재시도 대기
      const delay = retryDelays[attempt];
      console.log(`⏳ ${delay / 1000}초 후 재시도...`);
      await sleep(delay);
    }
  }

  // 모든 재시도 실패 (이론상 도달 불가능)
  throw new Error('슬라이드 생성에 실패했어요. 잠시 후 다시 시도해주세요.');
}
