/**
 * unified-ppt 스킬 호환 슬라이드 타입 정의
 */

export type SlideType =
  | 'title'
  | 'section'
  | 'content'
  | 'bullet'
  | 'twoColumn'
  | 'image'
  | 'chart'
  | 'table'
  | 'stats'
  | 'quote'
  | 'comparison'
  | 'timeline'
  | 'thankYou'
  | 'featureGrid'
  | 'teamProfile'
  | 'process'
  | 'roadmap'
  | 'pricing'
  | 'imageText'
  | 'agenda'
  | 'testimonial'
  | 'gallery';

// 기본 슬라이드 인터페이스
export interface BaseSlide {
  id?: string;
  type: SlideType;
  props: Record<string, unknown>;
  style: SlideStyle;
}

// 슬라이드 스타일 (unified-ppt 규격)
export interface SlideStyle {
  background?: string;
  title?: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    align?: 'left' | 'center' | 'right';
    bold?: boolean;
  };
  subtitle?: {
    color?: string;
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
  };
  body?: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
    textColor?: string;
  };
  accentBar?: {
    color?: string;
  };
  bullets?: {
    primaryColor?: string;
    secondaryColor?: string;
    mutedColor?: string;
    fontSize?: number;
    fontFamily?: string;
    lineHeight?: number;
    iconType?: 'arrow' | 'dot' | 'check';
  };
  leftColumn?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
  };
  rightColumn?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
  };
  caption?: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    align?: 'left' | 'center' | 'right';
    italic?: boolean;
  };
  chartColors?: string[];
  gridColor?: string;
  gridStyle?: 'solid' | 'dash';
  showLegend?: boolean;
  showAxisLines?: boolean;
  header?: {
    backgroundColor?: string;
    textColor?: string;
    fontSize?: number;
    bold?: boolean;
  };
  border?: {
    color?: string;
    width?: number;
  };
  rowHeight?: number;
  quote?: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    italic?: boolean;
    align?: 'left' | 'center' | 'right';
  };
  author?: {
    color?: string;
    fontSize?: number;
    align?: 'left' | 'center' | 'right';
  };
  dividerColor?: string;
  node?: {
    fillColor?: string;
    borderColor?: string;
    borderWidth?: number;
  };
  itemTitle?: {
    color?: string;
    fontSize?: number;
    bold?: boolean;
  };
  itemDescription?: {
    color?: string;
    fontSize?: number;
  };
  message?: {
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    bold?: boolean;
  };
  contact?: {
    color?: string;
    fontSize?: number;
  };
  [key: string]: unknown;
}

// Title Slide
export interface TitleSlide extends BaseSlide {
  type: 'title';
  props: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
  };
}

// Section Slide
export interface SectionSlide extends BaseSlide {
  type: 'section';
  props: {
    title: string;
    number?: number;
  };
}

// Content Slide
export interface ContentSlide extends BaseSlide {
  type: 'content';
  props: {
    title: string;
    body: string | string[];
  };
}

// Bullet Slide
export interface BulletItem {
  text: string;
  level: 0 | 1 | 2;
}

export interface BulletSlide extends BaseSlide {
  type: 'bullet';
  props: {
    title: string;
    bullets: BulletItem[];
  };
}

// Two Column Slide
export interface TwoColumnSlide extends BaseSlide {
  type: 'twoColumn';
  props: {
    title: string;
    leftContent: string;
    rightContent: string;
  };
}

// Thank You Slide
export interface ThankYouSlide extends BaseSlide {
  type: 'thankYou';
  props: {
    message: string;
    contact?: string;
  };
}

// Image Slide
export interface ImageSlide extends BaseSlide {
  type: 'image';
  props: {
    title: string;
    arrangement: 'full' | 'sideBySide' | 'grid' | 'imageLeft';
    image?: string;
    images?: string[];
    caption?: string;
    text?: string;
  };
}

// Chart Slide
export interface ChartSlide extends BaseSlide {
  type: 'chart';
  props: {
    title: string;
    chartType: 'bar' | 'line' | 'pie' | 'area';
    data: Array<{
      name: string;
      labels: string[];
      values: number[];
    }>;
  };
}

// Table Slide
export interface TableSlide extends BaseSlide {
  type: 'table';
  props: {
    title: string;
    headers: string[];
    rows: string[][];
    columnWidths?: number[];
  };
}

// Stats Slide
export interface StatsSlide extends BaseSlide {
  type: 'stats';
  props: {
    title: string;
    stats: Array<{
      value: string;
      label: string;
    }>;
    citation?: string; // 출처 표시 (선택사항)
  };
}

// Quote Slide
export interface QuoteSlide extends BaseSlide {
  type: 'quote';
  props: {
    quote: string;
    author: string;
    showQuoteMark?: boolean;
  };
}

// Comparison Slide
export interface ComparisonSlide extends BaseSlide {
  type: 'comparison';
  props: {
    title: string;
    leftLabel?: string;
    rightLabel?: string;
    leftContent?: string;
    rightContent?: string;
    leftImage?: string;
    rightImage?: string;
  };
}

// Timeline Slide
export interface TimelineSlide extends BaseSlide {
  type: 'timeline';
  props: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
}

// Feature Grid Slide (3열 기능 카드 그리드)
export interface FeatureGridSlide extends BaseSlide {
  type: 'featureGrid';
  props: {
    title: string;
    features: Array<{
      iconType?: 'emoji' | 'image'; // 아이콘 타입 (기본값: emoji)
      icon: string; // 이모지 문자열 또는 base64 이미지
      title: string;
      description: string;
    }>;
  };
}

// Team Profile Slide (팀원 프로필)
export interface TeamProfileSlide extends BaseSlide {
  type: 'teamProfile';
  props: {
    title: string;
    profiles: Array<{
      name: string;
      role: string;
      bio: string;
      image?: string;
    }>;
  };
}

// Process Slide (세로 프로세스 플로우)
export interface ProcessSlide extends BaseSlide {
  type: 'process';
  props: {
    title: string;
    steps: Array<{
      title: string;
      description: string;
    }>;
  };
}

// Roadmap Slide (타임라인 로드맵)
export interface RoadmapSlide extends BaseSlide {
  type: 'roadmap';
  props: {
    title: string;
    items: Array<{
      period: string;
      status: string;
      title: string;
      description: string;
    }>;
  };
}

// Pricing Slide (가격표)
export interface PricingSlide extends BaseSlide {
  type: 'pricing';
  props: {
    title: string;
    tiers: Array<{
      name: string;
      price: string;
      period: string;
      description: string;
      features: string[];
      recommended?: boolean;
    }>;
  };
}

// Image Text Slide (이미지+텍스트 레이아웃)
export interface ImageTextSlide extends BaseSlide {
  type: 'imageText';
  props: {
    title: string;
    image: string;
    imagePosition: 'left' | 'right';
    bullets: string[];
  };
}

// Agenda Slide (아젠다 목록)
export interface AgendaSlide extends BaseSlide {
  type: 'agenda';
  props: {
    title: string;
    items: Array<{
      title: string;
      description: string;
    }>;
  };
}

// Testimonial Slide (추천사)
export interface TestimonialSlide extends BaseSlide {
  type: 'testimonial';
  props: {
    title: string;
    quote: string;
    author: string;
    role: string;
    image?: string;
  };
}

// Gallery Slide (이미지 갤러리 2x2)
export interface GallerySlide extends BaseSlide {
  type: 'gallery';
  props: {
    title: string;
    images: Array<{
      url: string;
      caption: string;
    }>;
  };
}

// Slide Union Type
export type Slide =
  | TitleSlide
  | SectionSlide
  | ContentSlide
  | BulletSlide
  | TwoColumnSlide
  | ThankYouSlide
  | ImageSlide
  | ChartSlide
  | TableSlide
  | StatsSlide
  | QuoteSlide
  | ComparisonSlide
  | TimelineSlide
  | FeatureGridSlide
  | TeamProfileSlide
  | ProcessSlide
  | RoadmapSlide
  | PricingSlide
  | ImageTextSlide
  | AgendaSlide
  | TestimonialSlide
  | GallerySlide;

// unified-ppt JSON 규격
export interface UnifiedPPTJSON {
  title?: string;
  slides: Slide[];
}

// HTML 슬라이드 (Gemini Pro 생성 결과)
export interface HTMLSlide {
  html: string;
  css: string;
}

// Gemini Flash 파싱 결과
export interface ParsedSlide {
  type: SlideType;
  content: string | string[] | Record<string, unknown>;
}

export interface ParsedSlides {
  slides: ParsedSlide[];
}

// Presentation 타입 (Task 6: 확장 완료)
export interface Presentation {
  id: string;
  title: string;
  slides: HTMLSlide[];          // 기존 호환성
  slideData?: UnifiedPPTJSON;   // 편집용 구조화 데이터 (NEW - Task 6)
  templateId?: string;          // 사용된 템플릿 ID (NEW - Task 6)
  createdAt: number;
  updatedAt?: number;           // 마지막 수정 시간 (NEW - Task 6)
}

/**
 * 전역 슬라이드 설정
 *
 * 모든 슬라이드에 일괄 적용할 수 있는 공통 스타일 설정
 */
export interface GlobalSlideSettings {
  /** 본문 텍스트 크기 (12-32px, 기본값: 18) */
  fontSize: number;
  /** 불릿 아이콘 타입 (기본값: 'arrow') */
  iconType: 'arrow' | 'dot' | 'check';
}
