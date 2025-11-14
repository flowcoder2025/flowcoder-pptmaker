/**
 * 프리젠테이션 관련 타입
 */

import type { HTMLSlide, UnifiedPPTJSON } from './slide';

/**
 * 슬라이드 화면 비율
 */
export type AspectRatio = '16:9' | '4:3' | 'A4-portrait';

/**
 * 페이지 형식
 * - slides: 여러 슬라이드로 구성
 * - one-page: 하나의 긴 페이지로 구성 (스크롤 가능)
 */
export type PageFormat = 'slides' | 'one-page';

export interface Presentation {
  id: string;
  title: string;
  description?: string;         // 프리젠테이션 설명
  slides: HTMLSlide[];          // 기존 호환성
  slideData?: UnifiedPPTJSON;   // 편집용 구조화 데이터 (Phase 1)
  templateId?: string;          // 사용된 템플릿 ID (Phase 1)
  aspectRatio?: AspectRatio;    // 화면 비율 (기본값: '16:9')
  pageFormat?: PageFormat;      // 페이지 형식 (기본값: 'slides')
  metadata?: Record<string, unknown>;  // 추가 메타데이터
  createdAt: number;
  updatedAt?: number;           // 마지막 수정 시간 (Phase 1)
}

export type GenerationStep = 'idle' | 'parsing' | 'generating' | 'done' | 'error';
