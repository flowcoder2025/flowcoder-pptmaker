/**
 * 프리젠테이션 관련 타입
 */

import type { HTMLSlide, UnifiedPPTJSON } from './slide';

export interface Presentation {
  id: string;
  title: string;
  slides: HTMLSlide[];          // 기존 호환성
  slideData?: UnifiedPPTJSON;   // 편집용 구조화 데이터 (Phase 1)
  templateId?: string;          // 사용된 템플릿 ID (Phase 1)
  createdAt: number;
  updatedAt?: number;           // 마지막 수정 시간 (Phase 1)
}

export type GenerationStep = 'idle' | 'parsing' | 'generating' | 'done' | 'error';
