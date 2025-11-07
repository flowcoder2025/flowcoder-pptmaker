/**
 * 프리젠테이션 관련 타입
 */

import type { HTMLSlide, UnifiedPPTJSON } from './slide';

export interface Presentation {
  id: string;
  title: string;
  description?: string;         // 프리젠테이션 설명
  slides: HTMLSlide[];          // 기존 호환성
  slideData?: UnifiedPPTJSON;   // 편집용 구조화 데이터 (Phase 1)
  templateId?: string;          // 사용된 템플릿 ID (Phase 1)
  metadata?: Record<string, unknown>;  // 추가 메타데이터
  createdAt: number;
  updatedAt?: number;           // 마지막 수정 시간 (Phase 1)
}

export type GenerationStep = 'idle' | 'parsing' | 'generating' | 'done' | 'error';
