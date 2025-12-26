/**
 * Perplexity API 설정
 */

import { logger } from '@/lib/logger';

const API_KEY = process.env.NEXT_PUBLIC_PERPLEXITY_API_KEY || '';

if (!API_KEY) {
  logger.warn('Perplexity API 키가 설정되지 않았어요', { envVar: 'NEXT_PUBLIC_PERPLEXITY_API_KEY' });
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
