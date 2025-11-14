/**
 * 스타일 테마 시스템
 *
 * 진정한 테마 시스템: 색상 + 타이포그래피 + 간격 + 모서리 + 그림자 등
 * 브랜드별 고유한 디자인 정체성을 완벽하게 반영합니다.
 */

/**
 * 완전한 스타일 테마 인터페이스
 */
export interface StyleTheme {
  // 메타데이터
  id: string; // UI에서 사용하는 테마 ID
  templateId: string; // TemplateEngine에서 사용하는 템플릿 ID (COLOR_PRESETS 호환)
  name: string;
  description: string;
  tone: 'professional' | 'modern' | 'playful' | 'minimal' | 'bold';

  // 색상 팔레트 (HSL 형식)
  colors: {
    // 주요 색상
    primary: string;
    secondary: string;
    accent: string;

    // 배경 레이어
    background: string;
    surface: string;
    surfaceElevated: string;

    // 텍스트
    text: string;
    textSecondary: string;
    textMuted: string;

    // 시맨틱 색상
    error: string;
    success: string;
    warning: string;
    info: string;

    // 인터랙션
    border: string;
    borderLight: string;
    input: string;
    ring: string;

    // 특수 효과
    highlight: string;
    overlay: string;
  };

  // 타이포그래피
  typography: {
    // 폰트 패밀리
    fontFamily: {
      primary: string;
      secondary?: string;
      monospace: string;
    };

    // 폰트 크기 (rem)
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
    };

    // 폰트 무게
    fontWeight: {
      light: number;
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };

    // 라인 높이
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };

    // 레터 스페이싱
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };

  // 간격 (rem)
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    '3xl': string;
  };

  // 모서리 (rem)
  radius: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    full: string;
  };

  // 그림자
  shadows: {
    none: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
    '2xl': string;
    inner: string;
  };

  // 컴포넌트 기본값
  components: {
    button: {
      radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
      shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
      fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    };
    card: {
      radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
      shadow: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'inner';
      padding: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    };
    input: {
      radius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
      borderWidth: string;
      fontSize: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
    };
  };
}

/**
 * 1. Toss 테마 (기본)
 */
export const TOSS_THEME: StyleTheme = {
  id: 'toss',
  templateId: 'toss', // TemplateEngine 템플릿 ID
  name: '토스 (Toss)',
  description: '토스 브랜드 디자인 - 블루와 그레이의 조화',
  tone: 'professional',

  colors: {
    primary: 'hsl(217 91% 60%)',
    secondary: 'hsl(220 13% 20%)',
    accent: 'hsl(217 91% 60%)',
    background: 'hsl(0 0% 100%)',
    surface: 'hsl(210 40% 96.1%)',
    surfaceElevated: 'hsl(0 0% 100%)',
    text: 'hsl(222.2 84% 4.9%)',
    textSecondary: 'hsl(215.4 16.3% 46.9%)',
    textMuted: 'hsl(214.3 31.8% 91.4%)',
    error: 'hsl(0 84.2% 60.2%)',
    success: 'hsl(142.1 76.2% 36.3%)',
    warning: 'hsl(37.7 92.1% 50.2%)',
    info: 'hsl(217 91% 60%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    borderLight: 'hsl(210 40% 96.1%)',
    input: 'hsl(214.3 31.8% 91.4%)',
    ring: 'hsl(217 91% 60%)',
    highlight: 'hsl(217 91% 95%)',
    overlay: 'hsl(222.2 84% 4.9% / 0.5)',
  },

  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
      monospace: '"SF Mono", "Roboto Mono", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.025em',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  components: {
    button: {
      radius: 'md',
      shadow: 'none',
      fontSize: 'base',
    },
    card: {
      radius: 'lg',
      shadow: 'sm',
      padding: 'md',
    },
    input: {
      radius: 'md',
      borderWidth: '1px',
      fontSize: 'base',
    },
  },
};

/**
 * 2. Twitter 테마
 */
export const TWITTER_THEME: StyleTheme = {
  id: 'twitter',
  templateId: 'professional-blue', // TemplateEngine 템플릿 ID (비즈니스 블루)
  name: 'Twitter',
  description: 'Twitter 브랜드 - 선명한 블루와 깔끔한 인터페이스',
  tone: 'modern',

  colors: {
    primary: 'hsl(203 89% 53%)',
    secondary: 'hsl(203 20% 20%)',
    accent: 'hsl(203 89% 53%)',
    background: 'hsl(0 0% 100%)',
    surface: 'hsl(0 0% 98%)',
    surfaceElevated: 'hsl(0 0% 100%)',
    text: 'hsl(203 20% 15%)',
    textSecondary: 'hsl(203 10% 50%)',
    textMuted: 'hsl(203 5% 65%)',
    error: 'hsl(0 72% 51%)',
    success: 'hsl(142 71% 45%)',
    warning: 'hsl(45 100% 51%)',
    info: 'hsl(203 89% 53%)',
    border: 'hsl(203 15% 90%)',
    borderLight: 'hsl(203 10% 95%)',
    input: 'hsl(203 15% 90%)',
    ring: 'hsl(203 89% 53%)',
    highlight: 'hsl(203 89% 95%)',
    overlay: 'hsl(203 20% 15% / 0.5)',
  },

  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      monospace: '"SF Mono", "Roboto Mono", Consolas, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '0.9375rem',
      lg: '1.0625rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.025em',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  components: {
    button: {
      radius: 'full',
      shadow: 'none',
      fontSize: 'base',
    },
    card: {
      radius: 'lg',
      shadow: 'sm',
      padding: 'md',
    },
    input: {
      radius: 'md',
      borderWidth: '1px',
      fontSize: 'base',
    },
  },
};

/**
 * 3. Vercel 테마
 */
export const VERCEL_THEME: StyleTheme = {
  id: 'vercel',
  templateId: 'toss', // TemplateEngine 템플릿 ID (깔끔한 기본)
  name: 'Vercel',
  description: 'Vercel 브랜드 - 미니멀한 흑백과 날카로운 타이포그래피',
  tone: 'minimal',

  colors: {
    primary: 'hsl(0 0% 0%)',
    secondary: 'hsl(0 0% 100%)',
    accent: 'hsl(0 0% 0%)',
    background: 'hsl(0 0% 100%)',
    surface: 'hsl(0 0% 98%)',
    surfaceElevated: 'hsl(0 0% 100%)',
    text: 'hsl(0 0% 0%)',
    textSecondary: 'hsl(0 0% 40%)',
    textMuted: 'hsl(0 0% 60%)',
    error: 'hsl(0 0% 0%)',
    success: 'hsl(0 0% 0%)',
    warning: 'hsl(0 0% 0%)',
    info: 'hsl(0 0% 0%)',
    border: 'hsl(0 0% 90%)',
    borderLight: 'hsl(0 0% 95%)',
    input: 'hsl(0 0% 90%)',
    ring: 'hsl(0 0% 0%)',
    highlight: 'hsl(0 0% 95%)',
    overlay: 'hsl(0 0% 0% / 0.5)',
  },

  typography: {
    fontFamily: {
      primary: '"Geist Sans", -apple-system, sans-serif',
      monospace: '"Geist Mono", "SF Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
  },

  radius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    xl: '0.5rem',
    '2xl': '0.75rem',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 2px 4px 0 rgba(0, 0, 0, 0.1)',
    lg: '0 4px 8px 0 rgba(0, 0, 0, 0.1)',
    xl: '0 8px 16px 0 rgba(0, 0, 0, 0.1)',
    '2xl': '0 16px 32px 0 rgba(0, 0, 0, 0.15)',
    inner: 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },

  components: {
    button: {
      radius: 'md',
      shadow: 'none',
      fontSize: 'sm',
    },
    card: {
      radius: 'lg',
      shadow: 'sm',
      padding: 'lg',
    },
    input: {
      radius: 'md',
      borderWidth: '1px',
      fontSize: 'sm',
    },
  },
};

/**
 * 4. Supabase 테마
 */
export const SUPABASE_THEME: StyleTheme = {
  id: 'supabase',
  templateId: 'fresh-green', // TemplateEngine 템플릿 ID (그린 계열)
  name: 'Supabase',
  description: 'Supabase 브랜드 - 생동감 있는 그린과 모던한 디자인',
  tone: 'modern',

  colors: {
    primary: 'hsl(158 64% 52%)',
    secondary: 'hsl(158 64% 35%)',
    accent: 'hsl(158 64% 52%)',
    background: 'hsl(162 15% 8%)',
    surface: 'hsl(162 15% 12%)',
    surfaceElevated: 'hsl(162 15% 16%)',
    text: 'hsl(0 0% 95%)',
    textSecondary: 'hsl(0 0% 70%)',
    textMuted: 'hsl(0 0% 50%)',
    error: 'hsl(0 72% 51%)',
    success: 'hsl(158 64% 52%)',
    warning: 'hsl(45 93% 47%)',
    info: 'hsl(198 93% 60%)',
    border: 'hsl(162 15% 20%)',
    borderLight: 'hsl(162 15% 25%)',
    input: 'hsl(162 15% 20%)',
    ring: 'hsl(158 64% 52%)',
    highlight: 'hsl(158 64% 52% / 0.1)',
    overlay: 'hsl(162 15% 8% / 0.75)',
  },

  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, sans-serif',
      monospace: '"Source Code Pro", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.25,
      normal: 1.6,
      relaxed: 1.8,
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.025em',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },

  radius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    '2xl': '1.5rem',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)',
  },

  components: {
    button: {
      radius: 'md',
      shadow: 'none',
      fontSize: 'sm',
    },
    card: {
      radius: 'lg',
      shadow: 'md',
      padding: 'lg',
    },
    input: {
      radius: 'md',
      borderWidth: '1px',
      fontSize: 'base',
    },
  },
};

/**
 * 5. Claude 테마
 */
export const CLAUDE_THEME: StyleTheme = {
  id: 'claude',
  templateId: 'warm-orange', // TemplateEngine 템플릿 ID (따뜻한 오렌지)
  name: 'Claude',
  description: 'Claude 브랜드 - 따뜻한 베이지와 친근한 오렌지',
  tone: 'playful',

  colors: {
    primary: 'hsl(20 90% 48%)',
    secondary: 'hsl(28 100% 97%)',
    accent: 'hsl(20 90% 48%)',
    background: 'hsl(28 100% 97%)',
    surface: 'hsl(0 0% 100%)',
    surfaceElevated: 'hsl(0 0% 100%)',
    text: 'hsl(24 10% 15%)',
    textSecondary: 'hsl(24 5% 40%)',
    textMuted: 'hsl(24 5% 60%)',
    error: 'hsl(0 72% 51%)',
    success: 'hsl(142 71% 45%)',
    warning: 'hsl(45 93% 47%)',
    info: 'hsl(203 89% 53%)',
    border: 'hsl(24 20% 90%)',
    borderLight: 'hsl(24 20% 95%)',
    input: 'hsl(24 20% 90%)',
    ring: 'hsl(20 90% 48%)',
    highlight: 'hsl(20 90% 95%)',
    overlay: 'hsl(24 10% 15% / 0.5)',
  },

  typography: {
    fontFamily: {
      primary: '"Inter", -apple-system, sans-serif',
      secondary: '"Crimson Pro", serif',
      monospace: '"Fira Code", monospace',
    },
    fontSize: {
      xs: '0.8125rem',
      sm: '0.9375rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.375rem',
      '2xl': '1.75rem',
      '3xl': '2.25rem',
      '4xl': '3rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.3,
      normal: 1.6,
      relaxed: 1.8,
    },
    letterSpacing: {
      tight: '-0.01em',
      normal: '0',
      wide: '0.02em',
    },
  },

  spacing: {
    xs: '0.375rem',
    sm: '0.75rem',
    md: '1.25rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },

  radius: {
    none: '0',
    sm: '0.375rem',
    md: '0.75rem',
    lg: '1rem',
    xl: '1.5rem',
    '2xl': '2rem',
    full: '9999px',
  },

  shadows: {
    none: 'none',
    sm: '0 2px 4px 0 rgba(209, 119, 6, 0.1)',
    md: '0 4px 8px 0 rgba(209, 119, 6, 0.15)',
    lg: '0 8px 16px 0 rgba(209, 119, 6, 0.2)',
    xl: '0 16px 32px 0 rgba(209, 119, 6, 0.25)',
    '2xl': '0 24px 48px 0 rgba(209, 119, 6, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(209, 119, 6, 0.1)',
  },

  components: {
    button: {
      radius: 'lg',
      shadow: 'sm',
      fontSize: 'base',
    },
    card: {
      radius: 'xl',
      shadow: 'md',
      padding: 'xl',
    },
    input: {
      radius: 'lg',
      borderWidth: '1.5px',
      fontSize: 'base',
    },
  },
};

/**
 * 6. Cyberpunk 테마
 */
export const CYBERPUNK_THEME: StyleTheme = {
  id: 'cyberpunk',
  templateId: 'modern-purple', // TemplateEngine 템플릿 ID (모던 퍼플)
  name: 'Cyberpunk',
  description: 'Cyberpunk 네온 스타일 - 마젠타와 시안의 강렬한 대비',
  tone: 'bold',

  colors: {
    primary: 'hsl(320 100% 50%)',
    secondary: 'hsl(180 100% 50%)',
    accent: 'hsl(320 100% 50%)',
    background: 'hsl(240 10% 8%)',
    surface: 'hsl(240 10% 12%)',
    surfaceElevated: 'hsl(240 10% 16%)',
    text: 'hsl(180 100% 90%)',
    textSecondary: 'hsl(180 50% 70%)',
    textMuted: 'hsl(180 30% 50%)',
    error: 'hsl(320 100% 50%)',
    success: 'hsl(150 100% 50%)',
    warning: 'hsl(60 100% 50%)',
    info: 'hsl(180 100% 50%)',
    border: 'hsl(320 100% 50% / 0.3)',
    borderLight: 'hsl(180 100% 50% / 0.2)',
    input: 'hsl(320 100% 50% / 0.3)',
    ring: 'hsl(320 100% 50%)',
    highlight: 'hsl(320 100% 50% / 0.2)',
    overlay: 'hsl(240 10% 8% / 0.9)',
  },

  typography: {
    fontFamily: {
      primary: '"Orbitron", -apple-system, sans-serif',
      secondary: '"Rajdhani", sans-serif',
      monospace: '"Share Tech Mono", "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.25rem',
      xl: '1.5rem',
      '2xl': '2rem',
      '3xl': '3rem',
      '4xl': '4rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 700,
      bold: 900,
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.4,
      relaxed: 1.6,
    },
    letterSpacing: {
      tight: '0',
      normal: '0.05em',
      wide: '0.1em',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },

  radius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0.125rem',
    xl: '0.25rem',
    '2xl': '0.5rem',
    full: '0',
  },

  shadows: {
    none: 'none',
    sm: '0 0 10px rgba(255, 0, 255, 0.5)',
    md: '0 0 20px rgba(255, 0, 255, 0.6)',
    lg: '0 0 30px rgba(255, 0, 255, 0.7)',
    xl: '0 0 40px rgba(255, 0, 255, 0.8)',
    '2xl': '0 0 60px rgba(255, 0, 255, 0.9)',
    inner: 'inset 0 0 10px rgba(0, 255, 255, 0.3)',
  },

  components: {
    button: {
      radius: 'none',
      shadow: 'md',
      fontSize: 'base',
    },
    card: {
      radius: 'none',
      shadow: 'lg',
      padding: 'lg',
    },
    input: {
      radius: 'none',
      borderWidth: '2px',
      fontSize: 'base',
    },
  },
};

/**
 * 7. Mono 테마
 */
export const MONO_THEME: StyleTheme = {
  id: 'mono',
  templateId: 'toss', // TemplateEngine 템플릿 ID (기본 깔끔)
  name: 'Mono',
  description: '모노크롬 디자인 - 순수한 흑백과 모노스페이스 폰트',
  tone: 'minimal',

  colors: {
    primary: 'hsl(0 0% 0%)',
    secondary: 'hsl(0 0% 20%)',
    accent: 'hsl(0 0% 40%)',
    background: 'hsl(0 0% 100%)',
    surface: 'hsl(0 0% 98%)',
    surfaceElevated: 'hsl(0 0% 96%)',
    text: 'hsl(0 0% 0%)',
    textSecondary: 'hsl(0 0% 30%)',
    textMuted: 'hsl(0 0% 50%)',
    error: 'hsl(0 0% 0%)',
    success: 'hsl(0 0% 0%)',
    warning: 'hsl(0 0% 0%)',
    info: 'hsl(0 0% 0%)',
    border: 'hsl(0 0% 0%)',
    borderLight: 'hsl(0 0% 80%)',
    input: 'hsl(0 0% 0%)',
    ring: 'hsl(0 0% 0%)',
    highlight: 'hsl(0 0% 90%)',
    overlay: 'hsl(0 0% 0% / 0.8)',
  },

  typography: {
    fontFamily: {
      primary: '"IBM Plex Mono", "Courier New", monospace',
      secondary: '"IBM Plex Mono", monospace',
      monospace: '"IBM Plex Mono", monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '2rem',
      '4xl': '2.5rem',
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
    letterSpacing: {
      tight: '0',
      normal: '0',
      wide: '0.05em',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '2.5rem',
    '3xl': '3rem',
  },

  radius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    '2xl': '0',
    full: '0',
  },

  shadows: {
    none: 'none',
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
    '2xl': 'none',
    inner: 'none',
  },

  components: {
    button: {
      radius: 'none',
      shadow: 'none',
      fontSize: 'sm',
    },
    card: {
      radius: 'none',
      shadow: 'none',
      padding: 'md',
    },
    input: {
      radius: 'none',
      borderWidth: '2px',
      fontSize: 'base',
    },
  },
};

/**
 * 전체 테마 컬렉션
 */
export const STYLE_THEMES: StyleTheme[] = [
  TOSS_THEME,
  TWITTER_THEME,
  VERCEL_THEME,
  SUPABASE_THEME,
  CLAUDE_THEME,
  CYBERPUNK_THEME,
  MONO_THEME,
];

/**
 * 테마 ID로 테마 가져오기
 */
export function getThemeById(id: string): StyleTheme | undefined {
  return STYLE_THEMES.find((theme) => theme.id === id);
}

/**
 * 기본 테마 (Toss)
 */
export const DEFAULT_THEME = TOSS_THEME;
