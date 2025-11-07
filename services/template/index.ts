/**
 * Template System Export Module
 *
 * 템플릿 시스템의 모든 클래스와 타입을 export
 */

// Core Classes
export { TemplateEngine } from './engine/TemplateEngine';
export { TemplateRegistry } from './engine/TemplateRegistry';

// Base Templates
export { TossDefaultTemplate } from './base/toss-default/TossDefaultTemplate';

// Types
export type {
  TemplateContext,
  SlideTemplate,
} from './engine/types';

export { DEFAULT_TEMPLATE_CONTEXT } from './engine/types';

// Type Guards (re-export from types)
export {
  isTitleSlide,
  isSectionSlide,
  isContentSlide,
  isBulletSlide,
  isTwoColumnSlide,
  isThankYouSlide,
  isChartSlide,
  isTableSlide,
  isStatsSlide,
  isQuoteSlide,
  isComparisonSlide,
  isTimelineSlide,
} from './engine/types';
