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
import { DEFAULT_TEMPLATE_CONTEXT } from '../../engine/types';
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
  AgendaSlide,
  TestimonialSlide,
  GallerySlide,
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
   * 생성자
   * @param customContext - 커스텀 템플릿 컨텍스트 (색상 오버라이드 등)
   */
  constructor(customContext?: Partial<TemplateContext>) {
    this.ctx = customContext
      ? {
          ...DEFAULT_TEMPLATE_CONTEXT,
          colors: {
            ...DEFAULT_TEMPLATE_CONTEXT.colors,
            ...(customContext.colors || {}),
          },
          fonts: {
            ...DEFAULT_TEMPLATE_CONTEXT.fonts,
            ...(customContext.fonts || {}),
          },
          spacing: {
            ...DEFAULT_TEMPLATE_CONTEXT.spacing,
            ...(customContext.spacing || {}),
          },
          borderRadius: {
            ...DEFAULT_TEMPLATE_CONTEXT.borderRadius,
            ...(customContext.borderRadius || {}),
          },
          slideSize: {
            ...DEFAULT_TEMPLATE_CONTEXT.slideSize,
            ...(customContext.slideSize || {}),
          },
        }
      : DEFAULT_TEMPLATE_CONTEXT;
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
      font-size: ${this.ctx.fonts.size.body}px;
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

    const bulletItems = bullets
      .map((bullet) => {
        const indent = bullet.level * 30; // level 0: 0px, level 1: 30px, level 2: 60px
        const fontSize = bullet.level === 0 ? 18 : bullet.level === 1 ? 16 : 14;

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
          ">→</span>
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
  <div style="flex: 1; display: flex; align-items: center;">
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
    const parseColumnContent = (content: string) => {
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
    const createBulletList = (items: string[]) => {
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
            ">→</span>
            <span style="
              color: var(--color-text-secondary);
              font-size: 16px;
              line-height: 1.5;
            ">${this.escapeHtml(item)}</span>
          </li>
        `).join('');
    };

    const leftBulletList = createBulletList(leftParsed.bulletItems);
    const rightBulletList = createBulletList(rightParsed.bulletItems);

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
    const { title, data } = slide.props;

    // 첫 번째 데이터 시리즈만 사용 (단순화)
    const series = data[0];
    const dataPoints = series.labels.map((label, index) => ({
      label,
      value: series.values[index],
    }));

    // 값 정규화: 0-100 범위로 변환
    const numericValues = dataPoints.map(point => parseFloat(String(point.value)));
    const maxValue = Math.max(...numericValues);
    const minValue = Math.min(...numericValues);

    // 이미 0-100 범위인지 확인 (퍼센트 데이터)
    const isPercentageData = maxValue <= 100 && minValue >= 0 && maxValue > 1;

    // 정규화된 데이터 포인트 생성
    const normalizedPoints = dataPoints.map((point, index) => {
      const numericValue = numericValues[index];
      let widthPercentage: number;

      if (isPercentageData) {
        // 이미 퍼센트 범위 데이터면 그대로 사용
        widthPercentage = numericValue;
      } else if (maxValue === 0) {
        // 모든 값이 0이면 0으로 표시
        widthPercentage = 0;
      } else {
        // 최대값을 100%로 정규화 (0.3초 → 25%, 1.2초 → 100% 등)
        widthPercentage = (numericValue / maxValue) * 100;
      }

      return {
        ...point,
        widthPercentage: Math.round(widthPercentage * 10) / 10, // 소수점 1자리
      };
    });

    const chartBars = normalizedPoints
      .map((point) => {
        return `
        <div>
          <div style="
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          ">
            <span style="color: var(--color-text-primary); font-family: var(--font-family-base); font-size: 16px; font-weight: 500;">
              ${this.escapeHtml(point.label)}
            </span>
            <span style="color: var(--color-primary); font-family: var(--font-family-base); font-size: 16px; font-weight: bold;">
              ${point.value}
            </span>
          </div>
          <div style="
            width: 100%;
            height: 24px;
            background-color: ${this.ctx.colors.bg};
            border-radius: 4px;
            overflow: hidden;
          ">
            <div style="
              height: 100%;
              width: ${point.widthPercentage}%;
              background-color: var(--color-primary);
              border-radius: 4px;
              transition: width 0.5s ease-in-out;
            "></div>
          </div>
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

  <!-- Bar Chart -->
  <div style="flex: 1; display: flex; align-items: center;">
    <div style="width: 100%; display: flex; flex-direction: column; gap: ${this.ctx.spacing.chartGap}px;">
      ${chartBars}
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

    const headerCells = headers
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

    const bodyRows = rows
      .map((row, index) => {
        const cells = row
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
  <div style="flex: 1; display: flex; align-items: center;">
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

    const statCards = stats
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
    const { title, leftLabel, rightLabel, leftContent, rightContent } = slide.props;

    // leftContent와 rightContent를 배열로 분리 (줄바꿈 기준)
    const leftItems = leftContent ? leftContent.split('\n').filter((item) => item.trim()) : [];
    const rightItems = rightContent ? rightContent.split('\n').filter((item) => item.trim()) : [];

    const leftList = leftItems
      .map(
        (item) => `
          <li style="
            margin-bottom: 12px;
            padding-left: 0;
          ">• ${this.escapeHtml(item)}</li>
        `
      )
      .join('');

    const rightList = rightItems
      .map(
        (item) => `
          <li style="
            margin-bottom: 12px;
            padding-left: 0;
          ">• ${this.escapeHtml(item)}</li>
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
      <ul style="
        list-style: none;
        padding: 0;
        margin: 0;
        font-family: var(--font-family-base);
        font-size: 16px;
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
      <ul style="
        list-style: none;
        padding: 0;
        margin: 0;
        font-family: var(--font-family-base);
        font-size: 16px;
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

    const timelineItems = items
      .map((item, index) => {
        const isLast = index === items.length - 1;

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
  <div style="flex: 1; display: flex; align-items: flex-start; padding-top: 70px;">
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

    // 기능 카드 생성 (최대 3개)
    const featureCards = features
      .slice(0, 3)
      .map(
        (feature) => `
      <div style="min-height: 280px; background: ${this.ctx.colors.lightBg}; padding: 30px 25px; border-radius: ${this.ctx.borderRadius.medium}px; text-align: center; border-top: 4px solid ${this.ctx.colors.primary}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column; align-items: center;">
        <div style="font-size: 44px; line-height: 1; margin-bottom: 20px; color: ${this.ctx.colors.primary};">${this.escapeHtml(feature.icon)}</div>
        <h4 style="font-size: ${this.ctx.fonts.size.subtitle}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 12px 0; height: 2.4em; line-height: 1.2;">${this.escapeHtml(feature.title)}</h4>
        <p style="font-size: 15px; color: ${this.ctx.colors.textSecondary}; line-height: 1.6; margin: 0;">${this.escapeHtml(feature.description)}</p>
      </div>
    `
      )
      .join('');

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

    // 프로필 개수에 따른 그리드 컬럼 계산
    const profileCount = profiles.length;
    const columns =
      profileCount <= 3 ? profileCount : profileCount <= 6 ? 3 : 4;

    // 프로필 카드 생성 (제한 없음)
    const profileCards = profiles
      .map(
        (profile) => `
      <div style="min-height: 340px; text-align: center; display: flex; flex-direction: column; align-items: center;">
        <img src="${this.escapeHtml(profile.image || `https://placehold.co/140x140/${this.ctx.colors.primary.replace('#', '')}/FFFFFF?text=P&font=sans-serif`)}" alt="${this.escapeHtml(profile.name)}" style="width: 140px; height: 140px; border-radius: ${this.ctx.borderRadius.circle}; object-fit: cover; margin-bottom: 20px; border: 4px solid ${this.ctx.colors.lightBg}; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <h4 style="font-size: ${this.ctx.fonts.size.subtitle}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 5px 0;">${this.escapeHtml(profile.name)}</h4>
        <p style="font-size: 16px; color: ${this.ctx.colors.primary}; font-weight: 500; margin: 0 0 12px 0;">${this.escapeHtml(profile.role)}</p>
        <p style="font-size: 14px; color: ${this.ctx.colors.textSecondary}; line-height: 1.5; margin: 0; max-width: 250px;">${this.escapeHtml(profile.bio)}</p>
      </div>
    `
      )
      .join('');

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
  <div style="margin-bottom: ${this.ctx.spacing.gapSmall}px;">
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Profiles Grid (유동적 컬럼) -->
  <div style="
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow-y: auto;
  ">
    <div style="
      display: grid;
      grid-template-columns: repeat(${columns}, 1fr);
      gap: ${this.ctx.spacing.gap}px;
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

    // 프로세스 스텝 생성 (최대 3개)
    const processSteps = steps
      .slice(0, 3)
      .map((step, index) => {
        const isLast = index === steps.slice(0, 3).length - 1;
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
  background: ${this.ctx.colors.white};
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

    // 로드맵 아이템 생성 (최대 3개)
    const roadmapItems = items
      .slice(0, 3)
      .map((item, index) => {
        const isLast = index === items.slice(0, 3).length - 1;
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
  background: ${this.ctx.colors.white};
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
  <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow-y: auto; padding: ${this.ctx.spacing.gap}px; padding-top: 0;">
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

    // 가격표 티어 생성 (최대 3개)
    const pricingTiers = tiers
      .slice(0, 3)
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

        const featureList = tier.features
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
      <div style="flex: 1; min-height: 420px; border-radius: ${this.ctx.borderRadius.large}px; border: 2px solid ${borderColor}; background: ${this.ctx.colors.white}; box-shadow: 0 4px 12px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
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
  background: ${this.ctx.colors.white};
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

    // 불릿 리스트 생성
    const bulletList = bullets
      .map(
        (bullet) => `
      <li style="display: flex; align-items: flex-start; margin-bottom: 12px;">
        <span style="color: ${this.ctx.colors.primary}; margin-right: 12px; font-size: ${this.ctx.spacing.iconSize}px; line-height: 1.4;">→</span>
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
  background: ${this.ctx.colors.white};
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
      <img src="${this.escapeHtml(image)}" alt="${this.escapeHtml(title)}" style="width: 100%; height: 100%; object-fit: contain; border-radius: ${this.ctx.borderRadius.medium}px; background: ${this.ctx.colors.lightBg};">
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

    // 아젠다 아이템 생성 (최대 3개)
    const agendaItems = items
      .slice(0, 3)
      .map((item, index) => {
        const isLast = index === items.slice(0, 3).length - 1;
        const number = String(index + 1).padStart(2, '0');

        return `
      <div style="display: flex; align-items: flex-start; width: 100%; padding-bottom: ${this.ctx.spacing.gap}px; margin-bottom: ${this.ctx.spacing.gap}px; border-bottom: ${isLast ? 'none' : `1px solid ${this.ctx.colors.border}`};">
        <div style="flex: 0 0 80px; font-size: 28px; font-weight: 700; color: ${this.ctx.colors.primary}; line-height: 1.2;">${number}</div>
        <div style="flex: 1;">
          <h4 style="font-size: ${this.ctx.fonts.size.subtitle}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0 0 8px 0; line-height: 1.2;">${this.escapeHtml(item.title)}</h4>
          <p style="font-size: 16px; color: ${this.ctx.colors.textSecondary}; line-height: 1.6; margin: 0;">${this.escapeHtml(item.description)}</p>
        </div>
      </div>
    `;
      })
      .join('');

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
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- Agenda List -->
  <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
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
  background: ${this.ctx.colors.white};
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
   * 2x2 그리드 이미지 갤러리
   */
  renderGallery(slide: GallerySlide): HTMLSlide {
    const { title, images } = slide.props;

    // 이미지 카드 생성 (최대 4개 - 2x2 그리드)
    const imageCards = images
      .slice(0, 4)
      .map(
        (img) => `
      <div style="font-family: ${this.ctx.fonts.main}; display: flex; flex-direction: column; min-height: 0;">
        <img src="${this.escapeHtml(img.url)}" alt="${this.escapeHtml(img.caption)}" style="
          width: 100%;
          flex: 1;
          min-height: 0;
          object-fit: cover;
          border-radius: ${this.ctx.borderRadius.medium}px;
          margin-bottom: 12px;
          background: ${this.ctx.colors.lightBg};
        ">
        <p style="font-size: ${this.ctx.fonts.size.caption}px; color: ${this.ctx.colors.textSecondary}; text-align: center; margin: 0;">${this.escapeHtml(img.caption)}</p>
      </div>
    `
      )
      .join('');

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
    <div style="width: ${this.ctx.spacing.accentBar.width}px; height: ${this.ctx.spacing.accentBar.height}px; background: ${this.ctx.colors.primary}; margin-bottom: 12px;"></div>
    <h2 style="font-size: ${this.ctx.fonts.size.heading}px; font-weight: 700; color: ${this.ctx.colors.text}; margin: 0;">${this.escapeHtml(title)}</h2>
  </div>

  <!-- 2x2 Gallery Grid -->
  <div style="
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  ">
    <div style="
      width: 100%;
      max-width: 900px;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: repeat(2, minmax(0, 1fr));
      gap: ${this.ctx.spacing.gap}px;
      min-height: 0;
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
   * HTML 이스케이프 헬퍼 함수
   *
   * XSS 방지를 위한 HTML 특수문자 이스케이프
   */
  private escapeHtml(text: string): string {
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
   * TDS 디자인 토큰을 CSS 변수로 변환하여 일관성 있는 스타일링 제공
   */
  private generateCSSVariables(): string {
    return `
:root {
  /* TDS Color System - 일관성을 위해 CSS 변수로 유지 */
  --color-primary: ${this.ctx.colors.primary};
  --color-text-primary: ${this.ctx.colors.text};
  --color-text-secondary: ${this.ctx.colors.textSecondary};
  --color-text-tertiary: #6b7280;
  --color-background: ${this.ctx.colors.white};
  --color-background-light: ${this.ctx.colors.lightBg};
  --color-background-card: #f9fafb;
  --color-border: ${this.ctx.colors.border};
  --color-accent: ${this.ctx.colors.primary};

  /* Font Family - 일관성을 위해 CSS 변수로 유지 */
  --font-family-base: ${this.ctx.fonts.main};
}
    `.trim();
  }
}
