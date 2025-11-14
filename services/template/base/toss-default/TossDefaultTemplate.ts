/**
 * Toss Default Template
 *
 * TDS 디자인 시스템 기반 무료 기본 템플릿
 * 12개 슬라이드 타입 지원
 * 비용: 0원 (Gemini HTML API 미사용)
 */

import type {
  SlideTemplate,
  TemplateContext,
} from '../../engine/types';
import { DEFAULT_TEMPLATE_CONTEXT, calculateSlideSize } from '../../engine/types';
import type { StyleTheme } from '@/constants/themes';
import { DEFAULT_THEME } from '@/constants/themes';
import type {
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
  ImageSlide,
  AgendaSlide,
  TestimonialSlide,
  GallerySlide,
  ReportTwoColumnSlide,
  ReportA4Slide,
  HTMLSlide,
} from '@/types/slide';

/**
 * TossDefaultTemplate 클래스
 *
 * Toss Design System 기반 기본 템플릿
 * 모든 슬라이드 타입을 Pro 버전 패턴으로 렌더링
 */
export class TossDefaultTemplate implements SlideTemplate {
  /**
   * 템플릿 메타데이터
   */
  id = 'toss-default';
  name = 'Toss 기본 템플릿';
  category: 'free' | 'premium' = 'free';
  description = 'TDS 디자인 시스템 기반 무료 기본 템플릿';
  thumbnail?: string;

  /**
   * 템플릿 컨텍스트 (TDS 색상, 폰트, 여백 등)
   */
  private ctx: TemplateContext;

  /**
   * 스타일 테마 (Typography, Radius, Shadows 포함)
   */
  private theme: StyleTheme;

  /**
   * 생성자
   * @param themeOrContext - StyleTheme 또는 기존 TemplateContext (하위 호환성)
   */
  constructor(themeOrContext?: StyleTheme | Partial<TemplateContext>) {
    // StyleTheme인지 확인 (typography 속성이 있으면 StyleTheme)
    if (themeOrContext && 'typography' in themeOrContext) {
      // StyleTheme으로 전달된 경우
      this.theme = themeOrContext as StyleTheme;
      this.ctx = this.convertThemeToContext(this.theme);
    } else {
      // 기존 TemplateContext 또는 없음 (하위 호환성)
      this.theme = DEFAULT_THEME;
      this.ctx = themeOrContext
        ? {
            ...DEFAULT_TEMPLATE_CONTEXT,
            colors: {
              ...DEFAULT_TEMPLATE_CONTEXT.colors,
              ...(themeOrContext.colors || {}),
            },
            fonts: {
              ...DEFAULT_TEMPLATE_CONTEXT.fonts,
              ...(themeOrContext.fonts || {}),
            },
            spacing: {
              ...DEFAULT_TEMPLATE_CONTEXT.spacing,
              ...(themeOrContext.spacing || {}),
            },
            borderRadius: {
              ...DEFAULT_TEMPLATE_CONTEXT.borderRadius,
              ...(themeOrContext.borderRadius || {}),
            },
            slideSize: {
              ...DEFAULT_TEMPLATE_CONTEXT.slideSize,
              ...(themeOrContext.slideSize || {}),
            },
          }
        : DEFAULT_TEMPLATE_CONTEXT;
    }
  }

  /**
   * StyleTheme을 TemplateContext로 변환
   * @param theme - StyleTheme
   * @returns TemplateContext
   */
  private convertThemeToContext(theme: StyleTheme): TemplateContext {
    // rem 문자열을 픽셀로 변환하는 헬퍼
    const remToPx = (remStr: string): number => {
      return parseFloat(remStr) * 16;
    };

    return {
      colors: {
        primary: theme.colors.primary,
        dark: theme.colors.secondary,
        text: theme.colors.text,
        textSecondary: theme.colors.textSecondary,
        gray: theme.colors.textMuted,
        bg: theme.colors.background,
        white: '#FFFFFF',
        lightBg: theme.colors.surface,
        border: theme.colors.border,
      },
      fonts: {
        main: theme.typography.fontFamily.primary,
        serif: 'Georgia, serif',
        size: {
          title: remToPx(theme.typography.fontSize['4xl']), // 48px
          subtitle: remToPx(theme.typography.fontSize['2xl']), // 24px
          heading: remToPx(theme.typography.fontSize['3xl']), // 32px
          body: remToPx(theme.typography.fontSize.base), // 18px
          quote: remToPx(theme.typography.fontSize['2xl']), // 24px
          stats: 56, // 고정값
          section: 44, // 고정값
          thankYou: 56, // 고정값
          caption: remToPx(theme.typography.fontSize.sm), // 16px
          small: remToPx(theme.typography.fontSize.xs), // 14px
        },
      },
      spacing: {
        padding: remToPx(theme.spacing.lg), // 60px
        accentBar: {
          width: 60,
          height: 4,
        },
        gap: remToPx(theme.spacing.md), // 40px
        gapSmall: remToPx(theme.spacing.sm), // 20px
        listGap: 20,
        chartGap: 25,
        iconSize: 24,
        timelineNodeSize: 60,
      },
      borderRadius: {
        small: remToPx(theme.radius.sm),
        medium: remToPx(theme.radius.md),
        large: remToPx(theme.radius.lg),
        circle: '50%',
      },
      slideSize: DEFAULT_TEMPLATE_CONTEXT.slideSize,
    };
  }

  /**
   * AspectRatio를 적용한 새 템플릿 인스턴스 생성
   *
   * @param aspectRatio - 화면 비율 ('16:9' | '4:3' | 'A4-portrait')
   * @returns 새로운 TossDefaultTemplate 인스턴스
   */
  withAspectRatio(aspectRatio: '16:9' | '4:3' | 'A4-portrait'): TossDefaultTemplate {
    // 새 인스턴스 생성 (현재 테마 유지)
    const newTemplate = new TossDefaultTemplate(this.theme);

    // slideSize만 aspectRatio에 맞게 조정
    newTemplate.ctx = {
      ...newTemplate.ctx,
      slideSize: calculateSlideSize(aspectRatio),
    };

    return newTemplate;
  }

  /**
   * 1. Title Slide (제목 슬라이드)
   *
   * 배경: primary (#3182f6)
   * 정렬: 중앙
   */
  renderTitle(slide: TitleSlide): HTMLSlide {
    const { title, subtitle } = slide.props;

    const html = `
<div class="slide" style="
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  background-color: var(--color-primary);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
">
  <h1 style="
    color: var(--color-background);
    font-size: ${this.ctx.fonts.size.title}px;
    font-family: var(--font-family-base);
    text-align: center;
    font-weight: 700;
    margin: 0 0 20px 0;
  ">${this.escapeHtml(title)}</h1>
  ${subtitle ? `
  <p style="
    color: rgba(255,255,255,0.8);
    font-size: 24px;
    text-align: center;
    margin: 0;
  ">${this.escapeHtml(subtitle)}</p>
  ` : ''}
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 2. Section Slide (섹션 구분 슬라이드)
   *
   * 배경: dark (#333d4b)
   * 정렬: 중앙
   */
  renderSection(slide: SectionSlide): HTMLSlide {
    const { title } = slide.props;

    const html = `
<div class="slide" style="
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  background-color: var(--color-text-secondary);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
">
  <h2 style="
    color: var(--color-background);
    font-size: 44px;
    font-family: var(--font-family-base);
    text-align: center;
    font-weight: 700;
    margin: 0;
  ">${this.escapeHtml(title)}</h2>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 3. Content Slide (본문 슬라이드)
   *
   * 배경: white
   * Accent Bar + 제목 + 본문
   */
  renderContent(slide: ContentSlide): HTMLSlide {
    const { title, body } = slide.props;
    const bodyText = Array.isArray(body) ? body.join('<br><br>') : body;

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: 700;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Content -->
  <div style="
    flex: 1;
    display: flex;
    align-items: center;
  ">
    <div style="
      width: 100%;
      color: var(--color-text-primary);
      font-size: ${slide.style.body?.fontSize || this.ctx.fonts.size.body}px;
      font-family: var(--font-family-base);
      line-height: 1.6;
    ">${this.escapeHtml(bodyText)}</div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 4. Bullet Slide (리스트 슬라이드)
   *
   * 배경: white
   * Accent Bar + 제목 + 리스트 (→ 아이콘)
   */
  renderBullet(slide: BulletSlide): HTMLSlide {
    const { title, bullets } = slide.props;

    // 빈 bullets 방어 (에러 방지용)
    const bulletItems = (bullets || [])
      .map((bullet) => {
        const indent = bullet.level * 30; // level 0: 0px, level 1: 30px, level 2: 60px
        const baseFontSize = slide.style.bullets?.fontSize || this.ctx.fonts.size.body;
        const fontSize = bullet.level === 0 ? baseFontSize : bullet.level === 1 ? baseFontSize * 0.89 : baseFontSize * 0.78;

        return `
        <li style="
          display: flex;
          align-items: flex-start;
          margin-bottom: ${this.ctx.spacing.listGap}px;
          padding-left: ${indent}px;
        ">
          <span style="
            color: var(--color-primary);
            margin-right: 15px;
            font-size: ${this.ctx.spacing.iconSize}px;
            line-height: 1.2;
          ">${this.getIcon(slide.style.bullets?.iconType)}</span>
          <span style="
            color: var(--color-text-secondary);
            font-size: ${fontSize}px;
          ">${this.escapeHtml(bullet.text)}</span>
        </li>
        `;
      })
      .join('');

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar + Title -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: bold;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Bullet List -->
  <div style="flex: 1; display: flex; align-items: center; overflow: hidden;">
    <ul style="
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
      font-family: var(--font-family-base);
      font-size: ${this.ctx.fonts.size.body}px;
      line-height: 1.5;
    ">
      ${bulletItems}
    </ul>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 5. Two Column Slide (2단 레이아웃)
   *
   * 배경: white
   * Accent Bar + 제목 + 2 컬럼 (배경, 테두리, 불릿 리스트)
   */
  renderTwoColumn(slide: TwoColumnSlide): HTMLSlide {
    const { title, leftContent, rightContent } = slide.props;

    // 콘텐츠 파싱 헬퍼 함수
    const parseColumnContent = (content: string | undefined) => {
      // 빈 콘텐츠 방어 (에러 방지용, 플레이스홀더는 보여주지 않음)
      if (!content || typeof content !== 'string') {
        return { columnTitle: '', bulletItems: [] };
      }

      const lines = content.split('\n').filter(line => line.trim());
      const columnTitle = lines[0] || ''; // 첫 줄은 제목
      const bulletItems = lines
        .slice(1)
        .filter(line => line.trim().startsWith('-'))
        .map(line => line.replace(/^-\s*/, '').trim());

      return { columnTitle, bulletItems };
    };

    // 왼쪽/오른쪽 콘텐츠 파싱
    const leftParsed = parseColumnContent(leftContent);
    const rightParsed = parseColumnContent(rightContent);

    // 불릿 리스트 HTML 생성
    const createBulletList = (items: string[], fontSize: number) => {
      return items.map(item => `
          <li style="
            display: flex;
            align-items: flex-start;
            margin-bottom: 12px;
          ">
            <span style="
              color: var(--color-primary);
              margin-right: 12px;
              font-size: ${this.ctx.spacing.iconSize}px;
              line-height: 1.2;
            ">${this.getIcon(slide.style.bullets?.iconType)}</span>
            <span style="
              color: var(--color-text-secondary);
              font-size: ${fontSize}px;
              line-height: 1.5;
            ">${this.escapeHtml(item)}</span>
          </li>
        `).join('');
    };

    const leftFontSize = slide.style.leftColumn?.fontSize || this.ctx.fonts.size.body;
    const rightFontSize = slide.style.rightColumn?.fontSize || this.ctx.fonts.size.body;
    const leftBulletList = createBulletList(leftParsed.bulletItems, leftFontSize);
    const rightBulletList = createBulletList(rightParsed.bulletItems, rightFontSize);

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar + Title -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: bold;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Two Columns with Enhanced Design -->
  <div style="
    flex: 1;
    display: flex;
    gap: ${this.ctx.spacing.gap}px;
  ">
    <!-- Left Column -->
    <div style="
      flex: 1;
      background-color: var(--color-background-light);
      padding: 30px;
      border-radius: ${this.ctx.borderRadius.medium}px;
      border-left: 4px solid var(--color-primary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      overflow: hidden;
    ">
      <h4 style="
        color: var(--color-text-primary);
        font-size: ${this.ctx.fonts.size.subtitle}px;
        font-family: var(--font-family-base);
        font-weight: 700;
        margin: 0 0 20px 0;
      ">${this.escapeHtml(leftParsed.columnTitle)}</h4>

      <ul style="
        list-style: none;
        padding: 0;
        margin: 0;
        font-family: var(--font-family-base);
      ">
        ${leftBulletList}
      </ul>
    </div>

    <!-- Right Column -->
    <div style="
      flex: 1;
      background-color: var(--color-background-light);
      padding: 30px;
      border-radius: ${this.ctx.borderRadius.medium}px;
      border-left: 4px solid var(--color-text-secondary);
      box-shadow: 0 2px 8px rgba(0,0,0,0.04);
      overflow: hidden;
    ">
      <h4 style="
        color: var(--color-text-primary);
        font-size: ${this.ctx.fonts.size.subtitle}px;
        font-family: var(--font-family-base);
        font-weight: 700;
        margin: 0 0 20px 0;
      ">${this.escapeHtml(rightParsed.columnTitle)}</h4>

      <ul style="
        list-style: none;
        padding: 0;
        margin: 0;
        font-family: var(--font-family-base);
      ">
        ${rightBulletList}
      </ul>
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 6. Thank You Slide (감사 슬라이드)
   *
   * 배경: primary (#3182f6)
   * 정렬: 중앙
   */
  renderThankYou(slide: ThankYouSlide): HTMLSlide {
    const { message, contact } = slide.props;

    const html = `
<div class="slide" style="
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  background-color: var(--color-primary);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
">
  <h1 style="
    color: var(--color-background);
    font-size: 48px;
    font-family: var(--font-family-base);
    text-align: center;
    font-weight: bold;
    margin: 0 0 30px 0;
  ">${this.escapeHtml(message)}</h1>

  ${contact ? `
  <div style="
    color: var(--color-background);
    font-size: ${this.ctx.fonts.size.body}px;
    font-family: var(--font-family-base);
    text-align: center;
  ">
    ${this.escapeHtml(contact)}
  </div>
  ` : ''}
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 7. Chart Slide (차트 슬라이드)
   *
   * 배경: white
   * Accent Bar + 제목 + 바 차트
   */
  renderChart(slide: ChartSlide): HTMLSlide {
    const { title, data, chartType } = slide.props;

    // 빈 데이터 방어 (에러 방지용)
    if (!data || !Array.isArray(data) || data.length === 0) {
      // 빈 차트 표시
      const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: bold;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>
  <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
    <p style="color: var(--color-text-secondary); font-size: 18px;">차트 데이터가 없어요</p>
  </div>
</div>
      `.trim();
      const css = this.generateCSSVariables();
      return { html, css };
    }

    // 다중 시리즈 지원을 위한 색상 팔레트
    const colors = [
      this.ctx.colors.primary,  // Toss Blue
      '#10B981',                // Green
      '#F59E0B',                // Orange
      '#EF4444',                // Red
      '#8B5CF6',                // Purple
    ];

    // 모든 시리즈의 값을 수집하여 최대/최소값 계산
    const allValues: number[] = [];
    data.forEach(series => {
      if (series && series.values && Array.isArray(series.values)) {
        series.values.forEach(val => {
          const num = parseFloat(String(val));
          if (!isNaN(num)) {
            allValues.push(num);
          }
        });
      }
    });

    const maxValue = allValues.length > 0 ? Math.max(...allValues) : 100;
    const minValue = allValues.length > 0 ? Math.min(...allValues) : 0;

    // chartType에 따라 다른 차트 렌더링 (다중 시리즈 지원)
    let chartContent = '';

    if (chartType === 'line') {
      // Line Chart (SVG) - 다중 시리즈 지원
      const svgWidth = 800;
      const svgHeight = 400;
      const padding = 60;
      const chartWidth = svgWidth - padding * 2;
      const chartHeight = svgHeight - padding * 2;

      // 첫 번째 시리즈의 라벨을 X축으로 사용
      const baseLabels = data[0]?.labels || [];

      chartContent = `
        <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" style="max-width: 900px; max-height: 450px;">
          <!-- 그리드 라인 -->
          ${[0, 0.25, 0.5, 0.75, 1].map(ratio => `
            <line x1="${padding}" y1="${padding + chartHeight * ratio}" x2="${svgWidth - padding}" y2="${padding + chartHeight * ratio}"
                  stroke="${this.ctx.colors.border}" stroke-width="1" opacity="0.3"/>
          `).join('')}

          <!-- 각 시리즈의 선과 포인트 -->
          ${data.map((series, seriesIndex) => {
            if (!series || !series.values || series.values.length === 0) return '';

            const color = colors[seriesIndex % colors.length];
            const points = series.values.map((value, index) => {
              const x = padding + (index / Math.max(1, series.values.length - 1)) * chartWidth;
              const y = padding + chartHeight - ((parseFloat(String(value)) - minValue) / (maxValue - minValue || 1)) * chartHeight;
              return `${x},${y}`;
            }).join(' ');

            return `
              <!-- 시리즈 ${seriesIndex + 1}: ${this.escapeHtml(series.name)} -->
              <polyline points="${points}" fill="none" stroke="${color}" stroke-width="3"/>
              ${series.values.map((value, index) => {
                const x = padding + (index / Math.max(1, series.values.length - 1)) * chartWidth;
                const y = padding + chartHeight - ((parseFloat(String(value)) - minValue) / (maxValue - minValue || 1)) * chartHeight;
                return `<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`;
              }).join('')}
            `;
          }).join('')}

          <!-- X축 라벨 -->
          ${baseLabels.map((label, index) => {
            const x = padding + (index / Math.max(1, baseLabels.length - 1)) * chartWidth;
            return `<text x="${x}" y="${svgHeight - padding + 30}" text-anchor="middle" fill="${this.ctx.colors.text}" font-size="14">${this.escapeHtml(String(label))}</text>`;
          }).join('')}

          <!-- 범례 -->
          ${data.map((series, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            const legendX = padding + seriesIndex * 120;
            const legendY = padding - 30;
            return `
              <rect x="${legendX}" y="${legendY}" width="15" height="3" fill="${color}"/>
              <text x="${legendX + 20}" y="${legendY + 4}" fill="${this.ctx.colors.text}" font-size="12">${this.escapeHtml(series.name || `시리즈 ${seriesIndex + 1}`)}</text>
            `;
          }).join('')}
        </svg>
      `;
    } else if (chartType === 'pie') {
      // Pie Chart (SVG) - 최대 3개 시리즈까지 나란히 표시
      const validSeries = data.filter(s => s && s.values && s.values.length > 0);

      if (validSeries.length === 0) {
        chartContent = '<p style="text-align: center; color: var(--color-text-secondary);">Pie 차트 데이터가 없어요</p>';
      } else {
        // 최대 3개 시리즈까지만 표시
        const seriesToRender = validSeries.slice(0, 3);
        const seriesCount = seriesToRender.length;

        const pieSize = 500; // 각 파이 차트 크기
        const svgWidth = pieSize * seriesCount;
        const svgHeight = pieSize;
        const radius = 140;

        // 3개 초과 경고 메시지
        const overflowWarning = data.length > 3
          ? `<text x="${svgWidth / 2}" y="20" text-anchor="middle" fill="${this.ctx.colors.textSecondary}" font-size="12">⚠️ Pie 차트는 최대 3개 시리즈까지 표시해요 (현재 ${data.length}개 중 3개 표시)</text>`
          : '';

        // 각 시리즈마다 파이 차트 생성
        const pieCharts = seriesToRender.map((series, seriesIndex) => {
          const numericValues = series.values.map(v => parseFloat(String(v)));
          const total = numericValues.reduce((sum, val) => sum + val, 0);
          let currentAngle = -90; // 12시 방향부터 시작

          const offsetX = seriesIndex * pieSize;
          const centerX = offsetX + pieSize / 2;
          const centerY = svgHeight / 2;

          // 시리즈 이름 (상단)
          const seriesTitle = `
            <text x="${centerX}" y="40" text-anchor="middle" fill="${this.ctx.colors.text}" font-size="18" font-weight="600">
              ${this.escapeHtml(series.name || `시리즈 ${seriesIndex + 1}`)}
            </text>
          `;

          // 파이 슬라이스 및 라벨
          const slices = series.labels.map((label, index) => {
            const value = numericValues[index];
            const percentage = (value / total) * 100;
            const angle = (value / total) * 360;

            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startRad);
            const y1 = centerY + radius * Math.sin(startRad);
            const x2 = centerX + radius * Math.cos(endRad);
            const y2 = centerY + radius * Math.sin(endRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            // 라벨 위치 (중간 각도, 반지름 밖)
            const midAngle = (startAngle + endAngle) / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const labelDistance = radius + 45;
            const labelX = centerX + labelDistance * Math.cos(midRad);
            const labelY = centerY + labelDistance * Math.sin(midRad);

            currentAngle = endAngle;

            const color = colors[index % colors.length];

            return `
              <path d="M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z"
                    fill="${color}" stroke="${this.ctx.colors.white}" stroke-width="2"/>
              <text x="${labelX}" y="${labelY}" text-anchor="middle" fill="${this.ctx.colors.text}" font-size="13" font-weight="600">
                ${this.escapeHtml(String(label))}
              </text>
              <text x="${labelX}" y="${labelY + 16}" text-anchor="middle" fill="${this.ctx.colors.textSecondary}" font-size="12">
                ${percentage.toFixed(1)}%
              </text>
            `;
          }).join('');

          return seriesTitle + slices;
        }).join('');

        chartContent = `
          <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" style="max-width: ${svgWidth}px; max-height: ${svgHeight}px;">
            ${overflowWarning}
            ${pieCharts}
          </svg>
        `;
      }
    } else if (chartType === 'area') {
      // Area Chart (SVG) - 다중 시리즈 지원
      const svgWidth = 800;
      const svgHeight = 400;
      const padding = 60;
      const chartWidth = svgWidth - padding * 2;
      const chartHeight = svgHeight - padding * 2;

      // 첫 번째 시리즈의 라벨을 X축으로 사용
      const baseLabels = data[0]?.labels || [];

      chartContent = `
        <svg width="100%" height="100%" viewBox="0 0 ${svgWidth} ${svgHeight}" style="max-width: 900px; max-height: 450px;">
          <!-- 그리드 라인 -->
          ${[0, 0.25, 0.5, 0.75, 1].map(ratio => `
            <line x1="${padding}" y1="${padding + chartHeight * ratio}" x2="${svgWidth - padding}" y2="${padding + chartHeight * ratio}"
                  stroke="${this.ctx.colors.border}" stroke-width="1" opacity="0.3"/>
          `).join('')}

          <!-- 각 시리즈의 영역과 선 -->
          ${data.map((series, seriesIndex) => {
            if (!series || !series.values || series.values.length === 0) return '';

            const color = colors[seriesIndex % colors.length];
            const points = series.values.map((value, index) => {
              const x = padding + (index / Math.max(1, series.values.length - 1)) * chartWidth;
              const y = padding + chartHeight - ((parseFloat(String(value)) - minValue) / (maxValue - minValue || 1)) * chartHeight;
              return { x, y };
            });

            const areaPath = `
              M ${points[0].x} ${padding + chartHeight}
              L ${points.map(p => `${p.x} ${p.y}`).join(' L ')}
              L ${points[points.length - 1].x} ${padding + chartHeight}
              Z
            `;

            const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

            return `
              <!-- 시리즈 ${seriesIndex + 1}: ${this.escapeHtml(series.name)} -->
              <path d="${areaPath}" fill="${color}" opacity="0.3"/>
              <path d="${linePath}" fill="none" stroke="${color}" stroke-width="3"/>
              ${series.values.map((value, index) => {
                const x = points[index].x;
                const y = points[index].y;
                return `<circle cx="${x}" cy="${y}" r="5" fill="${color}"/>`;
              }).join('')}
            `;
          }).join('')}

          <!-- X축 라벨 -->
          ${baseLabels.map((label, index) => {
            const x = padding + (index / Math.max(1, baseLabels.length - 1)) * chartWidth;
            return `<text x="${x}" y="${svgHeight - padding + 30}" text-anchor="middle" fill="${this.ctx.colors.text}" font-size="14">${this.escapeHtml(String(label))}</text>`;
          }).join('')}

          <!-- 범례 -->
          ${data.map((series, seriesIndex) => {
            const color = colors[seriesIndex % colors.length];
            const legendX = padding + seriesIndex * 120;
            const legendY = padding - 30;
            return `
              <rect x="${legendX}" y="${legendY}" width="15" height="10" fill="${color}" opacity="0.5"/>
              <text x="${legendX + 20}" y="${legendY + 9}" fill="${this.ctx.colors.text}" font-size="12">${this.escapeHtml(series.name || `시리즈 ${seriesIndex + 1}`)}</text>
            `;
          }).join('')}
        </svg>
      `;
    } else {
      // Bar Chart (HTML/CSS) - 다중 시리즈 지원 (Grouped Bar)
      const isPercentageData = maxValue <= 100 && minValue >= 0 && maxValue > 1;

      // 첫 번째 시리즈의 라벨을 X축으로 사용
      const baseLabels = data[0]?.labels || [];

      // 범례 생성
      const legend = data.map((series, seriesIndex) => {
        const color = colors[seriesIndex % colors.length];
        return `
          <div style="display: inline-flex; align-items: center; margin-right: 20px;">
            <div style="width: 15px; height: 15px; background-color: ${color}; border-radius: 2px; margin-right: 8px;"></div>
            <span style="color: ${this.ctx.colors.text}; font-size: 14px; font-family: var(--font-family-base);">
              ${this.escapeHtml(series.name || `시리즈 ${seriesIndex + 1}`)}
            </span>
          </div>
        `;
      }).join('');

      // 각 라벨(X축)마다 모든 시리즈의 막대를 그룹으로 표시
      const groupedBars = baseLabels.map((label, labelIndex) => {
        // 해당 라벨에 대한 모든 시리즈의 막대들
        const bars = data.map((series, seriesIndex) => {
          if (!series.values || labelIndex >= series.values.length) {
            return ''; // 데이터 없으면 스킵
          }

          const value = series.values[labelIndex];
          const numericValue = parseFloat(String(value));
          const color = colors[seriesIndex % colors.length];

          // 너비 퍼센트 계산
          let widthPercentage: number;
          if (isPercentageData) {
            widthPercentage = numericValue;
          } else if (maxValue === 0) {
            widthPercentage = 0;
          } else {
            widthPercentage = (numericValue / maxValue) * 100;
          }
          widthPercentage = Math.round(widthPercentage * 10) / 10;

          return `
            <div style="margin-bottom: 6px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="color: ${this.ctx.colors.textSecondary}; font-size: 13px; font-family: var(--font-family-base);">
                  ${this.escapeHtml(series.name || `시리즈 ${seriesIndex + 1}`)}
                </span>
                <span style="color: ${color}; font-size: 14px; font-weight: 600; font-family: var(--font-family-base);">
                  ${value}
                </span>
              </div>
              <div style="width: 100%; height: 20px; background-color: ${this.ctx.colors.bg}; border-radius: 4px; overflow: hidden;">
                <div style="height: 100%; width: ${widthPercentage}%; background-color: ${color}; border-radius: 4px; transition: width 0.5s ease-in-out;"></div>
              </div>
            </div>
          `;
        }).join('');

        return `
          <div style="margin-bottom: 20px;">
            <div style="font-weight: 600; font-size: 16px; color: ${this.ctx.colors.text}; margin-bottom: 10px; font-family: var(--font-family-base);">
              ${this.escapeHtml(String(label))}
            </div>
            ${bars}
          </div>
        `;
      }).join('');

      chartContent = `
        <div style="margin-bottom: 20px;">
          ${legend}
        </div>
        ${groupedBars}
      `;
    }

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar + Title -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: bold;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Chart Content -->
  <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden;">
    <div style="width: 100%; max-height: 100%; ${chartType === 'bar' ? `display: flex; flex-direction: column; gap: ${this.ctx.spacing.chartGap}px;` : 'display: flex; align-items: center; justify-content: center;'}">
      ${chartContent}
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 8. Table Slide (표 슬라이드)
   *
   * 배경: white
   * Accent Bar + 제목 + 시맨틱 테이블
   */
  renderTable(slide: TableSlide): HTMLSlide {
    const { title, headers, rows } = slide.props;

    // 빈 배열 방어 (에러 방지용)
    const headerCells = (headers || [])
      .map(
        (header) => `
            <th style="
              padding: 15px;
              text-align: left;
              font-weight: bold;
              color: var(--color-text-primary);
            ">${this.escapeHtml(header)}</th>
          `
      )
      .join('');

    const bodyRows = (rows || [])
      .map((row, index) => {
        const cells = (row || [])
          .map(
            (cell) => `
              <td style="
                padding: 15px;
                color: var(--color-text-secondary);
              ">${this.escapeHtml(cell)}</td>
            `
          )
          .join('');

        return `
          <tr style="
            border-bottom: 1px solid var(--color-border);
            ${index % 2 === 1 ? `background-color: var(--color-background-light);` : ''}
          ">
            ${cells}
          </tr>
        `;
      })
      .join('');

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar + Title -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: bold;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Semantic Table -->
  <div style="flex: 1; display: flex; align-items: center; overflow: hidden;">
    <table style="
      width: 100%;
      border-collapse: collapse;
      font-family: var(--font-family-base);
      font-size: 16px;
    ">
      <thead style="background-color: ${this.ctx.colors.bg};">
        <tr>
          ${headerCells}
        </tr>
      </thead>
      <tbody>
        ${bodyRows}
      </tbody>
    </table>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 9. Stats Slide (통계 슬라이드)
   *
   * 배경: white
   * Accent Bar + 제목 + 2×2 통계 그리드
   */
  renderStats(slide: StatsSlide): HTMLSlide {
    const { title, stats, citation } = slide.props;

    // 빈 배열 방어 (에러 방지용)
    const statCards = (stats || [])
      .map(
        (stat) => `
      <div style="
        background: var(--color-background-light);
        padding: 40px;
        border-radius: ${this.ctx.borderRadius.large}px;
        text-align: center;
        border-left: 5px solid var(--color-primary);
        box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      ">
        <div style="
          color: var(--color-primary);
          font-size: ${this.ctx.fonts.size.stats}px;
          font-weight: 700;
          margin-bottom: 15px;
          font-family: var(--font-family-base);
        ">${this.escapeHtml(stat.value)}</div>
        <div style="
          color: var(--color-text-primary);
          font-size: ${this.ctx.fonts.size.body}px;
          font-family: var(--font-family-base);
        ">${this.escapeHtml(stat.label)}</div>
      </div>
    `
      )
      .join('');

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar + Title -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: 700;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- 2×2 Stats Grid -->
  <div style="
    flex: 1;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: ${this.ctx.spacing.gap}px;
    align-items: center;
  ">
    ${statCards}
  </div>

  ${citation ? `
  <!-- Citation -->
  <div style="
    margin-top: ${this.ctx.spacing.gap}px;
    padding-top: ${this.ctx.spacing.gapSmall}px;
    border-top: 1px solid var(--color-border);
    text-align: right;
  ">
    <p style="
      color: var(--color-text-tertiary);
      font-size: ${this.ctx.fonts.size.caption}px;
      font-family: var(--font-family-base);
      margin: 0;
      font-style: italic;
    ">${this.escapeHtml(citation)}</p>
  </div>
  ` : ''}
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 10. Quote Slide (인용 슬라이드)
   *
   * 배경: lightBg (#f8f9fa)
   * 정렬: 중앙
   */
  renderQuote(slide: QuoteSlide): HTMLSlide {
    const { quote, author, showQuoteMark = true } = slide.props;

    const html = `
<div class="slide" style="
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  text-align: center;
  background-color: var(--color-background-light);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
">
  ${showQuoteMark ? `
  <!-- Large Quotation Mark -->
  <div style="
    color: var(--color-primary);
    font-size: 72px;
    font-family: ${this.ctx.fonts.serif};
    opacity: 0.3;
    margin-bottom: 30px;
  ">"</div>
  ` : ''}

  <!-- Quote Text -->
  <blockquote style="
    color: var(--color-text-primary);
    font-size: ${this.ctx.fonts.size.heading}px;
    font-family: ${this.ctx.fonts.serif};
    font-style: italic;
    line-height: 1.6;
    margin: 0 0 30px 0;
    max-width: 900px;
  ">${this.escapeHtml(quote)}</blockquote>

  <!-- Author -->
  <cite style="
    color: var(--color-text-secondary);
    font-size: ${this.ctx.fonts.size.body}px;
    font-family: var(--font-family-base);
    font-style: normal;
    font-weight: 500;
  ">— ${this.escapeHtml(author)}</cite>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 11. Comparison Slide (비교 슬라이드)
   *
   * 배경: white
   * Accent Bar + 제목 + 2 컬럼 비교
   */
  renderComparison(slide: ComparisonSlide): HTMLSlide {
    const { title, leftLabel, rightLabel, leftContent, rightContent, leftImage, rightImage } = slide.props;

    // fontSize 가져오기
    const leftFontSize = slide.style.leftColumn?.fontSize || this.ctx.fonts.size.body;
    const rightFontSize = slide.style.rightColumn?.fontSize || this.ctx.fonts.size.body;

    // leftContent와 rightContent를 배열로 분리 (줄바꿈 기준)
    const leftItems = leftContent ? leftContent.split('\n').filter((item) => item.trim()) : [];
    const rightItems = rightContent ? rightContent.split('\n').filter((item) => item.trim()) : [];

    const leftList = leftItems
      .map(
        (item) => `
          <li style="
            margin-bottom: 12px;
            padding-left: 0;
          ">${this.getIcon(slide.style.bullets?.iconType)} ${this.escapeHtml(item)}</li>
        `
      )
      .join('');

    const rightList = rightItems
      .map(
        (item) => `
          <li style="
            margin-bottom: 12px;
            padding-left: 0;
          ">${this.getIcon(slide.style.bullets?.iconType)} ${this.escapeHtml(item)}</li>
        `
      )
      .join('');

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar + Title -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: bold;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Two Column Comparison -->
  <div style="
    flex: 1;
    display: flex;
    gap: ${this.ctx.spacing.gap}px;
  ">
    <div style="
      flex: 1;
      background: var(--color-background-light);
      padding: 30px;
      border-radius: 8px;
      border-top: 4px solid var(--color-primary);
      overflow: hidden;
    ">
      ${leftLabel ? `
      <h4 style="
        color: var(--color-text-primary);
        font-size: ${this.ctx.fonts.size.subtitle}px;
        font-family: var(--font-family-base);
        font-weight: bold;
        margin: 0 0 20px 0;
      ">${this.escapeHtml(leftLabel)}</h4>
      ` : ''}
      ${leftImage ? `
      <!-- Left Image -->
      <div style="margin-bottom: 20px;">
        <img src="${leftImage}" alt="${leftLabel || '좌측 이미지'}" style="
          width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 4px;
        " />
      </div>
      ` : `
      <!-- Left Image Placeholder -->
      <div style="
        margin-bottom: 20px;
        border: 2px dashed #e0e0e0;
        border-radius: 4px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        min-height: 150px;
      ">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" style="margin-bottom: 10px;">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <p style="
          color: #9e9e9e;
          font-size: 14px;
          margin: 0;
          font-family: var(--font-family-base);
        ">이미지를 추가하세요</p>
      </div>
      `}
      <ul style="
        list-style: none;
        padding: 0;
        margin: 0;
        font-family: var(--font-family-base);
        font-size: ${leftFontSize}px;
        color: var(--color-text-secondary);
      ">
        ${leftList}
      </ul>
    </div>

    <div style="
      flex: 1;
      background: var(--color-background-light);
      padding: 30px;
      border-radius: 8px;
      border-top: 4px solid var(--color-text-secondary);
      overflow: hidden;
    ">
      ${rightLabel ? `
      <h4 style="
        color: var(--color-text-primary);
        font-size: ${this.ctx.fonts.size.subtitle}px;
        font-family: var(--font-family-base);
        font-weight: bold;
        margin: 0 0 20px 0;
      ">${this.escapeHtml(rightLabel)}</h4>
      ` : ''}
      ${rightImage ? `
      <!-- Right Image -->
      <div style="margin-bottom: 20px;">
        <img src="${rightImage}" alt="${rightLabel || '우측 이미지'}" style="
          width: 100%;
          max-height: 200px;
          object-fit: contain;
          border-radius: 4px;
        " />
      </div>
      ` : `
      <!-- Right Image Placeholder -->
      <div style="
        margin-bottom: 20px;
        border: 2px dashed #e0e0e0;
        border-radius: 4px;
        padding: 30px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: #fafafa;
        min-height: 150px;
      ">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" style="margin-bottom: 10px;">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <p style="
          color: #9e9e9e;
          font-size: 14px;
          margin: 0;
          font-family: var(--font-family-base);
        ">이미지를 추가하세요</p>
      </div>
      `}
      <ul style="
        list-style: none;
        padding: 0;
        margin: 0;
        font-family: var(--font-family-base);
        font-size: ${rightFontSize}px;
        color: var(--color-text-secondary);
      ">
        ${rightList}
      </ul>
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 12. Timeline Slide (타임라인 슬라이드)
   *
   * 배경: white
   * Accent Bar + 제목 + 타임라인
   */
  renderTimeline(slide: TimelineSlide): HTMLSlide {
    const { title, items } = slide.props;

    // 빈 배열 방어 (에러 방지용)
    const safeItems = items || [];
    const timelineItems = safeItems
      .map((item, index) => {
        const isLast = index === safeItems.length - 1;

        return `
        <div style="
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
        ">
          <div style="
            width: ${this.ctx.spacing.timelineNodeSize}px;
            height: ${this.ctx.spacing.timelineNodeSize}px;
            background-color: var(--color-primary);
            border-radius: ${this.ctx.borderRadius.circle};
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: ${this.ctx.spacing.iconSize}px;
            font-weight: bold;
            line-height: 1;
            margin-bottom: 20px;
          ">${index + 1}</div>
          <div style="
            text-align: center;
            font-family: var(--font-family-base);
          ">
            <div style="
              color: var(--color-text-primary);
              font-size: ${this.ctx.fonts.size.body}px;
              font-weight: bold;
              margin-bottom: 16px;
            ">${this.escapeHtml(item.title)}</div>
            <div style="
              color: var(--color-text-secondary);
              font-size: 14px;
              line-height: 1.5;
              margin: 6px;
            ">${this.escapeHtml(item.description)}</div>
          </div>
          ${!isLast ? `
            <div style="
              position: absolute;
              top: 30px;
              left: calc(50% + 30px);
              width: calc(100% - 60px);
              height: 2px;
              background-color: var(--color-text-tertiary);
            "></div>
          ` : ''}
        </div>
        `;
      })
      .join('');

    const html = `
<div class="slide" style="
  background-color: var(--color-background);
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  padding: ${this.ctx.spacing.padding}px;
  display: flex;
  flex-direction: column;
">
  <!-- Accent Bar + Title -->
  <div>
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: var(--color-primary);
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: var(--color-text-primary);
      font-size: ${this.ctx.fonts.size.heading}px;
      font-family: var(--font-family-base);
      font-weight: bold;
      margin: 0 0 ${this.ctx.spacing.gapSmall}px 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Timeline -->
  <div style="flex: 1; display: flex; align-items: center; justify-content: center;">
    <div style="
      width: 100%;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
    ">
      ${timelineItems}
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 13. Feature Grid Slide (기능 그리드 슬라이드)
   *
   * 3열 그리드 레이아웃으로 기능 카드를 표시
   */
  renderFeatureGrid(slide: FeatureGridSlide): HTMLSlide {
    const { title, features } = slide.props;

    // 기능 카드 생성 (빈 배열 방어)
    const featureCards = (features || [])
      .map((feature) => {
        const iconType = feature.iconType || 'emoji';

        // 아이콘 렌더링 (이모지 vs 이미지)
        const iconHtml =
          iconType === 'image'
            ? `<img src="${feature.icon}" alt="아이콘" style="width: 80px; height: 80px; object-fit: contain; margin-bottom: 20px;" />`
            : `<div style="font-size: 44px; line-height: 1; margin-bottom: 20px; color: ${this.ctx.colors.primary};">${this.escapeHtml(feature.icon)}</div>`;

        return `
      <div style="min-height: 280px; background: ${this.ctx.colors.lightBg}; padding: 30px 25px; border-radius: ${this.ctx.borderRadius.medium}px; text-align: center; border-top: 4px solid ${this.ctx.colors.primary}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center;">
        ${iconHtml}
        <h4 style="font-size: ${this.ctx.fonts.size.subtitle}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 12px 0; height: 2.4em; line-height: 1.2;">${this.escapeHtml(feature.title)}</h4>
        <p style="font-size: 15px; color: ${this.ctx.colors.textSecondary}; line-height: 1.6; margin: 0;">${this.escapeHtml(feature.description)}</p>
      </div>
    `;
      })
      .join('');

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Feature Grid (3-column) -->
  <div style="
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: ${this.ctx.spacing.gap}px;
    align-items: stretch;
    padding: ${this.ctx.spacing.gap}px;
    padding-top: ${this.ctx.spacing.gapSmall}px;
    margin-top: auto;
    margin-bottom: auto;
  ">
    ${featureCards}
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 14. Team Profile Slide (팀 프로필 슬라이드)
   *
   * 유동적인 그리드로 팀원 프로필을 표시 (1-6명 최적화)
   */
  renderTeamProfile(slide: TeamProfileSlide): HTMLSlide {
    const { title, profiles } = slide.props;

    // 빈 프로필 방어 (에러 방지용)
    const allProfiles = profiles || [];

    // 최대 6명으로 제한
    const safeProfiles = allProfiles.slice(0, 6);
    const hasOverflow = allProfiles.length > 6;

    // 프로필 개수에 따른 그리드 컬럼 계산
    const profileCount = safeProfiles.length;
    const columns =
      profileCount <= 3 ? profileCount : 3; // 최대 3컬럼

    // 경고 메시지 (6명 초과 시)
    const overflowWarning = hasOverflow
      ? `<div style="background: #FFF4E5; border: 1px solid #FFB020; border-radius: 8px; padding: 12px; margin-bottom: 16px; text-align: center;">
          <p style="margin: 0; font-size: 14px; color: #D97706;">
            ⚠️ 팀 프로필은 최대 6명까지 표시해요 (현재 ${allProfiles.length}명 중 6명 표시)
          </p>
        </div>`
      : '';

    // 프로필 카드 생성 (최적화: 높이 및 크기 줄임)
    const profileCards = safeProfiles
      .map(
        (profile) => `
      <div style="min-height: 260px; text-align: center; display: flex; flex-direction: column; align-items: center;">
        <img src="${this.escapeHtml(profile.image || `https://placehold.co/120x120/${this.ctx.colors.primary.replace('#', '')}/FFFFFF?text=P&font=sans-serif`)}" alt="${this.escapeHtml(profile.name)}" style="width: 120px; height: 120px; border-radius: ${this.ctx.borderRadius.circle}; object-fit: cover; margin-bottom: 16px; border: 3px solid ${this.ctx.colors.lightBg}; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h4 style="font-size: ${this.ctx.fonts.size.subtitle - 2}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 4px 0;">${this.escapeHtml(profile.name)}</h4>
        <p style="font-size: 15px; color: ${this.ctx.colors.primary}; font-weight: 500; margin: 0 0 10px 0;">${this.escapeHtml(profile.role)}</p>
        <p style="font-size: 13px; color: ${this.ctx.colors.textSecondary}; line-height: 1.4; margin: 0; max-width: 220px;">${this.escapeHtml(profile.bio)}</p>
      </div>
    `
      )
      .join('');

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Overflow Warning -->
  ${overflowWarning}

  <!-- Profiles Grid (최대 3컬럼, 6명까지) -->
  <div style="
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${Math.max(this.ctx.spacing.gap - 10, 24)}px;
      align-items: start;
      width: 100%;
    ">
      ${profileCards}
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 15. Process Slide (프로세스 슬라이드)
   *
   * 세로 플로우 형태의 프로세스 단계 표시
   */
  renderProcess(slide: ProcessSlide): HTMLSlide {
    const { title, steps } = slide.props;

    // 프로세스 스텝 생성 (빈 배열 방어)
    const safeSteps = (steps || []);
    const processSteps = safeSteps
      .map((step, index) => {
        const isLast = index === safeSteps.length - 1;
        return `
      <!-- Step ${index + 1} -->
      <div style="display: flex; align-items: center; width: 80%; margin: 0 auto;">
        <div style="width: 50px; height: 50px; border-radius: ${this.ctx.borderRadius.circle}; background-color: ${this.ctx.colors.primary}; color: ${this.ctx.colors.white}; font-size: 20px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-right: 25px;">${index + 1}</div>
        <div style="flex: 1; background: ${this.ctx.colors.lightBg}; padding: 20px 25px; border-radius: ${this.ctx.borderRadius.medium}px; border-left: 4px solid ${this.ctx.colors.primary};">
          <h4 style="font-size: ${this.ctx.fonts.size.subtitle}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 8px 0;">${this.escapeHtml(step.title)}</h4>
          <p style="font-size: 16px; color: ${this.ctx.colors.textSecondary}; line-height: 1.5; margin: 0;">${this.escapeHtml(step.description)}</p>
        </div>
      </div>
      ${
        !isLast
          ? `<div style="height: 40px; width: 2px; background-color: ${this.ctx.colors.border}; margin-left: calc(40% + 24px); opacity: 0.6;"></div>`
          : ''
      }
    `;
      })
      .join('');

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Vertical Process Flow -->
  <div style="
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow-y: auto;
    padding: 20px 0;
    margin-top: auto;
    margin-bottom: auto;
  ">
    ${processSteps}
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 16. Roadmap Slide (로드맵 슬라이드)
   *
   * 타임라인 형태의 로드맵 표시
   */
  renderRoadmap(slide: RoadmapSlide): HTMLSlide {
    const { title, items } = slide.props;

    // 로드맵 아이템 생성 (빈 배열 방어)
    const safeItems = (items || []);
    const roadmapItems = safeItems
      .map((item, index) => {
        const isLast = index === safeItems.length - 1;
        const isInProgress = item.status.toLowerCase().includes('progress');
        const nodeColor = isInProgress
          ? this.ctx.colors.primary
          : this.ctx.colors.border;
        const borderColor = isInProgress
          ? this.ctx.colors.primary
          : this.ctx.colors.border;
        const statusColor = isInProgress
          ? this.ctx.colors.primary
          : this.ctx.colors.border;

        return `
      <div style="display: flex; align-items: flex-start; width: 100%; margin-bottom: 20px;">
        <div style="flex: 0 0 160px; padding-right: 25px; text-align: right;">
          <h4 style="font-size: 18px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 5px 0 0 0;">${this.escapeHtml(item.period)}</h4>
          <span style="font-size: 14px; font-weight: 500; color: ${statusColor};">${this.escapeHtml(item.status)}</span>
        </div>
        <div style="flex: 0 0 40px; display: flex; flex-direction: column; align-items: center;">
          <div style="width: 20px; height: 20px; border-radius: ${this.ctx.borderRadius.circle}; background-color: ${nodeColor}; border: 4px solid ${this.ctx.colors.lightBg}; flex-shrink: 0;"></div>
          ${!isLast ? `<div style="width: 2px; height: 100%; min-height: 80px; background-color: ${this.ctx.colors.border}; margin-top: 5px;"></div>` : ''}
        </div>
        <div style="flex: 1; background: ${this.ctx.colors.lightBg}; border-radius: ${this.ctx.borderRadius.medium}px; padding: 20px 25px; margin-top: -5px; border-left: 4px solid ${borderColor};">
          <h5 style="font-size: ${this.ctx.fonts.size.subtitle}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 8px 0;">${this.escapeHtml(item.title)}</h5>
          <p style="font-size: 15px; color: ${this.ctx.colors.textSecondary}; line-height: 1.6; margin: 0;">${this.escapeHtml(item.description)}</p>
        </div>
      </div>
    `;
      })
      .join('');

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Roadmap Timeline -->
  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; padding: ${this.ctx.spacing.gap}px; padding-top: 0;">
    <div style="width: 100%; max-width: 900px;">
      ${roadmapItems}
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 17. Pricing Slide (가격표 슬라이드)
   *
   * 3열 가격표 레이아웃
   */
  renderPricing(slide: PricingSlide): HTMLSlide {
    const { title, tiers } = slide.props;

    // 가격표 티어 생성 (빈 배열 방어)
    const pricingTiers = (tiers || [])
      .map((tier) => {
        const isRecommended = tier.recommended || false;
        const headerBg = isRecommended
          ? this.ctx.colors.primary
          : this.ctx.colors.lightBg;
        const headerColor = isRecommended
          ? this.ctx.colors.white
          : this.ctx.colors.text;
        const borderColor = isRecommended
          ? this.ctx.colors.primary
          : this.ctx.colors.border;

        // 빈 features 방어 (에러 방지용)
        const featureList = (tier.features || [])
          .map(
            (feature) => `
          <li style="display: flex; align-items: flex-start; font-size: 15px; color: ${this.ctx.colors.textSecondary}; margin-bottom: 12px;">
            <span style="color: ${this.ctx.colors.primary}; margin-right: 12px; font-size: 18px; line-height: 1.2;">✓</span>
            <span>${this.escapeHtml(feature)}</span>
          </li>
        `
          )
          .join('');

        return `
      <div style="flex: 1; min-height: 420px; border-radius: ${this.ctx.borderRadius.large}px; border: 2px solid ${borderColor}; background: ${this.ctx.colors.lightBg}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
        <div style="padding: 20px; text-align: center; background: ${headerBg}; color: ${headerColor}; border-radius: 10px 10px 0 0;">
          <h4 style="font-size: 22px; font-weight: 700; margin: 0; color: inherit;">${this.escapeHtml(tier.name)}</h4>
        </div>
        <div style="padding: 30px 25px; flex: 1; display: flex; flex-direction: column;">
          <div style="text-align: center; margin-bottom: 25px; padding-bottom: 25px; border-bottom: 1px solid ${this.ctx.colors.border};">
            <span style="font-size: 38px; font-weight: 700; color: ${this.ctx.colors.text};">${this.escapeHtml(tier.price)}</span>
            <span style="font-size: 16px; color: ${this.ctx.colors.textSecondary}; margin-left: 4px;">${this.escapeHtml(tier.period)}</span>
            <p style="font-size: 15px; color: ${this.ctx.colors.textSecondary}; margin: 10px 0 0 0;">${this.escapeHtml(tier.description)}</p>
          </div>
          <ul style="list-style: none; padding: 0; margin: 0; flex: 1;">
            ${featureList}
          </ul>
        </div>
      </div>
    `;
      })
      .join('');

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Pricing Table Grid (3 Columns) -->
  <div style="
    flex: 1;
    display: flex;
    gap: ${this.ctx.spacing.gap}px;
    align-items: stretch;
    justify-content: center;
    padding-top: 20px;
  ">
    ${pricingTiers}
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 18. Image Text Slide (이미지+텍스트 슬라이드)
   *
   * 이미지와 텍스트를 좌우로 배치
   */
  renderImageText(slide: ImageTextSlide): HTMLSlide {
    const { title, image, imagePosition, bullets } = slide.props;

    // 불릿 리스트 생성 (빈 배열 방어)
    const bulletList = (bullets || [])
      .map(
        (bullet) => `
      <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
        <span style="color: ${this.ctx.colors.primary}; margin-right: 12px; font-size: ${this.ctx.spacing.iconSize}px; line-height: 1.4;">${this.getIcon(slide.style.bullets?.iconType)}</span>
        <span style="color: ${this.ctx.colors.textSecondary}; font-size: ${this.ctx.fonts.size.body}px; line-height: 1.6;">${this.escapeHtml(bullet)}</span>
      </li>
    `
      )
      .join('');

    const flexDirection =
      imagePosition === 'right' ? 'row-reverse' : 'row';

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Image + Text Layout -->
  <div style="
    flex: 1;
    display: flex;
    flex-direction: ${flexDirection};
    gap: ${this.ctx.spacing.gap}px;
    align-items: center;
    padding-top: 20px;
  ">
    <!-- Image Column (55%) -->
    <div style="flex: 1.2; height: 100%;">
      ${image ? `
      <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: contain; border-radius: ${this.ctx.borderRadius.medium}px; background: ${this.ctx.colors.lightBg};">
      ` : `
      <!-- Image Placeholder -->
      <div style="
        width: 100%;
        height: 100%;
        border: 2px dashed #e0e0e0;
        border-radius: ${this.ctx.borderRadius.medium}px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: ${this.ctx.colors.lightBg};
      ">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" style="margin-bottom: 10px;">
          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
          <circle cx="12" cy="13" r="4"></circle>
        </svg>
        <p style="
          color: #9e9e9e;
          font-size: 16px;
          margin: 0;
          font-family: ${this.ctx.fonts.main};
        ">이미지를 추가하세요</p>
      </div>
      `}
    </div>
    <!-- Text Column (45%) -->
    <div style="flex: 1; height: 100%; display: flex; flex-direction: column; justify-content: center;">
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${bulletList}
      </ul>
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 19. Agenda Slide (아젠다 슬라이드)
   *
   * 번호 매기기 형식의 아젠다 리스트
   */
  renderAgenda(slide: AgendaSlide): HTMLSlide {
    const { title, items } = slide.props;

    // ✅ 아젠다 아이템 생성 (최대 8개), 빈 배열 방어
    const safeItems = (items || []).slice(0, 8);
    const itemCount = safeItems.length;

    // ✅ 5개 이상이면 2열, 4개 이하면 1열
    const useGrid = itemCount > 4;

    const agendaItems = safeItems
      .map((item, index) => {
        const number = String(index + 1).padStart(2, '0');

        // ✅ 2열일 때는 border 제거, 1열일 때만 border
        const isLastInColumn = useGrid ? false : (index === safeItems.length - 1);
        const borderStyle = isLastInColumn ? 'none' : `1px solid ${this.ctx.colors.border}`;

        return `
      <div style="
        display: flex;
        align-items: flex-start;
        width: 100%;
        padding-bottom: ${useGrid ? '20px' : this.ctx.spacing.gap + 'px'};
        margin-bottom: ${useGrid ? '20px' : this.ctx.spacing.gap + 'px'};
        border-bottom: ${borderStyle};
      ">
        <div style="flex: 0 0 ${useGrid ? '60px' : '80px'}; font-size: ${useGrid ? '24px' : '28px'}; font-weight: 700; color: ${this.ctx.colors.primary}; line-height: 1.2;">${number}</div>
        <div style="flex: 1;">
          <h4 style="font-size: ${useGrid ? '20px' : this.ctx.fonts.size.subtitle + 'px'}; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 6px 0; line-height: 1.2;">${this.escapeHtml(item.title)}</h4>
          <p style="font-size: ${useGrid ? '14px' : '16px'}; color: ${this.ctx.colors.textSecondary}; line-height: 1.5; margin: 0;">${this.escapeHtml(item.description)}</p>
        </div>
      </div>
    `;
      })
      .join('');

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
  overflow: hidden;
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${useGrid ? this.ctx.spacing.gap : 50}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Agenda List (1열 또는 2열) -->
  <div style="
    flex: 1;
    display: ${useGrid ? 'grid' : 'flex'};
    ${useGrid ? 'grid-template-columns: 1fr 1fr; gap: 30px; align-content: center;' : 'flex-direction: column; justify-content: center;'}
  ">
    ${agendaItems}
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 20. Testimonial Slide (추천사 슬라이드)
   *
   * 인용구 형식의 추천사 카드
   */
  renderTestimonial(slide: TestimonialSlide): HTMLSlide {
    const { title, quote, author, role, image } = slide.props;

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Testimonial Card -->
  <div style="flex: 1; display: flex; align-items: center; justify-content: center; padding-bottom: 20px;">
    <div style="background: ${this.ctx.colors.lightBg}; border-radius: ${this.ctx.borderRadius.large}px; padding: 50px 60px; max-width: 900px; width: 100%; text-align: center; border-top: 5px solid ${this.ctx.colors.primary}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); position: relative;">
      <div style="color: ${this.ctx.colors.primary}; font-size: 72px; font-family: ${this.ctx.fonts.serif}; opacity: 0.2; position: absolute; top: 20px; left: 40px; line-height: 1;">"</div>
      <blockquote style="color: ${this.ctx.colors.text}; font-size: 26px; font-family: ${this.ctx.fonts.serif}; font-style: italic; line-height: 1.6; margin: 20px 0 30px 0;">"${this.escapeHtml(quote)}"</blockquote>
      <div style="display: flex; align-items: center; justify-content: center;">
        <img src="${this.escapeHtml(image || `https://placehold.co/60x60/${this.ctx.colors.text.replace('#', '')}/FFFFFF?text=A&font=sans-serif`)}" alt="${this.escapeHtml(author)}" style="width: 60px; height: 60px; border-radius: ${this.ctx.borderRadius.circle}; object-fit: cover; margin-right: 20px; border: 3px solid ${this.ctx.colors.white}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div>
          <div style="font-size: ${this.ctx.fonts.size.subtitle}px; font-weight: 700; color: ${this.ctx.colors.text}; text-align: left;">${this.escapeHtml(author)}</div>
          <div style="font-size: 16px; color: ${this.ctx.colors.textSecondary}; text-align: left;">${this.escapeHtml(role)}</div>
        </div>
      </div>
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 21. Gallery Slide (갤러리 슬라이드)
   *
   * 이미지 개수에 따라 반응형 그리드 레이아웃
   * - 1-3장: 1행 n열
   * - 4장: 2행 2열
   * - 5-6장: 2행 3열
   * - 7-9장: 3행 3열
   * - 10-12장: 3행 4열
   */
  renderGallery(slide: GallerySlide): HTMLSlide {
    const { title, images } = slide.props;

    // 이미지 개수에 따른 그리드 레이아웃 결정
    const imageCount = (images || []).length;
    let gridColumns = 2;
    let gridRows = 2;
    let maxImages = 4;

    if (imageCount === 0) {
      // 이미지 없음 - 기본 2x2
      gridColumns = 2;
      gridRows = 2;
      maxImages = 4;
    } else if (imageCount <= 3) {
      // 1-3장: 1행 n열
      gridRows = 1;
      gridColumns = imageCount;
      maxImages = imageCount;
    } else if (imageCount === 4) {
      // 4장: 2행 2열
      gridRows = 2;
      gridColumns = 2;
      maxImages = 4;
    } else if (imageCount <= 6) {
      // 5-6장: 2행 3열
      gridRows = 2;
      gridColumns = 3;
      maxImages = 6;
    } else if (imageCount <= 9) {
      // 7-9장: 3행 3열
      gridRows = 3;
      gridColumns = 3;
      maxImages = 9;
    } else {
      // 10장 이상: 3행 4열 (최대 12장)
      gridRows = 3;
      gridColumns = 4;
      maxImages = 12;
    }

    // 이미지가 없으면 플레이스홀더용 더미 객체 생성
    const imagesToRender = imageCount === 0
      ? Array(maxImages).fill({ url: '', caption: '이미지 추가' })
      : (images || []).slice(0, maxImages);

    // 이미지 카드 생성
    const imageCards = imagesToRender.map(
        (img) => `
      <div style="
        font-family: ${this.ctx.fonts.main};
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      ">
        ${img.url ? `
        <img src="${this.escapeHtml(img.url)}" alt="${this.escapeHtml(img.caption)}" style="
          width: 100%;
          height: calc(100% - 30px);
          object-fit: cover;
          border-radius: ${this.ctx.borderRadius.medium}px;
          margin-bottom: 8px;
          background: ${this.ctx.colors.lightBg};
        ">
        ` : `
        <!-- Image Placeholder -->
        <div style="
          width: 100%;
          height: calc(100% - 30px);
          border: 2px dashed #e0e0e0;
          border-radius: ${this.ctx.borderRadius.medium}px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${this.ctx.colors.lightBg};
          margin-bottom: 8px;
        ">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" style="margin-bottom: 8px;">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
            <circle cx="12" cy="13" r="4"></circle>
          </svg>
          <p style="
            color: #9e9e9e;
            font-size: 14px;
            margin: 0;
            font-family: ${this.ctx.fonts.main};
          ">이미지를 추가하세요</p>
        </div>
        `}
        <p style="
          font-size: ${this.ctx.fonts.size.caption}px;
          color: ${this.ctx.colors.textSecondary};
          text-align: center;
          margin: 0;
          height: 22px;
          line-height: 22px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        ">${this.escapeHtml(img.caption)}</p>
      </div>
    `
      )
      .join('');

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gap}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Gallery Grid (반응형: ${gridRows}행 ${gridColumns}열) -->
  <div style="
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  ">
    <div style="
      width: 100%;
      height: 100%;
      max-width: ${gridRows === 1 ? (gridColumns === 1 ? '600px' : '95%') : '95%'};
      display: grid;
      grid-template-columns: repeat(${gridColumns}, 1fr);
      grid-template-rows: repeat(${gridRows}, 1fr);
      gap: ${this.ctx.spacing.gap}px;
    ">
      ${imageCards}
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 22. Image Slide (이미지 슬라이드)
   *
   * 단독 이미지 표시 (전체 화면)
   */
  renderImage(slide: ImageSlide): HTMLSlide {
    const { title, image, caption } = slide.props;

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.bg};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Image Container -->
  <div style="
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 0;
  ">
    ${image ? `
    <div style="
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    ">
      <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title)}" style="
        max-width: 100%;
        max-height: ${caption ? 'calc(100% - 40px)' : '100%'};
        object-fit: contain;
        border-radius: ${this.ctx.borderRadius.medium}px;
      ">
      ${caption ? `
      <p style="
        font-size: ${this.ctx.fonts.size.body}px;
        color: ${this.ctx.colors.textSecondary};
        text-align: center;
        margin: 20px 0 0 0;
        max-width: 80%;
      ">${this.escapeHtml(caption)}</p>
      ` : ''}
    </div>
    ` : `
    <!-- Image Placeholder -->
    <div style="
      width: 80%;
      height: 80%;
      border: 2px dashed #e0e0e0;
      border-radius: ${this.ctx.borderRadius.medium}px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: ${this.ctx.colors.lightBg};
    ">
      <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#9e9e9e" stroke-width="2" style="margin-bottom: 16px;">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
        <circle cx="12" cy="13" r="4"></circle>
      </svg>
      <p style="
        color: #9e9e9e;
        font-size: 20px;
        margin: 0;
        font-family: ${this.ctx.fonts.main};
      ">이미지를 추가하세요</p>
    </div>
    `}
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 23. Report Two Column Slide (원페이지 보고서 - 2단 레이아웃)
   *
   * 16:9 비율의 원페이지 보고서 레이아웃
   * 좌측: 스크롤 가능한 텍스트 영역 (flex: 1.5)
   * 우측: 이미지 + 캡션 (flex: 1)
   */
  renderReportTwoColumn(slide: ReportTwoColumnSlide): HTMLSlide {
    // Backward compatibility: image -> images
    const props = slide.props as any;
    const imagesArray = props.images || (props.image ? [props.image] : undefined);
    const { title, sections, imageCaption, chart, table } = slide.props;
    const images = imagesArray;

    // sections 배열을 HTML로 변환
    const sectionsHtml = (sections || [])
      .map((section) => {
        let html = '';

        // Subtitle
        if (section.subtitle) {
          html += `
            <h4 style="
              font-size: ${this.ctx.fonts.size.subtitle}px;
              font-weight: 700;
              color: ${this.ctx.colors.text};
              margin: ${this.ctx.spacing.gap}px 0 ${this.ctx.spacing.gapSmall}px 0;
            ">${this.escapeHtml(section.subtitle)}</h4>
          `;
        }

        // Body
        if (section.body) {
          html += `
            <div style="
              font-size: 15px;
              color: ${this.ctx.colors.textSecondary};
              line-height: 1.6;
              margin-bottom: 14px;
            ">${this.escapeHtml(section.body).replace(/\n/g, '</p><p style="margin: 0 0 14px 0;">')}</div>
          `;
        }

        // Bullets
        if (section.bullets && section.bullets.length > 0) {
          const bulletsHtml = section.bullets
            .map(
              (bullet) => `
                <li style="
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 10px;
                ">
                  <span style="
                    color: ${this.ctx.colors.primary};
                    margin-right: 10px;
                    font-size: ${this.ctx.spacing.iconSize}px;
                    line-height: 1.4;
                  ">→</span>
                  <span>${this.escapeHtml(bullet)}</span>
                </li>
              `
            )
            .join('');

          html += `
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0;
              font-size: 15px;
              color: ${this.ctx.colors.textSecondary};
              line-height: 1.6;
            ">
              ${bulletsHtml}
            </ul>
          `;
        }

        return html;
      })
      .join('');

    // 이미지 HTML 생성 (최대 2개, 좌우 그리드 배치)
    let imagesHtml = '';
    if (images && images.length > 0) {
      const imageCount = Math.min(images.length, 2);
      const gridStyle = imageCount === 1 ? 'display: block;' : `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      `;

      imagesHtml = `
        <div style="${gridStyle} margin-bottom: 12px;">
          ${images.slice(0, 2).map((img: string) => `
            <img src="${this.escapeHtml(img)}" alt="${this.escapeHtml(imageCaption || '')}" style="
              width: 100%;
              height: auto;
              max-height: 200px;
              object-fit: cover;
              border-radius: ${this.ctx.borderRadius.medium}px;
              background: ${this.ctx.colors.lightBg};
            ">
          `).join('')}
        </div>
        ${imageCaption ? `
          <figcaption style="
            font-size: ${this.ctx.fonts.size.caption}px;
            color: ${this.ctx.colors.textSecondary};
            text-align: center;
            margin-bottom: 12px;
          ">${this.escapeHtml(imageCaption)}</figcaption>
        ` : ''}
      `;
    }

    // 차트 HTML (옵션)
    const chartHtml = chart && Array.isArray(chart.data) && chart.data.length > 0 ? (() => {
      // 데이터 유효성 검사 및 정규화
      const validData = chart.data.filter(item => item && typeof item.label === 'string' && typeof item.value === 'number');
      if (validData.length === 0) return '';

      const maxValue = Math.max(...validData.map(d => d.value));
      const chartType = chart.type || 'bar';

      return `
        <div style="
          padding: 14px;
          background: ${this.ctx.colors.lightBg};
          border-radius: ${this.ctx.borderRadius.medium}px;
          margin-bottom: 12px;
        ">
          ${chart.title ? `<h5 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: ${this.ctx.colors.text};">${this.escapeHtml(chart.title)}</h5>` : ''}
          <div style="display: flex; flex-direction: column; gap: 7px;">
            ${validData.map(item => `
              <div style="display: flex; align-items: center; gap: 8px; font-size: 13px;">
                <span style="min-width: 65px; color: ${this.ctx.colors.textSecondary}; font-weight: 500;">${this.escapeHtml(item.label)}</span>
                <div style="flex: 1; background: ${this.ctx.colors.white}; height: 22px; border-radius: 4px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  <div style="
                    width: ${(item.value / maxValue) * 100}%;
                    height: 100%;
                    background: ${this.ctx.colors.primary};
                    display: flex;
                    align-items: center;
                    padding-left: 6px;
                    transition: width 0.3s ease;
                  ">
                    <span style="color: white; font-size: 12px; font-weight: 600;">${item.value}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    })() : '';

    // 표 HTML (옵션)
    const tableHtml = table ? `
      <div style="margin-bottom: 12px;">
        ${table.title ? `<h5 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700;">${this.escapeHtml(table.title)}</h5>` : ''}
        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
          <thead>
            <tr style="background: ${this.ctx.colors.lightBg};">
              ${table.headers.map(h => `<th style="padding: 8px; text-align: left; border-bottom: 2px solid ${this.ctx.colors.border};">${this.escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${table.rows.map(row => `
              <tr>
                ${row.map(cell => `<td style="padding: 8px; border-bottom: 1px solid ${this.ctx.colors.border};">${this.escapeHtml(cell)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    const html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.white};
  display: flex;
  flex-direction: column;
  padding: ${this.ctx.spacing.padding}px;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar + Title -->
  <div style="margin-bottom: ${this.ctx.spacing.gap}px;">
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: ${this.ctx.colors.primary};
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>
    <h3 style="
      color: ${this.ctx.colors.text};
      font-size: ${this.ctx.fonts.size.heading}px;
      font-weight: 700;
      margin: 0;
    ">${this.escapeHtml(title)}</h3>
  </div>

  <!-- Content Area (2-Column Layout) -->
  <div style="
    flex: 1;
    display: flex;
    gap: ${this.ctx.spacing.gap}px;
    overflow: hidden;
    min-height: 0;
  ">
    <!-- Text Column (Left) -->
    <div style="flex: 1.5; display: flex; flex-direction: column; min-height: 0;">
      <div style="overflow-y: auto; flex: 1;">
        ${sectionsHtml}
      </div>
    </div>

    <!-- Visual Column (Right) - Images, Chart, Table -->
    <div style="flex: 1; display: flex; flex-direction: column; overflow-y: auto;">
      ${imagesHtml}
      ${chartHtml}
      ${tableHtml}
      ${!images && !chart && !table ? `
        <div style="
          width: 100%;
          flex: 1;
          border: 2px dashed ${this.ctx.colors.border};
          border-radius: ${this.ctx.borderRadius.medium}px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: ${this.ctx.colors.lightBg};
        ">
          <p style="
            color: ${this.ctx.colors.textSecondary};
            font-size: 18px;
            margin: 0;
          ">이미지를 추가하세요</p>
        </div>
      ` : ''}
    </div>
  </div>
</div>
    `.trim();

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 24. Report A4 Slide (원페이지 보고서 - A4 용지)
   *
   * A4-portrait 비율: 전체 슬라이드를 A4 용지로 사용
   * 16:9 비율: 회색 배경 + 중앙 정렬된 A4 용지 시뮬레이션
   */
  renderReportA4(slide: ReportA4Slide): HTMLSlide {
    // Backward compatibility: image -> images
    const props = slide.props as any;
    const imagesArray = props.images || (props.image ? [props.image] : undefined);
    const { title, subtitle, sections, chart, table, imageCaption } = slide.props;
    const images = imagesArray;
    const { width, height } = this.ctx.slideSize;

    // A4-portrait 비율 확인 (height/width ≈ 1.414, 여유를 두어 1.3 이상)
    const isA4Portrait = height / width > 1.3;

    // sections 배열을 HTML로 변환 (공통)
    const sectionsHtml = (sections || [])
      .map((section, index) => {
        let html = '';

        // Subtitle
        if (section.subtitle) {
          html += `
            <h3 style="
              font-size: 16px;
              font-weight: 700;
              color: ${this.ctx.colors.text};
              margin: ${index > 0 ? '24px' : this.ctx.spacing.gapSmall + 'px'} 0 ${this.ctx.spacing.gapSmall}px 0;
            ">${this.escapeHtml(section.subtitle)}</h3>
          `;
        }

        // Body
        if (section.body) {
          html += `
            <div style="
              font-size: 14px;
              color: ${this.ctx.colors.text};
              line-height: 1.6;
              margin-bottom: 16px;
            ">${this.escapeHtml(section.body).replace(/\n/g, '</p><p style="margin: 0 0 16px 0;">')}</div>
          `;
        }

        // Bullets
        if (section.bullets && section.bullets.length > 0) {
          const bulletsHtml = section.bullets
            .map(
              (bullet) => `
                <li style="
                  display: flex;
                  align-items: flex-start;
                  margin-bottom: 10px;
                ">
                  <span style="
                    color: ${this.ctx.colors.primary};
                    margin-right: 10px;
                    font-size: 16px;
                    line-height: 1.4;
                  ">•</span>
                  <span>${this.escapeHtml(bullet)}</span>
                </li>
              `
            )
            .join('');

          html += `
            <ul style="
              list-style: none;
              padding: 0;
              margin: 0 0 16px 0;
              font-size: 14px;
              color: ${this.ctx.colors.textSecondary};
              line-height: 1.6;
            ">
              ${bulletsHtml}
            </ul>
          `;
        }

        return html;
      })
      .join('');

    // 이미지 그리드 HTML 생성 (최대 2개, 반응형)
    let imagesHtml = '';
    if (images && images.length > 0) {
      const imageCount = Math.min(images.length, 2);
      const gridStyle = imageCount === 1 ? 'display: block;' : `
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      `;

      imagesHtml = `
        <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
          <div style="${gridStyle} margin-bottom: ${imageCaption ? '8px' : '0'};">
            ${images.slice(0, 2).map((img: string) => `
              <img src="${this.escapeHtml(img)}" alt="${this.escapeHtml(title)}" style="
                width: 100%;
                height: auto;
                max-height: ${isA4Portrait ? '300px' : '180px'};
                object-fit: cover;
                border-radius: ${this.ctx.borderRadius.medium}px;
              ">
            `).join('')}
          </div>
          ${imageCaption ? `
            <p style="
              font-size: 12px;
              color: ${this.ctx.colors.textSecondary};
              margin: 0;
              font-style: italic;
              text-align: center;
            ">${this.escapeHtml(imageCaption)}</p>
          ` : ''}
        </div>
      `;
    }

    // 차트 HTML (옵션)
    const chartHtml = chart && Array.isArray(chart.data) && chart.data.length > 0 ? (() => {
      // 데이터 유효성 검사 및 정규화
      const validData = chart.data.filter(item => item && typeof item.label === 'string' && typeof item.value === 'number');
      if (validData.length === 0) return '';

      const maxValue = Math.max(...validData.map(d => d.value));
      const chartType = chart.type || 'bar';

      return `
        <div style="
          padding: 12px;
          background: ${this.ctx.colors.lightBg};
          border-radius: ${this.ctx.borderRadius.medium}px;
          margin-bottom: ${this.ctx.spacing.gapSmall}px;
        ">
          ${chart.title ? `<h5 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: ${this.ctx.colors.text};">${this.escapeHtml(chart.title)}</h5>` : ''}
          <div style="display: flex; flex-direction: column; gap: 5px;">
            ${validData.map(item => `
              <div style="display: flex; align-items: center; gap: 6px; font-size: 11px;">
                <span style="min-width: 55px; color: ${this.ctx.colors.textSecondary}; font-weight: 500;">${this.escapeHtml(item.label)}</span>
                <div style="flex: 1; background: ${this.ctx.colors.white}; height: 18px; border-radius: 3px; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                  <div style="
                    width: ${(item.value / maxValue) * 100}%;
                    height: 100%;
                    background: ${this.ctx.colors.primary};
                    display: flex;
                    align-items: center;
                    padding-left: 4px;
                    transition: width 0.3s ease;
                  ">
                    <span style="color: white; font-size: 10px; font-weight: 600;">${item.value}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    })() : '';

    // 표 HTML (옵션)
    const tableHtml = table ? `
      <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
        ${table.title ? `<h5 style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700;">${this.escapeHtml(table.title)}</h5>` : ''}
        <table style="width: 100%; border-collapse: collapse; font-size: 12px;">
          <thead>
            <tr style="background: ${this.ctx.colors.lightBg};">
              ${table.headers.map(h => `<th style="padding: 6px; text-align: left; border-bottom: 2px solid ${this.ctx.colors.border};">${this.escapeHtml(h)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${table.rows.map(row => `
              <tr>
                ${row.map(cell => `<td style="padding: 6px; border-bottom: 1px solid ${this.ctx.colors.border};">${this.escapeHtml(cell)}</td>`).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : '';

    let html: string;

    if (isA4Portrait) {
      // A4-portrait 비율: 전체 슬라이드를 A4 용지로 사용
      html = `
<div style="
  width: ${width}px;
  height: ${height}px;
  background: ${this.ctx.colors.white};
  padding: 60px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  font-family: ${this.ctx.fonts.main};
">
  <!-- Accent Bar -->
  <div style="
    width: ${this.ctx.spacing.accentBar.width}px;
    height: ${this.ctx.spacing.accentBar.height}px;
    background-color: ${this.ctx.colors.primary};
    margin-bottom: ${this.ctx.spacing.gapSmall}px;
  "></div>

  <!-- Title -->
  <h1 style="
    font-size: 32px;
    font-weight: 700;
    color: ${this.ctx.colors.text};
    margin: 0 0 10px 0;
  ">${this.escapeHtml(title)}</h1>

  <!-- Subtitle -->
  <h2 style="
    font-size: 20px;
    font-weight: 500;
    color: ${this.ctx.colors.textSecondary};
    margin: 0 0 32px 0;
  ">${this.escapeHtml(subtitle)}</h2>

  <!-- Images (반응형 그리드: 1개=100%, 2개=50% grid) -->
  ${imagesHtml}

  <!-- Scrollable Content Area -->
  <div style="flex: 1; overflow-y: auto; min-height: 0;">
    ${sectionsHtml}
    ${chartHtml}
    ${tableHtml}
  </div>
</div>
      `.trim();
    } else {
      // 16:9 비율: 회색 배경 + 중앙 정렬된 A4 용지 시뮬레이션
      html = `
<div style="
  width: 100%;
  height: 100%;
  background: ${this.ctx.colors.textSecondary};
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  font-family: ${this.ctx.fonts.main};
">
  <!-- A4 Paper Simulation -->
  <div style="
    width: 460px;
    height: 650px;
    background-color: ${this.ctx.colors.white};
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    border-radius: 3px;
    padding: 40px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  ">
    <!-- Accent Bar -->
    <div style="
      width: ${this.ctx.spacing.accentBar.width}px;
      height: ${this.ctx.spacing.accentBar.height}px;
      background-color: ${this.ctx.colors.primary};
      margin-bottom: ${this.ctx.spacing.gapSmall}px;
    "></div>

    <!-- Title -->
    <h1 style="
      font-size: 26px;
      font-weight: 700;
      color: ${this.ctx.colors.text};
      margin: 0 0 5px 0;
    ">${this.escapeHtml(title)}</h1>

    <!-- Subtitle -->
    <h2 style="
      font-size: 18px;
      font-weight: 500;
      color: ${this.ctx.colors.textSecondary};
      margin: 0 0 28px 0;
    ">${this.escapeHtml(subtitle)}</h2>

    <!-- Images (반응형 그리드: 1개=100%, 2개=50% grid) -->
    ${imagesHtml}

    <!-- Scrollable Content Area -->
    <div style="flex: 1; overflow-y: auto; min-height: 0;">
      ${sectionsHtml}
      ${chartHtml}
      ${tableHtml}
    </div>
  </div>
</div>
      `.trim();
    }

    const css = this.generateCSSVariables();
    return { html, css };
  }

  /**
   * 불릿 아이콘 선택 헬퍼 함수
   *
   * iconType에 따라 적절한 아이콘 문자열 반환
   * @param iconType - 'arrow', 'dot', 'check' 중 하나 (기본값: 'arrow')
   */
  private getIcon(iconType?: 'arrow' | 'dot' | 'check'): string {
    const iconMap = {
      arrow: '→',
      dot: '•',
      check: '✓',
    };
    return iconMap[iconType || 'arrow'];
  }

  /**
   * HTML 이스케이프 헬퍼 함수
   *
   * XSS 방지를 위한 HTML 특수문자 이스케이프
   */
  private escapeHtml(text: string | undefined | null): string {
    // 빈 값 방어 (에러 방지용)
    if (text === undefined || text === null || typeof text !== 'string') {
      return '';
    }

    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };

    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * CSS 변수 시스템 생성
   *
   * StyleTheme의 모든 디자인 토큰을 CSS 변수로 변환하여 일관성 있는 스타일링 제공
   */
  private generateCSSVariables(): string {
    const t = this.theme;

    return `
:root {
  /* ===== 색상 시스템 (19 variables) ===== */
  --color-primary: ${t.colors.primary};
  --color-secondary: ${t.colors.secondary};
  --color-accent: ${t.colors.accent};
  --color-background: ${t.colors.background};
  --color-surface: ${t.colors.surface};
  --color-surface-elevated: ${t.colors.surfaceElevated};
  --color-text: ${t.colors.text};
  --color-text-secondary: ${t.colors.textSecondary};
  --color-text-muted: ${t.colors.textMuted};
  --color-error: ${t.colors.error};
  --color-success: ${t.colors.success};
  --color-warning: ${t.colors.warning};
  --color-info: ${t.colors.info};
  --color-border: ${t.colors.border};
  --color-border-light: ${t.colors.borderLight};
  --color-input: ${t.colors.input};
  --color-ring: ${t.colors.ring};
  --color-highlight: ${t.colors.highlight};
  --color-overlay: ${t.colors.overlay};

  /* ===== 타이포그래피 (26 variables) ===== */
  /* Font Family */
  --font-family-primary: ${t.typography.fontFamily.primary};
  --font-family-secondary: ${t.typography.fontFamily.secondary || t.typography.fontFamily.primary};
  --font-family-monospace: ${t.typography.fontFamily.monospace};

  /* Font Size */
  --font-size-xs: ${t.typography.fontSize.xs};
  --font-size-sm: ${t.typography.fontSize.sm};
  --font-size-base: ${t.typography.fontSize.base};
  --font-size-lg: ${t.typography.fontSize.lg};
  --font-size-xl: ${t.typography.fontSize.xl};
  --font-size-2xl: ${t.typography.fontSize['2xl']};
  --font-size-3xl: ${t.typography.fontSize['3xl']};
  --font-size-4xl: ${t.typography.fontSize['4xl']};

  /* Font Weight */
  --font-weight-light: ${t.typography.fontWeight.light};
  --font-weight-normal: ${t.typography.fontWeight.normal};
  --font-weight-medium: ${t.typography.fontWeight.medium};
  --font-weight-semibold: ${t.typography.fontWeight.semibold};
  --font-weight-bold: ${t.typography.fontWeight.bold};

  /* Line Height */
  --line-height-tight: ${t.typography.lineHeight.tight};
  --line-height-normal: ${t.typography.lineHeight.normal};
  --line-height-relaxed: ${t.typography.lineHeight.relaxed};

  /* Letter Spacing */
  --letter-spacing-tight: ${t.typography.letterSpacing.tight};
  --letter-spacing-normal: ${t.typography.letterSpacing.normal};
  --letter-spacing-wide: ${t.typography.letterSpacing.wide};

  /* ===== 간격 시스템 (7 variables) ===== */
  --spacing-xs: ${t.spacing.xs};
  --spacing-sm: ${t.spacing.sm};
  --spacing-md: ${t.spacing.md};
  --spacing-lg: ${t.spacing.lg};
  --spacing-xl: ${t.spacing.xl};
  --spacing-2xl: ${t.spacing['2xl']};
  --spacing-3xl: ${t.spacing['3xl']};

  /* ===== 모서리 반경 (7 variables) ===== */
  --radius-none: ${t.radius.none};
  --radius-sm: ${t.radius.sm};
  --radius-md: ${t.radius.md};
  --radius-lg: ${t.radius.lg};
  --radius-xl: ${t.radius.xl};
  --radius-2xl: ${t.radius['2xl']};
  --radius-full: ${t.radius.full};

  /* ===== 그림자 (7 variables) ===== */
  --shadow-none: ${t.shadows.none};
  --shadow-sm: ${t.shadows.sm};
  --shadow-md: ${t.shadows.md};
  --shadow-lg: ${t.shadows.lg};
  --shadow-xl: ${t.shadows.xl};
  --shadow-2xl: ${t.shadows['2xl']};
  --shadow-inner: ${t.shadows.inner};

  /* ===== 컴포넌트 기본값 (9 variables) ===== */
  --button-radius: ${t.radius[t.components.button.radius]};
  --button-shadow: ${t.shadows[t.components.button.shadow]};
  --button-font-size: ${t.typography.fontSize[t.components.button.fontSize]};

  --card-radius: ${t.radius[t.components.card.radius]};
  --card-shadow: ${t.shadows[t.components.card.shadow]};
  --card-padding: ${t.spacing[t.components.card.padding]};

  --input-radius: ${t.radius[t.components.input.radius]};
  --input-border-width: ${t.components.input.borderWidth};
  --input-font-size: ${t.typography.fontSize[t.components.input.fontSize]};

  /* ===== 하위 호환성 (기존 변수명 유지) ===== */
  --color-text-primary: ${t.colors.text};
  --color-background-light: ${t.colors.surface};
  --font-family-base: ${t.typography.fontFamily.primary};
}
    `.trim();
  }
}
