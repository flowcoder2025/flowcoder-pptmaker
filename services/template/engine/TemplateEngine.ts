/**
 * 템플릿 엔진
 *
 * 템플릿 기반 HTML 생성 엔진
 * 비용: Gemini HTML API 호출 0회 → 100% 절감
 */

import { TemplateRegistry } from './TemplateRegistry';
import { TossDefaultTemplate } from '../base/toss-default/TossDefaultTemplate';
import type { SlideTemplate, TemplateContext } from './types';
import type { Slide, HTMLSlide, UnifiedPPTJSON } from '@/types/slide';
import type { AspectRatio } from '@/types/presentation';
import { STYLE_THEMES } from '@/constants/themes';
import {
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
  isFeatureGridSlide,
  isTeamProfileSlide,
  isProcessSlide,
  isRoadmapSlide,
  isPricingSlide,
  isImageTextSlide,
  isAgendaSlide,
  isTestimonialSlide,
  isGallerySlide,
  isImageSlide,
  isReportTwoColumnSlide,
  isReportA4Slide,
} from './types';

/**
 * TemplateEngine 클래스
 *
 * 템플릿을 사용하여 슬라이드를 HTML로 변환하는 엔진
 */
export class TemplateEngine {
  /**
   * 템플릿 레지스트리
   */
  private registry: TemplateRegistry;

  /**
   * 생성자
   */
  constructor() {
    this.registry = new TemplateRegistry();
    this.registerBuiltInTemplates();
  }

  /**
   * 단일 슬라이드 생성
   *
   * @param slide - 변환할 슬라이드
   * @param templateId - 사용할 템플릿 ID
   * @param aspectRatio - 화면 비율 (선택)
   * @returns HTML 슬라이드
   * @throws {Error} - 템플릿을 찾을 수 없을 경우
   * @throws {Error} - 지원하지 않는 슬라이드 타입일 경우
   */
  generateSlide(slide: Slide, templateId: string, aspectRatio?: AspectRatio): HTMLSlide {
    // 템플릿 조회
    const template = this.registry.get(templateId);

    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${templateId}`);
    }

    // AspectRatio 적용
    let effectiveTemplate = template;
    if (aspectRatio && aspectRatio !== '16:9' && 'withAspectRatio' in template) {
      effectiveTemplate = (template as any).withAspectRatio(aspectRatio);
      console.log(`📐 [generateSlide] AspectRatio 적용: ${aspectRatio}`);
    }

    // 슬라이드 렌더링
    return this.renderSlide(slide, effectiveTemplate);
  }

  /**
   * 전체 프리젠테이션 생성
   *
   * @param slideData - UnifiedPPTJSON 데이터
   * @param templateId - 사용할 템플릿 ID
   * @returns HTML 슬라이드 배열
   * @throws {Error} - 템플릿을 찾을 수 없을 경우
   * @throws {Error} - 지원하지 않는 슬라이드 타입이 있을 경우
   */
  generateAll(slideData: UnifiedPPTJSON, templateId: string): HTMLSlide[] {
    // 템플릿 조회
    let template = this.registry.get(templateId);

    if (!template) {
      throw new Error(`템플릿을 찾을 수 없습니다: ${templateId}`);
    }

    // AspectRatio 적용 (UnifiedPPTJSON에서 읽기)
    const aspectRatio = slideData.aspectRatio || '16:9';
    let effectiveTemplate = template; // Non-null template을 보장

    if (aspectRatio !== '16:9' && 'withAspectRatio' in template) {
      // TossDefaultTemplate인 경우 AspectRatio를 적용한 새 인스턴스 생성
      effectiveTemplate = (template as any).withAspectRatio(aspectRatio);
      console.log(`📐 AspectRatio 적용: ${aspectRatio}`);
    }

    // 모든 슬라이드 렌더링
    const startTime = performance.now();

    const htmlSlides = slideData.slides.map((slide, index) => {
      try {
        return this.renderSlide(slide, effectiveTemplate);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
        throw new Error(`슬라이드 ${index + 1} 렌더링 실패: ${errorMessage}`);
      }
    });

    const endTime = performance.now();
    const duration = Math.round(endTime - startTime);

    console.log(`✅ ${slideData.slides.length}개 슬라이드 생성 완료 (${duration}ms, ${aspectRatio})`);

    return htmlSlides;
  }

  /**
   * 슬라이드 렌더링 (타입별 분기)
   *
   * @param slide - 렌더링할 슬라이드
   * @param template - 사용할 템플릿
   * @returns HTML 슬라이드
   * @throws {Error} - 지원하지 않는 슬라이드 타입일 경우
   */
  private renderSlide(slide: Slide, template: SlideTemplate): HTMLSlide {
    // 타입 가드를 사용하여 슬라이드 타입 확인 및 렌더링
    if (isTitleSlide(slide)) {
      return template.renderTitle(slide);
    }

    if (isSectionSlide(slide)) {
      return template.renderSection(slide);
    }

    if (isContentSlide(slide)) {
      return template.renderContent(slide);
    }

    if (isBulletSlide(slide)) {
      return template.renderBullet(slide);
    }

    if (isTwoColumnSlide(slide)) {
      return template.renderTwoColumn(slide);
    }

    if (isThankYouSlide(slide)) {
      return template.renderThankYou(slide);
    }

    if (isChartSlide(slide)) {
      return template.renderChart(slide);
    }

    if (isTableSlide(slide)) {
      return template.renderTable(slide);
    }

    if (isStatsSlide(slide)) {
      return template.renderStats(slide);
    }

    if (isQuoteSlide(slide)) {
      return template.renderQuote(slide);
    }

    if (isComparisonSlide(slide)) {
      return template.renderComparison(slide);
    }

    if (isTimelineSlide(slide)) {
      return template.renderTimeline(slide);
    }

    if (isFeatureGridSlide(slide)) {
      return template.renderFeatureGrid(slide);
    }

    if (isTeamProfileSlide(slide)) {
      return template.renderTeamProfile(slide);
    }

    if (isProcessSlide(slide)) {
      return template.renderProcess(slide);
    }

    if (isRoadmapSlide(slide)) {
      return template.renderRoadmap(slide);
    }

    if (isPricingSlide(slide)) {
      return template.renderPricing(slide);
    }

    if (isImageTextSlide(slide)) {
      return template.renderImageText(slide);
    }

    if (isAgendaSlide(slide)) {
      return template.renderAgenda(slide);
    }

    if (isTestimonialSlide(slide)) {
      return template.renderTestimonial(slide);
    }

    if (isGallerySlide(slide)) {
      return template.renderGallery(slide);
    }

    if (isImageSlide(slide)) {
      return template.renderImage(slide);
    }

    if (isReportTwoColumnSlide(slide)) {
      return template.renderReportTwoColumn(slide);
    }

    if (isReportA4Slide(slide)) {
      return template.renderReportA4(slide);
    }

    // 지원하지 않는 타입
    throw new Error(`지원하지 않는 슬라이드 타입입니다: ${(slide as any).type}`);
  }

  /**
   * 기본 템플릿 등록
   *
   * TossDefaultTemplate을 자동으로 등록
   * 모든 STYLE_THEMES에 대한 템플릿도 등록 (Typography, Radius, Shadows 포함)
   */
  private registerBuiltInTemplates(): void {
    // 기본 템플릿 등록 (하위 호환성)
    this.registry.register(new TossDefaultTemplate());

    // 각 스타일 테마에 대한 템플릿 등록
    STYLE_THEMES.forEach((theme) => {
      // StyleTheme을 직접 전달하여 모든 디자인 토큰 활용
      const template = new TossDefaultTemplate(theme);

      // 템플릿 ID와 이름을 테마에 맞게 오버라이드
      template.id = theme.id; // ✅ UI theme ID 사용 (vercel, twitter 등)
      template.name = theme.name;
      template.description = theme.description;

      this.registry.register(template);
      console.log(`✅ 템플릿 등록 완료: ${theme.id} (${theme.name} - ${theme.tone})`);
    });
  }

  /**
   * 레지스트리 접근 (외부에서 템플릿 등록 가능)
   *
   * @returns TemplateRegistry 인스턴스
   */
  getRegistry(): TemplateRegistry {
    return this.registry;
  }

  /**
   * 템플릿 목록 조회
   *
   * @returns 모든 템플릿 배열
   */
  getAvailableTemplates(): SlideTemplate[] {
    return this.registry.getAll();
  }

  /**
   * 무료 템플릿 목록 조회
   *
   * @returns 무료 템플릿 배열
   */
  getFreeTemplates(): SlideTemplate[] {
    return this.registry.getFree();
  }

  /**
   * 프리미엄 템플릿 목록 조회
   *
   * @returns 프리미엄 템플릿 배열
   */
  getPremiumTemplates(): SlideTemplate[] {
    return this.registry.getPremium();
  }

  /**
   * 템플릿 존재 여부 확인
   *
   * @param templateId - 확인할 템플릿 ID
   * @returns 존재 여부
   */
  hasTemplate(templateId: string): boolean {
    return this.registry.has(templateId);
  }

  /**
   * 엔진 정보 출력 (디버깅용)
   */
  printInfo(): void {
    console.log('\n🎨 템플릿 엔진 정보');
    this.registry.printInfo();
  }
}
