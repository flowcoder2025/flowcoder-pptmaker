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

// ==========================================
// 멀티모달 (Multimodal) 관련 타입
// ==========================================

/**
 * 첨부 파일 정보
 */
export interface AttachmentFile {
  /** 파일명 */
  name: string;
  /** MIME 타입 (예: image/jpeg, application/pdf) */
  mimeType: string;
  /** Base64 인코딩된 파일 데이터 */
  data: string;
  /** 파일 크기 (바이트) */
  size: number;
}

/**
 * 멀티모달 생성 요청
 * (텍스트 + PDF/이미지 첨부)
 */
export interface MultimodalRequest {
  /** 사용자 입력 텍스트 */
  topic: string;
  /** 첨부 파일 목록 (PDF, 이미지) */
  attachments: AttachmentFile[];
  /** 자료 조사 모드 */
  researchMode?: ResearchMode;
  /** Gemini 모델 선택 */
  model?: 'flash' | 'pro';
  /** 슬라이드 개수 */
  slideCount?: number;
  /** 화면 비율 */
  aspectRatio?: '16:9' | '4:3' | 'A4-portrait';
  /** 페이지 형식 */
  pageFormat?: 'slides' | 'one-page';
}
