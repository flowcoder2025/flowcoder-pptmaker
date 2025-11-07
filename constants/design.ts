/**
 * 앱인토스 디자인 시스템 상수
 * TDS Mobile 및 토스 브랜드 색상
 */

import { colors } from '@toss/tds-colors';

// 색상 프리셋 타입
export interface ColorPreset {
  id: string;
  name: string;
  description: string;
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  muted: string;
  error: string;
  success: string;
  warning: string;
  info: string;
}

// 기본 색상 (TDS Mobile 색상 토큰 기반)
export const TOSS_COLORS = {
  // 토스 브랜드 색상 (TDS colors 사용)
  primary: colors.blue500,      // 토스 블루
  secondary: colors.grey800,    // 토스 그레이

  // 배경 색상 (TDS semantic colors)
  background: colors.background,
  surface: colors.greyBackground,

  // 텍스트 색상 (TDS grey scale)
  text: colors.grey900,
  textSecondary: colors.grey600,
  muted: colors.grey300,

  // 상태 색상 (TDS state colors)
  error: colors.red500,
  success: colors.green500,
  warning: colors.yellow500,
  info: colors.blue500,
} as const;

// 색상 프리셋 컬렉션 (TDS colors 기반)
export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'toss',
    name: '토스 (Toss)',
    description: '토스 브랜드 색상 - TDS 블루 & 그레이',
    primary: colors.blue500,
    secondary: colors.grey800,
    background: colors.background,
    surface: colors.greyBackground,
    text: colors.grey900,
    textSecondary: colors.grey600,
    muted: colors.grey300,
    error: colors.red500,
    success: colors.green500,
    warning: colors.yellow500,
    info: colors.blue500,
  },
  {
    id: 'teal-navy',
    name: '틸 네이비',
    description: '세련된 틸(청록색)과 차분한 네이비',
    primary: colors.teal300,
    secondary: colors.blue900,
    background: colors.background,
    surface: colors.greyBackground,
    text: colors.grey900,
    textSecondary: colors.grey600,
    muted: colors.grey300,
    error: colors.red500,
    success: colors.green500,
    warning: colors.yellow500,
    info: colors.teal300,
  },
  {
    id: 'professional-blue',
    name: '프로페셔널 블루',
    description: '비즈니스에 적합한 신뢰감 있는 블루',
    primary: colors.blue600,
    secondary: colors.blue900,
    background: colors.background,
    surface: colors.blue50,
    text: colors.grey900,
    textSecondary: colors.grey700,
    muted: colors.grey400,
    error: colors.red600,
    success: colors.green600,
    warning: colors.orange600,
    info: colors.blue600,
  },
  {
    id: 'modern-purple',
    name: '모던 퍼플',
    description: '창의적이고 트렌디한 퍼플 톤',
    primary: colors.purple500,
    secondary: colors.purple900,
    background: colors.background,
    surface: colors.purple50,
    text: colors.grey900,
    textSecondary: colors.purple700,
    muted: colors.purple200,
    error: colors.red600,
    success: colors.green600,
    warning: colors.orange600,
    info: colors.purple600,
  },
  {
    id: 'warm-orange',
    name: '웜 오렌지',
    description: '따뜻하고 친근한 오렌지와 브라운',
    primary: colors.orange600,
    secondary: colors.orange900,
    background: colors.background,
    surface: colors.orange50,
    text: colors.grey900,
    textSecondary: colors.grey700,
    muted: colors.orange200,
    error: colors.red700,
    success: colors.green700,
    warning: colors.orange700,
    info: colors.orange600,
  },
  {
    id: 'fresh-green',
    name: '프레시 그린',
    description: '생동감 넘치는 그린과 블랙',
    primary: colors.green500,
    secondary: colors.green900,
    background: colors.background,
    surface: colors.green50,
    text: colors.grey900,
    textSecondary: colors.grey700,
    muted: colors.green200,
    error: colors.red600,
    success: colors.green600,
    warning: colors.yellow600,
    info: colors.green500,
  },
  {
    id: 'elegant-pink',
    name: '엘레강트 핑크',
    description: '세련되고 우아한 핑크와 그레이',
    primary: colors.red400,
    secondary: colors.red900,
    background: colors.background,
    surface: colors.red50,
    text: colors.grey900,
    textSecondary: colors.grey700,
    muted: colors.red200,
    error: colors.red700,
    success: colors.green600,
    warning: colors.orange600,
    info: colors.red400,
  },
];

// unified-ppt 슬라이드 타입별 기본 스타일
export const SLIDE_STYLES = {
  title: {
    background: TOSS_COLORS.primary,
    title: {
      color: '#FFFFFF',
      fontSize: 48,
      fontFamily: 'Arial',
      align: 'center' as const,
      bold: true,
    },
    subtitle: {
      color: '#E5E7EB',
      fontSize: 24,
      align: 'center' as const,
    },
  },
  section: {
    background: TOSS_COLORS.secondary,
    title: {
      color: '#FFFFFF',
      fontSize: 44,
      fontFamily: 'Arial',
      align: 'center' as const,
      bold: true,
    },
  },
  content: {
    background: TOSS_COLORS.background,
    accentBar: {
      color: TOSS_COLORS.primary,
    },
    title: {
      color: TOSS_COLORS.text,
      fontSize: 32,
      fontFamily: 'Arial',
      bold: true,
    },
    body: {
      color: TOSS_COLORS.text,
      fontSize: 18,
      fontFamily: 'Arial',
    },
  },
  bullet: {
    background: TOSS_COLORS.background,
    accentBar: {
      color: TOSS_COLORS.primary,
    },
    title: {
      color: TOSS_COLORS.text,
      fontSize: 32,
      fontFamily: 'Arial',
      bold: true,
    },
    bullets: {
      primaryColor: TOSS_COLORS.primary,
      secondaryColor: TOSS_COLORS.secondary,
      mutedColor: TOSS_COLORS.muted,
      fontSize: 18,
      fontFamily: 'Arial',
      lineHeight: 1.5,
      iconType: 'arrow' as const,
    },
  },
  twoColumn: {
    background: TOSS_COLORS.surface,
    title: {
      color: TOSS_COLORS.text,
      fontSize: 32,
      fontFamily: 'Arial',
      bold: true,
    },
    leftColumn: {
      backgroundColor: TOSS_COLORS.background,
      textColor: TOSS_COLORS.text,
      fontSize: 18,
    },
    rightColumn: {
      backgroundColor: TOSS_COLORS.background,
      textColor: TOSS_COLORS.text,
      fontSize: 18,
    },
  },
  thankYou: {
    background: TOSS_COLORS.surface,
    message: {
      color: TOSS_COLORS.primary,
      fontSize: 44,
      fontFamily: 'Arial',
      align: 'center' as const,
      bold: true,
    },
    contact: {
      color: TOSS_COLORS.muted,
      fontSize: 20,
      fontFamily: 'Arial',
      align: 'center' as const,
    },
  },
} as const;

// 슬라이드 크기 (16:9 비율)
export const SLIDE_DIMENSIONS = {
  width: 1600,
  height: 900,
  aspectRatio: '16:9',
} as const;

// 템플릿 예시
export const TEMPLATE_EXAMPLES = [
  {
    id: 'company-intro',
    title: '회사 소개',
    description: '회사 소개 프리젠테이션을 생성합니다',
    example: `우리 회사 소개 프리젠테이션을 만들어주세요.

제목: 혁신적인 핀테크 기업, ABC 컴퍼니

회사 미션:
- 금융 서비스의 디지털 혁신
- 모두를 위한 쉬운 금융

주요 서비스:
1. 간편 송금 서비스
2. 자산 관리 플랫폼
3. 신용 관리 솔루션

회사 실적:
- 사용자 수: 1,000만 명
- 거래액: 10조 원
- 직원 수: 500명

감사합니다.`,
  },
  {
    id: 'product-intro',
    title: '제품 소개',
    description: '제품 소개 프리젠테이션을 생성합니다',
    example: `새로운 제품 출시 발표 프리젠테이션을 만들어주세요.

제목: 혁신적인 AI 비서, SmartHelper 출시

제품 개요:
SmartHelper는 일상생활을 더 스마트하게 만들어주는 AI 비서입니다.

주요 기능:
1. 음성 명령 인식
2. 일정 자동 관리
3. 개인 맞춤 추천

경쟁 우위:
- 기존 제품 대비 2배 빠른 응답 속도
- 한국어 자연어 처리 최적화
- 개인정보 보호 강화

출시 일정:
2025년 1월 15일 정식 출시

감사합니다.`,
  },
] as const;
