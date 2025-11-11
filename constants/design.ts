/**
 * 디자인 시스템 상수
 *
 * ⚠️ 이 파일은 독립 서비스와 앱인토스 모두에서 사용됩니다.
 * 플랫폼 독립적으로 작성해주세요.
 *
 * @description
 * Tailwind CSS 4 기반 디자인 토큰을 사용합니다.
 * 모든 색상은 HSL 형식으로 정의되어 있으며,
 * app/globals.css에 정의된 CSS 변수와 일치합니다.
 */

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

/**
 * 기본 색상 (Tailwind CSS 4 기반)
 *
 * app/globals.css의 @theme 섹션과 일치합니다.
 */
export const TOSS_COLORS = {
  // 토스 브랜드 색상
  primary: 'hsl(217 91% 60%)',      // Toss Blue #3182F6
  secondary: 'hsl(210 40% 96.1%)',  // #F2F4F6

  // 배경 색상
  background: 'hsl(0 0% 100%)',     // #FFFFFF (화이트)
  surface: 'hsl(210 40% 96.1%)',    // #F2F4F6 (연한 그레이)

  // 텍스트 색상
  text: 'hsl(222.2 84% 4.9%)',          // #191F28 (진한 그레이)
  textSecondary: 'hsl(215.4 16.3% 46.9%)', // #8B95A1 (중간 그레이)
  muted: 'hsl(214.3 31.8% 91.4%)',      // #D1D6DB (연한 그레이)

  // 상태 색상
  error: 'hsl(0 84.2% 60.2%)',      // #F04452 (빨강)
  success: 'hsl(142.1 76.2% 36.3%)', // #03B26C (녹색)
  warning: 'hsl(37.7 92.1% 50.2%)',  // #FE9800 (주황)
  info: 'hsl(217 91% 60%)',         // #3182F6 (토스 블루)
} as const;

/**
 * 색상 프리셋 컬렉션 (HSL 기반)
 *
 * 슬라이드 템플릿에서 선택할 수 있는 다양한 색상 테마입니다.
 */
export const COLOR_PRESETS: ColorPreset[] = [
  {
    id: 'toss',
    name: '토스 (Toss)',
    description: '토스 브랜드 색상 - 블루 & 그레이',
    primary: 'hsl(217 91% 60%)',      // Toss Blue #3182F6
    secondary: 'hsl(220 13% 20%)',    // Dark Grey #2F3438
    background: 'hsl(0 0% 100%)',     // White #FFFFFF
    surface: 'hsl(210 40% 96.1%)',    // Light Grey #F2F4F6
    text: 'hsl(222.2 84% 4.9%)',      // Text Dark #191F28
    textSecondary: 'hsl(215.4 16.3% 46.9%)', // Text Secondary #8B95A1
    muted: 'hsl(214.3 31.8% 91.4%)',  // Muted #D1D6DB
    error: 'hsl(0 84.2% 60.2%)',      // Red #F04452
    success: 'hsl(142.1 76.2% 36.3%)', // Green #03B26C
    warning: 'hsl(37.7 92.1% 50.2%)', // Orange #FE9800
    info: 'hsl(217 91% 60%)',         // Blue #3182F6
  },
  {
    id: 'teal-navy',
    name: '틸 네이비',
    description: '세련된 틸(청록색)과 차분한 네이비',
    primary: 'hsl(175 60% 51%)',      // Teal #4DBEAA
    secondary: 'hsl(215 25% 27%)',    // Navy #3A4E5A
    background: 'hsl(0 0% 100%)',     // White
    surface: 'hsl(210 40% 96.1%)',    // Light Grey
    text: 'hsl(222.2 84% 4.9%)',      // Text Dark
    textSecondary: 'hsl(215.4 16.3% 46.9%)', // Text Secondary
    muted: 'hsl(214.3 31.8% 91.4%)',  // Muted
    error: 'hsl(0 84.2% 60.2%)',      // Red
    success: 'hsl(142.1 76.2% 36.3%)', // Green
    warning: 'hsl(37.7 92.1% 50.2%)', // Orange
    info: 'hsl(175 60% 51%)',         // Teal
  },
  {
    id: 'professional-blue',
    name: '프로페셔널 블루',
    description: '비즈니스에 적합한 신뢰감 있는 블루',
    primary: 'hsl(213 90% 51%)',      // Professional Blue #1465E0
    secondary: 'hsl(213 45% 20%)',    // Dark Blue #1C3556
    background: 'hsl(0 0% 100%)',     // White
    surface: 'hsl(213 100% 97%)',     // Light Blue #EBF4FF
    text: 'hsl(222.2 84% 4.9%)',      // Text Dark
    textSecondary: 'hsl(213 25% 40%)', // Text Blue Secondary
    muted: 'hsl(213 30% 85%)',        // Muted Blue
    error: 'hsl(0 70% 50%)',          // Red
    success: 'hsl(142 60% 40%)',      // Green
    warning: 'hsl(30 100% 50%)',      // Orange
    info: 'hsl(213 90% 51%)',         // Blue
  },
  {
    id: 'modern-purple',
    name: '모던 퍼플',
    description: '창의적이고 트렌디한 퍼플 톤',
    primary: 'hsl(271 76% 53%)',      // Purple #8B5CF6
    secondary: 'hsl(271 30% 25%)',    // Dark Purple #3E2F5B
    background: 'hsl(0 0% 100%)',     // White
    surface: 'hsl(271 100% 97%)',     // Light Purple #F5F3FF
    text: 'hsl(222.2 84% 4.9%)',      // Text Dark
    textSecondary: 'hsl(271 25% 40%)', // Text Purple Secondary
    muted: 'hsl(271 30% 85%)',        // Muted Purple
    error: 'hsl(0 70% 50%)',          // Red
    success: 'hsl(142 60% 40%)',      // Green
    warning: 'hsl(30 100% 50%)',      // Orange
    info: 'hsl(271 76% 53%)',         // Purple
  },
  {
    id: 'warm-orange',
    name: '웜 오렌지',
    description: '따뜻하고 친근한 오렌지와 브라운',
    primary: 'hsl(24 95% 53%)',       // Orange #F97316
    secondary: 'hsl(24 35% 25%)',     // Brown #5C3D2E
    background: 'hsl(0 0% 100%)',     // White
    surface: 'hsl(24 100% 97%)',      // Light Orange #FFF7ED
    text: 'hsl(222.2 84% 4.9%)',      // Text Dark
    textSecondary: 'hsl(24 25% 40%)', // Text Brown Secondary
    muted: 'hsl(24 30% 85%)',         // Muted Orange
    error: 'hsl(0 70% 50%)',          // Red
    success: 'hsl(142 60% 40%)',      // Green
    warning: 'hsl(30 100% 50%)',      // Orange
    info: 'hsl(24 95% 53%)',          // Orange
  },
  {
    id: 'fresh-green',
    name: '프레시 그린',
    description: '생동감 넘치는 그린과 블랙',
    primary: 'hsl(142 71% 45%)',      // Green #22C55E
    secondary: 'hsl(142 30% 25%)',    // Dark Green #2E5940
    background: 'hsl(0 0% 100%)',     // White
    surface: 'hsl(142 76% 96%)',      // Light Green #F0FDF4
    text: 'hsl(222.2 84% 4.9%)',      // Text Dark
    textSecondary: 'hsl(142 25% 40%)', // Text Green Secondary
    muted: 'hsl(142 30% 85%)',        // Muted Green
    error: 'hsl(0 70% 50%)',          // Red
    success: 'hsl(142 71% 45%)',      // Green
    warning: 'hsl(30 100% 50%)',      // Orange
    info: 'hsl(142 71% 45%)',         // Green
  },
  {
    id: 'elegant-pink',
    name: '엘레강트 핑크',
    description: '세련되고 우아한 핑크와 그레이',
    primary: 'hsl(330 81% 60%)',      // Pink #F472B6
    secondary: 'hsl(330 30% 25%)',    // Dark Pink #5A2E48
    background: 'hsl(0 0% 100%)',     // White
    surface: 'hsl(330 100% 97%)',     // Light Pink #FDF2F8
    text: 'hsl(222.2 84% 4.9%)',      // Text Dark
    textSecondary: 'hsl(330 25% 40%)', // Text Pink Secondary
    muted: 'hsl(330 30% 85%)',        // Muted Pink
    error: 'hsl(0 70% 50%)',          // Red
    success: 'hsl(142 60% 40%)',      // Green
    warning: 'hsl(30 100% 50%)',      // Orange
    info: 'hsl(330 81% 60%)',         // Pink
  },
];

/**
 * unified-ppt 슬라이드 타입별 기본 스타일
 *
 * 각 슬라이드 타입의 기본 색상, 폰트, 레이아웃 설정입니다.
 */
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
      color: TOSS_COLORS.text,
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

/**
 * 슬라이드 크기 (16:9 비율)
 *
 * 모든 슬라이드는 이 크기를 기준으로 생성됩니다.
 */
export const SLIDE_DIMENSIONS = {
  width: 1600,
  height: 900,
  aspectRatio: '16:9',
} as const;

/**
 * 템플릿 예시
 *
 * 사용자가 입력할 수 있는 프롬프트 예시입니다.
 */
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
