/**
 * 자료 조사 관련 타입 정의
 */

// Perplexity 모델 타입
export type PerplexityModel = 'sonar' | 'sonar-reasoning' | 'sonar-deep-research';

// 검색 결과
export interface SearchResult {
  title: string;
  url: string;
  date?: string;
}

// Perplexity API 응답
export interface PerplexityResponse {
  id: string;
  model: string;
  created: number;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    search_context_size?: string;
    citation_tokens?: number;
    num_search_queries?: number;
    reasoning_tokens?: number;
  };
  object: string;
  choices: Array<{
    index: number;
    finish_reason: string;
    message: {
      content: string;
      role: string;
    };
  }>;
  search_results?: SearchResult[];
  videos?: Array<{
    url: string;
    thumbnail_url: string;
  }>;
}

// 자료 조사 결과
export interface ResearchResult {
  content: string;
  sources: SearchResult[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    num_search_queries?: number;
  };
}

// 자료 조사 옵션
export type ResearchMode = 'none' | 'fast' | 'deep';

export const RESEARCH_MODE_CONFIG: Record<ResearchMode, {
  enabled: boolean;
  model: PerplexityModel | null;
  label: string;
  description: string;
  price: number; // 추가 비용 (원)
}> = {
  none: {
    enabled: false,
    model: null,
    label: '조사 안함',
    description: '입력한 내용만으로 생성',
    price: 0,
  },
  fast: {
    enabled: true,
    model: 'sonar',
    label: '빠른 검색',
    description: '웹 검색으로 빠르게 자료 수집',
    price: 0, // 무료
  },
  deep: {
    enabled: true,
    model: 'sonar-reasoning',
    label: '심층 검색',
    description: '논리적 추론과 분석',
    price: 400, // +₩400
  },
};
