/**
 * Gemini API 관련 타입
 */

import type { HTMLSlide } from './slide';

export interface GenerateResponse {
  slides: HTMLSlide[];
}
