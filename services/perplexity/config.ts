/**
 * Perplexity API 설정
 */

const API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';

if (!API_KEY) {
  console.warn('⚠️ NEXT_PUBLIC_PERPLEXITY_API_KEY가 설정되지 않았습니다. .env.local 파일을 확인하세요.');
}

export const PERPLEXITY_CONFIG = {
  apiKey: API_KEY,
  baseURL: 'https://api.perplexity.ai',
  models: {
    sonar: 'sonar', // 빠른 검색
    sonarReasoning: 'sonar-reasoning', // 추론 조사
    sonarDeepResearch: 'sonar-deep-research', // 깊은 조사
  },
} as const;
