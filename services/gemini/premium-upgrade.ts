/**
 * 프리미엄 업그레이드 서비스
 * 기존 슬라이드 HTML을 Gemini 3.0 Flash로 고품질 개선
 *
 * 주요 개선 사항:
 * 1. CSS 스타일 정교화 (그림자, 그라데이션, 타이포그래피)
 * 2. 이미지 레이아웃 최적화 (배치, 크기, 정렬)
 * 3. 전문적인 디자인 요소 추가
 */

import { gemini3Flash, GEMINI_CONFIG } from './config';
import { logger } from '@/lib/logger';

/**
 * Base64 이미지 추출 결과
 */
interface ExtractedImages {
  /** Base64 이미지가 플레이스홀더로 교체된 HTML */
  sanitizedHtml: string;
  /** 플레이스홀더 → Base64 이미지 매핑 */
  imageMap: Map<string, string>;
}

/**
 * HTML에서 Base64 이미지를 추출하고 플레이스홀더로 교체
 * 토큰 한도 초과 방지를 위해 API 호출 전에 사용
 */
function extractBase64Images(html: string): ExtractedImages {
  const imageMap = new Map<string, string>();
  let imageIndex = 0;

  // data:image/... Base64 패턴 매칭
  // src="data:image/..." 또는 url(data:image/...) 형태 처리
  const base64Pattern = /(data:image\/[^"'\s)]+)/g;

  const sanitizedHtml = html.replace(base64Pattern, (match) => {
    // 작은 이미지는 그대로 유지 (10KB 미만)
    if (match.length < 10000) {
      return match;
    }

    const placeholder = `__IMAGE_PLACEHOLDER_${imageIndex}__`;
    imageMap.set(placeholder, match);
    imageIndex++;
    return placeholder;
  });

  if (imageMap.size > 0) {
    logger.debug('Base64 이미지 추출 (토큰 절약)', { count: imageMap.size });
  }

  return { sanitizedHtml, imageMap };
}

/**
 * 플레이스홀더를 원본 Base64 이미지로 복원
 */
function restoreBase64Images(html: string, imageMap: Map<string, string>): string {
  let restoredHtml = html;

  for (const [placeholder, base64Data] of imageMap) {
    restoredHtml = restoredHtml.replace(placeholder, base64Data);
  }

  if (imageMap.size > 0) {
    logger.debug('Base64 이미지 복원 완료', { count: imageMap.size });
  }

  return restoredHtml;
}

export interface PremiumUpgradeOptions {
  slideHtml: string;
  slideIndex: number;
  totalSlides: number;
}

export interface PremiumUpgradeResult {
  upgradedHtml: string;
  tokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  estimatedCost: {
    inputCost: number;  // 원화
    outputCost: number; // 원화
    totalCost: number;  // 원화
  };
}

/**
 * 단일 슬라이드를 프리미엄 품질로 업그레이드
 */
export async function upgradeSingleSlide(
  options: PremiumUpgradeOptions
): Promise<PremiumUpgradeResult> {
  const { slideHtml, slideIndex, totalSlides } = options;

  logger.info('프리미엄 업그레이드 시작', { slideIndex: slideIndex + 1, totalSlides });

  // Base64 이미지 추출 (토큰 한도 초과 방지)
  const { sanitizedHtml, imageMap } = extractBase64Images(slideHtml);

  const prompt = `당신은 프리젠테이션 디자인 전문가입니다. 주어진 HTML 슬라이드를 프리미엄 품질로 개선해주세요.

## 🚨 최우선 규칙: 오버플로우 방지 (필수)

슬라이드는 **16:9 비율의 고정 영역** 안에 표시됩니다. 콘텐츠가 이 영역을 **절대 넘어가면 안 됩니다**.

### 필수 적용 사항:
1. **루트 컨테이너**: 반드시 \`height: 100%\` 사용 (❌ \`min-height: 100%\` 금지)
2. **overflow: hidden**: 모든 슬라이드 루트에 적용
3. **상대 단위 우선**: padding/margin은 \`vh\`, \`vw\`, \`%\` 사용
4. **폰트 크기 적응형**: \`clamp(min, preferred, max)\` 사용
   - 제목: \`clamp(1.5rem, 4vw, 2.5rem)\`
   - 본문: \`clamp(0.875rem, 1.5vw, 1.125rem)\`
   - 소제목: \`clamp(1rem, 2vw, 1.5rem)\`

### 콘텐츠 양에 따른 조정:
- **리스트 4개 이상**: gap을 \`0.75rem\` 이하로, padding을 \`1rem\` 이하로 줄이기
- **텍스트 많은 경우**: 폰트 크기를 clamp 최소값 쪽으로 조정
- **긴 텍스트**: \`-webkit-line-clamp\`로 최대 줄 수 제한 고려

## 개선 목표

### 1. CSS 스타일 정교화
- 섬세한 박스 그림자 (box-shadow) 추가
- 부드러운 그라데이션 배경 적용
- 전문적인 타이포그래피 (letter-spacing: -0.02em, line-height: 1.4~1.6)
- **컴팩트한** padding/margin (4vh, 5vw 등 상대 단위)
- 부드러운 border-radius (12px~20px)

### 2. 이미지 레이아웃 최적화
- 이미지에 \`max-height: 100%\`, \`object-fit: cover\` 적용
- 이미지에 미묘한 그림자 추가
- 이미지와 텍스트 간 적절한 간격 (2vh~3vh)

### 3. 전문적인 디자인 요소
- 구분선이나 장식적 요소 추가 (과하지 않게)
- 색상 대비 최적화로 가독성 향상
- 일관된 디자인 언어 적용

## 중요 규칙

- 기존 콘텐츠(텍스트, 이미지 URL)는 **절대 변경하지 마세요**
- HTML 구조는 최대한 유지하되, 필요시 wrapper div 추가 가능
- 인라인 스타일만 사용 (외부 CSS 참조 없음)
- 기존 슬라이드의 레이아웃 의도를 존중

## 입력 HTML
\`\`\`html
${sanitizedHtml}
\`\`\`

**참고**: 이미지 플레이스홀더(__IMAGE_PLACEHOLDER_N__)가 있다면 그대로 유지하세요.

## 출력 형식
- 개선된 HTML만 출력 (마크다운 코드 블록 없이 순수 HTML만)
- <!DOCTYPE html>, <html>, <head>, <body> 태그 포함하지 않음
- 슬라이드 콘텐츠 div만 반환`;

  try {
    const result = await gemini3Flash.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: GEMINI_CONFIG.flash3.temperature,
        maxOutputTokens: GEMINI_CONFIG.flash3.maxOutputTokens,
      },
    });

    let upgradedHtml = result.response.text();

    // Base64 이미지 복원
    upgradedHtml = restoreBase64Images(upgradedHtml, imageMap);

    // 토큰 사용량 추출
    const usage = result.response.usageMetadata;
    const inputTokens = usage?.promptTokenCount || 0;
    const outputTokens = usage?.candidatesTokenCount || 0;
    const totalTokens = usage?.totalTokenCount || 0;

    // Gemini 3.0 Flash 비용 계산 (2024-12 기준)
    // Standard: $0.50/1M input, $3.00/1M output
    // 환율: 1400원/$
    const inputCostPerMillion = 0.50 * 1400; // 700원/1M tokens
    const outputCostPerMillion = 3.00 * 1400; // 4200원/1M tokens

    const inputCost = (inputTokens / 1000000) * inputCostPerMillion;
    const outputCost = (outputTokens / 1000000) * outputCostPerMillion;
    const totalCost = inputCost + outputCost;

    logger.info('프리미엄 업그레이드 완료', {
      slideIndex: slideIndex + 1,
      totalSlides,
      tokens: { input: inputTokens, output: outputTokens, total: totalTokens },
      cost: { input: inputCost.toFixed(2), output: outputCost.toFixed(2), total: totalCost.toFixed(2) },
    });

    return {
      upgradedHtml: cleanHtmlOutput(upgradedHtml),
      tokenUsage: {
        inputTokens,
        outputTokens,
        totalTokens,
      },
      estimatedCost: {
        inputCost,
        outputCost,
        totalCost,
      },
    };
  } catch (error) {
    logger.error('프리미엄 업그레이드 실패', { slideIndex: slideIndex + 1, error });
    throw error;
  }
}

/**
 * 여러 슬라이드를 순차적으로 프리미엄 업그레이드
 */
export async function upgradeAllSlides(
  slides: string[]
): Promise<{
  upgradedSlides: string[];
  totalTokenUsage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
  };
  totalEstimatedCost: number;
}> {
  logger.info('전체 슬라이드 프리미엄 업그레이드 시작', { totalSlides: slides.length });

  const upgradedSlides: string[] = [];
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let totalTokens = 0;
  let totalCost = 0;

  for (let i = 0; i < slides.length; i++) {
    const result = await upgradeSingleSlide({
      slideHtml: slides[i],
      slideIndex: i,
      totalSlides: slides.length,
    });

    upgradedSlides.push(result.upgradedHtml);
    totalInputTokens += result.tokenUsage.inputTokens;
    totalOutputTokens += result.tokenUsage.outputTokens;
    totalTokens += result.tokenUsage.totalTokens;
    totalCost += result.estimatedCost.totalCost;
  }

  logger.info('전체 슬라이드 프리미엄 업그레이드 완료', {
    tokens: { input: totalInputTokens, output: totalOutputTokens, total: totalTokens },
    totalCost: totalCost.toFixed(2),
  });

  return {
    upgradedSlides,
    totalTokenUsage: {
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      totalTokens,
    },
    totalEstimatedCost: totalCost,
  };
}

/**
 * HTML 출력 정리 (마크다운 코드 블록 제거 등)
 */
function cleanHtmlOutput(html: string): string {
  let cleaned = html.trim();

  // 마크다운 코드 블록 제거
  if (cleaned.startsWith('```html')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }

  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }

  return cleaned.trim();
}
