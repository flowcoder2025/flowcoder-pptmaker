/**
 * 테마 관리 시스템
 *
 * StyleTheme 객체를 CSS 변수로 변환하고
 * 런타임에 DOM에 적용하는 유틸리티 함수들입니다.
 */

import type { StyleTheme } from '@/constants/themes';

/**
 * 테마를 DOM에 적용 (CSS 변수 동적 업데이트)
 *
 * @param theme 적용할 StyleTheme 객체
 * @param root HTML 루트 엘리먼트 (기본값: document.documentElement)
 *
 * @example
 * ```typescript
 * import { TWITTER_THEME } from '@/constants/themes'
 * import { applyThemeToDocument } from '@/lib/theme-manager'
 *
 * applyThemeToDocument(TWITTER_THEME)
 * ```
 */
export function applyThemeToDocument(
  theme: StyleTheme,
  root: HTMLElement = document.documentElement
): void {
  // 1. 색상 변수 적용
  root.style.setProperty('--color-primary', theme.colors.primary);
  root.style.setProperty('--color-secondary', theme.colors.secondary);
  root.style.setProperty('--color-accent', theme.colors.accent);
  root.style.setProperty('--color-background', theme.colors.background);
  root.style.setProperty('--color-surface', theme.colors.surface);
  root.style.setProperty('--color-surface-elevated', theme.colors.surfaceElevated);
  root.style.setProperty('--color-text', theme.colors.text);
  root.style.setProperty('--color-text-secondary', theme.colors.textSecondary);
  root.style.setProperty('--color-text-muted', theme.colors.textMuted);
  root.style.setProperty('--color-error', theme.colors.error);
  root.style.setProperty('--color-success', theme.colors.success);
  root.style.setProperty('--color-warning', theme.colors.warning);
  root.style.setProperty('--color-info', theme.colors.info);
  root.style.setProperty('--color-border', theme.colors.border);
  root.style.setProperty('--color-border-light', theme.colors.borderLight);
  root.style.setProperty('--color-input', theme.colors.input);
  root.style.setProperty('--color-ring', theme.colors.ring);
  root.style.setProperty('--color-highlight', theme.colors.highlight);
  root.style.setProperty('--color-overlay', theme.colors.overlay);

  // 2. 타이포그래피 변수 적용
  root.style.setProperty('--font-family-primary', theme.typography.fontFamily.primary);
  if (theme.typography.fontFamily.secondary) {
    root.style.setProperty('--font-family-secondary', theme.typography.fontFamily.secondary);
  }
  root.style.setProperty('--font-family-monospace', theme.typography.fontFamily.monospace);

  // 폰트 크기
  root.style.setProperty('--font-size-xs', theme.typography.fontSize.xs);
  root.style.setProperty('--font-size-sm', theme.typography.fontSize.sm);
  root.style.setProperty('--font-size-base', theme.typography.fontSize.base);
  root.style.setProperty('--font-size-lg', theme.typography.fontSize.lg);
  root.style.setProperty('--font-size-xl', theme.typography.fontSize.xl);
  root.style.setProperty('--font-size-2xl', theme.typography.fontSize['2xl']);
  root.style.setProperty('--font-size-3xl', theme.typography.fontSize['3xl']);
  root.style.setProperty('--font-size-4xl', theme.typography.fontSize['4xl']);

  // 폰트 무게
  root.style.setProperty('--font-weight-light', theme.typography.fontWeight.light.toString());
  root.style.setProperty('--font-weight-normal', theme.typography.fontWeight.normal.toString());
  root.style.setProperty('--font-weight-medium', theme.typography.fontWeight.medium.toString());
  root.style.setProperty('--font-weight-semibold', theme.typography.fontWeight.semibold.toString());
  root.style.setProperty('--font-weight-bold', theme.typography.fontWeight.bold.toString());

  // 라인 높이
  root.style.setProperty('--line-height-tight', theme.typography.lineHeight.tight.toString());
  root.style.setProperty('--line-height-normal', theme.typography.lineHeight.normal.toString());
  root.style.setProperty('--line-height-relaxed', theme.typography.lineHeight.relaxed.toString());

  // 레터 스페이싱
  root.style.setProperty('--letter-spacing-tight', theme.typography.letterSpacing.tight);
  root.style.setProperty('--letter-spacing-normal', theme.typography.letterSpacing.normal);
  root.style.setProperty('--letter-spacing-wide', theme.typography.letterSpacing.wide);

  // 3. 간격 변수 적용
  root.style.setProperty('--spacing-xs', theme.spacing.xs);
  root.style.setProperty('--spacing-sm', theme.spacing.sm);
  root.style.setProperty('--spacing-md', theme.spacing.md);
  root.style.setProperty('--spacing-lg', theme.spacing.lg);
  root.style.setProperty('--spacing-xl', theme.spacing.xl);
  root.style.setProperty('--spacing-2xl', theme.spacing['2xl']);
  root.style.setProperty('--spacing-3xl', theme.spacing['3xl']);

  // 4. 모서리 변수 적용
  root.style.setProperty('--radius-none', theme.radius.none);
  root.style.setProperty('--radius-sm', theme.radius.sm);
  root.style.setProperty('--radius-md', theme.radius.md);
  root.style.setProperty('--radius-lg', theme.radius.lg);
  root.style.setProperty('--radius-xl', theme.radius.xl);
  root.style.setProperty('--radius-2xl', theme.radius['2xl']);
  root.style.setProperty('--radius-full', theme.radius.full);

  // 5. 그림자 변수 적용
  root.style.setProperty('--shadow-none', theme.shadows.none);
  root.style.setProperty('--shadow-sm', theme.shadows.sm);
  root.style.setProperty('--shadow-md', theme.shadows.md);
  root.style.setProperty('--shadow-lg', theme.shadows.lg);
  root.style.setProperty('--shadow-xl', theme.shadows.xl);
  root.style.setProperty('--shadow-2xl', theme.shadows['2xl']);
  root.style.setProperty('--shadow-inner', theme.shadows.inner);

  // 6. 컴포넌트 기본값 (참조용 데이터 속성)
  root.setAttribute('data-theme-id', theme.id);
  root.setAttribute('data-theme-tone', theme.tone);
  root.setAttribute('data-button-radius', theme.components.button.radius);
  root.setAttribute('data-card-radius', theme.components.card.radius);
  root.setAttribute('data-input-radius', theme.components.input.radius);
}

/**
 * 테마 CSS 변수 문자열 생성
 *
 * @param theme StyleTheme 객체
 * @returns CSS 변수 문자열
 *
 * @example
 * ```typescript
 * const cssVars = generateThemeCSS(TOSS_THEME)
 * // ":root { --color-primary: hsl(217 91% 60%); ... }"
 * ```
 */
export function generateThemeCSS(theme: StyleTheme): string {
  const vars: string[] = [];

  // 색상
  vars.push(`--color-primary: ${theme.colors.primary};`);
  vars.push(`--color-secondary: ${theme.colors.secondary};`);
  vars.push(`--color-accent: ${theme.colors.accent};`);
  vars.push(`--color-background: ${theme.colors.background};`);
  vars.push(`--color-surface: ${theme.colors.surface};`);
  vars.push(`--color-surface-elevated: ${theme.colors.surfaceElevated};`);
  vars.push(`--color-text: ${theme.colors.text};`);
  vars.push(`--color-text-secondary: ${theme.colors.textSecondary};`);
  vars.push(`--color-text-muted: ${theme.colors.textMuted};`);
  vars.push(`--color-error: ${theme.colors.error};`);
  vars.push(`--color-success: ${theme.colors.success};`);
  vars.push(`--color-warning: ${theme.colors.warning};`);
  vars.push(`--color-info: ${theme.colors.info};`);
  vars.push(`--color-border: ${theme.colors.border};`);
  vars.push(`--color-border-light: ${theme.colors.borderLight};`);
  vars.push(`--color-input: ${theme.colors.input};`);
  vars.push(`--color-ring: ${theme.colors.ring};`);
  vars.push(`--color-highlight: ${theme.colors.highlight};`);
  vars.push(`--color-overlay: ${theme.colors.overlay};`);

  // 타이포그래피
  vars.push(`--font-family-primary: ${theme.typography.fontFamily.primary};`);
  if (theme.typography.fontFamily.secondary) {
    vars.push(`--font-family-secondary: ${theme.typography.fontFamily.secondary};`);
  }
  vars.push(`--font-family-monospace: ${theme.typography.fontFamily.monospace};`);

  vars.push(`--font-size-xs: ${theme.typography.fontSize.xs};`);
  vars.push(`--font-size-sm: ${theme.typography.fontSize.sm};`);
  vars.push(`--font-size-base: ${theme.typography.fontSize.base};`);
  vars.push(`--font-size-lg: ${theme.typography.fontSize.lg};`);
  vars.push(`--font-size-xl: ${theme.typography.fontSize.xl};`);
  vars.push(`--font-size-2xl: ${theme.typography.fontSize['2xl']};`);
  vars.push(`--font-size-3xl: ${theme.typography.fontSize['3xl']};`);
  vars.push(`--font-size-4xl: ${theme.typography.fontSize['4xl']};`);

  vars.push(`--font-weight-light: ${theme.typography.fontWeight.light};`);
  vars.push(`--font-weight-normal: ${theme.typography.fontWeight.normal};`);
  vars.push(`--font-weight-medium: ${theme.typography.fontWeight.medium};`);
  vars.push(`--font-weight-semibold: ${theme.typography.fontWeight.semibold};`);
  vars.push(`--font-weight-bold: ${theme.typography.fontWeight.bold};`);

  vars.push(`--line-height-tight: ${theme.typography.lineHeight.tight};`);
  vars.push(`--line-height-normal: ${theme.typography.lineHeight.normal};`);
  vars.push(`--line-height-relaxed: ${theme.typography.lineHeight.relaxed};`);

  vars.push(`--letter-spacing-tight: ${theme.typography.letterSpacing.tight};`);
  vars.push(`--letter-spacing-normal: ${theme.typography.letterSpacing.normal};`);
  vars.push(`--letter-spacing-wide: ${theme.typography.letterSpacing.wide};`);

  // 간격
  vars.push(`--spacing-xs: ${theme.spacing.xs};`);
  vars.push(`--spacing-sm: ${theme.spacing.sm};`);
  vars.push(`--spacing-md: ${theme.spacing.md};`);
  vars.push(`--spacing-lg: ${theme.spacing.lg};`);
  vars.push(`--spacing-xl: ${theme.spacing.xl};`);
  vars.push(`--spacing-2xl: ${theme.spacing['2xl']};`);
  vars.push(`--spacing-3xl: ${theme.spacing['3xl']};`);

  // 모서리
  vars.push(`--radius-none: ${theme.radius.none};`);
  vars.push(`--radius-sm: ${theme.radius.sm};`);
  vars.push(`--radius-md: ${theme.radius.md};`);
  vars.push(`--radius-lg: ${theme.radius.lg};`);
  vars.push(`--radius-xl: ${theme.radius.xl};`);
  vars.push(`--radius-2xl: ${theme.radius['2xl']};`);
  vars.push(`--radius-full: ${theme.radius.full};`);

  // 그림자
  vars.push(`--shadow-none: ${theme.shadows.none};`);
  vars.push(`--shadow-sm: ${theme.shadows.sm};`);
  vars.push(`--shadow-md: ${theme.shadows.md};`);
  vars.push(`--shadow-lg: ${theme.shadows.lg};`);
  vars.push(`--shadow-xl: ${theme.shadows.xl};`);
  vars.push(`--shadow-2xl: ${theme.shadows['2xl']};`);
  vars.push(`--shadow-inner: ${theme.shadows.inner};`);

  return `:root {\n  ${vars.join('\n  ')}\n}`;
}

/**
 * 로컬스토리지에 테마 ID 저장
 *
 * @param themeId 테마 ID
 */
export function saveThemePreference(themeId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ppt-maker-theme', themeId);
  }
}

/**
 * 로컬스토리지에서 테마 ID 불러오기
 *
 * @returns 저장된 테마 ID 또는 null
 */
export function loadThemePreference(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ppt-maker-theme');
  }
  return null;
}

/**
 * 저장된 테마 preference 제거
 */
export function clearThemePreference(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('ppt-maker-theme');
  }
}
