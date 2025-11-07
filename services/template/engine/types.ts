/**
 * 템플릿 시스템 타입 정의
 *
 * Phase 1 구현: 클라이언트 템플릿 엔진
 * 목표: Gemini HTML API 호출 0회 → 비용 87% 절감
 */

import type {
  Slide,
  TitleSlide,
  SectionSlide,
  ContentSlide,
  BulletSlide,
  TwoColumnSlide,
  ThankYouSlide,
  ChartSlide,
  TableSlide,
  StatsSlide,
  QuoteSlide,
  ComparisonSlide,
  TimelineSlide,
  FeatureGridSlide,
  TeamProfileSlide,
  ProcessSlide,
  RoadmapSlide,
  PricingSlide,
  ImageTextSlide,
  AgendaSlide,
  TestimonialSlide,
  GallerySlide,
  HTMLSlide,
} from '@/types/slide';

/**
 * 템플릿 컨텍스트: TDS 디자인 시스템 기반 스타일 설정
 */
export interface TemplateContext {
  /** 색상 팔레트 (Toss Design System) */
  colors: {
    /** Primary 색상 (#3182f6) */
    primary: string;
    /** Dark 색상 (#333d4b) */
    dark: string;
    /** 기본 텍스트 색상 (#191f28) */
    text: string;
    /** 보조 텍스트 색상 (#333d4b) */
    textSecondary: string;
    /** Gray 색상 (#d1d6db) */
    gray: string;
    /** 배경 색상 (#f2f4f6) */
    bg: string;
    /** 화이트 (#FFFFFF) */
    white: string;
    /** 밝은 배경 (#f8f9fa) */
    lightBg: string;
    /** 경계선 색상 (#e5e8eb) */
    border: string;
  };

  /** 폰트 설정 */
  fonts: {
    /** 기본 폰트 (Arial) */
    main: string;
    /** 서체 폰트 (Georgia) */
    serif: string;
    /** 크기 설정 */
    size: {
      /** 타이틀 (48px) */
      title: number;
      /** 서브타이틀 (24px) */
      subtitle: number;
      /** 헤딩 (32px) */
      heading: number;
      /** 본문 (18px) */
      body: number;
      /** 인용문 (24px) */
      quote: number;
      /** 통계 숫자 (56px) */
      stats: number;
      /** 섹션 제목 (44px) */
      section: number;
      /** 감사 제목 (56px) */
      thankYou: number;
      /** 캡션 (16px) */
      caption: number;
      /** 작은 텍스트 (14px) */
      small: number;
    };
  };

  /** 여백 설정 */
  spacing: {
    /** 기본 패딩 (60px) */
    padding: number;
    /** Accent Bar 크기 */
    accentBar: {
      width: number;  // 60px
      height: number; // 4px
    };
    /** 요소 간 간격 (40px) */
    gap: number;
    /** 작은 간격 (30px) */
    gapSmall: number;
    /** 리스트 간격 (20px) */
    listGap: number;
    /** 차트 바 간격 (25px) */
    chartGap: number;
    /** 아이콘 크기 (24px) */
    iconSize: number;
    /** 타임라인 노드 크기 (60px) */
    timelineNodeSize: number;
  };

  /** Border Radius */
  borderRadius: {
    /** 작은 (8px) */
    small: number;
    /** 중간 (12px) */
    medium: number;
    /** 큰 (16px) */
    large: number;
    /** 원형 (50%) */
    circle: string;
  };

  /** 슬라이드 크기 */
  slideSize: {
    width: number;  // 1200px
    height: number; // 675px
  };
}

/**
 * 슬라이드 템플릿 인터페이스
 *
 * 각 템플릿은 12개 슬라이드 타입을 렌더링할 수 있어야 함
 */
export interface SlideTemplate {
  /** 템플릿 고유 ID */
  id: string;

  /** 템플릿 이름 */
  name: string;

  /** 템플릿 카테고리 */
  category: 'free' | 'premium';

  /** 프리미엄 템플릿 가격 (원) */
  price?: number;

  /** 템플릿 설명 */
  description?: string;

  /** 템플릿 미리보기 이미지 URL */
  thumbnail?: string;

  /**
   * 12개 슬라이드 타입 렌더러
   * Phase 1에서 모두 구현
   */

  /** 1. Title Slide (제목 슬라이드) */
  renderTitle(slide: TitleSlide): HTMLSlide;

  /** 2. Section Slide (섹션 구분 슬라이드) */
  renderSection(slide: SectionSlide): HTMLSlide;

  /** 3. Content Slide (본문 슬라이드) */
  renderContent(slide: ContentSlide): HTMLSlide;

  /** 4. Bullet Slide (리스트 슬라이드) */
  renderBullet(slide: BulletSlide): HTMLSlide;

  /** 5. Two Column Slide (2단 레이아웃 슬라이드) */
  renderTwoColumn(slide: TwoColumnSlide): HTMLSlide;

  /** 6. Thank You Slide (감사 슬라이드) */
  renderThankYou(slide: ThankYouSlide): HTMLSlide;

  /** 7. Chart Slide (차트 슬라이드) */
  renderChart(slide: ChartSlide): HTMLSlide;

  /** 8. Table Slide (표 슬라이드) */
  renderTable(slide: TableSlide): HTMLSlide;

  /** 9. Stats Slide (통계 슬라이드) */
  renderStats(slide: StatsSlide): HTMLSlide;

  /** 10. Quote Slide (인용 슬라이드) */
  renderQuote(slide: QuoteSlide): HTMLSlide;

  /** 11. Comparison Slide (비교 슬라이드) */
  renderComparison(slide: ComparisonSlide): HTMLSlide;

  /** 12. Timeline Slide (타임라인 슬라이드) */
  renderTimeline(slide: TimelineSlide): HTMLSlide;

  /** 13. Feature Grid Slide (기능 그리드 슬라이드) */
  renderFeatureGrid(slide: FeatureGridSlide): HTMLSlide;

  /** 14. Team Profile Slide (팀 프로필 슬라이드) */
  renderTeamProfile(slide: TeamProfileSlide): HTMLSlide;

  /** 15. Process Slide (프로세스 슬라이드) */
  renderProcess(slide: ProcessSlide): HTMLSlide;

  /** 16. Roadmap Slide (로드맵 슬라이드) */
  renderRoadmap(slide: RoadmapSlide): HTMLSlide;

  /** 17. Pricing Slide (가격표 슬라이드) */
  renderPricing(slide: PricingSlide): HTMLSlide;

  /** 18. Image Text Slide (이미지+텍스트 슬라이드) */
  renderImageText(slide: ImageTextSlide): HTMLSlide;

  /** 19. Agenda Slide (아젠다 슬라이드) */
  renderAgenda(slide: AgendaSlide): HTMLSlide;

  /** 20. Testimonial Slide (추천사 슬라이드) */
  renderTestimonial(slide: TestimonialSlide): HTMLSlide;

  /** 21. Gallery Slide (갤러리 슬라이드) */
  renderGallery(slide: GallerySlide): HTMLSlide;
}

/**
 * 타입 가드 함수들
 */
export function isTitleSlide(slide: Slide): slide is TitleSlide {
  return slide.type === 'title';
}

export function isSectionSlide(slide: Slide): slide is SectionSlide {
  return slide.type === 'section';
}

export function isContentSlide(slide: Slide): slide is ContentSlide {
  return slide.type === 'content';
}

export function isBulletSlide(slide: Slide): slide is BulletSlide {
  return slide.type === 'bullet';
}

export function isTwoColumnSlide(slide: Slide): slide is TwoColumnSlide {
  return slide.type === 'twoColumn';
}

export function isThankYouSlide(slide: Slide): slide is ThankYouSlide {
  return slide.type === 'thankYou';
}

export function isChartSlide(slide: Slide): slide is ChartSlide {
  return slide.type === 'chart';
}

export function isTableSlide(slide: Slide): slide is TableSlide {
  return slide.type === 'table';
}

export function isStatsSlide(slide: Slide): slide is StatsSlide {
  return slide.type === 'stats';
}

export function isQuoteSlide(slide: Slide): slide is QuoteSlide {
  return slide.type === 'quote';
}

export function isComparisonSlide(slide: Slide): slide is ComparisonSlide {
  return slide.type === 'comparison';
}

export function isTimelineSlide(slide: Slide): slide is TimelineSlide {
  return slide.type === 'timeline';
}

export function isFeatureGridSlide(slide: Slide): slide is FeatureGridSlide {
  return slide.type === 'featureGrid';
}

export function isTeamProfileSlide(slide: Slide): slide is TeamProfileSlide {
  return slide.type === 'teamProfile';
}

export function isProcessSlide(slide: Slide): slide is ProcessSlide {
  return slide.type === 'process';
}

export function isRoadmapSlide(slide: Slide): slide is RoadmapSlide {
  return slide.type === 'roadmap';
}

export function isPricingSlide(slide: Slide): slide is PricingSlide {
  return slide.type === 'pricing';
}

export function isImageTextSlide(slide: Slide): slide is ImageTextSlide {
  return slide.type === 'imageText';
}

export function isAgendaSlide(slide: Slide): slide is AgendaSlide {
  return slide.type === 'agenda';
}

export function isTestimonialSlide(slide: Slide): slide is TestimonialSlide {
  return slide.type === 'testimonial';
}

export function isGallerySlide(slide: Slide): slide is GallerySlide {
  return slide.type === 'gallery';
}

/**
 * 기본 TemplateContext 값
 */
export const DEFAULT_TEMPLATE_CONTEXT: TemplateContext = {
  colors: {
    primary: '#3182f6',
    dark: '#333d4b',
    text: '#191f28',
    textSecondary: '#333d4b',
    gray: '#d1d6db',
    bg: '#f2f4f6',
    white: '#FFFFFF',
    lightBg: '#f8f9fa',
    border: '#e5e8eb',
  },
  fonts: {
    main: 'Arial',
    serif: 'Georgia, serif',
    size: {
      title: 48,
      subtitle: 24,
      heading: 32,
      body: 18,
      quote: 24,
      stats: 56,
      section: 44,
      thankYou: 56,
      caption: 16,
      small: 14,
    },
  },
  spacing: {
    padding: 60,
    accentBar: {
      width: 60,
      height: 4,
    },
    gap: 40,
    gapSmall: 20,
    listGap: 20,
    chartGap: 25,
    iconSize: 24,
    timelineNodeSize: 60,
  },
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    circle: '50%',
  },
  slideSize: {
    width: 1200,
    height: 675,
  },
};
